import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogTrigger,
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
  User,
  Clock,
  Calendar,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const roleColors = {
  "Project Manager": "bg-accent-100 text-accent",
  "Site Manager": "bg-info-50 text-info",
  Carpenter: "bg-warning/10 text-warning",
  Joiner: "bg-warning/10 text-warning",
  Apprentice: "bg-success-50 text-success",
  Administrator: "bg-accent-100 text-accent",
  Other: "bg-muted text-muted-foreground",
};

const emptyAllocation = {
  teamMemberId: "",
  taskId: "",
  allocatedHours: "",
  startDate: "",
  endDate: "",
  notes: "",
};

export default function ProjectTeam({ projectId, tasks = [], isLoading: isLoadingAllocations }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState(null);
  const [formData, setFormData] = useState(emptyAllocation);

  const queryClient = useQueryClient();

  const { data: teamMembers = [], isLoading: loadingMembers } = useQuery({
    queryKey: ["teamMembers"],
    queryFn: () => base44.entities.TeamMember.list("-created_date", 100),
  });

  const { data: allocations = [], isLoading: loadingAllocations } = useQuery({
    queryKey: ["allocations", projectId],
    queryFn: () => base44.entities.TeamAllocation.filter({ projectId }),
    enabled: !!projectId,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.TeamAllocation.create({ ...data, projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allocations", projectId] });
      toast.success("Team member assigned");
      handleCloseDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TeamAllocation.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allocations", projectId] });
      toast.success("Assignment updated");
      handleCloseDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.TeamAllocation.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allocations", projectId] });
      toast.success("Assignment removed");
    },
  });

  const handleOpenDialog = (allocation = null) => {
    if (allocation) {
      setEditingAllocation(allocation);
      setFormData({
        teamMemberId: allocation.teamMemberId || "",
        taskId: allocation.taskId || "",
        allocatedHours: allocation.allocatedHours || "",
        startDate: allocation.startDate || "",
        endDate: allocation.endDate || "",
        notes: allocation.notes || "",
      });
    } else {
      setEditingAllocation(null);
      setFormData(emptyAllocation);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingAllocation(null);
    setFormData(emptyAllocation);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSubmit = {
      ...formData,
      allocatedHours: formData.allocatedHours ? parseFloat(formData.allocatedHours) : null,
    };

    if (editingAllocation) {
      updateMutation.mutate({ id: editingAllocation.id, data: dataToSubmit });
    } else {
      createMutation.mutate(dataToSubmit);
    }
  };

  const getMemberById = (id) => teamMembers.find((m) => m.id === id);
  const getTaskById = (id) => tasks.find((t) => t.id === id);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isLoading = loadingMembers || loadingAllocations || isLoadingAllocations;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Project Team</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => handleOpenDialog()}
            >
              <Plus className="h-4 w-4 mr-1" />
              Assign Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingAllocation ? "Edit Assignment" : "Assign Team Member"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Team Member *</Label>
                <Select
                  value={formData.teamMemberId}
                  onValueChange={(value) => setFormData({ ...formData, teamMemberId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select team member..." />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name} - {member.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Task (Optional)</Label>
                <Select
                  value={formData.taskId}
                  onValueChange={(value) => setFormData({ ...formData, taskId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Assign to specific task..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>No specific task</SelectItem>
                    {tasks.map((task) => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Allocated Hours</Label>
                <Input
                  type="number"
                  value={formData.allocatedHours}
                  onChange={(e) => setFormData({ ...formData, allocatedHours: e.target.value })}
                  placeholder="e.g., 40"
                />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={isSubmitting || !formData.teamMemberId}
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingAllocation ? "Update" : "Assign"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : allocations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <User className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p>No team members assigned yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allocations.map((allocation) => {
              const member = getMemberById(allocation.teamMemberId);
              const task = allocation.taskId ? getTaskById(allocation.taskId) : null;

              return (
                <div
                  key={allocation.id}
                  className="p-4 rounded-lg border border-stone-200 bg-white hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary font-semibold">
                          {member?.name?.charAt(0)?.toUpperCase() || "?"}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">
                          {member?.name || "Unknown Member"}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          {member?.role && (
                            <Badge className={roleColors[member.role] || roleColors.Other}>{member.role}</Badge>
                          )}
                          {task && (
                            <Badge variant="outline" className="text-xs">
                              {task.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenDialog(allocation)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => deleteMutation.mutate(allocation.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                    {allocation.startDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(allocation.startDate), "MMM d, yyyy")}
                        {allocation.endDate && ` - ${format(new Date(allocation.endDate), "MMM d, yyyy")}`}
                      </span>
                    )}
                    {allocation.allocatedHours && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {allocation.allocatedHours}h allocated
                      </span>
                    )}
                  </div>
                  {allocation.notes && (
                    <p className="text-sm text-muted-foreground mt-2">{allocation.notes}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}