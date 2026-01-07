import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  Search, Plus, Trash2, Lock, Unlock, Edit, ChevronDown, ChevronRight,
  File, Folder, Component, Database, Code, AlertTriangle, Check, X,
  RefreshCw, Shield, Link2, ExternalLink, Filter
} from "lucide-react";
import { toast } from "sonner";

// System pages that cannot be deleted
const SYSTEM_PAGES = [
  "Dashboard", "Home", "Setup", "TenantAccess", "NavigationManager", 
  "SiteSettings", "TenantManager", "ClientOnboardingPortal"
];

// Page categories for organization
const PAGE_CATEGORIES = [
  { value: "core", label: "Core/System" },
  { value: "crm", label: "CRM" },
  { value: "design", label: "Design System" },
  { value: "showcase", label: "Showcases" },
  { value: "settings", label: "Settings" },
  { value: "dev", label: "Development" },
  { value: "cms", label: "CMS/Content" },
  { value: "website", label: "Website Templates" },
  { value: "project", label: "Projects & Tasks" },
  { value: "monitoring", label: "Monitoring" },
  { value: "onboarding", label: "Onboarding" },
  { value: "other", label: "Other" }
];

// Auto-categorize based on slug prefix
const autoCategorize = (slug) => {
  if (SYSTEM_PAGES.includes(slug)) return "core";
  if (slug.startsWith("CRM")) return "crm";
  if (slug.startsWith("Tailwind") || slug.includes("Showcase")) return "showcase";
  if (slug.includes("Design") || slug.includes("Theme") || slug.includes("Token")) return "design";
  if (slug.includes("Setting") || slug.includes("Manager") && !slug.includes("CMS")) return "settings";
  if (slug.includes("Dev") || slug.includes("Debug") || slug.includes("Test")) return "dev";
  if (slug.includes("CMS") || slug.includes("Asset") || slug.includes("Website")) return "cms";
  if (slug.includes("Home") || slug.includes("Login") || slug.includes("Register")) return "website";
  if (slug.includes("Project") || slug.includes("Task") || slug.includes("Team")) return "project";
  if (slug.includes("Monitor") || slug.includes("Security") || slug.includes("Performance")) return "monitoring";
  if (slug.includes("Onboarding")) return "onboarding";
  return "other";
};

