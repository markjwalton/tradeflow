# API Integration Guide

## Overview
Comprehensive guide for integrating with APIs, managing API calls, handling errors, implementing loading states, caching strategies, and optimizing network requests.

---

## 1. Base44 SDK Overview

### Authentication and Authorization

```jsx
import { base44 } from '@/api/base44Client';

// Get current user
const user = await base44.auth.me();

// Check if authenticated
const isAuthenticated = await base44.auth.isAuthenticated();

// Logout
base44.auth.logout();

// Redirect to login
base44.auth.redirectToLogin('/dashboard'); // Redirect after login

// Update current user
await base44.auth.updateMe({ 
  theme_preferences: { darkMode: true } 
});
```

### Entity Operations

```jsx
import { base44 } from '@/api/base44Client';

// List all records
const projects = await base44.entities.Project.list();

// List with sorting and limit
const recentProjects = await base44.entities.Project.list('-created_date', 20);

// Filter records
const activeProjects = await base44.entities.Project.filter({
  status: 'active',
  created_by: user.email
});

// Get single record
const project = await base44.entities.Project.get(projectId);

// Create record
const newProject = await base44.entities.Project.create({
  name: 'New Project',
  description: 'Project description',
  status: 'active'
});

// Bulk create
const projects = await base44.entities.Project.bulkCreate([
  { name: 'Project 1', status: 'active' },
  { name: 'Project 2', status: 'planning' }
]);

// Update record
const updated = await base44.entities.Project.update(projectId, {
  status: 'completed'
});

// Delete record
await base44.entities.Project.delete(projectId);

// Get entity schema
const schema = await base44.entities.Project.schema();
```

---

## 2. React Query Integration

### Setup QueryClient

```jsx
// App.jsx or main entry
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app */}
    </QueryClientProvider>
  );
}
```

### Basic Query Hook

```jsx
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

function ProjectList() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list(),
  });

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      {data.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
      <Button onClick={refetch}>Refresh</Button>
    </div>
  );
}
```

### Query with Parameters

```jsx
function UserProjects({ userId }) {
  const { data: projects } = useQuery({
    queryKey: ['projects', userId],
    queryFn: () => base44.entities.Project.filter({ 
      created_by: userId 
    }),
    enabled: !!userId, // Only run when userId exists
  });

  return (
    <div>
      {projects?.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
```

### Mutations

```jsx
import { useMutation, useQueryClient } from '@tanstack/react-query';

function CreateProjectForm() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (projectData) => base44.entities.Project.create(projectData),
    onSuccess: (newProject) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      
      // Or optimistically update
      queryClient.setQueryData(['projects'], (old) => [...old, newProject]);
      
      toast.success('Project created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create project');
    },
  });

  const handleSubmit = (formData) => {
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <Button 
        type="submit" 
        disabled={mutation.isLoading}
      >
        {mutation.isLoading ? 'Creating...' : 'Create Project'}
      </Button>
    </form>
  );
}
```

### Optimistic Updates

```jsx
const updateMutation = useMutation({
  mutationFn: ({ id, data }) => base44.entities.Project.update(id, data),
  
  onMutate: async ({ id, data }) => {
    // Cancel outgoing queries
    await queryClient.cancelQueries({ queryKey: ['projects', id] });
    
    // Snapshot previous value
    const previous = queryClient.getQueryData(['projects', id]);
    
    // Optimistically update
    queryClient.setQueryData(['projects', id], (old) => ({
      ...old,
      ...data,
    }));
    
    // Return context with snapshot
    return { previous };
  },
  
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(
      ['projects', variables.id],
      context.previous
    );
  },
  
  onSettled: (data, error, variables) => {
    // Refetch after error or success
    queryClient.invalidateQueries({ queryKey: ['projects', variables.id] });
  },
});
```

---

## 3. Loading States

### Component-Level Loading

