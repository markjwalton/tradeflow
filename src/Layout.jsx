import React, { useEffect, useState, createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { cssVariables } from "@/components/library/designTokens";
import { Loader2 } from "lucide-react";

// Tenant Context
export const TenantContext = createContext(null);
export const useTenant = () => useContext(TenantContext);

import GlobalAIAssistant from "@/components/ai-assistant/GlobalAIAssistant";
import { AppShell } from "@/components/layout/AppShell";
import { SidebarProvider } from "@/components/layout/SidebarContext";

export default function Layout({ children, currentPageName }) {
  const navigate = useNavigate();
  
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
  
  const urlParams = new URLSearchParams(window.location.search);
  const tenantSlug = urlParams.get("tenant");
  
  const publicPages = navConfig?.public_pages || ["TenantAccess", "Setup", "Dashboard"];
  const standalonePages = navConfig?.standalone_pages || [];
  const fullscreenPages = navConfig?.fullscreen_pages || [];
  
  const isGlobalAdminPage = navItems.some(item => item.slug === currentPageName) || standalonePages.includes(currentPageName);
  const isTenantPage = false;

  useEffect(() => {
    const checkAccess = async () => {
      try {
        let loadedNavConfig = null;
        let loadedNavItems = [];
        try {
          const navConfigs = await base44.entities.NavigationConfig.filter({ config_type: "admin_console" });
          if (navConfigs.length > 0) {
            loadedNavConfig = navConfigs[0];
            setNavConfig(loadedNavConfig);
            if (loadedNavConfig.items?.length > 0) {
              loadedNavItems = loadedNavConfig.items;
              setNavItems(loadedNavItems);
            }
          }
        } catch (e) {
          // Ignore errors
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
        
        const configStandalonePages = loadedNavConfig?.standalone_pages || [];
        const isAdminPage = loadedNavItems.some(item => item.slug === currentPageName) || configStandalonePages.includes(currentPageName);
        
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
  }, []); // Empty deps - only run once on mount

  // Pages without layout wrapper (TenantAccess, Setup render without chrome)
  if (currentPageName === "TenantAccess" || currentPageName === "Setup") {
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
        <div className="min-h-screen">{children}</div>
        <GlobalAIAssistant />
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

  return (
    <TenantContext.Provider value={tenantContextValue}>
      <link rel="stylesheet" href="https://use.typekit.net/iwm1gcu.css" />
      <style dangerouslySetInnerHTML={{ __html: cssVariables }} />
      <SidebarProvider>
        <AppShell user={currentUser} tenant={currentTenant} navItems={navItems}>
          {children}
        </AppShell>
        <GlobalAIAssistant />
      </SidebarProvider>
    </TenantContext.Provider>
  );
}
    Home, Navigation, Building2, Shield, Package, GitBranch, Database, 
    Layout: LayoutIcon, Zap, Workflow, Settings, Lightbulb, Globe, Key, Gauge, BookOpen, FlaskConical,
    Folder, FolderOpen, LayoutDashboard,
    Palette, Sparkles, Type, MousePointer, Square, FormInput, BarChart3, Bell, Users, Upload, File, Eye
  };

  // Toggle folder expansion
  const toggleFolder = (folderId) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) next.delete(folderId);
      else next.add(folderId);
      return next;
    });
  };

  // Get children of a nav item - match parent_id against _id
  // Also generate stable _id for folders if missing (based on folder name)
  const getNavChildren = (parentItem, allItems) => {
    // Use _id if present, otherwise generate stable ID for folders based on name
    // Match the format used in parent_id: "folder_website", "folder_system_tools", etc.
    const parentId = parentItem._id || 
      (parentItem.item_type === "folder" ? `folder_${parentItem.name.toLowerCase().replace(/[\s-]+/g, '_').replace(/[^a-z0-9_]/g, '')}` : null);
    if (!parentId) return [];
    return allItems
      .filter(child => child.parent_id === parentId && child.is_visible !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  // Get top-level items
  const getTopLevelItems = (allItems) => {
    return allItems
      .filter(item => !item.parent_id && item.is_visible !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  // Recursive nav renderer
  const renderNavItems = (itemsToRender, allItems, depth = 0) => {
    return itemsToRender.map((item) => {
      const isFolder = item.item_type === "folder";
      // Use _id if present, otherwise generate stable ID for folders
      const itemId = item._id || 
        (isFolder ? `folder_${item.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}` : item.slug);
      const children = getNavChildren(item, allItems);
      const hasChildren = children.length > 0;
      const isExpanded = expandedFolders.has(itemId);
      const Icon = iconMap[item.icon] || (isFolder ? Folder : Home);
      // Handle slugs with query params for active state
      const slugForActive = item.slug?.split("?")[0] || "";
      const isActive = currentPageName === slugForActive;

      if (isFolder) {
        return (
          <div key={itemId} className={isExpanded && depth === 0 ? "bg-white/5 rounded-lg mb-1" : ""}>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFolder(itemId);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-white/70 hover:bg-white/5 hover:text-white ${isExpanded ? "text-white" : ""}`}
            >
              {hasChildren ? (
                isExpanded ? <ChevronDown className="h-4 w-4 text-white/50" /> : <ChevronRight className="h-4 w-4 text-white/50" />
              ) : (
                <div className="w-4" />
              )}
              {isExpanded ? <FolderOpen className="h-4 w-4 text-[var(--color-secondary)]" /> : <Folder className="h-4 w-4 text-[var(--color-secondary)]" />}
              <span className="flex-1 text-left">{item.name}</span>
            </button>
            {isExpanded && hasChildren && (
              <div className="pb-2 space-y-0.5">
                {renderNavItems(children, allItems, depth + 1)}
              </div>
            )}
          </div>
        );
      }

      // Page item - child items get smaller styling
      const isChild = depth > 0;
      // Handle slugs with query params (e.g., "ComponentShowcase?tab=tokens")
      const slugParts = item.slug?.split("?") || [""];
      const baseSlug = slugParts[0];
      const queryString = slugParts[1] || "";
      let pageUrl = createPageUrl(baseSlug);
      if (queryString) {
        pageUrl = pageUrl + (pageUrl.includes("?") ? "&" : "?") + queryString;
      }
      if (baseSlug === "MindMapEditor") {
        const currentMap = new URLSearchParams(window.location.search).get("map");
        if (currentMap) {
          pageUrl = pageUrl + (pageUrl.includes("?") ? "&" : "?") + `map=${currentMap}`;
        }
      }

      const handleNavClick = (e) => {
        e.preventDefault();
        navigate(pageUrl);
      };

      return (
        <div
          key={itemId || item.slug}
          onClick={handleNavClick}
          className={`flex items-center gap-2 px-3 rounded-lg transition-colors cursor-pointer ${
            isChild ? "py-1.5 text-sm ml-6" : "py-2"
          } ${
            isActive
              ? "bg-white/10 text-white"
              : "text-white/70 hover:bg-white/5 hover:text-white"
          }`}
        >
          {!isChild && <Icon className="h-4 w-4 flex-shrink-0" />}
          <span className="truncate">{item.name}</span>
        </div>
      );
    });
  };
  
  if (isGlobalAdminPage && !currentTenant) {
    // On global admin pages without tenant context, show global admin nav from config
    if (customAdminNav && customAdminNav.length > 0) {
      displayPages = customAdminNav
        .filter(item => item.is_visible !== false)
        .map(item => ({
          name: item.name,
          slug: item.slug,
          icon: iconMap[item.icon] || Home
        }));
    }
    // No fallback - if no nav config, displayPages stays empty
  } else if (currentTenant) {
    // On tenant pages, show tenant nav
    // Tenant admins can access tenant admin pages
    if (isTenantAdmin) {
      displayPages = [...tenantAdminPages];
    }
    // Global admins can access all admin pages from config
    if (isGlobalAdmin && customAdminNav) {
      displayPages = [...displayPages, ...customAdminNav
        .filter(item => item.is_visible !== false)
        .map(item => ({
          name: item.name,
          slug: item.slug,
          icon: iconMap[item.icon] || Home
        }))];
    }
  }

  const currentPage = displayPages.find(p => p.slug === currentPageName);
  const CurrentIcon = currentPage?.icon || Home;

  const handleRefresh = () => {
    window.location.reload();
  };