import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageLoader, ButtonLoader } from "@/components/common/LoadingStates";
import { ErrorRecovery } from "@/components/common/ErrorRecovery";
import { useMutationError } from "@/components/common/MutationErrorToast";
import { Pagination } from "@/components/ui/Pagination";
import { useDebounce } from "@/components/common/useDebounce";
import { useValidatedForm } from "@/components/forms/useValidatedForm";
import { ValidatedInput } from "@/components/forms/ValidatedInput";
import { ValidatedTextarea } from "@/components/forms/ValidatedTextarea";
import { customerSchema } from "@/components/forms/FormValidation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
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
import { Plus, Search, Pencil, Trash2, Mail, Phone, Building2 } from "lucide-react";
import { toast } from "sonner";
import { PullToRefresh } from "@/components/common/PullToRefresh";
import { PageHeader } from "@/components/sturij";

const statusColors = {
  lead: "bg-warning/10 text-warning",
  active: "bg-success-50 text-success",
  inactive: "bg-muted text-muted-foreground",
};

export default function Customers() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [expandedStatuses, setExpandedStatuses] = useState({});
  
  const form = useValidatedForm(customerSchema, {
    defaultValues: {
      name: "",
      company: "",
      email: "",
      phone: "",
      address: "",
      notes: "",
    }
  });

  const { data: customers = [], isLoading, error, refetch } = useQuery({
    queryKey: ["customers"],
    queryFn: () => base44.entities.Customer.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Customer.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setShowForm(false);
      form.reset();
      toast.success("Customer created successfully");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Customer.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setShowForm(false);
      setEditingCustomer(null);
      form.reset();
      toast.success("Customer updated successfully");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Customer.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer deleted successfully");
    },
  });

  useMutationError(createMutation, { customMessage: "Failed to create customer" });
  useMutationError(updateMutation, { customMessage: "Failed to update customer" });
  useMutationError(deleteMutation, { customMessage: "Failed to delete customer" });

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    form.reset({
      name: customer.name || "",
      company: customer.company || "",
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || "",
      notes: customer.notes || "",
    });
    setShowForm(true);
  };

  const onSubmit = (data) => {
    if (editingCustomer) {
      updateMutation.mutate({ id: editingCustomer.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch = 
      c.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      c.company?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      c.email?.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesStatus = filterStatus === "all" || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const groupedCustomers = paginatedCustomers.reduce((acc, customer) => {
    const status = customer.status || "active";
    if (!acc[status]) acc[status] = [];
    acc[status].push(customer);
    return acc;
  }, {});

  if (isLoading) {
    return <PageLoader message="Loading customers..." />;
  }

  if (error) {
    return <ErrorRecovery error={error} onRetry={refetch} />;
  }

  return (
    <PullToRefresh onRefresh={refetch} enabled={true}>
    <div className="max-w-7xl mx-auto -mt-6 min-h-screen">
      <PageHeader 
        title="Customers"
        description="Manage your customer database"
      />

      <Card className="border-border mb-4">
        <CardContent className="px-2 py-1">
          <div className="flex gap-2">
            <Button 
              variant="ghost"
              className="hover:bg-[#e9efeb] hover:text-[#273e2d]"
              onClick={() => { form.reset(); setEditingCustomer(null); setShowForm(true); }}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Customer
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 mb-4 sm:mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="lead">Lead</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {Object.entries(groupedCustomers).map(([status, statusCustomers]) => {
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
                      <span className="text-muted-foreground text-sm font-normal">({statusCustomers.length})</span>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0 space-y-2">
                    {statusCustomers.map((customer) => (
                      <Card key={customer.id} className="border-border hover:shadow-sm transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <Building2 className="h-5 w-5 text-primary flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium text-base">{customer.name}</h3>
                                {customer.company && (
                                  <span className="text-sm text-muted-foreground">• {customer.company}</span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                {customer.email && (
                                  <span className="flex items-center gap-1 truncate">
                                    <Mail className="h-3 w-3 flex-shrink-0" />
                                    {customer.email}
                                  </span>
                                )}
                                {customer.phone && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="h-3 w-3 flex-shrink-0" />
                                    {customer.phone}
                                  </span>
                                )}
                              </div>
                              {customer.tags?.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {customer.tags.map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="touch-target-sm" 
                                onClick={() => handleEdit(customer)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="touch-target-sm text-destructive" 
                                onClick={() => deleteMutation.mutate(customer.id)}
                              >
                                <Trash2 className="h-4 w-4" />
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

      {filteredCustomers.length === 0 && (
        <Card className="border-border">
          <CardContent className="text-center py-12 text-muted-foreground">
            No customers found. Add your first customer to get started.
          </CardContent>
        </Card>
      )}

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCustomer ? "Edit Customer" : "New Customer"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <ValidatedInput
                label="Name"
                required
                error={form.getError("name")}
                {...form.register("name")}
              />
              <ValidatedInput
                label="Company"
                error={form.getError("company")}
                {...form.register("company")}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ValidatedInput
                label="Email"
                type="email"
                error={form.getError("email")}
                {...form.register("email")}
              />
              <ValidatedInput
                label="Phone"
                type="tel"
                error={form.getError("phone")}
                {...form.register("phone")}
              />
            </div>

            <ValidatedInput
              label="Address"
              error={form.getError("address")}
              {...form.register("address")}
            />

            <ValidatedTextarea
              label="Notes"
              rows={3}
              error={form.getError("notes")}
              {...form.register("notes")}
            />

            <Button className="w-full" type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) && <ButtonLoader />}
              {editingCustomer ? "Update Customer" : "Create Customer"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
    </PullToRefresh>
  );
}