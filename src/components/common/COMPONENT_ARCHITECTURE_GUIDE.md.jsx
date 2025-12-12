# Component Architecture Guide

## Overview
Comprehensive guide for designing and structuring React components, covering component patterns, composition, reusability, and architectural best practices for scalable applications.

---

## 1. Component Types

### Presentational (Dumb) Components
Components focused purely on rendering UI.

```jsx
// ✅ Good - Pure presentational
function UserCard({ user, onEdit, onDelete }) {
  return (
    <Card>
      <CardHeader>
        <Avatar src={user.avatar} />
        <CardTitle>{user.name}</CardTitle>
        <CardDescription>{user.email}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button onClick={onEdit}>Edit</Button>
        <Button variant="destructive" onClick={onDelete}>
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}

// ❌ Bad - Mixed concerns
function UserCard({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(setUser)
      .finally(() => setLoading(false));
  }, [userId]);
  
  // Mixing data fetching with presentation
  return loading ? <Spinner /> : <div>{user.name}</div>;
}
```

### Container (Smart) Components
Components that handle logic and data.

```jsx
// ✅ Good - Container handles logic
function UserCardContainer({ userId }) {
  const { data: user, isLoading } = useQuery({
    queryKey: ['users', userId],
    queryFn: () => base44.entities.User.get(userId),
  });

  const editMutation = useMutation({
    mutationFn: (data) => base44.entities.User.update(userId, data),
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.User.delete(userId),
  });

  if (isLoading) return <UserCardSkeleton />;

  return (
    <UserCard
      user={user}
      onEdit={() => editMutation.mutate({ /* data */ })}
      onDelete={() => deleteMutation.mutate()}
    />
  );
}
```

### Layout Components
Components that define page structure.

```jsx
function PageLayout({ children, sidebar, header }) {
  return (
    <div className="min-h-screen flex flex-col">
      {header && <Header>{header}</Header>}
      <div className="flex-1 flex">
        {sidebar && (
          <aside className="w-64 border-r">
            {sidebar}
          </aside>
        )}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

// Usage
function ProjectPage() {
  return (
    <PageLayout
      header={<ProjectHeader />}
      sidebar={<ProjectSidebar />}
    >
      <ProjectContent />
    </PageLayout>
  );
}
```

---

## 2. Composition Patterns

### Children Prop Pattern

```jsx
// Basic composition
function Card({ children, className }) {
  return (
    <div className={cn("rounded-lg border bg-card", className)}>
      {children}
    </div>
  );
}

// Usage
<Card>
  <h2>Title</h2>
  <p>Content</p>
</Card>
```

### Render Props Pattern

```jsx
function DataFetcher({ url, render }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [url]);

  return render({ data, loading });
}

// Usage
<DataFetcher
  url="/api/users"
  render={({ data, loading }) => (
    loading ? <Spinner /> : <UserList users={data} />
  )}
/>
```

### Compound Components

```jsx
// Create a context for internal state
const TabsContext = React.createContext();

function Tabs({ children, defaultValue }) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">
        {children}
      </div>
    </TabsContext.Provider>
  );
}

Tabs.List = function TabsList({ children }) {
  return <div className="tabs-list">{children}</div>;
};

Tabs.Trigger = function TabsTrigger({ value, children }) {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  
  return (
    <button
      className={cn("tab-trigger", activeTab === value && "active")}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
};

Tabs.Content = function TabsContent({ value, children }) {
  const { activeTab } = useContext(TabsContext);
  
  if (activeTab !== value) return null;
  
  return <div className="tab-content">{children}</div>;
};

// Usage - Very intuitive API
<Tabs defaultValue="profile">
  <Tabs.List>
    <Tabs.Trigger value="profile">Profile</Tabs.Trigger>
    <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="profile">
    Profile content
  </Tabs.Content>
  <Tabs.Content value="settings">
    Settings content
  </Tabs.Content>
</Tabs>
```

### Higher-Order Components (HOC)

