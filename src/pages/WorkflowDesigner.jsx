import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Loader2,
  Save,
  Play,
  ArrowLeft,
  Settings,
  Trash2,
  Copy,
  Eye,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

import WorkflowCanvas from "@/components/workflow/WorkflowCanvas";
import WorkflowStepPalette from "@/components/workflow/WorkflowStepPalette";
import WorkflowStepEditor from "@/components/workflow/WorkflowStepEditor";
import WorkflowSettings from "@/components/workflow/WorkflowSettings";
import AIWorkflowGenerator from "@/components/workflow/AIWorkflowGenerator";

export default function WorkflowDesigner() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const workflowId = urlParams.get("id");

  const [selectedStepId, setSelectedStepId] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showNewDialog, setShowNewDialog] = useState(!workflowId);
  const [viewMode, setViewMode] = useState("canvas"); // "canvas" or "ai-generator"
  const [newWorkflow, setNewWorkflow] = useState({
    name: "",
    code: "",
    description: "",
    category: "project",
    triggerEntity: "",
    triggerEvent: "manual",
  });

  // Fetch workflow
  const { data: workflow, isLoading: loadingWorkflow } = useQuery({
    queryKey: ["workflow", workflowId],
    queryFn: async () => {
      if (!workflowId) return null;
      const workflows = await base44.entities.Workflow.filter({ id: workflowId });
      return workflows[0] || null;
    },
    enabled: !!workflowId,
  });

  // Fetch steps
  const { data: steps = [], isLoading: loadingSteps } = useQuery({
    queryKey: ["workflowSteps", workflowId],
    queryFn: () => base44.entities.WorkflowStep.filter({ workflowId }),
    enabled: !!workflowId,
  });

  // Fetch form templates for step configuration
  const { data: formTemplates = [] } = useQuery({
    queryKey: ["formTemplates"],
    queryFn: () => base44.entities.FormTemplate.list(),
  });

  // Fetch checklist templates
  const { data: checklistTemplates = [] } = useQuery({
    queryKey: ["checklistTemplates"],
    queryFn: () => base44.entities.ChecklistTemplate.list(),
  });

  const selectedStep = steps.find((s) => s.id === selectedStepId);

  // Mutations
  const createWorkflowMutation = useMutation({
    mutationFn: (data) => base44.entities.Workflow.create(data),
    onSuccess: (newWorkflow) => {
      const url = new URL(window.location.href);
      url.searchParams.set("id", newWorkflow.id);
      window.history.replaceState({}, "", url);
      queryClient.invalidateQueries({ queryKey: ["workflow"] });
      setShowNewDialog(false);
      toast.success("Workflow created");
    },
  });

  const updateWorkflowMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Workflow.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflow", workflowId] });
      toast.success("Workflow updated");
    },
  });

  const createStepMutation = useMutation({
    mutationFn: (data) => base44.entities.WorkflowStep.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflowSteps", workflowId] });
    },
  });

  const updateStepMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.WorkflowStep.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflowSteps", workflowId] });
    },
  });

  const deleteStepMutation = useMutation({
    mutationFn: (id) => base44.entities.WorkflowStep.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflowSteps", workflowId] });
      setSelectedStepId(null);
    },
  });

  const handleCreateWorkflow = () => {
    if (!newWorkflow.name || !newWorkflow.code) {
      toast.error("Name and code are required");
      return;
    }
    createWorkflowMutation.mutate(newWorkflow);
  };

  const handleAddStep = (stepType) => {
    const nextStepNumber = steps.length + 1;
    createStepMutation.mutate({
      workflowId,
      name: `Step ${nextStepNumber}`,
      code: `step_${nextStepNumber}`,
      stepNumber: nextStepNumber,
      stepType,
      assigneeType: "user",
      isRequired: true,
      canSkip: false,
    });
  };

  const handleUpdateStep = (stepId, data) => {
    updateStepMutation.mutate({ id: stepId, data });
  };

  const handleDeleteStep = (stepId) => {
    deleteStepMutation.mutate(stepId);
  };

  const handleReorderSteps = async (reorderedSteps) => {
    for (let i = 0; i < reorderedSteps.length; i++) {
      await base44.entities.WorkflowStep.update(reorderedSteps[i].id, {
        stepNumber: i + 1,
      });
    }
    queryClient.invalidateQueries({ queryKey: ["workflowSteps", workflowId] });
  };

  const handleAIGenerate = async (generated) => {
    if (!workflowId) {
      // Create workflow first
      const newWf = await base44.entities.Workflow.create({
        name: generated.workflowName,
        code: generated.workflowName.toLowerCase().replace(/\s+/g, "_"),
        description: generated.workflowDescription,
        category: generated.category || "project",
        estimatedDurationDays: generated.estimatedTotalDays,
      });
      const url = new URL(window.location.href);
      url.searchParams.set("id", newWf.id);
      window.history.replaceState({}, "", url);
      
      // Create steps
      for (let i = 0; i < generated.steps.length; i++) {
        const step = generated.steps[i];
        await base44.entities.WorkflowStep.create({
          workflowId: newWf.id,
          name: step.name,
          code: step.code,
          description: step.description,
          stepNumber: i + 1,
          stepType: step.stepType || "task",
          assigneeType: step.assigneeType || "user",
          assigneeValue: step.assigneeRole || "",
          estimatedDurationHours: step.estimatedDurationHours,
          instructions: step.instructions,
          isRequired: step.isRequired !== false,
          canSkip: step.canSkip === true,
          decisionOptions: step.decisionOptions,
          triggers: step.triggers?.map(t => ({
            triggerId: `trigger_${Date.now()}_${Math.random()}`,
            event: t.event,
            actions: [{ actionId: `action_${Date.now()}`, type: t.action, config: {} }],
            isActive: true,
          })),
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ["workflow"] });
      queryClient.invalidateQueries({ queryKey: ["workflowSteps"] });
      setShowNewDialog(false);
      toast.success("Workflow generated!");
    } else {
      // Add steps to existing workflow
      const startNumber = steps.length + 1;
      for (let i = 0; i < generated.steps.length; i++) {
        const step = generated.steps[i];
        await base44.entities.WorkflowStep.create({
          workflowId,
          name: step.name,
          code: step.code,
          description: step.description,
          stepNumber: startNumber + i,
          stepType: step.stepType || "task",
          assigneeType: step.assigneeType || "user",
          assigneeValue: step.assigneeRole || "",
          estimatedDurationHours: step.estimatedDurationHours,
          instructions: step.instructions,
          isRequired: step.isRequired !== false,
          canSkip: step.canSkip === true,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["workflowSteps", workflowId] });
      toast.success(`Added ${generated.steps.length} steps!`);
    }
  };

  if (!workflowId && !showNewDialog) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--color-background)]">
        <Card className="w-96 border-[var(--color-background-muted)] bg-[var(--color-background-paper)]">
          <CardHeader>
            <CardTitle className="text-[var(--color-midnight)]">No Workflow Selected</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => setShowNewDialog(true)} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Create New Workflow
            </Button>
            <Link to={createPageUrl("WorkflowLibrary")}>
              <Button variant="outline" className="w-full">
                Browse Existing Workflows
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[var(--color-background)]">
      {/* Header */}
      <div className="bg-[var(--color-background-paper)] border-b border-[var(--color-background-muted)] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={createPageUrl("WorkflowLibrary")}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-[var(--color-midnight)]">
              {workflow?.name || "New Workflow"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {workflow?.code && <Badge variant="outline">{workflow.code}</Badge>}
              {workflow?.category && (
                <Badge className="ml-2" variant="secondary">
                  {workflow.category}
                </Badge>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </Button>
          <Button
            variant={viewMode === "ai-generator" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode(viewMode === "ai-generator" ? "canvas" : "ai-generator")}
          >
            <Sparkles className="h-4 w-4 mr-1" />
            {viewMode === "ai-generator" ? "Back to Canvas" : "AI Generate"}
          </Button>
          <Button
            size="sm"
            onClick={() => {
              if (!workflowId) {
                toast.error("Create a workflow first");
                return;
              }
              updateWorkflowMutation.mutate({
                id: workflowId,
                data: { isActive: true },
              });
            }}
            disabled={!workflowId || updateWorkflowMutation.isPending}
          >
            {updateWorkflowMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-1" />
            )}
            Save & Publish
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {viewMode === "canvas" ? (
          <>
            {/* Step Palette */}
            <WorkflowStepPalette onAddStep={handleAddStep} />

            {/* Canvas */}
            <div className="flex-1 overflow-auto p-4">
              {loadingWorkflow || loadingSteps ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-[var(--color-charcoal)]" />
                </div>
              ) : (
                <WorkflowCanvas
                  steps={steps.sort((a, b) => a.stepNumber - b.stepNumber)}
                  selectedStepId={selectedStepId}
                  onSelectStep={setSelectedStepId}
                  onReorderSteps={handleReorderSteps}
                  onDeleteStep={handleDeleteStep}
                  formTemplates={formTemplates}
                  checklistTemplates={checklistTemplates}
                />
              )}
            </div>

            {/* Step Editor Panel */}
            {selectedStep && (
              <WorkflowStepEditor
                step={selectedStep}
                formTemplates={formTemplates}
                checklistTemplates={checklistTemplates}
                allSteps={steps}
                onUpdate={(data) => handleUpdateStep(selectedStep.id, data)}
                onDelete={() => handleDeleteStep(selectedStep.id)}
                onClose={() => setSelectedStepId(null)}
              />
            )}
          </>
        ) : (
          <AIWorkflowGenerator
            embedded={true}
            onGenerate={(generated) => {
              handleAIGenerate(generated);
              setViewMode("canvas");
            }}
            onCancel={() => setViewMode("canvas")}
          />
        )}
      </div>

      {/* New Workflow Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Workflow</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Workflow Name *</label>
              <Input
                value={newWorkflow.name}
                onChange={(e) =>
                  setNewWorkflow({ ...newWorkflow, name: e.target.value })
                }
                placeholder="e.g., Bespoke Furniture Project"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Code *</label>
              <Input
                value={newWorkflow.code}
                onChange={(e) =>
                  setNewWorkflow({
                    ...newWorkflow,
                    code: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                  })
                }
                placeholder="e.g., bespoke_furniture"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Unique identifier for this workflow
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <Select
                value={newWorkflow.category}
                onValueChange={(v) =>
                  setNewWorkflow({ ...newWorkflow, category: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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
            <div>
              <label className="text-sm font-medium">Trigger Entity</label>
              <Select
                value={newWorkflow.triggerEntity}
                onValueChange={(v) =>
                  setNewWorkflow({ ...newWorkflow, triggerEntity: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select entity..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Enquiry">Enquiry</SelectItem>
                  <SelectItem value="Project">Project</SelectItem>
                  <SelectItem value="Customer">Customer</SelectItem>
                  <SelectItem value="PurchaseOrder">Purchase Order</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Trigger Event</label>
              <Select
                value={newWorkflow.triggerEvent}
                onValueChange={(v) =>
                  setNewWorkflow({ ...newWorkflow, triggerEvent: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual Start</SelectItem>
                  <SelectItem value="on_create">On Create</SelectItem>
                  <SelectItem value="on_update">On Update</SelectItem>
                  <SelectItem value="on_status_change">On Status Change</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={newWorkflow.description}
                onChange={(e) =>
                  setNewWorkflow({ ...newWorkflow, description: e.target.value })
                }
                placeholder="Describe this workflow..."
                rows={3}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleCreateWorkflow}
                disabled={createWorkflowMutation.isPending}
                className="flex-1"
              >
                {createWorkflowMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Create Workflow
              </Button>
              <Link to={createPageUrl("WorkflowLibrary")}>
                <Button variant="outline">Cancel</Button>
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <WorkflowSettings
        open={showSettings}
        onOpenChange={setShowSettings}
        workflow={workflow}
        onUpdate={(data) =>
          updateWorkflowMutation.mutate({ id: workflowId, data })
        }
      />

    </div>
  );
}