import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageLoader, ButtonLoader } from "@/components/common/LoadingStates";
import { ErrorRecovery } from "@/components/common/ErrorRecovery";
import { useMutationError } from "@/components/common/MutationErrorToast";
import { Pagination } from "@/components/ui/Pagination";
import { useDebounce } from "@/components/common/useDebounce";
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
import { Plus, Search, Pencil, Trash2, Mail, Phone, Building2 } from "lucide-react";
import { toast } from "sonner";
import { PullToRefresh } from "@/components/common/PullToRefresh";

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
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    address: "",
    source: "",
    status: "lead",
    tags: [],
    notes: "",
  });
  const [tagInput, setTagInput] = useState("");

  const { data: customers = [], isLoading, error, refetch } = useQuery({
    queryKey: ["customers"],
    queryFn: () => base44.entities.Customer.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Customer.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setShowForm(false);
      resetForm();
      toast.success("Customer created successfully");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Customer.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setShowForm(false);
      setEditingCustomer(null);
      resetForm();
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

  const resetForm = () => {
    setFormData({
      name: "",
      company: "",
      email: "",
      phone: "",
      address: "",
      source: "",
      status: "lead",
      tags: [],
      notes: "",
    });
    setTagInput("");
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name || "",
      company: customer.company || "",
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || "",
      source: customer.source || "",
      status: customer.status || "lead",
      tags: customer.tags || [],
      notes: customer.notes || "",
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (editingCustomer) {
      updateMutation.mutate({ id: editingCustomer.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
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

  if (isLoading) {
    return <PageLoader message="Loading customers..." />;
  }

  if (error) {
    return <ErrorRecovery error={error} onRetry={refetch} />;
  }

  return (
    <PullToRefresh onRefresh={refetch} enabled={true}>
    <div className="p-3 sm:p-4 md:p-6 bg-background min-h-screen">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-light font-display text-foreground">Customers</h1>
        <Button onClick={() => { resetForm(); setEditingCustomer(null); setShowForm(true); }} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          New Customer
        </Button>
      </div>

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {paginatedCustomers.map((customer) => (
          <Card key={customer.id} className="hover:shadow-md transition-shadow bg-card">
            <CardHeader className="pb-2 p-4 sm:p-6">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base sm:text-lg text-foreground truncate">{customer.name}</CardTitle>
                  {customer.company && (
                    <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 mt-1 truncate">
                      <Building2 className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{customer.company}</span>
                    </p>
                  )}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button variant="ghost" size="icon" className="touch-target-sm" onClick={() => handleEdit(customer)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="touch-target-sm text-destructive" onClick={() => deleteMutation.mutate(customer.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3 p-4 sm:p-6 pt-0">
              <Badge className={statusColors[customer.status]}>{customer.status}</Badge>
              {customer.email && (
                <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2 truncate">
                  <Mail className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{customer.email}</span>
                </p>
              )}
              {customer.phone && (
                <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
                  <Phone className="h-3 w-3 flex-shrink-0" />
                  {customer.phone}
                </p>
              )}
              {customer.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {customer.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No customers found. Add your first customer to get started.
        </div>
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
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Name *</label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Company</label>
                <Input value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Address</label>
              <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Source</label>
                <Select value={formData.source} onValueChange={(v) => setFormData({ ...formData, source: v })}>
                  <SelectTrigger><SelectValue placeholder="Select source..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="social_media">Social Media</SelectItem>
                    <SelectItem value="cold_call">Cold Call</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Tags</label>
              <div className="flex gap-2">
                <Input 
                  value={tagInput} 
                  onChange={(e) => setTagInput(e.target.value)} 
                  placeholder="Add tag..."
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                />
                <Button type="button" variant="outline" onClick={handleAddTag}>Add</Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Notes</label>
              <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} />
            </div>
            <Button className="w-full" onClick={handleSubmit} disabled={!formData.name || createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) && <ButtonLoader />}
              {editingCustomer ? "Update Customer" : "Create Customer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </PullToRefresh>
  );
}