```jsx
function ProjectDetail({ projectId }) {
  const { data: project, isLoading, isFetching } = useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => base44.entities.Project.get(projectId),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {isFetching && <LoadingIndicator />}
      <CardHeader>
        <CardTitle>{project.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {project.description}
      </CardContent>
    </Card>
  );
}
```

### Skeleton Loaders

```jsx
// SkeletonCard.jsx
export function SkeletonCard() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2 mt-2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-20 w-full" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-24" />
      </CardFooter>
    </Card>
  );
}

// Usage
function ProjectList() {
  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list(),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {Array(6).fill(0).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {data.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
```

### Loading Indicators

```jsx
// Global loading with Suspense
import { Suspense } from 'react';

function App() {
  return (
    <Suspense fallback={<GlobalLoader />}>
      <Router />
    </Suspense>
  );
}

// Inline loading
function DataComponent() {
  const { data, isLoading } = useQuery({...});

  return (
    <div>
      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <DataDisplay data={data} />
      )}
    </div>
  );
}

// Button loading state
<Button disabled={mutation.isLoading}>
  {mutation.isLoading && (
    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  )}
  {mutation.isLoading ? 'Saving...' : 'Save'}
</Button>
```

---

## 4. Error Handling

### Query Error Handling

```jsx
function ProjectList() {
  const { data, error, isError, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list(),
  });

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error.message || 'Failed to load projects'}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            className="mt-2"
          >
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return <ProjectGrid projects={data} />;
}
```

### Mutation Error Handling

```jsx
const mutation = useMutation({
  mutationFn: (data) => base44.entities.Project.create(data),
  onError: (error) => {
    // Display error to user
    if (error.response?.status === 400) {
      toast.error('Invalid data. Please check your input.');
    } else if (error.response?.status === 403) {
      toast.error('You do not have permission to create projects.');
    } else {
      toast.error('An unexpected error occurred. Please try again.');
    }
    
    // Log to error tracking service
    console.error('Project creation failed:', error);
  },
});
```

### Global Error Boundary

```jsx
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

function App() {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallback={({ error, resetErrorBoundary }) => (
            <div className="p-8 text-center">
              <h2>Something went wrong</h2>
              <p>{error.message}</p>
              <Button onClick={resetErrorBoundary}>
                Try Again
              </Button>
            </div>
          )}
        >
          <QueryClientProvider client={queryClient}>
            <Router />
          </QueryClientProvider>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
```

---

## 5. Caching Strategies

### Cache Configuration

```jsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // How long data is considered fresh
      staleTime: 5 * 60 * 1000, // 5 minutes
      
      // How long to keep in cache after unused
      cacheTime: 10 * 60 * 1000, // 10 minutes
      
      // Retry failed requests
      retry: 1,
      
      // Refetch on window focus
      refetchOnWindowFocus: false,
      
      // Refetch on reconnect
      refetchOnReconnect: true,
    },
  },
});
```

### Per-Query Cache Settings

```jsx
// Static data - long cache
const { data: countries } = useQuery({
  queryKey: ['countries'],
  queryFn: fetchCountries,
  staleTime: Infinity, // Never stale
  cacheTime: Infinity, // Never remove from cache
});

// Real-time data - short cache
const { data: liveStats } = useQuery({
  queryKey: ['stats'],
  queryFn: fetchStats,
  staleTime: 0, // Always stale
  refetchInterval: 10000, // Refetch every 10s
});

// User-specific data - moderate cache
const { data: userProjects } = useQuery({
  queryKey: ['projects', userId],
  queryFn: () => base44.entities.Project.filter({ created_by: userId }),
  staleTime: 2 * 60 * 1000, // 2 minutes
});
```

### Manual Cache Management

