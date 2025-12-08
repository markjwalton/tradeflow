import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Play,
  Loader2,
  GitBranch,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

const categoryColors = {
  sales: "bg-success-50 text-success-foreground",
  project: "bg-info-50 text-info-foreground",
  manufacturing: "bg-accent-100 text-accent-700",
  installation: "bg-warning/10 text-warning-foreground",
  service: "bg-info-50 text-info-foreground",
  admin: "bg-muted text-muted-foreground",
  custom: "bg-accent-100 text-accent-700",
};

export default function WorkflowLibrary() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ["workflows"],
    queryFn: () => base44.entities.Workflow.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Workflow.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      toast.success("Workflow deleted");
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (workflow) => {
      const newWorkflow = await base44.entities.Workflow.create({
        name: `${workflow.name} (Copy)`,
        code: `${workflow.code}_copy_${Date.now()}`,
        description: workflow.description,
        category: workflow.category,
        triggerEntity: workflow.triggerEntity,
        triggerEvent: workflow.triggerEvent,
        isActive: false,
      });

      // Copy steps
      const steps = await base44.entities.WorkflowStep.filter({
        workflowId: workflow.id,
      });
      for (const step of steps) {
        await base44.entities.WorkflowStep.create({
          ...step,
          id: undefined,
          workflowId: newWorkflow.id,
        });
      }

      return newWorkflow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      toast.success("Workflow duplicated");
    },
  });

  const filteredWorkflows = workflows.filter((wf) => {
    const matchesSearch =
      !search ||
      wf.name?.toLowerCase().includes(search.toLowerCase()) ||
      wf.code?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || wf.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 bg-[var(--color-background)] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-light font-display text-[var(--color-midnight)]">Workflow Library</h1>
          <p className="text-[var(--color-charcoal)]">
            Manage and create workflow templates for your business processes
          </p>
        </div>
        <Link to={createPageUrl("WorkflowDesigner")}>
          <Button className="bg-primary-500 hover:bg-primary-600 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Create Workflow
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search workflows..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="sales">Sales</SelectItem>
            <SelectItem value="project">Project</SelectItem>
            <SelectItem value="manufacturing">Manufacturing</SelectItem>
            <SelectItem value="installation">Installation</SelectItem>
            <SelectItem value="service">Service</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Workflow Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-charcoal)]" />
        </div>
      ) : filteredWorkflows.length === 0 ? (
        <div className="text-center py-12">
          <GitBranch className="h-12 w-12 mx-auto text-[var(--color-charcoal)] opacity-50 mb-4" />
          <h3 className="text-lg font-medium text-[var(--color-midnight)]">No workflows found</h3>
          <p className="text-[var(--color-charcoal)] mb-4">
            {search || categoryFilter !== "all"
              ? "Try adjusting your filters"
              : "Create your first workflow to get started"}
          </p>
          {!search && categoryFilter === "all" && (
            <Link to={createPageUrl("WorkflowDesigner")}>
              <Button className="bg-primary-500 hover:bg-primary-600 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Workflow
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkflows.map((workflow) => (
            <Card key={workflow.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {workflow.name}
                      {workflow.isActive ? (
                        <CheckCircle className="h-4 w-4 text-success-foreground" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{workflow.code}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <Link
                        to={`${createPageUrl("WorkflowDesigner")}?id=${workflow.id}`}
                      >
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem
                        onClick={() => duplicateMutation.mutate(workflow)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => deleteMutation.mutate(workflow.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                {workflow.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {workflow.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {workflow.category && (
                    <Badge className={categoryColors[workflow.category]}>
                      {workflow.category}
                    </Badge>
                  )}
                  {workflow.triggerEntity && (
                    <Badge variant="outline">{workflow.triggerEntity}</Badge>
                  )}
                  {workflow.triggerEvent && workflow.triggerEvent !== "manual" && (
                    <Badge variant="secondary">{workflow.triggerEvent}</Badge>
                  )}
                </div>
                <div className="mt-4 pt-3 border-t flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    v{workflow.version || 1}
                  </span>
                  <Link
                    to={`${createPageUrl("WorkflowDesigner")}?id=${workflow.id}`}
                  >
                    <Button variant="outline" size="sm">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}