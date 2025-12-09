import { cn } from "@/lib/utils";
import { useAppSidebar } from "./SidebarContext";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, ChevronRight, Folder, FolderOpen, Home, Building2, Users, Settings, Package, LayoutDashboard, Navigation, Shield, GitBranch, Database } from "lucide-react";
import { useState } from "react";

const iconMap = {
  Home,
  Building2,
  Users,
  Settings,
  Package,
  LayoutDashboard,
  Folder,
  FolderOpen,
  Navigation: LayoutDashboard,
  Shield: Settings,
  GitBranch: Package,
  Database: Package,
  Layout: LayoutDashboard,
  Zap: Package,
  Workflow: Package,
  Lightbulb: Package,
  Globe: Package,
  Key: Settings,
  Gauge: LayoutDashboard,
  BookOpen: Package,
  FlaskConical: Package,
  Palette: Package,
  Sparkles: Package,
  Type: Package,
  MousePointer: Package,
  Square: Package,
  FormInput: Package,
  BarChart3: LayoutDashboard,
  Bell: Package,
  Upload: Package,
  File: Package,
  Eye: Package,
};

export function AppSidebar({ navItems = [] }) {
  const { mode, isHidden } = useAppSidebar();
  const location = useLocation();
  const [expandedFolders, setExpandedFolders] = useState(new Set());

  const widthClass =
    mode === "expanded" ? "w-64" : mode === "icons" ? "w-16" : "w-0";

  const showLabels = mode === "expanded";

  const toggleFolder = (folderId) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) next.delete(folderId);
      else next.add(folderId);
      return next;
    });
  };

  const getIcon = (iconName) => {
    if (!iconName) return Home;
    return iconMap[iconName] || Home;
  };

  const renderNavItem = (item, isChild = false) => {
    const isFolder = item.item_type === "folder";
    const Icon = getIcon(item.icon);
    const isExpanded = expandedFolders.has(item.id);
    
    // Build page URL from page_url field
    const pageUrl = item.page_url || "";
    const currentPath = location.pathname.split("/").pop();
    const itemPath = pageUrl.split("?")[0];
    const isActive = currentPath === itemPath;

    if (isFolder) {
      const hasChildren = item.children && item.children.length > 0;
      return (
        <div key={item.id} className={isExpanded && showLabels ? "bg-white/5 rounded-lg mb-1" : ""}>
          <button
            onClick={() => toggleFolder(item.id)}
            className={cn(
              "w-full flex items-center transition-colors text-white/70 hover:bg-white/5 hover:text-white",
              showLabels ? "gap-3 px-3 py-2 rounded-lg" : "justify-center p-3 rounded-lg",
              isExpanded && "text-white"
            )}
          >
            {hasChildren && showLabels && (
              isExpanded ? <ChevronDown className="h-4 w-4 text-white/50" /> : <ChevronRight className="h-4 w-4 text-white/50" />
            )}
            {isExpanded ? (
              <FolderOpen className="h-5 w-5 text-[var(--color-secondary)]" />
            ) : (
              <Folder className="h-5 w-5 text-[var(--color-secondary)]" />
            )}
            {showLabels && <span className="flex-1 text-left">{item.name}</span>}
          </button>
          {isExpanded && hasChildren && showLabels && (
            <div className="pb-2 space-y-0.5 pl-3">
              {item.children.map((child) => renderNavItem(child, true))}
            </div>
          )}
        </div>
      );
    }

    const ChildIcon = getIcon(item.icon);
    
    // Build proper page URL - handle both slugs and full paths
    const fullPageUrl = pageUrl.startsWith("/") ? pageUrl : `/page/${pageUrl.split("?")[0]}${pageUrl.includes("?") ? "?" + pageUrl.split("?")[1] : ""}`;
    
    return (
      <Link
        key={item.id}
        to={fullPageUrl}
        className={cn(
          "flex items-center rounded-lg transition-colors",
          showLabels ? (isChild ? "gap-2 px-2 py-2" : "gap-3 px-3 py-2") : "justify-center p-3",
          isActive
            ? "bg-white/10 text-white"
            : "text-white/70 hover:bg-white/5 hover:text-white"
        )}
      >
        <ChildIcon className="h-5 w-5 flex-shrink-0" />
        {showLabels && <span className="truncate text-sm">{item.name}</span>}
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        "hidden lg:flex lg:flex-col lg:h-full bg-[var(--color-midnight)] text-white border-r transition-[width] duration-300 ease-in-out",
        isHidden && "lg:w-0",
        !isHidden && widthClass
      )}
    >
      {mode !== "hidden" && (
        <nav className={cn(
          "flex-1 overflow-y-auto",
          showLabels ? "p-3 space-y-1" : "py-3 px-1 space-y-2"
        )}>
          {navItems.map((item) => renderNavItem(item))}
        </nav>
      )}
    </aside>
  );
}