// Auto-generated pages configuration
// This file is used by the navigation system to track available pages

// Initialize with safe defaults to prevent null/undefined errors
const safeConfig = {
  pages: [],
  routes: {},
  metadata: {},
  navigationItems: [],
  pageComponents: {},
  pageMap: new Map(),
  routeMap: new Map()
};

// Ensure all nested objects exist
Object.keys(safeConfig).forEach(key => {
  if (safeConfig[key] === null || safeConfig[key] === undefined) {
    safeConfig[key] = Array.isArray(safeConfig[key]) ? [] : {};
  }
});

export const pagesConfig = safeConfig;
export default pagesConfig;