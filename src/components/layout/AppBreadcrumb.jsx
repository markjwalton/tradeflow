import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { createPageUrl } from "@/utils";
import { cn } from "@/lib/utils";
import { findBreadcrumbTrail } from "./findBreadcrumbTrail";

export function AppBreadcrumb({ navItems = [], organizedNavigation = [], currentPageName }) {
  // Build hierarchy if we received flat navItems instead of organized structure
  const buildHierarchy = (items) => {
    if (!items || items.length === 0) return [];
    
    const normalizedItems = items.map(item => {
      const itemId = item.id || item._id;
      return {
        ...item,
        id: itemId,
        _id: itemId,
        parent_id: item.parent_id || null,
        children: []
      };
    });
    
    const itemsMap = new Map();
    normalizedItems.forEach((item) => {
      itemsMap.set(item.id, item);
    });
    
    const rootItems = [];
    normalizedItems.forEach((item) => {
      if (item.parent_id && itemsMap.has(item.parent_id)) {
        const parent = itemsMap.get(item.parent_id);
        parent.children.push(item);
      } else {
        rootItems.push(item);
      }
    });
    
    return rootItems;
  };

  const hierarchicalItems = organizedNavigation.length > 0 ? organizedNavigation : buildHierarchy(navItems);
  const trail = findBreadcrumbTrail(hierarchicalItems, currentPageName);

  const crumbs = trail.map((item, index) => {
    const isLast = index === trail.length - 1;
    const label = item.breadcrumb_label || item.name || 'Unnamed';
    const hasPage = !!item.page_url;
    const clickable = hasPage && (item.is_clickable === undefined || item.is_clickable);

    return {
      label,
      href: clickable && !isLast ? item.page_url : undefined,
      isCurrent: isLast,
      isClickableParent: clickable && !isLast,
    };
  });

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center text-sm text-muted-foreground"
    >
      <Link
        to={createPageUrl("Dashboard")}
        className="hover:text-foreground transition-colors"
      >
        Home
      </Link>

      {crumbs.map((crumb, idx) => (
        <span key={`${crumb.label}-${idx}`} className="flex items-center">
          <ChevronRight className="w-3 h-3 mx-1" />
          {crumb.isCurrent ? (
            <span className="font-medium text-foreground truncate max-w-[160px]">
              {crumb.label}
            </span>
          ) : crumb.isClickableParent && crumb.href ? (
            <Link
              to={crumb.href}
              className={cn(
                "hover:text-foreground transition-colors",
                "truncate max-w-[140px]"
              )}
            >
              {crumb.label}
            </Link>
          ) : (
            <span className="truncate max-w-[140px]">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}