# API Caching Strategy Guide

## TanStack Query Configuration

### Current Implementation
TanStack Query is configured with default caching in `query-config.js`:
- Default `staleTime`: 30 seconds (data considered fresh)
- Default `cacheTime`: 5 minutes (data kept in memory)
- Automatic retries on failure

### Recommended Configurations by Data Type

#### Static/Rarely Changing Data (1+ hour)
```js
const { data } = useQuery({
  queryKey: ['entityTemplates'],
  queryFn: () => base44.entities.EntityTemplate.list(),
  staleTime: 3600000, // 1 hour
  cacheTime: 7200000, // 2 hours
});
```

Examples: Templates, configurations, reference data

#### Semi-Static Data (5-30 minutes)
```js
const { data } = useQuery({
  queryKey: ['projects'],
  queryFn: () => base44.entities.Project.list(),
  staleTime: 300000, // 5 minutes
  cacheTime: 600000, // 10 minutes
});
```

Examples: Projects, customers, team members

#### Real-Time Data (0-30 seconds)
```js
const { data } = useQuery({
  queryKey: ['activeTasks'],
  queryFn: () => base44.entities.Task.filter({ status: 'in_progress' }),
  staleTime: 30000, // 30 seconds
  refetchInterval: 30000, // Auto-refresh every 30s
});
```

Examples: Active tasks, notifications, live status

## Backend Caching Strategy

### ETags (Entity Tags)
Backend should return ETags for cacheable resources:

```js
// Backend Response Headers
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
Cache-Control: max-age=300, must-revalidate

// Frontend Request
If-None-Match: "33a64df551425fcc55e4d42a148795d9f25f89d4"
// Returns 304 Not Modified if unchanged
```

### Cache-Control Headers

#### Immutable Resources
```
Cache-Control: public, max-age=31536000, immutable
```
Use for: Assets, versioned files

#### Private User Data
```
Cache-Control: private, max-age=300
```
Use for: User profiles, personal data

#### Dynamic Lists
```
Cache-Control: max-age=60, must-revalidate
```
Use for: List views, filtered results

#### Real-Time Data
```
Cache-Control: no-cache
```
Use for: Live updates, notifications

## Query Invalidation Patterns

### After Mutations
```js
const createMutation = useMutation({
  mutationFn: (data) => base44.entities.Project.create(data),
  onSuccess: () => {
    // Invalidate related queries
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    queryClient.invalidateQueries({ queryKey: ['projectsCount'] });
  }
});
```

### Selective Invalidation
```js
// Invalidate specific query
queryClient.invalidateQueries({ 
  queryKey: ['project', projectId],
  exact: true 
});

// Invalidate all project queries
queryClient.invalidateQueries({ 
  queryKey: ['projects']
});
```

## Performance Optimizations

### Prefetching
```js
// Prefetch on route hover
const prefetchProject = (id) => {
  queryClient.prefetchQuery({
    queryKey: ['project', id],
    queryFn: () => base44.entities.Project.get(id),
    staleTime: 60000,
  });
};
```

### Background Refetching
```js
const { data } = useQuery({
  queryKey: ['tasks'],
  queryFn: () => base44.entities.Task.list(),
  staleTime: 60000,
  refetchOnWindowFocus: true, // Refetch when user returns to tab
  refetchOnReconnect: true,   // Refetch when internet reconnects
});
```

## Testing Cache Behavior

### Check Browser Network Tab
- Look for 304 responses (cached)
- Verify If-None-Match headers
- Check Cache-Control headers

### Query DevTools
```js
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Add to app
<ReactQueryDevtools initialIsOpen={false} />
```

## Implementation Checklist

- [ ] Review all useQuery calls and set appropriate staleTime
- [ ] Add ETags support in backend API
- [ ] Configure Cache-Control headers per endpoint
- [ ] Implement query prefetching for critical paths
- [ ] Set up query invalidation after mutations
- [ ] Test cache behavior with DevTools
- [ ] Document cache strategy per entity type