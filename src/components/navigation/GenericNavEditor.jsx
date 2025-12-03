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
  const [initialExpandDone, setInitialExpandDone] = useState(false);

  // Fetch config for this type
  const { data: navConfigs = [], isLoading } = useQuery({
    queryKey: ["navConfig", configType],
    queryFn: () => base44.entities.NavigationConfig.filter({ config_type: configType }),
  });

  const config = navConfigs[0];
  // Ensure all items have unique IDs - persist IDs if missing
  const rawItems = config?.items || [];
  const itemsNeedIds = rawItems.some(item => !item._id);
  
  // Generate stable IDs for items that don't have them
  const itemsWithIds = React.useMemo(() => {
    return rawItems.map(item => ({
      ...item,
      _id: item._id || generateId()
    }));
  }, [rawItems]);
  
  const items = itemsWithIds;
  
  // Auto-save items with generated IDs so they persist
  React.useEffect(() => {
    if (itemsNeedIds && config && itemsWithIds.length > 0) {
      base44.entities.NavigationConfig.update(config.id, { items: itemsWithIds }).then(() => {
        queryClient.invalidateQueries({ queryKey: ["navConfig", configType] });
      });
    }
  }, [itemsNeedIds, config?.id, itemsWithIds]);
  
  // Auto-expand all folders that have children on initial load
  React.useEffect(() => {
    if (!initialExpandDone && items.length > 0) {
      const itemIdsWithChildren = new Set();
      items.forEach(i => {
        if (i.parent_id) {
          itemIdsWithChildren.add(i.parent_id);
        }
      });
      if (itemIdsWithChildren.size > 0) {
        setExpandedParents(itemIdsWithChildren);
      }
      setInitialExpandDone(true);
    }
  }, [items, initialExpandDone]);

  // Calculate unallocated slugs
  const allocatedSlugs = items.map(i => i.slug).filter(Boolean);
  const unallocatedSlugs = sourceSlugs.filter(slug => !allocatedSlugs.includes(slug));

  // Hierarchy helpers - parent_id now refers to _id of parent
  const getItemsByParent = (parentId) => items.filter(i => (i.parent_id || null) === parentId);
  const topLevelItems = getItemsByParent(null);
  
  // Get all potential parent items (folders or any item can be a parent)
  const getValidParents = (excludeId = null) => {
    // Get all descendants to exclude (can't move item into its own children)
    const getDescendants = (id, acc = new Set()) => {
      items.filter(i => i.parent_id === id).forEach(child => {
        acc.add(child._id);
        getDescendants(child._id, acc);
      });
      return acc;
    };
    const descendants = excludeId ? getDescendants(excludeId) : new Set();
    
    // Any item can be a parent (for nesting), but prefer folders
    // Exclude: self, descendants of self
    return items.filter(i => 
      i._id !== excludeId &&
      !descendants.has(i._id)
    );
  };

  const saveMutation = useMutation({
        mutationFn: async (newItems) => {
          // Ensure all items have _id before saving
          const itemsWithIds = newItems.map(item => ({
            ...item,
            _id: item._id || generateId()
          }));
          if (config) {
            return base44.entities.NavigationConfig.update(config.id, { items: itemsWithIds });
          } else {
            return base44.entities.NavigationConfig.create({ 
              config_type: configType, 
              items: itemsWithIds,
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
    
    const itemType = formData.item_type || "page";
    
    if (itemType === "page" && !formData.slug?.trim()) {
      toast.error("Page slug is required");
      return;
    }

    // Build the item to save with explicit values
    const itemToSave = {
      name: formData.name,
      slug: itemType === "folder" ? "" : (formData.slug || ""),
      icon: formData.icon || "Home",
      is_visible: formData.is_visible !== false,
      parent_id: formData.parent_id || null,
      item_type: itemType,
      default_collapsed: formData.default_collapsed || false
    };

    let newItems;
    if (editingItem !== null) {
      // Update by _id
      newItems = items.map((item) => {
        if (item._id === editingItem) {
          return { ...itemToSave, _id: item._id, order: item.order ?? items.length };
        }
        return item;
      });
    } else {
      // Create new with unique _id
      newItems = [...items, { ...itemToSave, _id: generateId(), order: items.length }];
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
    // Use _id for editing reference
    setEditingItem(item._id);
    setFormData({ ...item });
    setShowDialog(true);
  };

  const handleDelete = (item) => {
    // Remove by _id and remove children by parent_id
    const newItems = items.filter(i => 
      i._id !== item._id && i.parent_id !== item._id
    );
    saveMutation.mutate(newItems);
  };

  const handleDuplicate = (item) => {
    const duplicate = { 
      ...item, 
      _id: generateId(),
      name: `${item.name} (Copy)`,
      parent_id: null,
      order: items.length
    };
    saveMutation.mutate([...items, duplicate]);
    toast.success("Item duplicated");
  };

  const handleToggleVisibility = (item) => {
    const newItems = items.map((i) => {
      if (i._id === item._id) {
        return { ...i, is_visible: !i.is_visible };
      }
      return i;
    });
    saveMutation.mutate(newItems);
  };

  const handleMoveToParent = (item, newParentId) => {
        // Update by _id, set new parent_id - ensure _id is preserved
        const newItems = items.map((i) => {
          if (i._id === item._id) {
            return { ...i, _id: i._id, parent_id: newParentId || null };
          }
          return i;
        });
        saveMutation.mutate(newItems);
    // Auto-expand the new parent to show the moved item
    if (newParentId) {
      setExpandedParents(prev => new Set([...prev, newParentId]));
    }
    toast.success(newParentId ? "Item moved" : "Moved to top level");
  };

  const handleAllocate = (slug) => {
        const name = slug.replace(/([A-Z])/g, ' $1').trim();
        const newId = generateId();
        const newItem = {
          _id: newId,
          name,
          slug,
          icon: "File",
          is_visible: true,
          parent_id: null,
          item_type: "page",
          order: items.length
        };
        // Ensure all existing items keep their _id
        const existingItems = items.map(i => ({ ...i, _id: i._id || generateId() }));
        saveMutation.mutate([...existingItems, newItem]);
        toast.success(`${name} added`);
      };

  const handleUnallocate = (item) => {
        // Remove by _id and remove children by parent_id, ensuring all remaining items keep _id
        const newItems = items
          .filter(i => i._id !== item._id && i.parent_id !== item._id)
          .map(i => ({ ...i, _id: i._id || generateId() }));
        saveMutation.mutate(newItems);
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

  // Build flat list for rendering - recalculates hasChildren from current items array
  const buildFlatList = () => {
    const result = [];
    // Pre-calculate which items have children by checking parent_id references
    const itemIdsWithChildren = new Set();
    items.forEach(i => {
      if (i.parent_id) {
        itemIdsWithChildren.add(i.parent_id);
      }
    });
    
    const addItems = (parentId, depth) => {
      if (depth > 3) return; // Allow 3 levels of nesting
      const children = getItemsByParent(parentId).sort((a, b) => (a.order || 0) - (b.order || 0));
      children.forEach(child => {
        const hasChildren = itemIdsWithChildren.has(child._id);
        result.push({ ...child, depth, hasChildren });
        // Always recurse if has children and expanded
        if (hasChildren && expandedParents.has(child._id)) {
          addItems(child._id, depth + 1);
        }
      });
    };
    addItems(null, 0);
    return result;
  };

  // Get valid parent options for the form dialog
  const getParentOptions = () => getValidParents(editingItem);

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
                        <Draggable key={item._id} draggableId={item._id} index={index}>
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
                              
                              {item.hasChildren ? (
                                <button onClick={() => toggleParent(item._id)} className="p-0.5">
                                  {expandedParents.has(item._id) ? 
                                    <ChevronDown className="h-4 w-4 text-gray-400" /> : 
                                    <ChevronRight className="h-4 w-4 text-gray-400" />
                                  }
                                </button>
                              ) : (
                                <div className="w-5" /> 
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
                                    {getValidParents(item._id).filter(p => p._id !== item.parent_id).map(parent => (
                                      <DropdownMenuItem 
                                        key={parent._id}
                                        onClick={() => handleMoveToParent(item, parent._id)}
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
                              setFormData({ name, slug, icon: "File", is_visible: true, parent_id: null, item_type: "page", default_collapsed: false, _id: generateId() });
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
                                                            <Power className="h-4 w-4 text-red-500" />
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
                    <SelectItem key={parent._id} value={parent._id}>{parent.name}</SelectItem>
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