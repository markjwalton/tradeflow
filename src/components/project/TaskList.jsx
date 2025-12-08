import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  Loader2,
  ListTodo,
  User,
  Filter
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const statusConfig = {
  "To Do": { icon: Circle, color: "bg-muted text-muted-foreground border-border" },
  "In Progress": { icon: Clock, color: "bg-info-50 text-info border-primary-200" },
  "Blocked": { icon: AlertCircle, color: "bg-destructive-50 text-destructive-700 border-destructive-200" },
  "Completed": { icon: CheckCircle2, color: "bg-success-50 text-success border-success" },
  "Snagging": { icon: AlertCircle, color: "bg-warning/10 text-warning border-warning/20" },
};

const priorityConfig = {
  "Low": "bg-muted text-muted-foreground",
  "Medium": "bg-info-50 text-info",
  "High": "bg-warning/10 text-warning",
  "Critical": "bg-destructive-50 text-destructive",
};

const emptyTask = {
  name: "",
  description: "",
  status: "To Do",
  priority: "Medium",
  assignedTo: "",
  startDate: "",
  dueDate: "",
  estimatedHours: "",
  notes: "",
};

export default function TaskList({ tasks = [], projectId, isLoading }) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState(emptyTask);
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: teamMembers = [] } = useQuery({
    queryKey: ["teamMembers"],
    queryFn: () => base44.entities.TeamMember.list("name", 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Task.create({ ...data, projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      toast.success("Task created");
      closeDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      toast.success("Task updated");
      closeDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Task.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      toast.success("Task deleted");
    },
  });

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingTask(null);
    setFormData(emptyTask);
  };

  const openCreate = () => {
    setFormData(emptyTask);
    setEditingTask(null);
    setDialogOpen(true);
  };

  const openEdit = (task) => {
    setFormData({
      name: task.name || "",
      description: task.description || "",
      status: task.status || "To Do",
      priority: task.priority || "Medium",
      assignedTo: task.assignedTo || "",
      startDate: task.startDate || "",
      dueDate: task.dueDate || "",
      estimatedHours: task.estimatedHours || "",
      notes: task.notes || "",
    });
    setEditingTask(task);
    setDialogOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : null,
    };
    if (editingTask) {
      updateMutation.mutate({ id: editingTask.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleQuickStatusChange = (task, newStatus) => {
    updateMutation.mutate({
      id: task.id,
      data: { ...task, status: newStatus, completedDate: newStatus === "Completed" ? new Date().toISOString().split("T")[0] : null },
    });
  };

  const getTeamMemberName = (id) => {
    const member = teamMembers.find((m) => m.id === id);
    return member?.name || "Unassigned";
  };

  const filteredTasks = statusFilter === "all" 
    ? tasks 
    : tasks.filter((t) => t.status === statusFilter);

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="To Do">To Do</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Blocked">Blocked</SelectItem>
              <SelectItem value="Snagging">Snagging</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={openCreate} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ListTodo className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {statusFilter === "all" ? "No tasks yet" : `No ${statusFilter} tasks`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const StatusIcon = statusConfig[task.status]?.icon || Circle;
            return (
              <Card key={task.id} className="hover:shadow-md transition-shadow">
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    {/* Status Icon / Quick Toggle */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="mt-1 hover:opacity-70 transition-opacity">
                          <StatusIcon className={`h-5 w-5 ${
                            task.status === "Completed" ? "text-success" :
                            task.status === "Blocked" ? "text-destructive" :
                            task.status === "In Progress" ? "text-info" :
                            task.status === "Snagging" ? "text-warning" :
                            "text-muted-foreground"
                          }`} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {Object.keys(statusConfig).map((status) => (
                          <DropdownMenuItem
                            key={status}
                            onClick={() => handleQuickStatusChange(task, status)}
                          >
                            {status}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Task Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className={`font-medium ${task.status === "Completed" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                            {task.name}
                          </h4>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(task)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => deleteMutation.mutate(task.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Meta Info */}
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <Badge className={`${statusConfig[task.status]?.color} border`}>
                          {task.status}
                        </Badge>
                        <Badge className={priorityConfig[task.priority]}>
                          {task.priority}
                        </Badge>
                        {task.assignedTo && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {getTeamMemberName(task.assignedTo)}
                          </Badge>
                        )}
                        {task.dueDate && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(task.dueDate), "MMM d")}
                          </Badge>
                        )}
                        {task.estimatedHours && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {task.estimatedHours}h
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTask ? "Edit Task" : "Add New Task"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Task Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Install kitchen cabinets"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed instructions..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val) => setFormData({ ...formData, status: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="To Do">To Do</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Blocked">Blocked</SelectItem>
                    <SelectItem value="Snagging">Snagging</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(val) => setFormData({ ...formData, priority: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Assigned To</Label>
              <Select
                value={formData.assignedTo}
                onValueChange={(val) => setFormData({ ...formData, assignedTo: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedHours">Estimated Hours</Label>
              <Input
                id="estimatedHours"
                type="number"
                value={formData.estimatedHours}
                onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                placeholder="e.g., 8"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSaving}>
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingTask ? "Update Task" : "Create Task"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}