export default function PageRegistryManager() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("active");
  const [showUnallocatedOnly, setShowUnallocatedOnly] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(new Set(["core", "crm"]));

  // Fetch page registry
  const { data: pages = [], isLoading } = useQuery({
    queryKey: ["pageRegistry"],
    queryFn: () => base44.entities.PageRegistry.list(),
  });

  // Fetch GLOBAL ADMIN navigation config for allocation status
  const { data: navConfigs = [] } = useQuery({
    queryKey: ["navConfig", "admin_console"],
    queryFn: () => base44.entities.NavigationConfig.filter({ config_type: "admin_console" }),
  });

  const adminNavConfig = navConfigs[0];
  
  // CRITICAL: Only admin_console items determine allocation - NOT app_pages_source
  const allocatedSlugs = adminNavConfig?.items?.map(i => i.slug).filter(Boolean) || [];
  
  // Source slugs should come from scanPages, not from nav config
  const sourceSlugs = adminNavConfig?.source_slugs || [];

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (pageData) => {
      if (pageData.id) {
        return base44.entities.PageRegistry.update(pageData.id, pageData);
      }
      return base44.entities.PageRegistry.create(pageData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pageRegistry"] });
      toast.success("Page saved");
      setEditingPage(null);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (page) => {
      // Soft delete - mark as deleted
      return base44.entities.PageRegistry.update(page.id, { 
        status: "deleted",
        deleted_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pageRegistry"] });
      toast.success("Page marked as deleted");
      setDeleteConfirm(null);
    },
  });

  // Sync pages from scanPages function to registry
  const handleSyncPages = async () => {
    const loadingToast = toast.loading("Scanning pages...");
    
    try {
      // Call scanPages function to get actual pages from filesystem
      const scanResult = await base44.functions.invoke('scanPages', {});
      const scannedPages = scanResult.data?.pages || [];
      
      if (scannedPages.length === 0) {
        toast.info("No pages found", { id: loadingToast });
        return;
      }
      
      // Exclude deleted pages from being re-added
      const deletedSlugs = pages.filter(p => p.status === 'deleted').map(p => p.slug);
      const existingSlugs = pages.map(p => p.slug);
      const newSlugs = scannedPages.filter(s => !existingSlugs.includes(s) && !deletedSlugs.includes(s));
      
      if (newSlugs.length === 0) {
        toast.info("All pages are already registered", { id: loadingToast });
        return;
      }
      
      // Update allocation status for all pages
      const newPages = newSlugs.map(slug => ({
        slug,
        display_name: slug.replace(/([A-Z])/g, ' $1').trim(),
        status: "active",
        is_system_page: SYSTEM_PAGES.includes(slug),
        is_allocated: allocatedSlugs.includes(slug),
        category: autoCategorize(slug),
        related_components: [],
        related_entities: [],
        related_functions: [],
      }));
      
      // Update existing pages allocation status
      for (const page of pages) {
        const isNowAllocated = allocatedSlugs.includes(page.slug);
        if (page.is_allocated !== isNowAllocated) {
          await base44.entities.PageRegistry.update(page.id, { is_allocated: isNowAllocated });
        }
      }
      
      await base44.entities.PageRegistry.bulkCreate(newPages);
      queryClient.invalidateQueries({ queryKey: ["pageRegistry"] });
      toast.success(`Registered ${newSlugs.length} new pages`, { id: loadingToast });
    } catch (error) {
      toast.error(`Failed: ${error.message}`, { id: loadingToast });
    }
  };

  // Toggle system page protection
  const toggleSystemPage = async (page) => {
    if (SYSTEM_PAGES.includes(page.slug)) {
      toast.error("Core system pages cannot be unprotected");
      return;
    }
    await saveMutation.mutateAsync({
      ...page,
      is_system_page: !page.is_system_page
    });
  };

  // Group pages by category
  const groupedPages = useMemo(() => {
    let filtered = pages.filter(p => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
      if (showUnallocatedOnly && allocatedSlugs.includes(p.slug)) return false;
      if (search) {
        const term = search.toLowerCase();
        return p.slug.toLowerCase().includes(term) || 
               p.display_name?.toLowerCase().includes(term);
      }
      return true;
    });

    // Group by category
    const groups = {};
    PAGE_CATEGORIES.forEach(cat => {
      groups[cat.value] = filtered.filter(p => p.category === cat.value);
    });
    return groups;
  }, [pages, search, categoryFilter, statusFilter, showUnallocatedOnly, allocatedSlugs]);

  const toggleCategory = (cat) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const totalPages = pages.filter(p => p.status === "active").length;
  const allocatedCount = pages.filter(p => allocatedSlugs.includes(p.slug) && p.status === "active").length;
  const systemCount = pages.filter(p => p.is_system_page).length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{totalPages}</div>
            <div className="text-sm text-muted-foreground">Total Pages</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{allocatedCount}</div>
            <div className="text-sm text-muted-foreground">In Navigation</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-orange-600">{totalPages - allocatedCount}</div>
            <div className="text-sm text-muted-foreground">Unallocated</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">{systemCount}</div>
            <div className="text-sm text-muted-foreground">Protected</div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Page Registry</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSyncPages}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync from Config
            </Button>
            <Button size="sm" onClick={() => setEditingPage({ slug: "", display_name: "", status: "active", category: "other" })}>
              <Plus className="h-4 w-4 mr-2" />
              Add Page
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search pages..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {PAGE_CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="deprecated">Deprecated</SelectItem>
                <SelectItem value="deleted">Deleted</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Switch
                checked={showUnallocatedOnly}
                onCheckedChange={setShowUnallocatedOnly}
              />
              <Label className="text-sm">Unallocated only</Label>
            </div>
          </div>

          {/* Page List by Category */}
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : (
            <div className="space-y-2">
              {PAGE_CATEGORIES.map(cat => {
                const catPages = groupedPages[cat.value] || [];
                if (catPages.length === 0) return null;
                
                const isExpanded = expandedCategories.has(cat.value);
                
                return (
                  <Collapsible key={cat.value} open={isExpanded} onOpenChange={() => toggleCategory(cat.value)}>
                    <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 hover:bg-muted/50 rounded-lg">
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      <Folder className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{cat.label}</span>
                      <Badge variant="secondary" className="ml-auto">{catPages.length}</Badge>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="ml-6 space-y-1 mt-1">
                        {catPages.map(page => (
                          <PageRow 
                            key={page.id} 
                            page={page}
                            isAllocated={allocatedSlugs.includes(page.slug)}
                            onEdit={() => setEditingPage(page)}
                            onDelete={() => setDeleteConfirm(page)}
                            onToggleProtect={() => toggleSystemPage(page)}
                          />
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Sheet */}
      <Sheet open={!!editingPage} onOpenChange={() => setEditingPage(null)}>
        <SheetContent className="w-[500px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingPage?.id ? "Edit Page" : "Add Page"}</SheetTitle>
          </SheetHeader>
          {editingPage && (
            <PageEditForm 
              page={editingPage} 
              onSave={(data) => saveMutation.mutate(data)}
              onCancel={() => setEditingPage(null)}
              isSaving={saveMutation.isPending}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Page: {deleteConfirm?.display_name || deleteConfirm?.slug}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteConfirm?.is_system_page ? (
                <span className="text-destructive font-medium">
                  This is a protected system page and cannot be deleted.
                </span>
              ) : (
                <div className="space-y-3">
                  <p>This will mark the page as deleted. The following related items may need manual cleanup:</p>
                  
                  {deleteConfirm?.related_components?.length > 0 && (
                    <div>
                      <div className="font-medium text-sm">Related Components:</div>
                      <ul className="text-sm list-disc ml-4">
                        {deleteConfirm.related_components.map(c => <li key={c}>{c}</li>)}
                      </ul>
                    </div>
                  )}
                  
                  {deleteConfirm?.related_entities?.length > 0 && (
                    <div>
                      <div className="font-medium text-sm">Related Entities:</div>
                      <ul className="text-sm list-disc ml-4">
                        {deleteConfirm.related_entities.map(e => <li key={e}>{e}</li>)}
                      </ul>
                    </div>
                  )}
                  
                  {(!deleteConfirm?.related_components?.length && !deleteConfirm?.related_entities?.length) && (
                    <p className="text-sm text-muted-foreground">No related files detected.</p>
                  )}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            {!deleteConfirm?.is_system_page && (
              <AlertDialogAction
                onClick={() => deleteMutation.mutate(deleteConfirm)}
                className="bg-destructive hover:bg-destructive/90"
              >
                Delete Page
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Individual page row component
function PageRow({ page, isAllocated, onEdit, onDelete, onToggleProtect }) {
  return (
    <div className="flex items-center gap-3 p-2 border rounded-lg hover:bg-muted/30 group">
      <File className="h-4 w-4 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{page.display_name || page.slug}</span>
          {page.is_system_page && (
            <Shield className="h-3 w-3 text-blue-500" title="Protected" />
          )}
        </div>
        <div className="text-xs text-muted-foreground font-mono">{page.slug}</div>
      </div>
      
      <div className="flex items-center gap-1">
        {/* Related items badges */}
        {page.related_components?.length > 0 && (
          <Badge variant="outline" className="text-xs gap-1">
            <Component className="h-3 w-3" />
            {page.related_components.length}
          </Badge>
        )}
        {page.related_entities?.length > 0 && (
          <Badge variant="outline" className="text-xs gap-1">
            <Database className="h-3 w-3" />
            {page.related_entities.length}
          </Badge>
        )}
        
        {/* Allocation status */}
        {isAllocated ? (
          <Badge className="bg-green-100 text-green-700 text-xs">Allocated</Badge>
        ) : (
          <Badge variant="outline" className="text-orange-600 border-orange-300 text-xs">Unallocated</Badge>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onToggleProtect} title={page.is_system_page ? "Unprotect" : "Protect"}>
          {page.is_system_page ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
        </Button>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onEdit}>
          <Edit className="h-3 w-3" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 w-7 p-0 text-destructive" 
          onClick={onDelete}
          disabled={page.is_system_page}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

// Edit form component
function PageEditForm({ page, onSave, onCancel, isSaving }) {
  const [formData, setFormData] = useState({
    ...page,
    related_components: page.related_components || [],
    related_entities: page.related_entities || [],
    related_functions: page.related_functions || [],
  });
  const [newComponent, setNewComponent] = useState("");
  const [newEntity, setNewEntity] = useState("");
  const [newFunction, setNewFunction] = useState("");

  const handleAddRelated = (type, value, setter) => {
    if (!value.trim()) return;
    const key = `related_${type}`;
    if (!formData[key].includes(value)) {
      setFormData({ ...formData, [key]: [...formData[key], value] });
    }
    setter("");
  };

  const handleRemoveRelated = (type, value) => {
    const key = `related_${type}`;
    setFormData({ ...formData, [key]: formData[key].filter(v => v !== value) });
  };

  return (
    <div className="space-y-4 mt-6">
      <div>
        <Label>Slug (Page File Name) *</Label>
        <Input
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          placeholder="MyPageName"
          disabled={!!page.id}
        />
      </div>
      
      <div>
        <Label>Display Name</Label>
        <Input
          value={formData.display_name || ""}
          onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
          placeholder="My Page Name"
        />
      </div>

      <div>
        <Label>Category</Label>
        <Select value={formData.category || "other"} onValueChange={(v) => setFormData({ ...formData, category: v })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_CATEGORIES.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Status</Label>
        <Select value={formData.status || "active"} onValueChange={(v) => setFormData({ ...formData, status: v })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="deprecated">Deprecated</SelectItem>
            <SelectItem value="deleted">Deleted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={formData.is_system_page || false}
          onCheckedChange={(v) => setFormData({ ...formData, is_system_page: v })}
        />
        <Label>Protected (System Page)</Label>
      </div>

      {/* Related Components */}
      <div>
        <Label>Related Components</Label>
        <div className="flex gap-2 mt-1">
          <Input
            value={newComponent}
            onChange={(e) => setNewComponent(e.target.value)}
            placeholder="components/path/Component.jsx"
            onKeyDown={(e) => e.key === "Enter" && handleAddRelated("components", newComponent, setNewComponent)}
          />
          <Button type="button" size="sm" onClick={() => handleAddRelated("components", newComponent, setNewComponent)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {formData.related_components.map(c => (
            <Badge key={c} variant="secondary" className="gap-1">
              {c}
              <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveRelated("components", c)} />
            </Badge>
          ))}
        </div>
      </div>

      {/* Related Entities */}
      <div>
        <Label>Related Entities</Label>
        <div className="flex gap-2 mt-1">
          <Input
            value={newEntity}
            onChange={(e) => setNewEntity(e.target.value)}
            placeholder="EntityName"
            onKeyDown={(e) => e.key === "Enter" && handleAddRelated("entities", newEntity, setNewEntity)}
          />
          <Button type="button" size="sm" onClick={() => handleAddRelated("entities", newEntity, setNewEntity)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {formData.related_entities.map(e => (
            <Badge key={e} variant="secondary" className="gap-1">
              {e}
              <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveRelated("entities", e)} />
            </Badge>
          ))}
        </div>
      </div>

      {/* Related Functions */}
      <div>
        <Label>Related Backend Functions</Label>
        <div className="flex gap-2 mt-1">
          <Input
            value={newFunction}
            onChange={(e) => setNewFunction(e.target.value)}
            placeholder="functionName"
            onKeyDown={(e) => e.key === "Enter" && handleAddRelated("functions", newFunction, setNewFunction)}
          />
          <Button type="button" size="sm" onClick={() => handleAddRelated("functions", newFunction, setNewFunction)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {formData.related_functions.map(f => (
            <Badge key={f} variant="secondary" className="gap-1">
              {f}
              <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveRelated("functions", f)} />
            </Badge>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <Label>Notes</Label>
        <Textarea
          value={formData.notes || ""}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Admin notes about this page..."
          rows={3}
        />
      </div>

      <SheetFooter className="mt-6">
        <div className="flex gap-3 w-full">
          <Button variant="outline" onClick={onCancel} className="flex-1" disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={() => onSave(formData)} className="flex-1" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </SheetFooter>
    </div>
  );
}