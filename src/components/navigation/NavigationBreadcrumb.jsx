import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronRight, Home } from "lucide-react";

/**
 * NavigationBreadcrumb - Shows breadcrumb trail for nested pages
 * 
 * Props:
 * - items: Array of navigation items (full tree)
 * - currentPageSlug: Current page's slug
 * - showHome: Whether to show home link (default true)
 */
export default function NavigationBreadcrumb({ 
  items = [], 
  currentPageSlug,
  showHome = true 
}) {
  // Build breadcrumb path by traversing up from current page
  const buildPath = () => {
    const path = [];
    
    // Find current item
    const currentItem = items.find(i => i.page_url === currentPageSlug || i.slug === currentPageSlug);
    if (!currentItem) return path;
    
    path.unshift(currentItem);
    
    // Traverse up to parents
    let parentId = currentItem.parent_id;
    let depth = 0;
    while (parentId && depth < 3) {
      const parent = items.find(i => i.id === parentId || i.slug === parentId);
      if (parent) {
        path.unshift(parent);
        parentId = parent.parent_id;
      } else {
        break;
      }
      depth++;
    }
    
    return path;
  };

  const breadcrumbPath = buildPath();
  
  // Only show if we have more than 1 level
  if (breadcrumbPath.length <= 1) return null;

  return (
    <nav className="flex items-center gap-1 text-sm text-gray-500 mb-4 px-1">
      {showHome && (
        <>
          <Link 
            to={createPageUrl("Home")} 
            className="hover:text-gray-700 flex items-center gap-1"
          >
            <Home className="h-3.5 w-3.5" />
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
        </>
      )}
      {breadcrumbPath.map((item, index) => {
        const isLast = index === breadcrumbPath.length - 1;
        const pageUrl = item.page_url || item.slug;
        const isFolder = item.item_type === "folder";
        
        return (
          <React.Fragment key={item.id || item.slug || index}>
            {isLast || isFolder ? (
              <span className={isLast ? "text-gray-900 font-medium" : "text-gray-500"}>
                {item.name}
              </span>
            ) : (
              <Link 
                to={createPageUrl(pageUrl)}
                className="hover:text-gray-700 hover:underline"
              >
                {item.name}
              </Link>
            )}
            {!isLast && (
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}