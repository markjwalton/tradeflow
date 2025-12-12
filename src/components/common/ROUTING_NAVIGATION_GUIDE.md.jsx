# Routing & Navigation Guide

## Overview
Comprehensive guide to routing and navigation in React applications using React Router and Base44's navigation utilities.

---

## 1. Basic Routing Setup

### Router Configuration

```jsx
// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### Base44 Page URLs

```jsx
import { createPageUrl } from '@/utils';

// Create URL for Base44 page
const projectsUrl = createPageUrl('Projects');
// Result: /?page=Projects

// With query parameters
const detailUrl = createPageUrl('ProjectDetail') + '?id=123';
// Result: /?page=ProjectDetail&id=123
```

---

## 2. Navigation

### Link Component

```jsx
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

function Navigation() {
  return (
    <nav>
      {/* Base44 page navigation */}
      <Link to={createPageUrl('Dashboard')}>Dashboard</Link>
      <Link to={createPageUrl('Projects')}>Projects</Link>
      
      {/* With query params */}
      <Link to={createPageUrl('Projects') + '?filter=active'}>
        Active Projects
      </Link>
      
      {/* External link */}
      <a href="https://example.com" target="_blank" rel="noopener noreferrer">
        External
      </a>
    </nav>
  );
}
```

### Programmatic Navigation

```jsx
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

function CreateProject() {
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    const project = await base44.entities.Project.create(data);
    
    // Navigate to project detail
    navigate(createPageUrl('ProjectDetail') + `?id=${project.id}`);
  };

  const handleCancel = () => {
    // Go back
    navigate(-1);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <Button type="submit">Create</Button>
      <Button type="button" onClick={handleCancel}>Cancel</Button>
    </form>
  );
}
```

---

## 3. URL Parameters

### Reading URL Parameters

```jsx
function ProjectDetail() {
  // Get query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');
  const tab = urlParams.get('tab') || 'overview';

  const { data: project } = useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => base44.entities.Project.get(projectId),
    enabled: !!projectId,
  });

  if (!projectId) {
    return <div>Project ID required</div>;
  }

  return (
    <div>
      <h1>{project?.name}</h1>
      <Tabs value={tab}>
        {/* Tab content */}
      </Tabs>
    </div>
  );
}
```

### Custom Hook for URL Parameters

```jsx
function useQueryParams() {
  const [params, setParams] = React.useState(() => {
    return new URLSearchParams(window.location.search);
  });

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(window.location.search);
    if (value === null || value === undefined) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    window.history.pushState(null, '', `?${newParams.toString()}`);
    setParams(newParams);
  };

  const getParam = (key) => params.get(key);

  const getAllParams = () => Object.fromEntries(params.entries());

  return { getParam, updateParam, getAllParams, params };
}

// Usage
function FilteredList() {
  const { getParam, updateParam } = useQueryParams();
  const filter = getParam('filter') || 'all';

  return (
    <div>
      <select 
        value={filter} 
        onChange={(e) => updateParam('filter', e.target.value)}
      >
        <option value="all">All</option>
        <option value="active">Active</option>
        <option value="completed">Completed</option>
      </select>
    </div>
  );
}
```

---

## 4. Navigation State

### Passing State with Navigation

```jsx
function ProjectList() {
  const navigate = useNavigate();

  const handleProjectClick = (project) => {
    navigate(createPageUrl('ProjectDetail') + `?id=${project.id}`, {
      state: { from: 'list', project }
    });
  };

  return (
    <div>
      {projects.map(project => (
        <div key={project.id} onClick={() => handleProjectClick(project)}>
          {project.name}
        </div>
      ))}
    </div>
  );
}

function ProjectDetail() {
  const location = useLocation();
  const state = location.state;

  // Can access passed state
  const from = state?.from; // 'list'
  const cachedProject = state?.project;

  return (
    <div>
      {from === 'list' && (
        <Button onClick={() => navigate(-1)}>
          Back to List
        </Button>
      )}
    </div>
  );
}
```

---

## 5. Protected Routes

### Authentication Guard

```jsx
function ProtectedRoute({ children }) {
  const { data: user, isLoading } = useQuery({
    queryKey: ['auth'],
    queryFn: () => base44.auth.me(),
  });

  if (isLoading) {
    return <Spinner />;
  }

  if (!user) {
    base44.auth.redirectToLogin(window.location.pathname);
    return null;
  }

  return children;
}

