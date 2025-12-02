import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Search, Zap, Sparkles, Trash2, Edit, Copy, Loader2, BookmarkPlus, Folder, Database, Check, Eye } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import FeatureBuilder from "@/components/library/FeatureBuilder";
import CustomProjectSelector from "@/components/library/CustomProjectSelector";

const categories = ["Communication", "Automation", "Integration", "Reporting", "Security", "Workflow", "UI/UX", "Custom", "Other"];

const categoryColors = {
  Communication: "bg-blue-100 text-blue-800",
  Automation: "bg-green-100 text-green-800",
  Integration: "bg-purple-100 text-purple-800",
  Reporting: "bg-yellow-100 text-yellow-800",
  Security: "bg-red-100 text-red-800",
  Workflow: "bg-orange-100 text-orange-800",
  "UI/UX": "bg-pink-100 text-pink-800",
  Custom: "bg-indigo-100 text-indigo-800",
  Other: "bg-gray-100 text-gray-800",
};

const complexityColors = {
  simple: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  complex: "bg-red-100 text-red-700",
};

export default function FeatureLibrary() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingFeature, setEditingFeature] = useState(null);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [addToProjectItem, setAddToProjectItem] = useState(null);
  const [showBulkAIDialog, setShowBulkAIDialog] = useState(false);
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [bulkGeneratedFeatures, setBulkGeneratedFeatures] = useState([]);
  const [selectedBulkFeatures, setSelectedBulkFeatures] = useState([]);
  const [previewFeature, setPreviewFeature] = useState(null);

  const { data: features = [], isLoading } = useQuery({
    queryKey: ["featureTemplates"],
    queryFn: () => base44.entities.FeatureTemplate.list(),
  });

  const { data: entities = [] } = useQuery({
    queryKey: ["entityTemplates"],
    queryFn: () => base44.entities.EntityTemplate.list(),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["customProjects"],
    queryFn: () => base44.entities.CustomProject.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.FeatureTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featureTemplates"] });
      setShowBuilder(false);
      setEditingFeature(null);
      toast.success("Feature template saved");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FeatureTemplate.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featureTemplates"] });
      setShowBuilder(false);
      setEditingFeature(null);
      toast.success("Feature template updated");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.FeatureTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featureTemplates"] });
      toast.success("Feature template deleted");
    },
  });

  // Get unique groups from features
  const availableGroups = [...new Set(features.filter(f => f.group).map(f => f.group))].sort();

  const filteredFeatures = features.filter((feature) => {
    const matchesSearch = feature.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feature.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || feature.category === selectedCategory;
    const matchesGroup = selectedGroup === "all" || feature.group === selectedGroup || (selectedGroup === "ungrouped" && !feature.group);
    
    if (selectedProjectId) {
      return matchesSearch && matchesCategory && matchesGroup && feature.custom_project_id === selectedProjectId;
    } else {
      return matchesSearch && matchesCategory && matchesGroup && !feature.custom_project_id;
    }
  });

  const groupedFeatures = filteredFeatures.reduce((acc, feature) => {
    const groupKey = feature.group || feature.category || "Other";
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(feature);
    return acc;
  }, {});

  const handleSaveFeature = (featureData) => {
    const dataToSave = {
      ...featureData,
      custom_project_id: selectedProjectId || null,
      is_custom: !!selectedProjectId,
      category: selectedProjectId ? "Custom" : featureData.category
    };
    
    if (editingFeature?.id) {
      updateMutation.mutate({ id: editingFeature.id, data: dataToSave });
    } else {
      createMutation.mutate(dataToSave);
    }
  };

  const handleSaveToLibrary = (feature) => {
    const libraryFeature = {
      ...feature,
      custom_project_id: null,
      is_custom: false,
      is_global: true,
      name: feature.name + " (Library)"
    };
    delete libraryFeature.id;
    delete libraryFeature.created_date;
    delete libraryFeature.updated_date;
    createMutation.mutate(libraryFeature);
    toast.success("Saved to default library");
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    try {
      const entityList = entities.map(e => e.name).join(", ");
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a software architect. Based on this description, generate a feature template:

"${aiPrompt}"

Available entities: ${entityList || "None defined yet"}

Return a JSON object with:
- name: Feature name (e.g., "Email Notifications", "PDF Export")
- description: Clear description of what the feature does
- category: One of [Communication, Automation, Integration, Reporting, Security, Workflow, UI/UX, Other]
- complexity: One of [simple, medium, complex]
- entities_used: Array of entity names this feature uses
- triggers: Array of what triggers this feature (e.g., "user_action", "schedule", "event")
- integrations: Array of external integrations needed
- requirements: Array of technical requirements
- user_stories: Array of user stories this addresses
- tags: Array of relevant tags`,
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            category: { type: "string" },
            complexity: { type: "string" },
            entities_used: { type: "array", items: { type: "string" } },
            triggers: { type: "array", items: { type: "string" } },
            integrations: { type: "array", items: { type: "string" } },
            requirements: { type: "array", items: { type: "string" } },
            user_stories: { type: "array", items: { type: "string" } },
            tags: { type: "array", items: { type: "string" } }
          }
        }
      });

      setEditingFeature(result);
      setShowAIDialog(false);
      setShowBuilder(true);
      setAiPrompt("");
      toast.success("Feature generated! Review and save.");
    } catch (error) {
      toast.error("Failed to generate feature");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDuplicate = (feature) => {
    const duplicate = { 
      ...feature, 
      name: feature.name + " Copy",
      custom_project_id: selectedProjectId || feature.custom_project_id,
      is_custom: !!selectedProjectId || feature.is_custom
    };
    delete duplicate.id;
    delete duplicate.created_date;
    delete duplicate.updated_date;
    createMutation.mutate(duplicate);
  };

  const currentProject = projects.find(p => p.id === selectedProjectId);

  // Get entities for current project
  const projectEntities = selectedProjectId 
    ? entities.filter(e => e.custom_project_id === selectedProjectId)
    : entities.filter(e => !e.custom_project_id);

  const handleBulkAIGenerate = async () => {
    if (projectEntities.length === 0) {
      toast.error("No entities found to generate features from");
      return;
    }
    
    setIsBulkGenerating(true);
    setBulkGeneratedFeatures([]);
    setSelectedBulkFeatures([]);
    
    try {
      const entitySummary = projectEntities.map(e => ({
        name: e.name,
        description: e.description,
        fields: Object.keys(e.schema?.properties || {}).join(", "),
        relationships: e.relationships?.map(r => r.target_entity).join(", ") || "none"
      }));

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a software architect. Analyze these entities and generate useful feature templates for a business application.

ENTITIES:
${JSON.stringify(entitySummary, null, 2)}

Generate features that would enhance this application. Consider:
- CRUD operations and bulk actions
- Search and filtering capabilities
- Export/Import functionality
- Notifications and alerts
- Automation and scheduling
- Reporting and analytics
- Integration with external services
- Workflow automation based on entity relationships

For each feature, specify which entities it uses.

Return a JSON object with a "features" array containing feature templates.`,
        response_json_schema: {
          type: "object",
          properties: {
            features: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  category: { type: "string" },
                  complexity: { type: "string" },
                  entities_used: { type: "array", items: { type: "string" } },
                  triggers: { type: "array", items: { type: "string" } },
                  integrations: { type: "array", items: { type: "string" } },
                  requirements: { type: "array", items: { type: "string" } },
                  user_stories: { type: "array", items: { type: "string" } },
                  tags: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      const generated = result.features || [];
      setBulkGeneratedFeatures(generated);
      setSelectedBulkFeatures(generated.map((_, i) => i));
      toast.success(`Generated ${generated.length} feature suggestions`);
    } catch (error) {
      toast.error("Failed to generate features");
    } finally {
      setIsBulkGenerating(false);
    }
  };

  const handleSaveBulkFeatures = async () => {
    const featuresToSave = selectedBulkFeatures.map(i => bulkGeneratedFeatures[i]);
    
    for (const feature of featuresToSave) {
      const featureData = {
        ...feature,
        custom_project_id: selectedProjectId || null,
        is_custom: !!selectedProjectId,
        category: selectedProjectId ? "Custom" : feature.category
      };
      await base44.entities.FeatureTemplate.create(featureData);
    }
    
    queryClient.invalidateQueries({ queryKey: ["featureTemplates"] });
    toast.success(`Saved ${featuresToSave.length} features`);
    setShowBulkAIDialog(false);
    setBulkGeneratedFeatures([]);
    setSelectedBulkFeatures([]);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Feature Library
            {currentProject && (
              <Badge className="bg-indigo-100 text-indigo-800">
                <Folder className="h-3 w-3 mr-1" />
                {currentProject.name}
              </Badge>
            )}
          </h1>
          <p className="text-gray-500">Reusable feature templates for applications</p>
        </div>
        <div className="flex gap-2">
          <CustomProjectSelector
            selectedProjectId={selectedProjectId}
            onSelectProject={setSelectedProjectId}
          />
          <Button variant="outline" onClick={() => setShowBulkAIDialog(true)} disabled={projectEntities.length === 0}>
            <Database className="h-4 w-4 mr-2" />
            AI from Entities ({projectEntities.length})
          </Button>
          <Button variant="outline" onClick={() => setShowAIDialog(true)}>
            <Sparkles className="h-4 w-4 mr-2" />
            AI Generate
          </Button>
          <Button onClick={() => { setEditingFeature(null); setShowBuilder(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            New Feature
          </Button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search features..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedGroup} onValueChange={setSelectedGroup}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Groups</SelectItem>
            <SelectItem value="ungrouped">Ungrouped</SelectItem>
            {availableGroups.map((grp) => (
              <SelectItem key={grp} value={grp}>{grp}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : filteredFeatures.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No feature templates found</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedFeatures).map(([groupName, groupFeatures]) => (
            <div key={groupName}>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Badge className={categoryColors[groupName] || "bg-slate-100 text-slate-800"}>{groupName}</Badge>
                <span className="text-gray-400 text-sm font-normal">({groupFeatures.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupFeatures.map((feature) => (
                  <Card key={feature.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Zap className="h-4 w-4 text-amber-600" />
                          {feature.name}
                          {feature.is_custom && (
                            <Badge variant="outline" className="text-xs">Custom</Badge>
                          )}
                        </CardTitle>
                        <Badge className={complexityColors[feature.complexity || "medium"]} variant="secondary">
                          {feature.complexity || "medium"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{feature.description}</p>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-1 mb-3">
                        {feature.tags?.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 mb-3">
                        {feature.entities_used?.length || 0} entities · {feature.integrations?.length || 0} integrations
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setPreviewFeature(feature)} title="Preview">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setEditingFeature(feature); setShowBuilder(true); }} title="Edit">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDuplicate(feature)} title="Duplicate">
                          <Copy className="h-3 w-3" />
                        </Button>
                        {!feature.custom_project_id && projects.length > 0 && (
                          <Button size="sm" variant="ghost" onClick={() => setAddToProjectItem(feature)} title="Add to Project" className="text-indigo-600">
                            <Folder className="h-3 w-3" />
                          </Button>
                        )}
                        {feature.is_custom && (
                          <Button size="sm" variant="ghost" onClick={() => handleSaveToLibrary(feature)} title="Save to default library">
                            <BookmarkPlus className="h-3 w-3" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="text-red-600" onClick={() => deleteMutation.mutate(feature.id)} title="Delete">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
        <DialogContent className="max-w-4xl h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingFeature?.id ? "Edit Feature" : "Create Feature"}
              {selectedProjectId && currentProject && (
                <Badge className="ml-2 bg-indigo-100 text-indigo-800">{currentProject.name}</Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          <FeatureBuilder
            initialData={editingFeature}
            entities={entities}
            onSave={handleSaveFeature}
            onCancel={() => { setShowBuilder(false); setEditingFeature(null); }}
            isSaving={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Add to Project Dialog */}
      <Dialog open={!!addToProjectItem} onOpenChange={(v) => !v && setAddToProjectItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5 text-indigo-600" />
              Add "{addToProjectItem?.name}" to Project
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Select a custom project:</p>
            <div className="space-y-2">
              {projects.map((project) => (
                <Button
                  key={project.id}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    const copy = { ...addToProjectItem, custom_project_id: project.id, is_custom: true, category: "Custom" };
                    delete copy.id;
                    delete copy.created_date;
                    delete copy.updated_date;
                    createMutation.mutate(copy);
                    setAddToProjectItem(null);
                    toast.success(`Added to ${project.name}`);
                  }}
                >
                  <Folder className="h-4 w-4 mr-2" />
                  {project.name}
                </Button>
              ))}
            </div>
            <Button variant="outline" className="w-full" onClick={() => setAddToProjectItem(null)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Generate Feature with AI
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Describe the feature you need...&#10;&#10;Example: Send email notifications when a task is assigned or its status changes"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              rows={5}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAIDialog(false)}>Cancel</Button>
              <Button onClick={handleAIGenerate} disabled={isGenerating || !aiPrompt.trim()}>
                {isGenerating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Generate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk AI Generate Dialog */}
      <Dialog open={showBulkAIDialog} onOpenChange={setShowBulkAIDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-amber-600" />
              Generate Features from Entities
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto space-y-4">
            {bulkGeneratedFeatures.length === 0 ? (
              <>
                <p className="text-sm text-gray-600">
                  AI will analyze your {projectEntities.length} entities and suggest relevant features.
                </p>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-sm font-medium mb-2">Entities to analyze:</p>
                  <div className="flex flex-wrap gap-1">
                    {projectEntities.map(e => (
                      <Badge key={e.id} variant="outline">{e.name}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowBulkAIDialog(false)}>Cancel</Button>
                  <Button onClick={handleBulkAIGenerate} disabled={isBulkGenerating}>
                    {isBulkGenerating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Generate Features
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Select features to add ({selectedBulkFeatures.length}/{bulkGeneratedFeatures.length} selected)
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedBulkFeatures(
                      selectedBulkFeatures.length === bulkGeneratedFeatures.length 
                        ? [] 
                        : bulkGeneratedFeatures.map((_, i) => i)
                    )}
                  >
                    {selectedBulkFeatures.length === bulkGeneratedFeatures.length ? "Deselect All" : "Select All"}
                  </Button>
                </div>
                <div className="space-y-2 max-h-96 overflow-auto">
                  {bulkGeneratedFeatures.map((feature, index) => (
                    <div 
                      key={index} 
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedBulkFeatures.includes(index) ? "border-amber-500 bg-amber-50" : "hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedBulkFeatures(prev => 
                        prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox checked={selectedBulkFeatures.includes(index)} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-amber-600" />
                            <span className="font-medium">{feature.name}</span>
                            <Badge className={categoryColors[feature.category] || "bg-slate-100"}>{feature.category}</Badge>
                            <Badge className={complexityColors[feature.complexity || "medium"]}>{feature.complexity || "medium"}</Badge>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{feature.description}</p>
                          {feature.entities_used?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {feature.entities_used.map(e => (
                                <Badge key={e} variant="outline" className="text-xs">{e}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t">
                  <Button variant="outline" onClick={() => { setBulkGeneratedFeatures([]); setSelectedBulkFeatures([]); }}>
                    Regenerate
                  </Button>
                  <Button onClick={handleSaveBulkFeatures} disabled={selectedBulkFeatures.length === 0}>
                    <Check className="h-4 w-4 mr-2" />
                    Save {selectedBulkFeatures.length} Features
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
      {/* Preview Dialog */}
      <Dialog open={!!previewFeature} onOpenChange={(v) => !v && setPreviewFeature(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-600" />
              {previewFeature?.name}
            </DialogTitle>
          </DialogHeader>
          {previewFeature && (
            <div className="space-y-4">
              <div>
                <p className="text-gray-600">{previewFeature.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Category:</span>
                  <Badge className={`ml-2 ${categoryColors[previewFeature.category]}`}>{previewFeature.category}</Badge>
                </div>
                <div>
                  <span className="text-gray-500">Complexity:</span>
                  <Badge className={`ml-2 ${complexityColors[previewFeature.complexity || "medium"]}`}>{previewFeature.complexity || "medium"}</Badge>
                </div>
              </div>
              
              {previewFeature.entities_used?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Entities Used</h4>
                  <div className="flex flex-wrap gap-1">
                    {previewFeature.entities_used.map(e => (
                      <Badge key={e} variant="outline">{e}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {previewFeature.triggers?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Triggers</h4>
                  <div className="flex flex-wrap gap-1">
                    {previewFeature.triggers.map(t => (
                      <Badge key={t} className="bg-blue-100 text-blue-800">{t}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {previewFeature.integrations?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Integrations</h4>
                  <div className="flex flex-wrap gap-1">
                    {previewFeature.integrations.map(i => (
                      <Badge key={i} className="bg-purple-100 text-purple-800">{i}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {previewFeature.requirements?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Requirements</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {previewFeature.requirements.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {previewFeature.user_stories?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">User Stories</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {previewFeature.user_stories.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {previewFeature.tags?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {previewFeature.tags.map(t => (
                      <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setPreviewFeature(null)}>Close</Button>
                <Button onClick={() => { setEditingFeature(previewFeature); setShowBuilder(true); setPreviewFeature(null); }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Feature
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}