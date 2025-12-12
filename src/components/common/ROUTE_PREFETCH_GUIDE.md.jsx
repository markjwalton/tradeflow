# Route Prefetch Implementation Guide

## Overview
Route prefetching loads data for pages before users navigate to them, reducing perceived latency and improving user experience.

---

## Implementation Status

### ✅ Already Implemented
- **Sidebar Navigation**: Hover-based prefetching for all nav items
- **usePrefetchRoute Hook**: Centralized prefetch functions for common routes
- **Query Client Integration**: Uses TanStack Query's built-in prefetch

### 🎯 High-Traffic Routes with Prefetch
1. **Projects** - Prefetches Project, Customer, TeamMember
2. **Tasks** - Prefetches Task, Project
3. **Customers** - Prefetches Customer, Project
4. **Team** - Prefetches TeamMember, Absence
5. **MindMaps** - Prefetches MindMap, MindMapNode
6. **Roadmap** - Prefetches RoadmapItem, DevelopmentSprint
7. **Libraries** - Prefetches corresponding templates

---

## Usage Patterns

### 1. Navigation Links (Already Implemented)
```jsx
import { usePrefetchRoute } from '@/components/common/usePrefetchRoute';

function Navigation() {
  const { prefetchProjects, prefetchTasks } = usePrefetchRoute();

  return (
    <Link 
      to="/projects" 
      onMouseEnter={prefetchProjects}
    >
      Projects
    </Link>
  );
}
```

### 2. Dashboard Quick Links
```jsx
function DashboardCards() {
  const { prefetchProjects, prefetchTasks } = usePrefetchRoute();

  return (
    <div className="grid gap-4">
      <Card onMouseEnter={prefetchProjects}>
        <Link to="/projects">View Projects</Link>
      </Card>
      <Card onMouseEnter={prefetchTasks}>
        <Link to="/tasks">View Tasks</Link>
      </Card>
    </div>
  );
}
```

### 3. Breadcrumb Navigation
```jsx
function Breadcrumb({ items }) {
  const { prefetchProjects } = usePrefetchRoute();

  return (
    <nav>
      {items.map(item => (
        <Link 
          key={item.id}
          to={item.path}
          onMouseEnter={() => {
            if (item.path.includes('projects')) {
              prefetchProjects();
            }
          }}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
```

### 4. Table Row Actions
```jsx
function ProjectRow({ project }) {
  const { prefetchTasks } = usePrefetchRoute();

  return (
    <tr>
      <td>{project.name}</td>
      <td>
        <Link 
          to={`/projects/${project.id}/tasks`}
          onMouseEnter={prefetchTasks}
        >
          View Tasks
        </Link>
      </td>
    </tr>
  );
}
```

---

## Performance Optimizations

### 1. Debounced Prefetching
Already implemented in AppSidebar with 100ms delay:
```jsx
const handleMouseEnter = (pageName) => {
  const prefetchFn = prefetchMap[pageName];
  if (prefetchFn) {
    setTimeout(() => prefetchFn(), 100); // Prevent excessive calls
  }
};
```

### 2. Idle Callback Strategy
```jsx
export function prefetchOnIdle(queryClient, entities) {
  if (typeof window !== 'undefined' && window.requestIdleCallback) {
    window.requestIdleCallback(() => {
      entities.forEach(entityName => {
        queryClient.prefetchQuery({
          queryKey: [entityName],
          queryFn: () => base44.entities[entityName]?.list(),
          staleTime: 5 * 60 * 1000,
        });
      });
    });
  }
}
```

### 3. Stale Time Configuration
- **Default**: 5 minutes (300,000ms)
- **Static data** (templates, configs): 15 minutes
- **Dynamic data** (live projects, tasks): 2 minutes

```jsx
queryClient.prefetchQuery({
  queryKey: ['Project'],
  queryFn: () => base44.entities.Project.list(),
  staleTime: 2 * 60 * 1000, // 2 minutes for dynamic data
});
```

---

## Best Practices

### ✅ DO
- Prefetch on **hover** for navigation links
- Prefetch on **intent** (mouseenter on cards/buttons)
- Use **debouncing** to prevent excessive prefetch calls
- Prefetch **related entities** together (Project + Customer)
- Configure **appropriate stale times** based on data freshness
- Prefetch during **idle time** for low-priority data

### ❌ DON'T
- Prefetch on every mouse movement
- Prefetch large datasets (> 1000 records)
- Prefetch without debouncing
- Prefetch unrelated entities
- Use aggressive stale times (< 1 minute)
- Prefetch data that changes frequently in real-time

---

## Monitoring Prefetch Performance

### React Query DevTools
```jsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function App() {
  return (
    <>
      <YourApp />
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
}
```

**Check:**
- Query cache hit rate
- Prefetch timing (should complete before navigation)
- Stale data revalidation frequency

