/**
 * NavTypes.js - Type definitions and constants for navigation system
 * Part of Sturij Design System - Sprint 1
 */

/**
 * Navigation item types
 */
export const NAV_ITEM_TYPES = {
  PAGE: "page",
  FOLDER: "folder",
  LINK: "link",
  DIVIDER: "divider",
};

/**
 * Navigation config types - used to identify different navigation contexts
 */
export const NAV_CONFIG_TYPES = {
  ADMIN_CONSOLE: "admin_console",
  APP_PAGES: "app_pages_source",
  LIVE_PAGES: "live_pages_source",
  TENANT_NAV: "tenant_nav", // Prefix: tenant_nav_{tenantId}
};

/**
 * Default navigation item structure
 */
export const DEFAULT_NAV_ITEM = {
  _id: "",
  name: "",
  slug: "",
  icon: "File",
  is_visible: true,
  parent_id: null,
  item_type: NAV_ITEM_TYPES.PAGE,
  default_collapsed: false,
  order: 0,
  roles: [],
};

/**
 * Navigation settings structure
 */
export const DEFAULT_NAV_SETTINGS = {
  sideNavEnabled: true,
  breadcrumbEnabled: true,
  sideNavBehavior: "expand", // "expand" | "collapse" | "hover"
  maxNestingDepth: 3,
  showIcons: true,
  showBadges: true,
};

/**
 * Generate a unique ID for navigation items
 */
export const generateNavId = () => {
  return `nav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Generate a stable ID for folders based on name
 * Normalizes spaces and special chars to single underscores
 */
export const generateFolderId = (name) => {
  return `folder_${name.toLowerCase().replace(/[\s-]+/g, '_').replace(/[^a-z0-9_]/g, '')}`;
};

/**
 * Generate a stable ID for pages based on slug
 */
export const generatePageId = (slug) => {
  return `page_${slug.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
};

/**
 * Check if an item is a folder
 */
export const isFolder = (item) => {
  return item?.item_type === NAV_ITEM_TYPES.FOLDER;
};

/**
 * Check if an item is a page
 */
export const isPage = (item) => {
  return item?.item_type === NAV_ITEM_TYPES.PAGE || !item?.item_type;
};

/**
 * Check if an item has children
 */
export const hasChildren = (item, allItems) => {
  return allItems.some((i) => i.parent_id === item._id);
};

/**
 * Get children of a navigation item
 */
export const getChildren = (parentId, allItems) => {
  return allItems
    .filter((item) => item.parent_id === parentId)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
};

/**
 * Get top-level items (no parent)
 */
export const getTopLevelItems = (allItems) => {
  return allItems
    .filter((item) => !item.parent_id)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
};

/**
 * Get all descendants of an item (for preventing circular references)
 */
export const getDescendants = (itemId, allItems, result = new Set()) => {
  const children = getChildren(itemId, allItems);
  children.forEach((child) => {
    result.add(child._id);
    getDescendants(child._id, allItems, result);
  });
  return result;
};

/**
 * Get valid parent options for an item (excluding self and descendants)
 * Returns folders AND pages that can be parents (for 3-level nesting)
 */
export const getValidParents = (itemId, allItems) => {
  const descendants = itemId ? getDescendants(itemId, allItems) : new Set();
  return allItems.filter(
    (item) => 
      item._id && 
      item._id !== itemId && 
      !descendants.has(item._id)
  );
};

/**
 * Get only folder parents for move menu (alphabetically sorted)
 */
export const getFolderParents = (itemId, allItems) => {
  const descendants = itemId ? getDescendants(itemId, allItems) : new Set();
  return allItems
    .filter(
      (item) => 
        isFolder(item) && 
        item._id && 
        item._id !== itemId && 
        !descendants.has(item._id)
    )
    .sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Build a flat list with depth information for rendering
 */
export const buildFlatNavList = (allItems, expandedIds = new Set(), maxDepth = 3) => {
  const result = [];
  
  const addItems = (parentId, depth) => {
    if (depth > maxDepth) return;
    
    const children = getChildren(parentId, allItems);
    children.forEach((item) => {
      const itemHasChildren = hasChildren(item, allItems);
      const isExpanded = expandedIds.has(item._id);
      
      result.push({
        ...item,
        depth,
        hasChildren: itemHasChildren,
        isExpanded,
      });
      
      if (itemHasChildren && isExpanded) {
        addItems(item._id, depth + 1);
      }
    });
  };
  
  addItems(null, 0);
  return result;
};

/**
 * Ensure all items have stable IDs
 */
export const ensureItemIds = (items) => {
  return items.map((item) => {
    if (item._id) return item;
    
    if (isFolder(item)) {
      return { ...item, _id: generateFolderId(item.name) };
    }
    
    if (item.slug) {
      return { ...item, _id: generatePageId(item.slug) };
    }
    
    return { ...item, _id: generateNavId() };
  });
};

export default {
  NAV_ITEM_TYPES,
  NAV_CONFIG_TYPES,
  DEFAULT_NAV_ITEM,
  DEFAULT_NAV_SETTINGS,
  generateNavId,
  generateFolderId,
  generatePageId,
  isFolder,
  isPage,
  hasChildren,
  getChildren,
  getTopLevelItems,
  getDescendants,
  getValidParents,
  getFolderParents,
  buildFlatNavList,
  ensureItemIds,
};