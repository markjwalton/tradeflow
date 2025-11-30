import React, { useEffect, useState, createContext, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { 
  Home, 
  Navigation, 
  Building2, 
  RefreshCw,
  ChevronDown,
  Loader2,
  LogOut,
  User,
  Shield,
  Package,
  GitBranch,
  Database,
  Layout as LayoutIcon,
  Zap,
  Workflow
} from "lucide-react";

// Tenant Context
export const TenantContext = createContext(null);
export const useTenant = () => useContext(TenantContext);

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// Global admin pages - only for is_global_admin users
const globalAdminPages = [
  { name: "Mind Map Editor", slug: "MindMapEditor", icon: GitBranch },
  { name: "Generated Apps", slug: "GeneratedApps", icon: Package },
  { name: "Entity Library", slug: "EntityLibrary", icon: Database },
  { name: "Page Library", slug: "PageLibrary", icon: LayoutIcon },
  { name: "Feature Library", slug: "FeatureLibrary", icon: Zap },
  { name: "Template Library", slug: "TemplateLibrary", icon: Package },
  { name: "Business Templates", slug: "BusinessTemplates", icon: Building2 },
  { name: "Workflow Library", slug: "WorkflowLibrary", icon: Workflow },
  { name: "Workflow Designer", slug: "WorkflowDesigner", icon: Workflow },
  { name: "Form Templates", slug: "FormTemplates", icon: LayoutIcon },
  { name: "Form Builder", slug: "FormBuilder", icon: LayoutIcon },
  { name: "Checklist Templates", slug: "ChecklistTemplates", icon: LayoutIcon },
  { name: "Checklist Builder", slug: "ChecklistBuilder", icon: LayoutIcon },
  { name: "System Specification", slug: "SystemSpecification", icon: Package },

  { name: "Tenant Manager", slug: "TenantManager", icon: Building2 },
  { name: "Navigation Manager", slug: "NavigationManager", icon: Navigation },
  { name: "Package Library", slug: "PackageLibrary", icon: Package },
];

// Pages that don't require tenant context but need to preserve query params
const standalonePages = ["MindMapEditor", "GeneratedApps", "EntityLibrary", "PageLibrary", "FeatureLibrary", "PackageLibrary", "TenantManager", "BusinessTemplates", "WorkflowLibrary", "WorkflowDesigner", "FormTemplates", "FormBuilder", "ChecklistTemplates", "ChecklistBuilder"];

// Tenant pages - for users with tenant access
const tenantPages = [];

// Tenant admin pages - for users with admin role in a tenant
const tenantAdminPages = [
  { name: "Navigation Manager", slug: "NavigationManager", icon: Navigation },
];

export default function Layout({ children, currentPageName }) {
  const navigate = useNavigate();
  
  // No caching - always fetch fresh on mount
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessDeniedReason, setAccessDeniedReason] = useState(null);
  const [currentTenant, setCurrentTenant] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isGlobalAdmin, setIsGlobalAdmin] = useState(false);
  const [isTenantAdmin, setIsTenantAdmin] = useState(false);
  
  const urlParams = new URLSearchParams(window.location.search);
  const tenantSlug = urlParams.get("tenant");
  
  // Determine page type
  const isGlobalAdminPage = globalAdminPages.some(p => p.slug === currentPageName);
  const isTenantPage = tenantPages.some(p => p.slug === currentPageName);

  useEffect(() => {
    // Skip access check for public pages
    if (currentPageName === "TenantAccess" || currentPageName === "Setup") {
      if (checkingAccess) setCheckingAccess(false);
      if (!hasAccess) setHasAccess(true);
      return;
    }
    
    const checkAccess = async () => {
      try {
        const user = await base44.auth.me();
        if (!user) {
          setHasAccess(false);
          setAccessDeniedReason("not_logged_in");
          setCheckingAccess(false);
          return;
        }
        setCurrentUser(user);
        setIsGlobalAdmin(user.is_global_admin === true);
        
        // Global admin pages: for is_global_admin OR tenant admins (with tenant context)
        if (isGlobalAdminPage) {
          // Global admins always have access
          if (user.is_global_admin === true) {
            setHasAccess(true);
            setCheckingAccess(false);
            return;
          }
          
          // Standalone pages (MindMapEditor, PackageLibrary, TenantManager) - check if user has any tenant admin access
          if (standalonePages.includes(currentPageName)) {
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

  // Pages without layout wrapper
  if (currentPageName === "TenantAccess" || currentPageName === "Setup") {
    return <>{children}</>;
  }

  // Show loading while checking
  if (checkingAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
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

  // Build navigation based on context
  let displayPages = [];
  
  if (isGlobalAdminPage && !currentTenant) {
    // On global admin pages without tenant context, show global admin nav
    displayPages = globalAdminPages;
  } else if (currentTenant) {
    // On tenant pages, show tenant nav
    displayPages = [...tenantPages];
    // Tenant admins can access tenant admin pages
    if (isTenantAdmin) {
      displayPages = [...displayPages, ...tenantAdminPages];
    }
    // Global admins can access all admin pages
    if (isGlobalAdmin) {
      displayPages = [...tenantPages, ...globalAdminPages];
    }
  }

  const currentPage = displayPages.find(p => p.slug === currentPageName);
  const CurrentIcon = currentPage?.icon || Home;

  const handleRefresh = () => {
    window.location.reload();
  };

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
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <h1 className="text-lg font-bold">
            {isGlobalAdminPage ? "Admin Console" : (currentTenant?.name || "App")}
          </h1>
          <p className="text-xs text-slate-400">
            {isGlobalAdminPage ? "Global Administration" : "Tenant Portal"}
          </p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {displayPages.map((page) => {
            const Icon = page.icon;
            const isActive = currentPageName === page.slug;
            const isGlobalLink = globalAdminPages.some(p => p.slug === page.slug);
            // Preserve map param for MindMapEditor
                      let pageUrl = createPageUrl(page.slug);
                      if (page.slug === "MindMapEditor") {
                        const currentMap = new URLSearchParams(window.location.search).get("map");
                        if (currentMap) {
                          pageUrl = pageUrl + (pageUrl.includes("?") ? "&" : "?") + `map=${currentMap}`;
                        }
                      }
                      return (
                        <Link
                          key={page.slug}
                          to={pageUrl}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? "bg-slate-700 text-white" 
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {page.name}
              </Link>
            );
          })}
        </nav>
        
        {/* Global Admin indicator */}
        {isGlobalAdmin && (
          <div className="p-3 border-t border-slate-700">
            <div className="flex items-center gap-2 text-xs text-amber-400">
              <Shield className="h-3 w-3" />
              Global Admin
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-14 bg-white border-b flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            {/* Page Selector Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <CurrentIcon className="h-4 w-4" />
                  {currentPage?.name || "Select Page"}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {displayPages.map((page) => {
                  const Icon = page.icon;
                  const isGlobalLink = globalAdminPages.some(p => p.slug === page.slug);
                  const pageUrl = createPageUrl(page.slug);
                  return (
                    <DropdownMenuItem
                          key={page.slug}
                          onClick={() => {
                            // Preserve map param for MindMapEditor
                            let navUrl = pageUrl;
                            if (page.slug === "MindMapEditor") {
                              const currentMap = new URLSearchParams(window.location.search).get("map");
                              if (currentMap) {
                                navUrl = navUrl + (navUrl.includes("?") ? "&" : "?") + `map=${currentMap}`;
                              }
                            }
                            navigate(navUrl);
                          }}
                          className="gap-2"
                        >
                      <Icon className="h-4 w-4" />
                      {page.name}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center gap-3">
            {currentUser && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{currentUser.email}</span>
              </div>
            )}
            <Button variant="ghost" size="icon" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                const tenantAccessUrl = createPageUrl("TenantAccess");
                base44.auth.logout(window.location.origin + tenantAccessUrl);
              }}
              className="gap-2 text-gray-600"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 bg-gray-50 overflow-auto">
          {children}
        </main>
      </div>
    </div>
    </TenantContext.Provider>
  );
}