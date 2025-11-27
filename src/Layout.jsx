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

const pages = [
  { name: "Home", slug: "Home", icon: Home },
  { name: "Navigation Manager", slug: "NavigationManager", icon: Navigation },
  { name: "Tenant Manager", slug: "TenantManager", icon: Building2 },
];

export default function Layout({ children, currentPageName }) {
  const navigate = useNavigate();
  const [checkingAccess, setCheckingAccess] = useState(currentPageName !== "TenantAccess");
  const [hasAccess, setHasAccess] = useState(currentPageName === "TenantAccess");
  const [currentTenant, setCurrentTenant] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  
  const urlParams = new URLSearchParams(window.location.search);
  const tenantSlug = urlParams.get("tenant");

  useEffect(() => {
    // Skip access check for TenantAccess page
    if (currentPageName === "TenantAccess") {
      setCheckingAccess(false);
      setHasAccess(true);
      return;
    }
    
    const checkTenantAccess = async () => {
      try {
        const user = await base44.auth.me();
        if (!user) {
          setHasAccess(false);
          setCheckingAccess(false);
          return;
        }
        setCurrentUser(user);
        
        // If tenant slug provided, verify access to that tenant
        if (tenantSlug) {
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
        } else {
          // No tenant specified - check if user has access to any tenant (for admin pages)
          const userRolesAny = await base44.entities.TenantUserRole.filter({ user_id: user.id });
          setHasAccess(userRolesAny.length > 0);
        }
      } catch (e) {
        setHasAccess(false);
      }
      setCheckingAccess(false);
    };
    
    checkTenantAccess();
  }, [tenantSlug]);

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
    window.location.href = createPageUrl("TenantAccess");
    return null;
  }
  
  const currentPage = pages.find(p => p.slug === currentPageName) || pages[0];
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
          {pages.map((page) => {
            const Icon = page.icon;
            const isActive = currentPageName === page.slug;
            return (
              <Link
                key={page.slug}
                to={createPageUrl(page.slug)}
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
                {pages.map((page) => {
                  const Icon = page.icon;
                  return (
                    <DropdownMenuItem
                      key={page.slug}
                      onClick={() => navigate(createPageUrl(page.slug))}
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
                            onClick={() => base44.auth.logout(window.location.origin + createPageUrl("TenantAccess"))}
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