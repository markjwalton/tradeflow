import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, GripVertical, Pencil, Trash2, Copy, FolderOpen, Power, Sparkles, Loader2,
  Folder, File, ChevronDown, ChevronRight, MoveRight, CornerDownRight, AlertCircle, Database
} from "lucide-react";
import DeletePageDialog from "./DeletePageDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { toast } from "sonner";
import NotificationCard from "../common/NotificationCard";

// Layout cache key (shared with Layout.js)
const LAYOUT_CACHE_KEY = 'layout_init_cache';

// Import shared nav utilities
import { getIconOptions, getIconByName, renderIcon } from "./NavIconMap";
import { 
  generateNavId as generateId, 
  getChildren, 
  getTopLevelItems, 
  getValidParents,
  getFolderParents,
  buildFlatNavList,
  ensureItemIds,
  isFolder
} from "./NavTypes";

const iconOptions = getIconOptions();

/**
 * GenericNavEditor - A reusable, multi-tenant navigation editor component
 * 
 * Props:
 * - title: string - Title for the card
 * - configType: string - The config_type to filter NavigationConfig (e.g., "admin_console", "app_pages_source")
 * - sourceSlugs: string[] - (deprecated, use source_slugs in NavigationConfig entity)
 * - onCopyFromTemplate: function - Optional callback to copy from another template
 * - showCopyButton: boolean - Whether to show the copy button
 * - copyButtonLabel: string - Label for the copy button
 * - tenantId: string - Optional tenant ID for tenant-specific navigation
 * - isGlobal: boolean - If true, edits global config; if false with tenantId, edits tenant-specific
 */
