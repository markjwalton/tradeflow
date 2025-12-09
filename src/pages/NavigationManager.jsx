import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTenant } from "@/Layout";
import { Button } from "@/components/ui/button";

import { FileCode, Loader2, Cog, Users } from "lucide-react";
import { toast } from "sonner";

import GenericNavEditor from "@/components/navigation/GenericNavEditor";
import TenantSelector from "@/components/navigation/TenantSelector";
import { useEditMode } from "@/components/page-builder/EditModeContext";

// Slugs are now loaded from NavigationConfig.source_slugs - no hardcoded lists

// Generate unique ID for items
const generateId = () => Math.random().toString(36).substr(2, 9);

export default function NavigationManager() {
  const tenantContext = useTenant();
  const [currentUser, setCurrentUser] = useState(null);
  const queryClient = useQueryClient();
  const { setCustomProperties } = useEditMode();
  
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

  // Set custom properties for the side panel
  useEffect(() => {
    setCustomProperties([
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
  }, [pageSettings, setCustomProperties]);

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

  // Tab button style helper
  const tabStyle = (tab) => `font-body [padding:var(--spacing-2)_var(--spacing-4)] [border-radius:var(--radius-lg)] [transition:var(--duration-200)] ${
    activeTab === tab 
      ? "bg-[var(--color-primary)] text-white" 
      : "bg-[var(--color-background)] text-[var(--color-foreground)] hover:bg-[var(--color-muted)] border border-[var(--color-border)]"
  }`;

  return (
    <div className="[padding:var(--spacing-6)] max-w-4xl mx-auto bg-[var(--color-background)] min-h-screen">
      {isGlobalAdmin ? (
        <>
          {/* Tab Navigation */}
          <div className="flex [gap:var(--spacing-2)] flex-wrap [margin-bottom:var(--spacing-6)]">
            <button className={tabStyle("admin")} onClick={() => setActiveTab("admin")}>
              <Cog className="h-4 w-4 [margin-right:var(--spacing-2)] inline" />
              Admin Console
            </button>
            <button className={tabStyle("app")} onClick={() => setActiveTab("app")}>
              <FileCode className="h-4 w-4 [margin-right:var(--spacing-2)] inline" />
              App Pages
            </button>
            <button className={tabStyle("tenant")} onClick={() => setActiveTab("tenant")}>
              <Users className="h-4 w-4 [margin-right:var(--spacing-2)] inline" />
              Tenant Navigation
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "admin" && (
            <GenericNavEditor
              title="Admin Console Navigation"
              configType="admin_console"
            />
          )}

          {activeTab === "app" && (
            <div>
              <div className="font-body [margin-bottom:var(--spacing-4)] [padding:var(--spacing-3)] bg-[var(--color-secondary-50)] border border-[var(--color-secondary-200)] [border-radius:var(--radius-lg)] text-[var(--color-foreground)]">
                <strong className="font-display">App Pages</strong> are tenant-facing pages. 
                Use this to organize which pages appear in tenant navigation.
              </div>
              <GenericNavEditor
                title="App Pages Navigation (Global Template)"
                configType="app_pages_source"
              />
            </div>
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
    <div className="border [border-radius:var(--radius-lg)] [padding:var(--spacing-4)] bg-[var(--color-background)]">
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
            <div key={item.id} className="flex items-center [gap:var(--spacing-3)] [padding:var(--spacing-3)] border [border-radius:var(--radius-lg)] bg-[var(--color-muted)]">
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