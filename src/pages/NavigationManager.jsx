import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTenant } from "@/Layout";
import { Button } from "@/components/ui/button";

import { Settings, FileCode, Eye, Wand2, Loader2, Cog, Users } from "lucide-react";
import { toast } from "sonner";

import GenericNavEditor from "@/components/navigation/GenericNavEditor";
import TenantSelector from "@/components/navigation/TenantSelector";
import PageSettingsDialog from "@/components/common/PageSettingsDialog";

// Admin Console page slugs - hardcoded in Layout.js
const ADMIN_CONSOLE_SLUGS = [
  "Dashboard", "DashboardManager", "CMSManager", "APIManager", "SecurityMonitor", "PerformanceMonitor",
  "RoadmapManager", "RoadmapJournal", "SprintManager", "RuleBook",
  "PlaygroundSummary", "TestDataManager", "MindMapEditor", "ERDEditor",
  "GeneratedApps", "EntityLibrary", "PageLibrary", "FeatureLibrary",
  "TemplateLibrary", "BusinessTemplates", "WorkflowLibrary", "WorkflowDesigner",
  "FormTemplates", "FormBuilder", "ChecklistTemplates", "ChecklistBuilder",
  "SystemSpecification", "TenantManager", "NavigationManager", "PackageLibrary",
  "PromptSettings", "LookupTestForms", "CommunityLibrary", "CommunityPublish"
];

// App Pages slugs - hardcoded tenant-facing pages in Layout.js
const APP_PAGES_SLUGS = [
  "Home", "Projects", "ProjectDetail", "ProjectDetails", "ProjectForm", "ProjectsOverview",
  "Tasks", "Customers", "Team", "Estimates", "Calendar",
  "WebsiteEnquiryForm", "AppointmentHub", "AppointmentConfirm", "AppointmentManager",
  "InterestOptionsManager"
];

