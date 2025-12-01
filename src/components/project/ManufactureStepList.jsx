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
  Factory,
  Calendar,
  User,
  Clock,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const statusColors = {
  Pending: "bg-stone-100 text-stone-800",
  "In Production": "bg-blue-100 text-blue-800",
  "Quality Check": "bg-yellow-100 text-yellow-800",
  Complete: "bg-green-100 text-green-800",
  "On Hold": "bg-red-100 text-red-800",
};

const emptyStep = {
  projectId: "",
  name: "",
  description: "",
  status: "Pending",
  assignedTo: "",
  startDate: "",
  dueDate: "",
  estimatedHours: "",
  actualHours: "",
  qualityNotes: "",
  order: 1,
};

export default function ManufactureStepList({ projectFilter, projects }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStep, setEditingStep] = useState(null);
  const [formData, setFormData] = useState(emptyStep);

  const queryClient = useQueryClient();

  const { data: steps = [], isLoading } = useQuery({
    queryKey: ["manufactureSteps"],
    queryFn: () => base44.entities.ManufactureStep.list("-created_date", 100),
  });

  const { data: teamMembers = [] } = useQuery({
    queryKey: ["teamMembers"],
    queryFn: () => base44.entities.TeamMember.list("-created_date", 50),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ManufactureStep.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manufactureSteps"] });
      toast.success("Manufacturing step created");
      handleCloseDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ManufactureStep.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manufactureSteps"] });
      toast.success("Manufacturing step updated");
      handleCloseDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ManufactureStep.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manufactureSteps"] });
      toast.success("Manufacturing step deleted");
    },
  });

  const handleOpenDialog = (step = null) => {
    if (step) {
      setEditingStep(step);
      setFormData({
        projectId: step.projectId || "",
        name: step.name || "",
        description: step.description || "",
        status: step.status || "Pending",
        assignedTo: step.assignedTo || "",
        startDate: step.startDate || "",
        dueDate: step.dueDate || "",
        estimatedHours: step.estimatedHours || "",
        actualHours: step.actualHours || "",
        qualityNotes: step.qualityNotes || "",
        order: step.order || 1,
      });
    } else {
      setEditingStep(null);
      setFormData(emptyStep);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingStep(null);
    setFormData(emptyStep);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSubmit = {
      ...formData,
      estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : null,
      actualHours: formData.actualHours ? parseFloat(formData.actualHours) : null,
      order: parseInt(formData.order) || 1,
    };
    if (editingStep) {
      updateMutation.mutate({ id: editingStep.id, data: dataToSubmit });
    } else {
      createMutation.mutate(dataToSubmit);
    }
  };

  const getProjectName = (projectId) => {
    return projects?.find((p) => p.id === projectId)?.name || "Unknown";
  };

  const filteredSteps = steps.filter((step) => {
    return projectFilter === "all" || step.projectId === projectFilter;
  });

  // Group by project
  const groupedSteps = filteredSteps.reduce((acc, step) => {
    const projectId = step.projectId;
    if (!acc[projectId]) acc[projectId] = [];
    acc[projectId].push(step);
    return acc;
  }, {});

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-6 w-1/3 mb-4" />
              <Skeleton className="h-16 w-full" />
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
              className="bg-amber-700 hover:bg-amber-800"
              onClick={() => handleOpenDialog()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Manufacturing Step
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingStep ? "Edit Manufacturing Step" : "Add Manufacturing Step"}
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Step Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Timber Cutting"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Order</Label>
                  <Input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                  />
                </div>
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
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="In Production">In Production</SelectItem>
                      <SelectItem value="Quality Check">Quality Check</SelectItem>
                      <SelectItem value="Complete">Complete</SelectItem>
                      <SelectItem value="On Hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Assigned To</Label>
                  <Select
                    value={formData.assignedTo}
                    onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Estimated Hours</Label>
                  <Input
                    type="number"
                    value={formData.estimatedHours}
                    onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Actual Hours</Label>
                  <Input
                    type="number"
                    value={formData.actualHours}
                    onChange={(e) => setFormData({ ...formData, actualHours: e.target.value })}
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
                  className="bg-amber-700 hover:bg-amber-800"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingStep ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {Object.keys(groupedSteps).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Factory className="h-12 w-12 text-stone-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-stone-900 mb-2">No manufacturing steps</h3>
            <p className="text-stone-500">Add your first manufacturing step to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedSteps).map(([projectId, projectSteps]) => (
            <Card key={projectId}>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-stone-900 mb-4">
                  {getProjectName(projectId)}
                </h3>
                <div className="space-y-3">
                  {projectSteps
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((step, index) => (
                      <div
                        key={step.id}
                        className="flex items-center gap-4 p-3 bg-stone-50 rounded-lg"
                      >
                        <div className="flex-shrink-0 w-8 h-8 bg-stone-200 rounded-full flex items-center justify-center text-sm font-medium">
                          {step.order || index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-stone-900">{step.name}</span>
                            <Badge className={statusColors[step.status]}>{step.status}</Badge>
                          </div>
                          <div className="flex flex-wrap gap-3 text-sm text-stone-500 mt-1">
                            {step.assignedTo && (
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {teamMembers.find((m) => m.email === step.assignedTo)?.name || step.assignedTo}
                              </span>
                            )}
                            {step.dueDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(step.dueDate), "MMM d")}
                              </span>
                            )}
                            {step.estimatedHours && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {step.actualHours || 0}/{step.estimatedHours}h
                              </span>
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenDialog(step)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => deleteMutation.mutate(step.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}