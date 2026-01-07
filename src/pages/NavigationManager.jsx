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
import { LayoutDashboard, Menu } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

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
  
  const [navMode, setNavMode] = useState("side"); // "side" or "top"
  const [pageSettings, setPageSettings] = useState({ navMode: "side", defaultCollapsed: false });
  
  // Load settings from NavigationConfig (source of truth)
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Load navMode from user preferences
        if (currentUser?.ui_preferences?.navManager_settings?.navMode) {
          setNavMode(currentUser.ui_preferences.navManager_settings.navMode);
        }
        
        // Load defaultCollapsed from NavigationConfig (source of truth)
        const configs = await base44.entities.NavigationConfig.filter({ config_type: "admin_console" });
        if (configs.length > 0) {
          const config = configs[0];
          const folderItems = (config.items || []).filter(item => item.item_type === "folder");
          const hasCollapsed = folderItems.some(item => item.default_collapsed === true);
          
          const newSettings = {
            navMode: currentUser?.ui_preferences?.navManager_settings?.navMode || "side",
            defaultCollapsed: hasCollapsed
          };
          setPageSettings(newSettings);
        }
      } catch (e) {
        console.error("Failed to load settings:", e);
      }
    };
    
    if (currentUser) {
      loadSettings();
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
      
      if (key === "navMode") {
        setNavMode(value);
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

  // Sync unallocated pages mutation - dynamically scans pages folder
  const syncUnallocatedPages = useMutation({
    mutationFn: async (configType) => {
      // Scan pages folder dynamically
      const scanResult = await base44.functions.invoke('scanPages');
      const allPages = scanResult.data?.pages || [];
      
      if (allPages.length === 0) {
        return { added: 0, message: "No pages found in pages folder" };
      }
      
      const configs = await base44.entities.NavigationConfig.filter({ config_type: configType });
      
      // Create config if it doesn't exist
      if (configs.length === 0) {
        await base44.entities.NavigationConfig.create({
          config_type: configType,
          items: [],
          source_slugs: allPages.sort()
        });
        return { 
          added: allPages.length, 
          message: `Created config with ${allPages.length} page(s)` 
        };
      }
      
      const config = configs[0];
      const currentSourceSlugs = config.source_slugs || [];
      
      // Find pages not in source_slugs
      const missingPages = allPages.filter(slug => !currentSourceSlugs.includes(slug));
      
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
        key: "downloadConfig",
        label: "Download Navigation Config",
        type: "button",
        buttonLabel: "Download as JSON",
        description: "Download current navigation config to a file",
        onClick: async () => {
          try {
            const configs = await base44.entities.NavigationConfig.filter({});
            const downloadData = {
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
            const blob = new Blob([JSON.stringify(downloadData, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `navigation-config-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
            toast.success("Navigation config downloaded");
          } catch (e) {
            toast.error("Failed to download: " + e.message);
          }
        },
        variant: "secondary"
      },
      {
        key: "divider1",
        type: "divider"
      },
      {
        key: "navMode",
        label: "Navigation Mode",
        type: "select",
        value: pageSettings.navMode || "side",
        options: [
          { value: "side", label: "Side Navigation" },
          { value: "top", label: "Top Navigation" }
        ],
        description: "Which navigation to manage",
        onChange: (value) => handleSaveSettings("navMode", value)
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

  return (
    <div className="min-h-screen -mt-[var(--spacing-6)]">
      {isGlobalAdmin ? (
        <>
          <PageHeader 
            title="Navigation Manager" 
            description={pageData?.data?.description || "Configure navigation menus and structure"}
          />

          {/* Navigation Mode Toggle */}
          <div className="mt-[var(--spacing-6)] flex items-center gap-[var(--spacing-3)]">
            <Button
              variant={navMode === "side" ? "default" : "outline"}
              onClick={() => {
                setNavMode("side");
                handleSaveSettings("navMode", "side");
              }}
              className="flex items-center gap-[var(--spacing-2)]"
            >
              <LayoutDashboard className="h-[var(--spacing-4)] w-[var(--spacing-4)]" />
              Side Navigation
            </Button>
            <Button
              variant={navMode === "top" ? "default" : "outline"}
              onClick={() => {
                setNavMode("top");
                handleSaveSettings("navMode", "top");
              }}
              className="flex items-center gap-[var(--spacing-2)]"
            >
              <Menu className="h-[var(--spacing-4)] w-[var(--spacing-4)]" />
              Top Navigation
            </Button>
          </div>

          <div className="mt-[var(--spacing-6)] space-y-[var(--spacing-6)]">
            {navMode === "side" ? (
              <>
                <Card className="p-[var(--spacing-6)]">
                  <h2 className="text-[var(--text-xl)] font-[var(--font-family-display)] font-[var(--font-weight-medium)] mb-[var(--spacing-4)]">
                    Admin Console Navigation
                  </h2>
                  <GenericNavEditor
                    title=""
                    configType="admin_console"
                    syncUnallocatedPages={() => syncUnallocatedPages.mutate("admin_console")}
                    isSyncing={syncUnallocatedPages.isPending}
                  />
                  <div className="mt-[var(--spacing-6)]">
                    <FullscreenPagesManager configType="admin_console" />
                  </div>
                </Card>

                <Card className="p-[var(--spacing-6)]">
                  <h2 className="text-[var(--text-xl)] font-[var(--font-family-display)] font-[var(--font-weight-medium)] mb-[var(--spacing-4)]">
                    App Pages (Global Template)
                  </h2>
                  <GenericNavEditor
                    title=""
                    configType="app_pages_source"
                    syncUnallocatedPages={() => syncUnallocatedPages.mutate("app_pages_source")}
                    isSyncing={syncUnallocatedPages.isPending}
                  />
                </Card>

                <Card className="p-[var(--spacing-6)]">
                  <div className="flex items-center justify-between mb-[var(--spacing-4)]">
                    <h2 className="text-[var(--text-xl)] font-[var(--font-family-display)] font-[var(--font-weight-medium)]">
                      Tenant-Specific Navigation
                    </h2>
                    <TenantSelector
                      tenants={tenants}
                      selectedTenantId={selectedTenantId}
                      onTenantChange={setSelectedTenantId}
                    />
                  </div>
                  <GenericNavEditor
                    title=""
                    configType="tenant_specific"
                    tenantId={selectedTenantId}
                    copyGlobalTemplate={() => copyGlobalToTenant.mutate(selectedTenantId)}
                  />
                </Card>
              </>
            ) : (
              <Card className="p-[var(--spacing-6)]">
                <h2 className="text-[var(--text-xl)] font-[var(--font-family-display)] font-[var(--font-weight-medium)] mb-[var(--spacing-4)]">
                  Top Navigation Secondary Links
                </h2>
                <GenericNavEditor
                  title=""
                  configType="top_nav_secondary"
                  syncUnallocatedPages={() => syncUnallocatedPages.mutate("top_nav_secondary")}
                  isSyncing={syncUnallocatedPages.isPending}
                />
              </Card>
            )}
          </div>
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