```jsx
// withAuth HOC
function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const { data: user, isLoading } = useQuery({
      queryKey: ['auth'],
      queryFn: () => base44.auth.me(),
    });

    if (isLoading) return <Spinner />;
    if (!user) {
      base44.auth.redirectToLogin();
      return null;
    }

    return <Component {...props} user={user} />;
  };
}

// Usage
const ProtectedPage = withAuth(function DashboardPage({ user }) {
  return <div>Welcome {user.name}</div>;
});

// withLoading HOC
function withLoading(Component) {
  return function LoadingComponent({ isLoading, ...props }) {
    if (isLoading) return <Spinner />;
    return <Component {...props} />;
  };
}
```

---

## 3. Component Structure

### Single Responsibility

```jsx
// ❌ Bad - Too many responsibilities
function ProjectDashboard({ projectId }) {
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Fetching data
  useEffect(() => { /* ... */ }, [projectId]);
  
  // Rendering header, stats, tasks, charts all in one
  return (
    <div>
      {/* 200+ lines of JSX */}
    </div>
  );
}

// ✅ Good - Single responsibilities
function ProjectDashboard({ projectId }) {
  return (
    <div>
      <ProjectHeader projectId={projectId} />
      <ProjectStats projectId={projectId} />
      <ProjectTasks projectId={projectId} />
      <ProjectCharts projectId={projectId} />
    </div>
  );
}
```

### File Organization

```
components/
├── ui/                    # Base UI components (shadcn)
│   ├── button.jsx
│   ├── card.jsx
│   └── input.jsx
│
├── common/               # Shared components
│   ├── ErrorBoundary.jsx
│   ├── Spinner.jsx
│   └── PageHeader.jsx
│
├── features/            # Feature-specific components
│   ├── projects/
│   │   ├── ProjectCard.jsx
│   │   ├── ProjectForm.jsx
│   │   ├── ProjectList.jsx
│   │   └── hooks/
│   │       └── useProjectForm.js
│   │
│   └── tasks/
│       ├── TaskCard.jsx
│       ├── TaskList.jsx
│       └── hooks/
│           └── useTaskFilters.js
│
└── layout/              # Layout components
    ├── AppShell.jsx
    ├── Sidebar.jsx
    └── Header.jsx
```

### Component Template

```jsx
// ProjectCard.jsx
import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, User } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Displays a project card with basic information
 * @param {Object} project - Project data
 * @param {Function} onEdit - Callback when edit is clicked
 * @param {Function} onDelete - Callback when delete is clicked
 * @param {string} className - Additional CSS classes
 */
export function ProjectCard({ 
  project, 
  onEdit, 
  onDelete, 
  className 
}) {
  // Local state if needed
  const [isHovered, setIsHovered] = React.useState(false);

  // Computed values
  const isOverdue = project.due_date < new Date();

  // Event handlers
  const handleEdit = () => {
    onEdit?.(project);
  };

  // Render helpers
  const renderStatus = () => {
    return (
      <span className={cn(
        "badge",
        project.status === 'active' && "badge-success"
      )}>
        {project.status}
      </span>
    );
  };

  return (
    <Card 
      className={cn("project-card", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader>
        <CardTitle>{project.name}</CardTitle>
        {renderStatus()}
      </CardHeader>
      
      <div className="flex items-center gap-2">
        <User className="h-4 w-4" />
        <span>{project.created_by}</span>
      </div>
      
      {isHovered && (
        <div className="actions">
          <Button onClick={handleEdit}>Edit</Button>
          <Button variant="destructive" onClick={onDelete}>
            Delete
          </Button>
        </div>
      )}
    </Card>
  );
}

ProjectCard.displayName = 'ProjectCard';
```

---

## 4. Props Patterns

### Prop Types and Defaults

```jsx
// Using TypeScript (preferred)
interface User {
  id: string;
  name: string;
  email?: string;
}

interface UserCardProps {
  user: User;
  size?: 'sm' | 'md' | 'lg';
  onEdit?: (user: User) => void;
}

function UserCard({ 
  user, 
  size = 'md', 
  onEdit 
}: UserCardProps) {
  return <div>{user.name}</div>;
}
```

### Spread Props

```jsx
// Pass all props to child component
function CustomButton({ variant = 'default', ...props }) {
  return (
    <Button 
      variant={variant} 
      className="custom-button"
      {...props} // onClick, disabled, etc.
    />
  );
}

// Usage
<CustomButton onClick={handleClick} disabled={loading}>
  Click Me
</CustomButton>
```

