import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Play, AlertCircle, CheckCircle2, Copy, Sparkles } from "lucide-react";
import { toast } from "sonner";
import LayoutRenderer from "@/components/layout-system/LayoutRenderer";

// Sample configs for quick testing
const sampleWorkspaceConfig = {
  "patternId": "project_workspace",
  "entity": "Project",
  "pageHeader": {
    "titleBinding": "project.name",
    "meta": [
      { "label": "Status", "binding": "project.status" },
      { "label": "Priority", "binding": "project.priority" }
    ]
  },
  "layout": "twoColumn",
  "summary": {
    "metrics": [
      {
        "id": "quoted",
        "label": "Quoted Price",
        "valueBinding": "project.quoted_price",
        "format": "currency",
        "intent": "default"
      },
      {
        "id": "hours",
        "label": "Estimated Hours",
        "valueBinding": "project.estimated_hours",
        "format": "hours",
        "intent": "default"
      }
    ]
  },
  "primarySections": [
    {
      "id": "activity",
      "type": "activity",
      "title": "Activity & Notes",
      "dataBinding": "project.notes"
    }
  ],
  "secondarySections": [
    {
      "id": "customer",
      "type": "customer",
      "title": "Customer",
      "dataBinding": "project"
    }
  ],
  "editor": {
    "mode": "rightPanel",
    "title": "Quick Edit",
    "fields": [
      {
        "id": "status",
        "label": "Status",
        "component": "SelectField",
        "binding": "project.status",
        "options": [
          { "value": "inquiry", "label": "Inquiry" },
          { "value": "active", "label": "Active" },
          { "value": "completed", "label": "Completed" }
        ]
      }
    ],
    "submitActionId": "project.update"
  }
};

const sampleEditorConfig = {
  "patternId": "project_editor_full",
  "entity": "Project",
  "mode": "create",
  "pageHeader": {
    "title": "New Project",
    "subtitle": "Create a new project"
  },
  "layout": "twoColumn",
  "sections": [
    {
      "id": "core",
      "title": "Core Details",
      "fields": [
        {
          "id": "name",
          "label": "Project Name",
          "component": "TextField",
          "binding": "project.name",
          "required": true
        },
        {
          "id": "status",
          "label": "Status",
          "component": "SelectField",
          "binding": "project.status",
          "options": [
            { "value": "inquiry", "label": "Inquiry" },
            { "value": "active", "label": "Active" }
          ]
        }
      ]
    }
  ],
  "actions": {
    "primary": {
      "label": "Create Project",
      "actionId": "project.create"
    },
    "secondary": [
      {
        "label": "Cancel",
        "actionId": "navigation.back",
        "variant": "ghost"
      }
    ]
  }
};

const sampleProjectData = {
  project: {
    id: "proj-1",
    name: "Kitchen Renovation",
    status: "active",
    priority: "high",
    quoted_price: 15000,
    estimated_hours: 120,
    notes: "Customer wants modern design with marble countertops.",
    customer_name: "John Smith",
    customer_email: "john@example.com",
    customer_phone: "07700 900123"
  }
};

export default function LayoutBuilder() {
  const [configInput, setConfigInput] = useState(JSON.stringify(sampleWorkspaceConfig, null, 2));
  const [dataInput, setDataInput] = useState(JSON.stringify(sampleProjectData, null, 2));
  const [parsedConfig, setParsedConfig] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [activeTab, setActiveTab] = useState("workspace");

  const loadSample = (type) => {
    if (type === "workspace") {
      setConfigInput(JSON.stringify(sampleWorkspaceConfig, null, 2));
      setDataInput(JSON.stringify(sampleProjectData, null, 2));
    } else if (type === "editor") {
      setConfigInput(JSON.stringify(sampleEditorConfig, null, 2));
      setDataInput(JSON.stringify({ project: {} }, null, 2));
    }
    setValidationError(null);
    setParsedConfig(null);
    setParsedData(null);
  };

  const handleRender = () => {
    try {
      const config = JSON.parse(configInput);
      const data = JSON.parse(dataInput);
      
      // Basic validation
      if (!config.patternId) {
        throw new Error("Config must have a 'patternId' property");
      }
      
      setParsedConfig(config);
      setParsedData(data);
      setValidationError(null);
      toast.success("Layout rendered successfully");
    } catch (error) {
      setValidationError(error.message);
      setParsedConfig(null);
      setParsedData(null);
      toast.error("Invalid JSON or config");
    }
  };

  const handleAction = (actionId, data) => {
    console.log("Action triggered:", actionId, data);
    toast.success(`Action: ${actionId}`);
  };

  const copyConfig = () => {
    navigator.clipboard.writeText(configInput);
    toast.success("Config copied to clipboard");
  };

  return (
    <div className="max-w-7xl mx-auto -mt-6 bg-background min-h-screen">
      <PageHeader 
        title="Layout Builder"
        description="Test and validate layout configurations with live preview"
      >
        <Badge variant="outline" className="gap-1">
          <Sparkles className="h-3 w-3" />
          Testing Tool
        </Badge>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Configuration</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => loadSample("workspace")}>
                    Workspace Sample
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => loadSample("editor")}>
                    Editor Sample
                  </Button>
                  <Button variant="ghost" size="icon" onClick={copyConfig}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={configInput}
                onChange={(e) => setConfigInput(e.target.value)}
                className="font-mono text-xs h-64 resize-none"
                placeholder="Paste your layout config JSON here..."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mock Data</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={dataInput}
                onChange={(e) => setDataInput(e.target.value)}
                className="font-mono text-xs h-64 resize-none"
                placeholder="Paste your mock data JSON here..."
              />
            </CardContent>
          </Card>

          <Button onClick={handleRender} className="w-full" size="lg">
            <Play className="h-4 w-4 mr-2" />
            Render Layout
          </Button>

          {validationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="font-mono text-xs">
                {validationError}
              </AlertDescription>
            </Alert>
          )}

          {parsedConfig && !validationError && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Valid {parsedConfig.patternId} configuration
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Preview Panel */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {parsedConfig && parsedData ? (
                <div className="border-t overflow-auto max-h-[800px]">
                  <LayoutRenderer
                    config={parsedConfig}
                    data={parsedData}
                    onAction={handleAction}
                  />
                </div>
              ) : (
                <div className="p-12 text-center text-muted-foreground">
                  <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Click "Render Layout" to see the preview</p>
                  <p className="text-sm mt-2">or load a sample configuration to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}