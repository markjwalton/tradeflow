import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useValidatedForm } from "@/components/forms/useValidatedForm";
import { ValidatedInput } from "@/components/forms/ValidatedInput";
import { ValidatedTextarea } from "@/components/forms/ValidatedTextarea";
import { ValidationSchemas } from "@/components/forms/FormValidation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Pencil, Trash2, Loader2, Copy, FileText, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { PullToRefresh } from "@/components/common/PullToRefresh";
import { PageHeader } from "@/components/sturij";
import { PageLoader, ButtonLoader, CardGridLoader } from "@/components/common/LoadingStates";
import { QueryErrorState } from "@/components/common/QueryErrorState";
import { useMutationError } from "@/components/common/MutationErrorToast";
import { useDebounce } from "@/components/common/useDebounce";

const statusColors = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-info-50 text-info",
  approved: "bg-success-50 text-success",
  rejected: "bg-destructive-50 text-destructive",
};

const estimateSchema = z.object({
  title: ValidationSchemas.required,
  notes: ValidationSchemas.optionalString,
});

export default function Estimates() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [filterStatus, setFilterStatus] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingEstimate, setEditingEstimate] = useState(null);
  const [expandedStatuses, setExpandedStatuses] = useState({});
  
  const form = useValidatedForm(estimateSchema, {
    defaultValues: {
      title: "",
      notes: "",
    }
  });
  
  const [formData, setFormData] = useState({
    project_id: "",
    customer_id: "",
    line_items: [{ description: "", quantity: 1, unit: "unit", unit_cost: 0, subtotal: 0 }],
    subtotal: 0,
    vat_rate: 20,
    vat_amount: 0,
    total: 0,
    status: "draft",
  });

  const { data: estimates = [], isLoading, error, refetch } = useQuery({
    queryKey: ["estimates"],
    queryFn: () => base44.entities.Estimate.list(),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: () => base44.entities.Project.list(),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: () => base44.entities.Customer.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Estimate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["estimates"] });
      setShowForm(false);
      resetForm();
      form.reset();
      toast.success("Estimate created successfully");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Estimate.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["estimates"] });
      setShowForm(false);
      setEditingEstimate(null);
      resetForm();
      form.reset();
      toast.success("Estimate updated successfully");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Estimate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["estimates"] });
      toast.success("Estimate deleted successfully");
    },
  });

  useMutationError(createMutation, { customMessage: "Failed to create estimate" });
  useMutationError(updateMutation, { customMessage: "Failed to update estimate" });
  useMutationError(deleteMutation, { customMessage: "Failed to delete estimate" });

  const resetForm = () => {
    form.reset();
    setFormData({
      project_id: "",
      customer_id: "",
      line_items: [{ description: "", quantity: 1, unit: "unit", unit_cost: 0, subtotal: 0 }],
      subtotal: 0,
      vat_rate: 20,
      vat_amount: 0,
      total: 0,
      status: "draft",
    });
  };

  const handleEdit = (estimate) => {
    setEditingEstimate(estimate);
    form.reset({
      title: estimate.title || "",
      notes: estimate.notes || "",
    });
    setFormData({
      project_id: estimate.project_id || "",
      customer_id: estimate.customer_id || "",
      line_items: estimate.line_items?.length > 0 ? estimate.line_items : [{ description: "", quantity: 1, unit: "unit", unit_cost: 0, subtotal: 0 }],
      subtotal: estimate.subtotal || 0,
      vat_rate: estimate.vat_rate || 20,
      vat_amount: estimate.vat_amount || 0,
      total: estimate.total || 0,
      status: estimate.status || "draft",
    });
    setShowForm(true);
  };

  const handleDuplicate = (estimate) => {
    setEditingEstimate(null);
    form.reset({
      title: `${estimate.title} (Copy)`,
      notes: estimate.notes || "",
    });
    setFormData({
      project_id: estimate.project_id || "",
      customer_id: estimate.customer_id || "",
      line_items: estimate.line_items?.length > 0 ? [...estimate.line_items] : [{ description: "", quantity: 1, unit: "unit", unit_cost: 0, subtotal: 0 }],
      subtotal: estimate.subtotal || 0,
      vat_rate: estimate.vat_rate || 20,
      vat_amount: estimate.vat_amount || 0,
      total: estimate.total || 0,
      status: "draft",
    });
    setShowForm(true);
  };

  const onSubmit = (validatedData) => {
    const data = { ...validatedData, ...formData };
    if (editingEstimate) {
      updateMutation.mutate({ id: editingEstimate.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const updateLineItem = (index, field, value) => {
    const newItems = [...formData.line_items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === "quantity" || field === "unit_cost") {
      newItems[index].subtotal = (newItems[index].quantity || 0) * (newItems[index].unit_cost || 0);
    }
    setFormData({ ...formData, line_items: newItems });
  };

  const addLineItem = () => {
    setFormData({
      ...formData,
      line_items: [...formData.line_items, { description: "", quantity: 1, unit: "unit", unit_cost: 0, subtotal: 0 }],
    });
  };

  const removeLineItem = (index) => {
    if (formData.line_items.length > 1) {
      setFormData({
        ...formData,
        line_items: formData.line_items.filter((_, i) => i !== index),
      });
    }
  };

  useEffect(() => {
    const subtotal = formData.line_items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    const vat_amount = subtotal * (formData.vat_rate / 100);
    const total = subtotal + vat_amount;
    setFormData((prev) => ({ ...prev, subtotal, vat_amount, total }));
  }, [formData.line_items, formData.vat_rate]);

  const filteredEstimates = estimates.filter((e) => {
    const matchesSearch = e.title?.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesStatus = filterStatus === "all" || e.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Group estimates by status
  const groupedEstimates = filteredEstimates.reduce((acc, estimate) => {
    const status = estimate.status || "draft";
    if (!acc[status]) acc[status] = [];
    acc[status].push(estimate);
    return acc;
  }, {});

  // Initialize collapsed state
  React.useEffect(() => {
    const initial = {};
    Object.keys(groupedEstimates).forEach(status => {
      if (expandedStatuses[status] === undefined) {
        initial[status] = true;
      }
    });
    if (Object.keys(initial).length > 0) {
      setExpandedStatuses(prev => ({ ...prev, ...initial }));
    }
  }, [JSON.stringify(Object.keys(groupedEstimates))]);

  const getProjectName = (projectId) => projects.find((p) => p.id === projectId)?.name || "";

  if (isLoading) {
    return <PageLoader message="Loading estimates..." />;
  }

  if (error) {
    return <QueryErrorState error={error} onRetry={refetch} />;
  }

  return (
    <PullToRefresh onRefresh={refetch} enabled={true}>
    <div className="max-w-7xl mx-auto -mt-6 min-h-screen">
      <PageHeader 
        title="Estimates"
        description="Create and manage project estimates"
      />

      <Card className="border-border mb-4">
        <CardContent className="px-2 py-1">
          <div className="flex gap-2">
            <Button 
              variant="ghost"
              className="hover:bg-[#e9efeb] hover:text-[#273e2d]"
              onClick={() => { resetForm(); setEditingEstimate(null); setShowForm(true); }}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Estimate
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4 sm:mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search estimates..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border">
        <CardContent className="p-4">
          <div className="space-y-4">
            {Object.entries(groupedEstimates).map(([status, statusEstimates]) => {
              const isExpanded = expandedStatuses[status] !== false;
              return (
                <Collapsible
                  key={status}
                  open={isExpanded}
                  onOpenChange={() => setExpandedStatuses(prev => ({ ...prev, [status]: !isExpanded }))}
                >
                  <Card className="border-border">
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="py-3">
                        <div className="flex items-center gap-2">
                          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          <Badge className={statusColors[status]}>{status}</Badge>
                          <span className="text-muted-foreground text-sm font-normal">({statusEstimates.length})</span>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0 space-y-2">
                        {statusEstimates.map((estimate) => (
                          <Card key={estimate.id} className="border-border hover:shadow-sm transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-4">
                                <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-medium text-base">{estimate.title}</h3>
                                  </div>
                                  {estimate.project_id && (
                                    <p className="text-sm text-muted-foreground mb-2">Project: {getProjectName(estimate.project_id)}</p>
                                  )}
                                  <div className="flex items-center gap-4 text-sm">
                                    <span>Subtotal: <span className="font-medium">£{estimate.subtotal?.toLocaleString()}</span></span>
                                    <span>VAT ({estimate.vat_rate}%): <span className="font-medium">£{estimate.vat_amount?.toLocaleString()}</span></span>
                                    <span className="text-base font-semibold">Total: £{estimate.total?.toLocaleString()}</span>
                                  </div>
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                  <Button variant="ghost" size="icon" className="touch-target-sm" onClick={() => handleDuplicate(estimate)}>
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="touch-target-sm" onClick={() => handleEdit(estimate)}>
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="touch-target-sm text-destructive" 
                                    onClick={() => deleteMutation.mutate(estimate.id)}
                                    disabled={deleteMutation.isPending}
                                  >
                                    {deleteMutation.isPending ? <ButtonLoader /> : <Trash2 className="h-4 w-4" />}
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })}
          </div>

          {filteredEstimates.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">No estimates found. Create your first estimate to get started.</div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEstimate ? "Edit Estimate" : "New Estimate"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ValidatedInput
              label="Title"
              required
              error={form.getError("title")}
              {...form.register("title")}
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Project</label>
                <Select value={formData.project_id} onValueChange={(v) => setFormData({ ...formData, project_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select project..." /></SelectTrigger>
                  <SelectContent>{projects.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Customer</label>
                <Select value={formData.customer_id} onValueChange={(v) => setFormData({ ...formData, customer_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select customer..." /></SelectTrigger>
                  <SelectContent>{customers.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Line Items</label>
              <div className="space-y-2 mt-2">
                {formData.line_items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-4"><Input placeholder="Description" value={item.description} onChange={(e) => updateLineItem(index, "description", e.target.value)} /></div>
                    <div className="col-span-2"><Input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => updateLineItem(index, "quantity", parseFloat(e.target.value) || 0)} /></div>
                    <div className="col-span-2"><Input placeholder="Unit" value={item.unit} onChange={(e) => updateLineItem(index, "unit", e.target.value)} /></div>
                    <div className="col-span-2"><Input type="number" placeholder="Unit Cost" value={item.unit_cost} onChange={(e) => updateLineItem(index, "unit_cost", parseFloat(e.target.value) || 0)} /></div>
                    <div className="col-span-1 text-right font-medium">£{item.subtotal?.toFixed(2)}</div>
                    <div className="col-span-1"><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeLineItem(index)}><Trash2 className="h-4 w-4" /></Button></div>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addLineItem}><Plus className="h-4 w-4 mr-1" />Add Line</Button>
              </div>
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between"><span>Subtotal</span><span className="font-medium">£{formData.subtotal?.toFixed(2)}</span></div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2"><span>VAT</span><Input type="number" className="w-20" value={formData.vat_rate} onChange={(e) => setFormData({ ...formData, vat_rate: parseFloat(e.target.value) || 0 })} /><span>%</span></div>
                <span className="font-medium">£{formData.vat_amount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold"><span>Total</span><span>£{formData.total?.toFixed(2)}</span></div>
            </div>

            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <ValidatedTextarea
              label="Notes"
              rows={3}
              error={form.getError("notes")}
              {...form.register("notes")}
            />
            <Button className="w-full" type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) && <ButtonLoader />}
              {editingEstimate ? "Update Estimate" : "Create Estimate"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
    </PullToRefresh>
  );
}