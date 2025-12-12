import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getCacheConfig } from './queryConfig';

/**
 * Smart entity query hook with automatic caching strategy
 * @param {string} entityName - Name of the entity (e.g., 'Project', 'Task')
 * @param {object} filter - Optional filter object
 * @param {object} options - Additional React Query options
 */
export function useEntityQuery(entityName, filter = {}, options = {}) {
  const cacheConfig = getCacheConfig(entityName);
  
  return useQuery({
    queryKey: [entityName.toLowerCase(), filter],
    queryFn: () => {
      if (Object.keys(filter).length > 0) {
        return base44.entities[entityName].filter(filter);
      }
      return base44.entities[entityName].list();
    },
    ...cacheConfig,
    ...options,
  });
}

/**
 * Hook for list queries with pagination
 */
export function useEntityList(entityName, options = {}) {
  const cacheConfig = getCacheConfig(entityName);
  
  return useQuery({
    queryKey: [entityName.toLowerCase()],
    queryFn: () => base44.entities[entityName].list(),
    ...cacheConfig,
    ...options,
  });
}

/**
 * Hook for single entity by ID
 */
export function useEntityById(entityName, id, options = {}) {
  const cacheConfig = getCacheConfig(entityName);
  
  return useQuery({
    queryKey: [entityName.toLowerCase(), id],
    queryFn: () => base44.entities[entityName].filter({ id }).then(items => items[0]),
    enabled: !!id,
    ...cacheConfig,
    ...options,
  });
}