import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

/**
 * Prefetch entity data for a route
 * @param {string} entityName - Entity to prefetch
 * @param {object} options - Prefetch options
 */
export function usePrefetchEntity(entityName, options = {}) {
  const queryClient = useQueryClient();

  const prefetch = () => {
    queryClient.prefetchQuery({
      queryKey: [entityName],
      queryFn: () => base44.entities[entityName]?.list() || Promise.resolve([]),
      staleTime: options.staleTime || 5 * 60 * 1000, // 5 minutes
    });
  };

  return prefetch;
}

/**
 * Hook to prefetch route data on hover/intent
 * @param {string[]} entities - Array of entity names to prefetch
 * @param {object} options - Prefetch options
 */
export function usePrefetchRoute(entities = [], options = {}) {
  const queryClient = useQueryClient();

  const prefetch = () => {
    entities.forEach(entityName => {
      queryClient.prefetchQuery({
        queryKey: [entityName],
        queryFn: () => base44.entities[entityName]?.list() || Promise.resolve([]),
        staleTime: options.staleTime || 5 * 60 * 1000,
      });
    });
  };

  // Auto-prefetch on mount if enabled
  useEffect(() => {
    if (options.prefetchOnMount) {
      prefetch();
    }
  }, []);

  return prefetch;
}

/**
 * Helper to add prefetch to Link components
 * Usage: <Link onMouseEnter={prefetchRoute(['Project', 'Task'])}>
 */
export function prefetchRoute(entities) {
  return () => {
    if (typeof window !== 'undefined' && window.requestIdleCallback) {
      window.requestIdleCallback(() => {
        const queryClient = window.__REACT_QUERY_CLIENT__;
        if (!queryClient) return;

        entities.forEach(entityName => {
          queryClient.prefetchQuery({
            queryKey: [entityName],
            queryFn: () => base44.entities[entityName]?.list() || Promise.resolve([]),
          });
        });
      });
    }
  };
}