// Usage
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } 
/>
```

### Role-Based Access

```jsx
function RoleGuard({ children, requiredRole }) {
  const { data: user } = useQuery({
    queryKey: ['auth'],
    queryFn: () => base44.auth.me(),
  });

  if (!user) {
    return <Navigate to={createPageUrl('Login')} />;
  }

  if (user.role !== requiredRole) {
    return <div>Access Denied</div>;
  }

  return children;
}

// Usage
<Route 
  path="/admin" 
  element={
    <RoleGuard requiredRole="admin">
      <AdminPanel />
    </RoleGuard>
  } 
/>
```

---

## 6. Navigation Patterns

### Breadcrumbs

```jsx
function Breadcrumbs() {
  const urlParams = new URLSearchParams(window.location.search);
  const page = urlParams.get('page') || 'Home';

  const breadcrumbMap = {
    Dashboard: [{ name: 'Home', url: createPageUrl('Home') }],
    Projects: [
      { name: 'Home', url: createPageUrl('Home') },
      { name: 'Projects', url: createPageUrl('Projects') }
    ],
    ProjectDetail: [
      { name: 'Home', url: createPageUrl('Home') },
      { name: 'Projects', url: createPageUrl('Projects') },
      { name: 'Detail', url: '#' }
    ],
  };

  const breadcrumbs = breadcrumbMap[page] || [];

  return (
    <nav className="flex items-center gap-2 text-sm">
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronRight className="h-4 w-4" />}
          {index === breadcrumbs.length - 1 ? (
            <span className="text-muted-foreground">{crumb.name}</span>
          ) : (
            <Link to={crumb.url} className="hover:underline">
              {crumb.name}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
```

### Tabs with URL State

```jsx
function ProjectTabs() {
  const urlParams = new URLSearchParams(window.location.search);
  const activeTab = urlParams.get('tab') || 'overview';

  const setActiveTab = (tab) => {
    const newParams = new URLSearchParams(window.location.search);
    newParams.set('tab', tab);
    window.history.pushState(null, '', `?${newParams.toString()}`);
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="tasks">Tasks</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview">
        <ProjectOverview />
      </TabsContent>
      <TabsContent value="tasks">
        <ProjectTasks />
      </TabsContent>
      <TabsContent value="settings">
        <ProjectSettings />
      </TabsContent>
    </Tabs>
  );
}
```

### Sidebar Navigation

```jsx
function Sidebar() {
  const urlParams = new URLSearchParams(window.location.search);
  const currentPage = urlParams.get('page');

  const navItems = [
    { name: 'Dashboard', icon: Home, page: 'Dashboard' },
    { name: 'Projects', icon: FolderKanban, page: 'Projects' },
    { name: 'Tasks', icon: CheckSquare, page: 'Tasks' },
    { name: 'Team', icon: Users, page: 'Team' },
  ];

  return (
    <aside className="w-64 border-r">
      <nav className="p-4 space-y-2">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentPage === item.page;
          
          return (
            <Link
              key={item.page}
              to={createPageUrl(item.page)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                isActive 
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

---

## 7. Advanced Patterns

### Search with URL State

```jsx
function SearchPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const [query, setQuery] = useState(urlParams.get('q') || '');

  // Debounce search and update URL
  useEffect(() => {
    const timer = setTimeout(() => {
      const newParams = new URLSearchParams(window.location.search);
      if (query) {
        newParams.set('q', query);
      } else {
        newParams.delete('q');
      }
      window.history.pushState(null, '', `?${newParams.toString()}`);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const { data: results } = useQuery({
    queryKey: ['search', query],
    queryFn: () => searchAPI(query),
    enabled: query.length > 0,
  });

  return (
    <div>
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      <SearchResults results={results} />
    </div>
  );
}
```

### Pagination with URL

```jsx
function PaginatedList() {
  const urlParams = new URLSearchParams(window.location.search);
  const page = parseInt(urlParams.get('page') || '1');
  const pageSize = 20;

  const { data } = useQuery({
    queryKey: ['items', page],
    queryFn: () => fetchItems(page, pageSize),
  });

  const setPage = (newPage) => {
    const newParams = new URLSearchParams(window.location.search);
    newParams.set('page', newPage.toString());
    window.history.pushState(null, '', `?${newParams.toString()}`);
  };

  return (
    <div>
      <ItemList items={data?.items} />
      
      <Pagination
        currentPage={page}
        totalPages={data?.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
```

### Modal with URL State

```jsx
function ProjectList() {
  const urlParams = new URLSearchParams(window.location.search);
  const modalId = urlParams.get('modal');

  const openModal = (id) => {
    const newParams = new URLSearchParams(window.location.search);
    newParams.set('modal', id);
    window.history.pushState(null, '', `?${newParams.toString()}`);
  };

  const closeModal = () => {
    const newParams = new URLSearchParams(window.location.search);
    newParams.delete('modal');
    window.history.pushState(null, '', `?${newParams.toString()}`);
  };

  return (
    <div>
      <Button onClick={() => openModal('create')}>Create Project</Button>
      
      <Dialog open={modalId === 'create'} onOpenChange={closeModal}>
        <DialogContent>
          <CreateProjectForm onSuccess={closeModal} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

---

## 8. Navigation Guards

### Unsaved Changes Warning

```jsx
function FormPage() {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  return (
    <form onChange={() => setHasUnsavedChanges(true)}>
      {/* Form fields */}
    </form>
  );
}
```

### Loading State During Navigation

```jsx
function NavigationProgress() {
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    const handleStart = () => setIsNavigating(true);
    const handleComplete = () => setIsNavigating(false);

    // Listen for page changes
    window.addEventListener('popstate', handleComplete);

    return () => {
      window.removeEventListener('popstate', handleComplete);
    };
  }, []);

  if (!isNavigating) return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-primary animate-pulse" />
  );
}
```

---

## 9. Best Practices

### ✅ DO
- Use `createPageUrl` for Base44 page navigation
- Store filter/search state in URL
- Use query parameters for shareable state
- Implement loading states during navigation
- Handle navigation errors gracefully
- Use semantic HTML for links
- Prefetch data for likely next pages
- Implement breadcrumbs for deep navigation
- Guard protected routes
- Handle back button correctly
- Use descriptive parameter names
- Clean up URL parameters when not needed
- Test navigation flows

### ❌ DON'T
- Store all state in URL (use local state for UI-only)
- Forget to encode/decode URL parameters
- Navigate without user action (except redirects)
- Break the back button
- Use `window.location.href` for internal navigation
- Forget to handle loading states
- Ignore URL parameter validation
- Create circular navigation loops
- Use hash routing for new apps
- Forget to handle 404s
- Mix navigation patterns inconsistently

---

## 10. Common Patterns

### Master-Detail Pattern

```jsx
function MasterDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const selectedId = urlParams.get('id');

  const selectItem = (id) => {
    const newParams = new URLSearchParams(window.location.search);
    newParams.set('id', id);
    window.history.pushState(null, '', `?${newParams.toString()}`);
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/3 border-r overflow-y-auto">
        <ItemList onSelect={selectItem} selectedId={selectedId} />
      </div>
      <div className="flex-1 overflow-y-auto">
        {selectedId ? (
          <ItemDetail id={selectedId} />
        ) : (
          <EmptyState message="Select an item" />
        )}
      </div>
    </div>
  );
}
```

### Multi-Step Form with URL

```jsx
function MultiStepForm() {
  const urlParams = new URLSearchParams(window.location.search);
  const step = parseInt(urlParams.get('step') || '1');

  const setStep = (newStep) => {
    const newParams = new URLSearchParams(window.location.search);
    newParams.set('step', newStep.toString());
    window.history.pushState(null, '', `?${newParams.toString()}`);
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div>
      <ProgressIndicator currentStep={step} totalSteps={3} />
      
      {step === 1 && <Step1 onNext={nextStep} />}
      {step === 2 && <Step2 onNext={nextStep} onBack={prevStep} />}
      {step === 3 && <Step3 onBack={prevStep} />}
    </div>
  );
}
```

---

## Resources

- [React Router Documentation](https://reactrouter.com/)
- [Base44 Navigation Utils](https://docs.base44.com)
- [Web History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API)
- [URL API](https://developer.mozilla.org/en-US/docs/Web/API/URL)