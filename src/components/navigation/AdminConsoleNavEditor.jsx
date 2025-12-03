import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
  Plus, GripVertical, Pencil, Trash2, Eye, EyeOff, Copy, FolderOpen,
  Home, Lightbulb, GitBranch, Database, Package, Building2, 
  Navigation, Workflow, Layout, Zap, Settings, FileText,
  Users, Calendar, Mail, Bell, Search, Star, Heart,
  Folder, File, Image, Video, Music, Map, Globe, Shield,
  Key, Gauge, BookOpen, FlaskConical, ChevronDown, ChevronRight,
  MoveRight, CornerDownRight
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { toast } from "sonner";

const iconMap = {
  Home, Lightbulb, GitBranch, Database, Package, Building2, 
  Navigation, Workflow, Layout, Zap, Settings, FileText,
  Users, Calendar, Mail, Bell, Search, Star, Heart,
  Folder, File, Image, Video, Music, Map, Globe, Shield,
  Key, Gauge, BookOpen, FlaskConical, FolderOpen
};

const iconOptions = Object.keys(iconMap);

// All known page slugs - new pages will auto-add to unallocated
const ALL_PAGE_SLUGS = [
  "CMSManager", "APIManager", "SecurityMonitor", "PerformanceMonitor",
  "RoadmapManager", "RoadmapJournal", "SprintManager", "RuleBook",
  "PlaygroundSummary", "TestDataManager", "MindMapEditor", "ERDEditor",
  "GeneratedApps", "EntityLibrary", "PageLibrary", "FeatureLibrary",
  "TemplateLibrary", "BusinessTemplates", "WorkflowLibrary", "WorkflowDesigner",
  "FormTemplates", "FormBuilder", "ChecklistTemplates", "ChecklistBuilder",
  "SystemSpecification", "TenantManager", "NavigationManager", "PackageLibrary",
  "PromptSettings", "LookupTestForms"
];

