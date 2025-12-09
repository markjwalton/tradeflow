import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { getValueByBinding, formatValue, getIntentClasses } from "./utils";
import LayoutConfigEditor from "./LayoutConfigEditor";

/**
 * Renders the project_workspace pattern
 */
export default function ProjectWorkspaceRenderer({ config, data, onAction }) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [currentConfig, setCurrentConfig] = useState(config);

  const handleConfigSave = (newConfig) => {
    setCurrentConfig(newConfig);
    if (onAction) {
      onAction("config.update", { config: newConfig });
    }
  };

  // Extract page header values
  const pageTitle = getValueByBinding(data, currentConfig.pageHeader?.titleBinding);
  const metaValues = (currentConfig.pageHeader?.meta || []).map(m => ({
    label: m.label,
    value: getValueByBinding(data, m.binding)
  }));

  // Extract summary metrics
  const metrics = (currentConfig.summary?.metrics || []).map(m => ({
    ...m,
    value: getValueByBinding(data, m.valueBinding)
  }));

  const isTwoColumn = currentConfig.layout === "twoColumn";

  return (
    <div className="p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
            {pageTitle}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            {metaValues.map((meta, idx) => (
              <Badge key={idx} variant="outline">
                {meta.label}: {meta.value}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          {(currentConfig.pageHeader?.actions || []).map((action, idx) => (
            <Button
              key={idx}
              variant={action.variant || "default"}
              onClick={() => onAction?.(action.actionId, data)}
            >
              {action.label}
            </Button>
          ))}
          <Button variant="outline" onClick={() => setEditorOpen(true)}>
            <Pencil className="h-4 w-4 mr-2" />
            Quick Edit
          </Button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {metrics.map((metric) => (
          <Card key={metric.id}>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
              <p className={`text-xl font-bold ${getIntentClasses(metric.intent)}`}>
                {formatValue(metric.value, metric.format)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Layout */}
      <div className={`grid ${isTwoColumn ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1"} gap-6`}>
        {/* Primary Sections */}
        <div className={isTwoColumn ? "lg:col-span-2 space-y-6" : "space-y-6"}>
          {(currentConfig.primarySections || []).map((section) => (
            <Card key={section.id}>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <SectionContent section={section} data={data} />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Secondary Sections (Sidebar in two-column) */}
        {currentConfig.secondarySections && currentConfig.secondarySections.length > 0 && (
          <div className="space-y-6">
            {(currentConfig.secondarySections || []).map((section) => (
              <Card key={section.id}>
                <CardHeader>
                  <CardTitle>{section.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <SectionContent section={section} data={data} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Layout Config Editor */}
      <LayoutConfigEditor
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        config={currentConfig}
        onSave={handleConfigSave}
      />
    </div>
  );
}

/**
 * Renders content based on section type
 */
function SectionContent({ section, data }) {
  const sectionData = getValueByBinding(data, section.dataBinding);

  switch (section.type) {
    case "workflow":
      return <p className="text-muted-foreground">Workflow visualization placeholder</p>;
    
    case "timeline":
      return <p className="text-muted-foreground">Timeline visualization placeholder</p>;
    
    case "activity":
    case "notes":
      return (
        <p className="text-muted-foreground whitespace-pre-wrap">
          {sectionData || "No notes yet."}
        </p>
      );
    
    case "customer":
      return (
        <div className="space-y-2">
          <p className="text-sm"><span className="font-medium">Name:</span> {getValueByBinding(data, "project.customer_name")}</p>
          <p className="text-sm"><span className="font-medium">Email:</span> {getValueByBinding(data, "project.customer_email")}</p>
          <p className="text-sm"><span className="font-medium">Phone:</span> {getValueByBinding(data, "project.customer_phone")}</p>
        </div>
      );
    
    case "financials":
      return (
        <div className="space-y-2">
          <p className="text-sm"><span className="font-medium">Quoted:</span> {formatValue(getValueByBinding(data, "project.quoted_price"), "currency")}</p>
          <p className="text-sm"><span className="font-medium">Final:</span> {formatValue(getValueByBinding(data, "project.final_price"), "currency")}</p>
        </div>
      );
    
    default:
      return <p className="text-muted-foreground">Unknown section type: {section.type}</p>;
  }
}