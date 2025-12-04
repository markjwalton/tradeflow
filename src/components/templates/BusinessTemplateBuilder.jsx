import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Sparkles, Database, Layout, Zap, Loader2, Trash2, Edit, GitBranch, Play } from "lucide-react";
import { toast } from "sonner";
import TemplateEntityEditor from "./TemplateEntityEditor";
import TemplatePageEditor from "./TemplatePageEditor";
import TemplateFeatureEditor from "./TemplateFeatureEditor";
import AIDependencyAnalyzer from "@/components/generated-app/AIDependencyAnalyzer";

const categories = [
  "Professional Services",
  "Construction",
  "Retail",
  "Healthcare",
  "Technology",
  "Manufacturing",
  "Finance",
  "Education",
  "Other"
];

export default function BusinessTemplateBuilder({ initialData, onSave, onCancel, isSaving }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("Other");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  
  const [selectedEntities, setSelectedEntities] = useState([]);
  const [selectedPages, setSelectedPages] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  
  const [entityRelationships, setEntityRelationships] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isOrganizing, setIsOrganizing] = useState(false);
  
  const [editingEntity, setEditingEntity] = useState(null);
  const [editingPage, setEditingPage] = useState(null);
  const [editingFeature, setEditingFeature] = useState(null);
  
  const [activeTab, setActiveTab] = useState("entities");

  // Fetch library items
  const { data: entityTemplates = [] } = useQuery({
    queryKey: ["entityTemplates"],
    queryFn: () => base44.entities.EntityTemplate.list(),
  });

  const { data: pageTemplates = [] } = useQuery({
    queryKey: ["pageTemplates"],
    queryFn: () => base44.entities.PageTemplate.list(),
  });

  const { data: featureTemplates = [] } = useQuery({
    queryKey: ["featureTemplates"],
    queryFn: () => base44.entities.FeatureTemplate.list(),
  });

  const { data: workflowTemplates = [] } = useQuery({
    queryKey: ["workflowTemplates"],
    queryFn: () => base44.entities.Workflow.list(),
  });

  const { data: formTemplates = [] } = useQuery({
    queryKey: ["formTemplates"],
    queryFn: () => base44.entities.FormTemplate.list(),
  });

  const { data: checklistTemplates = [] } = useQuery({
    queryKey: ["checklistTemplates"],
    queryFn: () => base44.entities.ChecklistTemplate.list(),
  });

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setSummary(initialData.summary || "");
      setCategory(initialData.category || "Other");
      setTags(initialData.tags || []);
      setSelectedEntities(initialData.entities || []);
      setSelectedPages(initialData.pages || []);
      setSelectedFeatures(initialData.features || []);
      setEntityRelationships(initialData.entity_relationships || []);
      setWorkflows(initialData.workflows || []);
    }
  }, [initialData]);

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleEnhanceSummary = async () => {
    if (!description.trim()) {
      toast.error("Enter a description first");
      return;
    }
    
    setIsEnhancing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a business analyst. Take this business description and create a clear, concise summary that captures the key aspects without any bloat:

Business Type: ${name}
Category: ${category}
Description: ${description}

Create a professional summary that includes:
1. Core business purpose (1-2 sentences)
2. Key operations and processes
3. Primary stakeholders
4. Main value propositions

Keep it clear, factual, and under 200 words. Remove any marketing fluff or unnecessary adjectives.`,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" }
          }
        }
      });
      
      setSummary(result.summary);
      toast.success("Summary enhanced");
    } catch (error) {
      toast.error("Failed to enhance summary");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleOrganizeRelationships = async () => {
    if (selectedEntities.length < 2) {
      toast.error("Add at least 2 entities first");
      return;
    }
    
    setIsOrganizing(true);
    try {
      const entityList = selectedEntities.map(e => ({
        name: e.name,
        description: e.description,
        fields: e.schema?.properties ? Object.keys(e.schema.properties) : []
      }));
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a database architect. Analyze these entities and define the optimal relationships between them:

Business Type: ${name}
${summary ? `Business Summary: ${summary}` : ""}

Entities:
${JSON.stringify(entityList, null, 2)}

Define relationships that make business sense. For each relationship:
1. Identify source and target entities
2. Define relationship type (one-to-one, one-to-many, many-to-many)
3. Specify the field name for the foreign key

Also suggest optimal workflows for this business type.`,
        response_json_schema: {
          type: "object",
          properties: {
            relationships: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  source: { type: "string" },
                  target: { type: "string" },
                  type: { type: "string" },
                  field: { type: "string" },
                  description: { type: "string" }
                }
              }
            },
            workflows: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  steps: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        order: { type: "number" },
                        action: { type: "string" },
                        entity: { type: "string" },
                        description: { type: "string" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });
      
      setEntityRelationships(result.relationships || []);
      setWorkflows(result.workflows || []);
      toast.success("Relationships and workflows organized");
    } catch (error) {
      toast.error("Failed to organize");
    } finally {
      setIsOrganizing(false);
    }
  };

  const addEntityFromLibrary = (template) => {
    const newEntity = {
      template_id: template.id,
      name: template.name,
      description: template.description,
      category: template.category,
      schema: template.schema,
      relationships: template.relationships || []
    };
    setSelectedEntities([...selectedEntities, newEntity]);
  };

  const addPageFromLibrary = (template) => {
    const newPage = {
      template_id: template.id,
      name: template.name,
      description: template.description,
      category: template.category,
      layout: template.layout,
      entities_used: template.entities_used || [],
      features: template.features || [],
      components: template.components || [],
      actions: template.actions || []
    };
    setSelectedPages([...selectedPages, newPage]);
  };

  const addFeatureFromLibrary = (template) => {
    const newFeature = {
      template_id: template.id,
      name: template.name,
      description: template.description,
      category: template.category,
      complexity: template.complexity,
      entities_used: template.entities_used || [],
      triggers: template.triggers || [],
      integrations: template.integrations || []
    };
    setSelectedFeatures([...selectedFeatures, newFeature]);
  };

  const updateEntity = (index, updatedEntity) => {
    const updated = [...selectedEntities];
    updated[index] = updatedEntity;
    setSelectedEntities(updated);
    setEditingEntity(null);
  };

  const updatePage = (index, updatedPage) => {
    const updated = [...selectedPages];
    updated[index] = updatedPage;
    setSelectedPages(updated);
    setEditingPage(null);
  };

  const updateFeature = (index, updatedFeature) => {
    const updated = [...selectedFeatures];
    updated[index] = updatedFeature;
    setSelectedFeatures(updated);
    setEditingFeature(null);
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    
    onSave({
      name,
      description,
      summary,
      category,
      tags,
      entities: selectedEntities,
      pages: selectedPages,
      features: selectedFeatures,
      entity_relationships: entityRelationships,
      workflows,
      is_active: true
    });
  };

  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-6 pb-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[var(--color-midnight)]">Template Name *</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Construction Company" />
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--color-midnight)]">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description with AI Enhance */}
          <div>
            <label className="text-sm font-medium text-[var(--color-midnight)]">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this business type..."
              rows={3}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-[var(--color-midnight)]">Business Summary</label>
              <Button size="sm" variant="outline" onClick={handleEnhanceSummary} disabled={isEnhancing}>
                {isEnhancing ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}
                AI Enhance
              </Button>
            </div>
            <Textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="AI-enhanced summary will appear here..."
              rows={4}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium text-[var(--color-midnight)]">Tags</label>
            <div className="flex gap-2 mt-1">
              <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Add tag..." onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} />
              <Button variant="outline" onClick={addTag}><Plus className="h-4 w-4" /></Button>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">{tag}<button onClick={() => setTags(tags.filter(t => t !== tag))} className="hover:text-[var(--color-destructive)]">×</button></Badge>
              ))}
            </div>
          </div>

          {/* Tabbed Content Selection */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="entities" className="gap-2">
                <Database className="h-4 w-4" />
                Entities ({selectedEntities.length})
              </TabsTrigger>
              <TabsTrigger value="pages" className="gap-2">
                <Layout className="h-4 w-4" />
                Pages ({selectedPages.length})
              </TabsTrigger>
              <TabsTrigger value="features" className="gap-2">
                <Zap className="h-4 w-4" />
                Features ({selectedFeatures.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="entities" className="mt-4">
              <LibrarySelector
                title="Select Entities"
                items={entityTemplates}
                selectedItems={selectedEntities}
                onAdd={addEntityFromLibrary}
                onRemove={(idx) => setSelectedEntities(selectedEntities.filter((_, i) => i !== idx))}
                onEdit={(idx) => setEditingEntity(idx)}
                icon={Database}
              />
            </TabsContent>

            <TabsContent value="pages" className="mt-4">
              <LibrarySelector
                title="Select Pages"
                items={pageTemplates}
                selectedItems={selectedPages}
                onAdd={addPageFromLibrary}
                onRemove={(idx) => setSelectedPages(selectedPages.filter((_, i) => i !== idx))}
                onEdit={(idx) => setEditingPage(idx)}
                icon={Layout}
              />
            </TabsContent>

            <TabsContent value="features" className="mt-4">
              <LibrarySelector
                title="Select Features"
                items={featureTemplates}
                selectedItems={selectedFeatures}
                onAdd={addFeatureFromLibrary}
                onRemove={(idx) => setSelectedFeatures(selectedFeatures.filter((_, i) => i !== idx))}
                onEdit={(idx) => setEditingFeature(idx)}
                icon={Zap}
              />
            </TabsContent>
          </Tabs>

          {/* AI Dependency Analyzer */}
          {selectedEntities.length >= 1 && (
            <AIDependencyAnalyzer
              selectedEntities={selectedEntities}
              selectedPages={selectedPages}
              selectedFeatures={selectedFeatures}
              selectedWorkflows={workflows}
              allEntities={entityTemplates}
              allPages={pageTemplates}
              allFeatures={featureTemplates}
              allWorkflows={workflowTemplates}
              allForms={formTemplates}
              allChecklists={checklistTemplates}
              onApplySuggestions={(suggestions) => {
                if (suggestions.entities?.length > 0) {
                  const newEntities = suggestions.entities.map(e => ({
                    template_id: e.id,
                    name: e.name,
                    description: e.description,
                    category: e.category,
                    schema: e.schema,
                    relationships: e.relationships || []
                  }));
                  setSelectedEntities([...selectedEntities, ...newEntities]);
                }
                if (suggestions.pages?.length > 0) {
                  const newPages = suggestions.pages.map(p => ({
                    template_id: p.id,
                    name: p.name,
                    description: p.description,
                    category: p.category,
                    layout: p.layout,
                    entities_used: p.entities_used || [],
                    features: p.features || [],
                  }));
                  setSelectedPages([...selectedPages, ...newPages]);
                }
                if (suggestions.features?.length > 0) {
                  const newFeatures = suggestions.features.map(f => ({
                    template_id: f.id,
                    name: f.name,
                    description: f.description,
                    category: f.category,
                    complexity: f.complexity,
                    entities_used: f.entities_used || [],
                  }));
                  setSelectedFeatures([...selectedFeatures, ...newFeatures]);
                }
                toast.success("Suggestions applied");
              }}
            />
          )}

          {/* AI Organize Section */}
          {selectedEntities.length >= 2 && (
            <Card className="bg-[var(--color-accent)]/10 border-[var(--color-accent)]">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium flex items-center gap-2 text-[var(--color-midnight)]">
                      <GitBranch className="h-4 w-4 text-[var(--color-accent-dark)]" />
                      Entity Relationships & Workflows
                    </h4>
                    <p className="text-sm text-[var(--color-charcoal)]">
                      {entityRelationships.length} relationships, {workflows.length} workflows defined
                    </p>
                  </div>
                  <Button onClick={handleOrganizeRelationships} disabled={isOrganizing} variant="outline">
                    {isOrganizing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                    AI Organize
                  </Button>
                </div>
                
                {entityRelationships.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {entityRelationships.map((rel, idx) => (
                      <div key={idx} className="text-xs bg-[var(--color-background-paper)] rounded px-2 py-1 flex items-center gap-2">
                        <span className="font-medium text-[var(--color-midnight)]">{rel.source}</span>
                        <span className="text-[var(--color-charcoal)]">→</span>
                        <Badge variant="outline" className="text-xs">{rel.type}</Badge>
                        <span className="text-[var(--color-charcoal)]">→</span>
                        <span className="font-medium text-[var(--color-midnight)]">{rel.target}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {workflows.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {workflows.map((wf, idx) => (
                      <Badge key={idx} variant="secondary" className="gap-1">
                        <Play className="h-3 w-3" />
                        {wf.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>

      <div className="flex justify-end gap-2 pt-4 border-t border-[var(--color-background-muted)] mt-4">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave} disabled={!name.trim() || isSaving} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white">
          {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save Template
        </Button>
      </div>

      {/* Editors */}
      {editingEntity !== null && (
        <TemplateEntityEditor
          entity={selectedEntities[editingEntity]}
          onSave={(updated) => updateEntity(editingEntity, updated)}
          onCancel={() => setEditingEntity(null)}
        />
      )}
      {editingPage !== null && (
        <TemplatePageEditor
          page={selectedPages[editingPage]}
          entities={selectedEntities}
          onSave={(updated) => updatePage(editingPage, updated)}
          onCancel={() => setEditingPage(null)}
        />
      )}
      {editingFeature !== null && (
        <TemplateFeatureEditor
          feature={selectedFeatures[editingFeature]}
          entities={selectedEntities}
          onSave={(updated) => updateFeature(editingFeature, updated)}
          onCancel={() => setEditingFeature(null)}
        />
      )}
    </div>
  );
}

function LibrarySelector({ title, items, selectedItems, onAdd, onRemove, onEdit, icon: Icon }) {
  const [showLibrary, setShowLibrary] = useState(false);
  
  const availableItems = items.filter(item => 
    !selectedItems.some(s => s.template_id === item.id || s.name === item.name)
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--color-midnight)]">{title}</span>
        <Button size="sm" variant="outline" onClick={() => setShowLibrary(!showLibrary)}>
          <Plus className="h-3 w-3 mr-1" />
          Add from Library
        </Button>
      </div>

      {showLibrary && availableItems.length > 0 && (
        <div className="grid grid-cols-2 gap-2 p-3 bg-[var(--color-background)] rounded-lg max-h-48 overflow-y-auto">
          {availableItems.map((item) => (
            <Card key={item.id} className="cursor-pointer hover:bg-[var(--color-primary)]/10 transition-colors" onClick={() => { onAdd(item); setShowLibrary(false); }}>
              <CardContent className="p-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-3 w-3 text-[var(--color-charcoal)]" />
                  <span className="text-sm font-medium truncate text-[var(--color-midnight)]">{item.name}</span>
                </div>
                <p className="text-xs text-[var(--color-charcoal)] truncate mt-1">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedItems.length === 0 ? (
        <p className="text-sm text-[var(--color-charcoal)] text-center py-4">No items selected</p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {selectedItems.map((item, idx) => (
            <Card key={idx} className="relative group">
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-[var(--color-primary)] flex-shrink-0" />
                      <span className="font-medium text-sm truncate text-[var(--color-midnight)]">{item.name}</span>
                    </div>
                    <p className="text-xs text-[var(--color-charcoal)] mt-1 line-clamp-2">{item.description}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onEdit(idx)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6 text-[var(--color-destructive)]" onClick={() => onRemove(idx)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}