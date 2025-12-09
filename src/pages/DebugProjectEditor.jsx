import React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import LayoutRenderer from "@/components/layout-system/LayoutRenderer";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";



export default function DebugProjectEditor() {
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get("mode") || "edit";

  const { data: pattern, isLoading, error } = useQuery({
    queryKey: ["layoutPattern", "project_editor_full"],
    queryFn: async () => {
      const patterns = await base44.entities.LayoutPattern.filter({ pattern_id: "project_editor_full" });
      return patterns[0];
    }
  });

  const handleAction = (actionId, data) => {
    console.log("Action triggered:", actionId, data);
    
    if (actionId === "navigation.back") {
      window.location.href = createPageUrl("DebugProjectWorkspace");
      return;
    }
    
    alert(`Action: ${actionId}\n\nThis is debug mode - no actual database updates.\n\nData would be:\n${JSON.stringify(data, null, 2)}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-destructive">Error loading pattern: {error.message}</p>
      </div>
    );
  }

  if (!pattern) {
    return (
      <div className="p-6 text-center">
        <p className="text-destructive">Pattern not found. Please create it in Layout Pattern Manager.</p>
      </div>
    );
  }

  const layoutConfig = JSON.parse(pattern.config_json);
  const sampleData = pattern.sample_data_json ? JSON.parse(pattern.sample_data_json) : { project: {} };

  return (
    <div>
      {/* Debug Banner */}
      <div className="p-3 bg-warning/10 border-b border-warning/20 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-warning" />
        <span className="text-warning font-medium">DEBUG MODE</span>
        <span className="text-muted-foreground text-sm">
          – {mode === "edit" ? "Edit mode with data from database" : "Create mode (empty form)"} using LayoutRenderer
        </span>
        <div className="ml-auto flex gap-2">
          <Link to={createPageUrl("DebugProjectEditor?mode=create")}>
            <Button variant="outline" size="sm">Create Mode</Button>
          </Link>
          <Link to={createPageUrl("DebugProjectEditor?mode=edit")}>
            <Button variant="outline" size="sm">Edit Mode</Button>
          </Link>
          <Link to={createPageUrl("LayoutPatternManager")}>
            <Button variant="outline" size="sm">Manage Pattern</Button>
          </Link>
        </div>
      </div>

      {/* Render layout using the new system */}
      <LayoutRenderer
        config={mode === "create" ? { ...layoutConfig, mode: "create", pageHeader: { title: "Create New Project", subtitle: "Set up a new construction project" } } : layoutConfig}
        data={mode === "create" ? { project: {} } : sampleData}
        onAction={handleAction}
      />
    </div>
  );
}