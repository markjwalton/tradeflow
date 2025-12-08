import React, { useState, useEffect, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Card } from "@/components/ui/card";
import { 
  Plus, 
  Loader2, 
  Database, 
  Sparkles, 
  ZoomIn, 
  ZoomOut, 
  Maximize2,
  RotateCcw,
  Download,
  Upload,
  Link2,
  Trash2,
  Edit,
  Eye,
  Grid3X3,
  Save
} from "lucide-react";
import { toast } from "sonner";
import CustomProjectSelector from "@/components/library/CustomProjectSelector";
import ERDCanvas from "@/components/erd/ERDCanvas";
import ERDEntityEditor from "@/components/erd/ERDEntityEditor";
import ERDRelationshipEditor from "@/components/erd/ERDRelationshipEditor";
import AddFromLibraryDialog from "@/components/erd/AddFromLibraryDialog";

export default function ERDEditor() {
  const queryClient = useQueryClient();
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedEntityId, setSelectedEntityId] = useState(null);
  const [selectedRelationship, setSelectedRelationship] = useState(null);
  const [showEntityEditor, setShowEntityEditor] = useState(false);
  const [showRelationshipEditor, setShowRelationshipEditor] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionSource, setConnectionSource] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [erdPositions, setErdPositions] = useState({});
  const [showLibraryDialog, setShowLibraryDialog] = useState(false);
  const [isAddingFromLibrary, setIsAddingFromLibrary] = useState(false);

  // Fetch entities for selected project
  const { data: entities = [], isLoading } = useQuery({
    queryKey: ["entityTemplates", selectedProjectId],
    queryFn: async () => {
      if (selectedProjectId) {
        return base44.entities.EntityTemplate.filter({ custom_project_id: selectedProjectId });
      }
      return base44.entities.EntityTemplate.filter({ custom_project_id: null });
    },
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["customProjects"],
    queryFn: () => base44.entities.CustomProject.list(),
  });

  const updateEntityMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.EntityTemplate.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entityTemplates"] });
      toast.success("Entity updated");
    },
  });

  const createEntityMutation = useMutation({
    mutationFn: (data) => base44.entities.EntityTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entityTemplates"] });
      toast.success("Entity created");
    },
  });

  const deleteEntityMutation = useMutation({
    mutationFn: (id) => base44.entities.EntityTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entityTemplates"] });
      setSelectedEntityId(null);
      toast.success("Entity deleted");
    },
  });

  // Extract all relationships from entities
  const relationships = entities.flatMap(entity => 
    (entity.relationships || []).map(rel => ({
      id: `${entity.id}-${rel.target_entity}-${rel.field_name}`,
      sourceEntity: entity.name,
      sourceEntityId: entity.id,
      targetEntity: rel.target_entity,
      targetEntityId: entities.find(e => e.name === rel.target_entity)?.id,
      relationshipType: rel.relationship_type,
      fieldName: rel.field_name,
    }))
  );

  const selectedEntity = entities.find(e => e.id === selectedEntityId);
  const currentProject = projects.find(p => p.id === selectedProjectId);

  // Handle entity position update
  const handleUpdateEntityPosition = (entityId, x, y) => {
    setErdPositions(prev => ({
      ...prev,
      [entityId]: { x, y }
    }));
  };

  // Handle entity selection
  const handleSelectEntity = (entityId) => {
    if (isConnecting && connectionSource) {
      if (entityId !== connectionSource) {
        // Create relationship
        const sourceEntity = entities.find(e => e.id === connectionSource);
        const targetEntity = entities.find(e => e.id === entityId);
        if (sourceEntity && targetEntity) {
          setSelectedRelationship({
            sourceEntity: sourceEntity,
            targetEntity: targetEntity,
            isNew: true,
          });
          setShowRelationshipEditor(true);
        }
      }
      setIsConnecting(false);
      setConnectionSource(null);
    } else {
      setSelectedEntityId(entityId);
      setSelectedRelationship(null);
    }
  };

  // Start connection mode
  const handleStartConnection = () => {
    if (selectedEntityId) {
      setIsConnecting(true);
      setConnectionSource(selectedEntityId);
      toast.info("Click on target entity to create relationship");
    } else {
      toast.error("Select an entity first");
    }
  };

  // Auto-layout entities
  const handleAutoLayout = () => {
    const newPositions = {};
    const cols = Math.ceil(Math.sqrt(entities.length));
    const spacingX = 320;
    const spacingY = 280;
    
    entities.forEach((entity, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      newPositions[entity.id] = {
        x: 100 + col * spacingX,
        y: 100 + row * spacingY,
      };
    });
    
    setErdPositions(newPositions);
    toast.success("Layout applied");
  };

  // AI Generate relationships
  const handleAIAnalyze = async () => {
    if (entities.length < 2) {
      toast.error("Need at least 2 entities to analyze relationships");
      return;
    }

    setIsGenerating(true);
    try {
      const entitySummary = entities.map(e => ({
        name: e.name,
        description: e.description,
        fields: Object.keys(e.schema?.properties || {}).join(", "),
        existingRelationships: e.relationships?.map(r => `${r.target_entity} (${r.relationship_type})`).join(", ") || "none"
      }));

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a database architect. Analyze these entities and suggest NEW relationships that are missing.

ENTITIES:
${JSON.stringify(entitySummary, null, 2)}

Identify logical relationships between entities that aren't already defined. Consider:
- Foreign key relationships (one-to-many)
- Many-to-many relationships
- One-to-one relationships

Return a JSON object with a "suggestions" array where each item has:
- sourceEntity: name of the source entity
- targetEntity: name of the target entity  
- relationshipType: "one-to-one", "one-to-many", or "many-to-many"
- fieldName: suggested field name for the foreign key
- reason: brief explanation

Only suggest NEW relationships not already in existingRelationships.`,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  sourceEntity: { type: "string" },
                  targetEntity: { type: "string" },
                  relationshipType: { type: "string" },
                  fieldName: { type: "string" },
                  reason: { type: "string" }
                }
              }
            }
          }
        }
      });

      const suggestions = result.suggestions || [];
      if (suggestions.length === 0) {
        toast.info("No new relationships suggested - your model looks complete!");
        return;
      }

      // Show suggestions and let user apply them
      for (const suggestion of suggestions) {
        const sourceEntity = entities.find(e => e.name === suggestion.sourceEntity);
        if (sourceEntity) {
          const existingRels = sourceEntity.relationships || [];
          const alreadyExists = existingRels.some(r => 
            r.target_entity === suggestion.targetEntity && r.field_name === suggestion.fieldName
          );
          
          if (!alreadyExists) {
            await updateEntityMutation.mutateAsync({
              id: sourceEntity.id,
              data: {
                relationships: [
                  ...existingRels,
                  {
                    target_entity: suggestion.targetEntity,
                    relationship_type: suggestion.relationshipType,
                    field_name: suggestion.fieldName
                  }
                ]
              }
            });
          }
        }
      }

      toast.success(`Added ${suggestions.length} relationship suggestions`);
    } catch (error) {
      toast.error("Failed to analyze relationships");
    } finally {
      setIsGenerating(false);
    }
  };

  // Add new entity
  const handleAddEntity = () => {
    setSelectedEntityId(null);
    setShowEntityEditor(true);
  };

  // Add entities from library
  const handleAddFromLibrary = async (libraryEntities) => {
    setIsAddingFromLibrary(true);
    try {
      for (const entity of libraryEntities) {
        await createEntityMutation.mutateAsync({
          name: entity.name,
          description: entity.description,
          category: entity.category,
          group: entity.group,
          schema: entity.schema,
          relationships: entity.relationships || [],
          tags: entity.tags || [],
          custom_project_id: selectedProjectId || null,
          is_custom: !!selectedProjectId,
        });
      }
      toast.success(`Added ${libraryEntities.length} entities from library`);
      setShowLibraryDialog(false);
    } catch (error) {
      toast.error("Failed to add entities");
    } finally {
      setIsAddingFromLibrary(false);
    }
  };

  // Save entity from editor
  const handleSaveEntity = (entityData) => {
    const data = {
      ...entityData,
      custom_project_id: selectedProjectId || null,
      is_custom: !!selectedProjectId,
    };

    if (selectedEntityId) {
      updateEntityMutation.mutate({ id: selectedEntityId, data });
    } else {
      createEntityMutation.mutate(data);
    }
    setShowEntityEditor(false);
  };

  // Save relationship
  const handleSaveRelationship = (sourceEntityId, relationship) => {
    const entity = entities.find(e => e.id === sourceEntityId);
    if (!entity) return;

    const existingRels = entity.relationships || [];
    updateEntityMutation.mutate({
      id: sourceEntityId,
      data: {
        relationships: [...existingRels, relationship]
      }
    });
    setShowRelationshipEditor(false);
    setSelectedRelationship(null);
  };

  // Delete relationship
  const handleDeleteRelationship = (sourceEntityId, targetEntity, fieldName) => {
    const entity = entities.find(e => e.id === sourceEntityId);
    if (!entity) return;

    const updatedRels = (entity.relationships || []).filter(r => 
      !(r.target_entity === targetEntity && r.field_name === fieldName)
    );
    
    updateEntityMutation.mutate({
      id: sourceEntityId,
      data: { relationships: updatedRels }
    });
    toast.success("Relationship deleted");
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-card border-b border-border">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold font-display flex items-center gap-2 text-midnight-900">
            <Database className="h-5 w-5 text-accent" />
            ERD Editor
          </h1>
          <CustomProjectSelector
            selectedProjectId={selectedProjectId}
            onSelectProject={setSelectedProjectId}
            showCreateOption={false}
          />
          {currentProject && (
            <Badge className="bg-info-50 text-info">{currentProject.name}</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{entities.length} Entities</Badge>
          <Badge variant="outline">{relationships.length} Relationships</Badge>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 bg-background border-b border-border">
        <Button size="sm" onClick={handleAddEntity}>
          <Plus className="h-4 w-4 mr-1" />
          Add Entity
        </Button>
        <Button size="sm" variant="outline" onClick={() => setShowLibraryDialog(true)}>
          <Database className="h-4 w-4 mr-1" />
          From Library
        </Button>
        <Button 
          size="sm" 
          variant={isConnecting ? "default" : "outline"}
          onClick={handleStartConnection}
          disabled={!selectedEntityId}
        >
          <Link2 className="h-4 w-4 mr-1" />
          {isConnecting ? "Click Target..." : "Add Relationship"}
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button size="sm" variant="outline" onClick={handleAutoLayout}>
          <Grid3X3 className="h-4 w-4 mr-1" />
          Auto Layout
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={handleAIAnalyze}
          disabled={isGenerating || entities.length < 2}
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 mr-1" />
          )}
          AI Analyze
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        {selectedEntityId && (
          <>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setShowEntityEditor(true)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className="text-destructive"
              onClick={() => {
                if (confirm("Delete this entity?")) {
                  deleteEntityMutation.mutate(selectedEntityId);
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : entities.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <Database className="h-16 w-16 mb-4 opacity-30" />
            <p className="text-lg font-medium text-foreground">No entities yet</p>
            <p className="text-sm mb-4">Add entities to start building your ERD</p>
            <Button onClick={handleAddEntity}>
              <Plus className="h-4 w-4 mr-1" />
              Add First Entity
            </Button>
          </div>
        ) : (
          <ERDCanvas
            entities={entities}
            relationships={relationships}
            positions={erdPositions}
            selectedEntityId={selectedEntityId}
            isConnecting={isConnecting}
            onSelectEntity={handleSelectEntity}
            onUpdatePosition={handleUpdateEntityPosition}
            onDoubleClickEntity={(id) => {
              setSelectedEntityId(id);
              setShowEntityEditor(true);
            }}
            onDeleteRelationship={handleDeleteRelationship}
          />
        )}
      </div>

      {/* Entity Editor Dialog */}
      <Dialog open={showEntityEditor} onOpenChange={setShowEntityEditor}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedEntityId ? "Edit Entity" : "New Entity"}
            </DialogTitle>
          </DialogHeader>
          <ERDEntityEditor
            entity={selectedEntity}
            onSave={handleSaveEntity}
            onCancel={() => setShowEntityEditor(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Relationship Editor Dialog */}
      <Dialog open={showRelationshipEditor} onOpenChange={setShowRelationshipEditor}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Relationship</DialogTitle>
          </DialogHeader>
          {selectedRelationship && (
            <ERDRelationshipEditor
              sourceEntity={selectedRelationship.sourceEntity}
              targetEntity={selectedRelationship.targetEntity}
              onSave={handleSaveRelationship}
              onCancel={() => {
                setShowRelationshipEditor(false);
                setSelectedRelationship(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Add from Library Dialog */}
      <AddFromLibraryDialog
        open={showLibraryDialog}
        onOpenChange={setShowLibraryDialog}
        onAddEntity={handleAddFromLibrary}
        existingEntityNames={entities.map(e => e.name)}
        isAdding={isAddingFromLibrary}
      />
    </div>
  );
}