// Generate unique ID for items
const generateId = () => Math.random().toString(36).substr(2, 9);

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
  
  const [showSettings, setShowSettings] = useState(false);
  const [pageSettings, setPageSettings] = useState(() => {
    const saved = localStorage.getItem("navManager_settings");
    return saved ? JSON.parse(saved) : { defaultTab: "admin" };
  });

  const settingsOptions = [
    { key: "defaultTab", label: "Default Tab", type: "select", options: [
      { value: "admin", label: "Admin Console" },
      { value: "app", label: "App Pages" },
      { value: "live", label: "Live Pages (Preview)" },
      { value: "tenant", label: "Tenant Navigation" }
    ], description: "Which tab to show by default" }
  ];

  const handleSaveSettings = (newSettings) => {
    setPageSettings(newSettings);
    localStorage.setItem("navManager_settings", JSON.stringify(newSettings));
  };

  // Fetch tenants for selector
  const { data: tenants = [] } = useQuery({
    queryKey: ["tenants"],
    queryFn: () => base44.entities.Tenant.list(),
  });

  // Fetch PageTemplates for Live Pages tab
  const { data: pageTemplates = [] } = useQuery({
    queryKey: ["pageTemplatesNav"],
    queryFn: () => base44.entities.PageTemplate.list("name", 300),
  });

  // Fetch FeatureTemplates for Live Pages tab
  const { data: featureTemplates = [] } = useQuery({
    queryKey: ["featureTemplatesNav"],
    queryFn: () => base44.entities.FeatureTemplate.list("name", 300),
  });

  // Copy global template to tenant
  const copyGlobalToTenant = useMutation({
    mutationFn: async (tenantId) => {
      const globalConfigs = await base44.entities.NavigationConfig.filter({ config_type: "app_pages_source" });
      const globalItems = globalConfigs[0]?.items || [];
      
      for (const item of globalItems) {
        await base44.entities.NavigationItem.create({
          tenant_id: tenantId,
          name: item.name,
          item_type: item.item_type || "page",
          page_url: item.slug,
          icon: item.icon,
          order: item.order || 0,
          is_visible: item.is_visible !== false,
          parent_id: null,
          roles: []
        });
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenantNavItems"] });
      toast.success("Global template copied to tenant");
    },
  });

  // Tenant-specific navigation uses NavigationItem entity
  const { data: tenantNavItems = [], isLoading: tenantLoading } = useQuery({
    queryKey: ["tenantNavItems", selectedTenantId],
    queryFn: () => base44.entities.NavigationItem.filter({ tenant_id: selectedTenantId }, "order"),
    enabled: activeTab === "tenant" && selectedTenantId !== "__global__",
  });

  // Tab button style helper
  const tabStyle = (tab) => `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
    activeTab === tab 
      ? "bg-[var(--color-primary)] text-white" 
      : "bg-[var(--color-background)] text-[var(--color-charcoal)] hover:bg-[var(--color-background)]/80 border border-[var(--color-charcoal)]/20"
  }`;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-[var(--color-background)] min-h-screen">
      {isGlobalAdmin ? (
        <>
          {/* Tab Navigation */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2 flex-wrap">
              <button className={tabStyle("admin")} onClick={() => setActiveTab("admin")}>
                <Cog className="h-4 w-4 mr-2 inline" />
                Admin Console
              </button>
              <button className={tabStyle("app")} onClick={() => setActiveTab("app")}>
                <FileCode className="h-4 w-4 mr-2 inline" />
                App Pages
              </button>
              <button className={tabStyle("live")} onClick={() => setActiveTab("live")}>
                <Eye className="h-4 w-4 mr-2 inline" />
                Live Pages
              </button>
              <button className={tabStyle("tenant")} onClick={() => setActiveTab("tenant")}>
                <Users className="h-4 w-4 mr-2 inline" />
                Tenant Navigation
              </button>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)}>
              <Settings className="h-5 w-5" />
            </Button>
          </div>

          {/* Tab Content */}
          {activeTab === "admin" && (
            <GenericNavEditor
              title="Admin Console Navigation"
              configType="admin_console"
              sourceSlugs={ADMIN_CONSOLE_SLUGS}
            />
          )}

          {activeTab === "app" && (
            <div>
              <div className="mb-4 p-3 bg-[var(--color-secondary)]/10 border border-[var(--color-secondary)]/30 rounded-lg text-sm text-[var(--color-midnight)]">
                <strong>App Pages</strong> are tenant-facing pages. 
                Use this to organize which pages appear in tenant navigation.
              </div>
              <GenericNavEditor
                title="App Pages Navigation (Global Template)"
                configType="app_pages_source"
                sourceSlugs={APP_PAGES_SLUGS}
              />
            </div>
          )}

          {activeTab === "live" && (
            <LivePagesNavEditor 
              pageTemplates={pageTemplates}
              featureTemplates={featureTemplates}
            />
          )}

          {activeTab === "tenant" && (
            <div className="space-y-4">
              <TenantSelector
                tenants={tenants}
                selectedTenantId={selectedTenantId}
                onSelectTenant={setSelectedTenantId}
                showGlobal={false}
              />

              {selectedTenantId === "__global__" ? (
                <div className="text-center py-12 text-[var(--color-charcoal)]">
                  Select a tenant to manage their navigation
                </div>
              ) : (
                <GenericNavEditor
                  title={`Tenant Navigation: ${tenants.find(t => t.id === selectedTenantId)?.name || 'Unknown'}`}
                  configType={`tenant_nav_${selectedTenantId}`}
                  sourceSlugs={APP_PAGES_SLUGS}
                  showCopyButton={true}
                  copyButtonLabel="Copy from App Pages Template"
                  onCopyFromTemplate={async () => {
                    try {
                      const appConfigs = await base44.entities.NavigationConfig.filter({ config_type: "app_pages_source" });
                      const appItems = appConfigs[0]?.items || [];
                      if (appItems.length === 0) {
                        toast.error("No App Pages template to copy from");
                        return;
                      }
                      const tenantConfigs = await base44.entities.NavigationConfig.filter({ config_type: `tenant_nav_${selectedTenantId}` });
                      if (tenantConfigs[0]) {
                        await base44.entities.NavigationConfig.update(tenantConfigs[0].id, { items: appItems });
                      } else {
                        await base44.entities.NavigationConfig.create({
                          config_type: `tenant_nav_${selectedTenantId}`,
                          items: appItems,
                          source_slugs: APP_PAGES_SLUGS
                        });
                      }
                      queryClient.invalidateQueries({ queryKey: ["navConfig", `tenant_nav_${selectedTenantId}`] });
                      toast.success("Copied from App Pages template");
                    } catch (e) {
                      toast.error("Failed to copy: " + e.message);
                    }
                  }}
                />
              )}
            </div>
          )}
        </>
      ) : (
        <TenantNavEditor 
          tenantId={tenantContext?.tenantId} 
          items={tenantNavItems}
          isLoading={tenantLoading}
        />
      )}

      <PageSettingsDialog
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={pageSettings}
        onSave={handleSaveSettings}
        options={settingsOptions}
        title="Navigation Manager Settings"
      />
    </div>
  );
}

