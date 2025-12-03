import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTenant } from "@/Layout";
import { Button } from "@/components/ui/button";

import { Settings, FileCode, Eye, Wand2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import GenericNavEditor from "@/components/navigation/GenericNavEditor";
import TenantSelector from "@/components/navigation/TenantSelector";
import PageSettingsDialog from "@/components/common/PageSettingsDialog";

// Admin Console page slugs - hardcoded in Layout.js
const ADMIN_CONSOLE_SLUGS = [
  "CMSManager", "APIManager", "SecurityMonitor", "PerformanceMonitor",
  "RoadmapManager", "RoadmapJournal", "SprintManager", "RuleBook",
  "PlaygroundSummary", "TestDataManager", "MindMapEditor", "ERDEditor",
  "GeneratedApps", "EntityLibrary", "PageLibrary", "FeatureLibrary",
  "TemplateLibrary", "BusinessTemplates", "WorkflowLibrary", "WorkflowDesigner",
  "FormTemplates", "FormBuilder", "ChecklistTemplates", "ChecklistBuilder",
  "SystemSpecification", "TenantManager", "NavigationManager", "PackageLibrary",
  "PromptSettings", "LookupTestForms"
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
      ? "bg-slate-900 text-white" 
      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
  }`;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {isGlobalAdmin ? (
        <>
          {/* Tab Navigation */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2 flex-wrap">
              <button className={tabStyle("admin")} onClick={() => setActiveTab("admin")}>
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
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                <strong>App Pages</strong> are hardcoded tenant-facing pages defined in Layout.js. 
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
              <div className="flex items-center gap-4">
                <TenantSelector
                  tenants={tenants}
                  selectedTenantId={selectedTenantId}
                  onSelectTenant={setSelectedTenantId}
                  showGlobal={false}
                />
                {selectedTenantId !== "__global__" && tenantNavItems.length === 0 && (
                  <Button 
                    variant="outline" 
                    onClick={() => copyGlobalToTenant.mutate(selectedTenantId)}
                    disabled={copyGlobalToTenant.isPending}
                  >
                    Copy from Global Template
                  </Button>
                )}
              </div>
              
              {selectedTenantId === "__global__" ? (
                <div className="text-center py-12 text-gray-500">
                  Select a tenant to manage their navigation
                </div>
              ) : (
                <TenantNavEditor 
                  tenantId={selectedTenantId} 
                  items={tenantNavItems}
                  isLoading={tenantLoading}
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
      const newItems = [];
      let order = 0;

      // Create category folders and their children
      for (const category of allCategories.sort()) {
        const folderId = generateId();
        
        // Add folder
        newItems.push({
          _id: folderId,
          name: category,
          slug: "",
          icon: "FolderOpen",
          is_visible: true,
          parent_id: null,
          item_type: "folder",
          default_collapsed: true,
          order: order++
        });

        // Add pages in this category
        const pagesInCategory = pageTemplates.filter(p => p.category === category);
        for (const page of pagesInCategory.sort((a, b) => a.name.localeCompare(b.name))) {
          newItems.push({
            _id: generateId(),
            name: page.name,
            slug: page.name,
            icon: "File",
            is_visible: true,
            parent_id: folderId,
            item_type: "page",
            order: order++
          });
        }

        // Add features in this category
        const featuresInCategory = featureTemplates.filter(f => f.category === category);
        for (const feature of featuresInCategory.sort((a, b) => a.name.localeCompare(b.name))) {
          newItems.push({
            _id: generateId(),
            name: feature.name,
            slug: `feature:${feature.name}`,
            icon: "Zap",
            is_visible: true,
            parent_id: folderId,
            item_type: "page",
            order: order++
          });
        }
      }

      // Fetch existing config
      const navConfigs = await base44.entities.NavigationConfig.filter({ config_type: "live_pages_source" });
      const config = navConfigs[0];

      // Save
      if (config) {
        await base44.entities.NavigationConfig.update(config.id, { items: newItems, source_slugs: allSlugs });
      } else {
        await base44.entities.NavigationConfig.create({
          config_type: "live_pages_source",
          items: newItems,
          source_slugs: allSlugs
        });
      }

      queryClient.invalidateQueries({ queryKey: ["navConfig", "live_pages_source"] });
      toast.success(`Generated ${allCategories.length} category folders with ${allSlugs.length} items`);
    } catch (err) {
      toast.error("Failed to generate: " + err.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700 flex-1 mr-4">
          <strong>{pageTemplates.length} pages</strong> and <strong>{featureTemplates.length} features</strong> across <strong>{allCategories.length} categories</strong>.
        </div>
        <Button onClick={handleAutoGenerate} disabled={generating} className="gap-2">
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
    return <div className="text-center py-8 text-gray-500">Loading...</div>;
  }

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Tenant Navigation Items</h3>
        <Button size="sm" onClick={() => { setEditingItem(null); setShowForm(true); }}>
          Add Item
        </Button>
      </div>
      
      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No navigation items. Add items or copy from global template.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
              <span className="flex-1 font-medium">{item.name}</span>
              <span className="text-sm text-gray-500">{item.page_url}</span>
              <Button variant="ghost" size="sm" onClick={() => { setEditingItem(item); setShowForm(true); }}>
                Edit
              </Button>
              <Button variant="ghost" size="sm" className="text-red-500" onClick={() => deleteMutation.mutate(item.id)}>
                Delete
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}