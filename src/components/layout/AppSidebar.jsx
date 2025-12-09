import { cn } from "@/lib/utils";
import { useAppSidebar } from "./SidebarContext";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, ChevronRight, Folder, FolderOpen, Home, Building2, Users, Settings, Package, LayoutDashboard, Navigation, Shield, GitBranch, Database } from "lucide-react";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  // Start with all folders collapsed (empty set)
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

  const renderNavItem = (item, isChild = false, isTopLevel = false) => {
    const isFolder = item.item_type === "folder";
    const Icon = getIcon(item.icon);
    const isExpanded = expandedFolders.has(item.id);

    // Build page URL from page_url field
    const pageUrl = item.page_url || "";
    const currentPath = location.pathname.split("/").pop();
    const itemPath = pageUrl.split("?")[0];
    const isActive = currentPath === itemPath;

    // Debug: Log item type and color
    console.log(`Item: ${item.name}, Type: ${item.item_type}, isFolder: ${isFolder}`);

    if (isFolder) {
      const hasChildren = item.children && item.children.length > 0;
      return (
        <div key={item.id} className={isExpanded && showLabels ? "bg-sidebar-accent [border-radius:var(--radius-lg)] [margin-bottom:var(--spacing-1)]" : ""}>
          <button
            onClick={() => toggleFolder(item.id)}
            className={cn(
              "w-full flex items-center transition-colors text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              showLabels ? "[gap:var(--spacing-3)] [padding-left:var(--spacing-3)] [padding-right:var(--spacing-3)] [padding-top:var(--spacing-2)] [padding-bottom:var(--spacing-2)] [border-radius:var(--radius-lg)]" : "justify-center [padding:var(--spacing-3)] [border-radius:var(--radius-lg)]",
              isExpanded && "text-sidebar-foreground"
            )}
          >
            {hasChildren && showLabels && (
              isExpanded ? <ChevronDown className="h-4 w-4 text-sidebar-foreground/50" /> : <ChevronRight className="h-4 w-4 text-sidebar-foreground/50" />
            )}
            {isExpanded ? (
              <FolderOpen className="h-5 w-5" style={{ color: 'var(--secondary-400)' }} />
            ) : (
              <Folder className="h-5 w-5" style={{ color: 'var(--secondary-400)' }} />
            )}
            {showLabels && <span className="flex-1 text-left">{item.name}</span>}
          </button>
          {isExpanded && hasChildren && showLabels && (
            <div className="[padding-bottom:var(--spacing-2)] [gap:var(--spacing-1)] [padding-left:var(--spacing-3)] flex flex-col">
              {item.children.map((child) => renderNavItem(child, true, false))}
            </div>
          )}
        </div>
      );
    }

    const ChildIcon = getIcon(item.icon);
    
    // Build proper page URL - handle both slugs and full paths
    const fullPageUrl = pageUrl.startsWith("/") ? pageUrl : `/page/${pageUrl.split("?")[0]}${pageUrl.includes("?") ? "?" + pageUrl.split("?")[1] : ""}`;
    
    const linkContent = (
      <Link
        key={item.id}
        to={fullPageUrl}
        className={cn(
          "flex items-center [border-radius:var(--radius-lg)] transition-colors",
          showLabels 
            ? (isChild ? "[gap:var(--spacing-2)] [padding-left:var(--spacing-2)] [padding-right:var(--spacing-2)] [padding-top:var(--spacing-2)] [padding-bottom:var(--spacing-2)]" : "[gap:var(--spacing-3)] [padding-left:var(--spacing-3)] [padding-right:var(--spacing-3)] [padding-top:var(--spacing-2)] [padding-bottom:var(--spacing-2)]") 
            : "justify-center [padding:var(--spacing-3)]",
          isActive
            ? "bg-sidebar-primary text-sidebar-primary-foreground"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
        )}
      >
        <ChildIcon className={cn("h-5 w-5 flex-shrink-0", iconColorClass)} />
        {showLabels && <span className="truncate text-sm">{item.name}</span>}
      </Link>
    );
    
    if (!showLabels) {
      return (
        <Tooltip key={item.id}>
          <TooltipTrigger asChild>
            {linkContent}
          </TooltipTrigger>
          <TooltipContent side="right">
            {item.name}
          </TooltipContent>
        </Tooltip>
      );
    }
    
    return linkContent;
  };

  // Flatten navigation for icon mode
  const getFlattenedItems = (items) => {
    const flattened = [];
    const flatten = (itemList) => {
      itemList.forEach((item) => {
        if (item.item_type === "page") {
          flattened.push(item);
        }
        if (item.children && item.children.length > 0) {
          flatten(item.children);
        }
      });
    };
    flatten(items);
    return flattened;
  };

  const itemsToRender = showLabels ? navItems : getFlattenedItems(navItems);

  return (
    <aside
      className={cn(
        "hidden lg:flex lg:flex-col lg:h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-[width] duration-300 ease-in-out",
        isHidden && "lg:w-0",
        !isHidden && widthClass
      )}
    >
      {mode !== "hidden" && (
        <TooltipProvider delayDuration={300}>
          <nav className={cn(
            "flex-1 overflow-y-auto",
            showLabels ? "[padding:var(--spacing-3)] [gap:var(--spacing-1)]" : "[padding-top:var(--spacing-3)] [padding-bottom:var(--spacing-3)] [gap:var(--spacing-2)]",
            "flex flex-col"
          )}>
            {itemsToRender.map((item) => renderNavItem(item, false, !item.parent_id))}
          </nav>
        </TooltipProvider>
      )}
    </aside>
  );
}