### Props as Functions (Render Props)

```jsx
function List({ items, renderItem, renderEmpty }) {
  if (items.length === 0) {
    return renderEmpty ? renderEmpty() : <p>No items</p>;
  }

  return (
    <ul>
      {items.map((item, index) => (
        <li key={item.id || index}>
          {renderItem(item, index)}
        </li>
      ))}
    </ul>
  );
}

// Usage
<List
  items={projects}
  renderItem={(project) => <ProjectCard project={project} />}
  renderEmpty={() => <EmptyState message="No projects" />}
/>
```

---

## 5. State Management in Components

### Local State

```jsx
// Simple UI state
function ExpandableCard({ children }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card>
      <Button onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? 'Collapse' : 'Expand'}
      </Button>
      {isExpanded && <div>{children}</div>}
    </Card>
  );
}
```

### Derived State

```jsx
// ❌ Bad - Redundant state
function SearchList({ items }) {
  const [query, setQuery] = useState('');
  const [filtered, setFiltered] = useState(items);

  useEffect(() => {
    setFiltered(items.filter(item => 
      item.name.includes(query)
    ));
  }, [items, query]);

  return <div>{/* ... */}</div>;
}

// ✅ Good - Compute on render
function SearchList({ items }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => 
    items.filter(item => item.name.includes(query)),
    [items, query]
  );

  return <div>{/* ... */}</div>;
}
```

### Lifting State Up

```jsx
// Parent manages shared state
function ProjectManager() {
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <div>
      <ProjectList 
        onSelect={setSelectedProject}
        selected={selectedProject}
      />
      <ProjectDetails project={selectedProject} />
    </div>
  );
}
```

---

## 6. Performance Optimization

### React.memo

```jsx
// Prevent unnecessary rerenders
const ExpensiveComponent = React.memo(function ExpensiveComponent({ data }) {
  return <div>{/* Heavy rendering */}</div>;
});

// With custom comparison
const ProjectCard = React.memo(
  function ProjectCard({ project, onEdit }) {
    return <Card>{project.name}</Card>;
  },
  (prevProps, nextProps) => {
    // Return true if props are equal (skip rerender)
    return prevProps.project.id === nextProps.project.id;
  }
);
```

### useMemo and useCallback

```jsx
function ProjectList({ projects, filter }) {
  // Memoize expensive computation
  const filteredProjects = useMemo(() => {
    return projects.filter(p => p.status === filter);
  }, [projects, filter]);

  // Memoize callback
  const handleEdit = useCallback((project) => {
    console.log('Editing:', project.id);
  }, []);

  return (
    <div>
      {filteredProjects.map(project => (
        <ProjectCard
          key={project.id}
          project={project}
          onEdit={handleEdit}
        />
      ))}
    </div>
  );
}
```

### Code Splitting

```jsx
import { lazy, Suspense } from 'react';

// Lazy load heavy components
const HeavyChart = lazy(() => import('./HeavyChart'));
const ProjectDetail = lazy(() => import('./ProjectDetail'));

function Dashboard() {
  return (
    <Suspense fallback={<Spinner />}>
      <HeavyChart />
    </Suspense>
  );
}
```

---

## 7. Best Practices

### ✅ DO
- Keep components small and focused
- Use composition over inheritance
- Extract reusable logic into custom hooks
- Use TypeScript for type safety
- Memoize expensive computations
- Implement proper error boundaries
- Write accessible components
- Test components thoroughly
- Document complex components
- Use semantic HTML
- Follow consistent naming conventions
- Keep props interface simple
- Handle loading and error states
- Use proper key props in lists

### ❌ DON'T
- Create overly complex components
- Mix data fetching with presentation
- Mutate props or state directly
- Use index as key for dynamic lists
- Over-optimize prematurely
- Create deep component hierarchies
- Ignore accessibility
- Skip prop validation
- Use inline functions in JSX (when memoizing)
- Store derived data in state
- Forget cleanup in useEffect
- Nest ternaries too deeply
- Use magic numbers or strings

---

## Resources

- [React Documentation](https://react.dev/)
- [Patterns.dev](https://www.patterns.dev/)
- [Kent C. Dodds Blog](https://kentcdodds.com/blog)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Testing Library](https://testing-library.com/)