export default function AdminConsoleNavEditor() {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: "", slug: "", icon: "Home", is_visible: true, parent_id: null, item_type: "page", default_collapsed: false });
  const [expandedParents, setExpandedParents] = useState(new Set());
  const [unallocatedExpanded, setUnallocatedExpanded] = useState(false);

  const { data: navConfig = [], isLoading } = useQuery({
    queryKey: ["adminConsoleNav"],
    queryFn: () => base44.entities.NavigationConfig.filter({ config_type: "admin_console" }),
  });

  const config = navConfig[0];
  const items = config?.items || [];

  // Find unallocated pages (slugs not in items)
  const allocatedSlugs = items.map(i => i.slug);
  const unallocatedSlugs = ALL_PAGE_SLUGS.filter(slug => !allocatedSlugs.includes(slug));

  // Get parent items (items without parent_id) - support 3 levels
  const parentItems = items.filter(i => !i.parent_id);
  const getChildren = (parentSlug) => items.filter(i => i.parent_id === parentSlug);
  const getLevel1Items = () => items.filter(i => i.parent_id && parentItems.some(p => p.slug === i.parent_id));

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
    
    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;
    
    // Build flat ordered list
    const orderedItems = [];
    parentItems.forEach(parent => {
      orderedItems.push(parent);
      getChildren(parent.slug).forEach(child => orderedItems.push(child));
    });
    
    const reordered = Array.from(orderedItems);
    const [removed] = reordered.splice(sourceIndex, 1);
    reordered.splice(destIndex, 0, removed);
    
    saveMutation.mutate(reordered);
  };

  const handleSaveItem = () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (formData.item_type === "page" && !formData.slug.trim()) {
      toast.error("Page slug is required for page items");
      return;
    }
    
    let newItems;
    if (editingItem !== null) {
      // Update existing
      newItems = items.map((item, i) => i === editingItem ? formData : item);
    } else {
      // Add new
      newItems = [...items, formData];
    }
    
    saveMutation.mutate(newItems);
    setShowDialog(false);
    setEditingItem(null);
    setFormData({ name: "", slug: "", icon: "Home", is_visible: true, parent_id: null, item_type: "page", default_collapsed: false });
  };

  const handleEdit = (index) => {
    setEditingItem(index);
    setFormData(items[index]);
    setShowDialog(true);
  };

  const handleDelete = (index) => {
    const itemToDelete = items[index];
    // Also remove children if deleting a parent
    const newItems = items.filter((item, i) => i !== index && item.parent_id !== itemToDelete.slug);
    saveMutation.mutate(newItems);
  };

  const handleDuplicate = (index) => {
    const original = items[index];
    const duplicate = { 
      ...original, 
      name: `${original.name} (Copy)`,
      parent_id: null // Duplicates go to top level
    };
    saveMutation.mutate([...items, duplicate]);
    toast.success("Item duplicated");
  };

  const handleToggleVisibility = (index) => {
    const newItems = items.map((item, i) => 
      i === index ? { ...item, is_visible: !item.is_visible } : item
    );
    saveMutation.mutate(newItems);
  };

  const handleMoveToParent = (targetItem, newParentSlug) => {
    // Find by matching slug AND current parent (handle undefined/null)
    const currentParent = targetItem.parent_id || null;
    const newItems = items.map((i) => {
      const itemParent = i.parent_id || null;
      if (i.slug === targetItem.slug && itemParent === currentParent) {
        return { ...i, parent_id: newParentSlug || null };
      }
      return i;
    });
    saveMutation.mutate(newItems);
    toast.success(newParentSlug ? "Item moved" : "Moved to top level");
  };

  const handleAllocate = (slug) => {
    // Add unallocated page to nav
    const name = slug.replace(/([A-Z])/g, ' $1').trim(); // Convert camelCase to spaces
    const newItem = {
      name,
      slug,
      icon: "File",
      is_visible: true,
      parent_id: null
    };
    saveMutation.mutate([...items, newItem]);
    toast.success(`${name} added to navigation`);
  };

  const toggleParent = (parentSlug) => {
    setExpandedParents(prev => {
      const next = new Set(prev);
      if (next.has(parentSlug)) next.delete(parentSlug);
      else next.add(parentSlug);
      return next;
    });
  };

  const getIcon = (iconName) => {
    const Icon = iconMap[iconName];
    return Icon ? <Icon className="h-4 w-4" /> : <Home className="h-4 w-4" />;
  };

  // Available slugs for dropdown (unallocated + current item's slug if editing)
  const availableSlugsForDropdown = editingItem !== null 
    ? [...unallocatedSlugs, items[editingItem]?.slug].filter(Boolean)
    : unallocatedSlugs;

  // Build flat list for drag/drop - support 3 levels
  const flatList = [];
  const addItemsToFlatList = (parentSlug, depth) => {
    if (depth > 2) return; // Max 3 levels
    const children = getChildren(parentSlug);
    children.forEach(child => {
      const hasGrandchildren = getChildren(child.slug).length > 0;
      flatList.push({ ...child, isParent: hasGrandchildren, depth, hasChildren: hasGrandchildren });
      if (expandedParents.has(child.slug)) {
        addItemsToFlatList(child.slug, depth + 1);
      }
    });
  };
  
  parentItems.forEach(parent => {
    const hasChildren = getChildren(parent.slug).length > 0;
    flatList.push({ ...parent, isParent: true, hasChildren, depth: 0 });
    if (expandedParents.has(parent.slug)) {
      addItemsToFlatList(parent.slug, 1);
    }
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Admin Console Navigation</CardTitle>
        <Button onClick={() => { 
          setEditingItem(null); 
          setFormData({ name: "", slug: "", icon: "Home", is_visible: true, parent_id: null, item_type: "page", default_collapsed: false }); 
          setShowDialog(true); 
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : (
          <>
            {/* Allocated Items */}
            {items.length > 0 && (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="admin-nav">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-1 mb-6">
                      {flatList.map((item, index) => {
                        const itemIndex = items.findIndex(i => i.slug === item.slug && i.parent_id === item.parent_id);
                        return (
                          <Draggable key={`${item.slug}-${item.parent_id || 'root'}`} draggableId={`${item.slug}-${item.parent_id || 'root'}`} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                style={{ 
                                  ...provided.draggableProps.style,
                                  marginLeft: item.depth ? item.depth * 24 : 0 
                                }}
                                className={`group flex items-center gap-2 p-3 border rounded-lg bg-white hover:bg-gray-50 transition-colors ${!item.is_visible ? "opacity-50" : ""}`}
                              >
                                <div {...provided.dragHandleProps} className="cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
                                  <GripVertical className="h-4 w-4 text-gray-400" />
                                </div>
                                
                                {item.hasChildren && (
                                  <button onClick={() => toggleParent(item.slug)} className="p-0.5">
                                    {expandedParents.has(item.slug) ? 
                                      <ChevronDown className="h-4 w-4 text-gray-400" /> : 
                                      <ChevronRight className="h-4 w-4 text-gray-400" />
                                    }
                                  </button>
                                )}
                                
                                <div className="flex items-center gap-2 flex-1">
                                  {getIcon(item.icon)}
                                  <span className="font-medium">{item.name}</span>
                                  {item.item_type === "folder" && (
                                    <Badge className="text-xs bg-amber-100 text-amber-700">Folder</Badge>
                                  )}
                                  {item.item_type === "folder" && item.default_collapsed && (
                                    <Badge variant="outline" className="text-xs text-gray-500">Collapsed</Badge>
                                  )}
                                </div>

                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" title="Move to...">
                                        <MoveRight className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                      <DropdownMenuItem 
                                        onClick={() => handleMoveToParent(item, null)}
                                        disabled={!item.parent_id}
                                        className="gap-2"
                                      >
                                        <CornerDownRight className="h-4 w-4 rotate-180" />
                                        Move to top level
                                      </DropdownMenuItem>
                                      {parentItems.filter(p => p.slug !== item.slug && p.slug !== item.parent_id).length > 0 && <DropdownMenuSeparator />}
                                      {parentItems.filter(p => p.slug !== item.slug && p.slug !== item.parent_id).map(parent => (
                                        <DropdownMenuItem 
                                          key={parent.slug}
                                          onClick={() => handleMoveToParent(item, parent.slug)}
                                          className="gap-2"
                                        >
                                          <CornerDownRight className="h-4 w-4" />
                                          {parent.name}
                                        </DropdownMenuItem>
                                      ))}
                                      {getLevel1Items().filter(l => l.slug !== item.slug && l.slug !== item.parent_id).map(level1 => (
                                        <DropdownMenuItem 
                                          key={level1.slug}
                                          onClick={() => handleMoveToParent(item, level1.slug)}
                                          className="gap-2 pl-6"
                                        >
                                          <CornerDownRight className="h-4 w-4" />
                                          └─ {level1.name}
                                        </DropdownMenuItem>
                                      ))}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                  <Button variant="ghost" size="icon" onClick={() => handleDuplicate(itemIndex)} title="Duplicate">
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => handleEdit(itemIndex)} title="Edit">
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(itemIndex)} title="Delete">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                  </div>

                                  <Switch
                                  checked={item.is_visible !== false}
                                  onCheckedChange={() => handleToggleVisibility(itemIndex)}
                                  className={item.is_visible !== false ? "data-[state=checked]:bg-green-500" : "data-[state=unchecked]:bg-red-500"}
                                  />
                                  </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}

            {/* Unallocated Pages */}
            {unallocatedSlugs.length > 0 && (
              <div className="border-t pt-4">
                <button 
                  onClick={() => setUnallocatedExpanded(!unallocatedExpanded)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-3 hover:text-gray-800"
                >
                  {unallocatedExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <FolderOpen className="h-4 w-4" />
                  Unallocated Pages ({unallocatedSlugs.length})
                </button>
                {unallocatedExpanded && <div className="space-y-2">
                  {unallocatedSlugs.map(slug => (
                    <div 
                      key={slug} 
                      className="group flex items-center gap-3 p-3 bg-gray-50 border border-dashed border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-5" />
                      <div className="flex items-center gap-2 flex-1">
                        <File className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-600">{slug.replace(/([A-Z])/g, ' $1').trim()}</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => {
                            const name = slug.replace(/([A-Z])/g, ' $1').trim();
                            setEditingItem(null);
                            setFormData({ name, slug, icon: "File", is_visible: true, parent_id: null, item_type: "page", default_collapsed: false });
                            setShowDialog(true);
                          }}
                          title="Edit allocation"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleAllocate(slug)}
                          title="Quick allocate"
                        >
                          <Plus className="h-4 w-4 text-green-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>}
              </div>
            )}

            {items.length === 0 && unallocatedSlugs.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No pages available.
              </div>
            )}
          </>
        )}
      </CardContent>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem !== null ? "Edit Item" : "Add Navigation Item"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Display name..."
              />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={formData.item_type || "page"} onValueChange={(v) => setFormData({ ...formData, item_type: v, slug: v === "folder" ? "" : formData.slug })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="page">Page (has URL)</SelectItem>
                  <SelectItem value="folder">Folder (container only)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.item_type !== "folder" && (
              <div>
                <Label>Page Slug *</Label>
                {availableSlugsForDropdown.length > 0 ? (
                  <Select value={formData.slug} onValueChange={(v) => setFormData({ ...formData, slug: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select page..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSlugsForDropdown.map(slug => (
                        <SelectItem key={slug} value={slug}>{slug}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g., RoadmapManager"
                  />
                )}
              </div>
            )}
            <div>
              <Label>Parent (optional, up to 3 levels)</Label>
              <Select 
                value={formData.parent_id || "__none__"} 
                onValueChange={(v) => setFormData({ ...formData, parent_id: v === "__none__" ? null : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="No parent (top level)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No parent (top level)</SelectItem>
                  {parentItems.filter(p => p.slug !== formData.slug).map(parent => (
                    <SelectItem key={parent.slug} value={parent.slug}>{parent.name}</SelectItem>
                  ))}
                  {getLevel1Items().filter(p => p.slug !== formData.slug).map(item => (
                    <SelectItem key={item.slug} value={item.slug}>└─ {item.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Icon</Label>
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
              <Label>Visible</Label>
            </div>
            {formData.item_type === "folder" && (
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.default_collapsed}
                  onCheckedChange={(v) => setFormData({ ...formData, default_collapsed: v })}
                />
                <Label>Default Collapsed</Label>
              </div>
            )}
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