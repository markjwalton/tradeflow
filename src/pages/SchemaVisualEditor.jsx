import React, { useState, useEffect, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Maximize2,
  Minimize2,
  Save,
  FolderOpen,
  Download,
  Upload,
  Sparkles,
  Settings,
  Eye,
  Code,
  Layers,
  X,
  Home,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import SchemaNode from "@/components/schema-editor/SchemaNode";
import PropertyNode from "@/components/schema-editor/PropertyNode";
import SchemaAIPanel from "@/components/schema-editor/SchemaAIPanel";
import SchemaExportPanel from "@/components/schema-editor/SchemaExportPanel";

const nodeTypes = {
  schema: SchemaNode,
  property: PropertyNode,
};

export default function SchemaVisualEditor() {
  const queryClient = useQueryClient();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showExitPrompt, setShowExitPrompt] = useState(false);
  const [activeView, setActiveView] = useState("split"); // split, visual, code
  const [jsonInput, setJsonInput] = useState("");
  const [schemaName, setSchemaName] = useState("Untitled Schema");
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [currentSchemaId, setCurrentSchemaId] = useState(null);
  
  const autoSaveTimer = useRef(null);
  const editorRef = useRef(null);

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Load saved state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("schemaEditor_state");
    if (saved) {
      try {
        const state = JSON.parse(saved);
        setJsonInput(state.jsonInput || "");
        setSchemaName(state.schemaName || "Untitled Schema");
        setNodes(state.nodes || []);
        setEdges(state.edges || []);
      } catch (e) {
        console.error("Failed to load saved state:", e);
      }
    }
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    if (autoSaveEnabled) {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(() => {
        const state = {
          jsonInput,
          schemaName,
          nodes,
          edges,
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem("schemaEditor_state", JSON.stringify(state));
        setHasUnsavedChanges(false);
      }, 2000);
    }
  }, [jsonInput, schemaName, nodes, edges, autoSaveEnabled]);

  // Mark as changed when editing
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [jsonInput, nodes, edges]);

  // Handle fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!isFullscreen) {
      if (editorRef.current?.requestFullscreen) {
        editorRef.current.requestFullscreen();
      } else if (editorRef.current?.webkitRequestFullscreen) {
        editorRef.current.webkitRequestFullscreen();
      } else if (editorRef.current?.msRequestFullscreen) {
        editorRef.current.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  }, [isFullscreen]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("msfullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Parse JSON to visual nodes
  const parseJsonToNodes = useCallback((json) => {
    try {
      const schema = JSON.parse(json);
      const newNodes = [];
      const newEdges = [];

      // Create main schema node
      const schemaNode = {
        id: "schema-root",
        type: "schema",
        position: { x: 400, y: 50 },
        data: {
          label: schema.name || schemaName,
          type: schema.type || "object",
          schema: schema,
        },
      };
      newNodes.push(schemaNode);

      // Create property nodes
      if (schema.properties) {
        const properties = Object.entries(schema.properties);
        properties.forEach(([key, value], index) => {
          const propertyNode = {
            id: `property-${key}`,
            type: "property",
            position: { x: 200 + (index % 3) * 300, y: 250 + Math.floor(index / 3) * 150 },
            data: {
              label: key,
              propertyType: value.type || "string",
              required: schema.required?.includes(key) || false,
              description: value.description || "",
              enum: value.enum || null,
            },
          };
          newNodes.push(propertyNode);

          // Create edge from schema to property
          newEdges.push({
            id: `edge-${key}`,
            source: "schema-root",
            target: `property-${key}`,
            animated: true,
          });
        });
      }

      setNodes(newNodes);
      setEdges(newEdges);
      toast.success("Schema visualized");
    } catch (e) {
      toast.error("Invalid JSON: " + e.message);
    }
  }, [schemaName, setNodes, setEdges]);

  // Convert nodes back to JSON schema
  const nodesToJsonSchema = useCallback(() => {
    const schemaNode = nodes.find((n) => n.type === "schema");
    if (!schemaNode) return null;

    const properties = {};
    const required = [];

    nodes
      .filter((n) => n.type === "property")
      .forEach((node) => {
        const { label, propertyType, required: isRequired, description, enum: enumValues } = node.data;
        properties[label] = {
          type: propertyType,
        };
        if (description) properties[label].description = description;
        if (enumValues) properties[label].enum = enumValues;
        if (isRequired) required.push(label);
      });

    return {
      name: schemaNode.data.label,
      type: "object",
      properties,
      required: required.length > 0 ? required : undefined,
    };
  }, [nodes]);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  // Save to entity library
  const saveToLibrary = useMutation({
    mutationFn: async () => {
      const schema = nodesToJsonSchema();
      if (!schema) throw new Error("No valid schema to save");

      if (currentSchemaId) {
        return base44.entities.EntitySchema.update(currentSchemaId, {
          name: schemaName,
          schema: JSON.stringify(schema, null, 2),
        });
      } else {
        return base44.entities.EntitySchema.create({
          name: schemaName,
          schema: JSON.stringify(schema, null, 2),
        });
      }
    },
    onSuccess: (data) => {
      setCurrentSchemaId(data.id);
      setHasUnsavedChanges(false);
      toast.success("Schema saved to library");
    },
    onError: (error) => {
      toast.error("Failed to save: " + error.message);
    },
  });

  // Load from file
  const handleLoadFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setJsonInput(event.target.result);
          parseJsonToNodes(event.target.result);
          setSchemaName(file.name.replace(".json", ""));
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  // Export to file
  const handleExportFile = () => {
    const schema = nodesToJsonSchema();
    if (!schema) {
      toast.error("No schema to export");
      return;
    }

    const blob = new Blob([JSON.stringify(schema, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${schemaName.replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Exit fullscreen with confirmation
  const handleExitFullscreen = () => {
    if (hasUnsavedChanges) {
      setShowExitPrompt(true);
    } else {
      toggleFullscreen();
    }
  };

  const confirmExit = () => {
    setShowExitPrompt(false);
    toggleFullscreen();
  };

  return (
    <div
      ref={editorRef}
      className={`flex flex-col ${isFullscreen ? "h-screen bg-background" : "h-[calc(100vh-2rem)]"}`}
    >
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-card">
        <div className="flex items-center gap-4">
          {isFullscreen && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExitFullscreen}
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              Exit to App
            </Button>
          )}
          <Input
            value={schemaName}
            onChange={(e) => setSchemaName(e.target.value)}
            className="w-64 h-8 text-sm font-medium"
            placeholder="Schema name..."
          />
          {hasUnsavedChanges && (
            <span className="text-xs text-amber-600 flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-amber-600" />
              Unsaved changes
            </span>
          )}
          {autoSaveEnabled && !hasUnsavedChanges && (
            <span className="text-xs text-green-600 flex items-center gap-1">
              <Check className="h-3 w-3" />
              Auto-saved
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant={activeView === "code" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveView("code")}
              className="rounded-none h-8"
            >
              <Code className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={activeView === "split" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveView("split")}
              className="rounded-none h-8"
            >
              <Layers className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={activeView === "visual" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveView("visual")}
              className="rounded-none h-8"
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="w-px h-6 bg-border" />

          <Button variant="ghost" size="sm" onClick={handleLoadFile} className="gap-2 h-8">
            <Upload className="h-3.5 w-3.5" />
            Load
          </Button>
          <Button variant="ghost" size="sm" onClick={handleExportFile} className="gap-2 h-8">
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => saveToLibrary.mutate()}
            className="gap-2 h-8"
            disabled={saveToLibrary.isPending}
          >
            <Save className="h-3.5 w-3.5" />
            Save to Library
          </Button>

          <div className="w-px h-6 bg-border" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAIPanel(true)}
            className="gap-2 h-8"
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI Assistant
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettingsPanel(true)}
            className="gap-2 h-8"
          >
            <Settings className="h-3.5 w-3.5" />
          </Button>

          <div className="w-px h-6 bg-border" />

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="gap-2 h-8"
          >
            {isFullscreen ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Code Editor */}
        {(activeView === "code" || activeView === "split") && (
          <div className={`${activeView === "split" ? "w-1/2" : "w-full"} flex flex-col border-r`}>
            <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
              <span className="text-sm font-medium">JSON Schema</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => parseJsonToNodes(jsonInput)}
                className="h-7 text-xs"
              >
                Visualize
              </Button>
            </div>
            <Textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="flex-1 font-mono text-sm resize-none border-0 rounded-none focus-visible:ring-0"
              placeholder='{\n  "name": "User",\n  "type": "object",\n  "properties": {\n    "name": { "type": "string" },\n    "email": { "type": "string" }\n  }\n}'
            />
          </div>
        )}

        {/* Visual Canvas */}
        {(activeView === "visual" || activeView === "split") && (
          <div className={`${activeView === "split" ? "w-1/2" : "w-full"} bg-muted/10 relative`}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              fitView
              className="bg-muted/10"
            >
              <Background />
              <Controls />
              <MiniMap />
            </ReactFlow>
          </div>
        )}
      </div>

      {/* AI Panel */}
      <SchemaAIPanel
        open={showAIPanel}
        onClose={() => setShowAIPanel(false)}
        onSchemaGenerated={(schema) => {
          setJsonInput(JSON.stringify(schema, null, 2));
          parseJsonToNodes(JSON.stringify(schema, null, 2));
          setShowAIPanel(false);
        }}
      />

      {/* Export Panel */}
      <SchemaExportPanel
        open={showExportPanel}
        onClose={() => setShowExportPanel(false)}
        schema={nodesToJsonSchema()}
      />

      {/* Settings Panel */}
      <Sheet open={showSettingsPanel} onOpenChange={setShowSettingsPanel}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Editor Settings</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <Label>Auto-save</Label>
              <input
                type="checkbox"
                checked={autoSaveEnabled}
                onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                className="h-4 w-4"
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Exit Confirmation */}
      {showExitPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-xl max-w-md">
            <h3 className="text-lg font-semibold mb-2">Unsaved Changes</h3>
            <p className="text-sm text-muted-foreground mb-4">
              You have unsaved changes. Are you sure you want to exit fullscreen?
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowExitPrompt(false)}>
                Cancel
              </Button>
              <Button onClick={confirmExit}>Exit Anyway</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}