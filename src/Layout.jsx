import React, { useEffect, useState, createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import "./globals.css";
import { Button } from "@/components/ui/button";
// DISABLED: Prefetching was causing excessive network requests
// import { prefetchOnIdle, prefetchDashboardQueries, prefetchLibraryQueries } from "@/components/common/queryPrefetch";

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
// Sentry disabled - no DSN configured
// import { initializeSentry, setUserContext } from "@/components/common/sentryConfig";

function LayoutContent({ children, currentPageName, currentUser, currentTenant, navItems, isFullscreenPage, publicPages, standalonePages, fullscreenPages, userRoles, isGlobalAdmin, isTenantAdmin, siteSettings }) {
  const { toggleEditMode } = useEditMode();
  const [editorPanelOpen, setEditorPanelOpen] = useState(false);
  const [editorViewMode, setEditorViewMode] = useState('full');
  const [showEditorBubble, setShowEditorBubble] = useState(true);
  const [showPageProperties, setShowPageProperties] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(true);

  useEffect(() => {
    const handlePreferencesChange = (event) => {
      setShowEditorBubble(event.detail.showEditorBubble ?? true);
      setShowPageProperties(event.detail.showPageProperties ?? false);
      setShowAIAssistant(event.detail.showAIAssistant ?? true);
    };

    const loadPreferences = async () => {
      try {
        const user = await base44.auth.me();
        if (user?.ui_preferences) {
          setShowEditorBubble(user.ui_preferences.showEditorBubble ?? true);
          setShowPageProperties(user.ui_preferences.showPageProperties ?? false);
          setShowAIAssistant(user.ui_preferences.showAIAssistant ?? true);
        }
      } catch (e) {
        // User not logged in
      }
    };
    
    loadPreferences();
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

        {/* Tools bubble buttons - hide on fullscreen pages */}
        {!isFullscreenPage && (showEditorBubble || showPageProperties || showAIAssistant) && (
          <div 
            className="fixed bottom-6 left-6 flex flex-col-reverse gap-2"
            style={{ zIndex: 'var(--z-max)' }}
          >
            {showEditorBubble && (
              <button
                type="button"
                onClick={handleEditorToggle}
                className="rounded-[var(--radius-full)] bg-[var(--color-primary)] p-3 text-[var(--color-primary-foreground)] shadow-[var(--shadow-2xl)] hover:bg-[var(--primary-600)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
                title="Page Editor"
              >
                {editorPanelOpen ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <Palette className="h-5 w-5" />
                )}
              </button>
            )}
          </div>
        )}
      </SidebarProvider>
    </TenantContext.Provider>
  );
}

// Cache key for session-level caching
const LAYOUT_CACHE_KEY = 'layout_init_cache';
const LAYOUT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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
    // Check if we already ran init recently (session cache)
    const cachedInit = sessionStorage.getItem(LAYOUT_CACHE_KEY);
    const skipHeavyInit = cachedInit && (Date.now() - parseInt(cachedInit)) < LAYOUT_CACHE_TTL;

    const handleSiteSettingsChange = (event) => {
      setSiteSettings(event.detail);
      if (event.detail?.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    window.addEventListener('site-settings-changed', handleSiteSettingsChange);

    const checkAccess = async () => {
      try {
        // OPTIMIZATION: Fetch user first - we need it for everything
        let user = null;
        try {
          user = await base44.auth.me();
        } catch (e) {
          // Not logged in - continue with public page check
        }

        // Apply user settings immediately if available (no extra API call)
        if (user) {
          setCurrentUser(user);
          setIsGlobalAdmin(user.is_global_admin === true);
          
          // Apply site settings from user object (already fetched)
          if (user.site_settings) {
            setSiteSettings(user.site_settings);
            if (user.site_settings.darkMode) {
              document.documentElement.classList.add('dark');
            }
          }
        }

        // OPTIMIZATION: Only fetch nav config once, cache in session
        let loadedNavConfig = null;
        let loadedNavItems = [];
        
        const cachedNavConfig = sessionStorage.getItem('nav_config_cache');
        if (cachedNavConfig && skipHeavyInit) {
          try {
            const parsed = JSON.parse(cachedNavConfig);
            loadedNavConfig = parsed.config;
            loadedNavItems = parsed.items;
            setNavConfig(loadedNavConfig);
            setNavItems(loadedNavItems);
          } catch (e) {
            sessionStorage.removeItem('nav_config_cache');
          }
        }
        
        if (!loadedNavConfig) {
          try {
            const navConfigs = await base44.entities.NavigationConfig.filter({ config_type: "admin_console" });
            if (navConfigs.length > 0) {
              loadedNavConfig = navConfigs[0];
              setNavConfig(loadedNavConfig);
              
              if (loadedNavConfig.items?.length > 0) {
                loadedNavItems = loadedNavConfig.items
                  .filter(item => item.is_visible !== false)
                  .map((item) => ({
                    id: item.id || item._id,
                    _id: item.id || item._id,
                    name: item.name,
                    slug: item.slug,
                    item_type: item.item_type,
                    page_url: item.slug,
                    icon: item.icon,
                    order: item.order,
                    parent_id: item.parent_id,
                    is_visible: item.is_visible,
                    default_collapsed: item.default_collapsed,
                  }));
                setNavItems(loadedNavItems);
                
                // Cache for session
                sessionStorage.setItem('nav_config_cache', JSON.stringify({
                  config: loadedNavConfig,
                  items: loadedNavItems
                }));
              }
            }
          } catch (e) {
            console.error("Nav config error:", e);
          }
        }
        
        const configPublicPages = loadedNavConfig?.public_pages || ["TenantAccess", "Setup", "Dashboard"];
        
        // Public pages - allow immediately
        if (configPublicPages.includes(currentPageName)) {
          setCheckingAccess(false);
          setHasAccess(true);
          sessionStorage.setItem(LAYOUT_CACHE_KEY, Date.now().toString());
          return;
        }
    
        if (!user) {
          setHasAccess(false);
          setAccessDeniedReason("not_logged_in");
          setCheckingAccess(false);
          return;
        }
        
        const configStandalonePages = loadedNavConfig?.standalone_pages || [];
        const isAdminPage = loadedNavItems.some(item => item.page_url === currentPageName) || configStandalonePages.includes(currentPageName);
        
        // Global admins always have access
        if (user.is_global_admin === true) {
          setHasAccess(true);
          setCheckingAccess(false);
          sessionStorage.setItem(LAYOUT_CACHE_KEY, Date.now().toString());
          return;
        }
        
        // Admin page access check
        if (isAdminPage) {
          // Standalone pages - check tenant admin access
          if (configStandalonePages.includes(currentPageName)) {
            const userRolesAll = await base44.entities.TenantUserRole.filter({ user_id: user.id });
            const hasAnyAdminRole = userRolesAll.some(r => r.roles?.includes("admin"));
            if (hasAnyAdminRole) {
              setHasAccess(true);
              setCheckingAccess(false);
              sessionStorage.setItem(LAYOUT_CACHE_KEY, Date.now().toString());
              return;
            }
          }
          
          // Tenant-specific NavigationManager access
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
                setCheckingAccess(false);
                sessionStorage.setItem(LAYOUT_CACHE_KEY, Date.now().toString());
                return;
              }
            }
          }
          
          setHasAccess(false);
          setAccessDeniedReason("not_global_admin");
          setCheckingAccess(false);
          return;
        }
        
        // Tenant pages
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
          setCheckingAccess(false);
          sessionStorage.setItem(LAYOUT_CACHE_KEY, Date.now().toString());
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
    
    return () => {
      window.removeEventListener('site-settings-changed', handleSiteSettingsChange);
    };
  }, []); // Run once on mount

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
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--text-muted)]" />
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