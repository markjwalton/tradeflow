import React, { useState } from "react";
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

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    // Build flat list in display order with depth info
    const buildFlatList = () => {
      const list = [];
      const topLevel = navItems.filter(i => !i.parent_id).sort((a, b) => a.order - b.order);
      const getChildren = (parentId) => navItems.filter(i => i.parent_id === parentId).sort((a, b) => a.order - b.order);
      
      topLevel.forEach(item => {
        list.push({ ...item, depth: 0 });
        getChildren(item.id).forEach(child => {
          list.push({ ...child, depth: 1 });
          getChildren(child.id).forEach(grandchild => {
            list.push({ ...grandchild, depth: 2 });
          });
        });
      });
      return list;
    };

    const flatList = buildFlatList();
    const [movedItem] = flatList.splice(result.source.index, 1);
    flatList.splice(result.destination.index, 0, movedItem);

    // Recalculate order for items at the same parent level
    const orderUpdates = [];
    const groupedByParent = {};
    
    flatList.forEach((item, displayIndex) => {
      const parentKey = item.parent_id || "__root__";
      if (!groupedByParent[parentKey]) groupedByParent[parentKey] = [];
      groupedByParent[parentKey].push({ id: item.id, displayIndex });
    });

    Object.values(groupedByParent).forEach(group => {
      group.forEach((item, orderInGroup) => {
        const original = navItems.find(n => n.id === item.id);
        if (original && original.order !== orderInGroup) {
          orderUpdates.push(base44.entities.NavigationItem.update(item.id, { order: orderInGroup }));
        }
      });
    });

    if (orderUpdates.length > 0) {
      await Promise.all(orderUpdates);
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
            <DragDropContext onDragEnd={handleDragEnd}>
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