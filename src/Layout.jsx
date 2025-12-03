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
  ChevronRight,
  Loader2,
  LogOut,
  User,
  Shield,
  Package,
  GitBranch,
  Database,
  Layout as LayoutIcon,
  Zap,
  Workflow,
  Settings,
  Lightbulb,
  Globe,
  Folder,
  FolderOpen,
  Menu,
  X
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
import GlobalAIAssistant from "@/components/ai-assistant/GlobalAIAssistant";
import NavigationBreadcrumb from "@/components/navigation/NavigationBreadcrumb";

// Global admin pages - only for is_global_admin users
import { BookOpen, FlaskConical, Key, Gauge } from "lucide-react";

import { LayoutDashboard } from "lucide-react";

const globalAdminPages = [
  { name: "Dashboard Manager", slug: "DashboardManager", icon: LayoutDashboard },
  { name: "CMS", slug: "CMSManager", icon: Globe },
  { name: "API Manager", slug: "APIManager", icon: Key },
  { name: "Security", slug: "SecurityMonitor", icon: Shield },
  { name: "Performance", slug: "PerformanceMonitor", icon: Gauge },
  { name: "Roadmap", slug: "RoadmapManager", icon: Lightbulb },
  { name: "Journal", slug: "RoadmapJournal", icon: Lightbulb },
  { name: "Sprints", slug: "SprintManager", icon: Lightbulb },
  { name: "Rule Book", slug: "RuleBook", icon: BookOpen },
  { name: "Playground", slug: "PlaygroundSummary", icon: FlaskConical },
  { name: "Test Data Manager", slug: "TestDataManager", icon: Database },
  { name: "Mind Map Editor", slug: "MindMapEditor", icon: GitBranch },
  { name: "ERD Editor", slug: "ERDEditor", icon: Database },
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
  { name: "Community Library", slug: "CommunityLibrary", icon: Package },
  { name: "Community Publish", slug: "CommunityPublish", icon: Package },
  { name: "Package Library", slug: "PackageLibrary", icon: Package },
  { name: "Prompt Settings", slug: "PromptSettings", icon: Settings },
  { name: "Lookup Test", slug: "LookupTestForms", icon: Key },
];

// Pages that don't require tenant context but need to preserve query params
const standalonePages = ["DashboardManager", "CMSManager", "APIManager", "SecurityMonitor", "PerformanceMonitor", "RoadmapManager", "RoadmapJournal", "SprintManager", "RuleBook", "PlaygroundSummary", "PlaygroundEntity", "PlaygroundPage", "PlaygroundFeature", "ConceptWorkbench", "TestDataManager", "LivePreview", "MindMapEditor", "GeneratedApps", "EntityLibrary", "PageLibrary", "FeatureLibrary", "PackageLibrary", "TenantManager", "BusinessTemplates", "WorkflowLibrary", "WorkflowDesigner", "FormTemplates", "FormBuilder", "ChecklistTemplates", "ChecklistBuilder", "PromptSettings", "LookupTestForms", "CommunityLibrary", "CommunityPublish"];

