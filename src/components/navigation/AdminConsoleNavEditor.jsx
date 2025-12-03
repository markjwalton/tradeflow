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
  Plus, GripVertical, Pencil, Trash2, Eye, EyeOff, Download,
  Home, Lightbulb, GitBranch, Database, Package, Building2, 
  Navigation, Workflow, Layout, Zap, Settings, FileText,
  Users, Calendar, Mail, Bell, Search, Star, Heart,
  Folder, File, Image, Video, Music, Map, Globe, Shield,
  Key, Gauge, BookOpen, FlaskConical
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { toast } from "sonner";

const iconMap = {
  Home, Lightbulb, GitBranch, Database, Package, Building2, 
  Navigation, Workflow, Layout, Zap, Settings, FileText,
  Users, Calendar, Mail, Bell, Search, Star, Heart,
  Folder, File, Image, Video, Music, Map, Globe, Shield,
  Key, Gauge, BookOpen, FlaskConical
};

const iconOptions = Object.keys(iconMap);

// Default admin pages from Layout.js - used to seed initial config
const defaultAdminPages = [
  { name: "CMS", slug: "CMSManager", icon: "Globe", is_visible: true },
  { name: "API Manager", slug: "APIManager", icon: "Key", is_visible: true },
  { name: "Security", slug: "SecurityMonitor", icon: "Shield", is_visible: true },
  { name: "Performance", slug: "PerformanceMonitor", icon: "Gauge", is_visible: true },
  { name: "Roadmap", slug: "RoadmapManager", icon: "Lightbulb", is_visible: true },
  { name: "Journal", slug: "RoadmapJournal", icon: "Lightbulb", is_visible: true },
  { name: "Sprints", slug: "SprintManager", icon: "Lightbulb", is_visible: true },
  { name: "Rule Book", slug: "RuleBook", icon: "BookOpen", is_visible: true },
  { name: "Playground", slug: "PlaygroundSummary", icon: "FlaskConical", is_visible: true },
  { name: "Test Data Manager", slug: "TestDataManager", icon: "Database", is_visible: true },
  { name: "Mind Map Editor", slug: "MindMapEditor", icon: "GitBranch", is_visible: true },
  { name: "ERD Editor", slug: "ERDEditor", icon: "Database", is_visible: true },
  { name: "Generated Apps", slug: "GeneratedApps", icon: "Package", is_visible: true },
  { name: "Entity Library", slug: "EntityLibrary", icon: "Database", is_visible: true },
  { name: "Page Library", slug: "PageLibrary", icon: "Layout", is_visible: true },
  { name: "Feature Library", slug: "FeatureLibrary", icon: "Zap", is_visible: true },
  { name: "Template Library", slug: "TemplateLibrary", icon: "Package", is_visible: true },
  { name: "Business Templates", slug: "BusinessTemplates", icon: "Building2", is_visible: true },
  { name: "Workflow Library", slug: "WorkflowLibrary", icon: "Workflow", is_visible: true },
  { name: "Workflow Designer", slug: "WorkflowDesigner", icon: "Workflow", is_visible: true },
  { name: "Form Templates", slug: "FormTemplates", icon: "Layout", is_visible: true },
  { name: "Form Builder", slug: "FormBuilder", icon: "Layout", is_visible: true },
  { name: "Checklist Templates", slug: "ChecklistTemplates", icon: "Layout", is_visible: true },
  { name: "Checklist Builder", slug: "ChecklistBuilder", icon: "Layout", is_visible: true },
  { name: "System Specification", slug: "SystemSpecification", icon: "Package", is_visible: true },
  { name: "Tenant Manager", slug: "TenantManager", icon: "Building2", is_visible: true },
  { name: "Navigation Manager", slug: "NavigationManager", icon: "Navigation", is_visible: true },
  { name: "Package Library", slug: "PackageLibrary", icon: "Package", is_visible: true },
  { name: "Prompt Settings", slug: "PromptSettings", icon: "Settings", is_visible: true },
  { name: "Lookup Test", slug: "LookupTestForms", icon: "Key", is_visible: true },
];

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

  const seedFromLayout = () => {
    saveMutation.mutate(defaultAdminPages);
    toast.success("Navigation seeded from Layout defaults");
  };

  const getIcon = (iconName) => {
    const Icon = iconMap[iconName];
    return Icon ? <Icon className="h-4 w-4" /> : <Home className="h-4 w-4" />;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Admin Console Navigation</CardTitle>
        <div className="flex gap-2">
          {items.length === 0 && (
            <Button variant="outline" onClick={seedFromLayout}>
              <Download className="h-4 w-4 mr-2" />
              Seed from Layout
            </Button>
          )}
          <Button onClick={() => { setEditingItem(null); setFormData({ name: "", slug: "", icon: "Home", is_visible: true }); setShowDialog(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-4">No navigation items configured.</p>
            <Button onClick={seedFromLayout}>
              <Download className="h-4 w-4 mr-2" />
              Seed from Layout Defaults
            </Button>
            <p className="text-xs mt-2">This will copy all current admin pages so you can manage them here.</p>
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

        {items.length > 0 && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Active:</strong> This navigation is being used. Drag to reorder, toggle visibility, or edit items.
            </p>
          </div>
        )}
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