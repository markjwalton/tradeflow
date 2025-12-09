import React from "react";
import { AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import LayoutRenderer from "@/components/layout-system/LayoutRenderer";

// Mock prefilled project for edit mode
const mockProjectData = {
  project: {
    name: "Garden Room – Oak Frame",
    description: "Bespoke oak-framed garden room with glazed gables and slate roof.",
    projectRef: "PRJ-2025-DEBUG",
    status: "Active",
    projectType: "New Build",
    isHighPriority: true,
    customerId: "cust-1",
    clientName: "Jane Smith",
    clientEmail: "jane@example.com",
    clientPhone: "01234 567890",
    location: "12 Oak Lane, Greenfield, GL5 4AB",
    startDate: "2025-01-15",
    estimatedEndDate: "2025-06-30",
    budget: 38000,
    notes: "Planning permission submitted. Client excited about the project!"
  }
};

// Layout configuration using project_editor_full pattern
const layoutConfig = {
  patternId: "project_editor_full",
  entity: "Project",
  mode: "edit",
  pageHeader: {
    title: "Edit Project",
    subtitle: "Update project details"
  },
  layout: "twoColumn",
  sections: [
    {
      id: "basic",
      title: "Basic Information",
      description: "Core project details",
      fields: [
        {
          id: "name",
          label: "Project Name",
          component: "TextField",
          binding: "project.name",
          required: true
        },
        {
          id: "projectRef",
          label: "Project Reference",
          component: "TextField",
          binding: "project.projectRef"
        },
        {
          id: "description",
          label: "Description",
          component: "TextAreaField",
          binding: "project.description"
        },
        {
          id: "projectType",
          label: "Project Type",
          component: "SelectField",
          binding: "project.projectType",
          options: [
            { value: "New Build", label: "New Build" },
            { value: "Extension", label: "Extension" },
            { value: "Renovation", label: "Renovation" },
            { value: "Conservation", label: "Conservation" },
            { value: "Commercial", label: "Commercial" }
          ]
        },
        {
          id: "status",
          label: "Status",
          component: "SelectField",
          binding: "project.status",
          required: true,
          options: [
            { value: "Planning", label: "Planning" },
            { value: "Active", label: "Active" },
            { value: "On Hold", label: "On Hold" },
            { value: "Completed", label: "Completed" },
            { value: "Archived", label: "Archived" }
          ]
        },
        {
          id: "location",
          label: "Location",
          component: "TextField",
          binding: "project.location"
        },
        {
          id: "isHighPriority",
          label: "High Priority Project",
          component: "CheckboxField",
          binding: "project.isHighPriority"
        }
      ]
    },
    {
      id: "customer",
      title: "Customer Details",
      fields: [
        {
          id: "clientName",
          label: "Client Name",
          component: "TextField",
          binding: "project.clientName"
        },
        {
          id: "clientEmail",
          label: "Client Email",
          component: "TextField",
          binding: "project.clientEmail"
        },
        {
          id: "clientPhone",
          label: "Client Phone",
          component: "TextField",
          binding: "project.clientPhone"
        }
      ]
    },
    {
      id: "timeline",
      title: "Timeline & Budget",
      fields: [
        {
          id: "startDate",
          label: "Start Date",
          component: "DatePickerField",
          binding: "project.startDate"
        },
        {
          id: "estimatedEndDate",
          label: "Estimated End Date",
          component: "DatePickerField",
          binding: "project.estimatedEndDate"
        },
        {
          id: "budget",
          label: "Budget (£)",
          component: "NumberField",
          binding: "project.budget"
        }
      ]
    },
    {
      id: "notes",
      title: "Additional Notes",
      fields: [
        {
          id: "notes",
          label: "Notes",
          component: "TextAreaField",
          binding: "project.notes",
          helpText: "Any additional notes or internal communications"
        }
      ]
    }
  ],
  actions: {
    primary: {
      label: "Update Project",
      actionId: "project.update"
    },
    secondary: [
      {
        label: "Cancel",
        actionId: "navigation.back",
        variant: "outline"
      }
    ]
  }
};

export default function DebugProjectEditor() {
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get("mode") || "edit";

  const handleAction = (actionId, data) => {
    console.log("Action triggered:", actionId, data);
    
    if (actionId === "navigation.back") {
      window.location.href = createPageUrl("DebugProjectWorkspace");
      return;
    }
    
    alert(`Action: ${actionId}\n\nThis is debug mode - no actual database updates.\n\nData would be:\n${JSON.stringify(data, null, 2)}`);
  };

  return (
    <div>
      {/* Debug Banner */}
      <div className="p-3 bg-warning/10 border-b border-warning/20 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-warning" />
        <span className="text-warning font-medium">DEBUG MODE</span>
        <span className="text-muted-foreground text-sm">
          – {mode === "edit" ? "Edit mode with mock data" : "Create mode (empty form)"} using LayoutRenderer
        </span>
        <div className="ml-auto flex gap-2">
          <Link to={createPageUrl("DebugProjectEditor?mode=create")}>
            <Button variant="outline" size="sm">Create Mode</Button>
          </Link>
          <Link to={createPageUrl("DebugProjectEditor?mode=edit")}>
            <Button variant="outline" size="sm">Edit Mode</Button>
          </Link>
        </div>
      </div>

      {/* Render layout using the new system */}
      <LayoutRenderer
        config={mode === "create" ? { ...layoutConfig, mode: "create", pageHeader: { title: "Create New Project", subtitle: "Set up a new construction project" } } : layoutConfig}
        data={mode === "create" ? { project: {} } : mockProjectData}
        onAction={handleAction}
      />
    </div>
  );
}