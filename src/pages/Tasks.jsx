import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageLoader, ButtonLoader } from "@/components/common/LoadingStates";
import { ErrorRecovery } from "@/components/common/ErrorRecovery";
import { useMutationError } from "@/components/common/MutationErrorToast";
import { useDebounce } from "@/components/common/useDebounce";
import { usePagination } from "@/components/common/usePagination";
import { StandardPagination } from "@/components/common/StandardPagination";
import { useValidatedForm } from "@/components/forms/useValidatedForm";
import { ValidatedInput } from "@/components/forms/ValidatedInput";
import { ValidatedTextarea } from "@/components/forms/ValidatedTextarea";
import { taskSchema } from "@/components/forms/FormValidation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { Plus, Search, Pencil, Trash2, Calendar, ChevronDown, ChevronRight, CheckSquare } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { PullToRefresh } from "@/components/common/PullToRefresh";
import { PageHeader } from "@/components/sturij";

const statusColors = {
  todo: "bg-muted text-muted-foreground",
  in_progress: "bg-info-50 text-info",
  review: "bg-accent-100 text-accent",
  completed: "bg-success-50 text-success",
};

const priorityColors = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-warning/10 text-warning",
  high: "bg-destructive-50 text-destructive",
};

export default function Tasks() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterProject, setFilterProject] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [expandedStatuses, setExpandedStatuses] = useState({});
  
  const form = useValidatedForm(taskSchema, {
    defaultValues: {
      projectId: "",
      name: "",
      description: "",
      assignedTo: "",
      status: "To Do",
      priority: "Medium",
      dueDate: "",
      estimatedHours: undefined,
      startDate: "",
    }
  });

  const { data: tasks = [], isLoading, error, refetch } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => base44.entities.Task.list(),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: () => base44.entities.Project.list(),
  });

  const { data: teamMembers = [] } = useQuery({
    queryKey: ["teamMembers"],
    queryFn: () => base44.entities.TeamMember.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Task.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setShowForm(false);
      form.reset();
      toast.success("Task created successfully");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setShowForm(false);
      setEditingTask(null);
      form.reset();
      toast.success("Task updated successfully");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Task.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task deleted successfully");
    },
  });

  useMutationError(createMutation, { customMessage: "Failed to create task" });
  useMutationError(updateMutation, { customMessage: "Failed to update task" });
  useMutationError(deleteMutation, { customMessage: "Failed to delete task" });

  const handleEdit = (task) => {
    setEditingTask(task);
    form.reset({
      projectId: task.projectId || "",
      name: task.name || "",
      description: task.description || "",
      assignedTo: task.assignedTo || "",
      status: task.status || "To Do",
      priority: task.priority || "Medium",
      dueDate: task.dueDate || "",
      estimatedHours: task.estimatedHours || undefined,
      startDate: task.startDate || "",
    });
    setShowForm(true);
  };

  const onSubmit = (data) => {
    if (editingTask) {
      updateMutation.mutate({ id: editingTask.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title?.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesStatus = filterStatus === "all" || t.status === filterStatus;
    const matchesProject = filterProject === "all" || t.project_id === filterProject;
    return matchesSearch && matchesStatus && matchesProject;
  });

  const pagination = usePagination(filteredTasks, "Tasks");

  // Group tasks by status
  const groupedTasks = pagination.currentItems.reduce((acc, task) => {
    const status = task.status || "todo";
    if (!acc[status]) acc[status] = [];
    acc[status].push(task);
    return acc;
  }, {});

  // Initialize collapsed state
  React.useEffect(() => {
    const initial = {};
    Object.keys(groupedTasks).forEach(status => {
      if (expandedStatuses[status] === undefined) {
        initial[status] = true;
      }
    });
    if (Object.keys(initial).length > 0) {
      setExpandedStatuses(prev => ({ ...prev, ...initial }));
    }
  }, [JSON.stringify(Object.keys(groupedTasks))]);

  const getProjectName = (projectId) => {
    const project = projects.find((p) => p.id === projectId);
    return project?.name || "Unassigned";
  };

  const getTeamMemberName = (memberId) => {
    const member = teamMembers.find((m) => m.id === memberId);
    return member?.name || "Unassigned";
  };

  if (isLoading) {
    return <PageLoader message="Loading tasks..." />;
  }

  if (error) {
    return <ErrorRecovery error={error} onRetry={refetch} />;
  }

  return (
    <PullToRefresh onRefresh={refetch} enabled={true}>
    <div className="max-w-7xl mx-auto -mt-6 min-h-screen">
      <PageHeader 
        title="Tasks"
        description="Track and manage project tasks"
      />

      <Card className="border-border mb-4">
        <CardContent className="px-2 py-1">
          <div className="flex gap-2">
            <Button 
              variant="ghost"
              className="hover:bg-[#e9efeb] hover:text-[#273e2d]"
              onClick={() => { form.reset(); setEditingTask(null); setShowForm(true); }}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4 sm:mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
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
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="review">Review</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterProject} onValueChange={setFilterProject}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border">
        <CardContent className="p-4">
          <div className="space-y-4">
            {Object.entries(groupedTasks).map(([status, statusTasks]) => {
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
                          <Badge className={statusColors[status]}>{status?.replace("_", " ")}</Badge>
                          <span className="text-muted-foreground text-sm font-normal">({statusTasks.length})</span>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0 space-y-2">
                        {statusTasks.map((task) => (
                          <Card key={task.id} className="border-border hover:shadow-sm transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-4">
                                <CheckSquare className="h-5 w-5 text-primary flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-medium text-base">{task.name}</h3>
                                    <Badge className={priorityColors[task.priority]}>{task.priority}</Badge>
                                  </div>
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                                    <span className="truncate">Project: {getProjectName(task.projectId)}</span>
                                    <span className="truncate">Assigned: {getTeamMemberName(task.assignedTo)}</span>
                                    {task.dueDate && (
                                      <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {format(new Date(task.dueDate), "MMM d, yyyy")}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                  <Button variant="ghost" size="icon" className="touch-target-sm" onClick={() => handleEdit(task)}>
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="touch-target-sm text-destructive" onClick={() => deleteMutation.mutate(task.id)}>
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

          {filteredTasks.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No tasks found. Create your first task to get started.
            </div>
          )}

          <StandardPagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            startIndex={pagination.startIndex}
            endIndex={pagination.endIndex}
            itemsPerPage={pagination.itemsPerPage}
            onPageChange={pagination.goToPage}
            onItemsPerPageChange={pagination.setItemsPerPage}
          />
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTask ? "Edit Task" : "New Task"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ValidatedInput
              label="Task Name"
              required
              error={form.getError("name")}
              {...form.register("name")}
            />
            
            <ValidatedTextarea
              label="Description"
              rows={3}
              error={form.getError("description")}
              {...form.register("description")}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Project <span className="text-destructive">*</span></label>
                <Select {...form.register("projectId")}>
                  <SelectTrigger><SelectValue placeholder="Select project..." /></SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.getError("projectId") && (
                  <p className="text-sm text-destructive mt-1">{form.getError("projectId")}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Assigned To</label>
                <Select {...form.register("assignedTo")}>
                  <SelectTrigger><SelectValue placeholder="Select member..." /></SelectTrigger>
                  <SelectContent>
                    {teamMembers.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select {...form.register("status")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="To Do">To Do</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Blocked">Blocked</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Snagging">Snagging</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Priority</label>
                <Select {...form.register("priority")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ValidatedInput
                label="Start Date"
                type="date"
                error={form.getError("startDate")}
                {...form.register("startDate")}
              />
              <ValidatedInput
                label="Due Date"
                type="date"
                error={form.getError("dueDate")}
                {...form.register("dueDate")}
              />
            </div>

            <ValidatedInput
              label="Estimated Hours"
              type="number"
              error={form.getError("estimatedHours")}
              {...form.register("estimatedHours")}
            />

            <Button className="w-full" type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) && <ButtonLoader />}
              {editingTask ? "Update Task" : "Create Task"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
    </PullToRefresh>
  );
}