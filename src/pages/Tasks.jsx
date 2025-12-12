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
import { Card, CardContent } from "@/components/ui/card";
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
import { Plus, Search, Pencil, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { PullToRefresh } from "@/components/common/PullToRefresh";

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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    project_id: "",
    title: "",
    description: "",
    assigned_to: "",
    status: "todo",
    priority: "medium",
    due_date: "",
    estimated_hours: 0,
    actual_hours: 0,
    start_date: "",
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
      resetForm();
      toast.success("Task created successfully");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setShowForm(false);
      setEditingTask(null);
      resetForm();
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

  const resetForm = () => {
    setFormData({
      project_id: "",
      title: "",
      description: "",
      assigned_to: "",
      status: "todo",
      priority: "medium",
      due_date: "",
      estimated_hours: 0,
      actual_hours: 0,
      start_date: "",
    });
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      project_id: task.project_id || "",
      title: task.title || "",
      description: task.description || "",
      assigned_to: task.assigned_to || "",
      status: task.status || "todo",
      priority: task.priority || "medium",
      due_date: task.due_date || "",
      estimated_hours: task.estimated_hours || 0,
      actual_hours: task.actual_hours || 0,
      start_date: task.start_date || "",
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (editingTask) {
      updateMutation.mutate({ id: editingTask.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title?.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesStatus = filterStatus === "all" || t.status === filterStatus;
    const matchesProject = filterProject === "all" || t.project_id === filterProject;
    return matchesSearch && matchesStatus && matchesProject;
  });

  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
    <div className="p-3 sm:p-4 md:p-6 bg-background min-h-screen">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-light font-display text-midnight-900">Tasks</h1>
        <Button onClick={() => { resetForm(); setEditingTask(null); setShowForm(true); }} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

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

      <div className="space-y-2 sm:space-y-3">
        {paginatedTasks.map((task) => (
          <Card key={task.id} className="hover:shadow-md transition-shadow border-background-muted bg-card">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="font-medium text-midnight-900 text-sm sm:text-base">{task.title}</h3>
                    <Badge className={statusColors[task.status]}>{task.status?.replace("_", " ")}</Badge>
                    <Badge className={priorityColors[task.priority]}>{task.priority}</Badge>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-charcoal-700">
                    <span className="truncate">Project: {getProjectName(task.project_id)}</span>
                    <span className="truncate">Assigned: {getTeamMemberName(task.assigned_to)}</span>
                    {task.due_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(task.due_date), "MMM d, yyyy")}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 sm:flex-col md:flex-row self-end sm:self-auto">
                  <Button variant="ghost" size="icon" className="touch-target" onClick={() => handleEdit(task)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="touch-target text-destructive" onClick={() => deleteMutation.mutate(task.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12 text-charcoal-700">
          No tasks found. Create your first task to get started.
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
            <DialogTitle>{editingTask ? "Edit Task" : "New Task"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Project</label>
                <Select value={formData.project_id} onValueChange={(v) => setFormData({ ...formData, project_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select project..." /></SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Assigned To</label>
                <Select value={formData.assigned_to} onValueChange={(v) => setFormData({ ...formData, assigned_to: v })}>
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
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
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
                <label className="text-sm font-medium">Due Date</label>
                <Input type="date" value={formData.due_date} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Estimated Hours</label>
                <Input type="number" value={formData.estimated_hours} onChange={(e) => setFormData({ ...formData, estimated_hours: parseFloat(e.target.value) || 0 })} />
              </div>
              <div>
                <label className="text-sm font-medium">Actual Hours</label>
                <Input type="number" value={formData.actual_hours} onChange={(e) => setFormData({ ...formData, actual_hours: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
            <Button className="w-full" onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) && <ButtonLoader />}
              {editingTask ? "Update Task" : "Create Task"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </PullToRefresh>
  );
}