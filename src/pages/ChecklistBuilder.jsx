import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Save,
  Plus,
  Loader2,
  Settings,
  GripVertical,
  Trash2,
  CheckSquare,
  Sparkles,
} from "lucide-react";
import AIChecklistGenerator from "@/components/checklists/AIChecklistGenerator";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function ChecklistBuilder() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const checklistId = urlParams.get("id");

  const [showNewDialog, setShowNewDialog] = useState(!checklistId);
  const [showSettings, setShowSettings] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState(null);
  const [checklistData, setChecklistData] = useState({
    name: "",
    code: "",
    description: "",
    category: "custom",
    items: [],
    requireAllItems: true,
    isActive: true,
  });

  const { data: checklist, isLoading } = useQuery({
    queryKey: ["checklist", checklistId],
    queryFn: async () => {
      if (!checklistId) return null;
      const checklists = await base44.entities.ChecklistTemplate.filter({ id: checklistId });
      return checklists[0] || null;
    },
    enabled: !!checklistId,
  });

  useEffect(() => {
    if (checklist) {
      setChecklistData({
        name: checklist.name || "",
        code: checklist.code || "",
        description: checklist.description || "",
        category: checklist.category || "custom",
        items: checklist.items || [],
        requireAllItems: checklist.requireAllItems !== false,
        isActive: checklist.isActive !== false,
      });
    }
  }, [checklist]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ChecklistTemplate.create(data),
    onSuccess: (newChecklist) => {
      const url = new URL(window.location.href);
      url.searchParams.set("id", newChecklist.id);
      window.history.replaceState({}, "", url);
      queryClient.invalidateQueries({ queryKey: ["checklist"] });
      setShowNewDialog(false);
      toast.success("Checklist created");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.ChecklistTemplate.update(checklistId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist", checklistId] });
      toast.success("Checklist saved");
    },
  });

  const handleCreate = () => {
    if (!checklistData.name || !checklistData.code) {
      toast.error("Name and code are required");
      return;
    }
    createMutation.mutate(checklistData);
  };

  const handleSave = () => {
    updateMutation.mutate(checklistData);
  };

  const handleAddItem = () => {
    const newItem = {
      itemId: `item_${Date.now()}`,
      label: "New checklist item",
      description: "",
      required: true,
      category: "",
    };
    setChecklistData({
      ...checklistData,
      items: [...checklistData.items, newItem],
    });
    setEditingItemIndex(checklistData.items.length);
  };

  const handleUpdateItem = (index, updates) => {
    const newItems = [...checklistData.items];
    newItems[index] = { ...newItems[index], ...updates };
    setChecklistData({ ...checklistData, items: newItems });
  };

  const handleDeleteItem = (index) => {
    const newItems = checklistData.items.filter((_, i) => i !== index);
    setChecklistData({ ...checklistData, items: newItems });
    setEditingItemIndex(null);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const newItems = Array.from(checklistData.items);
    const [moved] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, moved);
    setChecklistData({ ...checklistData, items: newItems });
  };

  const handleAIGenerate = (generated) => {
    setChecklistData({
      ...checklistData,
      name: generated.checklistName || checklistData.name,
      description: generated.checklistDescription || checklistData.description,
      category: generated.category || checklistData.category,
      requireAllItems: generated.requireAllItems !== false,
      items: [...checklistData.items, ...(generated.items || [])],
    });
    toast.success(`Added ${generated.items?.length || 0} items!`);
  };

  if (!checklistId && !showNewDialog) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Card className="w-96 p-6 border-border bg-card">
          <h2 className="text-lg font-semibold mb-4 text-midnight-900">No Checklist Selected</h2>
          <div className="space-y-3">
            <Button onClick={() => setShowNewDialog(true)} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Create New Checklist
            </Button>
            <Link to={createPageUrl("ChecklistTemplates")}>
              <Button variant="outline" className="w-full">
                Browse Existing Checklists
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={createPageUrl("ChecklistTemplates")}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-midnight-900">{checklistData.name || "New Checklist"}</h1>
            <div className="flex items-center gap-2">
              {checklistData.code && <Badge variant="outline">{checklistData.code}</Badge>}
              {checklistData.category && (
                <Badge variant="secondary">{checklistData.category}</Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowAIGenerator(true)}>
            <Sparkles className="h-4 w-4 mr-1" />
            AI Generate
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </Button>
          <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-charcoal-700" />
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Checklist Items</h2>
                <Button size="sm" onClick={handleAddItem}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>

              {checklistData.items.length === 0 ? (
                <div className="text-center py-8 text-charcoal-700">
                  <CheckSquare className="h-12 w-12 mx-auto text-charcoal-700 opacity-30 mb-2" />
                  <p>No items yet. Click "Add Item" to get started.</p>
                </div>
              ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="checklist-items">
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                        {checklistData.items.map((item, index) => (
                          <Draggable key={item.itemId} draggableId={item.itemId} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`border rounded-lg p-3 bg-card transition-all ${
                                  editingItemIndex === index
                                    ? "ring-2 ring-primary"
                                    : "hover:border-border"
                                } ${snapshot.isDragging ? "shadow-lg" : ""}`}
                              >
                                {editingItemIndex === index ? (
                                  <div className="space-y-3">
                                    <Input
                                      value={item.label}
                                      onChange={(e) => handleUpdateItem(index, { label: e.target.value })}
                                      placeholder="Item label"
                                    />
                                    <Textarea
                                      value={item.description || ""}
                                      onChange={(e) => handleUpdateItem(index, { description: e.target.value })}
                                      placeholder="Description (optional)"
                                      rows={2}
                                    />
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <Switch
                                          checked={item.required !== false}
                                          onCheckedChange={(v) => handleUpdateItem(index, { required: v })}
                                        />
                                        <Label className="text-sm">Required</Label>
                                      </div>
                                      <div className="flex gap-2">
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          onClick={() => handleDeleteItem(index)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          onClick={() => setEditingItemIndex(null)}
                                        >
                                          Done
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div
                                    className="flex items-center gap-2 cursor-pointer"
                                    onClick={() => setEditingItemIndex(index)}
                                  >
                                    <div {...provided.dragHandleProps}>
                                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <CheckSquare className="h-4 w-4 text-muted-foreground" />
                                    <div className="flex-1">
                                      <span className="font-medium text-sm">{item.label}</span>
                                      {item.required && (
                                        <span className="text-destructive text-xs ml-1">*</span>
                                      )}
                                      {item.description && (
                                        <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </Card>
          </div>
        )}
      </div>

      {/* New Checklist Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Checklist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Checklist Name *</Label>
              <Input
                value={checklistData.name}
                onChange={(e) => setChecklistData({ ...checklistData, name: e.target.value })}
                placeholder="e.g., Quality Inspection"
              />
            </div>
            <div>
              <Label>Code *</Label>
              <Input
                value={checklistData.code}
                onChange={(e) =>
                  setChecklistData({
                    ...checklistData,
                    code: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                  })
                }
                placeholder="e.g., quality_inspection"
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select
                value={checklistData.category}
                onValueChange={(v) => setChecklistData({ ...checklistData, category: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quality">Quality</SelectItem>
                  <SelectItem value="safety">Safety</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="preparation">Preparation</SelectItem>
                  <SelectItem value="verification">Verification</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={checklistData.description}
                onChange={(e) => setChecklistData({ ...checklistData, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleCreate}
                disabled={createMutation.isPending}
                className="flex-1"
              >
                {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Checklist
              </Button>
              <Link to={createPageUrl("ChecklistTemplates")}>
                <Button variant="outline">Cancel</Button>
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Checklist Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={checklistData.name}
                onChange={(e) => setChecklistData({ ...checklistData, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Code</Label>
              <Input
                value={checklistData.code}
                onChange={(e) =>
                  setChecklistData({
                    ...checklistData,
                    code: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                  })
                }
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={checklistData.description}
                onChange={(e) => setChecklistData({ ...checklistData, description: e.target.value })}
                rows={2}
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select
                value={checklistData.category}
                onValueChange={(v) => setChecklistData({ ...checklistData, category: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quality">Quality</SelectItem>
                  <SelectItem value="safety">Safety</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="preparation">Preparation</SelectItem>
                  <SelectItem value="verification">Verification</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Require All Items</Label>
              <Switch
                checked={checklistData.requireAllItems !== false}
                onCheckedChange={(v) => setChecklistData({ ...checklistData, requireAllItems: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch
                checked={checklistData.isActive !== false}
                onCheckedChange={(v) => setChecklistData({ ...checklistData, isActive: v })}
              />
            </div>
            <Button onClick={() => setShowSettings(false)} className="w-full">
                        Done
                      </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* AI Generator */}
                  <AIChecklistGenerator
                    open={showAIGenerator}
                    onOpenChange={setShowAIGenerator}
                    onGenerate={handleAIGenerate}
                  />
                </div>
              );
            }