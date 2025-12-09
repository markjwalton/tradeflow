import React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import LayoutRenderer from "@/components/layout-system/LayoutRenderer";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function DebugProjectWorkspace() {
  const { data: pattern, isLoading, error } = useQuery({
    queryKey: ["layoutPattern", "project_workspace"],
    queryFn: async () => {
      const patterns = await base44.entities.LayoutPattern.filter({ pattern_id: "project_workspace" });
      return patterns[0];
    }
  });

  const handleAction = (actionId, data) => {
    console.log("Action triggered:", actionId, data);
    
    if (actionId === "navigation.editor") {
      window.location.href = createPageUrl("DebugProjectEditor");
      return;
    }
    
    alert(`Action: ${actionId}\n\nThis is debug mode - no actual database updates.\n\nData received:\n${JSON.stringify(data, null, 2)}`);
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
      <div className="p-6 text-center space-y-4">
        <p className="text-destructive">Pattern not found. Please create it in Layout Pattern Manager.</p>
        <Link to={createPageUrl("LayoutPatternManager")}>
          <Button>Go to Pattern Manager</Button>
        </Link>
      </div>
    );
  }

  let layoutConfig, mockProjectData;
  try {
    layoutConfig = JSON.parse(pattern.config_json);
    mockProjectData = pattern.sample_data_json ? JSON.parse(pattern.sample_data_json) : { project: {} };
  } catch (parseError) {
    return (
      <div className="p-6 text-center space-y-4">
        <p className="text-destructive">Error parsing pattern configuration: {parseError.message}</p>
        <pre className="text-left text-xs bg-muted p-4 rounded overflow-auto max-w-2xl mx-auto">
          {pattern.config_json}
        </pre>
        <Link to={createPageUrl("LayoutPatternManager")}>
          <Button>Fix in Pattern Manager</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Debug Banner */}
      <div className="p-3 bg-warning/10 border-b border-warning/20 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-warning" />
        <span className="text-warning font-medium">DEBUG MODE</span>
        <span className="text-muted-foreground text-sm">
          – Using data from LayoutPattern database
        </span>
        <div className="ml-auto">
          <Link to={createPageUrl("LayoutPatternManager")}>
            <Button variant="outline" size="sm">Manage Pattern</Button>
          </Link>
        </div>
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