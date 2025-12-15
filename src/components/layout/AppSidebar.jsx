import { cn } from "@/lib/utils";
import { useAppSidebar } from "./SidebarContext";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, ChevronRight, Folder, FolderOpen, Home } from "lucide-react";
import { useState, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { createPageUrl } from "@/utils";
import { getIconByName } from "@/components/navigation/NavIconMap";
import { usePrefetchRoute } from "@/components/common/usePrefetchRoute";

export function AppSidebar({ navItems = [] }) {
  const { mode, isHidden } = useAppSidebar();
  const location = useLocation();
  const [expandedFolders, setExpandedFolders] = useState(new Set());

  // Build hierarchical structure from flat navItems
  const buildHierarchy = (items) => {
    if (!items || items.length === 0) return [];
    
    // CRITICAL: Normalize all IDs - database uses 'id', code uses '_id'
    const normalizedItems = items.map(item => {
      const itemId = item.id || item._id;
      return {
        ...item,
        id: itemId,
        _id: itemId,  // Ensure both exist
        parent_id: item.parent_id || null,
        children: []
      };
    });
    
    // Create a lookup map using the normalized ID
    const itemsMap = new Map();
    normalizedItems.forEach((item) => {
      itemsMap.set(item.id, item);
    });
    
    // Build parent-child relationships
    const rootItems = [];
    normalizedItems.forEach((item) => {
      if (item.parent_id && itemsMap.has(item.parent_id)) {
        // Has a valid parent - add to parent's children
        const parent = itemsMap.get(item.parent_id);
        parent.children.push(item);
      } else {
        // No parent or invalid parent - add to root
        rootItems.push(item);
      }
    });
    
    // Recursive sort function
    const sortItems = (items) => {
      items.sort((a, b) => (a.order || 0) - (b.order || 0));
      items.forEach(item => {
        if (item.children && item.children.length > 0) {
          sortItems(item.children);
        }
      });
    };
    sortItems(rootItems);
    
    // Debug log to verify hierarchy
    console.log('Root items with children:', rootItems.map(r => ({
      name: r.name,
      children: r.children.length
    })));
    
    return rootItems;
  };

  // Debug RAW navItems BEFORE building hierarchy
  console.log('RAW navItems received:', navItems.length, 'items');
  console.log('First 10 items:', navItems.slice(0, 10).map(i => ({
    id: i.id,
    name: i.name,
    parent_id: i.parent_id,
    item_type: i.item_type
  })));
  console.log('Items with parent_id:', navItems.filter(i => i.parent_id).map(i => ({
    id: i.id,
    name: i.name,
    parent_id: i.parent_id
  })));

  const hierarchicalNavItems = buildHierarchy(navItems);
  
  // Debug logging
  useEffect(() => {
    if (navItems.length > 0) {
      console.log('=== HIERARCHY DEBUG ===');
      console.log('Hierarchical items:', hierarchicalNavItems);
    }
  }, [navItems, hierarchicalNavItems]);

  // Initialize expanded folders based on default_collapsed setting
  useEffect(() => {
    const initiallyExpanded = new Set();
    navItems.forEach((item) => {
      if (item.item_type === "folder" && item.default_collapsed === false) {
        initiallyExpanded.add(item.id);
      }
    });
    setExpandedFolders(initiallyExpanded);
  }, [navItems]);
  const { 
    prefetchProjects, 
    prefetchTasks, 
    prefetchCustomers, 
    prefetchTeam, 
    prefetchMindMaps,
    prefetchLibrary,
    prefetchRoadmap 
  } = usePrefetchRoute();
  
  const isIconsOnly = mode === "icons";

  // Map page names to prefetch functions
  const prefetchMap = {
    'Projects': prefetchProjects,
    'Tasks': prefetchTasks,
    'Customers': prefetchCustomers,
    'Team': prefetchTeam,
    'MindMapEditor': prefetchMindMaps,
    'EntityLibrary': () => prefetchLibrary('EntityLibrary'),
    'PageLibrary': () => prefetchLibrary('PageLibrary'),
    'FeatureLibrary': () => prefetchLibrary('FeatureLibrary'),
    'TemplateLibrary': () => prefetchLibrary('TemplateLibrary'),
    'BusinessTemplates': () => prefetchLibrary('BusinessTemplates'),
    'RoadmapManager': prefetchRoadmap,
  };

  const handleMouseEnter = (pageName) => {
    const prefetchFn = prefetchMap[pageName];
    if (prefetchFn) {
      // Debounce prefetching to avoid excessive calls
      setTimeout(() => prefetchFn(), 100);
    }
  };

  const widthClass =
    mode === "expanded" ? "w-64" : mode === "icons" ? "w-16" : "w-0";

  const showLabels = mode === "expanded";

  const toggleFolder = (folderId, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
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
    // Standardize icon sizes - larger in icons-only mode for better visibility
    const iconSize = isIconsOnly ? 24 : (item.icon_size || 20);
    const iconStrokeWidth = isIconsOnly ? 1.5 : (item.icon_stroke_width || 1.25);

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
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFolder(item.id, e);
            }}
            className={cn(
              "w-full flex items-center justify-center transition-colors group relative",
              "[padding:var(--spacing-2)] [border-radius:var(--radius-lg)]",
              childActive ? "bg-sidebar-primary/10 ring-2 ring-sidebar-primary" : "hover:bg-sidebar-accent",
              isExpanded && "bg-sidebar-accent"
            )}
          >
            <FolderIcon 
              className="transition-colors flex-shrink-0" 
              size={iconSize}
              strokeWidth={iconStrokeWidth}
              style={{ color: childActive ? 'var(--sidebar-primary)' : 'var(--accent-500, #b39299)' }}
            />
            {childActive && (
              <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-sidebar-primary rounded-full" />
            )}
          </button>
        );
        
        return (
          <div key={item.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                {folderButton}
              </TooltipTrigger>
              <TooltipContent side="right" className="text-base [padding:var(--spacing-3)]">
                {item.tooltip_text || item.name || 'Unnamed'}
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
        <div key={item.id} className={isExpanded && showLabels ? "[border-radius:var(--radius-lg)] [margin-bottom:var(--spacing-1)]" : ""} style={isExpanded && showLabels ? { backgroundColor: 'oklch(0.990 0.007 83.1 / 0.8)', backgroundColor: 'rgba(252, 251, 250, 0.8)' } : {}}>
          <button
            onClick={(e) => toggleFolder(item.id, e)}
            className={cn(
              "w-full flex items-center transition-colors hover:text-sidebar-foreground",
              "[gap:var(--spacing-3)] [padding-left:var(--spacing-3)] [padding-right:var(--spacing-3)] [padding-top:var(--spacing-2)] [padding-bottom:var(--spacing-2)] [border-radius:var(--radius-lg)]"
            )}
            style={{
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'oklch(0.990 0.007 83.1 / 0.9)';
              e.currentTarget.style.backgroundColor = 'rgba(252, 251, 250, 0.9)';
            }}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {hasChildren && (
              isExpanded ? <ChevronDown className="h-4 w-4 text-sidebar-foreground/50" /> : <ChevronRight className="h-4 w-4 text-sidebar-foreground/50" />
            )}
            <FolderIcon size={iconSize} strokeWidth={iconStrokeWidth} style={{ color: 'var(--accent-500, #b39299)' }} />
            <span className={cn("flex-1 text-left", !item.parent_id && "font-medium")}>{item.name || 'Unnamed'}</span>
          </button>
          {isExpanded && hasChildren && (
            <div className="[padding-bottom:var(--spacing-2)] [gap:var(--spacing-1)] [padding-left:var(--spacing-3)] flex flex-col" style={{ backgroundColor: 'oklch(0.990 0.007 83.1 / 0.7)', backgroundColor: 'rgba(252, 251, 250, 0.7)' }}>
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
        onMouseEnter={() => handleMouseEnter(pageName)}
        onClick={(e) => {
          if (isIconsOnly) {
            e.stopPropagation();
          }
        }}
        className={cn(
          "flex items-center [border-radius:var(--radius-lg)] transition-colors group relative",
          showLabels 
            ? (isChild ? "[gap:var(--spacing-2)] [padding:var(--spacing-2)]" : "[gap:var(--spacing-3)] [padding:var(--spacing-2)]") 
            : "justify-center [padding:var(--spacing-2)]",
          isActive
            ? "bg-sidebar-primary ring-2 ring-sidebar-primary/20"
            : "hover:bg-sidebar-accent"
        )}
      >
        <ChildIcon 
          className="flex-shrink-0 transition-colors"
          size={iconSize}
          strokeWidth={iconStrokeWidth}
          style={{ color: isActive ? 'var(--sidebar-primary-foreground)' : 'var(--accent-500, #b39299)' }}
        />
        {isActive && isIconsOnly && (
          <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-sidebar-primary-foreground rounded-full" />
        )}
        {showLabels && <span className={cn("truncate", isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/70", isTopLevel && "font-medium")}>{item.name || 'Unnamed'}</span>}
      </Link>
    );
    
    if (!showLabels) {
      return (
        <Tooltip key={item.id}>
          <TooltipTrigger asChild>
            {linkContent}
          </TooltipTrigger>
          <TooltipContent side="right" className="text-base [padding:var(--spacing-3)]">
            {item.tooltip_text || item.name || 'Unnamed'}
          </TooltipContent>
          </Tooltip>
          );
    }
    
    return linkContent;
  };

  // Use hierarchical items directly - they're already at root level
  const itemsToRender = hierarchicalNavItems;

  // Don't render sidebar at all when hidden
  if (mode === "hidden") {
    return null;
  }

  return (
    <aside
          className={cn(
            "hidden lg:flex lg:flex-col text-sidebar-foreground rounded-xl shadow-md transition-[width] duration-300 ease-in-out overflow-visible [padding:var(--spacing-4)]",
            widthClass
          )}
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
        >
        <TooltipProvider delayDuration={300}>
          <nav className={cn(
            "flex-1 flex flex-col",
            showLabels ? "[gap:var(--spacing-1)]" : "[gap:var(--spacing-2)]"
          )}>
            {itemsToRender.map((item) => renderNavItem(item, false, !item.parent_id))}
          </nav>
        </TooltipProvider>
      </aside>
  );
}