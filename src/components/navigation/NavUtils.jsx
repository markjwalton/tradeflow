/**
 * NavUtils.js - Utility functions for navigation system
 * Part of Sturij Design System - Sprint 1
 */

import { generateNavId, ensureItemIds, getChildren, getDescendants } from "./NavTypes";

/**
 * Convert a page slug to a display name
 * e.g., "MyPageName" -> "My Page Name"
 */
export const slugToDisplayName = (slug) => {
  if (!slug) return "";
  return slug
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

/**
 * Convert a display name to a slug
 * e.g., "My Page Name" -> "MyPageName"
 */
export const displayNameToSlug = (name) => {
  if (!name) return "";
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
};

/**
 * Create a new navigation item with defaults
 */
export const createNavItem = (overrides = {}) => {
  return {
    _id: generateNavId(),
    name: "",
    slug: "",
    icon: "File",
    is_visible: true,
    parent_id: null,
    item_type: "page",
    default_collapsed: false,
    order: 0,
    roles: [],
    ...overrides,
  };
};

/**
 * Create a new folder item
 */
export const createFolderItem = (name, overrides = {}) => {
  const slug = `folder_${name.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
  return createNavItem({
    _id: slug,
    name,
    slug,
    icon: "FolderOpen",
    item_type: "folder",
    default_collapsed: true,
    ...overrides,
  });
};

/**
 * Create a new page item from a slug
 */
export const createPageItem = (slug, overrides = {}) => {
  return createNavItem({
    _id: `page_${slug.toLowerCase()}`,
    name: slugToDisplayName(slug),
    slug,
    icon: "File",
    item_type: "page",
    ...overrides,
  });
};

/**
 * Duplicate a navigation item
 */
export const duplicateNavItem = (item, allItems) => {
  return {
    ...item,
    _id: generateNavId(),
    name: `${item.name} (Copy)`,
    parent_id: null,
    order: allItems.length,
  };
};

/**
 * Move an item to a new parent
 */
export const moveItemToParent = (item, newParentId, allItems) => {
  return allItems.map((i) => ({
    ...i,
    parent_id: i._id === item._id ? newParentId : i.parent_id,
  }));
};

/**
 * Delete an item and optionally its children
 */
export const deleteNavItem = (item, allItems, deleteChildren = false) => {
  if (deleteChildren) {
    const descendants = getDescendants(item._id, allItems);
    return allItems.filter(
      (i) => i._id !== item._id && !descendants.has(i._id)
    );
  }
  
  // Move children to top level when deleting parent
  return allItems
    .filter((i) => i._id !== item._id)
    .map((i) => ({
      ...i,
      parent_id: i.parent_id === item._id ? null : i.parent_id,
    }));
};

/**
 * Toggle item visibility
 */
export const toggleItemVisibility = (item, allItems) => {
  return allItems.map((i) => ({
    ...i,
    is_visible: i._id === item._id ? !i.is_visible : i.is_visible,
  }));
};

/**
 * Reorder items within the same parent level
 */
export const reorderItems = (items, sourceIndex, destIndex, parentId) => {
  const siblings = items.filter((i) => (i.parent_id || null) === parentId);
  const otherItems = items.filter((i) => (i.parent_id || null) !== parentId);
  
  const reordered = Array.from(siblings);
  const [removed] = reordered.splice(sourceIndex, 1);
  reordered.splice(destIndex, 0, removed);
  
  const updatedSiblings = reordered.map((item, idx) => ({
    ...item,
    order: idx,
  }));
  
  return [...otherItems, ...updatedSiblings];
};

/**
 * Get unallocated slugs (slugs not in navigation)
 */
export const getUnallocatedSlugs = (sourceSlugs, navItems) => {
  const allocatedSlugs = new Set(navItems.map((i) => i.slug).filter(Boolean));
  return sourceSlugs.filter((slug) => !allocatedSlugs.has(slug));
};

/**
 * Allocate a slug to navigation (quick add)
 */
export const allocateSlug = (slug, navItems) => {
  const newItem = createPageItem(slug, { order: navItems.length });
  return [...ensureItemIds(navItems), newItem];
};

/**
 * Unallocate an item (remove from navigation, keep children at top level)
 */
export const unallocateItem = (item, allItems) => {
  return deleteNavItem(item, allItems, false);
};

/**
 * Generate navigation from categories (auto-generate folders)
 */
export const generateNavFromCategories = (templates, categoryKey = "category") => {
  const categories = [...new Set(templates.map((t) => t[categoryKey]).filter(Boolean))];
  const items = [];
  let order = 0;
  
  // Create folders for each category
  const folderMap = {};
  categories.sort().forEach((category) => {
    const folder = createFolderItem(category, { order: order++ });
    folderMap[category] = folder._id;
    items.push(folder);
  });
  
  // Add templates to their category folders
  templates
    .filter((t) => t[categoryKey])
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((template) => {
      const parentId = folderMap[template[categoryKey]];
      items.push(
        createPageItem(template.name, {
          parent_id: parentId,
          order: order++,
        })
      );
    });
  
  return items;
};

/**
 * Validate navigation structure
 */
export const validateNavStructure = (items) => {
  const errors = [];
  const ids = new Set();
  
  items.forEach((item, index) => {
    // Check for duplicate IDs
    if (ids.has(item._id)) {
      errors.push(`Duplicate ID found: ${item._id} at index ${index}`);
    }
    ids.add(item._id);
    
    // Check for missing required fields
    if (!item.name) {
      errors.push(`Item at index ${index} missing name`);
    }
    
    // Check for invalid parent references
    if (item.parent_id && !ids.has(item.parent_id)) {
      // Parent might come later in the list, so we'll check after
    }
  });
  
  // Second pass: check parent references
  items.forEach((item) => {
    if (item.parent_id && !items.some((i) => i._id === item.parent_id)) {
      errors.push(`Item "${item.name}" has invalid parent_id: ${item.parent_id}`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export default {
  slugToDisplayName,
  displayNameToSlug,
  createNavItem,
  createFolderItem,
  createPageItem,
  duplicateNavItem,
  moveItemToParent,
  deleteNavItem,
  toggleItemVisibility,
  reorderItems,
  getUnallocatedSlugs,
  allocateSlug,
  unallocateItem,
  generateNavFromCategories,
  validateNavStructure,
};