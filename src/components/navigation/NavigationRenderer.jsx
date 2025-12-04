/**
 * NavigationRenderer - Standalone navigation renderer
 * 
 * Uses NavigationDataProvider context to render navigation.
 * Works as a standalone website element.
 */

import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronDown, ChevronRight, Folder, FolderOpen } from "lucide-react";
import { useNavigation } from "./NavigationDataProvider";
import { renderIcon } from "./NavIconMap";

/**
 * NavigationRenderer
 * 
 * Props:
 * - variant: "sidebar" | "horizontal" | "minimal" - Display variant
 * - showIcons: boolean - Whether to show icons
 * - className: string - Additional CSS classes
 * - itemClassName: string - CSS classes for items
 * - activeClassName: string - CSS classes for active item
 * - onItemClick: function - Override click handler
 */
export function NavigationRenderer({
  variant = "sidebar",
  showIcons = true,
  className = "",
  itemClassName = "",
  activeClassName = "active",
  onItemClick = null
}) {
  const { 
    flatList, 
    isLoading, 
    activeItemId,
    toggleExpanded,
    isExpanded,
    hasChildren,
    navigate 
  } = useNavigation();

  if (isLoading) {
    return (
      <nav className={`nav-loading ${className}`}>
        <div className="animate-pulse space-y-2 p-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-8 bg-muted rounded-token-md" />
          ))}
        </div>
      </nav>
    );
  }

  const handleClick = (item, e) => {
    if (item.item_type === "folder") {
      e.preventDefault();
      toggleExpanded(item._id);
    } else {
      navigate(item);
      if (onItemClick) {
        onItemClick(item, e);
      }
    }
  };

  // Sidebar variant (vertical, supports nesting)
  if (variant === "sidebar") {
    return (
      <nav className={`nav-sidebar space-y-1 ${className}`}>
        {flatList.map((item) => {
          const isActive = activeItemId === item._id;
          const isFolder = item.item_type === "folder";
          const itemExpanded = isExpanded(item._id);
          const depth = item.depth || 0;

          return (
            <div
              key={item._id}
              style={{ marginLeft: depth * 16 }}
            >
              {isFolder ? (
                <button
                  onClick={(e) => handleClick(item, e)}
                  className={`nav-item w-full ${itemClassName} ${isActive ? activeClassName : ""}`}
                >
                  {item.hasChildren && (
                    itemExpanded 
                      ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      : <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  {showIcons && (
                    itemExpanded 
                      ? <FolderOpen className="h-4 w-4 text-secondary-500" />
                      : <Folder className="h-4 w-4 text-secondary-500" />
                  )}
                  <span className="flex-1 text-left">{item.name}</span>
                </button>
              ) : (
                <Link
                  to={createPageUrl(item.slug)}
                  onClick={(e) => handleClick(item, e)}
                  className={`nav-item ${itemClassName} ${isActive ? activeClassName : ""}`}
                >
                  {!item.hasChildren && <div className="w-4" />}
                  {showIcons && renderIcon(item.icon, "h-4 w-4")}
                  <span>{item.name}</span>
                </Link>
              )}
            </div>
          );
        })}
      </nav>
    );
  }

  // Horizontal variant (top nav style, flat)
  if (variant === "horizontal") {
    const topItems = flatList.filter(i => i.depth === 0);
    
    return (
      <nav className={`nav-horizontal flex items-center gap-1 ${className}`}>
        {topItems.map((item) => {
          const isActive = activeItemId === item._id;
          const isFolder = item.item_type === "folder";

          if (isFolder) {
            // For horizontal, folders become dropdowns (simplified for now)
            return (
              <button
                key={item._id}
                onClick={(e) => handleClick(item, e)}
                className={`nav-item ${itemClassName} ${isActive ? activeClassName : ""}`}
              >
                {showIcons && renderIcon(item.icon, "h-4 w-4")}
                <span>{item.name}</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </button>
            );
          }

          return (
            <Link
              key={item._id}
              to={createPageUrl(item.slug)}
              onClick={(e) => handleClick(item, e)}
              className={`nav-item ${itemClassName} ${isActive ? activeClassName : ""}`}
            >
              {showIcons && renderIcon(item.icon, "h-4 w-4")}
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    );
  }

  // Minimal variant (simple list, no nesting visuals)
  return (
    <nav className={`nav-minimal space-y-0.5 ${className}`}>
      {flatList
        .filter(i => i.item_type !== "folder" && i.is_visible !== false)
        .map((item) => {
          const isActive = activeItemId === item._id;

          return (
            <Link
              key={item._id}
              to={createPageUrl(item.slug)}
              onClick={(e) => handleClick(item, e)}
              className={`nav-item ${itemClassName} ${isActive ? activeClassName : ""}`}
            >
              {showIcons && renderIcon(item.icon, "h-4 w-4")}
              <span>{item.name}</span>
            </Link>
          );
        })}
    </nav>
  );
}

export default NavigationRenderer;