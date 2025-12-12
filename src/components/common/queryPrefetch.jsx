/**
 * Query prefetching service for common queries
 * Prefetches dashboard and frequently accessed data on idle
 */

import { base44 } from '@/api/base44Client';

/**
 * Prefetch common queries for dashboard
 */
export async function prefetchDashboardQueries(queryClient) {
  const queries = [
    {
      queryKey: ['projects'],
      queryFn: () => base44.entities.Project?.list() || Promise.resolve([]),
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    {
      queryKey: ['tasks'],
      queryFn: () => base44.entities.Task?.list() || Promise.resolve([]),
      staleTime: 2 * 60 * 1000, // 2 minutes
    },
    {
      queryKey: ['customers'],
      queryFn: () => base44.entities.Customer?.list() || Promise.resolve([]),
      staleTime: 10 * 60 * 1000, // 10 minutes
    },
    {
      queryKey: ['teamMembers'],
      queryFn: () => base44.entities.TeamMember?.list() || Promise.resolve([]),
      staleTime: 15 * 60 * 1000, // 15 minutes
    },
  ];

  // Prefetch all queries in parallel
  await Promise.all(
    queries.map(query => 
      queryClient.prefetchQuery(query).catch(() => {
        // Silently fail - prefetch is not critical
      })
    )
  );
}

/**
 * Prefetch entity library data
 */
export async function prefetchLibraryQueries(queryClient) {
  const queries = [
    {
      queryKey: ['entityTemplates'],
      queryFn: () => base44.entities.EntityTemplate?.list() || Promise.resolve([]),
      staleTime: 10 * 60 * 1000,
    },
    {
      queryKey: ['pageTemplates'],
      queryFn: () => base44.entities.PageTemplate?.list() || Promise.resolve([]),
      staleTime: 10 * 60 * 1000,
    },
    {
      queryKey: ['featureTemplates'],
      queryFn: () => base44.entities.FeatureTemplate?.list() || Promise.resolve([]),
      staleTime: 10 * 60 * 1000,
    },
  ];

  await Promise.all(
    queries.map(query => 
      queryClient.prefetchQuery(query).catch(() => {})
    )
  );
}

/**
 * Prefetch on idle using requestIdleCallback
 */
export function prefetchOnIdle(queryClient, prefetchFn) {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      prefetchFn(queryClient);
    }, { timeout: 2000 });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      prefetchFn(queryClient);
    }, 1000);
  }
}

/**
 * Smart prefetch based on user navigation patterns
 */
export class PrefetchManager {
  constructor(queryClient) {
    this.queryClient = queryClient;
    this.visitedPages = new Set();
    this.prefetchQueue = [];
  }

  /**
   * Track page visit
   */
  trackPageVisit(pageName) {
    this.visitedPages.add(pageName);
    this.predictNextPages(pageName);
  }

  /**
   * Predict and prefetch likely next pages
   */
  predictNextPages(currentPage) {
    const predictions = {
      'Dashboard': ['Projects', 'Tasks', 'Team'],
      'Projects': ['ProjectDetail', 'Tasks', 'Customers'],
      'Tasks': ['Projects', 'Team'],
      'EntityLibrary': ['PageLibrary', 'FeatureLibrary'],
      'PageLibrary': ['EntityLibrary', 'FeatureLibrary'],
    };

    const nextPages = predictions[currentPage] || [];
    
    nextPages.forEach(page => {
      if (!this.visitedPages.has(page)) {
        this.prefetchForPage(page);
      }
    });
  }

  /**
   * Prefetch data for a specific page
   */
  prefetchForPage(pageName) {
    const prefetchMap = {
      'Projects': () => prefetchDashboardQueries(this.queryClient),
      'EntityLibrary': () => prefetchLibraryQueries(this.queryClient),
      'PageLibrary': () => prefetchLibraryQueries(this.queryClient),
      'FeatureLibrary': () => prefetchLibraryQueries(this.queryClient),
    };

    const prefetchFn = prefetchMap[pageName];
    if (prefetchFn) {
      prefetchOnIdle(this.queryClient, prefetchFn);
    }
  }

  /**
   * Clear prefetch queue
   */
  clear() {
    this.prefetchQueue = [];
  }
}

/**
 * Hook to use prefetch manager
 */
export function usePrefetchManager(queryClient) {
  const manager = new PrefetchManager(queryClient);
  
  return {
    trackPageVisit: (page) => manager.trackPageVisit(page),
    prefetchForPage: (page) => manager.prefetchForPage(page),
  };
}