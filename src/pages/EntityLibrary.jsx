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
import { Plus, Search, Database, Sparkles, Trash2, Edit, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import EntityBuilder from "@/components/library/EntityBuilder";

const categories = ["Core", "CRM", "Finance", "Operations", "HR", "Inventory", "Communication", "Other"];

const categoryColors = {
  Core: "bg-blue-100 text-blue-800",
  CRM: "bg-green-100 text-green-800",
  Finance: "bg-yellow-100 text-yellow-800",
  Operations: "bg-purple-100 text-purple-800",
  HR: "bg-pink-100 text-pink-800",
  Inventory: "bg-orange-100 text-orange-800",
  Communication: "bg-cyan-100 text-cyan-800",
  Other: "bg-gray-100 text-gray-800",
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

  const { data: entities = [], isLoading } = useQuery({
    queryKey: ["entityTemplates"],
    queryFn: () => base44.entities.EntityTemplate.list(),
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

  const filteredEntities = entities.filter((entity) => {
    const matchesSearch = entity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entity.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || entity.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedEntities = filteredEntities.reduce((acc, entity) => {
    const cat = entity.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(entity);
    return acc;
  }, {});

  const handleSaveEntity = (entityData) => {
    if (editingEntity) {
      updateMutation.mutate({ id: editingEntity.id, data: entityData });
    } else {
      createMutation.mutate(entityData);
    }
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
      schema: { ...entity.schema, name: entity.name + " Copy" }
    };
    delete duplicate.id;
    delete duplicate.created_date;
    delete duplicate.updated_date;
    createMutation.mutate(duplicate);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Entity Library</h1>
          <p className="text-gray-500">Reusable entity templates for business applications</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAIDialog(true)}>
            <Sparkles className="h-4 w-4 mr-2" />
            AI Generate
          </Button>
          <Button onClick={() => { setEditingEntity(null); setShowBuilder(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            New Entity
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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
      </div>

      {/* Entity Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : filteredEntities.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No entity templates found</p>
          <p className="text-sm mt-1">Create your first entity or use AI to generate one</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedEntities).map(([category, categoryEntities]) => (
            <div key={category}>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Badge className={categoryColors[category]}>{category}</Badge>
                <span className="text-gray-400 text-sm font-normal">({categoryEntities.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryEntities.map((entity) => (
                  <Card key={entity.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Database className="h-4 w-4 text-purple-600" />
                            {entity.name}
                          </CardTitle>
                          <p className="text-sm text-gray-500 mt-1">{entity.description}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-1 mb-3">
                        {entity.tags?.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 mb-3">
                        {Object.keys(entity.schema?.properties || {}).length} fields
                        {entity.relationships?.length > 0 && ` · ${entity.relationships.length} relationships`}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => { setEditingEntity(entity); setShowBuilder(true); }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDuplicate(entity)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => deleteMutation.mutate(entity.id)}
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
      )}

      {/* Entity Builder Dialog */}
      <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingEntity?.id ? "Edit Entity" : "Create Entity"}</DialogTitle>
          </DialogHeader>
          <EntityBuilder
            initialData={editingEntity}
            onSave={handleSaveEntity}
            onCancel={() => { setShowBuilder(false); setEditingEntity(null); }}
            isSaving={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* AI Generate Dialog */}
      <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
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