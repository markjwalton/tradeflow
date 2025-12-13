import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTenant } from "@/Layout";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { FileCode, Loader2, Cog, Users } from "lucide-react";
import { toast } from "sonner";

import GenericNavEditor from "@/components/navigation/GenericNavEditor";
import TenantSelector from "@/components/navigation/TenantSelector";
import { useEditMode } from "@/components/page-builder/EditModeContext";
import { useBreadcrumb } from "@/components/layout/AppContent";
import { AppBreadcrumb } from "@/components/layout/AppBreadcrumb";

// Slugs are now loaded from NavigationConfig.source_slugs - no hardcoded lists

// Generate unique ID for items
const generateId = () => Math.random().toString(36).substr(2, 9);

export default function NavigationManager() {
  const tenantContext = useTenant();
  const [currentUser, setCurrentUser] = useState(null);
  const [pageData, setPageData] = useState(null);
  const queryClient = useQueryClient();
  const { setCustomProperties } = useEditMode();
  const breadcrumbContext = useBreadcrumb();
  
  const [selectedTenantId, setSelectedTenantId] = useState(
    tenantContext?.tenantId || "__global__"
  );
  
  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
    base44.entities.UIPage.filter({ slug: "NavigationManager" })
      .then(pages => pages.length > 0 && setPageData(pages[0]))
      .catch(() => {});
  }, []);
  
  const isGlobalAdmin = currentUser?.is_global_admin === true;
  const isTenantAdminOnly = tenantContext?.isTenantAdmin && !isGlobalAdmin;
  
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem("navManager_settings");
    const settings = saved ? JSON.parse(saved) : {};
    return settings.defaultTab || "admin";
  });
  
  const [pageSettings, setPageSettings] = useState(() => {
    const saved = localStorage.getItem("navManager_settings");
    return saved ? JSON.parse(saved) : { defaultTab: "admin", defaultCollapsed: false };
  });

  const handleSaveSettings = (key, value) => {
    const newSettings = { ...pageSettings, [key]: value };
    setPageSettings(newSettings);
    localStorage.setItem("navManager_settings", JSON.stringify(newSettings));
    if (key === "defaultTab") {
      setActiveTab(value);
    }
  };

  // Sync unallocated pages mutation - manually adds known showcase pages to source_slugs
  const syncUnallocatedPages = useMutation({
    mutationFn: async (configType) => {
      // Hardcoded list of known pages that should be available
      const knownPages = [
        "Dashboard", "NavigationManager", "PageBuilder", "TenantManager", "LayoutPatternManager",
        "RuleBook", "CSSAudit", "TestDataManager", "UILibrary", "Components", "BrandIdentity",
        "ComponentPatterns", "TypographyShowcase", "ButtonsShowcase", "CardsShowcase", 
        "FormsShowcase", "LayoutShowcase", "NavigationShowcase", "DataDisplayShowcase",
        "FeedbackShowcase", "Projects", "ProjectDetail", "ProjectsOverview", "ProjectForm",
        "Tasks", "Customers", "Team", "Calendar", "Estimates", "Home", "Setup", "TenantAccess",
        "WorkflowDesigner", "WorkflowLibrary", "FormBuilder", "FormTemplates", 
        "ChecklistBuilder", "ChecklistTemplates", "AppointmentHub", "AppointmentConfirm",
        "AppointmentManager", "WebsiteEnquiryForm", "InterestOptionsManager", "MindMapEditor",
        "TemplateLibrary", "CommunityLibrary", "CommunityPublish", "PackageLibrary",
        "SturijPackage", "GeneratedApps", "PackageExport", "BusinessTemplates", "EntityLibrary",
        "FeatureLibrary", "PageLibrary", "PlaygroundSummary", "SprintManager", "RoadmapManager",
        "LearnedPatterns", "DesignSystemManager", "SecurityMonitor", "PerformanceMonitor",
        "APIManager", "CMSManager", "KnowledgeManager", "RoadmapJournal", "ConceptWorkbench",
        "LivePreview", "TestingHub", "DebugProjectWorkspace", "DebugProjectEditor",
        "LayoutBuilder", "LookupTestForms", "ViolationReport", "DesignTokens", "TokenPreview",
        "ERDEditor", "SystemSpecification", "PromptSettings", "DashboardManager",
        "PlaygroundEntity", "PlaygroundPage", "PlaygroundFeature", "StandaloneAPIStrategy",
        "StandaloneInstanceManager", "ProjectDetails", "TailwindKnowledgeManager",
        "ComponentShowcase", "PackageDetail", "DesignPatternAudit", "GitHubIntegration",
        "ColorMigrationDashboard", "ThemeBuilder", "ThemePreview", "FontManager", 
        "OklchColorPicker", "DesignTokenEditor", "SiteSettings"
      ];
      
      const configs = await base44.entities.NavigationConfig.filter({ config_type: configType });
      if (configs.length === 0) {
        return { added: 0, message: "No config found" };
      }
      
      const config = configs[0];
      const currentSourceSlugs = config.source_slugs || [];
      
      // Find pages not in source_slugs
      const missingPages = knownPages.filter(slug => !currentSourceSlugs.includes(slug));
      
      if (missingPages.length === 0) {
        return { added: 0, message: "All pages already in config" };
      }
      
      // Update source_slugs with new pages
      const updatedSourceSlugs = [...currentSourceSlugs, ...missingPages].sort();
      await base44.entities.NavigationConfig.update(config.id, { 
        source_slugs: updatedSourceSlugs 
      });
      
      return { 
        added: missingPages.length, 
        message: `Added ${missingPages.length} page(s) to source_slugs` 
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["navConfig"] });
      toast.success(result.message);
    },
    onError: (error) => {
      toast.error("Sync failed: " + error.message);
    }
  });

  // Save current navigation config
  const saveNavConfig = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      const configs = await base44.entities.NavigationConfig.filter({});
      const savedData = {
        timestamp: new Date().toISOString(),
        configs: configs.map(c => ({
          config_type: c.config_type,
          items: c.items,
          source_slugs: c.source_slugs,
          public_pages: c.public_pages,
          standalone_pages: c.standalone_pages,
          fullscreen_pages: c.fullscreen_pages
        }))
      };
      await base44.auth.updateMe({
        ui_preferences: {
          ...(user.ui_preferences || {}),
          saved_nav_config: savedData
        }
      });
      return savedData;
    },
    onSuccess: (data) => {
      toast.success(`Navigation config saved (${new Date(data.timestamp).toLocaleString()})`);
      base44.auth.me().then(setCurrentUser);
    },
    onError: (error) => {
      toast.error("Failed to save config: " + error.message);
    }
  });

  // Restore saved navigation config
  const restoreNavConfig = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      const savedData = user.ui_preferences?.saved_nav_config;
      if (!savedData) {
        throw new Error("No saved config found");
      }

      // Restore each config
      for (const savedConfig of savedData.configs) {
        const existing = await base44.entities.NavigationConfig.filter({
          config_type: savedConfig.config_type
        });
        
        if (existing.length > 0) {
          await base44.entities.NavigationConfig.update(existing[0].id, {
            items: savedConfig.items,
            source_slugs: savedConfig.source_slugs,
            public_pages: savedConfig.public_pages,
            standalone_pages: savedConfig.standalone_pages,
            fullscreen_pages: savedConfig.fullscreen_pages
          });
        } else {
          await base44.entities.NavigationConfig.create(savedConfig);
        }
      }
      
      return savedData;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["navConfig"] });
      toast.success(`Config restored from ${new Date(data.timestamp).toLocaleString()}`);
    },
    onError: (error) => {
      toast.error("Failed to restore: " + error.message);
    }
  });

  // Set custom properties for the side panel
  useEffect(() => {
    const savedTimestamp = currentUser?.ui_preferences?.saved_nav_config?.timestamp;
    
    setCustomProperties([
      {
        key: "saveConfig",
        label: "Save Navigation Config",
        type: "button",
        buttonLabel: saveNavConfig.isPending ? "Saving..." : "Save Current Config",
        description: savedTimestamp 
          ? `Last saved: ${new Date(savedTimestamp).toLocaleString()}`
          : "Save the current navigation configuration",
        onClick: () => saveNavConfig.mutate(),
        disabled: saveNavConfig.isPending
      },
      {
        key: "restoreConfig",
        label: "Restore Navigation Config",
        type: "button",
        buttonLabel: restoreNavConfig.isPending ? "Restoring..." : "Restore Saved Config",
        description: savedTimestamp
          ? "Restore navigation from saved backup"
          : "No saved config available",
        onClick: () => restoreNavConfig.mutate(),
        disabled: !savedTimestamp || restoreNavConfig.isPending,
        variant: "outline"
      },
      {
        key: "divider1",
        type: "divider"
      },
      {
        key: "defaultTab",
        label: "Default Tab",
        type: "select",
        value: pageSettings.defaultTab || "admin",
        options: [
          { value: "admin", label: "Admin Console" },
          { value: "app", label: "App Pages" },
          { value: "tenant", label: "Tenant Navigation" }
        ],
        description: "Which tab to show by default",
        onChange: (value) => handleSaveSettings("defaultTab", value)
      },
      {
        key: "defaultCollapsed",
        label: "Folders Start Collapsed",
        type: "boolean",
        value: pageSettings.defaultCollapsed || false,
        description: "All folders start collapsed on page load",
        onChange: (value) => handleSaveSettings("defaultCollapsed", value)
      }
    ]);

    return () => setCustomProperties([]);
  }, [pageSettings, setCustomProperties, currentUser, saveNavConfig.isPending, restoreNavConfig.isPending]);

  // Fetch tenants for selector
  const { data: tenants = [] } = useQuery({
    queryKey: ["tenants"],
    queryFn: () => base44.entities.Tenant.list(),
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

  // Get site settings for button styling
  const [siteSettings, setSiteSettings] = useState({});
  
  useEffect(() => {
    base44.auth.me()
      .then(user => setSiteSettings(user?.site_settings || {}))
      .catch(() => {});
  }, []);

  // Tab styling - matches Onboarding Dashboard
  const getTabClassName = (tab) => {
    const isActive = activeTab === tab;
    return `font-body text-sm px-5 py-3 transition-all ${
      isActive 
        ? "bg-white shadow-md text-midnight-900 rounded-lg" 
        : "text-charcoal-600 hover:bg-green-50 hover:text-green-700 rounded-lg"
    }`;
  };

  const getTabStyle = (tab) => {
    const isActive = activeTab === tab;
    return isActive 
      ? { backgroundColor: 'var(--secondary-500)', color: 'white' } 
      : {};
  };

  return (
    <div className="max-w-4xl mx-auto min-h-screen">
      {isGlobalAdmin ? (
        <>
          {/* Page Header */}
          <div className="bg-white [margin-bottom:var(--spacing-6)] px-6 py-4 rounded-xl">
            {pageData?.show_breadcrumb && breadcrumbContext && (
              <div className="mb-4">
                <AppBreadcrumb organizedNavigation={breadcrumbContext.navItems} />
              </div>
            )}
            <h1 className={`text-3xl font-display text-[var(--color-text-primary)] ${pageData?.page_description ? '[margin-bottom:var(--spacing-2)]' : ''}`}>
              Navigation Manager
            </h1>
            {pageData?.page_description && (
              <p className="text-[var(--color-text-muted)]">
                {pageData.page_description}
              </p>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-3 [margin-bottom:var(--spacing-4)] bg-background-200 rounded-lg p-1">
              <button className={getTabClassName("admin")} style={getTabStyle("admin")} onClick={() => setActiveTab("admin")}>
                <Cog className="h-4 w-4 mr-2 inline" />
                Admin
              </button>
              <button className={getTabClassName("app")} style={getTabStyle("app")} onClick={() => setActiveTab("app")}>
                <FileCode className="h-4 w-4 mr-2 inline" />
                App Pages
              </button>
              <button className={getTabClassName("tenant")} style={getTabStyle("tenant")} onClick={() => setActiveTab("tenant")}>
                <Users className="h-4 w-4 mr-2 inline" />
                Tenant
              </button>
          </div>

          {/* Tab Content */}
          <div className="[margin-top:var(--spacing-4)]">
            {activeTab === "admin" && (
              <GenericNavEditor
                title=""
                configType="admin_console"
                syncUnallocatedPages={() => syncUnallocatedPages.mutate("admin_console")}
                isSyncing={syncUnallocatedPages.isPending}
              />
            )}

            {activeTab === "app" && (
              <GenericNavEditor
                title=""
                configType="app_pages_source"
                syncUnallocatedPages={() => syncUnallocatedPages.mutate("app_pages_source")}
                isSyncing={syncUnallocatedPages.isPending}
              />
            )}

            {activeTab === "tenant" && (
            <div className="[&>*+*]:mt-[var(--spacing-4)]">
              <TenantSelector
                tenants={tenants}
                selectedTenantId={selectedTenantId}
                onSelectTenant={setSelectedTenantId}
                showGlobal={false}
              />

              {selectedTenantId === "__global__" ? (
                <div className="font-body text-center [padding-block:var(--spacing-12)] text-[var(--color-muted-foreground)]">
                  Select a tenant to manage their navigation
                </div>
              ) : (
                <GenericNavEditor
                  title={`Tenant Navigation: ${tenants.find(t => t.id === selectedTenantId)?.name || 'Unknown'}`}
                  configType={`tenant_nav_${selectedTenantId}`}
                  syncUnallocatedPages={() => syncUnallocatedPages.mutate(`tenant_nav_${selectedTenantId}`)}
                  isSyncing={syncUnallocatedPages.isPending}
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
                          items: appItems
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
          </div>
        </>
      ) : (
        <TenantNavEditor 
          tenantId={tenantContext?.tenantId} 
          items={tenantNavItems}
          isLoading={tenantLoading}
        />
      )}
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
    return <div className="font-body text-center [padding-block:var(--spacing-8)] text-[var(--color-muted-foreground)]">Loading...</div>;
  }

  return (
    <div className="border border-border rounded-xl [padding:var(--spacing-4)] bg-card">
      <div className="flex justify-between items-center [margin-bottom:var(--spacing-4)]">
        <h3 className="font-display text-h5">Tenant Navigation Items</h3>
        <Button size="sm" className="bg-primary-500 hover:bg-primary-600 text-white" onClick={() => { setEditingItem(null); setShowForm(true); }}>
          Add Item
        </Button>
      </div>
      
      {items.length === 0 ? (
        <div className="font-body text-center [padding-block:var(--spacing-8)] text-[var(--color-muted-foreground)]">
          No navigation items. Add items or copy from global template.
        </div>
      ) : (
        <div className="[&>*+*]:mt-[var(--spacing-2)]">
          {items.map((item) => (
            <div key={item.id} className="flex items-center [gap:var(--spacing-3)] [padding:var(--spacing-3)] border rounded-xl bg-[var(--color-muted)]">
              <span className="font-body flex-1 text-[var(--color-foreground)]">{item.name}</span>
              <span className="font-body text-caption text-[var(--color-muted-foreground)]">{item.page_url}</span>
              <Button variant="ghost" size="sm" onClick={() => { setEditingItem(item); setShowForm(true); }}>
                Edit
              </Button>
              <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteMutation.mutate(item.id)}>
                Delete
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}