# API Caching Strategy Guide

## Overview
Comprehensive caching strategies to reduce API calls, improve performance, and enhance user experience.

---

## Current Implementation

### ✅ Already Configured
- **TanStack Query** - Client-side cache with staleTime/cacheTime
- **queryConfig.js** - Centralized query configuration
- **prefetchOnIdle** - Background data prefetching

---

## 1. Query-Level Caching

### Default Cache Configuration
```jsx
// Already in queryConfig.js
export const defaultQueryConfig = {
  staleTime: 5 * 60 * 1000,      // 5 minutes
  cacheTime: 10 * 60 * 1000,     // 10 minutes
  refetchOnWindowFocus: false,
  retry: 1,
};
```

### Entity-Specific Cache Times
```jsx
// Extend queryConfig.js with entity strategies
export const entityCacheStrategies = {
  // Static/reference data - cache longer
  EntityTemplate: { staleTime: 15 * 60 * 1000 },
  PageTemplate: { staleTime: 15 * 60 * 1000 },
  FeatureTemplate: { staleTime: 15 * 60 * 1000 },
  NodeTemplate: { staleTime: 15 * 60 * 1000 },
  TenantRole: { staleTime: 30 * 60 * 1000 },
  
  // Dynamic data - shorter cache
  Project: { staleTime: 2 * 60 * 1000 },
  Task: { staleTime: 2 * 60 * 1000 },
  RoadmapItem: { staleTime: 1 * 60 * 1000 },
  
  // Real-time data - minimal cache
  Absence: { staleTime: 30 * 1000 },
  Appointment: { staleTime: 30 * 1000 },
  
  // User-specific - moderate cache
  TenantUserRole: { staleTime: 5 * 60 * 1000 },
  NavigationItem: { staleTime: 10 * 60 * 1000 },
};
```

### Usage with Custom Cache Times
```jsx
import { entityCacheStrategies } from '@/components/common/queryConfig';

function useProjects() {
  return useQuery({
    queryKey: ['Project'],
    queryFn: () => base44.entities.Project.list(),
    ...entityCacheStrategies.Project,
  });
}
```

---

## 2. Cache Invalidation Strategies

### Automatic Invalidation on Mutation
```jsx
function useCreateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => base44.entities.Project.create(data),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['Project'] });
      queryClient.invalidateQueries({ queryKey: ['Dashboard'] });
    },
  });
}
```

### Optimistic Updates
```jsx
function useUpdateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['Task'] });
      
      // Snapshot previous value
      const previous = queryClient.getQueryData(['Task']);
      
      // Optimistically update cache
      queryClient.setQueryData(['Task'], (old) =>
        old.map((task) => (task.id === id ? { ...task, ...data } : task))
      );
      
      return { previous };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(['Task'], context.previous);
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['Task'] });
    },
  });
}
```

### Selective Invalidation
```jsx
function useUpdateProjectStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }) => 
      base44.entities.Project.update(id, { status }),
    onSuccess: (_, { id }) => {
      // Only invalidate specific project
      queryClient.invalidateQueries({ 
        queryKey: ['Project', id],
        exact: true 
      });
      
      // Invalidate list queries
      queryClient.invalidateQueries({ 
        queryKey: ['Project'],
        exact: false 
      });
    },
  });
}
```

---

## 3. Background Refetching

### Periodic Background Updates
```jsx
function useRealtimeProjects() {
  return useQuery({
    queryKey: ['Project'],
    queryFn: () => base44.entities.Project.list(),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    refetchIntervalInBackground: true,
  });
}
```

### Focus-Based Refetching
```jsx
function useFocusRefetch() {
  return useQuery({
    queryKey: ['Task'],
    queryFn: () => base44.entities.Task.list(),
    refetchOnWindowFocus: true,
    staleTime: 30 * 1000, // Consider stale after 30s
  });
}
```

### Network-Based Refetching
```jsx
function useNetworkRefetch() {
  return useQuery({
    queryKey: ['Customer'],
    queryFn: () => base44.entities.Customer.list(),
    refetchOnReconnect: true,
    networkMode: 'always', // Fetch even when offline
  });
}
```

---

## 4. Cache Persistence

