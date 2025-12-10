import { cn } from "@/lib/utils";
import { useAppSidebar } from "./SidebarContext";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, ChevronRight, Folder, FolderOpen, Home } from "lucide-react";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { createPageUrl } from "@/utils";
import { getIconByName } from "@/components/navigation/NavIconMap";

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
    return getIconByName(iconName, Home);
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
    const iconSize = item.icon_size || 20;
    const iconStrokeWidth = item.icon_stroke_width || 2;

    // Build page URL from page_url field
    const pageUrl = item.page_url || "";
    const currentPath = location.pathname.split("/").pop();
    const itemPath = pageUrl.split("?")[0];
    const isActive = currentPath === itemPath;

    if (isFolder) {
      const hasChildren = item.children && item.children.length > 0;
      const childActive = isChildActive(item);
      const FolderIcon = item.icon ? getIcon(item.icon) : (isExpanded ? FolderOpen : Folder);

      // In icon mode, folders show single icon with active state if child is active
      if (isIconsOnly) {
        const folderButton = (
          <button
            onClick={() => toggleFolder(item.id)}
            className={cn(
              "w-full flex items-center justify-center transition-colors group",
              "[padding:var(--spacing-3)] [border-radius:var(--radius-lg)]",
              childActive ? "bg-sidebar-primary" : "hover:bg-sidebar-accent"
            )}
          >
            <FolderIcon 
              className="transition-colors" 
              size={iconSize}
              strokeWidth={iconStrokeWidth}
              style={{ color: childActive ? 'var(--sidebar-primary-foreground)' : 'var(--secondary-400)' }}
            />
          </button>
        );
        
        return (
          <div key={item.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                {folderButton}
              </TooltipTrigger>
              <TooltipContent side="right" className="text-base [padding:var(--spacing-3)]">
                {item.tooltip_text || item.name}
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
            <FolderIcon size={iconSize} strokeWidth={iconStrokeWidth} style={{ color: 'var(--secondary-400)' }} />
            <span className={cn("flex-1 text-left", !item.parent_id && "font-medium")}>{item.name}</span>
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
    
    // Build proper page URL using createPageUrl
    const pageName = pageUrl.split("?")[0];
    const queryString = pageUrl.includes("?") ? pageUrl.split("?")[1] : "";
    const fullPageUrl = createPageUrl(pageName) + (queryString ? `?${queryString}` : "");

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
        <ChildIcon 
          className="flex-shrink-0 transition-colors"
          size={iconSize}
          strokeWidth={iconStrokeWidth}
          style={{ color: isActive ? 'var(--sidebar-primary-foreground)' : 'var(--primary-600)' }}
        />
        {showLabels && <span className={cn("truncate", isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/70", isTopLevel && "font-medium")}>{item.name}</span>}
      </Link>
    );
    
    if (!showLabels) {
      return (
        <Tooltip key={item.id}>
          <TooltipTrigger asChild>
            {linkContent}
          </TooltipTrigger>
          <TooltipContent side="right" className="text-base [padding:var(--spacing-3)]">
            {item.tooltip_text || item.name}
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
            "hidden lg:flex lg:flex-col bg-card text-sidebar-foreground border border-border rounded-xl shadow-sm transition-[width] duration-300 ease-in-out overflow-hidden",
            isHidden && "lg:w-0",
            !isHidden && widthClass
          )}
        >
        {mode !== "hidden" && (
          <TooltipProvider delayDuration={300}>
            <nav className={cn(
              "flex-1",
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