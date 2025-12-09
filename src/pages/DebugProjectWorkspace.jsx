import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import LayoutRenderer from "@/components/layout-system/LayoutRenderer";

// Mock data - no database calls
const mockProjectData = {
  project: {
    id: "debug-proj-1",
    name: "Garden Room – Oak Frame",
    description: "Bespoke oak-framed garden room with glazed gables and slate roof. Including electrical installation, underfloor heating, and landscaping integration.",
    projectRef: "PRJ-2025-DEBUG",
    status: "Active",
    projectType: "New Build",
    isHighPriority: true,
    customer_name: "Jane Smith",
    customer_email: "jane@example.com",
    customer_phone: "07700 900123",
    location: "12 Oak Lane, Greenfield, GL5 4AB",
    startDate: "2025-01-15",
    estimatedEndDate: "2025-06-30",
    budget: 38000,
    currentSpend: 15200,
    tasksTotal: 8,
    tasksCompleted: 2,
    tasksInProgress: 1,
    tasksBlocked: 1,
    notes: "Planning permission submitted. Client excited about the project!\n\nKey milestones:\n- Foundations: Feb 2025\n- Frame erection: March 2025\n- Completion: June 2025"
  }
};

// Layout configuration using project_workspace pattern
const layoutConfig = {
  patternId: "project_workspace",
  entity: "Project",
  pageHeader: {
    titleBinding: "project.name",
    meta: [
      { label: "Ref", binding: "project.projectRef" },
      { label: "Status", binding: "project.status" },
      { label: "Type", binding: "project.projectType" }
    ]
  },
  layout: "twoColumn",
  summary: {
    metrics: [
      {
        id: "budget",
        label: "Budget",
        valueBinding: "project.budget",
        format: "currency",
        intent: "default"
      },
      {
        id: "spent",
        label: "Spent",
        valueBinding: "project.currentSpend",
        format: "currency",
        intent: "warning"
      },
      {
        id: "tasks_completed",
        label: "Tasks Done",
        valueBinding: "project.tasksCompleted",
        format: "text",
        intent: "success"
      },
      {
        id: "tasks_total",
        label: "Total Tasks",
        valueBinding: "project.tasksTotal",
        format: "text",
        intent: "default"
      }
    ]
  },
  primarySections: [
    {
      id: "description",
      type: "notes",
      title: "Description",
      dataBinding: "project.description"
    },
    {
      id: "notes",
      type: "notes",
      title: "Project Notes",
      dataBinding: "project.notes"
    }
  ],
  secondarySections: [
    {
      id: "customer",
      type: "customer",
      title: "Customer",
      dataBinding: "project"
    },
    {
      id: "details",
      type: "notes",
      title: "Location",
      dataBinding: "project.location"
    }
  ],
  editor: {
    mode: "rightPanel",
    title: "Quick Edit Project",
    fields: [
      {
        id: "name",
        label: "Project Name",
        component: "TextField",
        binding: "project.name"
      },
      {
        id: "status",
        label: "Status",
        component: "SelectField",
        binding: "project.status",
        options: [
          { value: "Planning", label: "Planning" },
          { value: "Active", label: "Active" },
          { value: "On Hold", label: "On Hold" },
          { value: "Completed", label: "Completed" }
        ]
      },
      {
        id: "notes",
        label: "Notes",
        component: "TextAreaField",
        binding: "project.notes"
      }
    ],
    submitActionId: "project.update"
  }
};

export default function DebugProjectWorkspace() {
  const handleAction = (actionId, data) => {
    console.log("Action triggered:", actionId, data);
    alert(`Action: ${actionId}\n\nThis is debug mode - no actual database updates.\n\nData would be:\n${JSON.stringify(data, null, 2)}`);
  };

  return (
    <div>
      {/* Debug Banner */}
      <div className="p-3 bg-warning/10 border-b border-warning/20 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-warning" />
        <span className="text-warning font-medium">DEBUG MODE</span>
        <span className="text-muted-foreground text-sm">– Using static mock data with LayoutRenderer system</span>
      </div>

      {/* Render layout using the new system */}
      <LayoutRenderer
        config={layoutConfig}
        data={mockProjectData}
        onAction={handleAction}
      />
    </div>
  );
}