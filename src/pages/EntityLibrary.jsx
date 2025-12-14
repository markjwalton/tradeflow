import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Database, Sparkles, Trash2, Edit, Copy, Loader2, Star, BookmarkPlus, Folder, Layout, Zap, Check, FolderPlus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import EntityBuilder from "@/components/library/EntityBuilder";
import CustomProjectSelector from "@/components/library/CustomProjectSelector";
import AddGroupToProjectDialog from "@/components/library/AddGroupToProjectDialog";
import { PageHeader } from "@/components/sturij";

const categories = ["Core", "CRM", "Finance", "Operations", "HR", "Inventory", "Communication", "Custom", "Other"];

const categoryColors = {
  Core: "bg-info-50 text-info",
  CRM: "bg-success-50 text-success",
  Finance: "bg-warning/10 text-warning",
  Operations: "bg-accent-100 text-accent",
  HR: "bg-accent-100 text-accent",
  Inventory: "bg-warning/10 text-warning",
  Communication: "bg-info-50 text-info",
  Custom: "bg-primary/10 text-primary",
  Other: "bg-muted text-muted-foreground",
};

export default function EntityLibrary() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingEntity, setEditingEntity] = useState(null);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [addToProjectEntity, setAddToProjectEntity] = useState(null);
  const [addToProjectSelectedPages, setAddToProjectSelectedPages] = useState([]);
  const [addToProjectSelectedFeatures, setAddToProjectSelectedFeatures] = useState([]);
  const [addToProjectTargetId, setAddToProjectTargetId] = useState(null);
  const [addGroupToProject, setAddGroupToProject] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  const { data: entities = [], isLoading } = useQuery({
    queryKey: ["entityTemplates"],
    queryFn: () => base44.entities.EntityTemplate.list(),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["customProjects"],
    queryFn: () => base44.entities.CustomProject.list(),
  });

  const { data: pageTemplates = [] } = useQuery({
    queryKey: ["pageTemplates"],
    queryFn: () => base44.entities.PageTemplate.list(),
  });

  const { data: featureTemplates = [] } = useQuery({
    queryKey: ["featureTemplates"],
    queryFn: () => base44.entities.FeatureTemplate.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.EntityTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entityTemplates"] });
      setShowBuilder(false);
      setEditingEntity(null);
      toast.success("Entity template saved");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.EntityTemplate.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entityTemplates"] });
      setShowBuilder(false);
      setEditingEntity(null);
      toast.success("Entity template updated");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.EntityTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entityTemplates"] });
      toast.success("Entity template deleted");
    },
  });

  // Get unique groups from entities
  const availableGroups = [...new Set(entities.filter(e => e.group).map(e => e.group))].sort();

  // Filter entities based on project selection
  const filteredEntities = entities.filter((entity) => {
    const matchesSearch = entity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entity.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || entity.category === selectedCategory;
    const matchesGroup = selectedGroup === "all" || entity.group === selectedGroup || (selectedGroup === "ungrouped" && !entity.group);
    
    // Project filter
    if (selectedProjectId) {
      return matchesSearch && matchesCategory && matchesGroup && entity.custom_project_id === selectedProjectId;
    } else {
      // Default library - show non-custom or global items
      return matchesSearch && matchesCategory && matchesGroup && !entity.custom_project_id;
    }
  });

  const groupedEntities = filteredEntities.reduce((acc, entity) => {
    // Group by "Category / Group" for better organization
    let groupKey;
    if (entity.group && entity.category) {
      groupKey = `${entity.category} / ${entity.group}`;
    } else {
      groupKey = entity.category || entity.group || "Other";
    }
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(entity);
    return acc;
  }, {});

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEntities = filteredEntities.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredEntities.length / itemsPerPage);

  const paginatedGroupedEntities = paginatedEntities.reduce((acc, entity) => {
    let groupKey;
    if (entity.group && entity.category) {
      groupKey = `${entity.category} / ${entity.group}`;
    } else {
      groupKey = entity.category || entity.group || "Other";
    }
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(entity);
    return acc;
  }, {});

  const handleSaveEntity = (entityData) => {
    // Add project info if custom project selected
    const dataToSave = {
      ...entityData,
      custom_project_id: selectedProjectId || null,
      is_custom: !!selectedProjectId,
      category: selectedProjectId ? "Custom" : entityData.category
    };
    
    if (editingEntity?.id) {
      updateMutation.mutate({ id: editingEntity.id, data: dataToSave });
    } else {
      createMutation.mutate(dataToSave);
    }
  };

  const handleSaveToLibrary = (entity) => {
    const libraryEntity = {
      ...entity,
      custom_project_id: null,
      is_custom: false,
      is_global: true,
      name: entity.name + " (Library)"
    };
    delete libraryEntity.id;
    delete libraryEntity.created_date;
    delete libraryEntity.updated_date;
    createMutation.mutate(libraryEntity);
    toast.success("Saved to default library");
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert database architect. Based on this description, generate an entity schema:

"${aiPrompt}"

Return a JSON object with:
- name: PascalCase entity name
- description: Brief description
- category: One of [Core, CRM, Finance, Operations, HR, Inventory, Communication, Other]
- schema: A complete JSON schema object with:
  - name: Same as above
  - type: "object"
  - properties: Object with field definitions (each field has type, description, and optionally enum, default, format)
  - required: Array of required field names
- relationships: Array of {target_entity, relationship_type, field_name} if applicable
- tags: Array of relevant tags`,
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            category: { type: "string" },
            schema: { type: "object" },
            relationships: { type: "array", items: { type: "object" } },
            tags: { type: "array", items: { type: "string" } }
          }
        }
      });

      setEditingEntity(result);
      setShowAIDialog(false);
      setShowBuilder(true);
      setAiPrompt("");
      toast.success("Entity generated! Review and save.");
    } catch (error) {
      toast.error("Failed to generate entity");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDuplicate = (entity) => {
    const duplicate = {
      ...entity,
      name: entity.name + " Copy",
      schema: { ...entity.schema, name: entity.name + " Copy" },
      custom_project_id: selectedProjectId || entity.custom_project_id,
      is_custom: !!selectedProjectId || entity.is_custom
    };
    delete duplicate.id;
    delete duplicate.created_date;
    delete duplicate.updated_date;
    createMutation.mutate(duplicate);
  };

  const currentProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="max-w-7xl mx-auto -mt-6 min-h-screen">
      <PageHeader 
        title={currentProject ? `Entity Library: ${currentProject.name}` : "Entity Library"}
        description="Reusable entity templates for business applications"
      />

      <Card className="border-border mb-4">
        <CardContent className="px-2 py-1">
          <div className="flex gap-2">
            <CustomProjectSelector
              selectedProjectId={selectedProjectId}
              onSelectProject={setSelectedProjectId}
            />
            <Button 
              variant="ghost"
              className="hover:bg-[#e9efeb] hover:text-[#273e2d]"
              onClick={() => setShowAIDialog(true)}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              AI Generate
            </Button>
            <Button 
              variant="ghost"
              className="hover:bg-[#e9efeb] hover:text-[#273e2d]"
              onClick={() => { setEditingEntity(null); setShowBuilder(true); }}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Entity
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search entities..."
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

      {/* Entity Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : filteredEntities.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No entity templates found</p>
          <p className="text-sm mt-1">Create your first entity or use AI to generate one</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredEntities.length)} of {filteredEntities.length} entities
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
          <div className="space-y-8">
          {Object.entries(paginatedGroupedEntities).map(([groupName, groupEntities]) => (
            <div key={groupName}>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Badge className={categoryColors[groupName] || "bg-muted text-muted-foreground"}>{groupName}</Badge>
                  <span className="text-muted-foreground text-sm font-normal">({groupEntities.length})</span>
                </h2>
                {!selectedProjectId && projects.length > 0 && availableGroups.includes(groupName) && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1"
                    onClick={() => setAddGroupToProject(groupName)}
                  >
                    <FolderPlus className="h-3 w-3" />
                    Add Group
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupEntities.map((entity) => (
                  <Card key={entity.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Database className="h-4 w-4 text-accent" />
                            {entity.name}
                            {entity.is_custom && (
                              <Badge variant="outline" className="text-xs">Custom</Badge>
                            )}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">{entity.description}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-1 mb-3">
                        {entity.tags?.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground mb-3">
                        {Object.keys(entity.schema?.properties || {}).length} fields
                        {entity.relationships?.length > 0 && ` · ${entity.relationships.length} relationships`}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => { setEditingEntity(entity); setShowBuilder(true); }}
                          title="Edit"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDuplicate(entity)}
                          title="Duplicate"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        {!entity.custom_project_id && projects.length > 0 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setAddToProjectEntity(entity)}
                            title="Add to Project"
                            className="text-primary"
                          >
                            <Folder className="h-3 w-3" />
                          </Button>
                        )}
                        {entity.is_custom && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSaveToLibrary(entity)}
                            title="Save to default library"
                          >
                            <BookmarkPlus className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteMutation.mutate(entity.id)}
                          title="Delete"
                        >
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
        </>
      )}

      {/* Entity Builder Dialog */}
      <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
            {editingEntity?.id ? "Edit Entity" : "Create Entity"}
            {selectedProjectId && currentProject && (
              <Badge className="ml-2 bg-primary/10 text-primary">{currentProject.name}</Badge>
            )}
            </DialogTitle>
          </DialogHeader>
          <EntityBuilder
            initialData={editingEntity}
            onSave={handleSaveEntity}
            onCancel={() => { setShowBuilder(false); setEditingEntity(null); }}
            isSaving={createMutation.isPending || updateMutation.isPending}
            existingGroups={availableGroups}
          />
        </DialogContent>
      </Dialog>

      {/* Add to Project Dialog */}
      <Dialog open={!!addToProjectEntity} onOpenChange={(v) => {
        if (!v) {
          setAddToProjectEntity(null);
          setAddToProjectSelectedPages([]);
          setAddToProjectSelectedFeatures([]);
          setAddToProjectTargetId(null);
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5 text-primary" />
              Add "{addToProjectEntity?.name}" to Project
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Step 1: Select Project */}
            {!addToProjectTargetId ? (
              <>
                <p className="text-sm text-muted-foreground">Select a custom project:</p>
                <div className="space-y-2">
                  {projects.map((project) => (
                    <Button
                      key={project.id}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setAddToProjectTargetId(project.id)}
                    >
                      <Folder className="h-4 w-4 mr-2" />
                      {project.name}
                    </Button>
                  ))}
                </div>
              </>
            ) : (
              <>
                {/* Step 2: Select Related Items */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-primary/10 p-2 rounded">
                  <Check className="h-4 w-4 text-primary" />
                  Adding to: <strong>{projects.find(p => p.id === addToProjectTargetId)?.name}</strong>
                  <Button variant="ghost" size="sm" className="ml-auto h-6 text-xs" onClick={() => setAddToProjectTargetId(null)}>Change</Button>
                </div>

                {/* Related Entities (from relationships) */}
                {(() => {
                  const relationships = addToProjectEntity?.relationships || [];
                  const relatedEntityNames = relationships.map(r => r.target_entity);
                  const relatedEntities = entities.filter(e => 
                    relatedEntityNames.includes(e.name) && !e.custom_project_id
                  );
                  if (relatedEntities.length === 0) return null;
                  return (
                    <div>
                      <label className="text-sm font-medium flex items-center gap-2 mb-2">
                        <Database className="h-4 w-4 text-accent" />
                        Related Entities ({relatedEntities.length})
                      </label>
                      <div className="space-y-1 max-h-32 overflow-auto border rounded p-2">
                        {relatedEntities.map((entity) => {
                          const rel = relationships.find(r => r.target_entity === entity.name);
                          return (
                            <div key={entity.id} className="flex items-center gap-2">
                              <Checkbox
                                id={`entity-${entity.id}`}
                                checked={addToProjectSelectedPages.includes(`entity-${entity.id}`)}
                                onCheckedChange={(checked) => {
                                  setAddToProjectSelectedPages(prev => 
                                    checked ? [...prev, `entity-${entity.id}`] : prev.filter(id => id !== `entity-${entity.id}`)
                                  );
                                }}
                              />
                              <label htmlFor={`entity-${entity.id}`} className="text-sm cursor-pointer flex-1">{entity.name}</label>
                              <Badge variant="outline" className="text-xs">{rel?.relationship_type || "related"}</Badge>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* No related items message */}
                {(!addToProjectEntity?.relationships || addToProjectEntity.relationships.length === 0) && (
                  <p className="text-sm text-muted-foreground italic">No direct relationships defined for this entity. Use AI Dependency Analyzer in Business Templates to find suggested connections.</p>
                )}

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => {
                    setAddToProjectEntity(null);
                    setAddToProjectSelectedPages([]);
                    setAddToProjectSelectedFeatures([]);
                    setAddToProjectTargetId(null);
                  }}>
                    Cancel
                  </Button>
                  <Button className="flex-1" onClick={async () => {
                    const projectId = addToProjectTargetId;
                    const projectName = projects.find(p => p.id === projectId)?.name;
                    
                    // Get existing entities in project to avoid duplicates
                    const existingInProject = entities.filter(e => e.custom_project_id === projectId);
                    const existingNames = existingInProject.map(e => e.name);
                    
                    let addedCount = 0;
                    let skippedCount = 0;
                    
                    // Add main entity if not already in project
                    if (!existingNames.includes(addToProjectEntity.name)) {
                      const entityCopy = { ...addToProjectEntity, custom_project_id: projectId, is_custom: true, category: "Custom" };
                      delete entityCopy.id;
                      delete entityCopy.created_date;
                      delete entityCopy.updated_date;
                      await base44.entities.EntityTemplate.create(entityCopy);
                      addedCount++;
                    } else {
                      skippedCount++;
                    }
                    
                    // Add selected related entities (skip if already exists)
                    for (const selectedId of addToProjectSelectedPages) {
                      if (selectedId.startsWith('entity-')) {
                        const entityId = selectedId.replace('entity-', '');
                        const relatedEntity = entities.find(e => e.id === entityId);
                        if (relatedEntity) {
                          if (!existingNames.includes(relatedEntity.name)) {
                            const relEntityCopy = { ...relatedEntity, custom_project_id: projectId, is_custom: true, category: "Custom" };
                            delete relEntityCopy.id;
                            delete relEntityCopy.created_date;
                            delete relEntityCopy.updated_date;
                            await base44.entities.EntityTemplate.create(relEntityCopy);
                            addedCount++;
                          } else {
                            skippedCount++;
                          }
                        }
                      }
                    }
                    
                    queryClient.invalidateQueries({ queryKey: ["entityTemplates"] });
                    
                    if (addedCount > 0 && skippedCount > 0) {
                      toast.success(`Added ${addedCount} entit${addedCount > 1 ? 'ies' : 'y'} to ${projectName} (${skippedCount} already existed)`);
                    } else if (addedCount > 0) {
                      toast.success(`Added ${addedCount} entit${addedCount > 1 ? 'ies' : 'y'} to ${projectName}`);
                    } else {
                      toast.info(`All entities already exist in ${projectName}`);
                    }
                    
                    setAddToProjectEntity(null);
                    setAddToProjectSelectedPages([]);
                    setAddToProjectSelectedFeatures([]);
                    setAddToProjectTargetId(null);
                  }}>
                    Add to Project
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Group to Project Dialog */}
      <AddGroupToProjectDialog
        open={!!addGroupToProject}
        onOpenChange={(v) => !v && setAddGroupToProject(null)}
        groupName={addGroupToProject}
        entities={entities.filter(e => e.group === addGroupToProject && !e.custom_project_id)}
        pages={pageTemplates.filter(p => p.group === addGroupToProject && !p.custom_project_id)}
        features={featureTemplates.filter(f => f.group === addGroupToProject && !f.custom_project_id)}
        projects={projects}
        allEntities={entities}
        allPages={pageTemplates}
        allFeatures={featureTemplates}
      />

      {/* AI Generate Dialog */}
      <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              Generate Entity with AI
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Describe the entity you need...&#10;&#10;Example: I need an entity to track invoices with customer reference, line items, amounts, due date, and payment status"
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
    </div>
  );
}