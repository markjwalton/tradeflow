# API Caching Synergy Guide

## TanStack Query + Backend Caching

### Client-Side Configuration

```javascript
// components/common/queryConfig.js
export const queryConfig = {
  queries: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  },
};

// Override per entity
export const entityQueryConfig = {
  Project: { staleTime: 2 * 60 * 1000 }, // 2 min - frequently updated
  Customer: { staleTime: 10 * 60 * 1000 }, // 10 min - rarely changes
  TeamMember: { staleTime: 15 * 60 * 1000 }, // 15 min - stable data
};
```

### Backend Headers (Base44)

Ensure backend functions set proper headers:

```javascript
// functions/listProjects.js
export default async function handler(req) {
  const data = await fetchProjects();
  
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
      'ETag': generateETag(data),
    },
  });
}
```

### ETag Support

#### Backend Implementation

```javascript
import crypto from 'crypto';

function generateETag(data) {
  return crypto
    .createHash('md5')
    .update(JSON.stringify(data))
    .digest('hex');
}

export default async function handler(req) {
  const data = await fetchData();
  const etag = generateETag(data);
  
  // Check If-None-Match header
  if (req.headers.get('If-None-Match') === etag) {
    return new Response(null, {
      status: 304,
      headers: { 'ETag': etag },
    });
  }
  
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'ETag': etag,
      'Cache-Control': 'private, max-age=300',
    },
  });
}
```

#### Client Integration

```javascript
// Axios/fetch interceptor
const addETagSupport = (config) => {
  const cachedETag = localStorage.getItem(`etag_${config.url}`);
  if (cachedETag) {
    config.headers['If-None-Match'] = cachedETag;
  }
  return config;
};

// Store ETags from responses
const storeETag = (response) => {
  const etag = response.headers.get('ETag');
  if (etag) {
    localStorage.setItem(`etag_${response.url}`, etag);
  }
  return response;
};
```

### Cache-Control Strategies

#### Static Lists (rarely change)

```javascript
'Cache-Control': 'public, max-age=3600, immutable'
```

#### Dynamic Data (frequent updates)

```javascript
'Cache-Control': 'private, max-age=60, must-revalidate'
```

#### User-Specific Data

```javascript
'Cache-Control': 'private, no-cache, no-store'
```

#### With Stale-While-Revalidate

```javascript
'Cache-Control': 'public, max-age=300, stale-while-revalidate=60'
```

### Optimistic Updates

```javascript
const { mutate } = useMutation({
  mutationFn: (data) => base44.entities.Project.update(id, data),
  onMutate: async (newData) => {
    await queryClient.cancelQueries({ queryKey: ['projects'] });
    
    const previousProjects = queryClient.getQueryData(['projects']);
    
    queryClient.setQueryData(['projects'], (old) =>
      old.map(p => p.id === id ? { ...p, ...newData } : p)
    );
    
    return { previousProjects };
  },
  onError: (err, newData, context) => {
    queryClient.setQueryData(['projects'], context.previousProjects);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['projects'] });
  },
});
```

### Prefetching Strategy

```javascript
// Prefetch on hover
const prefetchProject = (id) => {
  queryClient.prefetchQuery({
    queryKey: ['project', id],
    queryFn: () => base44.entities.Project.get(id),
    staleTime: 5 * 60 * 1000,
  });
};

<Link 
  to={`/projects/${project.id}`}
  onMouseEnter={() => prefetchProject(project.id)}
>
  {project.name}
</Link>
```

### Cache Invalidation

```javascript
// After mutation
queryClient.invalidateQueries({ queryKey: ['projects'] });

// Specific project
queryClient.invalidateQueries({ queryKey: ['project', id] });

// All project-related
queryClient.invalidateQueries({ queryKey: ['projects'], exact: false });

// Refetch immediately
queryClient.refetchQueries({ queryKey: ['projects'] });
```

### Background Refetching

```javascript
// Automatic background updates
const { data } = useQuery({
  queryKey: ['projects'],
  queryFn: fetchProjects,
  refetchInterval: 5 * 60 * 1000, // 5 minutes
  refetchIntervalInBackground: true,
});
```

## Best Practices

### 1. Layered Caching

```
Browser Cache (HTTP)
  ↓
TanStack Query (Memory)
  ↓
CDN/Proxy (if applicable)
  ↓
Backend Cache (Redis/etc)
  ↓
Database
```

### 2. Cache Keys Structure

```javascript
// Hierarchical keys
['projects'] // All projects
['projects', { status: 'active' }] // Filtered
['project', id] // Single project
['project', id, 'tasks'] // Related data
```

### 3. Dependent Queries

```javascript
const { data: project } = useQuery({
  queryKey: ['project', id],
  queryFn: () => base44.entities.Project.get(id),
});

const { data: tasks } = useQuery({
  queryKey: ['project', id, 'tasks'],
  queryFn: () => base44.entities.Task.filter({ projectId: id }),
  enabled: !!project, // Only fetch when project loaded
});
```

### 4. Infinite Queries for Pagination

```javascript
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useInfiniteQuery({
  queryKey: ['projects'],
  queryFn: ({ pageParam = 0 }) => fetchProjects(pageParam),
  getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
  staleTime: 5 * 60 * 1000,
});
```

## Monitoring Cache Effectiveness

```javascript
// Log cache hits/misses
const { data, dataUpdatedAt } = useQuery({
  queryKey: ['projects'],
  queryFn: fetchProjects,
  onSuccess: (data) => {
    console.log('Cache age:', Date.now() - dataUpdatedAt, 'ms');
  },
});

// React Query DevTools
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<ReactQueryDevtools initialIsOpen={false} />
```

## Checklist

- [ ] Backend returns proper Cache-Control headers
- [ ] ETag support implemented
- [ ] TanStack Query configured with appropriate staleTime
- [ ] Optimistic updates for mutations
- [ ] Prefetching on hover/intent
- [ ] Cache invalidation after mutations
- [ ] Background refetching for critical data
- [ ] React Query DevTools installed
- [ ] Cache effectiveness monitored
- [ ] CDN configured for static assets