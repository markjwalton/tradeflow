import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  MoreVertical,
  Pencil,
  Trash2,
  FileImage,
  Calendar,
  User,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const statusColors = {
  "Not Started": "bg-muted text-muted-foreground",
  "In Progress": "bg-info-50 text-info",
  "Under Review": "bg-warning/10 text-warning",
  "Approved": "bg-success-50 text-success",
  "Revision Required": "bg-destructive-50 text-destructive",
};

const emptyPhase = {
  projectId: "",
  name: "",
  description: "",
  status: "Not Started",
  designer: "",
  startDate: "",
  dueDate: "",
  revisionNumber: 1,
  notes: "",
};

export default function DesignPhaseList({ projectFilter, projects }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPhase, setEditingPhase] = useState(null);
  const [formData, setFormData] = useState(emptyPhase);

  const queryClient = useQueryClient();

  const { data: phases = [], isLoading } = useQuery({
    queryKey: ["designPhases"],
    queryFn: () => base44.entities.DesignPhase.list("-created_date", 100),
  });

  const { data: teamMembers = [] } = useQuery({
    queryKey: ["teamMembers"],
    queryFn: () => base44.entities.TeamMember.list("-created_date", 50),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.DesignPhase.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["designPhases"] });
      toast.success("Design phase created");
      handleCloseDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.DesignPhase.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["designPhases"] });
      toast.success("Design phase updated");
      handleCloseDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.DesignPhase.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["designPhases"] });
      toast.success("Design phase deleted");
    },
  });

  const handleOpenDialog = (phase = null) => {
    if (phase) {
      setEditingPhase(phase);
      setFormData({
        projectId: phase.projectId || "",
        name: phase.name || "",
        description: phase.description || "",
        status: phase.status || "Not Started",
        designer: phase.designer || "",
        startDate: phase.startDate || "",
        dueDate: phase.dueDate || "",
        revisionNumber: phase.revisionNumber || 1,
        notes: phase.notes || "",
      });
    } else {
      setEditingPhase(null);
      setFormData(emptyPhase);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPhase(null);
    setFormData(emptyPhase);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingPhase) {
      updateMutation.mutate({ id: editingPhase.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getProjectName = (projectId) => {
    return projects?.find((p) => p.id === projectId)?.name || "Unknown";
  };

  const filteredPhases = phases.filter((phase) => {
    return projectFilter === "all" || phase.projectId === projectFilter;
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => handleOpenDialog()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Design Phase
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingPhase ? "Edit Design Phase" : "Add Design Phase"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Project *</Label>
                <Select
                  value={formData.projectId}
                  onValueChange={(value) => setFormData({ ...formData, projectId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects?.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Phase Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Structural Design"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Not Started">Not Started</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Under Review">Under Review</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Revision Required">Revision Required</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Designer</Label>
                  <Select
                    value={formData.designer}
                    onValueChange={(value) => setFormData({ ...formData, designer: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.email || member.id}>
                          {member.name || member.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingPhase ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {filteredPhases.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileImage className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No design phases</h3>
            <p className="text-muted-foreground">Add your first design phase to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPhases.map((phase) => (
            <Card key={phase.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{phase.name}</h3>
                    <p className="text-sm text-muted-foreground">{getProjectName(phase.projectId)}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenDialog(phase)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => deleteMutation.mutate(phase.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <Badge className={statusColors[phase.status]}>{phase.status}</Badge>

                {phase.revisionNumber > 1 && (
                  <Badge variant="outline" className="ml-2">
                    Rev {phase.revisionNumber}
                  </Badge>
                )}

                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {phase.designer && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {teamMembers.find((m) => m.email === phase.designer)?.name || phase.designer}
                    </div>
                  )}
                  {phase.dueDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      Due {format(new Date(phase.dueDate), "MMM d, yyyy")}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}