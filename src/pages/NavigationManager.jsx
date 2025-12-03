import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTenant } from "@/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Copy, ChevronDown, ChevronRight, FolderOpen, FileCode, Settings, Power, Pencil, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { toast } from "sonner";

import NavigationItemForm from "@/components/navigation/NavigationItemForm";
import NavigationItemRow from "@/components/navigation/NavigationItemRow";
import TenantSelector from "@/components/navigation/TenantSelector";
import AdminConsoleNavEditor from "@/components/navigation/AdminConsoleNavEditor";
import PageSettingsDialog from "@/components/common/PageSettingsDialog";
import UnallocationConfirmDialog from "@/components/navigation/UnallocationConfirmDialog";

// All known live page slugs - these are actual app pages
const ALL_LIVE_PAGE_SLUGS = [
  "Home", "Projects", "ProjectDetail", "ProjectDetails", "ProjectForm", "ProjectsOverview",
  "Tasks", "Customers", "Team", "Estimates", "Calendar",
  "WebsiteEnquiryForm", "AppointmentHub", "AppointmentConfirm", "AppointmentManager",
  "InterestOptionsManager", "TenantAccess", "Setup"
];

export default function NavigationManager() {
  const tenantContext = useTenant();
  const [currentUser, setCurrentUser] = useState(null);
  const queryClient = useQueryClient();
  
  const [selectedTenantId, setSelectedTenantId] = useState(
    tenantContext?.tenantId || "__global__"
  );
  
  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);
  
  const isGlobalAdmin = currentUser?.is_global_admin === true;
  const isTenantAdminOnly = tenantContext?.isTenantAdmin && !isGlobalAdmin;
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem("navManager_settings");
    const settings = saved ? JSON.parse(saved) : {};
    return settings.defaultTab || "admin";
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [showSettings, setShowSettings] = useState(false);
  const [unallocatedExpanded, setUnallocatedExpanded] = useState(true);
  const [unallocationItem, setUnallocationItem] = useState(null);
  const [allocatingSlug, setAllocatingSlug] = useState(null);
  const [pageSettings, setPageSettings] = useState(() => {
    const saved = localStorage.getItem("navManager_settings");
    return saved ? JSON.parse(saved) : { defaultTab: "admin", autoExpandAll: false, showUnallocated: true };
  });

  const settingsOptions = [
    { key: "defaultTab", label: "Default Tab", type: "select", options: [
      { value: "admin", label: "Admin Console" },
      { value: "live", label: "Live Pages" },
      { value: "tenant", label: "Tenant Navigation" }
    ], description: "Which tab to show by default" },
    { key: "autoExpandAll", label: "Auto-expand all items", type: "boolean", description: "Automatically expand all parent items on load" },
    { key: "showUnallocated", label: "Show unallocated pages", type: "boolean", description: "Display unallocated pages section" }
  ];

  const handleSaveSettings = (newSettings) => {
    setPageSettings(newSettings);
    localStorage.setItem("navManager_settings", JSON.stringify(newSettings));
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

  // Find unallocated pages
  const allocatedSlugs = navItems.map(i => i.page_url).filter(Boolean);
  const unallocatedSlugs = ALL_LIVE_PAGE_SLUGS.filter(slug => !allocatedSlugs.includes(slug));

  // Get parent items - support 3 levels
  const parentItems = navItems.filter(i => !i.parent_id);
  const getChildren = (parentId) => navItems.filter(i => i.parent_id === parentId).sort((a, b) => (a.order || 0) - (b.order || 0));
  
  // Get depth of an item (for limiting nesting to 3 levels)
  const getItemDepth = (item) => {
    let depth = 0;
    let currentParentId = item.parent_id;
    while (currentParentId && depth < 3) {
      const parent = navItems.find(i => i.id === currentParentId);
      if (parent) {
        depth++;
        currentParentId = parent.parent_id;
      } else {
        break;
      }
    }
    return depth;
  };

  const toggleExpand = (itemId) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  const expandAll = () => {
    const allParentIds = navItems.filter(i => navItems.some(c => c.parent_id === i.id)).map(i => i.id);
    setExpandedItems(new Set(allParentIds));
  };

  const collapseAll = () => setExpandedItems(new Set());

  // Mutations
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

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.NavigationItem.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["navigationItems", selectedTenantId] });
      setIsFormOpen(false);
      setEditingItem(null);
      toast.success("Navigation item updated");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.NavigationItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["navigationItems", selectedTenantId] });
      toast.success("Navigation item deleted");
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (item) => {
      return base44.entities.NavigationItem.create({
        tenant_id: selectedTenantId,
        name: `${item.name} (Copy)`,
        item_type: item.item_type,
        page_url: item.page_url,
        icon: item.icon,
        is_visible: item.is_visible,
        roles: item.roles || [],
        order: navItems.length
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["navigationItems", selectedTenantId] });
      toast.success("Item duplicated");
    },
  });

  const copyGlobalMutation = useMutation({
    mutationFn: async (tenantId) => {
      const globalItems = await base44.entities.NavigationItem.filter({ tenant_id: "__global__" }, "order");
      const topLevelItems = globalItems.filter(i => !i.parent_id);
      const oldIdToNewId = {};
      
      for (const item of topLevelItems) {
        const created = await base44.entities.NavigationItem.create({
          tenant_id: tenantId,
          name: item.name,
          item_type: item.item_type || "page",
          page_url: item.page_url || item.page_slug || "",
          icon: item.icon,
          order: item.order,
          is_visible: item.is_visible,
          roles: item.roles || []
        });
        oldIdToNewId[item.id] = created.id;
      }
      
      const childItems = globalItems.filter(i => i.parent_id);
      for (const item of childItems) {
        const newParentId = oldIdToNewId[item.parent_id];
        await base44.entities.NavigationItem.create({
          tenant_id: tenantId,
          name: item.name,
          item_type: item.item_type || "page",
          page_url: item.page_url || item.page_slug || "",
          icon: item.icon,
          order: item.order,
          is_visible: item.is_visible,
          parent_id: newParentId,
          roles: item.roles || []
        });
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["navigationItems", selectedTenantId] });
      toast.success("Global navigation copied to tenant");
    },
  });

  // Allocate unallocated page - opens form for configuration
  const handleAllocateClick = (slug) => {
    const name = slug.replace(/([A-Z])/g, ' $1').trim();
    setAllocatingSlug(slug);
    setEditingItem({ 
      name, 
      item_type: "page", 
      page_url: slug, 
      icon: "FileText", 
      is_visible: true,
      roles: [],
      _isNew: true
    });
    setIsFormOpen(true);
  };

  // Unallocate - remove from navigation
  const handleUnallocate = (item) => {
    setUnallocationItem(item);
  };

  const confirmUnallocate = () => {
    if (unallocationItem) {
      deleteMutation.mutate(unallocationItem.id);
      setUnallocationItem(null);
    }
  };

  // Drag handlers
  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;

    const { source, destination } = result;
    
    const flatList = [];
    const topLevel = navItems.filter(i => !i.parent_id).sort((a, b) => (a.order || 0) - (b.order || 0));
    
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

    const draggedItem = flatList[source.index];
    const destItem = flatList[destination.index];
    
    if (!draggedItem) return;

    const draggedParentId = draggedItem.parent_id || null;
    const destParentId = destItem?.parent_id || null;

    if (draggedParentId !== destParentId) {
      toast.info("Use the edit form to change parent. Drag to reorder within same level.");
      return;
    }

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
      .map((item, index) => item.order !== index ? base44.entities.NavigationItem.update(item.id, { order: index }) : null)
      .filter(Boolean);

    if (updates.length > 0) {
      await Promise.all(updates);
      queryClient.invalidateQueries({ queryKey: ["navigationItems", selectedTenantId] });
    }
  };

  const handleSubmit = (formData) => {
    if (editingItem?._isNew || allocatingSlug) {
      // Creating new item from unallocated
      createMutation.mutate(formData);
      setAllocatingSlug(null);
    } else if (editingItem) {
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
    updateMutation.mutate({ id: item.id, data: { is_visible: !item.is_visible } });
  };

  const handleMoveToParent = async (item, newParentId) => {
    const newSiblings = navItems.filter(i => (i.parent_id || null) === newParentId);
    await base44.entities.NavigationItem.update(item.id, { 
      parent_id: newParentId,
      order: newSiblings.length
    });
    queryClient.invalidateQueries({ queryKey: ["navigationItems", selectedTenantId] });
    toast.success(newParentId ? "Item moved" : "Moved to top level");
  };

  const getParentOptions = (currentItem) => {
    // Support 3 levels: top level can have children, children can have grandchildren
    // Exclude the current item and its descendants
    const isDescendantOf = (item, ancestorId) => {
      if (!item.parent_id) return false;
      if (item.parent_id === ancestorId) return true;
      const parent = navItems.find(i => i.id === item.parent_id);
      return parent ? isDescendantOf(parent, ancestorId) : false;
    };
    
    const topLevel = navItems.filter(i => 
      !i.parent_id && 
      i.id !== currentItem?.id && 
      !isDescendantOf(i, currentItem?.id)
    );
    const level1 = navItems.filter(i => 
      i.parent_id && 
      topLevel.some(t => t.id === i.parent_id) && 
      i.id !== currentItem?.id &&
      !isDescendantOf(i, currentItem?.id)
    );
    
    return [
      ...topLevel.map(i => ({ ...i, depth: 0 })),
      ...level1.map(i => ({ ...i, depth: 1 }))
    ];
  };

  // Build flat list for rendering - support 3 levels
  const buildFlatList = () => {
    const flatList = [];
    const topLevel = navItems.filter(i => !i.parent_id).sort((a, b) => (a.order || 0) - (b.order || 0));
    
    const addItems = (items, depth) => {
      if (depth > 2) return; // Max 3 levels (0, 1, 2)
      items.forEach(item => {
        const children = getChildren(item.id);
        flatList.push({ ...item, depth, hasChildren: children.length > 0 });
        if (expandedItems.has(item.id)) {
          addItems(children, depth + 1);
        }
      });
    };
    addItems(topLevel, 0);
    return flatList;
  };

  const renderNavigationEditor = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Navigation Manager</CardTitle>
        <div className="flex items-center gap-4">
          {isGlobalAdmin ? (
            <TenantSelector
              tenants={tenants}
              selectedTenantId={selectedTenantId}
              onSelectTenant={setSelectedTenantId}
            />
          ) : (
            <span className="text-sm text-gray-500">
              Editing: {tenantContext?.tenantName || "Your Tenant"}
            </span>
          )}
          {selectedTenantId !== "__global__" && navItems.length === 0 && (
            <Button variant="outline" onClick={() => copyGlobalMutation.mutate(selectedTenantId)}>
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
        ) : (
          <>
            {navItems.length > 0 && (
              <div className="flex gap-2 mb-4">
                <Button variant="outline" size="sm" onClick={expandAll}>
                  <ChevronDown className="h-4 w-4 mr-1" /> Expand All
                </Button>
                <Button variant="outline" size="sm" onClick={collapseAll}>
                  <ChevronRight className="h-4 w-4 mr-1" /> Collapse All
                </Button>
              </div>
            )}

            {/* Allocated Items */}
            {navItems.length > 0 && (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="nav-list">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2 mb-6">
                      {buildFlatList().map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided, snapshot) => (
                            <div ref={provided.innerRef} {...provided.draggableProps} style={provided.draggableProps.style}>
                              <div style={{ marginLeft: item.depth * 24 }} className="flex items-center gap-1">
                                {item.hasChildren ? (
                                  <button onClick={() => toggleExpand(item.id)} className="p-1 hover:bg-gray-100 rounded">
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
                                    onDuplicate={() => duplicateMutation.mutate(item)}
                                    onUnallocate={handleUnallocate}
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
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}

            {/* Unallocated Pages */}
            {pageSettings.showUnallocated && unallocatedSlugs.length > 0 && (
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
                {unallocatedExpanded && (
                  <div className="space-y-2">
                    {unallocatedSlugs.map(slug => (
                      <div 
                        key={slug} 
                        className="group flex items-center gap-3 p-3 bg-gray-50 border border-dashed border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="w-5" /> {/* Spacer for alignment */}
                        <div className="flex items-center gap-2 flex-1">
                          <FileCode className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-600">{slug.replace(/([A-Z])/g, ' $1').trim()}</span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleAllocateClick(slug)}
                            title="Edit allocation"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleAllocateClick(slug)}
                            title="Allocate to navigation"
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

            {navItems.length === 0 && unallocatedSlugs.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No pages available.
              </div>
            )}
          </>
        )}
      </CardContent>
      <NavigationItemForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingItem(null); }}
        onSubmit={handleSubmit}
        item={editingItem}
        tenantId={selectedTenantId}
        parentOptions={getParentOptions(editingItem)}
      />
    </Card>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {isGlobalAdmin ? (
        <>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              {["admin", "live", "tenant"].map((tab) => (
                <Button
                  key={tab}
                  variant={activeTab === tab ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab(tab)}
                  className="gap-2"
                >
                  {tab === "live" && <FileCode className="h-4 w-4" />}
                  {tab === "admin" ? "Admin Console" : tab === "live" ? "Live Pages" : "Tenant Navigation"}
                </Button>
              ))}
            </div>
            <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)}>
              <Settings className="h-5 w-5" />
            </Button>
          </div>

          {activeTab === "admin" && <AdminConsoleNavEditor key="admin" />}
          {activeTab === "live" && <div key="live">{renderNavigationEditor()}</div>}
          {activeTab === "tenant" && <div key="tenant">{renderNavigationEditor()}</div>}
        </>
      ) : (
        renderNavigationEditor()
      )}

      <PageSettingsDialog
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={pageSettings}
        onSave={handleSaveSettings}
        options={settingsOptions}
        title="Navigation Manager Settings"
      />

      <UnallocationConfirmDialog
        isOpen={!!unallocationItem}
        onClose={() => setUnallocationItem(null)}
        onConfirm={confirmUnallocate}
        itemName={unallocationItem?.name}
      />
    </div>
  );
}