### LocalStorage Persistence
```jsx
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'REACT_QUERY_CACHE',
});

persistQueryClient({
  queryClient,
  persister,
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
  buster: 'v1', // Increment to invalidate old cache
});
```

### Selective Persistence
```jsx
const persister = createSyncStoragePersister({
  storage: window.localStorage,
  serialize: (data) => JSON.stringify(data),
  deserialize: (data) => JSON.parse(data),
});

// Only persist specific queries
persistQueryClient({
  queryClient,
  persister,
  dehydrateOptions: {
    shouldDehydrateQuery: (query) => {
      // Only persist templates and static data
      return ['EntityTemplate', 'PageTemplate'].some(
        key => query.queryKey.includes(key)
      );
    },
  },
});
```

---

## 5. Request Deduplication

### Automatic Deduplication (Built-in)
TanStack Query automatically deduplicates simultaneous requests:

```jsx
// Multiple components calling same query simultaneously
// Only 1 network request is made
function ComponentA() {
  const { data } = useQuery(['Project'], fetchProjects);
}

function ComponentB() {
  const { data } = useQuery(['Project'], fetchProjects);
}
```

### Manual Request Batching
```jsx
function useBatchedQueries() {
  const queryClient = useQueryClient();
  
  const fetchMultiple = async (entityNames) => {
    const promises = entityNames.map(name =>
      queryClient.fetchQuery({
        queryKey: [name],
        queryFn: () => base44.entities[name].list(),
      })
    );
    
    return Promise.all(promises);
  };
  
  return fetchMultiple;
}

// Usage
const fetch = useBatchedQueries();
await fetch(['Project', 'Task', 'Customer']);
```

---

## 6. Dependent Queries

### Sequential Fetching
```jsx
function useProjectWithTasks(projectId) {
  // Fetch project first
  const { data: project } = useQuery({
    queryKey: ['Project', projectId],
    queryFn: () => base44.entities.Project.filter({ id: projectId }),
  });
  
  // Fetch tasks only after project is loaded
  const { data: tasks } = useQuery({
    queryKey: ['Task', projectId],
    queryFn: () => base44.entities.Task.filter({ projectId }),
    enabled: !!project, // Only run when project exists
  });
  
  return { project, tasks };
}
```

### Parallel Dependent Queries
```jsx
function useProjectDependencies(projectId) {
  return useQueries({
    queries: [
      {
        queryKey: ['Project', projectId],
        queryFn: () => base44.entities.Project.filter({ id: projectId }),
      },
      {
        queryKey: ['Task', projectId],
        queryFn: () => base44.entities.Task.filter({ projectId }),
      },
      {
        queryKey: ['Contact', projectId],
        queryFn: () => base44.entities.Contact.filter({ project_id: projectId }),
      },
    ],
  });
}
```

---

## 7. Partial Cache Updates

### Update Single Item in List
```jsx
function useToggleTaskStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }) => 
      base44.entities.Task.update(id, { status }),
    onSuccess: (updatedTask) => {
      // Update task in cache without refetching
      queryClient.setQueryData(['Task'], (old) =>
        old.map((task) => 
          task.id === updatedTask.id ? updatedTask : task
        )
      );
    },
  });
}
```

### Add Item to Cached List
```jsx
function useCreateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => base44.entities.Task.create(data),
    onSuccess: (newTask) => {
      // Add to cache without refetching
      queryClient.setQueryData(['Task'], (old) => [newTask, ...old]);
    },
  });
}
```

### Remove Item from Cache
```jsx
function useDeleteTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => base44.entities.Task.delete(id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.setQueryData(['Task'], (old) =>
        old.filter((task) => task.id !== id)
      );
    },
  });
}
```

---

## 8. Cache Size Management

### Limit Cache Size
```jsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 10 * 60 * 1000,
    },
  },
  queryCache: new QueryCache({
    onError: (error) => console.error(error),
  }),
  mutationCache: new MutationCache({
    onError: (error) => console.error(error),
  }),
});

// Clear old queries periodically
setInterval(() => {
  queryClient.clear(); // Clear all
  // or
  queryClient.removeQueries({ 
    predicate: (query) => query.state.dataUpdatedAt < Date.now() - 3600000 
  });
}, 3600000); // Every hour
```

