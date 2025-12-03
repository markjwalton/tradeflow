import React, { useState } from "react";
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
  Plus, GripVertical, Pencil, Trash2, Copy, FolderOpen, Power,
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
import { v4 as uuidv4 } from "uuid";

// Generate unique ID for items
const generateId = () => Math.random().toString(36).substr(2, 9);

const iconMap = {
  Home, Lightbulb, GitBranch, Database, Package, Building2, 
  Navigation, Workflow, Layout, Zap, Settings, FileText,
  Users, Calendar, Mail, Bell, Search, Star, Heart,
  Folder, File, Image, Video, Music, Map, Globe, Shield,
  Key, Gauge, BookOpen, FlaskConical, FolderOpen
};

const iconOptions = Object.keys(iconMap);

/**
 * GenericNavEditor - A reusable navigation editor component
 * 
 * Props:
 * - title: string - Title for the card
 * - configType: string - The config_type to filter NavigationConfig (e.g., "admin_console", "app_pages_source")
 * - sourceSlugs: string[] - Available page slugs for this navigation
 * - onCopyFromTemplate: function - Optional callback to copy from another template
 * - showCopyButton: boolean - Whether to show the copy button
 * - copyButtonLabel: string - Label for the copy button
 */
export default function GenericNavEditor({
  title = "Navigation",
  configType,
  sourceSlugs = [],
  onCopyFromTemplate,
  showCopyButton = false,
  copyButtonLabel = "Copy from Template"
}) {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ 
    name: "", 
    slug: "", 
    icon: "Home", 
    is_visible: true, 
    parent_id: null, 
    item_type: "page", 
    default_collapsed: false 
  });
  const [expandedParents, setExpandedParents] = useState(new Set());
  const [unallocatedExpanded, setUnallocatedExpanded] = useState(false);

  // Fetch config for this type
  const { data: navConfigs = [], isLoading } = useQuery({
    queryKey: ["navConfig", configType],
    queryFn: () => base44.entities.NavigationConfig.filter({ config_type: configType }),
  });

  const config = navConfigs[0];
  // Ensure all items have unique IDs
  const items = (config?.items || []).map(item => ({
    ...item,
    _id: item._id || generateId()
  }));

  // Calculate unallocated slugs
  const allocatedSlugs = items.map(i => i.slug).filter(Boolean);
  const unallocatedSlugs = sourceSlugs.filter(slug => !allocatedSlugs.includes(slug));

  // Hierarchy helpers - use _id for parent matching
  const getItemsByParent = (parentId) => items.filter(i => (i.parent_id || null) === parentId);
  const topLevelItems = getItemsByParent(null);

  const saveMutation = useMutation({
    mutationFn: async (newItems) => {
      if (config) {
        return base44.entities.NavigationConfig.update(config.id, { items: newItems });
      } else {
        return base44.entities.NavigationConfig.create({ 
          config_type: configType, 
          items: newItems,
          source_slugs: sourceSlugs
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["navConfig", configType] });
      toast.success("Navigation saved");
    },
  });

  // Find item by unique _id
  const findItemById = (id) => items.find(i => i._id === id);
  const findItemIndexById = (id) => items.findIndex(i => i._id === id);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    // Build flat ordered list for display
    const flatList = buildFlatList();
    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;
    
    const draggedItem = flatList[sourceIndex];
    const destItem = flatList[destIndex];
    
    if (!draggedItem) return;
    
    // Only allow reorder within same parent level
    if ((draggedItem.parent_id || null) !== (destItem?.parent_id || null)) {
      toast.info("Use Move button to change parent");
      return;
    }
    
    // Get siblings at this level
    const siblings = items.filter(i => (i.parent_id || null) === (draggedItem.parent_id || null));
    const srcIdx = siblings.findIndex(s => s.slug === draggedItem.slug);
    const dstIdx = siblings.findIndex(s => s.slug === destItem?.slug);
    
    if (srcIdx === -1 || dstIdx === -1 || srcIdx === dstIdx) return;
    
    const reordered = Array.from(siblings);
    const [removed] = reordered.splice(srcIdx, 1);
    reordered.splice(dstIdx, 0, removed);
    
    // Rebuild items with new order
    const otherItems = items.filter(i => (i.parent_id || null) !== (draggedItem.parent_id || null));
    const updatedSiblings = reordered.map((item, idx) => ({ ...item, order: idx }));
    
    saveMutation.mutate([...otherItems, ...updatedSiblings]);
  };

  const handleSaveItem = () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (formData.item_type === "page" && !formData.slug?.trim()) {
      toast.error("Page slug is required");
      return;
    }
    
    let newItems;
    if (editingItem !== null) {
      const originalItem = items[editingItem];
      newItems = items.map((item) => {
        if (item.slug === originalItem.slug && (item.parent_id || null) === (originalItem.parent_id || null)) {
          return { ...formData, order: item.order };
        }
        return item;
      });
    } else {
      newItems = [...items, { ...formData, order: items.length }];
    }
    
    saveMutation.mutate(newItems);
    closeDialog();
  };

  const closeDialog = () => {
    setShowDialog(false);
    setEditingItem(null);
    setFormData({ name: "", slug: "", icon: "Home", is_visible: true, parent_id: null, item_type: "page", default_collapsed: false });
  };

  const handleEdit = (item) => {
    const idx = findItemIndex(item.slug, item.parent_id);
    setEditingItem(idx);
    setFormData(item);
    setShowDialog(true);
  };

  const handleDelete = (item) => {
    // Remove item and its children
    const newItems = items.filter(i => 
      !(i.slug === item.slug && (i.parent_id || null) === (item.parent_id || null)) &&
      i.parent_id !== item.slug
    );
    saveMutation.mutate(newItems);
  };

  const handleDuplicate = (item) => {
    const duplicate = { 
      ...item, 
      name: `${item.name} (Copy)`,
      parent_id: null,
      order: items.length
    };
    saveMutation.mutate([...items, duplicate]);
    toast.success("Item duplicated");
  };

  const handleToggleVisibility = (item) => {
    const newItems = items.map((i) => {
      if (i.slug === item.slug && (i.parent_id || null) === (item.parent_id || null)) {
        return { ...i, is_visible: !i.is_visible };
      }
      return i;
    });
    saveMutation.mutate(newItems);
  };

  const handleMoveToParent = (item, newParentSlug) => {
    const newItems = items.map((i) => {
      if (i.slug === item.slug && (i.parent_id || null) === (item.parent_id || null)) {
        return { ...i, parent_id: newParentSlug || null };
      }
      return i;
    });
    saveMutation.mutate(newItems);
    toast.success(newParentSlug ? "Item moved" : "Moved to top level");
  };

  const handleAllocate = (slug) => {
    const name = slug.replace(/([A-Z])/g, ' $1').trim();
    const newItem = {
      name,
      slug,
      icon: "File",
      is_visible: true,
      parent_id: null,
      item_type: "page",
      order: items.length
    };
    saveMutation.mutate([...items, newItem]);
    toast.success(`${name} added`);
  };

  const handleUnallocate = (item) => {
    handleDelete(item);
    toast.success(`${item.name} removed from navigation`);
  };

  const toggleParent = (slug) => {
    setExpandedParents(prev => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const getIcon = (iconName) => {
    const Icon = iconMap[iconName];
    return Icon ? <Icon className="h-4 w-4" /> : <Home className="h-4 w-4" />;
  };

  // Build flat list for rendering
  const buildFlatList = () => {
    const result = [];
    const addItems = (parentId, depth) => {
      if (depth > 2) return;
      const children = getItemsByParent(parentId).sort((a, b) => (a.order || 0) - (b.order || 0));
      children.forEach(child => {
        const hasChildren = getItemsByParent(child.slug).length > 0;
        result.push({ ...child, depth, hasChildren });
        if (expandedParents.has(child.slug)) {
          addItems(child.slug, depth + 1);
        }
      });
    };
    addItems(null, 0);
    return result;
  };

  // Get valid parent options (exclude self and descendants)
  const getParentOptions = () => {
    const currentSlug = editingItem !== null ? items[editingItem]?.slug : null;
    return items.filter(i => 
      i.item_type === "folder" || getItemsByParent(i.slug).length > 0
    ).filter(i => i.slug !== currentSlug);
  };

  const flatList = buildFlatList();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <div className="flex gap-2">
          {showCopyButton && onCopyFromTemplate && items.length === 0 && (
            <Button variant="outline" onClick={onCopyFromTemplate}>
              <Copy className="h-4 w-4 mr-2" />
              {copyButtonLabel}
            </Button>
          )}
          <Button onClick={() => { 
            setEditingItem(null); 
            setFormData({ name: "", slug: "", icon: "Home", is_visible: true, parent_id: null, item_type: "page", default_collapsed: false }); 
            setShowDialog(true); 
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : (
          <>
            {/* Navigation Items */}
            {items.length > 0 && (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="nav-list">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-1 mb-6">
                      {flatList.map((item, index) => (
                        <Draggable key={`${item.slug}-${item.parent_id || 'root'}`} draggableId={`${item.slug}-${item.parent_id || 'root'}`} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              style={{ 
                                ...provided.draggableProps.style,
                                marginLeft: (item.depth || 0) * 24 
                              }}
                              className={`group flex items-center gap-2 p-3 border rounded-lg bg-white hover:bg-gray-50 transition-colors ${!item.is_visible ? "opacity-50" : ""}`}
                            >
                              <div {...provided.dragHandleProps} className="cursor-grab opacity-0 group-hover:opacity-100">
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
                              </div>

                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                                {/* Move Menu */}
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
                                    <DropdownMenuSeparator />
                                    {topLevelItems.filter(p => p.slug !== item.slug && p.slug !== item.parent_id).map(parent => (
                                      <DropdownMenuItem 
                                        key={parent.slug}
                                        onClick={() => handleMoveToParent(item, parent.slug)}
                                        className="gap-2"
                                      >
                                        <CornerDownRight className="h-4 w-4" />
                                        {parent.name}
                                      </DropdownMenuItem>
                                    ))}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                                
                                <Button variant="ghost" size="icon" onClick={() => handleDuplicate(item)} title="Duplicate">
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(item)} title="Edit">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleUnallocate(item)} title="Remove">
                                  <Power className="h-4 w-4 text-green-500" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(item)} title="Delete">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>

                              <Switch
                                checked={item.is_visible !== false}
                                onCheckedChange={() => handleToggleVisibility(item)}
                                className={item.is_visible !== false ? "data-[state=checked]:bg-green-500" : "data-[state=unchecked]:bg-red-500"}
                              />
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

            {/* Unallocated Pages */}
            {unallocatedSlugs.length > 0 && (
              <div className="border-t pt-4">
                <button 
                  onClick={() => setUnallocatedExpanded(!unallocatedExpanded)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-3 hover:text-gray-800"
                >
                  {unallocatedExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  <FolderOpen className="h-4 w-4" />
                  Unallocated Pages ({unallocatedSlugs.length})
                </button>
                {unallocatedExpanded && (
                  <div className="space-y-2">
                    {unallocatedSlugs.map(slug => (
                      <div 
                        key={slug} 
                        className="group flex items-center gap-3 p-3 bg-gray-50 border border-dashed border-gray-300 rounded-lg hover:bg-gray-100"
                      >
                        <div className="w-5" />
                        <div className="flex items-center gap-2 flex-1">
                          <File className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-600">{slug.replace(/([A-Z])/g, ' $1').trim()}</span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => {
                              const name = slug.replace(/([A-Z])/g, ' $1').trim();
                              setEditingItem(null);
                              setFormData({ name, slug, icon: "File", is_visible: true, parent_id: null, item_type: "page", default_collapsed: false });
                              setShowDialog(true);
                            }}
                            title="Edit & allocate"
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
                  </div>
                )}
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

      {/* Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={closeDialog}>
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
                <Select 
                  value={formData.slug || "__none__"} 
                  onValueChange={(v) => setFormData({ ...formData, slug: v === "__none__" ? "" : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select page..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Select page...</SelectItem>
                    {[...unallocatedSlugs, formData.slug].filter(Boolean).map(slug => (
                      <SelectItem key={slug} value={slug}>{slug}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label>Parent (optional)</Label>
              <Select 
                value={formData.parent_id || "__none__"} 
                onValueChange={(v) => setFormData({ ...formData, parent_id: v === "__none__" ? null : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="No parent (top level)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No parent (top level)</SelectItem>
                  {getParentOptions().map(parent => (
                    <SelectItem key={parent.slug} value={parent.slug}>{parent.name}</SelectItem>
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
              <Button variant="outline" onClick={closeDialog}>Cancel</Button>
              <Button onClick={handleSaveItem}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}