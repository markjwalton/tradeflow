import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageLoader, CardGridLoader, ButtonLoader } from "@/components/common/LoadingStates";
import { ErrorRecovery } from "@/components/common/ErrorRecovery";
import { useMutationError } from "@/components/common/MutationErrorToast";
import { Pagination } from "@/components/ui/Pagination";
import { useDebounce } from "@/components/common/useDebounce";
import { useValidatedForm } from "@/components/forms/useValidatedForm";
import { ValidatedInput } from "@/components/forms/ValidatedInput";
import { projectSchema } from "@/components/forms/FormValidation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { Plus, Search, Pencil, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { PullToRefresh } from "@/components/common/PullToRefresh";

const statusColors = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-success-50 text-success",
  on_hold: "bg-warning/10 text-warning",
  completed: "bg-info-50 text-info",
  cancelled: "bg-destructive-50 text-destructive",
};

const priorityColors = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-warning/10 text-warning",
  high: "bg-destructive-50 text-destructive",
};

export default function Projects() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCustomer, setFilterCustomer] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  
  const form = useValidatedForm(projectSchema, {
    defaultValues: {
      name: "",
      customerId: "",
      budget: undefined,
      status: "Planning",
      projectType: "",
      startDate: "",
      estimatedEndDate: "",
      location: "",
      description: "",
    }
  });

  const { data: projects = [], isLoading, error, refetch } = useQuery({
    queryKey: ["projects"],
    queryFn: () => base44.entities.Project.list(),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: () => base44.entities.Customer.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Project.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setShowForm(false);
      form.reset();
      toast.success("Project created successfully");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Project.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setShowForm(false);
      setEditingProject(null);
      form.reset();
      toast.success("Project updated successfully");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Project.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project deleted successfully");
    },
  });

  useMutationError(createMutation, { customMessage: "Failed to create project" });
  useMutationError(updateMutation, { customMessage: "Failed to update project" });
  useMutationError(deleteMutation, { customMessage: "Failed to delete project" });

  const handleEdit = (project) => {
    setEditingProject(project);
    form.reset({
      name: project.name || "",
      customerId: project.customerId || "",
      budget: project.budget || undefined,
      status: project.status || "Planning",
      projectType: project.projectType || "",
      startDate: project.startDate || "",
      estimatedEndDate: project.estimatedEndDate || "",
      location: project.location || "",
      description: project.description || "",
    });
    setShowForm(true);
  };

  const onSubmit = (data) => {
    if (editingProject) {
      updateMutation.mutate({ id: editingProject.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.name?.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesStatus = filterStatus === "all" || p.status === filterStatus;
    const matchesCustomer = filterCustomer === "all" || p.customer_id === filterCustomer;
    return matchesSearch && matchesStatus && matchesCustomer;
  });

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getCustomerName = (customerId) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer?.name || "Unknown";
  };

  if (isLoading) {
    return <PageLoader message="Loading projects..." />;
  }

  if (error) {
    return <ErrorRecovery error={error} onRetry={refetch} />;
  }

  return (
    <PullToRefresh onRefresh={refetch} enabled={true}>
    <div className="max-w-7xl mx-auto -mt-6 bg-background min-h-screen">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-light font-display text-foreground">Projects</h1>
        <Button onClick={() => { form.reset(); setEditingProject(null); setShowForm(true); }} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          <span className="sm:inline">New Project</span>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4 sm:mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
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
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="on_hold">On Hold</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterCustomer} onValueChange={setFilterCustomer}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Customer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Customers</SelectItem>
            {customers.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {paginatedProjects.map((project) => {
          const budgetProgress = project.budget > 0 ? (project.spend / project.budget) * 100 : 0;
          return (
            <Card key={project.id} className="hover:shadow-md transition-shadow bg-card">
              <CardHeader className="pb-2 p-4 sm:p-6">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base sm:text-lg text-foreground flex-1 min-w-0">{project.name}</CardTitle>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button variant="ghost" size="icon" className="touch-target-sm" asChild>
                      <Link to={createPageUrl("ProjectDetail") + `?id=${project.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" className="touch-target-sm" onClick={() => handleEdit(project)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="touch-target-sm text-destructive" onClick={() => deleteMutation.mutate(project.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 p-4 sm:p-6 pt-0">
                <div className="flex gap-2">
                  <Badge className={statusColors[project.status]}>{project.status}</Badge>
                  <Badge className={priorityColors[project.priority]}>{project.priority}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Customer: {getCustomerName(project.customer_id)}</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Budget</span>
                    <span>£{project.spend?.toLocaleString()} / £{project.budget?.toLocaleString()}</span>
                  </div>
                  <Progress value={Math.min(budgetProgress, 100)} className="h-2" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No projects found. Create your first project to get started.
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
            <DialogTitle>{editingProject ? "Edit Project" : "New Project"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ValidatedInput
              label="Project Name"
              required
              error={form.getError("name")}
              {...form.register("name")}
            />
            
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input {...form.register("description")} />
            </div>

            <div>
              <label className="text-sm font-medium">Customer</label>
              <Select {...form.register("customerId")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer..." />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <ValidatedInput
              label="Budget (£)"
              type="number"
              error={form.getError("budget")}
              {...form.register("budget")}
            />

            <div>
              <label className="text-sm font-medium">Status</label>
              <Select {...form.register("status")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Planning">Planning</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Project Type</label>
              <Select {...form.register("projectType")}>
                <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="New Build">New Build</SelectItem>
                  <SelectItem value="Extension">Extension</SelectItem>
                  <SelectItem value="Renovation">Renovation</SelectItem>
                  <SelectItem value="Conservation">Conservation</SelectItem>
                  <SelectItem value="Commercial">Commercial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ValidatedInput
                label="Start Date"
                type="date"
                error={form.getError("startDate")}
                {...form.register("startDate")}
              />
              <ValidatedInput
                label="End Date"
                type="date"
                error={form.getError("estimatedEndDate")}
                {...form.register("estimatedEndDate")}
              />
            </div>

            <ValidatedInput
              label="Location"
              error={form.getError("location")}
              {...form.register("location")}
            />

            <Button className="w-full" type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) && <ButtonLoader />}
              {editingProject ? "Update Project" : "Create Project"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
    </PullToRefresh>
  );
}