```jsx
const queryClient = useQueryClient();

// Get cached data
const projects = queryClient.getQueryData(['projects']);

// Set cache data
queryClient.setQueryData(['projects'], newProjects);

// Invalidate cache (trigger refetch)
queryClient.invalidateQueries({ queryKey: ['projects'] });

// Remove from cache
queryClient.removeQueries({ queryKey: ['projects'] });

// Prefetch data
await queryClient.prefetchQuery({
  queryKey: ['projects'],
  queryFn: () => base44.entities.Project.list(),
});

// Cancel queries
await queryClient.cancelQueries({ queryKey: ['projects'] });
```

---

## 6. Pagination

### Offset-Based Pagination

```jsx
function ProjectList() {
  const [page, setPage] = React.useState(1);
  const pageSize = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['projects', page],
    queryFn: async () => {
      const allProjects = await base44.entities.Project.list();
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      return {
        data: allProjects.slice(start, end),
        total: allProjects.length,
        hasMore: end < allProjects.length,
      };
    },
    keepPreviousData: true, // Keep old data while fetching new
  });

  return (
    <div>
      <ProjectGrid projects={data?.data} />
      
      <div className="flex gap-2 mt-4">
        <Button
          onClick={() => setPage(p => p - 1)}
          disabled={page === 1}
        >
          Previous
        </Button>
        <span>Page {page}</span>
        <Button
          onClick={() => setPage(p => p + 1)}
          disabled={!data?.hasMore}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
```

### Infinite Scroll

```jsx
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';

function InfiniteProjectList() {
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['projects'],
    queryFn: async ({ pageParam = 0 }) => {
      const allProjects = await base44.entities.Project.list();
      const start = pageParam * 20;
      const end = start + 20;
      return {
        data: allProjects.slice(start, end),
        nextCursor: end < allProjects.length ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  React.useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  return (
    <div>
      {data?.pages.map((page, i) => (
        <div key={i}>
          {page.data.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ))}
      
      {hasNextPage && (
        <div ref={ref} className="py-4 text-center">
          {isFetchingNextPage ? 'Loading more...' : 'Load more'}
        </div>
      )}
    </div>
  );
}
```

---

## 7. Real-Time Updates

### Polling

```jsx
function LiveDashboard() {
  const { data } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => base44.entities.Stats.list(),
    refetchInterval: 5000, // Poll every 5 seconds
    refetchIntervalInBackground: true, // Continue when tab inactive
  });

  return <DashboardStats data={data} />;
}
```

### Manual Refetch

```jsx
function ProjectDetail({ projectId }) {
  const { data, refetch } = useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => base44.entities.Project.get(projectId),
  });

  const handleRefresh = () => {
    refetch();
    toast.info('Refreshing project data...');
  };

  return (
    <div>
      <Button onClick={handleRefresh}>
        <RefreshCw className="h-4 w-4 mr-2" />
        Refresh
      </Button>
      <ProjectDetails project={data} />
    </div>
  );
}
```

---

## 8. Dependent Queries

### Sequential Queries

```jsx
function UserProjectsAndTasks({ userId }) {
  // First query - get user
  const { data: user } = useQuery({
    queryKey: ['users', userId],
    queryFn: () => base44.entities.User.get(userId),
  });

  // Second query - depends on first
  const { data: projects } = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: () => base44.entities.Project.filter({
      created_by: user.email
    }),
    enabled: !!user, // Only run when user is loaded
  });

  // Third query - depends on second
  const { data: tasks } = useQuery({
    queryKey: ['tasks', projects?.[0]?.id],
    queryFn: () => base44.entities.Task.filter({
      project_id: projects[0].id
    }),
    enabled: !!projects?.length,
  });

  return (
    <div>
      {tasks?.map(task => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}
```

### Parallel Queries

```jsx
function Dashboard() {
  // Run multiple queries in parallel
  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list(),
  });

  const tasksQuery = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list(),
  });

  const statsQuery = useQuery({
    queryKey: ['stats'],
    queryFn: () => base44.entities.Stats.list(),
  });

  if (projectsQuery.isLoading || tasksQuery.isLoading || statsQuery.isLoading) {
    return <Spinner />;
  }

  return (
    <div>
      <ProjectsWidget projects={projectsQuery.data} />
      <TasksWidget tasks={tasksQuery.data} />
      <StatsWidget stats={statsQuery.data} />
    </div>
  );
}
```