// Pages that render their own navigation (no layout sidebar)
const fullscreenPages = ["LivePreview"];

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
  const [customAdminNav, setCustomAdminNav] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  
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
        
        // Fetch custom admin nav config
        if (user.is_global_admin === true) {
          try {
            const navConfigs = await base44.entities.NavigationConfig.filter({ config_type: "admin_console" });
            if (navConfigs.length > 0 && navConfigs[0].items?.length > 0) {
              setCustomAdminNav(navConfigs[0].items);
            }
          } catch (e) {
            // Ignore errors, will use default nav
          }
        }
        
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

  // Fullscreen pages with their own navigation
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
        <div className="min-h-screen flex flex-col">
          {/* Minimal Top Bar */}
          <header className="h-14 bg-white border-b flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-gray-700">Admin Console</span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-500">{currentPageName}</span>
            </div>
            <div className="flex items-center gap-3">
              {currentUser && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{currentUser.email}</span>
                </div>
              )}
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
          <main className="flex-1 overflow-hidden">
            {children}
          </main>
          <GlobalAIAssistant />
        </div>
      </TenantContext.Provider>
    );
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
  
  // Icon map for custom nav items
  const iconMap = {
    Home, Navigation, Building2, Shield, Package, GitBranch, Database, 
    Layout: LayoutIcon, Zap, Workflow, Settings, Lightbulb, Globe, Key, Gauge, BookOpen, FlaskConical,
    Folder, FolderOpen, LayoutDashboard
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
    // Use _id if present, otherwise generate stable ID for folders
    const parentId = parentItem._id || 
      (parentItem.item_type === "folder" ? `folder_${parentItem.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}` : null);
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
      const isActive = currentPageName === item.slug;

      if (isFolder) {
        return (
          <div key={itemId} className={isExpanded && depth === 0 ? "bg-slate-800/50 rounded-lg mb-1" : ""}>
            <button
              onClick={() => toggleFolder(itemId)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-slate-300 hover:bg-slate-800 hover:text-white ${isExpanded ? "text-white" : ""}`}
            >
              {hasChildren ? (
                isExpanded ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />
              ) : (
                <div className="w-4" />
              )}
              {isExpanded ? <FolderOpen className="h-4 w-4 text-amber-400" /> : <Folder className="h-4 w-4 text-amber-400" />}
              <span className="flex-1 text-left">{item.name}</span>
            </button>
            {isExpanded && hasChildren && (
              <div className="ml-4 pb-2">
                {renderNavItems(children, allItems, depth + 1)}
              </div>
            )}
          </div>
        );
      }

      // Page item - child items get smaller styling
      const isChild = depth > 0;
      let pageUrl = createPageUrl(item.slug);
      if (item.slug === "MindMapEditor") {
        const currentMap = new URLSearchParams(window.location.search).get("map");
        if (currentMap) {
          pageUrl = pageUrl + (pageUrl.includes("?") ? "&" : "?") + `map=${currentMap}`;
        }
      }

      return (
        <Link
          key={itemId || item.slug}
          to={pageUrl}
          className={`flex items-center gap-2 px-3 rounded-lg transition-colors ${
            isChild ? "py-1.5 text-sm" : "py-2"
          } ${
            isActive
              ? "bg-slate-700 text-white"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          {!isChild && <Icon className="h-4 w-4 flex-shrink-0" />}
          <span className="truncate">{item.name}</span>
        </Link>
      );
    });
  };
  
  if (isGlobalAdminPage && !currentTenant) {
    // On global admin pages without tenant context, show global admin nav
    // Use custom nav if available, otherwise use default
    if (customAdminNav && customAdminNav.length > 0) {
      displayPages = customAdminNav
        .filter(item => item.is_visible !== false)
        .map(item => ({
          name: item.name,
          slug: item.slug,
          icon: iconMap[item.icon] || Home
        }));
    } else {
      displayPages = globalAdminPages;
    }
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
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {customAdminNav && customAdminNav.length > 0 ? (
            // Render hierarchical navigation from config
            renderNavItems(getTopLevelItems(customAdminNav), customAdminNav, 0)
          ) : (
            // Fallback to flat displayPages
            displayPages.map((page) => {
              const Icon = page.icon;
              const isActive = currentPageName === page.slug;
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
            })
          )}
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
          {customAdminNav && customAdminNav.length > 0 && (
            <div className="px-6 pt-4">
              <NavigationBreadcrumb 
                items={customAdminNav} 
                currentPageSlug={currentPageName}
                showHome={false}
              />
            </div>
          )}
          {children}
        </main>
      </div>

      {/* Global AI Assistant */}
      <GlobalAIAssistant />
    </div>
    </TenantContext.Provider>
  );
}