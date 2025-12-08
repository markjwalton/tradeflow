import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Plus, Search, Pencil, Trash2, Loader2, Eye } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const statusColors = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-success-50 text-success-foreground",
  on_hold: "bg-warning/10 text-warning-foreground",
  completed: "bg-info-50 text-info-foreground",
  cancelled: "bg-destructive-50 text-destructive-700",
};

const priorityColors = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-warning/10 text-warning-foreground",
  high: "bg-destructive-50 text-destructive-700",
};

export default function Projects() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCustomer, setFilterCustomer] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    customer_id: "",
    budget: 0,
    status: "draft",
    priority: "medium",
    project_type: "",
    start_date: "",
    end_date: "",
    spend: 0,
  });

  const { data: projects = [], isLoading } = useQuery({
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
      resetForm();
      toast.success("Project created");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Project.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setShowForm(false);
      setEditingProject(null);
      resetForm();
      toast.success("Project updated");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Project.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project deleted");
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      customer_id: "",
      budget: 0,
      status: "draft",
      priority: "medium",
      project_type: "",
      start_date: "",
      end_date: "",
      spend: 0,
    });
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      name: project.name || "",
      customer_id: project.customer_id || "",
      budget: project.budget || 0,
      status: project.status || "draft",
      priority: project.priority || "medium",
      project_type: project.project_type || "",
      start_date: project.start_date || "",
      end_date: project.end_date || "",
      spend: project.spend || 0,
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (editingProject) {
      updateMutation.mutate({ id: editingProject.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || p.status === filterStatus;
    const matchesCustomer = filterCustomer === "all" || p.customer_id === filterCustomer;
    return matchesSearch && matchesStatus && matchesCustomer;
  });

  const getCustomerName = (customerId) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer?.name || "Unknown";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-[var(--color-background)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-charcoal)]" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-[var(--color-background)] min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-light font-display text-[var(--color-midnight)]">Projects</h1>
        <Button onClick={() => { resetForm(); setEditingProject(null); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-charcoal)]" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
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
          <SelectTrigger className="w-48">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((project) => {
          const budgetProgress = project.budget > 0 ? (project.spend / project.budget) * 100 : 0;
          return (
            <Card key={project.id} className="hover:shadow-md transition-shadow border-[var(--color-background-muted)] bg-[var(--color-background-paper)]">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg text-[var(--color-midnight)]">{project.name}</CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <Link to={createPageUrl("ProjectDetail") + `?id=${project.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(project)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(project.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Badge className={statusColors[project.status]}>{project.status}</Badge>
                  <Badge className={priorityColors[project.priority]}>{project.priority}</Badge>
                </div>
                <p className="text-sm text-[var(--color-charcoal)]">Customer: {getCustomerName(project.customer_id)}</p>
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
        <div className="text-center py-12 text-[var(--color-charcoal)]">
          No projects found. Create your first project to get started.
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingProject ? "Edit Project" : "New Project"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Customer</label>
              <Select value={formData.customer_id} onValueChange={(v) => setFormData({ ...formData, customer_id: v })}>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Budget (£)</label>
                <Input type="number" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })} />
              </div>
              <div>
                <label className="text-sm font-medium">Spend (£)</label>
                <Input type="number" value={formData.spend} onChange={(e) => setFormData({ ...formData, spend: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Priority</label>
                <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Date</label>
                <Input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">End Date</label>
                <Input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Project Type</label>
              <Input value={formData.project_type} onChange={(e) => setFormData({ ...formData, project_type: e.target.value })} placeholder="e.g., Kitchen, Bathroom, Extension" />
            </div>
            <Button className="w-full" onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingProject ? "Update Project" : "Create Project"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}