### Performance Metrics
```jsx
// Track prefetch effectiveness
const measurePrefetch = (routeName) => {
  performance.mark(`prefetch-${routeName}-start`);
  
  prefetchFunction().then(() => {
    performance.mark(`prefetch-${routeName}-end`);
    performance.measure(
      `prefetch-${routeName}`,
      `prefetch-${routeName}-start`,
      `prefetch-${routeName}-end`
    );
  });
};
```

---

## Advanced Patterns

### 1. Predictive Prefetching
Track navigation patterns and prefetch likely next pages:
```jsx
function usePredictivePrefetch() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  
  useEffect(() => {
    // Track last 5 pages
    setHistory(prev => [...prev.slice(-4), location.pathname]);
    
    // Predict next page based on patterns
    if (history.includes('/projects') && location.pathname === '/projects') {
      // User likely to view tasks next
      setTimeout(() => prefetchTasks(), 2000);
    }
  }, [location]);
}
```

### 2. Progressive Prefetching
Prefetch in stages based on priority:
```jsx
function useProgressivePrefetch() {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    // Stage 1: Immediate (high priority)
    prefetchProjects();
    
    // Stage 2: After 1 second
    setTimeout(() => {
      prefetchTasks();
      prefetchCustomers();
    }, 1000);
    
    // Stage 3: On idle (low priority)
    requestIdleCallback(() => {
      prefetchLibrary('EntityLibrary');
    });
  }, []);
}
```

### 3. Conditional Prefetching
Only prefetch when necessary:
```jsx
function useConditionalPrefetch() {
  const { prefetchProjects } = usePrefetchRoute();
  const queryClient = useQueryClient();
  
  const handleHover = () => {
    // Check if data is already cached
    const cached = queryClient.getQueryData(['Project']);
    
    if (!cached) {
      prefetchProjects();
    }
  };
  
  return handleHover;
}
```

---

## Network Optimization

### 1. Reduce Prefetch Payload
```js
// Backend: Add pagination to list endpoints
queryFn: () => base44.entities.Project.list('-updated_date', 50) // Limit to 50
```

### 2. Selective Field Loading
```js
// If supported by backend
queryFn: () => base44.entities.Project.list({
  fields: ['id', 'name', 'status'] // Only essential fields
})
```

### 3. Network-Aware Prefetching
```jsx
function useNetworkAwarePrefetch() {
  const [shouldPrefetch, setShouldPrefetch] = useState(true);
  
  useEffect(() => {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      // Don't prefetch on slow connections
      setShouldPrefetch(connection.effectiveType !== 'slow-2g');
    }
  }, []);
  
  return shouldPrefetch;
}
```

---

## Testing Prefetch

### Manual Testing
1. Open React Query DevTools
2. Hover over navigation link
3. Check "Queries" tab - should see prefetch in progress
4. Navigate to page - data should load instantly
5. Verify no duplicate requests

### Automated Testing
```jsx
test('prefetches projects on hover', async () => {
  const { getByText } = render(<Navigation />);
  const link = getByText('Projects');
  
  fireEvent.mouseEnter(link);
  
  await waitFor(() => {
    expect(queryClient.getQueryData(['Project'])).toBeTruthy();
  });
});
```

---

## Troubleshooting

### Issue: Prefetch Not Working
**Causes:**
- QueryClient not in context
- Entity name mismatch
- Network error

**Solutions:**
1. Check React Query DevTools
2. Verify entity exists in base44.entities
3. Check browser network tab for failed requests
4. Ensure QueryClientProvider wraps app

### Issue: Too Many Prefetch Calls
**Causes:**
- No debouncing
- Multiple hover events
- Aggressive mouse tracking

**Solutions:**
1. Add debounce (100-300ms)
2. Track last prefetch timestamp
3. Use mouseenter instead of mousemove

### Issue: Stale Data After Prefetch
**Causes:**
- Stale time too long
- No revalidation
- Cache not invalidated

**Solutions:**
1. Reduce staleTime for dynamic data
2. Invalidate queries on mutations
3. Use background refetch

---

## Configuration Reference

```jsx
// Global query defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Route-specific overrides
const routeConfig = {
  projects: {
    entities: ['Project', 'Customer'],
    staleTime: 2 * 60 * 1000, // 2 minutes
  },
  dashboard: {
    entities: ['Project', 'Task', 'TeamMember'],
    staleTime: 1 * 60 * 1000, // 1 minute
  },
  library: {
    entities: ['EntityTemplate'],
    staleTime: 15 * 60 * 1000, // 15 minutes
  },
};
```

---

## Resources

- [TanStack Query - Prefetching](https://tanstack.com/query/latest/docs/react/guides/prefetching)
- [Web Performance - Resource Hints](https://web.dev/preconnect-and-dns-prefetch/)
- [React Router - Lazy Loading](https://reactrouter.com/en/main/route/lazy)