---

## 9. Backend Functions

### Calling Backend Functions

```jsx
import { base44 } from '@/api/base44Client';

// Simple function call
const result = await base44.functions.invoke('myFunction', {
  param1: 'value1',
  param2: 'value2',
});

// With React Query
const { data } = useQuery({
  queryKey: ['customFunction', params],
  queryFn: () => base44.functions.invoke('myFunction', params),
});

// With mutation
const mutation = useMutation({
  mutationFn: (data) => base44.functions.invoke('processData', data),
});
```

### Error Handling in Functions

```jsx
const mutation = useMutation({
  mutationFn: async (data) => {
    try {
      const result = await base44.functions.invoke('processPayment', data);
      return result;
    } catch (error) {
      if (error.response?.status === 400) {
        throw new Error('Invalid payment details');
      } else if (error.response?.status === 402) {
        throw new Error('Insufficient funds');
      }
      throw error;
    }
  },
  onError: (error) => {
    toast.error(error.message);
  },
});
```

---

## 10. Request Deduplication

### Automatic Deduplication

```jsx
// React Query automatically deduplicates
// These will only make ONE request
function Component1() {
  const { data } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list(),
  });
}

function Component2() {
  const { data } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list(),
  });
}
```

### Manual Deduplication with AbortController

```jsx
const abortControllers = new Map();

async function fetchWithDeduplication(key, fn) {
  // Cancel previous request with same key
  if (abortControllers.has(key)) {
    abortControllers.get(key).abort();
  }

  // Create new controller
  const controller = new AbortController();
  abortControllers.set(key, controller);

  try {
    const result = await fn(controller.signal);
    abortControllers.delete(key);
    return result;
  } catch (error) {
    if (error.name === 'AbortError') {
      return null; // Request cancelled
    }
    throw error;
  }
}
```

---

## 11. Performance Optimization

### Prefetching

```jsx
import { useQueryClient } from '@tanstack/react-query';

function ProjectList() {
  const queryClient = useQueryClient();

  const handleMouseEnter = (projectId) => {
    // Prefetch project details on hover
    queryClient.prefetchQuery({
      queryKey: ['projects', projectId],
      queryFn: () => base44.entities.Project.get(projectId),
    });
  };

  return (
    <div>
      {projects.map(project => (
        <div
          key={project.id}
          onMouseEnter={() => handleMouseEnter(project.id)}
        >
          <Link to={`/projects/${project.id}`}>
            {project.name}
          </Link>
        </div>
      ))}
    </div>
  );
}
```

### Lazy Loading

```jsx
import { lazy, Suspense } from 'react';

const ProjectDetail = lazy(() => import('./ProjectDetail'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <ProjectDetail />
    </Suspense>
  );
}
```

---

## 12. Best Practices

### ✅ DO
- Use React Query for server state
- Implement proper loading states
- Handle all error cases
- Use optimistic updates where appropriate
- Leverage caching effectively
- Deduplicate requests
- Show meaningful error messages
- Implement retry logic
- Use TypeScript for API types
- Log errors for debugging
- Test API integration
- Use proper query keys
- Invalidate stale data
- Prefetch on hover for better UX

### ❌ DON'T
- Fetch data in useEffect manually
- Ignore error states
- Block UI unnecessarily
- Make redundant API calls
- Store server data in local state
- Forget to handle loading states
- Use generic error messages
- Skip request cancellation
- Hardcode API responses
- Ignore cache invalidation
- Fetch data you don't need
- Use index as query key

---

## Resources

- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Base44 SDK Documentation](https://docs.base44.com)
- [React Query Best Practices](https://tkdodo.eu/blog/practical-react-query)
- [Error Handling in React](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)