import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Copy, ChevronDown, ChevronRight } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { toast } from "sonner";

import NavigationItemForm from "@/components/navigation/NavigationItemForm";
import NavigationItemRow from "@/components/navigation/NavigationItemRow";
import TenantSelector from "@/components/navigation/TenantSelector";

export default function NavigationManager() {
  const [selectedTenantId, setSelectedTenantId] = useState("__global__");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [draggingItemId, setDraggingItemId] = useState(null);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const queryClient = useQueryClient();

  const toggleExpand = (itemId) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const expandAll = () => {
    const allParentIds = navItems.filter(i => navItems.some(c => c.parent_id === i.id)).map(i => i.id);
    setExpandedItems(new Set(allParentIds));
  };

  const collapseAll = () => {
    setExpandedItems(new Set());
  };

  // Fetch tenants
  const { data: tenants = [] } = useQuery({
    queryKey: ["tenants"],
    queryFn: () => base44.entities.Tenant.list(),
  });

  // Fetch navigation items for selected tenant
  const { data: navItems = [], isLoading } = useQuery({
    queryKey: ["navigationItems", selectedTenantId],
    queryFn: () => base44.entities.NavigationItem.filter({ tenant_id: selectedTenantId }, "order"),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.NavigationItem.create({
      ...data,
      tenant_id: selectedTenantId,
      order: navItems.length
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["navigationItems", selectedTenantId] });
      setIsFormOpen(false);
      toast.success("Navigation item created");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.NavigationItem.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["navigationItems", selectedTenantId] });
      setIsFormOpen(false);
      setEditingItem(null);
      toast.success("Navigation item updated");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.NavigationItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["navigationItems", selectedTenantId] });
      toast.success("Navigation item deleted");
    },
  });

  // Copy global items to tenant
  const copyGlobalMutation = useMutation({
    mutationFn: async (tenantId) => {
      const globalItems = await base44.entities.NavigationItem.filter({ tenant_id: "__global__" }, "order");
      const itemsToCreate = globalItems.map((item, index) => ({
        tenant_id: tenantId,
        name: item.name,
        page_slug: item.page_slug,
        icon: item.icon,
        order: index,
        is_visible: item.is_visible,
        roles: item.roles || []
      }));
      return base44.entities.NavigationItem.bulkCreate(itemsToCreate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["navigationItems", selectedTenantId] });
      toast.success("Global navigation copied to tenant");
    },
  });

  // Get depth of an item's deepest child
  const getMaxChildDepth = (itemId, items, currentDepth = 0) => {
    const children = items.filter(i => i.parent_id === itemId);
    if (children.length === 0) return currentDepth;
    return Math.max(...children.map(c => getMaxChildDepth(c.id, items, currentDepth + 1)));
  };

  // Get depth of an item
  const getItemDepth = (itemId, items) => {
    const item = items.find(i => i.id === itemId);
    if (!item || !item.parent_id) return 0;
    return 1 + getItemDepth(item.parent_id, items);
  };

  // Check if dropping item into target would exceed depth limit
  const canDropIntoItem = (draggedItemId, targetItem) => {
    if (!draggedItemId || !targetItem) return false;
    if (draggedItemId === targetItem.id) return false;
    
    // Can't drop into non-folders at level 2
    const targetDepth = getItemDepth(targetItem.id, navItems);
    if (targetDepth >= 2) return false;
    
    // Check if dragged item + its children would exceed limit
    const draggedChildDepth = getMaxChildDepth(draggedItemId, navItems);
    const newTotalDepth = targetDepth + 1 + draggedChildDepth;
    if (newTotalDepth > 2) return false;

    // Can't drop parent into its own child
    const isDescendant = (parentId, itemId) => {
      if (!parentId) return false;
      if (parentId === itemId) return true;
      const parent = navItems.find(i => i.id === parentId);
      return parent ? isDescendant(parent.parent_id, itemId) : false;
    };
    if (isDescendant(targetItem.id, draggedItemId)) return false;

    return true;
  };

  const handleDropIntoItem = async (targetItem) => {
    if (!draggingItemId || !targetItem) return;
    
    const draggedItem = navItems.find(i => i.id === draggingItemId);
    if (!draggedItem || draggedItem.parent_id === targetItem.id) return;

    // Get new order (add to end of target's children)
    const targetChildren = navItems.filter(i => i.parent_id === targetItem.id);
    const newOrder = targetChildren.length;

    await base44.entities.NavigationItem.update(draggingItemId, { 
      parent_id: targetItem.id,
      order: newOrder
    });
    
    queryClient.invalidateQueries({ queryKey: ["navigationItems", selectedTenantId] });
    toast.success(`Moved into ${targetItem.name}`);
    setDraggingItemId(null);
  };

  const handleDragStart = (result) => {
    setDraggingItemId(result.draggableId);
  };

  const handleDragEnd = async (result) => {
    setDraggingItemId(null);
    
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;

    const { source, destination, draggableId } = result;
    
    // Build flat list to match display order
    const flatList = [];
    const topLevel = navItems.filter(i => !i.parent_id).sort((a, b) => (a.order || 0) - (b.order || 0));
    const getChildren = (parentId) => navItems.filter(i => i.parent_id === parentId).sort((a, b) => (a.order || 0) - (b.order || 0));
    
    const addItems = (items, depth) => {
      items.forEach(item => {
        flatList.push({ ...item, depth });
        addItems(getChildren(item.id), depth + 1);
      });
    };
    addItems(topLevel, 0);

    const draggedItem = flatList[source.index];
    const destItem = flatList[destination.index];
    
    if (!draggedItem) return;

    // Only allow reordering within same parent level
    const draggedParentId = draggedItem.parent_id || null;
    const destParentId = destItem?.parent_id || null;

    if (draggedParentId !== destParentId) {
      toast.info("Use the edit form to change parent. Drag to reorder within same level.");
      return;
    }

    // Get siblings and reorder
    const siblings = navItems
      .filter(item => (item.parent_id || null) === draggedParentId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    const sourceIdx = siblings.findIndex(s => s.id === draggedItem.id);
    const destIdx = siblings.findIndex(s => s.id === destItem?.id);

    if (sourceIdx === -1 || destIdx === -1 || sourceIdx === destIdx) return;

    const reordered = Array.from(siblings);
    const [removed] = reordered.splice(sourceIdx, 1);
    reordered.splice(destIdx, 0, removed);

    const updates = reordered
      .map((item, index) => {
        if (item.order !== index) {
          return base44.entities.NavigationItem.update(item.id, { order: index });
        }
        return null;
      })
      .filter(Boolean);

    if (updates.length > 0) {
      await Promise.all(updates);
      queryClient.invalidateQueries({ queryKey: ["navigationItems", selectedTenantId] });
    }
  };

  const handleSubmit = (formData) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleToggleVisibility = (item) => {
    updateMutation.mutate({ 
      id: item.id, 
      data: { is_visible: !item.is_visible } 
    });
  };

  const handleMoveToParent = async (item, newParentId) => {
    // Get new order (add to end of new parent's children)
    const newSiblings = navItems.filter(i => (i.parent_id || null) === newParentId);
    const newOrder = newSiblings.length;

    await base44.entities.NavigationItem.update(item.id, { 
      parent_id: newParentId,
      order: newOrder
    });
    
    queryClient.invalidateQueries({ queryKey: ["navigationItems", selectedTenantId] });
    toast.success(newParentId ? "Item moved" : "Moved to top level");
  };

  // Build parent options for move dropdown
  const getParentOptions = (currentItem) => {
    const topLevel = navItems.filter(i => !i.parent_id && i.id !== currentItem.id);
    const level1 = navItems.filter(i => i.parent_id && topLevel.some(t => t.id === i.parent_id) && i.id !== currentItem.id);
    
    // Check if item has children - if so, limit where it can go
    const hasChildren = navItems.some(i => i.parent_id === currentItem.id);
    const hasGrandchildren = navItems.some(i => {
      const parent = navItems.find(p => p.id === i.parent_id);
      return parent?.parent_id === currentItem.id;
    });

    let options = [];
    
    // Can always go to top level items as parent (depth 0 -> 1)
    options = [...topLevel.map(i => ({ ...i, depth: 0 }))];
    
    // Can only go to level1 items if no grandchildren (would exceed 3 levels)
    if (!hasGrandchildren) {
      options = [...options, ...level1.map(i => ({ ...i, depth: 1 }))];
    }
    
    return options;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Navigation Manager</CardTitle>
          <div className="flex items-center gap-4">
            <TenantSelector
              tenants={tenants}
              selectedTenantId={selectedTenantId}
              onSelectTenant={setSelectedTenantId}
            />
            {selectedTenantId !== "__global__" && navItems.length === 0 && (
              <Button 
                variant="outline" 
                onClick={() => copyGlobalMutation.mutate(selectedTenantId)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy from Global
              </Button>
            )}
            <Button onClick={() => { setEditingItem(null); setIsFormOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : navItems.length > 0 && (
            <div className="flex gap-2 mb-4">
              <Button variant="outline" size="sm" onClick={expandAll}>
                <ChevronDown className="h-4 w-4 mr-1" /> Expand All
              </Button>
              <Button variant="outline" size="sm" onClick={collapseAll}>
                <ChevronRight className="h-4 w-4 mr-1" /> Collapse All
              </Button>
            </div>
          )}
          {navItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No navigation items. Add one or copy from global template.
            </div>
          ) : (
            <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
              <Droppable droppableId="nav-list">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2"
                  >
                    {(() => {
                      // Build flat list with depth info for display, respecting collapsed state
                      const flatList = [];
                      const topLevel = navItems.filter(i => !i.parent_id).sort((a, b) => (a.order || 0) - (b.order || 0));
                      const getChildren = (parentId) => navItems.filter(i => i.parent_id === parentId).sort((a, b) => (a.order || 0) - (b.order || 0));

                      const addItems = (items, depth) => {
                        items.forEach(item => {
                          const children = getChildren(item.id);
                          flatList.push({ ...item, depth, hasChildren: children.length > 0 });
                          if (expandedItems.has(item.id)) {
                            addItems(children, depth + 1);
                          }
                        });
                      };
                      addItems(topLevel, 0);

                      return flatList.map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided, snapshot) => (
                            <div 
                              ref={provided.innerRef} 
                              {...provided.draggableProps}
                              style={provided.draggableProps.style}
                            >
                              <div style={{ marginLeft: item.depth * 24 }} className="flex items-center gap-1">
                                {item.hasChildren ? (
                                  <button 
                                    onClick={() => toggleExpand(item.id)}
                                    className="p-1 hover:bg-gray-100 rounded"
                                  >
                                    {expandedItems.has(item.id) ? (
                                      <ChevronDown className="h-4 w-4 text-gray-500" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4 text-gray-500" />
                                    )}
                                  </button>
                                ) : (
                                  <div className="w-6" />
                                )}
                                <div className="flex-1">
                                <NavigationItemRow
                                  item={item}
                                  onEdit={handleEdit}
                                  onDelete={(item) => deleteMutation.mutate(item.id)}
                                  onToggleVisibility={handleToggleVisibility}
                                  onMoveToParent={handleMoveToParent}
                                  parentOptions={getParentOptions(item)}
                                  dragHandleProps={provided.dragHandleProps}
                                  depth={item.depth}
                                  isDragging={snapshot.isDragging}
                                />
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ));
                    })()}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </CardContent>
      </Card>

      <NavigationItemForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingItem(null); }}
        onSubmit={handleSubmit}
        item={editingItem}
        tenantId={selectedTenantId}
        parentOptions={(() => {
          // Allow selecting top-level items or level-1 items as parents (max 2 levels deep)
          const topLevel = navItems.filter(i => !i.parent_id);
          const level1 = navItems.filter(i => i.parent_id && topLevel.some(t => t.id === i.parent_id));
          return [
            ...topLevel.map(i => ({ ...i, depth: 0 })),
            ...level1.map(i => ({ ...i, depth: 1 }))
          ];
        })()}
      />
    </div>
  );
}