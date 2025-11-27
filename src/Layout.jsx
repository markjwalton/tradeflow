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
  User
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
} from "@/components/ui/dropdown-menu";

// Admin pages - no tenant context required
const adminPages = [
  { name: "Navigation Manager", slug: "NavigationManager", icon: Navigation },
  { name: "Tenant Manager", slug: "TenantManager", icon: Building2 },
];

// Tenant pages - require tenant context
const tenantPages = [
  { name: "Home", slug: "Home", icon: Home },
];

export default function Layout({ children, currentPageName }) {
  const navigate = useNavigate();
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [currentTenant, setCurrentTenant] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  
  const urlParams = new URLSearchParams(window.location.search);
  const tenantSlug = urlParams.get("tenant");
  
  // Determine if this is an admin page or tenant page
  const isAdminPage = adminPages.some(p => p.slug === currentPageName);
  const isTenantPage = tenantPages.some(p => p.slug === currentPageName);

  useEffect(() => {
    // Skip access check for TenantAccess page
    if (currentPageName === "TenantAccess") {
      setCheckingAccess(false);
      setHasAccess(true);
      return;
    }
    
    const checkAccess = async () => {
      try {
        const user = await base44.auth.me();
        if (!user) {
          setHasAccess(false);
          setCheckingAccess(false);
          return;
        }
        setCurrentUser(user);
        
        // Admin pages: just need to be logged in with any tenant access
        if (isAdminPage) {
          const userRolesAny = await base44.entities.TenantUserRole.filter({ user_id: user.id });
          setHasAccess(userRolesAny.length > 0);
          setCheckingAccess(false);
          return;
        }
        
        // Tenant pages: need tenant slug and access to that tenant
        if (isTenantPage) {
          if (!tenantSlug) {
            // No tenant specified - redirect to TenantAccess
            setHasAccess(false);
            setCheckingAccess(false);
            return;
          }
          
          const tenants = await base44.entities.Tenant.filter({ slug: tenantSlug });
          if (tenants.length === 0) {
            setHasAccess(false);
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
            setCheckingAccess(false);
            return;
          }
          
          setCurrentTenant(tenant);
          setUserRoles(roles[0]?.roles || []);
          setHasAccess(true);
        }
      } catch (e) {
        setHasAccess(false);
      }
      setCheckingAccess(false);
    };
    
    checkAccess();
  }, [tenantSlug, currentPageName, isAdminPage, isTenantPage]);

  // TenantAccess page - no layout
  if (currentPageName === "TenantAccess") {
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

  // Redirect to TenantAccess if no access
  if (!hasAccess) {
    const accessUrl = createPageUrl("TenantAccess");
    // Preserve tenant slug if present
    if (tenantSlug) {
      window.location.href = accessUrl + (accessUrl.includes("?") ? "&" : "?") + `tenant=${tenantSlug}`;
    } else {
      window.location.href = accessUrl;
    }
    return null;
  }

  // Determine which pages to show in nav based on context
  const displayPages = isAdminPage ? adminPages : (currentTenant ? [...tenantPages, ...adminPages] : tenantPages);
  const currentPage = displayPages.find(p => p.slug === currentPageName) || displayPages[0];
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
  };

  return (
    <TenantContext.Provider value={tenantContextValue}>
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <h1 className="text-lg font-bold">{currentTenant?.name || "App Architect"}</h1>
          <p className="text-xs text-slate-400">{currentTenant ? "Tenant Portal" : "Navigation Planner"}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {displayPages.map((page) => {
            const Icon = page.icon;
            const isActive = currentPageName === page.slug;
            // Admin pages don't need tenant param, tenant pages do
            const isAdminLink = adminPages.some(p => p.slug === page.slug);
            const pageUrl = isAdminLink 
              ? createPageUrl(page.slug) 
              : createPageUrl(page.slug) + (tenantSlug ? `?tenant=${tenantSlug}` : '');
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
                        const isAdminLink = adminPages.some(p => p.slug === page.slug);
                        const pageUrl = isAdminLink 
                          ? createPageUrl(page.slug) 
                          : createPageUrl(page.slug) + (tenantSlug ? `?tenant=${tenantSlug}` : '');
                        return (
                          <DropdownMenuItem
                            key={page.slug}
                            onClick={() => navigate(pageUrl)}
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
                            onClick={() => base44.auth.logout()}
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