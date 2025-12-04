/**
 * StandaloneNavigation - Self-contained navigation component
 * 
 * Combines NavigationDataProvider + NavigationRenderer into one easy-to-use component.
 * Works as a standalone website element with no external dependencies.
 */

import React from "react";
import { NavigationDataProvider } from "./NavigationDataProvider";
import { NavigationRenderer } from "./NavigationRenderer";

/**
 * StandaloneNavigation
 * 
 * Props:
 * - source: "config" | "static" | "callback" - Data source
 * - configType: string - For config source
 * - items: array - For static source
 * - fetchItems: function - For callback source
 * - variant: "sidebar" | "horizontal" | "minimal" - Display style
 * - showIcons: boolean - Show icons
 * - defaultExpanded: boolean - Start folders expanded
 * - maxDepth: number - Max nesting depth
 * - onNavigate: function - Navigation callback
 * - className: string - Container classes
 * - itemClassName: string - Item classes
 * - activeClassName: string - Active item classes
 */
export function StandaloneNavigation({
  // Data props
  source = "config",
  configType = "live_pages_source",
  items = [],
  fetchItems = null,
  
  // Behavior props
  defaultExpanded = false,
  maxDepth = 3,
  onNavigate = null,
  
  // Display props
  variant = "sidebar",
  showIcons = true,
  className = "",
  itemClassName = "",
  activeClassName = "active"
}) {
  return (
    <NavigationDataProvider
      source={source}
      configType={configType}
      items={items}
      fetchItems={fetchItems}
      defaultExpanded={defaultExpanded}
      maxDepth={maxDepth}
      onNavigate={onNavigate}
    >
      <NavigationRenderer
        variant={variant}
        showIcons={showIcons}
        className={className}
        itemClassName={itemClassName}
        activeClassName={activeClassName}
      />
    </NavigationDataProvider>
  );
}

/**
 * Pre-configured navigation variants
 */

// Live Preview navigation
export function LivePreviewNavigation({ onNavigate, className = "" }) {
  return (
    <StandaloneNavigation
      source="config"
      configType="live_pages_source"
      variant="sidebar"
      defaultExpanded={false}
      onNavigate={onNavigate}
      className={className}
    />
  );
}

// Static navigation from items array
export function StaticNavigation({ items, onNavigate, className = "" }) {
  return (
    <StandaloneNavigation
      source="static"
      items={items}
      variant="sidebar"
      defaultExpanded={true}
      onNavigate={onNavigate}
      className={className}
    />
  );
}

// Horizontal top navigation
export function TopNavigation({ configType = "app_pages_source", className = "" }) {
  return (
    <StandaloneNavigation
      source="config"
      configType={configType}
      variant="horizontal"
      showIcons={false}
      className={className}
    />
  );
}

export default StandaloneNavigation;