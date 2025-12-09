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
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  
  const isIconsOnly = mode === "icons";

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

  // Check if any child is active
  const isChildActive = (item) => {
    if (!item.children || item.children.length === 0) return false;
    return item.children.some(child => {
      const childUrl = child.page_url || "";
      const childPath = childUrl.split("?")[0];
      const currentPath = location.pathname.split("/").pop();
      return currentPath === childPath;
    });
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

    if (isFolder) {
      const hasChildren = item.children && item.children.length > 0;
      const childActive = isChildActive(item);
      
      // In icon mode, folders show single icon with active state if child is active
      if (isIconsOnly) {
        const FolderIcon = isExpanded ? FolderOpen : Folder;
        const folderButton = (
          <button
            onClick={() => toggleFolder(item.id)}
            className={cn(
              "w-full flex items-center justify-center [padding:var(--spacing-3)] [border-radius:var(--radius-lg)] transition-colors group",
              childActive ? "bg-sidebar-primary" : "hover:bg-sidebar-accent"
            )}
          >
            <FolderIcon className={cn(
              "h-5 w-5 transition-colors",
              childActive 
                ? "[color:var(--sidebar-primary-foreground)]"
                : "[color:var(--secondary-400)] group-hover:[color:var(--sidebar-foreground)]"
            )} />
          </button>
        );
        
        return (
          <div key={item.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                {folderButton}
              </TooltipTrigger>
              <TooltipContent side="right">
                {item.name}
              </TooltipContent>
            </Tooltip>
            {isExpanded && hasChildren && (
              <div className="flex flex-col [gap:var(--spacing-1)] [margin-top:var(--spacing-1)]">
                {item.children.map((child) => renderNavItem(child, true, false))}
              </div>
            )}
          </div>
        );
      }
      
      // Expanded mode - folders are expandable
      return (
        <div key={item.id} className={isExpanded && showLabels ? "bg-sidebar-accent [border-radius:var(--radius-lg)] [margin-bottom:var(--spacing-1)]" : ""}>
          <button
            onClick={() => toggleFolder(item.id)}
            className={cn(
              "w-full flex items-center transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
              "[gap:var(--spacing-3)] [padding-left:var(--spacing-3)] [padding-right:var(--spacing-3)] [padding-top:var(--spacing-2)] [padding-bottom:var(--spacing-2)] [border-radius:var(--radius-lg)]",
              childActive ? "text-sidebar-foreground" : "text-sidebar-foreground/70",
              isExpanded && "text-sidebar-foreground"
            )}
          >
            {hasChildren && (
              isExpanded ? <ChevronDown className="h-4 w-4 text-sidebar-foreground/50" /> : <ChevronRight className="h-4 w-4 text-sidebar-foreground/50" />
            )}
            {isExpanded ? (
              <FolderOpen className="h-5 w-5 [color:var(--secondary-400)]" />
            ) : (
              <Folder className="h-5 w-5 [color:var(--secondary-400)]" />
            )}
            <span className="flex-1 text-left">{item.name}</span>
          </button>
          {isExpanded && hasChildren && (
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
          "flex items-center [border-radius:var(--radius-lg)] transition-colors group",
          showLabels 
            ? (isChild ? "[gap:var(--spacing-2)] [padding-left:var(--spacing-2)] [padding-right:var(--spacing-2)] [padding-top:var(--spacing-2)] [padding-bottom:var(--spacing-2)]" : "[gap:var(--spacing-3)] [padding-left:var(--spacing-3)] [padding-right:var(--spacing-3)] [padding-top:var(--spacing-2)] [padding-bottom:var(--spacing-2)]") 
            : "justify-center [padding:var(--spacing-3)]",
          isActive
            ? "bg-sidebar-primary"
            : "hover:bg-sidebar-accent"
        )}
      >
        <ChildIcon className={cn(
          "h-5 w-5 flex-shrink-0 transition-colors",
          isActive 
            ? "[color:var(--sidebar-primary-foreground)]" 
            : "[color:var(--primary-600)] group-hover:[color:var(--sidebar-foreground)]"
        )} />
        {showLabels && <span className={cn("truncate text-sm", isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/70")}>{item.name}</span>}
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

  // In icons-only mode, only show top-level items
  const itemsToRender = isIconsOnly 
    ? navItems.filter(item => !item.parent_id)
    : navItems;

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