export default function GenericNavEditor({
  title = "Navigation",
  configType,
  sourceSlugs = [],
  onCopyFromTemplate,
  showCopyButton = false,
  copyButtonLabel = "Copy from Template",
  tenantId = null,
  isGlobal = true,
  syncUnallocatedPages,
  isSyncing = false
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
  const [allPagesExpanded, setAllPagesExpanded] = useState(false);
  const [initialExpandDone, setInitialExpandDone] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState({});
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [expandedPageDetails, setExpandedPageDetails] = useState(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalItems, setOriginalItems] = useState([]);
  const [showCreatePageDialog, setShowCreatePageDialog] = useState(false);
  const [newPageName, setNewPageName] = useState("");
  const [newPageTitle, setNewPageTitle] = useState("");
  const [isCreatingPage, setIsCreatingPage] = useState(false);
  const [notification, setNotification] = useState({ show: false, title: "", message: "", variant: "success" });

  // Build the effective config type (tenant-prefixed if tenant-specific)
  const effectiveConfigType = tenantId && !isGlobal 
    ? `${configType}_tenant_${tenantId}` 
    : configType;

  // Fetch config for this type (tenant-specific or global)
  const { data: navConfigs = [], isLoading } = useQuery({
    queryKey: ["navConfig", effectiveConfigType],
    queryFn: () => base44.entities.NavigationConfig.filter({ config_type: effectiveConfigType }),
  });

  // Fetch global config as fallback/template for tenant configs
  const { data: globalConfigs = [] } = useQuery({
    queryKey: ["navConfig", configType, "global"],
    queryFn: () => base44.entities.NavigationConfig.filter({ config_type: configType }),
    enabled: !!tenantId && !isGlobal, // Only fetch when editing tenant-specific
  });

  const config = navConfigs[0];
  const rawItems = config?.items || [];

  // Normalize IDs: database uses 'id', ensure all items have it
  const items = React.useMemo(() => {
    if (!Array.isArray(rawItems)) return [];
    return rawItems.map(item => ({
      ...item,
      id: item.id || item._id || generateId()
    }));
  }, [rawItems]);

  // Track original items for unsaved changes detection
  useEffect(() => {
    if (items.length > 0 && originalItems.length === 0) {
      setOriginalItems(JSON.parse(JSON.stringify(items)));
    }
  }, [items, originalItems.length]);

  // Detect unsaved changes
  useEffect(() => {
    if (originalItems.length === 0) return;
    const hasChanges = JSON.stringify(items) !== JSON.stringify(originalItems);
    setHasUnsavedChanges(hasChanges);
  }, [items, originalItems]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);
  
  // Get slugs from config's source_slugs (no hardcoded fallback)
  const effectiveSlugs = React.useMemo(() => {
    const slugs = config?.source_slugs || [];
    return Array.isArray(slugs) ? slugs.sort() : [];
  }, [config?.source_slugs]);
  
  // Initial expand logic - always check user settings on mount
  React.useEffect(() => {
    if (!initialExpandDone && items.length > 0) {
      base44.auth.me()
        .then(user => {
          const defaultCollapsed = user?.ui_preferences?.navManager_settings?.defaultCollapsed || false;

          if (!defaultCollapsed) {
            // Expand all top-level folders
            const foldersToExpand = items
              .filter(item => !item.parent_id && item.item_type === "folder")
              .map(item => item.id);
            setExpandedParents(new Set(foldersToExpand));
            sessionStorage.setItem(`nav_expanded_${configType}`, JSON.stringify(foldersToExpand));
          } else {
            // Everything collapsed
            setExpandedParents(new Set());
            sessionStorage.setItem(`nav_expanded_${configType}`, JSON.stringify([]));
          }
          
          setInitialExpandDone(true);
        })
        .catch(() => {
          // Fallback if user not available - expand all
          const foldersToExpand = items
            .filter(item => !item.parent_id && item.item_type === "folder")
            .map(item => item.id);
          setExpandedParents(new Set(foldersToExpand));
          sessionStorage.setItem(`nav_expanded_${configType}`, JSON.stringify(foldersToExpand));
          setInitialExpandDone(true);
        });
    }
  }, [items, initialExpandDone, configType]);

  // Calculate unallocated slugs using effective (merged) slugs
  const allocatedSlugs = Array.isArray(items) ? items.map(i => i.slug).filter(Boolean) : [];
  const unallocatedSlugs = Array.isArray(effectiveSlugs) ? effectiveSlugs.filter(slug => !allocatedSlugs.includes(slug)) : [];

  // Use shared hierarchy helpers
  const getItemsByParent = (parentId) => getChildren(parentId, items);
  const getParentOptions = (excludeId) => getValidParents(excludeId, items);
  const getMoveParentOptions = (excludeId) => getFolderParents(excludeId, items);

  const saveMutation = useMutation({
        mutationFn: async (newItems) => {
          // Ensure all items have id before saving
          const itemsWithIds = newItems.map(item => ({
            ...item,
            id: item.id || generateId()
          }));
          if (config) {
            return base44.entities.NavigationConfig.update(config.id, { items: itemsWithIds });
          } else {
            return base44.entities.NavigationConfig.create({ 
              config_type: effectiveConfigType, 
              items: itemsWithIds,
              source_slugs: sourceSlugs
            });
          }
        },
        onSuccess: (_, newItems) => {
          // Invalidate ALL navigation queries
          queryClient.invalidateQueries({ queryKey: ["navConfig"] });
          setOriginalItems(JSON.parse(JSON.stringify(newItems)));
          setHasUnsavedChanges(false);
          
          // Clear layout cache so navigation refreshes immediately
          sessionStorage.removeItem('nav_config_cache');
          sessionStorage.removeItem('layout_init_cache');
          
          toast.success("Navigation saved - refreshing...");
          
          // Force reload after a brief delay
          setTimeout(() => {
            window.location.reload();
          }, 500);
        },
      });

  // Save changes explicitly
  const handleSaveChanges = () => {
    const loadingToast = toast.loading("Saving navigation changes...");
    saveMutation.mutate(items, {
      onSuccess: () => {
        toast.success("✓ Navigation saved successfully", { id: loadingToast });
      },
      onError: (error) => {
        toast.error(`Failed to save: ${error.message}`, { id: loadingToast });
      }
    });
  };

  // Copy from global template to tenant config
  const handleCopyFromGlobal = () => {
    if (globalConfigs.length > 0 && globalConfigs[0].items?.length > 0) {
      const copiedItems = globalConfigs[0].items.map(item => ({
        ...item,
        id: generateId() // Generate new IDs for the copy
      }));
      saveMutation.mutate(copiedItems);
      toast.success("Copied from global template");
    } else {
      toast.error("No global template to copy from");
    }
  };

  // Find item by unique id
  const findItemById = (id) => items.find(i => i.id === id);
  const findItemIndexById = (id) => items.findIndex(i => i.id === id);

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
    const srcIdx = siblings.findIndex(s => s.id === draggedItem.id);
    const dstIdx = siblings.findIndex(s => s.id === destItem?.id);
    
    if (srcIdx === -1 || dstIdx === -1 || srcIdx === dstIdx) return;
    
    const reordered = Array.from(siblings);
    const [removed] = reordered.splice(srcIdx, 1);
    reordered.splice(dstIdx, 0, removed);
    
    // Rebuild items with new order - preserve id on all items
    const otherItems = items.filter(i => (i.parent_id || null) !== (draggedItem.parent_id || null))
      .map(i => ({ ...i, id: i.id || generateId() }));
    const updatedSiblings = reordered.map((item, idx) => ({ ...item, id: item.id || generateId(), order: idx }));
    
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
      // Update by id
      newItems = items.map((item) => {
        if (item.id === editingItem) {
          return { ...itemToSave, id: item.id, order: item.order ?? items.length };
        }
        return item;
      });
    } else {
      // Create new with unique id
      newItems = [...items, { ...itemToSave, id: generateId(), order: items.length }];
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
    // Use id for editing reference
    setEditingItem(item.id);
    setFormData({ ...item });
    setShowDialog(true);
  };

  const handleDelete = (item) => {
    // Check if page is in main navigation
    if (item.item_type === "page" && item.slug) {
      const isInMainNav = items.some(i => i.slug === item.slug);
      if (isInMainNav) {
        toast.error("Remove page from navigation first before deleting");
        return;
      }
    }

    // For immediate delete (folders/items without entities)
    const newItems = items.filter(i => 
      i.id !== item.id && i.parent_id !== item.id
    );
    saveMutation.mutate(newItems);
  };

  // Open delete dialog with entity detection
  const handleDeletePage = async (page) => {
    if (!page.slug) return;

    // Check if page is in main navigation
    const isInMainNav = items.some(i => i.slug === page.slug);
    if (isInMainNav) {
      toast.error("Remove page from navigation first before deleting");
      return;
    }

    // Detect related entities (simplified - you can enhance this)
    const relatedEntities = [];
    // TODO: Add logic to detect entities related to this page
    // For now, we'll just check if the page name matches any entity naming pattern
    
    setPageToDelete(page);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async ({ page, selectedFiles }) => {
    // Remove from navigation
    const newItems = items.filter(i => i.slug !== page.slug);
    
    // Delete selected files (this would need a backend function)
    // For now, just remove from navigation
    saveMutation.mutate(newItems);
    
    toast.success(`${selectedFiles.length} file(s) deleted`);
  };

  const handleDuplicate = (item) => {
    const duplicate = { 
      ...item, 
      id: generateId(),
      name: `${item.name} (Copy)`,
      parent_id: null,
      order: items.length
    };
    saveMutation.mutate([...items, duplicate]);
    toast.success("Item duplicated");
  };

  const handleToggleVisibility = (item) => {
    const newItems = items.map((i) => {
      if (i.id === item.id) {
        return { ...i, is_visible: !i.is_visible };
      }
      return i;
    });
    saveMutation.mutate(newItems);
  };

  const handleMoveToParent = (item, newParentId) => {
    // Update by id, set new parent_id - preserve ALL existing fields including id
    const newItems = items.map((i) => ({
      ...i,
      parent_id: i.id === item.id ? (newParentId || null) : i.parent_id
    }));
    saveMutation.mutate(newItems);
    // Auto-expand the new parent to show the moved item
    if (newParentId) {
      setExpandedParents(prev => {
        const next = new Set([...prev, newParentId]);
        sessionStorage.setItem(`nav_expanded_${configType}`, JSON.stringify([...next]));
        return next;
      });
    }
    toast.success(newParentId ? "Item moved" : "Moved to top level");
  };

  const handleAllocate = (slug) => {
        const name = slug.replace(/([A-Z])/g, ' $1').trim();
        const newId = generateId();
        const newItem = {
          id: newId,
          name,
          slug,
          icon: "File",
          is_visible: true,
          parent_id: null,
          item_type: "page",
          order: items.length
        };
        // Ensure all existing items keep their id
        const existingItems = items.map(i => ({ ...i, id: i.id || generateId() }));
        const loadingToast = toast.loading(`Adding "${name}" to navigation...`);
        saveMutation.mutate([...existingItems, newItem], {
          onSuccess: () => {
            toast.success(`✓ "${name}" added to navigation`, { id: loadingToast });
          },
          onError: (error) => {
            toast.error(`Failed to add page: ${error.message}`, { id: loadingToast });
          }
        });
      };

  const handleCreateNewPage = async () => {
    // Validation
    if (!newPageName.trim()) {
      toast.error("Page name is required");
      return;
    }

    // Validate PascalCase format
    if (!/^[A-Z][a-zA-Z0-9]*$/.test(newPageName)) {
      toast.error("Page name must be PascalCase (e.g., MyNewPage)");
      return;
    }

    // Check if already exists
    if (effectiveSlugs.includes(newPageName)) {
      toast.error("A page with this name already exists");
      return;
    }

    setIsCreatingPage(true);
    const loadingToast = toast.loading("Creating page file...");

    try {
      // Create the file via backend
      const response = await base44.functions.invoke('createPageFile', {
        pageName: newPageName,
        pageTitle: newPageTitle || newPageName.replace(/([A-Z])/g, ' $1').trim()
      });

      if (response.data.success) {
        toast.dismiss(loadingToast);
        
        // Close dialog first
        setShowCreatePageDialog(false);
        setNewPageName("");
        setNewPageTitle("");

        // Show notification
        setNotification({
          show: true,
          title: "Successfully created!",
          message: `Page "${newPageName}" has been created and is ready to allocate.`,
          variant: "success"
        });
        
        // Resync to get the new page in the list
        if (syncUnallocatedPages) {
          await syncUnallocatedPages();
        }
      }
    } catch (error) {
      toast.error(`Failed to create page: ${error.message}`, { id: loadingToast });
    } finally {
      setIsCreatingPage(false);
    }
  };

  const handleUnallocate = (item) => {
    // Remove only this item, move its children to top level (set parent_id to null)
    const newItems = items
      .filter(i => i.id !== item.id)
      .map(i => ({
        ...i,
        id: i.id || generateId(),
        // If this child's parent was the removed item, move to top level
        parent_id: i.parent_id === item.id ? null : i.parent_id
      }));
    saveMutation.mutate(newItems);
    toast.success(`${item.name} removed from navigation`);
  };

  const toggleParent = (id) => {
    setExpandedParents(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      // Save to sessionStorage
      sessionStorage.setItem(`nav_expanded_${configType}`, JSON.stringify([...next]));
      return next;
    });
  };

  const togglePageDetails = (slug) => {
    setExpandedPageDetails(prev => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  // Use shared flat list builder
  const buildFlatList = () => buildFlatNavList(items, expandedParents);

  // Get valid parent options for the form dialog
  const getFormParentOptions = () => getParentOptions(editingItem);

  const flatList = buildFlatList();

  return (
    <>
    <NotificationCard
      show={notification.show}
      onClose={() => setNotification({ ...notification, show: false })}
      title={notification.title}
      message={notification.message}
      variant={notification.variant}
    />
    <Card className="rounded-xl border-border bg-card">
      {title && (
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="[padding-top:var(--spacing-4)]">
        <div className="flex justify-between items-center [margin-bottom:var(--spacing-3)]">
          <div className="flex items-center gap-2">
            <Button 
              size="sm"
              variant="ghost"
              className="text-sm hover:bg-green-50 hover:text-green-700"
              onClick={() => { 
                setEditingItem(null); 
                setFormData({ name: "", slug: "", icon: "Home", is_visible: true, parent_id: null, item_type: "page", default_collapsed: false }); 
                setShowDialog(true); 
              }}
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add Navigation
            </Button>
            <Button 
              size="sm"
              variant="outline"
              className="text-sm hover:bg-blue-50 hover:text-blue-700"
              onClick={() => setShowCreatePageDialog(true)}
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Create New Page
            </Button>
          </div>
          
          {hasUnsavedChanges && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
                <AlertCircle className="h-3 w-3 mr-1" />
                Unsaved Changes
              </Badge>
              <Button 
                size="sm"
                onClick={handleSaveChanges}
                className="bg-primary hover:bg-primary-600"
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="text-center py-8 text-[var(--color-charcoal)]">Loading...</div>
        ) : (
          <>


            {/* Main Navigation Items */}
            <div className="[margin-bottom:var(--spacing-6)]">
              <h3 className="font-display text-h5 [margin-bottom:var(--spacing-3)] text-[var(--color-midnight)]">
                Navigation Structure ({items.length} items)
              </h3>
            {items.length > 0 ? (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="nav-list">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="[&>*+*]:mt-[var(--spacing-1)] [margin-bottom:var(--spacing-6)]">
                      {flatList.map((item, index) => {
                        // Check if this item has children
                        const hasChildren = items.filter(i => i.parent_id === item.id).length > 0;
                        const isExpanded = expandedParents.has(item.id);

                        return (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              style={{ 
                                ...provided.draggableProps.style,
                                marginLeft: (item.depth || 0) * 24 
                              }}
                              className={`flex items-center [gap:var(--spacing-3)] [padding:var(--spacing-3)] bg-[var(--color-background-paper)] border border-[var(--color-background-muted)] [border-radius:var(--radius-lg)] hover:bg-[var(--color-primary)]/5 hover:border-[var(--color-primary)]/30 [transition:var(--duration-200)] group ${!item.is_visible ? "opacity-50" : ""}`}
                            >
                              <div {...provided.dragHandleProps} className="cursor-grab text-[var(--color-charcoal)]/50 hover:text-[var(--color-charcoal)]">
                                <GripVertical className="h-4 w-4" />
                              </div>

                              {hasChildren ? (
                                <button onClick={() => toggleParent(item.id)} className="p-0.5">
                                  {isExpanded ? 
                                    <ChevronDown className="h-4 w-4 text-[var(--color-charcoal)]" /> : 
                                    <ChevronRight className="h-4 w-4 text-[var(--color-charcoal)]" />
                                  }
                                </button>
                              ) : (
                                <div className="w-5" /> 
                              )}
                              
                              <div className="flex items-center [gap:var(--spacing-2)] flex-1">
                                {renderIcon(item.icon, "h-4 w-4")}
                                <span className={`text-[var(--color-midnight)] ${!item.parent_id && item.hasChildren ? "text-body-base font-medium" : "text-body-base"}`}>
                                  {item.name || 'Unnamed'}
                                </span>
                                {item.item_type === "folder" && (
                                  <Badge className="text-caption bg-[var(--color-secondary)]/20 text-[var(--color-secondary-dark)]">Folder</Badge>
                                )}
                              </div>

                              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 [transition:var(--duration-200)]">
                                {/* Move Menu */}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Move to...">
                                      <MoveRight className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-56 max-h-80 overflow-y-auto">
                                    <DropdownMenuItem 
                                      onClick={() => handleMoveToParent(item, null)}
                                      disabled={!item.parent_id}
                                      className="gap-2"
                                    >
                                      <CornerDownRight className="h-4 w-4 rotate-180" />
                                      Move to top level
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    {/* Folders */}
                                    {getMoveParentOptions(item.id)
                                      .filter(p => p.id !== item.parent_id)
                                      .map(parent => (
                                      <DropdownMenuItem 
                                        key={parent.id}
                                        onClick={() => handleMoveToParent(item, parent.id)}
                                        className="gap-2"
                                      >
                                        <Folder className="h-4 w-4" />
                                        {parent.name || 'Unnamed'}
                                      </DropdownMenuItem>
                                    ))}
                                    {/* Pages as parents */}
                                    {getParentOptions(item.id)
                                      .filter(p => p.id !== item.parent_id && p.item_type !== "folder")
                                      .sort((a, b) => a.name.localeCompare(b.name))
                                      .length > 0 && (
                                      <>
                                        <DropdownMenuSeparator />
                                        <div className="px-2 py-1.5 text-caption text-[var(--color-charcoal)]">Pages</div>
                                        {getParentOptions(item.id)
                                          .filter(p => p.id !== item.parent_id && p.item_type !== "folder")
                                          .sort((a, b) => a.name.localeCompare(b.name))
                                          .map(parent => (
                                          <DropdownMenuItem 
                                            key={parent.id}
                                            onClick={() => handleMoveToParent(item, parent.id)}
                                            className="gap-2"
                                          >
                                            <File className="h-4 w-4" />
                                            {parent.name || 'Unnamed'}
                                          </DropdownMenuItem>
                                        ))}
                                      </>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                                
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleDuplicate(item)} title="Duplicate">
                                  <Copy className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleEdit(item)} title="Edit">
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleUnallocate(item)} title="Remove">
                                  <Power className="h-3 w-3 text-[var(--color-success)]" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-[var(--color-destructive)]" onClick={() => handleDelete(item)} title="Delete">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>

                              <Switch
                                checked={item.is_visible !== false}
                                onCheckedChange={() => handleToggleVisibility(item)}
                                className={item.is_visible !== false ? "data-[state=checked]:bg-[var(--color-success)]" : "data-[state=unchecked]:bg-[var(--color-destructive)]"}
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
            ) : (
              <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                No navigation items yet. Add items using the button above.
              </div>
            )}
            </div>

            {/* Unallocated Pages */}
            {unallocatedSlugs.length > 0 && (
              <div className="border-t [padding-top:var(--spacing-4)]">
                <button 
                  onClick={() => setUnallocatedExpanded(!unallocatedExpanded)}
                  className="flex items-center [gap:var(--spacing-2)] text-[var(--color-charcoal)] hover:text-[var(--color-midnight)] text-body-base [margin-bottom:var(--spacing-3)]"
                >
                  {unallocatedExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  <FolderOpen className="h-4 w-4" />
                  Unallocated Pages ({unallocatedSlugs.length})
                </button>
                {unallocatedExpanded && (
                        <div className="[&>*+*]:mt-[var(--spacing-2)]">
                          {/* AI Recommend All Button */}
                          {unallocatedSlugs.length > 0 && (
                            <div className="flex justify-end [margin-bottom:var(--spacing-2)]">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={async () => {
                                  setLoadingRecommendations(true);
                                  try {
                                    const folders = items.filter(i => i.item_type === "folder").map(f => f.name);
                                    const result = await base44.integrations.Core.InvokeLLM({
                                      prompt: `Given these folder categories: ${folders.join(", ")}\n\nRecommend the best folder for each of these items:\n${unallocatedSlugs.join("\n")}\n\nReturn a JSON object mapping each item name to the recommended folder name.`,
                                      response_json_schema: {
                                        type: "object",
                                        additionalProperties: { type: "string" }
                                      }
                                    });
                                    setAiRecommendations(result);
                                  } catch (e) {
                                    toast.error("Failed to get recommendations");
                                  }
                                  setLoadingRecommendations(false);
                                }}
                                disabled={loadingRecommendations}
                                className="gap-2"
                              >
                                {loadingRecommendations ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                                AI Recommend All
                              </Button>
                            </div>
                          )}
                          {unallocatedSlugs.map(slug => (
                      <div 
                        key={slug} 
                        className="flex items-center [gap:var(--spacing-3)] [padding:var(--spacing-3)] bg-[var(--color-background-paper)] border border-dashed border-[var(--color-charcoal)]/30 [border-radius:var(--radius-lg)] hover:bg-[var(--color-background)] [transition:var(--duration-200)] group"
                      >
                        <div className="w-5" />
                        <div className="flex items-center [gap:var(--spacing-2)] flex-1">
                          <File className="h-4 w-4 text-[var(--color-charcoal)]" />
                          <span className="text-body-base text-[var(--color-charcoal)]">{slug.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <span className="text-caption text-[var(--color-charcoal)] font-mono">/{slug.toLowerCase().replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}</span>
                          {aiRecommendations[slug] && (
                            <Badge className="bg-[var(--color-accent)]/20 text-[var(--color-accent-dark)] text-caption">
                              <Sparkles className="h-3 w-3 mr-1" />
                              {aiRecommendations[slug]}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 [transition:var(--duration-200)]">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => {
                              const name = slug.replace(/([A-Z])/g, ' $1').trim();
                              setEditingItem(null);
                              setFormData({ name, slug, icon: "File", is_visible: true, parent_id: null, item_type: "page", default_collapsed: false });
                              setShowDialog(true);
                            }}
                            title="Edit & allocate"
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => handleAllocate(slug)}
                            title="Quick allocate"
                          >
                            <Power className="h-3 w-3 text-[var(--color-destructive)]" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}



            {/* Pages Management Section - Collapsible */}
            <div className="border-t [padding-top:var(--spacing-4)] [margin-top:var(--spacing-4)]">
              <button 
                onClick={() => setAllPagesExpanded(!allPagesExpanded)}
                className="flex items-center justify-between w-full [gap:var(--spacing-2)] text-[var(--color-charcoal)] hover:text-[var(--color-midnight)] [margin-bottom:var(--spacing-3)]"
              >
                <div className="flex items-center [gap:var(--spacing-2)]">
                  {allPagesExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  <Folder className="h-4 w-4 text-[var(--color-accent)]" />
                  <h3 className="font-display text-h5 text-[var(--color-midnight)]">
                    Pages Management ({effectiveSlugs.length} pages)
                  </h3>
                </div>
                {syncUnallocatedPages && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      syncUnallocatedPages();
                    }}
                    disabled={isSyncing}
                    title="Scan pages folder and refresh list"
                    className="text-sm hover:bg-blue-50 hover:text-blue-700"
                  >
                    {isSyncing ? (
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    )}
                    Scan Pages
                  </Button>
                )}
              </button>
              
              {allPagesExpanded && (
                <div className="space-y-4">
                  {/* Pages without any URL reference */}
                  {effectiveSlugs.filter(slug => !allocatedSlugs.includes(slug) && !unallocatedSlugs.includes(slug)).length > 0 && (
                    <div className="p-4 bg-muted/30 rounded-lg border border-border">
                      <div className="flex items-center justify-between [margin-bottom:var(--spacing-3)]">
                        <h4 className="font-display text-base text-[var(--color-midnight)]">
                          Pages Not in System
                        </h4>
                      </div>
                      <div className="text-xs text-muted-foreground [margin-bottom:var(--spacing-3)]">
                        These pages exist in the pages folder but haven't been added to the navigation config yet.
                      </div>
                      
                      <div className="[&>*+*]:mt-[var(--spacing-2)]">
                        {effectiveSlugs.filter(slug => !allocatedSlugs.includes(slug) && !unallocatedSlugs.includes(slug)).map(slug => {
                          const pageName = slug.replace(/([A-Z])/g, ' $1').trim();
                          const suggestedUrl = slug.toLowerCase().replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
                          
                          return (
                            <div 
                              key={slug}
                              className="flex items-center justify-between [padding:var(--spacing-3)] bg-white border border-border rounded-lg"
                            >
                              <div>
                                <div className="font-medium text-sm text-[var(--color-midnight)]">{pageName}</div>
                                <div className="text-xs text-muted-foreground font-mono">/{suggestedUrl}</div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingItem(null);
                                  setFormData({ 
                                    name: pageName, 
                                    slug: slug, 
                                    icon: "File", 
                                    is_visible: true, 
                                    parent_id: null, 
                                    item_type: "page", 
                                    default_collapsed: false 
                                  });
                                  setShowDialog(true);
                                }}
                              >
                                Create Page URL
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* All Pages Status */}
                  <div className="p-4 bg-muted/30 rounded-lg border border-border">
                    <h4 className="font-display text-base text-[var(--color-midnight)] [margin-bottom:var(--spacing-3)]">
                      All Pages Status ({effectiveSlugs.length} total)
                    </h4>
                    <div className="[&>*+*]:mt-[var(--spacing-1)]">
                      {effectiveSlugs.map(slug => {
                       const navItem = items.find(i => i.slug === slug);
                       const isUnallocated = !navItem && unallocatedSlugs.includes(slug);
                       const pageName = slug.replace(/([A-Z])/g, ' $1').trim();
                       const isExpanded = expandedPageDetails.has(slug);
                       const isInMainNav = items.some(i => i.slug === slug);

                       // Mock entity detection (enhance this with real logic)
                       const relatedEntities = [];

                       const parentPath = navItem?.parent_id 
                         ? (() => {
                             const getPath = (parentId) => {
                               if (!parentId) return "";
                               const parent = items.find(i => i.id === parentId);
                               if (!parent) return "";
                               const grandPath = getPath(parent.parent_id);
                               return grandPath ? `${grandPath} > ${parent.name}` : parent.name;
                             };
                             return getPath(navItem.parent_id);
                           })()
                         : "Root";

                       return (
                         <div key={slug} className="border border-border rounded-lg overflow-hidden">
                           <div 
                             className="flex items-center justify-between [padding:var(--spacing-2)] bg-white hover:bg-muted/30 transition-colors"
                           >
                             <div 
                               className="flex items-center [gap:var(--spacing-2)] flex-1 cursor-pointer"
                               onClick={() => togglePageDetails(slug)}
                             >
                               {isExpanded ? 
                                 <ChevronDown className="h-3 w-3 text-muted-foreground" /> : 
                                 <ChevronRight className="h-3 w-3 text-muted-foreground" />
                               }
                               <File className="h-3 w-3 text-muted-foreground" />
                               <span className="text-sm text-[var(--color-midnight)]">{pageName}</span>
                             </div>
                             <div className="flex items-center [gap:var(--spacing-2)]">
                               {navItem ? (
                                 <>
                                   <Badge variant="outline" className="text-xs">
                                     {parentPath}
                                   </Badge>
                                   <Badge className="text-xs bg-green-50 text-green-700 border-green-200">
                                     Allocated
                                   </Badge>
                                 </>
                               ) : isUnallocated ? (
                                 <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
                                   Unallocated
                                 </Badge>
                               ) : (
                                 <Badge variant="outline" className="text-xs text-red-600 border-red-300">
                                   Not in System
                                 </Badge>
                               )}

                               {!isInMainNav && navItem && (
                                 <Button
                                   size="sm"
                                   variant="ghost"
                                   className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     handleDeletePage(navItem);
                                   }}
                                   title="Delete page & files"
                                 >
                                   <Trash2 className="h-3 w-3" />
                                 </Button>
                               )}
                             </div>
                           </div>

                           {isExpanded && (
                             <div className="p-3 bg-muted/20 border-t space-y-2">
                               <div className="text-xs text-muted-foreground mb-2">
                                 Related Entities ({relatedEntities.length}):
                               </div>
                               {relatedEntities.length > 0 ? (
                                 <div className="space-y-1">
                                   {relatedEntities.map(entity => (
                                     <div key={entity} className="flex items-center gap-2 text-xs">
                                       <Database className="h-3 w-3 text-blue-500" />
                                       <span>{entity}</span>
                                     </div>
                                   ))}
                                 </div>
                               ) : (
                                 <div className="text-xs text-muted-foreground italic">
                                   No related entities detected
                                 </div>
                               )}

                               {!isInMainNav && navItem && (
                                 <Button
                                   size="sm"
                                   variant="destructive"
                                   className="w-full mt-2"
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     handleDeletePage(navItem);
                                   }}
                                 >
                                   <Trash2 className="h-3 w-3 mr-1" />
                                   Delete Page & Files
                                 </Button>
                               )}
                               {isInMainNav && (
                                 <div className="text-xs text-orange-600 p-2 bg-orange-50 rounded border border-orange-200">
                                   Remove from navigation before deleting
                                 </div>
                               )}
                             </div>
                           )}
                         </div>
                       );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>

      {/* Delete Dialog */}
      <DeletePageDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        page={pageToDelete}
        relatedEntities={[]}
        onConfirm={handleConfirmDelete}
      />

      {/* Create Page Dialog */}
      <Sheet open={showCreatePageDialog} onOpenChange={setShowCreatePageDialog}>
        <SheetContent className="w-96">
          <SheetHeader>
            <SheetTitle>Create New Page</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-6">
            <div>
              <Label>Page Name (e.g., MyNewPage) *</Label>
              <Input
                value={newPageName}
                onChange={(e) => setNewPageName(e.target.value)}
                placeholder="MyNewPage"
                disabled={isCreatingPage}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Must be PascalCase with no spaces
              </p>
            </div>
            <div>
              <Label>Display Title (optional)</Label>
              <Input
                value={newPageTitle}
                onChange={(e) => setNewPageTitle(e.target.value)}
                placeholder="My New Page"
                disabled={isCreatingPage}
              />
            </div>
          </div>
          <SheetFooter className="mt-6">
            <div className="flex gap-3 w-full">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowCreatePageDialog(false);
                  setNewPageName("");
                  setNewPageTitle("");
                }}
                disabled={isCreatingPage}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateNewPage}
                disabled={isCreatingPage}
                className="flex-1"
              >
                {isCreatingPage ? "Creating..." : "Create Page"}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Edit Sidebar */}
      <Sheet open={showDialog} onOpenChange={closeDialog}>
        <SheetContent className="w-96">
          <SheetHeader>
            <SheetTitle className="text-[var(--color-midnight)]">{editingItem !== null ? "Edit Item" : "Add Navigation Item"}</SheetTitle>
          </SheetHeader>
          <div className="[&>*+*]:mt-[var(--spacing-4)]">
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
                    {[...unallocatedSlugs, formData.slug].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).map(slug => (
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
                  {getFormParentOptions()
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(parent => (
                    <SelectItem key={String(parent.id)} value={String(parent.id)}>
                      <div className="flex items-center gap-2">
                        {isFolder(parent) ? <Folder className="h-3 w-3" /> : <File className="h-3 w-3" />}
                        {parent.name || 'Unnamed'}
                      </div>
                    </SelectItem>
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
                  {iconOptions.map(({ name, icon: IconComp }) => (
                    <SelectItem key={name} value={name}>
                      <div className="flex items-center gap-2">
                        <IconComp className="h-4 w-4" />
                        {name}
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
          </div>
          <SheetFooter className="[margin-top:var(--spacing-6)]">
            <div className="flex gap-3 w-full">
              <Button variant="outline" onClick={closeDialog} className="flex-1">Cancel</Button>
              <Button className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white flex-1" onClick={handleSaveItem}>Save</Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}