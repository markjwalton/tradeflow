import React from "react";
import ProjectWorkspaceRenderer from "./ProjectWorkspaceRenderer";
import ProjectEditorRenderer from "./ProjectEditorRenderer";

/**
 * Central Layout Renderer
 * Routes to the appropriate pattern renderer based on patternId
 */
export default function LayoutRenderer({ config, data, onAction }) {
  if (!config || !config.patternId) {
    return (
      <div className="p-6 text-center text-destructive">
        Invalid layout config: missing patternId
      </div>
    );
  }

  switch (config.patternId) {
    case "project_workspace":
      return <ProjectWorkspaceRenderer config={config} data={data} onAction={onAction} />;
    
    case "project_editor_full":
      return <ProjectEditorRenderer config={config} data={data} onAction={onAction} />;
    
    default:
      return (
        <div className="p-6 text-center text-destructive">
          Unknown pattern: {config.patternId}
        </div>
      );
  }
}