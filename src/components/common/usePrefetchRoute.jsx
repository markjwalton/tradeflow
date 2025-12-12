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
 * Returns specific prefetch functions for common routes
 */
export function usePrefetchRoute() {
  const queryClient = useQueryClient();

  const createPrefetch = (entities) => () => {
    entities.forEach(entityName => {
      queryClient.prefetchQuery({
        queryKey: [entityName],
        queryFn: () => base44.entities[entityName]?.list() || Promise.resolve([]),
        staleTime: 5 * 60 * 1000, // 5 minutes
      });
    });
  };

  return {
    prefetchProjects: createPrefetch(['Project', 'Customer', 'TeamMember']),
    prefetchTasks: createPrefetch(['Task', 'Project']),
    prefetchCustomers: createPrefetch(['Customer', 'Project']),
    prefetchTeam: createPrefetch(['TeamMember', 'Absence']),
    prefetchMindMaps: createPrefetch(['MindMap', 'MindMapNode']),
    prefetchRoadmap: createPrefetch(['RoadmapItem', 'DevelopmentSprint']),
    prefetchLibrary: (type) => createPrefetch([
      type === 'EntityLibrary' ? 'EntityTemplate' : 
      type === 'PageLibrary' ? 'PageTemplate' : 
      type === 'FeatureLibrary' ? 'FeatureTemplate' : 
      'BusinessTemplate'
    ])(),
  };
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