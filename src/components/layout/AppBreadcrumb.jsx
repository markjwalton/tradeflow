import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { createPageUrl } from "@/utils";
import { cn } from "@/lib/utils";
import { findBreadcrumbTrail } from "./findBreadcrumbTrail";

export function AppBreadcrumb({ organizedNavigation = [] }) {
  const location = useLocation();

  const segments = location.pathname.split("/").filter(Boolean);
  const currentSlug = segments[segments.length - 1] || "";

  const trail = findBreadcrumbTrail(organizedNavigation, currentSlug);

  const crumbs = trail.map((item, index) => {
    const isLast = index === trail.length - 1;
    const label = item.breadcrumb_label || item.name;
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