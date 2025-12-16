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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileCode, Loader2, Cog, Users } from "lucide-react";
import { toast } from "sonner";

import GenericNavEditor from "@/components/navigation/GenericNavEditor";
import TenantSelector from "@/components/navigation/TenantSelector";
import FullscreenPagesManager from "@/components/navigation/FullscreenPagesManager";
import { useEditMode } from "@/components/page-builder/EditModeContext";
import { PageHeader } from "@/components/sturij";

// Slugs are now loaded from NavigationConfig.source_slugs - no hardcoded lists

// Generate unique ID for items
const generateId = () => Math.random().toString(36).substr(2, 9);

export default function NavigationManager() {
  const tenantContext = useTenant();
  const [currentUser, setCurrentUser] = useState(null);
  const [pageData, setPageData] = useState(null);
  const queryClient = useQueryClient();
  const { setCustomProperties } = useEditMode();
  
  const [selectedTenantId, setSelectedTenantId] = useState(
    tenantContext?.tenantId || "__global__"
  );
  
  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
    base44.entities.UIPage.filter({ page_name: "Navigation Manager" })
      .then(pages => {
        if (pages.length > 0) {
          setPageData(pages[0]);
        }
      })
      .catch(() => {});
  }, []);
  
  const isGlobalAdmin = currentUser?.is_global_admin === true;
  const isTenantAdminOnly = tenantContext?.isTenantAdmin && !isGlobalAdmin;
  
  const [activeTab, setActiveTab] = useState("admin");
  const [pageSettings, setPageSettings] = useState({ defaultTab: "admin", defaultCollapsed: false });
  
  // Load settings from user profile
  useEffect(() => {
    if (currentUser?.ui_preferences?.navManager_settings) {
      const settings = currentUser.ui_preferences.navManager_settings;
      setPageSettings(settings);
      setActiveTab(settings.defaultTab || "admin");
    }
  }, [currentUser]);

  const handleSaveSettings = async (key, value) => {
    const newSettings = { ...pageSettings, [key]: value };
    setPageSettings(newSettings);
    
    // Save to user profile instead of localStorage
    try {
      await base44.auth.updateMe({
        ui_preferences: {
          ...(currentUser?.ui_preferences || {}),
          navManager_settings: newSettings
        }
      });
      
      // Update current user state
      const updatedUser = await base44.auth.me();
      setCurrentUser(updatedUser);
      
      if (key === "defaultTab") {
        setActiveTab(value);
      }
      
      // When defaultCollapsed changes, update all folder items in NavigationConfig
      if (key === "defaultCollapsed") {
        const configs = await base44.entities.NavigationConfig.filter({ config_type: "admin_console" });
        if (configs.length > 0) {
          const config = configs[0];
          const updatedItems = (config.items || []).map(item => {
            if (item.item_type === "folder") {
              return { ...item, default_collapsed: value };
            }
            return item;
          });
          
          await base44.entities.NavigationConfig.update(config.id, { items: updatedItems });
          queryClient.invalidateQueries({ queryKey: ["navConfig"] });
          toast.success(value ? "All folders will start collapsed" : "All folders will start expanded");
        }
      } else {
        toast.success("Settings saved");
      }
    } catch (e) {
      toast.error("Failed to save settings: " + e.message);
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
        "OklchColorPicker", "DesignTokenEditor", "SiteSettings", "AssetManager", "WebsiteThemeManager",
        "RadiantHome", "KeynoteHome", "PocketHome", "PocketLogin", "PocketRegister",
        "StudioHome", "StudioAbout", "CommitHome", "CompassHome", "CompassLogin", "CompassInterviews",
        "SyntaxHome", "SyntaxDocs", "TransmitHome", "TailwindProductShowcase", "TailwindShowcaseGallery",
        "TailwindListsShowcase", "TailwindFeedsShowcase", "TailwindDrawerShowcase",
        "TailwindDescriptionListsShowcase", "TailwindStatsShowcase", "TailwindFormsShowcase",
        "TailwindAppShellsShowcase", "TailwindPageHeadersShowcase", "TailwindPeopleListsShowcase",
        "TailwindTablesShowcase", "TailwindCardsShowcase", "TailwindBadgesShowcase",
        "TailwindMenuShowcase", "TailwindNavigationShowcase", "TailwindCalendarShowcase",
        "TailwindSectionHeadersShowcase", "UXShowcase", "StandardPageReference"
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
        key: "page_description",
        label: "Page Description",
        type: "text",
        value: pageData?.data?.description || "",
        description: "Description shown below the page title",
        onChange: async (value) => {
          if (pageData?.id) {
            try {
              await base44.entities.UIPage.update(pageData.id, { description: value });
              setPageData({ ...pageData, data: { ...pageData.data, description: value } });
              toast.success("Description updated");
            } catch (e) {
              toast.error("Failed to update description");
            }
          }
        }
      },
      {
        key: "divider0",
        type: "divider"
      },
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
  }, [pageSettings, setCustomProperties, currentUser, saveNavConfig.isPending, restoreNavConfig.isPending, pageData]);

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



  return (
    <div className="min-h-screen -mt-[var(--spacing-6)]">
      {isGlobalAdmin ? (
        <>
          <PageHeader 
            title="Navigation Manager" 
            description={pageData?.data?.description || "Configure navigation menus and structure"}
          />

          {/* Tab Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-[var(--spacing-4)]">
            <TabsList className="grid w-full max-w-md grid-cols-3 bg-[var(--tabs-list-bg)] p-[var(--spacing-1)] rounded-[var(--radius-lg)]">
              <TabsTrigger 
                value="admin"
                className="flex items-center gap-[var(--spacing-2)] data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Cog className="h-[var(--spacing-4)] w-[var(--spacing-4)]" />
                <span className="hidden sm:inline">Admin</span>
              </TabsTrigger>
              <TabsTrigger 
                value="app"
                className="flex items-center gap-[var(--spacing-2)] data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <FileCode className="h-[var(--spacing-4)] w-[var(--spacing-4)]" />
                <span className="hidden sm:inline">App Pages</span>
              </TabsTrigger>
              <TabsTrigger 
                value="tenant"
                className="flex items-center gap-[var(--spacing-2)] data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Users className="h-[var(--spacing-4)] w-[var(--spacing-4)]" />
                <span className="hidden sm:inline">Tenant</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent 
              value="admin" 
              className="mt-[var(--spacing-6)] space-y-[var(--spacing-6)]"
            >
              <GenericNavEditor
                title=""
                configType="admin_console"
                syncUnallocatedPages={() => syncUnallocatedPages.mutate("admin_console")}
                isSyncing={syncUnallocatedPages.isPending}
              />
              <FullscreenPagesManager configType="admin_console" />
            </TabsContent>

            <TabsContent 
              value="app" 
              className="mt-[var(--spacing-6)] space-y-[var(--spacing-6)]"
            >
              <GenericNavEditor
                title=""
                configType="app_pages_source"
                syncUnallocatedPages={() => syncUnallocatedPages.mutate("app_pages_source")}
                isSyncing={syncUnallocatedPages.isPending}
              />
              <FullscreenPagesManager configType="app_pages_source" />
            </TabsContent>

            <TabsContent 
              value="tenant" 
              className="mt-[var(--spacing-6)]"
            >
              <div className="space-y-[var(--spacing-4)]">
                <TenantSelector
                  tenants={tenants}
                  selectedTenantId={selectedTenantId}
                  onSelectTenant={setSelectedTenantId}
                  showGlobal={false}
                />

                {selectedTenantId === "__global__" ? (
                  <div className="font-[var(--font-family-body)] text-center py-[var(--spacing-12)] text-[var(--color-text-muted)]">
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
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <div className="text-center py-[var(--spacing-12)]">
          <p className="font-[var(--font-family-body)] text-[var(--text-base)] text-[var(--color-text-muted)]">
            Navigation Manager is only available to global administrators.
          </p>
        </div>
      )}
    </div>
  );
}