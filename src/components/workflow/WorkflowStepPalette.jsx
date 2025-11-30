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
    color: "bg-blue-100 text-blue-700 border-blue-200",
    description: "A general task to complete",
  },
  {
    type: "milestone",
    label: "Milestone",
    icon: Flag,
    color: "bg-green-100 text-green-700 border-green-200",
    description: "Mark a key achievement",
  },
  {
    type: "decision",
    label: "Decision",
    icon: GitBranch,
    color: "bg-purple-100 text-purple-700 border-purple-200",
    description: "Branch based on a decision",
  },
  {
    type: "approval",
    label: "Approval",
    icon: UserCheck,
    color: "bg-amber-100 text-amber-700 border-amber-200",
    description: "Requires approval to proceed",
  },
  {
    type: "form",
    label: "Form",
    icon: FileText,
    color: "bg-cyan-100 text-cyan-700 border-cyan-200",
    description: "Capture data via a form",
  },
  {
    type: "checklist",
    label: "Checklist",
    icon: ListChecks,
    color: "bg-indigo-100 text-indigo-700 border-indigo-200",
    description: "Complete a checklist",
  },
  {
    type: "integration",
    label: "Integration",
    icon: Plug,
    color: "bg-pink-100 text-pink-700 border-pink-200",
    description: "Trigger external action",
  },
  {
    type: "notification",
    label: "Notification",
    icon: Bell,
    color: "bg-orange-100 text-orange-700 border-orange-200",
    description: "Send a notification",
  },
  {
    type: "wait",
    label: "Wait",
    icon: Clock,
    color: "bg-gray-100 text-gray-700 border-gray-200",
    description: "Wait for time or event",
  },
];

export default function WorkflowStepPalette({ onAddStep }) {
  return (
    <div className="w-64 bg-white border-r flex flex-col">
      <div className="p-3 border-b">
        <h3 className="font-semibold text-sm">Add Step</h3>
        <p className="text-xs text-gray-500">Click to add to workflow</p>
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