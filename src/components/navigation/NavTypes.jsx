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
  if (!name) return `folder_unnamed_${Date.now()}`;
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
  const itemId = item.id || item._id;
  return allItems.some((i) => i.parent_id === itemId);
};

/**
 * Get children of a navigation item
 * CRITICAL: Handle both null and undefined parent_id
 */
export const getChildren = (parentId, allItems) => {
  return allItems
    .filter((item) => {
      // Normalize: treat null, undefined, and empty string as "no parent"
      const itemParent = item.parent_id || null;
      const targetParent = parentId || null;
      return itemParent === targetParent;
    })
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
    const childId = child.id || child._id;
    result.add(childId);
    getDescendants(childId, allItems, result);
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
    (item) => {
      const iid = item.id || item._id;
      return iid && 
        iid !== itemId && 
        !descendants.has(iid);
    }
  );
};

/**
 * Get only folder parents for move menu (alphabetically sorted)
 */
export const getFolderParents = (itemId, allItems) => {
  const descendants = itemId ? getDescendants(itemId, allItems) : new Set();
  return allItems
    .filter(
      (item) => {
        const iid = item.id || item._id;
        return isFolder(item) && 
          iid && 
          iid !== itemId && 
          !descendants.has(iid);
      }
    )
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
};

/**
 * Build a flat list with depth information for rendering
 * CRITICAL: Always show top-level items, then show children only if parent is expanded
 */
export const buildFlatNavList = (allItems, expandedIds = new Set(), maxDepth = 3) => {
  const result = [];
  
  const addItems = (parentId, depth) => {
    if (depth > maxDepth) return;
    
    const children = getChildren(parentId, allItems);
    children.forEach((item) => {
      const itemId = item.id || item._id;
      const itemHasChildren = hasChildren(item, allItems);
      const isExpanded = expandedIds.has(itemId);
      
      // Always add the item itself
      result.push({
        ...item,
        depth,
        hasChildren: itemHasChildren,
        isExpanded,
      });
      
      // Only recurse into children if this item is expanded
      if (itemHasChildren && isExpanded) {
        addItems(itemId, depth + 1);
      }
    });
  };
  
  // Start with top-level items (parentId = null)
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