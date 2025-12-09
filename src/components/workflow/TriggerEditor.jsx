import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Zap, Mail, Bell, FileText, Database, Clock } from "lucide-react";

const actionTypes = [
  { type: "send_email", label: "Send Email", icon: Mail },
  { type: "send_notification", label: "Send Notification", icon: Bell },
  { type: "create_task", label: "Create Task", icon: FileText },
  { type: "update_entity", label: "Update Entity", icon: Database },
  { type: "schedule_reminder", label: "Schedule Reminder", icon: Clock },
  { type: "webhook", label: "Call Webhook", icon: Zap },
];

const triggerEvents = [
  { value: "on_step_start", label: "When Step Starts" },
  { value: "on_step_complete", label: "When Step Completes" },
  { value: "on_step_fail", label: "When Step Fails" },
  { value: "on_approval", label: "On Approval" },
  { value: "on_rejection", label: "On Rejection" },
  { value: "on_overdue", label: "When Overdue" },
];

export default function TriggerEditor({ triggers = [], onChange }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const addTrigger = () => {
    onChange([
      ...triggers,
      {
        triggerId: `trigger_${Date.now()}`,
        event: "on_step_complete",
        actions: [],
        isActive: true,
      },
    ]);
    setExpandedIndex(triggers.length);
  };

  const updateTrigger = (index, updates) => {
    const newTriggers = [...triggers];
    newTriggers[index] = { ...newTriggers[index], ...updates };
    onChange(newTriggers);
  };

  const deleteTrigger = (index) => {
    onChange(triggers.filter((_, i) => i !== index));
    setExpandedIndex(null);
  };

  const addAction = (triggerIndex) => {
    const trigger = triggers[triggerIndex];
    updateTrigger(triggerIndex, {
      actions: [
        ...(trigger.actions || []),
        {
          actionId: `action_${Date.now()}`,
          type: "send_notification",
          config: {},
        },
      ],
    });
  };

  const updateAction = (triggerIndex, actionIndex, updates) => {
    const trigger = triggers[triggerIndex];
    const newActions = [...(trigger.actions || [])];
    newActions[actionIndex] = { ...newActions[actionIndex], ...updates };
    updateTrigger(triggerIndex, { actions: newActions });
  };

  const deleteAction = (triggerIndex, actionIndex) => {
    const trigger = triggers[triggerIndex];
    const newActions = (trigger.actions || []).filter((_, i) => i !== actionIndex);
    updateTrigger(triggerIndex, { actions: newActions });
  };

  const renderActionConfig = (triggerIndex, actionIndex, action) => {
    switch (action.type) {
      case "send_email":
        return (
          <div className="space-y-2 mt-2">
            <div>
              <Label className="text-xs">To (use {"{"}assignee.email{"}"} for dynamic)</Label>
              <Input
                value={action.config?.to || ""}
                onChange={(e) =>
                  updateAction(triggerIndex, actionIndex, {
                    config: { ...action.config, to: e.target.value },
                  })
                }
                placeholder="{{assignee.email}}"
              />
            </div>
            <div>
              <Label className="text-xs">Subject</Label>
              <Input
                value={action.config?.subject || ""}
                onChange={(e) =>
                  updateAction(triggerIndex, actionIndex, {
                    config: { ...action.config, subject: e.target.value },
                  })
                }
                placeholder="Task assigned: {{task.title}}"
              />
            </div>
            <div>
              <Label className="text-xs">Body</Label>
              <Textarea
                value={action.config?.body || ""}
                onChange={(e) =>
                  updateAction(triggerIndex, actionIndex, {
                    config: { ...action.config, body: e.target.value },
                  })
                }
                rows={3}
                placeholder="Hello {{assignee.name}},\n\nYou have been assigned..."
              />
            </div>
          </div>
        );

      case "send_notification":
        return (
          <div className="space-y-2 mt-2">
            <div>
              <Label className="text-xs">Recipients</Label>
              <Select
                value={action.config?.recipients || "assignee"}
                onValueChange={(v) =>
                  updateAction(triggerIndex, actionIndex, {
                    config: { ...action.config, recipients: v },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="assignee">Assignee</SelectItem>
                  <SelectItem value="requester">Requester</SelectItem>
                  <SelectItem value="admins">All Admins</SelectItem>
                  <SelectItem value="custom">Custom List</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Message</Label>
              <Input
                value={action.config?.message || ""}
                onChange={(e) =>
                  updateAction(triggerIndex, actionIndex, {
                    config: { ...action.config, message: e.target.value },
                  })
                }
                placeholder="{{step.name}} has been completed"
              />
            </div>
          </div>
        );

      case "create_task":
        return (
          <div className="space-y-2 mt-2">
            <div>
              <Label className="text-xs">Task Title</Label>
              <Input
                value={action.config?.title || ""}
                onChange={(e) =>
                  updateAction(triggerIndex, actionIndex, {
                    config: { ...action.config, title: e.target.value },
                  })
                }
                placeholder="Follow-up: {{entity.name}}"
              />
            </div>
            <div>
              <Label className="text-xs">Assign To</Label>
              <Select
                value={action.config?.assignTo || "same"}
                onValueChange={(v) =>
                  updateAction(triggerIndex, actionIndex, {
                    config: { ...action.config, assignTo: v },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="same">Same Assignee</SelectItem>
                  <SelectItem value="requester">Original Requester</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Due In (days)</Label>
              <Input
                type="number"
                value={action.config?.dueInDays || ""}
                onChange={(e) =>
                  updateAction(triggerIndex, actionIndex, {
                    config: { ...action.config, dueInDays: parseInt(e.target.value) },
                  })
                }
                placeholder="3"
              />
            </div>
          </div>
        );

      case "update_entity":
        return (
          <div className="space-y-2 mt-2">
            <div>
              <Label className="text-xs">Entity Type</Label>
              <Select
                value={action.config?.entityType || ""}
                onValueChange={(v) =>
                  updateAction(triggerIndex, actionIndex, {
                    config: { ...action.config, entityType: v },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Enquiry">Enquiry</SelectItem>
                  <SelectItem value="Project">Project</SelectItem>
                  <SelectItem value="Customer">Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Field to Update</Label>
              <Input
                value={action.config?.field || ""}
                onChange={(e) =>
                  updateAction(triggerIndex, actionIndex, {
                    config: { ...action.config, field: e.target.value },
                  })
                }
                placeholder="status"
              />
            </div>
            <div>
              <Label className="text-xs">New Value</Label>
              <Input
                value={action.config?.value || ""}
                onChange={(e) =>
                  updateAction(triggerIndex, actionIndex, {
                    config: { ...action.config, value: e.target.value },
                  })
                }
                placeholder="in_progress"
              />
            </div>
          </div>
        );

      case "schedule_reminder":
        return (
          <div className="space-y-2 mt-2">
            <div>
              <Label className="text-xs">Remind After (hours)</Label>
              <Input
                type="number"
                value={action.config?.delayHours || ""}
                onChange={(e) =>
                  updateAction(triggerIndex, actionIndex, {
                    config: { ...action.config, delayHours: parseInt(e.target.value) },
                  })
                }
                placeholder="24"
              />
            </div>
            <div>
              <Label className="text-xs">Message</Label>
              <Input
                value={action.config?.message || ""}
                onChange={(e) =>
                  updateAction(triggerIndex, actionIndex, {
                    config: { ...action.config, message: e.target.value },
                  })
                }
                placeholder="Reminder: {{task.title}} is pending"
              />
            </div>
          </div>
        );

      case "webhook":
        return (
          <div className="space-y-2 mt-2">
            <div>
              <Label className="text-xs">Webhook URL</Label>
              <Input
                value={action.config?.url || ""}
                onChange={(e) =>
                  updateAction(triggerIndex, actionIndex, {
                    config: { ...action.config, url: e.target.value },
                  })
                }
                placeholder="https://api.example.com/webhook"
              />
            </div>
            <div>
              <Label className="text-xs">Method</Label>
              <Select
                value={action.config?.method || "POST"}
                onValueChange={(v) =>
                  updateAction(triggerIndex, actionIndex, {
                    config: { ...action.config, method: v },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Automated Triggers</Label>
        <Button size="sm" variant="outline" onClick={addTrigger}>
          <Plus className="h-3 w-3 mr-1" />
          Add Trigger
        </Button>
      </div>

      {triggers.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground text-sm border border-border rounded-lg bg-muted/50">
          No triggers configured
        </div>
      ) : (
        <div className="space-y-2">
          {triggers.map((trigger, triggerIndex) => (
            <Card key={trigger.triggerId} className="overflow-hidden">
              <CardHeader
                className="py-2 px-3 cursor-pointer hover:bg-muted/50"
                onClick={() =>
                  setExpandedIndex(expandedIndex === triggerIndex ? null : triggerIndex)
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-warning" />
                    <span className="font-medium text-sm">
                      {triggerEvents.find((e) => e.value === trigger.event)?.label || trigger.event}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {trigger.actions?.length || 0} actions
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={trigger.isActive !== false}
                      onCheckedChange={(v) => updateTrigger(triggerIndex, { isActive: v })}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTrigger(triggerIndex);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {expandedIndex === triggerIndex && (
                <CardContent className="pt-0 pb-3 px-3 border-t">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs">Trigger Event</Label>
                      <Select
                        value={trigger.event}
                        onValueChange={(v) => updateTrigger(triggerIndex, { event: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {triggerEvents.map((e) => (
                            <SelectItem key={e.value} value={e.value}>
                              {e.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs">Actions</Label>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-xs"
                          onClick={() => addAction(triggerIndex)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                      </div>

                      {(trigger.actions || []).length === 0 ? (
                        <p className="text-xs text-muted-foreground">No actions configured</p>
                      ) : (
                        <div className="space-y-2">
                          {(trigger.actions || []).map((action, actionIndex) => {
                            const actionType = actionTypes.find((a) => a.type === action.type);
                            const Icon = actionType?.icon || Zap;
                            return (
                              <div
                                key={action.actionId}
                                className="border border-border rounded p-2 bg-muted/50"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Icon className="h-3 w-3 text-muted-foreground" />
                                    <Select
                                      value={action.type}
                                      onValueChange={(v) =>
                                        updateAction(triggerIndex, actionIndex, { type: v, config: {} })
                                      }
                                    >
                                      <SelectTrigger className="h-7 text-xs w-40">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {actionTypes.map((a) => (
                                          <SelectItem key={a.type} value={a.type}>
                                            {a.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 text-destructive"
                                    onClick={() => deleteAction(triggerIndex, actionIndex)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                                {renderActionConfig(triggerIndex, actionIndex, action)}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}