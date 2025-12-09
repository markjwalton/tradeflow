import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Eye, Copy, Trash2, Settings, Layout, Sparkles, ChevronDown, ChevronUp, GripVertical, RotateCcw } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";

export default function LayoutPatternManager() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showDialog, setShowDialog] = useState(false);
  const [editingPattern, setEditingPattern] = useState(null);
  const [formData, setFormData] = useState({
    pattern_id: "",
    name: "",
    description: "",
    category: "workspace",
    entity_type: "",
    config_json: "",
    default_config_json: "",
    sample_data_json: "",
    tags: [],
    is_active: true,
    default_collapsed: false,
    order: 0,
    version: 1
  });
  const [collapsedCards, setCollapsedCards] = useState(new Set());

  const { data: patterns = [], isLoading } = useQuery({
    queryKey: ["layoutPatterns"],
    queryFn: async () => {
      const data = await base44.entities.LayoutPattern.list();
      const sorted = [...data].sort((a, b) => (a.order || 0) - (b.order || 0));
      
      // Initialize collapsed state
      const initialCollapsed = new Set();
      sorted.forEach(p => {
        if (p.default_collapsed) {
          initialCollapsed.add(p.id);
        }
      });
      setCollapsedCards(initialCollapsed);
      
      return sorted;
    }
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.LayoutPattern.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["layoutPatterns"] });
      setShowDialog(false);
      resetForm();
      toast.success("Pattern created");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.LayoutPattern.update(id, data),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["layoutPatterns"] });
      if (variables.data?.pattern_id) {
        queryClient.invalidateQueries({ queryKey: ["layoutPattern", variables.data.pattern_id] });
      }
      setShowDialog(false);
      resetForm();
      toast.success("Pattern updated");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.LayoutPattern.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["layoutPatterns"] });
      toast.success("Pattern deleted");
    }
  });

  const resetForm = () => {
    setFormData({
      pattern_id: "",
      name: "",
      description: "",
      category: "workspace",
      entity_type: "",
      config_json: "",
      default_config_json: "",
      sample_data_json: "",
      tags: [],
      is_active: true,
      default_collapsed: false,
      order: 0,
      version: 1
    });
    setEditingPattern(null);
  };

  const handleResetToDefault = () => {
    if (editingPattern?.default_config_json) {
      setFormData({ ...formData, config_json: editingPattern.default_config_json });
      toast.success("Config reset to default");
    } else {
      toast.error("No default config available");
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(filteredPatterns);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order for all items
    const updates = items.map((item, index) => 
      updateMutation.mutate({ id: item.id, data: { ...item, order: index } }, { onSuccess: () => {} })
    );

    toast.success("Pattern order updated");
    queryClient.invalidateQueries({ queryKey: ["layoutPatterns"] });
  };

  const toggleCollapse = (id) => {
    setCollapsedCards(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleEdit = (pattern) => {
    setEditingPattern(pattern);
    setFormData(pattern);
    setShowDialog(true);
  };

  const handleSubmit = () => {
    if (editingPattern) {
      updateMutation.mutate({ id: editingPattern.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleTestInBuilder = (pattern) => {
    const config = pattern.config_json;
    const data = pattern.sample_data_json || "{}";
    
    // Navigate to LayoutBuilder with pre-filled data via URL params
    const builderUrl = createPageUrl("LayoutBuilder");
    navigate(`${builderUrl}?patternId=${pattern.pattern_id}`);
  };

  const handleDuplicate = (pattern) => {
    setFormData({
      ...pattern,
      pattern_id: `${pattern.pattern_id}_copy`,
      name: `${pattern.name} (Copy)`,
      id: undefined
    });
    setEditingPattern(null);
    setShowDialog(true);
  };

  const filteredPatterns = patterns.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                         p.pattern_id.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categoryColors = {
    workspace: "bg-info-50 text-info",
    editor: "bg-secondary-100 text-secondary",
    list: "bg-accent-100 text-accent",
    detail: "bg-primary-100 text-primary"
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Layout className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-light font-display text-foreground">Layout Pattern Manager</h1>
          <Badge variant="outline" className="gap-1">
            <Sparkles className="h-3 w-3" />
            AI-Ready Patterns
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Manage reusable layout patterns for dynamic page generation
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Search patterns..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="workspace">Workspace</SelectItem>
            <SelectItem value="editor">Editor</SelectItem>
            <SelectItem value="list">List</SelectItem>
            <SelectItem value="detail">Detail</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setShowDialog(true)} className="ml-auto">
          <Plus className="h-4 w-4 mr-2" />
          New Pattern
        </Button>
      </div>

      {/* Pattern Grid with Drag & Drop */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="patterns">
          {(provided) => (
            <div 
              {...provided.droppableProps} 
              ref={provided.innerRef}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filteredPatterns.map((pattern, index) => (
                <Draggable key={pattern.id} draggableId={pattern.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={snapshot.isDragging ? "opacity-50" : ""}
                    >
                      <Collapsible
                        open={!collapsedCards.has(pattern.id)}
                        onOpenChange={() => toggleCollapse(pattern.id)}
                      >
                        <Card className="hover:shadow-md transition-shadow">
                          <CardHeader>
                            <div className="flex items-start justify-between gap-2">
                              <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing pt-1">
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div className="flex-1">
                                <CardTitle className="text-base mb-1">{pattern.name}</CardTitle>
                                <p className="text-xs text-muted-foreground font-mono">{pattern.pattern_id}</p>
                              </div>
                              <div className="flex items-center gap-1">
                                {!pattern.is_active && <Badge variant="outline">Inactive</Badge>}
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleEdit(pattern)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Settings className="h-4 w-4" />
                                </Button>
                                <CollapsibleTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    {collapsedCards.has(pattern.id) ? (
                                      <ChevronDown className="h-4 w-4" />
                                    ) : (
                                      <ChevronUp className="h-4 w-4" />
                                    )}
                                  </Button>
                                </CollapsibleTrigger>
                              </div>
                            </div>
                          </CardHeader>
                          <CollapsibleContent>
                            <CardContent className="space-y-3">
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {pattern.description || "No description"}
                              </p>
                              
                              <div className="flex gap-2 flex-wrap">
                                <Badge className={categoryColors[pattern.category]}>
                                  {pattern.category}
                                </Badge>
                                {pattern.entity_type && (
                                  <Badge variant="outline">{pattern.entity_type}</Badge>
                                )}
                                <Badge variant="secondary">v{pattern.version}</Badge>
                              </div>

                              <div className="flex gap-2 pt-2">
                                <Button variant="outline" size="sm" onClick={() => handleTestInBuilder(pattern)}>
                                  <Eye className="h-3 w-3 mr-1" />
                                  Test
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDuplicate(pattern)}>
                                  <Copy className="h-3 w-3" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => deleteMutation.mutate(pattern.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </CardContent>
                          </CollapsibleContent>
                        </Card>
                      </Collapsible>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {filteredPatterns.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Layout className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No patterns found</p>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPattern ? "Edit Pattern" : "New Pattern"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Pattern ID *</label>
                <Input
                  value={formData.pattern_id}
                  onChange={(e) => setFormData({ ...formData, pattern_id: e.target.value })}
                  placeholder="e.g., project_workspace"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Category *</label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="workspace">Workspace</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="list">List</SelectItem>
                    <SelectItem value="detail">Detail</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Project Workspace"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What this pattern is used for..."
                rows={2}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Entity Type</label>
              <Input
                value={formData.entity_type}
                onChange={(e) => setFormData({ ...formData, entity_type: e.target.value })}
                placeholder="e.g., Project, Customer"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block flex items-center justify-between">
                Config JSON *
                {editingPattern?.default_config_json && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleResetToDefault}
                    className="h-7 text-xs gap-1"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset to Default
                  </Button>
                )}
              </label>
              <Textarea
                value={formData.config_json}
                onChange={(e) => setFormData({ ...formData, config_json: e.target.value })}
                className="font-mono text-xs"
                placeholder='{"patternId": "...", ...}'
                rows={8}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Default Config JSON</label>
              <Textarea
                value={formData.default_config_json}
                onChange={(e) => setFormData({ ...formData, default_config_json: e.target.value })}
                className="font-mono text-xs"
                placeholder='Store original config for reset...'
                rows={4}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Sample Data JSON</label>
              <Textarea
                value={formData.sample_data_json}
                onChange={(e) => setFormData({ ...formData, sample_data_json: e.target.value })}
                className="font-mono text-xs"
                placeholder='{"project": {...}}'
                rows={6}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <label className="text-sm font-medium">Collapsed by Default</label>
                <Switch
                  checked={formData.default_collapsed}
                  onCheckedChange={(checked) => setFormData({ ...formData, default_collapsed: checked })}
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <label className="text-sm font-medium">Active</label>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>
                {editingPattern ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}