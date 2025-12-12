import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Plus, Search, Pencil, Trash2, Loader2, Copy, FileText } from "lucide-react";
import { toast } from "sonner";
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

export default function Estimates() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [filterStatus, setFilterStatus] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingEstimate, setEditingEstimate] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    project_id: "",
    customer_id: "",
    line_items: [{ description: "", quantity: 1, unit: "unit", unit_cost: 0, subtotal: 0 }],
    subtotal: 0,
    vat_rate: 20,
    vat_amount: 0,
    total: 0,
    status: "draft",
    notes: "",
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
    setFormData({
      title: "",
      project_id: "",
      customer_id: "",
      line_items: [{ description: "", quantity: 1, unit: "unit", unit_cost: 0, subtotal: 0 }],
      subtotal: 0,
      vat_rate: 20,
      vat_amount: 0,
      total: 0,
      status: "draft",
      notes: "",
    });
  };

  const handleEdit = (estimate) => {
    setEditingEstimate(estimate);
    setFormData({
      title: estimate.title || "",
      project_id: estimate.project_id || "",
      customer_id: estimate.customer_id || "",
      line_items: estimate.line_items?.length > 0 ? estimate.line_items : [{ description: "", quantity: 1, unit: "unit", unit_cost: 0, subtotal: 0 }],
      subtotal: estimate.subtotal || 0,
      vat_rate: estimate.vat_rate || 20,
      vat_amount: estimate.vat_amount || 0,
      total: estimate.total || 0,
      status: estimate.status || "draft",
      notes: estimate.notes || "",
    });
    setShowForm(true);
  };

  const handleDuplicate = (estimate) => {
    setEditingEstimate(null);
    setFormData({
      title: `${estimate.title} (Copy)`,
      project_id: estimate.project_id || "",
      customer_id: estimate.customer_id || "",
      line_items: estimate.line_items?.length > 0 ? [...estimate.line_items] : [{ description: "", quantity: 1, unit: "unit", unit_cost: 0, subtotal: 0 }],
      subtotal: estimate.subtotal || 0,
      vat_rate: estimate.vat_rate || 20,
      vat_amount: estimate.vat_amount || 0,
      total: estimate.total || 0,
      status: "draft",
      notes: estimate.notes || "",
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (editingEstimate) {
      updateMutation.mutate({ id: editingEstimate.id, data: formData });
    } else {
      createMutation.mutate(formData);
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

  const getProjectName = (projectId) => projects.find((p) => p.id === projectId)?.name || "";

  if (isLoading) {
    return <PageLoader message="Loading estimates..." />;
  }

  if (error) {
    return <QueryErrorState error={error} onRetry={refetch} />;
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-background min-h-screen">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-light font-display text-foreground">Estimates</h1>
        <Button onClick={() => { resetForm(); setEditingEstimate(null); setShowForm(true); }} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          New Estimate
        </Button>
      </div>

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {filteredEstimates.map((estimate) => (
          <Card key={estimate.id} className="hover:shadow-md transition-shadow bg-card">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                    <FileText className="h-4 w-4" />{estimate.title}
                  </CardTitle>
                  {estimate.project_id && <p className="text-sm text-muted-foreground mt-1">Project: {getProjectName(estimate.project_id)}</p>}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDuplicate(estimate)}><Copy className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(estimate)}><Pencil className="h-4 w-4" /></Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive" 
                    onClick={() => deleteMutation.mutate(estimate.id)}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? <ButtonLoader /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Badge className={statusColors[estimate.status]}>{estimate.status}</Badge>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>£{estimate.subtotal?.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">VAT ({estimate.vat_rate}%)</span><span>£{estimate.vat_amount?.toLocaleString()}</span></div>
                <div className="flex justify-between font-semibold border-t pt-1"><span>Total</span><span>£{estimate.total?.toLocaleString()}</span></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEstimates.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">No estimates found. Create your first estimate to get started.</div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEstimate ? "Edit Estimate" : "New Estimate"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title *</label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            </div>
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
            <div>
              <label className="text-sm font-medium">Notes</label>
              <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} />
            </div>
            <Button className="w-full" onClick={handleSubmit} disabled={!formData.title || createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) && <ButtonLoader />}
              {editingEstimate ? "Update Estimate" : "Create Estimate"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}