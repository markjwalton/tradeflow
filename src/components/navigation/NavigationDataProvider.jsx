/**
 * NavigationDataProvider - Standardized navigation data abstraction
 * 
 * Provides a consistent interface for navigation data regardless of source.
 * Works standalone without multi-tenant requirements.
 * 
 * Data Sources:
 * - "config" - NavigationConfig entity (default)
 * - "static" - Static items passed via props
 * - "callback" - Custom fetch function
 */

import React, { createContext, useContext, useMemo, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { 
  ensureItemIds, 
  buildFlatNavList, 
  getChildren, 
  getTopLevelItems,
  getValidParents 
} from "./NavTypes";

// Navigation Context
const NavigationContext = createContext(null);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within NavigationDataProvider");
  }
  return context;
};

/**
 * NavigationDataProvider
 * 
 * Props:
 * - source: "config" | "static" | "callback" - Where to get nav data
 * - configType: string - For source="config", the config_type to fetch
 * - items: array - For source="static", the navigation items
 * - fetchItems: function - For source="callback", async function returning items
 * - defaultExpanded: boolean - Whether folders start expanded
 * - maxDepth: number - Maximum nesting depth
 * - onNavigate: function - Callback when navigation occurs
 * - children: React node
 */
export function NavigationDataProvider({
  source = "config",
  configType = "live_pages_source",
  items: staticItems = [],
  fetchItems = null,
  defaultExpanded = false,
  maxDepth = 3,
  onNavigate = null,
  children
}) {
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [activeItemId, setActiveItemId] = useState(null);

  // Fetch from NavigationConfig entity
  const { data: configData = [], isLoading: configLoading } = useQuery({
    queryKey: ["navData", "config", configType],
    queryFn: () => base44.entities.NavigationConfig.filter({ config_type: configType }),
    enabled: source === "config",
    staleTime: 5 * 60 * 1000, // Cache for 5 mins
  });

  // Fetch from custom callback
  const { data: callbackData = [], isLoading: callbackLoading } = useQuery({
    queryKey: ["navData", "callback", configType],
    queryFn: fetchItems,
    enabled: source === "callback" && !!fetchItems,
    staleTime: 5 * 60 * 1000,
  });

  // Normalize items from any source
  const rawItems = useMemo(() => {
    switch (source) {
      case "static":
        return staticItems;
      case "callback":
        return callbackData || [];
      case "config":
      default:
        return configData[0]?.items || [];
    }
  }, [source, staticItems, callbackData, configData]);

  // Ensure all items have stable IDs
  const items = useMemo(() => ensureItemIds(rawItems), [rawItems]);

  // Initialize expanded state based on defaultExpanded
  React.useEffect(() => {
    if (defaultExpanded && items.length > 0) {
      const folderIds = items
        .filter(i => i.item_type === "folder")
        .map(i => i._id);
      setExpandedIds(new Set(folderIds));
    }
  }, [defaultExpanded, items.length]);

  // Build flat list for rendering
  const flatList = useMemo(
    () => buildFlatNavList(items, expandedIds, maxDepth),
    [items, expandedIds, maxDepth]
  );

  // Get top level items
  const topLevel = useMemo(
    () => getTopLevelItems(items),
    [items]
  );

  // Toggle folder expansion
  const toggleExpanded = useCallback((itemId) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  }, []);

  // Expand all folders
  const expandAll = useCallback(() => {
    const folderIds = items
      .filter(i => i.item_type === "folder")
      .map(i => i._id);
    setExpandedIds(new Set(folderIds));
  }, [items]);

  // Collapse all folders
  const collapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  // Check if item is expanded
  const isExpanded = useCallback(
    (itemId) => expandedIds.has(itemId),
    [expandedIds]
  );

  // Get children of an item
  const getItemChildren = useCallback(
    (parentId) => getChildren(parentId, items),
    [items]
  );

  // Check if item has children
  const hasChildren = useCallback(
    (itemId) => items.some(i => i.parent_id === itemId),
    [items]
  );

  // Handle navigation
  const navigate = useCallback((item) => {
    setActiveItemId(item._id);
    if (onNavigate) {
      onNavigate(item);
    }
  }, [onNavigate]);

  // Find item by slug
  const findBySlug = useCallback(
    (slug) => items.find(i => i.slug === slug),
    [items]
  );

  // Find item by ID
  const findById = useCallback(
    (id) => items.find(i => i._id === id),
    [items]
  );

  // Get breadcrumb trail for an item
  const getBreadcrumb = useCallback((itemId) => {
    const trail = [];
    let current = items.find(i => i._id === itemId);
    
    while (current) {
      trail.unshift(current);
      current = current.parent_id 
        ? items.find(i => i._id === current.parent_id)
        : null;
    }
    
    return trail;
  }, [items]);

  // Loading state
  const isLoading = source === "config" ? configLoading : 
                    source === "callback" ? callbackLoading : 
                    false;

  const contextValue = {
    // Data
    items,
    flatList,
    topLevel,
    isLoading,
    
    // State
    activeItemId,
    expandedIds,
    
    // Actions
    toggleExpanded,
    expandAll,
    collapseAll,
    navigate,
    setActiveItemId,
    
    // Queries
    isExpanded,
    hasChildren,
    getItemChildren,
    findBySlug,
    findById,
    getBreadcrumb,
    
    // Config
    maxDepth,
    source,
  };

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
}

export default NavigationDataProvider;