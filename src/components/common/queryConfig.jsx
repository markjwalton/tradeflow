// React Query cache configuration
export const queryConfig = {
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
      cacheTime: 10 * 60 * 1000, // 10 minutes - cached data retention
      refetchOnWindowFocus: false, // Prevent excessive refetches
      refetchOnReconnect: true, // Refetch when connection restored
      retry: 1, // Retry failed queries once
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 0, // Don't retry mutations
    },
  },
};

// Cache time configurations by entity type
export const cacheStrategies = {
  // Frequently updated data - shorter cache
  realtime: {
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 2 * 60 * 1000, // 2 minutes
  },
  
  // Standard data - balanced cache
  standard: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  },
  
  // Rarely changing data - longer cache
  static: {
    staleTime: 30 * 60 * 1000, // 30 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour
  },
  
  // User-specific data - medium cache
  user: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
  },
};

// Entity-specific cache strategies
export const entityCacheConfig = {
  // Realtime entities
  Task: cacheStrategies.realtime,
  Absence: cacheStrategies.realtime,
  
  // Standard entities
  Project: cacheStrategies.standard,
  Customer: cacheStrategies.standard,
  TeamMember: cacheStrategies.standard,
  Estimate: cacheStrategies.standard,
  Contact: cacheStrategies.standard,
  
  // Static/Template entities
  NodeTemplate: cacheStrategies.static,
  EntityTemplate: cacheStrategies.static,
  PageTemplate: cacheStrategies.static,
  FeatureTemplate: cacheStrategies.static,
  BusinessTemplate: cacheStrategies.static,
  FunctionalArea: cacheStrategies.static,
  
  // User-related entities
  RoadmapItem: cacheStrategies.user,
  MindMap: cacheStrategies.user,
  MindMapNode: cacheStrategies.user,
  PlaygroundItem: cacheStrategies.user,
};

// Get cache config for a specific entity
export const getCacheConfig = (entityName) => {
  return entityCacheConfig[entityName] || cacheStrategies.standard;
};