// Live Pages Navigation Editor with auto-generate
function LivePagesNavEditor({ pageTemplates = [], featureTemplates = [] }) {
  const queryClient = useQueryClient();
  const [generating, setGenerating] = useState(false);

  // All slugs - pages use name directly, features use "feature:" prefix
  const allSlugs = [
    ...pageTemplates.map(p => p.name),
    ...featureTemplates.map(f => `feature:${f.name}`)
  ];

  // Collect all unique categories
  const pageCategories = [...new Set(pageTemplates.map(p => p.category).filter(Boolean))];
  const featureCategories = [...new Set(featureTemplates.map(f => f.category).filter(Boolean))];
  const allCategories = [...new Set([...pageCategories, ...featureCategories])];

  // Generate navigation with category folders
  const handleAutoGenerate = async () => {
    setGenerating(true);
    try {
      // Build new items from scratch
      const newItems = [];
      let order = 0;

      // First pass: Create folder objects with stable IDs
      const folderMap = {};
      for (const category of allCategories.sort()) {
        // Use slug field to store the folder ID since _id may not persist
        const folderId = `folder_${category.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        folderMap[category] = folderId;

        newItems.push({
          _id: folderId,
          slug: folderId,  // Store ID in slug too so we can reference it
          name: category,
          icon: "FolderOpen",
          is_visible: true,
          parent_id: null,
          item_type: "folder",
          default_collapsed: true,
          order: order++
        });
      }

      // Second pass: Add pages with correct parent_id references
      for (const page of pageTemplates.filter(p => p.category).sort((a, b) => a.name.localeCompare(b.name))) {
        const parentId = folderMap[page.category];
        if (parentId) {
          newItems.push({
            _id: `page_${page.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
            name: page.name,
            slug: page.name,
            icon: "File",
            is_visible: true,
            parent_id: parentId,
            item_type: "page",
            order: order++
          });
        }
      }

      // Third pass: Add features with correct parent_id references
      for (const feature of featureTemplates.filter(f => f.category).sort((a, b) => a.name.localeCompare(b.name))) {
        const parentId = folderMap[feature.category];
        if (parentId) {
          newItems.push({
            _id: `feature_${feature.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
            name: feature.name,
            slug: `feature:${feature.name}`,
            icon: "Zap",
            is_visible: true,
            parent_id: parentId,
            item_type: "page",
            order: order++
          });
        }
      }

      console.log("Generated items:", newItems.length, "Folders:", Object.keys(folderMap).length);
      console.log("Sample folder:", newItems[0]);
      console.log("Sample page with parent:", newItems.find(i => i.parent_id));

      // Fetch existing config
      const navConfigs = await base44.entities.NavigationConfig.filter({ config_type: "live_pages_source" });
      const config = navConfigs[0];

      // Save - always replace all items
      if (config) {
        await base44.entities.NavigationConfig.update(config.id, { 
          items: newItems, 
          source_slugs: allSlugs 
        });
      } else {
        await base44.entities.NavigationConfig.create({
          config_type: "live_pages_source",
          items: newItems,
          source_slugs: allSlugs
        });
      }

      // Force refetch
      await queryClient.invalidateQueries({ queryKey: ["navConfig", "live_pages_source"] });
      toast.success(`Generated ${allCategories.length} folders with ${newItems.length - allCategories.length} child items`);
    } catch (err) {
      console.error("Auto-generate error:", err);
      toast.error("Failed to generate: " + err.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="p-3 bg-[var(--color-secondary)]/10 border border-[var(--color-secondary)]/30 rounded-lg text-sm text-[var(--color-midnight)] flex-1 mr-4">
          <strong>{pageTemplates.length} pages</strong> and <strong>{featureTemplates.length} features</strong> across <strong>{allCategories.length} categories</strong>.
        </div>
        <Button onClick={handleAutoGenerate} disabled={generating} className="gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white">
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
          Auto-Generate
        </Button>
      </div>
      
      <GenericNavEditor
        title="Live Pages Navigation"
        configType="live_pages_source"
        sourceSlugs={allSlugs}
      />
    </div>
  );
}

// Tenant Navigation Editor - uses NavigationItem entity directly
function TenantNavEditor({ tenantId, items = [], isLoading }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.NavigationItem.create({
      ...data,
      tenant_id: tenantId,
      order: items.length
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenantNavItems", tenantId] });
      setShowForm(false);
      toast.success("Item created");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.NavigationItem.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenantNavItems", tenantId] });
      setShowForm(false);
      setEditingItem(null);
      toast.success("Item updated");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.NavigationItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenantNavItems", tenantId] });
      toast.success("Item deleted");
    },
  });

  if (isLoading) {
    return <div className="text-center py-8 text-[var(--color-charcoal)]">Loading...</div>;
  }

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-[var(--color-midnight)]">Tenant Navigation Items</h3>
        <Button size="sm" className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white" onClick={() => { setEditingItem(null); setShowForm(true); }}>
          Add Item
        </Button>
      </div>
      
      {items.length === 0 ? (
        <div className="text-center py-8 text-[var(--color-charcoal)]">
          No navigation items. Add items or copy from global template.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg bg-[var(--color-background)]">
              <span className="flex-1 font-medium text-[var(--color-midnight)]">{item.name}</span>
              <span className="text-sm text-[var(--color-charcoal)]">{item.page_url}</span>
              <Button variant="ghost" size="sm" onClick={() => { setEditingItem(item); setShowForm(true); }}>
                Edit
              </Button>
              <Button variant="ghost" size="sm" className="text-[var(--color-destructive)]" onClick={() => deleteMutation.mutate(item.id)}>
                Delete
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}