### Monitor Cache Size
```jsx
function useCacheMonitor() {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    console.log(`Total queries in cache: ${queries.length}`);
    
    const totalSize = queries.reduce((acc, query) => {
      const size = JSON.stringify(query.state.data).length;
      return acc + size;
    }, 0);
    
    console.log(`Cache size: ${(totalSize / 1024).toFixed(2)} KB`);
  }, []);
}
```

---

## 9. Advanced Patterns

### Cache Warming
```jsx
function useCacheWarming() {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    // Prefetch common data on app load
    const warmCache = async () => {
      await queryClient.prefetchQuery({
        queryKey: ['Project'],
        queryFn: () => base44.entities.Project.list(),
      });
      
      await queryClient.prefetchQuery({
        queryKey: ['Customer'],
        queryFn: () => base44.entities.Customer.list(),
      });
    };
    
    requestIdleCallback(() => warmCache());
  }, []);
}
```

### Stale-While-Revalidate
```jsx
function useStaleWhileRevalidate() {
  return useQuery({
    queryKey: ['Project'],
    queryFn: () => base44.entities.Project.list(),
    staleTime: 0, // Always considered stale
    cacheTime: Infinity, // Keep in cache forever
    refetchOnMount: 'always', // Always refetch, but show stale data first
  });
}
```

### Cache-First Strategy
```jsx
function useCacheFirst() {
  return useQuery({
    queryKey: ['EntityTemplate'],
    queryFn: () => base44.entities.EntityTemplate.list(),
    staleTime: Infinity, // Never refetch automatically
    cacheTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}
```

---

## 10. Performance Monitoring

### Cache Hit Rate
```jsx
function useCacheMetrics() {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    let hits = 0;
    let misses = 0;
    
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === 'updated') {
        if (event.query.state.status === 'success' && 
            event.query.state.fetchStatus === 'idle') {
          hits++;
        } else if (event.query.state.fetchStatus === 'fetching') {
          misses++;
        }
        
        const hitRate = hits / (hits + misses);
        console.log(`Cache hit rate: ${(hitRate * 100).toFixed(2)}%`);
      }
    });
    
    return unsubscribe;
  }, []);
}
```

### Request Analytics
```jsx
function useRequestAnalytics() {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.query.state.fetchStatus === 'fetching') {
        const start = performance.now();
        
        const checkComplete = () => {
          if (event.query.state.fetchStatus === 'idle') {
            const duration = performance.now() - start;
            console.log(`Query ${event.query.queryKey} took ${duration}ms`);
          } else {
            requestAnimationFrame(checkComplete);
          }
        };
        
        checkComplete();
      }
    });
    
    return unsubscribe;
  }, []);
}
```

---

## 11. Best Practices

### ✅ DO
- Set appropriate staleTime based on data volatility
- Use optimistic updates for better UX
- Invalidate related queries on mutations
- Implement cache warming for critical data
- Monitor cache hit rate and adjust strategies
- Use query keys consistently
- Leverage parallel queries for independent data

### ❌ DON'T
- Set cacheTime < staleTime (illogical)
- Invalidate entire cache on every mutation
- Store large binary data in cache
- Use overly complex query keys
- Ignore cache size (memory leaks)
- Refetch too aggressively (wasted bandwidth)
- Skip error handling in mutations

---

## 12. Troubleshooting

### Issue: Data Not Updating
**Solutions:**
1. Check staleTime (might be too long)
2. Verify invalidation after mutations
3. Enable refetchOnWindowFocus for real-time data
4. Check network tab for actual requests

### Issue: Too Many API Calls
**Solutions:**
1. Increase staleTime
2. Disable refetchOnWindowFocus
3. Implement request deduplication
4. Use prefetching strategically

### Issue: Memory Issues
**Solutions:**
1. Reduce cacheTime
2. Clear old queries periodically
3. Implement cache size limits
4. Use pagination for large datasets

---

## Resources

- [TanStack Query - Caching](https://tanstack.com/query/latest/docs/react/guides/caching)
- [TanStack Query - Optimistic Updates](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)
- [React Query DevTools](https://tanstack.com/query/latest/docs/react/devtools)