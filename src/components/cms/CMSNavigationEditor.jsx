import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Plus, Trash2, GripVertical, Folder, FileText, Link as LinkIcon, 
  ChevronRight, ChevronDown, Eye, EyeOff, Loader2, Save, Layout
} from "lucide-react";
import { toast } from "sonner";

const itemTypes = [
  { value: "page", label: "Page", icon: FileText },
  { value: "folder", label: "Folder", icon: Folder },
  { value: "link", label: "External Link", icon: LinkIcon },
  { value: "product_category", label: "Product Category", icon: FileText },
  { value: "blog_category", label: "Blog Category", icon: FileText },
  { value: "view_page", label: "View Page", icon: Layout },
];

export default function CMSNavigationEditor({ tenantId }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("cms");
  const [selectedNav, setSelectedNav] = useState(null);
  const [showAddNav, setShowAddNav] = useState(false);
  const [newNavName, setNewNavName] = useState("");
  const [newNavType, setNewNavType] = useState("cms");
  const [expandedItems, setExpandedItems] = useState({});
  const [editingItem, setEditingItem] = useState(null);

  const { data: navigations = [], isLoading } = useQuery({
    queryKey: ["cmsNavigations", tenantId],
    queryFn: () => base44.entities.CMSNavigation.filter(tenantId ? { tenant_id: tenantId } : {})
  });

  const { data: pages = [] } = useQuery({
    queryKey: ["cmsPages", tenantId],
    queryFn: () => base44.entities.CMSPage.filter(tenantId ? { tenant_id: tenantId } : {})
  });

  const { data: pageTemplates = [] } = useQuery({
    queryKey: ["pageTemplates"],
    queryFn: () => base44.entities.PageTemplate.list()
  });

  // Filter navigations by type
  const cmsNavigations = navigations.filter(n => n.nav_type !== "view_pages");
  const viewPagesNavigations = navigations.filter(n => n.nav_type === "view_pages");

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CMSNavigation.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cmsNavigations"] });
      toast.success("Navigation created");
      setShowAddNav(false);
      setNewNavName("");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CMSNavigation.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cmsNavigations"] });
      toast.success("Navigation updated");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CMSNavigation.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cmsNavigations"] });
      setSelectedNav(null);
      toast.success("Navigation deleted");
    }
  });

  const generateId = () => crypto.randomUUID().split('-')[0];

  const addItem = (parentId = null) => {
    if (!selectedNav) return;
    const newItem = {
      id: generateId(),
      label: "New Item",
      type: "page",
      is_visible: true,
      children: [],
      order: 0
    };

    let updatedItems = [...(selectedNav.items || [])];
    if (parentId) {
      const addToParent = (items) => {
        return items.map(item => {
          if (item.id === parentId) {
            return { ...item, children: [...(item.children || []), newItem] };
          }
          if (item.children?.length) {
            return { ...item, children: addToParent(item.children) };
          }
          return item;
        });
      };
      updatedItems = addToParent(updatedItems);
    } else {
      updatedItems.push(newItem);
    }

    updateMutation.mutate({ id: selectedNav.id, data: { items: updatedItems } });
    setEditingItem(newItem);
  };

  const updateItem = (itemId, updates) => {
    if (!selectedNav) return;
    
    const updateInTree = (items) => {
      return items.map(item => {
        if (item.id === itemId) {
          return { ...item, ...updates };
        }
        if (item.children?.length) {
          return { ...item, children: updateInTree(item.children) };
        }
        return item;
      });
    };

    const updatedItems = updateInTree(selectedNav.items || []);
    updateMutation.mutate({ id: selectedNav.id, data: { items: updatedItems } });
  };

  const deleteItem = (itemId) => {
    if (!selectedNav) return;
    
    const removeFromTree = (items) => {
      return items.filter(item => item.id !== itemId).map(item => {
        if (item.children?.length) {
          return { ...item, children: removeFromTree(item.children) };
        }
        return item;
      });
    };

    const updatedItems = removeFromTree(selectedNav.items || []);
    updateMutation.mutate({ id: selectedNav.id, data: { items: updatedItems } });
  };

  const toggleExpand = (itemId) => {
    setExpandedItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const renderItem = (item, depth = 0) => {
    const TypeIcon = itemTypes.find(t => t.value === item.type)?.icon || FileText;
    const hasChildren = item.children?.length > 0;
    const isExpanded = expandedItems[item.id];
    const isFolder = item.type === "folder";

    return (
      <div key={item.id}>
        <div 
          className={`flex items-center gap-2 p-2 rounded hover:bg-[var(--color-background)] ${
            editingItem?.id === item.id ? "bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30" : ""
          }`}
          style={{ paddingLeft: `${depth * 24 + 8}px` }}
        >
          <GripVertical className="h-4 w-4 text-[var(--color-charcoal)] cursor-grab" />
          
          {(hasChildren || isFolder) && (
            <button onClick={() => toggleExpand(item.id)} className="p-0.5">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-[var(--color-charcoal)]" />
              ) : (
                <ChevronRight className="h-4 w-4 text-[var(--color-charcoal)]" />
              )}
            </button>
          )}
          {!hasChildren && !isFolder && <div className="w-5" />}
          
          <TypeIcon className={`h-4 w-4 ${
            item.type === "folder" ? "text-[var(--color-secondary)]" : 
            item.type === "link" ? "text-[var(--color-info)]" : "text-[var(--color-charcoal)]"
          }`} />
          
          <span className="flex-1 text-sm font-medium text-[var(--color-midnight)]">{item.label}</span>
          
          {!item.is_visible && <EyeOff className="h-3 w-3 text-[var(--color-charcoal)]" />}
          
          <Badge variant="outline" className="text-xs">{item.type}</Badge>
          
          {isFolder && (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => addItem(item.id)}>
              <Plus className="h-3 w-3" />
            </Button>
          )}
          
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditingItem(item)}>
            <FileText className="h-3 w-3" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-[var(--color-destructive)]"
            onClick={() => deleteItem(item.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
        
        {isExpanded && hasChildren && (
          <div>
            {item.children.map(child => renderItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const displayedNavigations = activeTab === "cms" ? cmsNavigations : viewPagesNavigations;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Navigation Trees</CardTitle>
        <Button onClick={() => setShowAddNav(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Navigation
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList>
            <TabsTrigger value="cms" className="gap-2">
              <FileText className="h-4 w-4" />
              CMS Pages
            </TabsTrigger>
            <TabsTrigger value="view_pages" className="gap-2">
              <Layout className="h-4 w-4" />
              View Pages
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-3 gap-6">
          {/* Navigation List */}
          <div className="space-y-2">
            <Label>Select Navigation</Label>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : displayedNavigations.length === 0 ? (
              <p className="text-sm text-[var(--color-charcoal)]">No {activeTab === "view_pages" ? "view page" : "CMS"} navigations yet</p>
            ) : (
              <div className="space-y-1">
                {displayedNavigations.map(nav => (
                  <div 
                    key={nav.id}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                      selectedNav?.id === nav.id ? "bg-[var(--color-primary)]/10" : "hover:bg-[var(--color-background)]"
                    }`}
                    onClick={() => setSelectedNav(nav)}
                  >
                    <span className="font-medium text-[var(--color-midnight)]">{nav.name}</span>
                    <Badge variant="outline">{nav.items?.length || 0} items</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tree Editor */}
          <div className="col-span-2">
            {selectedNav ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-[var(--color-midnight)]">{selectedNav.name}</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => addItem()}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Item
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-[var(--color-destructive)]"
                      onClick={() => {
                        if (confirm("Delete this navigation?")) {
                          deleteMutation.mutate(selectedNav.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="border border-[var(--color-background-muted)] rounded-lg max-h-96 overflow-auto">
                  {selectedNav.items?.length > 0 ? (
                    selectedNav.items.map(item => renderItem(item))
                  ) : (
                    <p className="text-center text-[var(--color-charcoal)] py-8">No items. Click "Add Item" to start.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-[var(--color-charcoal)]">
                Select a navigation to edit
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {/* Create Navigation Dialog */}
      <Dialog open={showAddNav} onOpenChange={setShowAddNav}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[var(--color-midnight)]">Create Navigation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={newNavName}
                onChange={(e) => setNewNavName(e.target.value)}
                placeholder="e.g., Main Menu"
              />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={newNavType} onValueChange={setNewNavType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cms">CMS Pages Navigation</SelectItem>
                  <SelectItem value="view_pages">View Pages Navigation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddNav(false)}>Cancel</Button>
              <Button 
                onClick={() => {
                  createMutation.mutate({ 
                    tenant_id: tenantId, 
                    name: newNavName, 
                    nav_type: newNavType,
                    items: [] 
                  });
                  setNewNavType("cms");
                }}
                disabled={!newNavName.trim()}
                className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white"
              >
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(o) => !o && setEditingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[var(--color-midnight)]">Edit Navigation Item</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4">
              <div>
                <Label>Label</Label>
                <Input
                  value={editingItem.label}
                  onChange={(e) => setEditingItem({ ...editingItem, label: e.target.value })}
                />
              </div>
              <div>
                <Label>Type</Label>
                <Select 
                  value={editingItem.type} 
                  onValueChange={(v) => setEditingItem({ ...editingItem, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {itemTypes.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {editingItem.type === "page" && (
                <div>
                  <Label>CMS Page</Label>
                  <Select 
                    value={editingItem.page_slug || ""} 
                    onValueChange={(v) => setEditingItem({ ...editingItem, page_slug: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select page..." />
                    </SelectTrigger>
                    <SelectContent>
                      {pages.map(p => (
                        <SelectItem key={p.id} value={p.slug}>{p.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {editingItem.type === "view_page" && (
                <div>
                  <Label>View Page</Label>
                  <Select 
                    value={editingItem.view_page_name || ""} 
                    onValueChange={(v) => setEditingItem({ ...editingItem, view_page_name: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select view page..." />
                    </SelectTrigger>
                    <SelectContent>
                      {pageTemplates.map(p => (
                        <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {editingItem.type === "link" && (
                <div>
                  <Label>URL</Label>
                  <Input
                    value={editingItem.url || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              )}
              <div className="flex items-center gap-2">
                <Switch
                  checked={editingItem.is_visible !== false}
                  onCheckedChange={(v) => setEditingItem({ ...editingItem, is_visible: v })}
                />
                <Label>Visible</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingItem(null)}>Cancel</Button>
                <Button onClick={() => {
                  updateItem(editingItem.id, editingItem);
                  setEditingItem(null);
                }} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white">
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}