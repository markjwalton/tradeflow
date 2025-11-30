import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Plus, Trash2, Save } from "lucide-react";

export default function WorkflowStepEditor({
  step,
  formTemplates,
  checklistTemplates,
  allSteps,
  onUpdate,
  onDelete,
  onClose,
}) {
  const [editedStep, setEditedStep] = useState(step);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setEditedStep(step);
    setHasChanges(false);
  }, [step]);

  const handleChange = (field, value) => {
    setEditedStep((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onUpdate(editedStep);
    setHasChanges(false);
  };

  const addDecisionOption = () => {
    const options = editedStep.decisionOptions || [];
    handleChange("decisionOptions", [
      ...options,
      { label: "", nextStep: "", condition: {} },
    ]);
  };

  const updateDecisionOption = (index, field, value) => {
    const options = [...(editedStep.decisionOptions || [])];
    options[index] = { ...options[index], [field]: value };
    handleChange("decisionOptions", options);
  };

  const removeDecisionOption = (index) => {
    const options = [...(editedStep.decisionOptions || [])];
    options.splice(index, 1);
    handleChange("decisionOptions", options);
  };

  const addTrigger = () => {
    const triggers = editedStep.triggers || [];
    handleChange("triggers", [
      ...triggers,
      { event: "on_complete", action: "send_notification", actionConfig: {} },
    ]);
  };

  const updateTrigger = (index, field, value) => {
    const triggers = [...(editedStep.triggers || [])];
    triggers[index] = { ...triggers[index], [field]: value };
    handleChange("triggers", triggers);
  };

  const removeTrigger = (index) => {
    const triggers = [...(editedStep.triggers || [])];
    triggers.splice(index, 1);
    handleChange("triggers", triggers);
  };

  const otherSteps = allSteps.filter((s) => s.id !== step.id);

  return (
    <div className="w-96 bg-white border-l flex flex-col">
      {/* Header */}
      <div className="p-3 border-b flex items-center justify-between">
        <h3 className="font-semibold">Edit Step</h3>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Button size="sm" onClick={handleSave}>
              <Save className="h-3 w-3 mr-1" />
              Save
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <Tabs defaultValue="basic" className="p-3">
          <TabsList className="w-full">
            <TabsTrigger value="basic" className="flex-1">
              Basic
            </TabsTrigger>
            <TabsTrigger value="assignment" className="flex-1">
              Assignment
            </TabsTrigger>
            <TabsTrigger value="actions" className="flex-1">
              Actions
            </TabsTrigger>
          </TabsList>

          {/* Basic Tab */}
          <TabsContent value="basic" className="space-y-4 mt-4">
            <div>
              <Label>Step Name</Label>
              <Input
                value={editedStep.name || ""}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </div>

            <div>
              <Label>Code</Label>
              <Input
                value={editedStep.code || ""}
                onChange={(e) =>
                  handleChange(
                    "code",
                    e.target.value.toLowerCase().replace(/\s+/g, "_")
                  )
                }
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={editedStep.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={2}
              />
            </div>

            <div>
              <Label>Instructions for Assignee</Label>
              <Textarea
                value={editedStep.instructions || ""}
                onChange={(e) => handleChange("instructions", e.target.value)}
                rows={3}
                placeholder="Detailed instructions for completing this step..."
              />
            </div>

            <div>
              <Label>Estimated Duration (hours)</Label>
              <Input
                type="number"
                value={editedStep.estimatedDurationHours || ""}
                onChange={(e) =>
                  handleChange(
                    "estimatedDurationHours",
                    parseFloat(e.target.value) || null
                  )
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Required Step</Label>
              <Switch
                checked={editedStep.isRequired !== false}
                onCheckedChange={(v) => handleChange("isRequired", v)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Can Skip</Label>
              <Switch
                checked={editedStep.canSkip === true}
                onCheckedChange={(v) => handleChange("canSkip", v)}
              />
            </div>

            {/* Form Template Selection */}
            {(editedStep.stepType === "form" ||
              editedStep.stepType === "task") && (
              <div>
                <Label>Form Template</Label>
                <Select
                  value={editedStep.formTemplateId || "none"}
                  onValueChange={(v) =>
                    handleChange("formTemplateId", v === "none" ? null : v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select form..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No form</SelectItem>
                    {formTemplates.map((form) => (
                      <SelectItem key={form.id} value={form.id}>
                        {form.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Checklist Template Selection */}
            {(editedStep.stepType === "checklist" ||
              editedStep.stepType === "task") && (
              <div>
                <Label>Checklist Template</Label>
                <Select
                  value={editedStep.checklistTemplateId || "none"}
                  onValueChange={(v) =>
                    handleChange("checklistTemplateId", v === "none" ? null : v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select checklist..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No checklist</SelectItem>
                    {checklistTemplates.map((cl) => (
                      <SelectItem key={cl.id} value={cl.id}>
                        {cl.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Decision Options */}
            {editedStep.stepType === "decision" && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Decision Options</Label>
                  <Button size="sm" variant="outline" onClick={addDecisionOption}>
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {(editedStep.decisionOptions || []).map((opt, i) => (
                    <Card key={i} className="p-2">
                      <div className="space-y-2">
                        <Input
                          placeholder="Option label"
                          value={opt.label || ""}
                          onChange={(e) =>
                            updateDecisionOption(i, "label", e.target.value)
                          }
                        />
                        <Select
                          value={opt.nextStep || ""}
                          onValueChange={(v) =>
                            updateDecisionOption(i, "nextStep", v)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Go to step..." />
                          </SelectTrigger>
                          <SelectContent>
                            {otherSteps.map((s) => (
                              <SelectItem key={s.id} value={s.code}>
                                {s.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-full text-red-500"
                          onClick={() => removeDecisionOption(i)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Next Step */}
            {editedStep.stepType !== "decision" && (
              <div>
                <Label>Next Step on Complete</Label>
                <Select
                  value={editedStep.nextStepOnComplete || "auto"}
                  onValueChange={(v) =>
                    handleChange("nextStepOnComplete", v === "auto" ? null : v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Auto (next in sequence)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto (next in sequence)</SelectItem>
                    {otherSteps.map((s) => (
                      <SelectItem key={s.id} value={s.code}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </TabsContent>

          {/* Assignment Tab */}
          <TabsContent value="assignment" className="space-y-4 mt-4">
            <div>
              <Label>Assignee Type</Label>
              <Select
                value={editedStep.assigneeType || "user"}
                onValueChange={(v) => handleChange("assigneeType", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Specific User</SelectItem>
                  <SelectItem value="role">Role</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                  <SelectItem value="auto">Auto-assign</SelectItem>
                  <SelectItem value="requester">Workflow Requester</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {editedStep.assigneeType === "user" && (
              <div>
                <Label>Assignee User ID</Label>
                <Input
                  value={editedStep.assigneeValue || ""}
                  onChange={(e) => handleChange("assigneeValue", e.target.value)}
                  placeholder="User ID or email"
                />
              </div>
            )}

            {editedStep.assigneeType === "role" && (
              <div>
                <Label>Role</Label>
                <Select
                  value={editedStep.assigneeValue || ""}
                  onValueChange={(v) => handleChange("assigneeValue", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="designer">Designer</SelectItem>
                    <SelectItem value="surveyor">Surveyor</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="installer">Installer</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions" className="space-y-4 mt-4">
            <div className="flex items-center justify-between mb-2">
              <Label>Triggers & Actions</Label>
              <Button size="sm" variant="outline" onClick={addTrigger}>
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </div>

            <div className="space-y-3">
              {(editedStep.triggers || []).map((trigger, i) => (
                <Card key={i} className="p-3">
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs">When</Label>
                      <Select
                        value={trigger.event || "on_complete"}
                        onValueChange={(v) => updateTrigger(i, "event", v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="on_complete">Step Completes</SelectItem>
                          <SelectItem value="on_start">Step Starts</SelectItem>
                          <SelectItem value="on_overdue">Step Overdue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs">Then</Label>
                      <Select
                        value={trigger.action || "send_notification"}
                        onValueChange={(v) => updateTrigger(i, "action", v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="send_notification">
                            Send Notification
                          </SelectItem>
                          <SelectItem value="send_email">Send Email</SelectItem>
                          <SelectItem value="update_entity">Update Entity</SelectItem>
                          <SelectItem value="create_task">Create Task</SelectItem>
                          <SelectItem value="create_purchase_order">
                            Create Purchase Order
                          </SelectItem>
                          <SelectItem value="schedule_resource">
                            Schedule Resource
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full text-red-500"
                      onClick={() => removeTrigger(i)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Remove
                    </Button>
                  </div>
                </Card>
              ))}

              {(!editedStep.triggers || editedStep.triggers.length === 0) && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No triggers configured. Add triggers to automate actions when
                  this step starts or completes.
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t">
        <Button
          variant="destructive"
          size="sm"
          className="w-full"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Step
        </Button>
      </div>
    </div>
  );
}