import React, { useEffect, useState, createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { cssVariables } from "@/components/library/designTokens";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prefetchOnIdle, prefetchDashboardQueries, prefetchLibraryQueries } from "@/components/common/queryPrefetch";

// Tenant Context
export const TenantContext = createContext(null);
export const useTenant = () => useContext(TenantContext);

import GlobalAIAssistant from "@/components/ai-assistant/GlobalAIAssistant";
import { AppShell } from "@/components/layout/AppShell";
import { SidebarProvider } from "@/components/layout/SidebarContext";
import { EditModeProvider } from "@/components/page-builder/EditModeContext";
import { PageSettingsPanel } from "@/components/page-builder/PageSettingsPanel";
import { PageUIPanel } from "@/components/design-assistant/PageUIPanel";
import { LiveEditWrapper } from "@/components/page-builder/LiveEditWrapper";
import { TopEditorPanel } from "@/components/page-builder/TopEditorPanel";
import { Palette } from "lucide-react";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { WebVitals } from "@/components/common/WebVitals";
import { initializeSentry, setUserContext } from "@/components/common/sentryConfig";

// Initialize Sentry once
if (typeof window !== 'undefined') {
  initializeSentry();
}

export default function Layout({ children, currentPageName }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessDeniedReason, setAccessDeniedReason] = useState(null);
  const [currentTenant, setCurrentTenant] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isGlobalAdmin, setIsGlobalAdmin] = useState(false);
  const [isTenantAdmin, setIsTenantAdmin] = useState(false);
  const [navConfig, setNavConfig] = useState(null);
  const [navItems, setNavItems] = useState([]);
  const [editorPanelOpen, setEditorPanelOpen] = useState(false);
  const [showEditorBubble, setShowEditorBubble] = useState(true);
  const [siteSettings, setSiteSettings] = useState(null);
  
  const urlParams = new URLSearchParams(window.location.search);
  const tenantSlug = urlParams.get("tenant");
  
  const publicPages = navConfig?.public_pages || ["TenantAccess", "Setup", "Dashboard"];
  const standalonePages = navConfig?.standalone_pages || [];
  const fullscreenPages = navConfig?.fullscreen_pages || [];
  
  const isGlobalAdminPage = navItems.some(item => item.page_url === currentPageName) || standalonePages.includes(currentPageName);
  const isTenantPage = false;

  useEffect(() => {
    // Load editor bubble preference and reset live edit mode on page load
    const loadBubblePreference = async () => {
      try {
        const user = await base44.auth.me();
        if (user?.ui_preferences?.showEditorBubble !== undefined) {
          setShowEditorBubble(user.ui_preferences.showEditorBubble);
        }
        // Always turn off live edit mode on page load
        await base44.auth.updateMe({
          ui_preferences: {
            ...(user.ui_preferences || {}),
            liveEditMode: false
          }
        });
        
        // Apply active theme CSS if it exists
        if (user?.active_theme?.css_variables) {
          const styleId = 'active-theme-css';
          let styleEl = document.getElementById(styleId);
          if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = styleId;
            document.head.appendChild(styleEl);
          }
          styleEl.textContent = user.active_theme.css_variables;
        }
        
        // Apply theme fonts if they exist
        if (user?.theme_fonts) {
          const { heading, body } = user.theme_fonts;
          
          // Load font stylesheets
          if (heading?.url && heading.source === 'google') {
            const linkId = 'theme-heading-font';
            if (!document.getElementById(linkId)) {
              const link = document.createElement('link');
              link.id = linkId;
              link.rel = 'stylesheet';
              link.href = heading.url;
              document.head.appendChild(link);
            }
          }
          
          if (body?.url && body.source === 'google') {
            const linkId = 'theme-body-font';
            if (!document.getElementById(linkId)) {
              const link = document.createElement('link');
              link.id = linkId;
              link.rel = 'stylesheet';
              link.href = body.url;
              document.head.appendChild(link);
            }
          }
          
          // Apply font families via CSS
          const fontStyleId = 'theme-fonts-css';
          let fontStyleEl = document.getElementById(fontStyleId);
          if (!fontStyleEl) {
            fontStyleEl = document.createElement('style');
            fontStyleEl.id = fontStyleId;
            document.head.appendChild(fontStyleEl);
          }
          fontStyleEl.textContent = `
            :root {
              --font-family-display: ${heading?.font_family || 'inherit'};
              --font-family-body: ${body?.font_family || 'inherit'};
            }
          `;
        }
      } catch (e) {
        // User not logged in or error
      }
    };

    const handlePreferencesChange = (event) => {
      setShowEditorBubble(event.detail.showEditorBubble ?? true);
    };

    const handleSiteSettingsChange = (event) => {
      setSiteSettings(event.detail);
      // Apply dark mode
      if (event.detail?.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    loadBubblePreference();

    // Prefetch common queries on idle
    if (queryClient) {
      prefetchOnIdle(queryClient, prefetchDashboardQueries);

      // Prefetch library data after a delay
      setTimeout(() => {
        prefetchOnIdle(queryClient, prefetchLibraryQueries);
      }, 3000);
    }

    // Load site settings
    const loadSiteSettings = async () => {
      try {
        const user = await base44.auth.me();
        if (user?.site_settings) {
          setSiteSettings(user.site_settings);
          // Apply dark mode on load
          if (user.site_settings?.darkMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      } catch (e) {
        // User not logged in
      }
    };
    loadSiteSettings();

    window.addEventListener('ui-preferences-changed', handlePreferencesChange);
    window.addEventListener('site-settings-changed', handleSiteSettingsChange);

    const checkAccess = async () => {
      try {
        let loadedNavConfig = null;
        let loadedNavItems = [];
        try {
          const navConfigs = await base44.entities.NavigationConfig.filter({ config_type: "admin_console" });
          if (navConfigs.length > 0) {
            loadedNavConfig = navConfigs[0];
            setNavConfig(loadedNavConfig);
            
            // Use items from NavigationConfig - convert to format with proper IDs
            if (loadedNavConfig.items?.length > 0) {
              loadedNavItems = loadedNavConfig.items
                .filter(item => item.is_visible !== false) // Only include visible items
                .map((item) => ({
                  id: item.id,
                  name: item.name,
                  item_type: item.item_type,
                  page_url: item.slug,
                  icon: item.icon,
                  order: item.order,
                  is_visible: item.is_visible,
                  parent_id: item.parent_id,
                  default_collapsed: item.default_collapsed,
                }));
              setNavItems(loadedNavItems);
            }
          }
        } catch (e) {
          console.error("Nav config error:", e);
        }
        
        // Get public pages from config or use defaults
        const configPublicPages = loadedNavConfig?.public_pages || ["TenantAccess", "Setup", "Dashboard"];
        
        // Skip access check for public pages
        if (configPublicPages.includes(currentPageName)) {
          setCheckingAccess(false);
          setHasAccess(true);
          return;
        }
    
        const user = await base44.auth.me();
        if (!user) {
          setHasAccess(false);
          setAccessDeniedReason("not_logged_in");
          setCheckingAccess(false);
          return;
        }
        setCurrentUser(user);
        setIsGlobalAdmin(user.is_global_admin === true);
        
        // Set Sentry user context
        try {
          setUserContext(user);
        } catch (e) {
          console.error('Failed to set Sentry context:', e);
        }
        
        const configStandalonePages = loadedNavConfig?.standalone_pages || [];
        const isAdminPage = loadedNavItems.some(item => item.page_url === currentPageName) || configStandalonePages.includes(currentPageName);
        
        // Global admin pages: for is_global_admin OR tenant admins (with tenant context)
        if (isAdminPage) {
          // Global admins always have access
          if (user.is_global_admin === true) {
            setHasAccess(true);
            setCheckingAccess(false);
            return;
          }
          
          // Standalone pages - check if user has any tenant admin access
          if (configStandalonePages.includes(currentPageName)) {
            const userRolesAll = await base44.entities.TenantUserRole.filter({ user_id: user.id });
            const hasAnyAdminRole = userRolesAll.some(r => r.roles?.includes("admin"));
            if (hasAnyAdminRole) {
              setHasAccess(true);
              sessionStorage.setItem('layout_access_checked', 'true');
              setCheckingAccess(false);
              return;
            }
          }
          
          // Tenant admins can access NavigationManager with tenant context
          if (currentPageName === "NavigationManager" && tenantSlug) {
            const tenants = await base44.entities.Tenant.filter({ slug: tenantSlug });
            if (tenants.length > 0) {
              const tenant = tenants[0];
              const roles = await base44.entities.TenantUserRole.filter({ 
                tenant_id: tenant.id, 
                user_id: user.id 
              });
              if (roles.length > 0 && roles[0]?.roles?.includes("admin")) {
                setCurrentTenant(tenant);
                setUserRoles(roles[0].roles);
                setIsTenantAdmin(true);
                setHasAccess(true);
                sessionStorage.setItem('layout_access_checked', 'true');
                setCheckingAccess(false);
                return;
              }
            }
          }
          
          setHasAccess(false);
          setAccessDeniedReason("not_global_admin");
          setCheckingAccess(false);
          return;
        }
        
        // Tenant pages: need tenant slug and access to that tenant
        if (isTenantPage) {
          if (!tenantSlug) {
            setHasAccess(false);
            setAccessDeniedReason("no_tenant");
            setCheckingAccess(false);
            return;
          }
          
          const tenants = await base44.entities.Tenant.filter({ slug: tenantSlug });
          if (tenants.length === 0) {
            setHasAccess(false);
            setAccessDeniedReason("tenant_not_found");
            setCheckingAccess(false);
            return;
          }
          
          const tenant = tenants[0];
          
          // Global admins have access to all tenants
          if (user.is_global_admin === true) {
            setCurrentTenant(tenant);
            setUserRoles(["admin"]);
            setIsTenantAdmin(true);
            setHasAccess(true);
            setCheckingAccess(false);
            return;
          }
          
          // Check tenant-specific access
          const roles = await base44.entities.TenantUserRole.filter({ 
            tenant_id: tenant.id, 
            user_id: user.id 
          });
          
          if (roles.length === 0) {
            setHasAccess(false);
            setAccessDeniedReason("no_tenant_access");
            setCheckingAccess(false);
            return;
          }
          
          setCurrentTenant(tenant);
          const userRoleList = roles[0]?.roles || [];
          setUserRoles(userRoleList);
          setIsTenantAdmin(userRoleList.includes("admin"));
          setHasAccess(true);
          sessionStorage.setItem('layout_access_checked', 'true');
          setCheckingAccess(false);
          return;
        }
        
        // Page not in any category - global admins still get access
        if (user.is_global_admin === true) {
          setHasAccess(true);
          sessionStorage.setItem('layout_access_checked', 'true');
          setCheckingAccess(false);
          return;
        }

        setHasAccess(false);
        setAccessDeniedReason("unknown_page");
        setCheckingAccess(false);
      } catch (e) {
        console.error("Access check error:", e);
        setHasAccess(false);
        setAccessDeniedReason("error");
        setCheckingAccess(false);
      }
    };

    checkAccess();
    
    // Cleanup event listeners
    return () => {
      window.removeEventListener('ui-preferences-changed', handlePreferencesChange);
      window.removeEventListener('site-settings-changed', handleSiteSettingsChange);
    };
    }, [currentPageName]);

  // Pages without layout wrapper (TenantAccess, Setup, ClientOnboardingPortal render without chrome)
  if (currentPageName === "TenantAccess" || currentPageName === "Setup" || currentPageName === "ClientOnboardingPortal") {
    return <>{children}</>;
  }

  // Public pages - render without full chrome for unauthenticated users
  if (publicPages.includes(currentPageName) && !hasAccess && !checkingAccess) {
    return <div className="min-h-screen bg-[var(--color-background)]">{children}</div>;
  }

  if (fullscreenPages.includes(currentPageName)) {
    const fullscreenContextValue = {
      tenant: currentTenant,
      tenantId: currentTenant?.id,
      tenantSlug: currentTenant?.slug,
      tenantName: currentTenant?.name,
      userRoles,
      isGlobalAdmin,
      isTenantAdmin,
    };
    return (
      <TenantContext.Provider value={fullscreenContextValue}>
        <EditModeProvider>
          <div className="min-h-screen">
            <LiveEditWrapper>{children}</LiveEditWrapper>
          </div>
          <PageSettingsPanel currentPageName={currentPageName} />
          <PageUIPanel currentPageName={currentPageName} />
          <GlobalAIAssistant />
        </EditModeProvider>
      </TenantContext.Provider>
    );
  }

  // Show loading while checking
  if (checkingAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Redirect to TenantAccess if no access (but not while still checking)
  if (!hasAccess && !checkingAccess) {
    const accessUrl = createPageUrl("TenantAccess");
    if (tenantSlug) {
      window.location.href = accessUrl + (accessUrl.includes("?") ? "&" : "?") + `tenant=${tenantSlug}`;
    } else {
      window.location.href = accessUrl;
    }
    return null;
  }

  const tenantContextValue = {
    tenant: currentTenant,
    tenantId: currentTenant?.id,
    tenantSlug: currentTenant?.slug,
    tenantName: currentTenant?.name,
    userRoles,
    isGlobalAdmin,
    isTenantAdmin,
  };

  const maxWidth = (siteSettings?.maxWidth && String(siteSettings.maxWidth)) || "1400";
  const contentAlignment = (siteSettings?.contentAlignment && String(siteSettings.contentAlignment)) || "center";
  const backgroundImage = siteSettings?.backgroundImage && String(siteSettings.backgroundImage);

  return (
    <ErrorBoundary>
      <WebVitals />
      <TenantContext.Provider value={tenantContextValue}>
        <link rel="stylesheet" href="https://use.typekit.net/iwm1gcu.css" />
        <style dangerouslySetInnerHTML={{ __html: cssVariables }} />
        <EditModeProvider>
        <SidebarProvider>
          <TopEditorPanel 
            isOpen={editorPanelOpen} 
            onClose={() => setEditorPanelOpen(false)} 
            onViewModeChange={(mode) => {
              // Track view mode for layout adjustment
            }}
          />
          <div 
            data-editor-layout 
            className="px-2 sm:px-0"
            style={{ 
              marginTop: editorPanelOpen ? '120px' : '0', 
              transition: 'margin-top 300ms ease-in-out',
              position: 'relative',
            }}
            >
            {backgroundImage && (
              <div 
                className="fixed inset-0 z-0 pointer-events-none"
                style={{
                  backgroundImage: `url(${backgroundImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  opacity: 0.15,
                }}
              />
            )}
            <div 
              className="relative z-10"
              style={{
                maxWidth: `${maxWidth}px`,
                marginLeft: contentAlignment === 'center' ? 'auto' : '0',
                marginRight: contentAlignment === 'center' ? 'auto' : '0',
                marginRight: contentAlignment === 'right' ? '0' : (contentAlignment === 'center' ? 'auto' : '0'),
              }}
            >
              <AppShell user={currentUser} tenant={currentTenant} navItems={navItems} currentPageName={currentPageName}>
                <LiveEditWrapper>{children}</LiveEditWrapper>
              </AppShell>
            </div>
          </div>
          <PageSettingsPanel currentPageName={currentPageName} />
          <GlobalAIAssistant />

          {/* Editor bubble button */}
          {showEditorBubble && (
            <Button
              onClick={async () => {
                const newState = !editorPanelOpen;
                setEditorPanelOpen(newState);
                // Toggle live edit mode
                try {
                  const user = await base44.auth.me();
                  await base44.auth.updateMe({
                    ui_preferences: {
                      ...(user.ui_preferences || {}),
                      liveEditMode: newState
                    }
                  });
                  window.dispatchEvent(new CustomEvent('ui-preferences-changed', { 
                    detail: { liveEditMode: newState } 
                  }));
                } catch (e) {
                  console.error("Failed to toggle live edit:", e);
                }
              }}
              className="fixed bottom-6 left-6 h-14 w-14 rounded-full shadow-2xl bg-secondary text-white hover:bg-secondary/90 border-2 border-white z-[60]"
              title="Toggle Editor Panel"
            >
              {editorPanelOpen ? "✕" : <Palette className="h-6 w-6" />}
            </Button>
          )}
        </SidebarProvider>
        </EditModeProvider>
        </TenantContext.Provider>
        </ErrorBoundary>
        );
        }