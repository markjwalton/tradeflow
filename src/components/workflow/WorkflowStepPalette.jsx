import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CheckSquare,
  Flag,
  GitBranch,
  UserCheck,
  FileText,
  ListChecks,
  Plug,
  Bell,
  Clock,
} from "lucide-react";

const stepTypes = [
  {
    type: "task",
    label: "Task",
    icon: CheckSquare,
    color: "bg-info-50 text-info border-info/20",
    description: "A general task to complete",
  },
  {
    type: "milestone",
    label: "Milestone",
    icon: Flag,
    color: "bg-success-50 text-success border-success/20",
    description: "Mark a key achievement",
  },
  {
    type: "decision",
    label: "Decision",
    icon: GitBranch,
    color: "bg-accent/10 text-accent border-accent/20",
    description: "Branch based on a decision",
  },
  {
    type: "approval",
    label: "Approval",
    icon: UserCheck,
    color: "bg-warning/10 text-warning border-warning/20",
    description: "Requires approval to proceed",
  },
  {
    type: "form",
    label: "Form",
    icon: FileText,
    color: "bg-info-50 text-info border-info/20",
    description: "Capture data via a form",
  },
  {
    type: "checklist",
    label: "Checklist",
    icon: ListChecks,
    color: "bg-primary-100 text-primary border-primary/20",
    description: "Complete a checklist",
  },
  {
    type: "integration",
    label: "Integration",
    icon: Plug,
    color: "bg-accent-100 text-accent border-accent/20",
    description: "Trigger external action",
  },
  {
    type: "notification",
    label: "Notification",
    icon: Bell,
    color: "bg-warning/10 text-warning border-warning/20",
    description: "Send a notification",
  },
  {
    type: "wait",
    label: "Wait",
    icon: Clock,
    color: "bg-muted text-muted-foreground border-border",
    description: "Wait for time or event",
  },
];

export default function WorkflowStepPalette({ onAddStep }) {
  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-3 border-b border-border">
        <h3 className="font-semibold text-sm text-foreground">Add Step</h3>
        <p className="text-xs text-muted-foreground">Click to add to workflow</p>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {stepTypes.map((step) => {
            const Icon = step.icon;
            return (
              <button
                key={step.type}
                onClick={() => onAddStep(step.type)}
                className={`w-full p-3 rounded-lg border text-left transition-all hover:shadow-md ${step.color}`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="font-medium text-sm">{step.label}</span>
                </div>
                <p className="text-xs mt-1 opacity-80">{step.description}</p>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

export { stepTypes };