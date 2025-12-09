import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, FileText, Building2, Sparkles, Plus, Star, Filter } from "lucide-react";
import { toast } from "sonner";

const categoryColors = {
  "Professional Services": "bg-info-50 text-info",
  "Construction": "bg-warning/10 text-warning",
  "Retail": "bg-accent-100 text-accent",
  "Healthcare": "bg-success-50 text-success",
  "Technology": "bg-accent/10 text-accent",
  "Manufacturing": "bg-warning text-warning-foreground",
  "Finance": "bg-success-50 text-success",
  "Education": "bg-info-50 text-info",
  "Custom": "bg-primary-100 text-primary",
  "Other": "bg-muted text-muted-foreground",
};

const categories = [
  "All",
  "Professional Services",
  "Construction", 
  "Retail",
  "Healthcare",
  "Technology",
  "Manufacturing",
  "Finance",
  "Education",
  "Custom",
  "Other"
];

export default function NewMindMapDialog({
  open,
  onOpenChange,
  onCreateMap,
  isPending,
}) {
  const [activeTab, setActiveTab] = useState("blank");
  const [mapName, setMapName] = useState("");
  const [mapDescription, setMapDescription] = useState("");
  const [mapSuggestions, setMapSuggestions] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [templateFilter, setTemplateFilter] = useState("All");

  const { data: allTemplates = [] } = useQuery({
    queryKey: ["businessTemplates"],
    queryFn: () => base44.entities.BusinessTemplate.filter({ is_active: true }),
  });

  // Filter templates: show starred templates OR filter by category (Custom only shows when specifically selected)
  const templates = allTemplates.filter(t => {
    if (templateFilter === "All") {
      // Show all starred templates + non-Custom templates
      return t.is_starred || t.category !== "Custom";
    }
    return t.category === templateFilter;
  });

  const handleCreateBlank = () => {
    if (!mapName) {
      toast.error("Please enter a name");
      return;
    }
    onCreateMap({
      name: mapName,
      description: mapDescription,
      node_suggestions: mapSuggestions,
    });
    resetForm();
  };

  const handleCreateFromTemplate = async () => {
    if (!selectedTemplate || !mapName) {
      toast.error("Please select a template and enter a name");
      return;
    }

    setIsGenerating(true);
    try {
      // Fetch all entities, pages, and features for this template's custom project
      let projectEntities = [];
      let projectPages = [];
      let projectFeatures = [];
      
      if (selectedTemplate.custom_project_id) {
        // Fetch from custom project
        const [entities, pages, features] = await Promise.all([
          base44.entities.EntityTemplate.filter({ custom_project_id: selectedTemplate.custom_project_id }),
          base44.entities.PageTemplate.filter({ custom_project_id: selectedTemplate.custom_project_id }),
          base44.entities.FeatureTemplate.filter({ custom_project_id: selectedTemplate.custom_project_id }),
        ]);
        projectEntities = entities;
        projectPages = pages;
        projectFeatures = features;
      } else if (selectedTemplate.entities?.length || selectedTemplate.pages?.length || selectedTemplate.features?.length) {
        // Use embedded data in template
        projectEntities = selectedTemplate.entities || [];
        projectPages = selectedTemplate.pages || [];
        projectFeatures = selectedTemplate.features || [];
      }

      // Create the mindmap first
      const newMap = await base44.entities.MindMap.create({
        name: mapName,
        description: selectedTemplate.summary || selectedTemplate.description || "",
        node_suggestions: "",
      });

      // Build comprehensive context from actual project data
      const entityList = projectEntities.map(e => ({
        name: e.name,
        description: e.description,
        fields: Object.keys(e.schema?.properties || {}).slice(0, 10).join(", "),
        relationships: e.relationships?.map(r => r.target_entity).join(", ") || ""
      }));
      
      const pageList = projectPages.map(p => ({
        name: p.name,
        description: p.description,
        category: p.category,
        entities_used: p.entities_used || []
      }));
      
      const featureList = projectFeatures.map(f => ({
        name: f.name,
        description: f.description,
        category: f.category,
        entities_used: f.entities_used || []
      }));

      // Use AI to generate the mind map structure from the actual project data
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are creating a mind map structure from a business application project.

PROJECT NAME: ${selectedTemplate.name}
DESCRIPTION: ${selectedTemplate.summary || selectedTemplate.description || ""}

ENTITIES (${projectEntities.length}):
${JSON.stringify(entityList, null, 2)}

PAGES (${projectPages.length}):
${JSON.stringify(pageList, null, 2)}

FEATURES (${projectFeatures.length}):
${JSON.stringify(featureList, null, 2)}

Generate a COMPLETE mind map structure that includes ALL entities, pages, and features listed above.

Structure:
1. Central node: "${mapName}" 
2. Main branches: Group items by functional area (e.g., "Customer Management", "Project Management", "Reports", etc.)
3. Under each main branch, include the relevant entities, pages, and features

IMPORTANT: 
- Include EVERY entity as a node with node_type "entity"
- Include EVERY page as a node with node_type "page"  
- Include EVERY feature as a node with node_type "feature"
- Group them logically under main branches

Return a JSON object with a "nodes" array where each node has:
- "text": the node label (use exact names from the lists above)
- "node_type": one of "central", "main_branch", "entity", "page", "feature"
- "parent_index": index of parent node in array (null for central node)
- "color": hex color (#22c55e for entities, #3b82f6 for pages, #f59e0b for features, #6366f1 for main branches)
- "specification_notes": description or notes

Start with central node at index 0.`,
        response_json_schema: {
          type: "object",
          properties: {
            nodes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  text: { type: "string" },
                  node_type: { type: "string" },
                  parent_index: { type: "number" },
                  color: { type: "string" },
                  specification_notes: { type: "string" }
                }
              }
            }
          }
        }
      });

      // Create nodes and connections
      const nodeIdMap = {};
      const generatedNodes = result.nodes || [];

      // First pass: create all nodes with positions
      for (let i = 0; i < generatedNodes.length; i++) {
        const nodeData = generatedNodes[i];
        
        // Calculate position based on type and index
        let x = 500, y = 350;
        if (nodeData.node_type === "central") {
          x = 500; y = 350;
        } else if (nodeData.node_type === "main_branch") {
          const mainBranchCount = generatedNodes.filter((n, idx) => 
            n.node_type === "main_branch" && idx < i
          ).length;
          const totalMainBranches = generatedNodes.filter(n => n.node_type === "main_branch").length;
          const angle = (2 * Math.PI * mainBranchCount) / totalMainBranches - Math.PI / 2;
          x = 500 + 200 * Math.cos(angle);
          y = 350 + 200 * Math.sin(angle);
        } else {
          // Position relative to parent
          const parentIdx = nodeData.parent_index;
          if (parentIdx !== null && nodeIdMap[parentIdx]) {
            const siblingCount = generatedNodes.filter((n, idx) => 
              n.parent_index === parentIdx && idx < i
            ).length;
            const angle = Math.PI / 4 + (siblingCount * Math.PI / 6);
            x = 500 + 350 * Math.cos(angle) + Math.random() * 50;
            y = 350 + 250 * Math.sin(angle) + Math.random() * 50;
          }
        }

        const createdNode = await base44.entities.MindMapNode.create({
          mind_map_id: newMap.id,
          text: nodeData.text,
          node_type: nodeData.node_type,
          color: nodeData.color || "#3b82f6",
          position_x: x,
          position_y: y,
          specification_notes: nodeData.specification_notes,
        });

        nodeIdMap[i] = createdNode.id;
      }

      // Second pass: create connections
      for (let i = 0; i < generatedNodes.length; i++) {
        const nodeData = generatedNodes[i];
        if (nodeData.parent_index !== null && nodeData.parent_index !== undefined) {
          const sourceId = nodeIdMap[nodeData.parent_index];
          const targetId = nodeIdMap[i];
          if (sourceId && targetId) {
            await base44.entities.MindMapConnection.create({
              mind_map_id: newMap.id,
              source_node_id: sourceId,
              target_node_id: targetId,
              style: "solid",
            });
          }
        }
      }

      toast.success(`Created mind map with ${generatedNodes.length} nodes from template`);
      onOpenChange(false);
      
      // Navigate to the new map
      const url = new URL(window.location.href);
      url.searchParams.set("map", newMap.id);
      window.location.href = url.toString();
      
    } catch (error) {
      console.error("Error generating from template:", error);
      toast.error("Failed to generate mind map from template");
    } finally {
      setIsGenerating(false);
    }
  };

  const resetForm = () => {
    setMapName("");
    setMapDescription("");
    setMapSuggestions("");
    setSelectedTemplate(null);
    setActiveTab("blank");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Mind Map
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="blank" className="gap-2">
              <FileText className="h-4 w-4" />
              Blank Map
            </TabsTrigger>
            <TabsTrigger value="template" className="gap-2">
              <Building2 className="h-4 w-4" />
              From Template
            </TabsTrigger>
          </TabsList>

          {/* Blank Map Tab */}
          <TabsContent value="blank" className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium">Name *</label>
              <Input
                value={mapName}
                onChange={(e) => setMapName(e.target.value)}
                placeholder="e.g., Paragon Oak App Scope"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Business Context</label>
              <Textarea
                value={mapDescription}
                onChange={(e) => setMapDescription(e.target.value)}
                placeholder="Describe the business context, model, operations..."
                rows={4}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Node Suggestions for AI</label>
              <Textarea
                value={mapSuggestions}
                onChange={(e) => setMapSuggestions(e.target.value)}
                placeholder="List nodes you want the AI to add..."
                rows={4}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleCreateBlank}
              disabled={!mapName || isPending}
            >
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Blank Mind Map
            </Button>
          </TabsContent>

          {/* Template Tab */}
          <TabsContent value="template" className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium">Name *</label>
              <Input
                value={mapName}
                onChange={(e) => setMapName(e.target.value)}
                placeholder="e.g., My Construction Project"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Select Business Template</label>
                <Select value={templateFilter} onValueChange={setTemplateFilter}>
                  <SelectTrigger className="w-40 h-8">
                    <Filter className="h-3 w-3 mr-1" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <ScrollArea className="h-64 border rounded-lg p-2">
                <div className="space-y-2">
                  {templates.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Building2 className="h-10 w-10 mx-auto mb-2 opacity-30" />
                      <p>No templates available</p>
                      <p className="text-xs">Create templates in Business Templates page</p>
                    </div>
                  ) : (
                    templates.map((template) => (
                      <Card
                        key={template.id}
                        className={`cursor-pointer transition-all ${
                          selectedTemplate?.id === template.id
                            ? "ring-2 ring-info bg-info-50"
                            : "hover:bg-muted"
                        }`}
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium flex items-center gap-2">
                                {template.is_starred && (
                                  <Star className="h-4 w-4 fill-warning text-warning" />
                                )}
                                {template.name}
                              </p>
                              {template.category && (
                                <Badge className={`mt-1 text-xs ${categoryColors[template.category] || categoryColors.Other}`}>
                                  {template.category}
                                </Badge>
                              )}
                              {(template.summary || template.description) && (
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {template.summary || template.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>

            {selectedTemplate && (
              <div className="bg-info-50 rounded-lg p-3 text-sm">
                <div className="flex items-center gap-2 text-info font-medium">
                  <Sparkles className="h-4 w-4" />
                  AI will generate the complete mind map structure
                </div>
                <p className="text-info mt-1">
                  Including entities, pages, features, and relationships from the template specification.
                </p>
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleCreateFromTemplate}
              disabled={!mapName || !selectedTemplate || isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Mind Map...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate from Template
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}