// Auto-generated pages configuration
// This file is used by the navigation system to track available pages

// Safe default configuration with all required properties
const defaultConfig = {
  pages: [],
  routes: {},
  metadata: {},
  navigationItems: [],
  pageComponents: {}
};

// Create a proxy to catch any property access and return safe defaults
export const pagesConfig = new Proxy(defaultConfig, {
  get(target, prop) {
    if (prop in target) {
      const value = target[prop];
      // Return safe defaults for null/undefined values
      if (value === null || value === undefined) {
        return Array.isArray(target[prop]) ? [] : {};
      }
      return value;
    }
    // Return safe default for unknown properties
    return typeof prop === 'string' && prop.endsWith('s') ? [] : {};
  }
});

export default pagesConfig;