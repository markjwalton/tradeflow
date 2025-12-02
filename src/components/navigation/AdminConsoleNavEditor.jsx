import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { 
  Plus, GripVertical, Pencil, Trash2, Eye, EyeOff,
  Home, Lightbulb, GitBranch, Database, Package, Building2, 
  Navigation, Workflow, Layout, Zap, Settings, FileText,
  Users, Calendar, Mail, Bell, Search, Star, Heart,
  Folder, File, Image, Video, Music, Map, Globe
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { toast } from "sonner";

const iconMap = {
  Home, Lightbulb, GitBranch, Database, Package, Building2, 
  Navigation, Workflow, Layout, Zap, Settings, FileText,
  Users, Calendar, Mail, Bell, Search, Star, Heart,
  Folder, File, Image, Video, Music, Map, Globe
};

const iconOptions = Object.keys(iconMap);

export default function AdminConsoleNavEditor() {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: "", slug: "", icon: "Home", is_visible: true });

  const { data: navConfig = [], isLoading } = useQuery({
    queryKey: ["adminConsoleNav"],
    queryFn: () => base44.entities.NavigationConfig.filter({ config_type: "admin_console" }),
  });

  const config = navConfig[0];
  const items = config?.items || [];

  const saveMutation = useMutation({
    mutationFn: async (newItems) => {
      if (config) {
        return base44.entities.NavigationConfig.update(config.id, { items: newItems });
      } else {
        return base44.entities.NavigationConfig.create({ 
          config_type: "admin_console", 
          items: newItems 
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminConsoleNav"] });
      toast.success("Navigation saved");
    },
  });

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(items);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    saveMutation.mutate(reordered);
  };

  const handleSaveItem = () => {
    if (!formData.name.trim() || !formData.slug.trim()) {
      toast.error("Name and page slug are required");
      return;
    }
    
    let newItems;
    if (editingItem !== null) {
      newItems = items.map((item, i) => i === editingItem ? formData : item);
    } else {
      newItems = [...items, formData];
    }
    
    saveMutation.mutate(newItems);
    setShowDialog(false);
    setEditingItem(null);
    setFormData({ name: "", slug: "", icon: "Home", is_visible: true });
  };

  const handleEdit = (index) => {
    setEditingItem(index);
    setFormData(items[index]);
    setShowDialog(true);
  };

  const handleDelete = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    saveMutation.mutate(newItems);
  };

  const handleToggleVisibility = (index) => {
    const newItems = items.map((item, i) => 
      i === index ? { ...item, is_visible: !item.is_visible } : item
    );
    saveMutation.mutate(newItems);
  };

  const getIcon = (iconName) => {
    const Icon = iconMap[iconName];
    return Icon ? <Icon className="h-4 w-4" /> : <Home className="h-4 w-4" />;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Admin Console Navigation</CardTitle>
        <Button onClick={() => { setEditingItem(null); setFormData({ name: "", slug: "", icon: "Home", is_visible: true }); setShowDialog(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No navigation items configured. The default layout navigation will be used.
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="admin-nav">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {items.map((item, index) => (
                    <Draggable key={index} draggableId={`item-${index}`} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`flex items-center gap-3 p-3 border rounded-lg bg-white ${!item.is_visible ? "opacity-50" : ""}`}
                        >
                          <div {...provided.dragHandleProps} className="cursor-grab">
                            <GripVertical className="h-4 w-4 text-gray-400" />
                          </div>
                          <div className="flex items-center gap-2 flex-1">
                            {getIcon(item.icon)}
                            <span className="font-medium">{item.name}</span>
                            <Badge variant="outline" className="text-xs">{item.slug}</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleToggleVisibility(index)}>
                              {item.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-gray-400" />}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(index)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(index)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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

        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> Changes here override the default admin console navigation in Layout.js. 
            Leave empty to use the default navigation.
          </p>
        </div>
      </CardContent>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem !== null ? "Edit Item" : "Add Navigation Item"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Display name..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Page Slug *</label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="e.g., RoadmapManager"
              />
              <p className="text-xs text-gray-500 mt-1">Must match the page file name exactly</p>
            </div>
            <div>
              <label className="text-sm font-medium">Icon</label>
              <Select value={formData.icon} onValueChange={(v) => setFormData({ ...formData, icon: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map(icon => (
                    <SelectItem key={icon} value={icon}>
                      <div className="flex items-center gap-2">
                        {getIcon(icon)}
                        {icon}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_visible}
                onCheckedChange={(v) => setFormData({ ...formData, is_visible: v })}
              />
              <label className="text-sm">Visible</label>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
              <Button onClick={handleSaveItem}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}