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

  const renderNavItem = (item) => {
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
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-white/70 hover:bg-white/5 hover:text-white",
              isExpanded && "text-white"
            )}
          >
            {hasChildren && showLabels ? (
              isExpanded ? <ChevronDown className="h-4 w-4 text-white/50" /> : <ChevronRight className="h-4 w-4 text-white/50" />
            ) : (
              <div className="w-4" />
            )}
            {isExpanded ? (
              <FolderOpen className="h-4 w-4 text-[var(--color-secondary)]" />
            ) : (
              <Folder className="h-4 w-4 text-[var(--color-secondary)]" />
            )}
            {showLabels && <span className="flex-1 text-left">{item.name}</span>}
          </button>
          {isExpanded && hasChildren && showLabels && (
            <div className="pb-2 space-y-0.5">
              {item.children.map((child) => renderNavItem(child))}
            </div>
          )}
        </div>
      );
    }

    const ChildIcon = getIcon(item.icon);
    
    // Use createPageUrl for proper routing
    const fullPageUrl = pageUrl.startsWith("/") ? pageUrl : `/page/${pageUrl}`;
    
    return (
      <Link
        key={item.id}
        to={fullPageUrl}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
          isActive
            ? "bg-white/10 text-white"
            : "text-white/70 hover:bg-white/5 hover:text-white"
        )}
      >
        <ChildIcon className="h-4 w-4 flex-shrink-0" />
        {showLabels && <span className="truncate">{item.name}</span>}
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
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => renderNavItem(item))}
        </nav>
      )}
    </aside>
  );
}