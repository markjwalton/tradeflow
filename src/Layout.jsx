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
import { EditModeProvider, useEditMode } from "@/components/page-builder/EditModeContext";
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

function LayoutContent({ children, currentPageName, currentUser, currentTenant, navItems, isFullscreenPage, publicPages, standalonePages, fullscreenPages, userRoles, isGlobalAdmin, isTenantAdmin, siteSettings }) {
  const { toggleEditMode } = useEditMode();
  const [editorPanelOpen, setEditorPanelOpen] = useState(false);
  const [editorViewMode, setEditorViewMode] = useState('full');
  const [showEditorBubble, setShowEditorBubble] = useState(true);

  useEffect(() => {
    const handlePreferencesChange = (event) => {
      setShowEditorBubble(event.detail.showEditorBubble ?? true);
    };

    window.addEventListener('ui-preferences-changed', handlePreferencesChange);
    return () => window.removeEventListener('ui-preferences-changed', handlePreferencesChange);
  }, []);

  const handleEditorToggle = () => {
    const newState = !editorPanelOpen;
    setEditorPanelOpen(newState);
    toggleEditMode();
  };

  if (isFullscreenPage) {
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
        <div className="min-h-screen">
          <LiveEditWrapper>{children}</LiveEditWrapper>

          {/* Exit fullscreen button */}
          <Button
            onClick={() => window.history.back()}
            variant="ghost"
            size="sm"
            className="fixed top-4 right-4 h-10 px-4 bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm border border-white/20"
            style={{ zIndex: 'var(--z-max)' }}
            title="Exit fullscreen"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back
          </Button>
        </div>
        <GlobalAIAssistant />
      </TenantContext.Provider>
    );
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
    <TenantContext.Provider value={tenantContextValue}>
      <link rel="stylesheet" href="https://use.typekit.net/iwm1gcu.css" />
      <style dangerouslySetInnerHTML={{ __html: cssVariables }} />
      <SidebarProvider>
        {editorPanelOpen && (
          <TopEditorPanel 
            isOpen={editorPanelOpen} 
            onClose={() => setEditorPanelOpen(false)} 
            onViewModeChange={setEditorViewMode}
          />
        )}
        <div 
          className="px-2 sm:px-0"
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
            style={{
              maxWidth: maxWidth === 'full' ? '100%' : `${maxWidth}px`,
              marginLeft: contentAlignment === 'center' ? 'auto' : (contentAlignment === 'right' ? 'auto' : '0'),
              marginRight: contentAlignment === 'center' ? 'auto' : (contentAlignment === 'right' ? '0' : 'auto'),
            }}
          >
            <AppShell 
              user={currentUser} 
              tenant={currentTenant} 
              navItems={navItems} 
              currentPageName={currentPageName}
              onEditorToggle={handleEditorToggle}
            >
              <LiveEditWrapper>{children}</LiveEditWrapper>
            </AppShell>
          </div>
        </div>
        <GlobalAIAssistant />

        {/* Editor bubble button - hide on fullscreen pages */}
        {showEditorBubble && !isFullscreenPage && (
          <button
            type="button"
            onClick={handleEditorToggle}
            className="fixed bottom-6 left-6 rounded-full bg-indigo-600 p-2 text-white shadow-2xl hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            style={{ zIndex: 'var(--z-max)' }}
            title="Toggle Editor Panel"
          >
            {editorPanelOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <Palette className="h-6 w-6" />
            )}
          </button>
        )}
      </SidebarProvider>
    </TenantContext.Provider>
  );
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
            
            // Use items from NavigationConfig - preserve ALL database fields including IDs
            if (loadedNavConfig.items?.length > 0) {
              loadedNavItems = loadedNavConfig.items
                .filter(item => item.is_visible !== false) // Only include visible items
                .map((item) => ({
                  // CRITICAL: Use database ID directly - never generate new IDs
                  id: item.id || item._id,
                  _id: item.id || item._id, // For backward compatibility
                  
                  // Core navigation fields
                  name: item.name,
                  slug: item.slug,
                  item_type: item.item_type,
                  page_url: item.slug,
                  
                  // Icon configuration
                  icon: item.icon,
                  icon_size: item.icon_size,
                  icon_stroke_width: item.icon_stroke_width,
                  
                  // Hierarchy and ordering
                  order: item.order,
                  parent_id: item.parent_id, // References database IDs
                  
                  // Display and behavior
                  is_visible: item.is_visible,
                  default_collapsed: item.default_collapsed,
                  tooltip_text: item.tooltip_text,
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

  const isFullscreenPage = fullscreenPages.includes(currentPageName);

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

  return (
    <ErrorBoundary>
      <WebVitals />
      <EditModeProvider>
        <LayoutContent 
          children={children}
          currentPageName={currentPageName}
          currentUser={currentUser}
          currentTenant={currentTenant}
          navItems={navItems}
          isFullscreenPage={isFullscreenPage}
          publicPages={publicPages}
          standalonePages={standalonePages}
          fullscreenPages={fullscreenPages}
          userRoles={userRoles}
          isGlobalAdmin={isGlobalAdmin}
          isTenantAdmin={isTenantAdmin}
          siteSettings={siteSettings}
        />
      </EditModeProvider>
    </ErrorBoundary>
  );
}