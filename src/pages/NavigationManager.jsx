import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Copy } from "lucide-react";
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
  const queryClient = useQueryClient();

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

    const { source, destination, draggableId } = result;
    
    // Parse parent IDs from droppable IDs
    const sourceParentId = source.droppableId === 'top-level' ? null : source.droppableId.replace('children-', '');
    const destParentId = destination.droppableId === 'top-level' ? null : destination.droppableId.replace('children-', '');
    
    const draggedItem = navItems.find(item => item.id === draggableId);
    if (!draggedItem) return;

    // Check depth limit when moving to a new parent
    if (sourceParentId !== destParentId && destParentId) {
      const destParentDepth = getItemDepth(destParentId, navItems);
      const draggedChildDepth = getMaxChildDepth(draggableId, navItems);
      const newTotalDepth = destParentDepth + 1 + draggedChildDepth;
      
      if (newTotalDepth > 2) {
        toast.error("Cannot move here - would exceed 3 level nesting limit");
        return;
      }
      
      // Check for circular nesting
      const isDescendant = (parentId, itemId) => {
        if (!parentId) return false;
        if (parentId === itemId) return true;
        const parent = navItems.find(i => i.id === parentId);
        return parent ? isDescendant(parent.parent_id, itemId) : false;
      };
      if (isDescendant(destParentId, draggableId)) {
        toast.error("Cannot nest a parent inside its own children");
        return;
      }
    }

    const updates = [];

    if (sourceParentId !== destParentId) {
      // Moving between different parents
      const destChildren = navItems
        .filter(item => (item.parent_id || null) === destParentId && item.id !== draggableId)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      
      destChildren.splice(destination.index, 0, draggedItem);
      
      destChildren.forEach((item, index) => {
        if (item.id === draggedItem.id) {
          updates.push(
            base44.entities.NavigationItem.update(item.id, {
              parent_id: destParentId,
              order: index
            })
          );
        } else if (item.order !== index) {
          updates.push(
            base44.entities.NavigationItem.update(item.id, { order: index })
          );
        }
      });
    } else {
      // Reordering within same parent
      if (source.index === destination.index) return;
      
      const siblings = navItems
        .filter(item => (item.parent_id || null) === sourceParentId)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      
      const reordered = Array.from(siblings);
      const [removed] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, removed);

      reordered.forEach((item, index) => {
        if (item.order !== index) {
          updates.push(
            base44.entities.NavigationItem.update(item.id, { order: index })
          );
        }
      });
    }

    if (updates.length > 0) {
      try {
        await Promise.all(updates);
        queryClient.invalidateQueries({ queryKey: ["navigationItems", selectedTenantId] });
        toast.success("Order updated");
      } catch (error) {
        toast.error("Failed to update order");
      }
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
          ) : navItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No navigation items. Add one or copy from global template.
            </div>
          ) : (
            <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
              <Droppable droppableId="nav-items">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2"
                  >
                    {(() => {
                      // Build nested structure - supports up to 2 levels
                      const topLevel = navItems.filter(i => !i.parent_id);
                      const getChildren = (parentId) => navItems.filter(i => i.parent_id === parentId);
                      const getParentName = (parentId) => navItems.find(i => i.id === parentId)?.name;

                      let flatIndex = 0;
                      const renderItems = [];

                      topLevel.forEach((item) => {
                        const idx = flatIndex++;
                        renderItems.push(
                          <Draggable key={item.id} draggableId={item.id} index={idx}>
                            {(provided) => (
                              <div ref={provided.innerRef} {...provided.draggableProps}>
                                <NavigationItemRow
                                  item={item}
                                  onEdit={handleEdit}
                                  onDelete={(item) => deleteMutation.mutate(item.id)}
                                  onToggleVisibility={handleToggleVisibility}
                                  dragHandleProps={provided.dragHandleProps}
                                  depth={0}
                                  onDropInto={handleDropIntoItem}
                                  canDropInto={canDropIntoItem(draggingItemId, item)}
                                  isDragging={draggingItemId === item.id}
                                />
                              </div>
                            )}
                          </Draggable>
                        );

                        // Render level 1 children
                        getChildren(item.id).forEach((child) => {
                          const childIdx = flatIndex++;
                          renderItems.push(
                            <Draggable key={child.id} draggableId={child.id} index={childIdx}>
                              {(provided) => (
                                <div ref={provided.innerRef} {...provided.draggableProps}>
                                  <NavigationItemRow
                                                  item={child}
                                                  onEdit={handleEdit}
                                                  onDelete={(item) => deleteMutation.mutate(item.id)}
                                                  onToggleVisibility={handleToggleVisibility}
                                                  dragHandleProps={provided.dragHandleProps}
                                                  depth={1}
                                                  parentName={item.name}
                                                  onDropInto={handleDropIntoItem}
                                                  canDropInto={canDropIntoItem(draggingItemId, child)}
                                                  isDragging={draggingItemId === child.id}
                                                />
                                </div>
                              )}
                            </Draggable>
                          );

                          // Render level 2 children (grandchildren)
                          getChildren(child.id).forEach((grandchild) => {
                            const grandchildIdx = flatIndex++;
                            renderItems.push(
                              <Draggable key={grandchild.id} draggableId={grandchild.id} index={grandchildIdx}>
                                {(provided) => (
                                  <div ref={provided.innerRef} {...provided.draggableProps}>
                                    <NavigationItemRow
                                                        item={grandchild}
                                                        onEdit={handleEdit}
                                                        onDelete={(item) => deleteMutation.mutate(item.id)}
                                                        onToggleVisibility={handleToggleVisibility}
                                                        dragHandleProps={provided.dragHandleProps}
                                                        depth={2}
                                                        parentName={child.name}
                                                        onDropInto={handleDropIntoItem}
                                                        canDropInto={canDropIntoItem(draggingItemId, grandchild)}
                                                        isDragging={draggingItemId === grandchild.id}
                                                      />
                                  </div>
                                )}
                              </Draggable>
                            );
                          });
                        });
                      });

                      return renderItems;
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