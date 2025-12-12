# State Management Guide

## Overview
Comprehensive guide for managing application state in React, covering local state, global state, server state, URL state, and various state management patterns and libraries.

---

## 1. Types of State

### Local Component State
State that only affects a single component.

```jsx
function Counter() {
  const [count, setCount] = React.useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <Button onClick={() => setCount(c => c + 1)}>Increment</Button>
    </div>
  );
}
```

### Lifted State
State shared between components by lifting to common parent.

```jsx
function ParentComponent() {
  const [selectedProject, setSelectedProject] = React.useState(null);

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

### Global State
State accessible throughout the application.

```jsx
// Using Context
const ThemeContext = React.createContext();

function App() {
  const [theme, setTheme] = React.useState('light');

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Router />
    </ThemeContext.Provider>
  );
}
```

### Server State
Data from external sources (APIs, databases).

```jsx
import { useQuery } from '@tanstack/react-query';

function ProjectList() {
  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list(),
  });

  return <div>{/* Render projects */}</div>;
}
```

### URL State
State stored in URL parameters.

```jsx
function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const handleSearch = (value) => {
    setSearchParams({ q: value });
  };

  return <SearchInput value={query} onChange={handleSearch} />;
}
```

---

## 2. React useState Patterns

### Basic State

```jsx
function Form() {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');

  return (
    <form>
      <Input value={name} onChange={(e) => setName(e.target.value)} />
      <Input value={email} onChange={(e) => setEmail(e.target.value)} />
    </form>
  );
}
```

### Object State

```jsx
function UserProfile() {
  const [user, setUser] = React.useState({
    name: '',
    email: '',
    age: 0,
  });

  const updateField = (field, value) => {
    setUser(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <form>
      <Input 
        value={user.name} 
        onChange={(e) => updateField('name', e.target.value)} 
      />
      <Input 
        value={user.email} 
        onChange={(e) => updateField('email', e.target.value)} 
      />
    </form>
  );
}
```

### Array State

```jsx
function TodoList() {
  const [todos, setTodos] = React.useState([]);

  const addTodo = (text) => {
    setTodos(prev => [...prev, { id: Date.now(), text, done: false }]);
  };

  const toggleTodo = (id) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, done: !todo.done } : todo
    ));
  };

  const removeTodo = (id) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  return (
    <div>
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={() => toggleTodo(todo.id)}
          onRemove={() => removeTodo(todo.id)}
        />
      ))}
    </div>
  );
}
```

### Lazy Initialization

```jsx
// Expensive computation only runs once
function ExpensiveComponent() {
  const [data, setData] = React.useState(() => {
    // Only runs on mount
    return computeExpensiveValue();
  });

  return <div>{data}</div>;
}
```

### Functional Updates

```jsx
function Counter() {
  const [count, setCount] = React.useState(0);

  // ✅ Good - Uses previous state
  const increment = () => setCount(c => c + 1);

  // ❌ Bad - May have stale closure
  const incrementWrong = () => setCount(count + 1);

  return (
    <Button onClick={increment}>
      Count: {count}
    </Button>
  );
}
```

---

## 3. useReducer for Complex State

### Basic Reducer

```jsx
const initialState = { count: 0 };

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    case 'reset':
      return initialState;
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}

function Counter() {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  return (
    <div>
      <p>Count: {state.count}</p>
      <Button onClick={() => dispatch({ type: 'increment' })}>+</Button>
      <Button onClick={() => dispatch({ type: 'decrement' })}>-</Button>
      <Button onClick={() => dispatch({ type: 'reset' })}>Reset</Button>
    </div>
  );
}
```

### Complex Form State

```jsx
const formReducer = (state, action) => {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        [action.field]: action.value,
      };
    case 'SET_ERRORS':
      return {
        ...state,
        errors: action.errors,
      };
    case 'SET_SUBMITTING':
      return {
        ...state,
        isSubmitting: action.isSubmitting,
      };
    case 'RESET':
      return action.initialState;
    default:
      return state;
  }
};

function ComplexForm() {
  const [state, dispatch] = React.useReducer(formReducer, {
    name: '',
    email: '',
    message: '',
    errors: {},
    isSubmitting: false,
  });

  const handleChange = (field, value) => {
    dispatch({ type: 'SET_FIELD', field, value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch({ type: 'SET_SUBMITTING', isSubmitting: true });
    
    try {
      await submitForm(state);
      dispatch({ type: 'RESET', initialState: {} });
    } catch (error) {
      dispatch({ type: 'SET_ERRORS', errors: error.errors });
    } finally {
      dispatch({ type: 'SET_SUBMITTING', isSubmitting: false });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        value={state.name}
        onChange={(e) => handleChange('name', e.target.value)}
        error={state.errors.name}
      />
      <Button disabled={state.isSubmitting}>Submit</Button>
    </form>
  );
}
```

---

## 4. Context API Patterns

### Basic Context

```jsx
// ThemeContext.jsx
const ThemeContext = React.createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = React.useState('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// Usage
function App() {
  return (
    <ThemeProvider>
      <Router />
    </ThemeProvider>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return <Button onClick={toggleTheme}>{theme}</Button>;
}
```

### Optimized Context (Prevent Unnecessary Rerenders)

```jsx
// Split contexts by update frequency
const AuthStateContext = React.createContext();
const AuthActionsContext = React.createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = React.useState(null);

  const actions = React.useMemo(
    () => ({
      login: async (credentials) => {
        const user = await base44.auth.login(credentials);
        setUser(user);
      },
      logout: () => setUser(null),
    }),
    []
  );

  return (
    <AuthStateContext.Provider value={user}>
      <AuthActionsContext.Provider value={actions}>
        {children}
      </AuthActionsContext.Provider>
    </AuthStateContext.Provider>
  );
}

// Separate hooks for state and actions
export function useAuthState() {
  return React.useContext(AuthStateContext);
}

export function useAuthActions() {
  return React.useContext(AuthActionsContext);
}

// Components only rerender when their subscribed context changes
function UserProfile() {
  const user = useAuthState(); // Rerenders when user changes
  return <div>{user?.name}</div>;
}

function LoginButton() {
  const { login } = useAuthActions(); // Never rerenders from user changes
  return <Button onClick={login}>Login</Button>;
}
```

### Context with Reducer

```jsx
const CartContext = React.createContext();

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM':
      return {
        ...state,
        items: [...state.items, action.item],
      };
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.id),
      };
    case 'CLEAR_CART':
      return { items: [] };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = React.useReducer(cartReducer, { items: [] });

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = React.useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
```

---

## 5. Custom Hooks for State Logic

### Form Hook

```jsx
function useForm(initialValues, onSubmit) {
  const [values, setValues] = React.useState(initialValues);
  const [errors, setErrors] = React.useState({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleChange = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(values);
      setValues(initialValues);
    } catch (error) {
      setErrors(error.errors || {});
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    setValues,
    setErrors,
  };
}

// Usage
function ContactForm() {
  const form = useForm(
    { name: '', email: '', message: '' },
    async (values) => {
      await base44.functions.invoke('sendEmail', values);
    }
  );

  return (
    <form onSubmit={form.handleSubmit}>
      <Input
        value={form.values.name}
        onChange={(e) => form.handleChange('name', e.target.value)}
        error={form.errors.name}
      />
      <Button disabled={form.isSubmitting}>Submit</Button>
    </form>
  );
}
```

### Toggle Hook

```jsx
function useToggle(initialValue = false) {
  const [value, setValue] = React.useState(initialValue);

  const toggle = React.useCallback(() => {
    setValue(v => !v);
  }, []);

  const setTrue = React.useCallback(() => {
    setValue(true);
  }, []);

  const setFalse = React.useCallback(() => {
    setValue(false);
  }, []);

  return [value, toggle, setTrue, setFalse];
}

// Usage
function Modal() {
  const [isOpen, toggle, open, close] = useToggle();

  return (
    <>
      <Button onClick={open}>Open Modal</Button>
      <Dialog open={isOpen} onOpenChange={close}>
        {/* Modal content */}
      </Dialog>
    </>
  );
}
```

### Local Storage Hook

```jsx
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = React.useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function 
        ? value(storedValue) 
        : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

// Usage
function Settings() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  return (
    <Select value={theme} onValueChange={setTheme}>
      <SelectItem value="light">Light</SelectItem>
      <SelectItem value="dark">Dark</SelectItem>
    </Select>
  );
}
```

---

## 6. URL State Management

### Search Params

```jsx
import { useSearchParams } from 'react-router-dom';

function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get('category') || 'all';
  const sort = searchParams.get('sort') || 'name';
  const page = parseInt(searchParams.get('page') || '1');

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set(key, value);
    setSearchParams(newParams);
  };

  return (
    <div>
      <Select 
        value={category} 
        onValueChange={(v) => updateFilter('category', v)}
      >
        <SelectItem value="all">All</SelectItem>
        <SelectItem value="electronics">Electronics</SelectItem>
      </Select>

      <Select 
        value={sort} 
        onValueChange={(v) => updateFilter('sort', v)}
      >
        <SelectItem value="name">Name</SelectItem>
        <SelectItem value="price">Price</SelectItem>
      </Select>
    </div>
  );
}
```

### URL State Hook

```jsx
function useUrlState(key, defaultValue) {
  const [searchParams, setSearchParams] = useSearchParams();

  const value = searchParams.get(key) || defaultValue;

  const setValue = (newValue) => {
    const newParams = new URLSearchParams(searchParams);
    if (newValue === defaultValue || newValue === '') {
      newParams.delete(key);
    } else {
      newParams.set(key, newValue);
    }
    setSearchParams(newParams);
  };

  return [value, setValue];
}

// Usage
function SearchPage() {
  const [query, setQuery] = useUrlState('q', '');
  const [filter, setFilter] = useUrlState('filter', 'all');

  return (
    <div>
      <Input value={query} onChange={(e) => setQuery(e.target.value)} />
      <Select value={filter} onValueChange={setFilter}>
        <SelectItem value="all">All</SelectItem>
        <SelectItem value="active">Active</SelectItem>
      </Select>
    </div>
  );
}
```

---

## 7. Zustand (Lightweight Global State)

### Basic Store

```jsx
import { create } from 'zustand';

const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));

function Counter() {
  const count = useStore((state) => state.count);
  const increment = useStore((state) => state.increment);

  return (
    <div>
      <p>{count}</p>
      <Button onClick={increment}>Increment</Button>
    </div>
  );
}
```

### Slices Pattern

```jsx
// userSlice.js
export const createUserSlice = (set) => ({
  user: null,
  login: (user) => set({ user }),
  logout: () => set({ user: null }),
});

// cartSlice.js
export const createCartSlice = (set) => ({
  items: [],
  addItem: (item) => set((state) => ({ 
    items: [...state.items, item] 
  })),
  removeItem: (id) => set((state) => ({ 
    items: state.items.filter(item => item.id !== id) 
  })),
});

// store.js
import { create } from 'zustand';
import { createUserSlice } from './userSlice';
import { createCartSlice } from './cartSlice';

export const useStore = create((set) => ({
  ...createUserSlice(set),
  ...createCartSlice(set),
}));
```

### Persist Middleware

```jsx
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'theme-storage', // localStorage key
    }
  )
);
```

### Async Actions

```jsx
const useStore = create((set) => ({
  projects: [],
  loading: false,
  error: null,

  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      const projects = await base44.entities.Project.list();
      set({ projects, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  createProject: async (data) => {
    const project = await base44.entities.Project.create(data);
    set((state) => ({ 
      projects: [...state.projects, project] 
    }));
  },
}));
```

---

## 8. State Synchronization

### Syncing Multiple States

```jsx
function useSyncedState() {
  const [localState, setLocalState] = React.useState(null);
  const { data: serverState } = useQuery({
    queryKey: ['data'],
    queryFn: fetchData,
  });

  // Sync server state to local state when it changes
  React.useEffect(() => {
    if (serverState) {
      setLocalState(serverState);
    }
  }, [serverState]);

  return [localState, setLocalState];
}
```

### Debounced Updates

```jsx
import { useDebouncedCallback } from 'use-debounce';

function SearchInput() {
  const [localValue, setLocalValue] = React.useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  // Debounce URL updates
  const debouncedUpdate = useDebouncedCallback((value) => {
    setSearchParams({ q: value });
  }, 500);

  const handleChange = (value) => {
    setLocalValue(value);
    debouncedUpdate(value);
  };

  return (
    <Input 
      value={localValue} 
      onChange={(e) => handleChange(e.target.value)} 
    />
  );
}
```

---

## 9. State Debugging

### React DevTools

```jsx
// Add display names for better debugging
function useCustomHook() {
  const [state, setState] = React.useState(0);
  React.useDebugValue(state > 5 ? 'High' : 'Low');
  return [state, setState];
}

// Name context for DevTools
ThemeContext.displayName = 'ThemeContext';
```

### State Logger

```jsx
function useStateLogger(name, value) {
  React.useEffect(() => {
    console.log(`[${name}] State changed:`, value);
  }, [name, value]);
}

// Usage
function Component() {
  const [count, setCount] = React.useState(0);
  useStateLogger('count', count);
  
  return <div>{count}</div>;
}
```

### State History

```jsx
function useStateHistory(initialState) {
  const [history, setHistory] = React.useState([initialState]);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const state = history[currentIndex];

  const setState = (newState) => {
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const redo = () => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return {
    state,
    setState,
    undo,
    redo,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1,
  };
}
```

---

## 10. Performance Optimization

### Memoization

```jsx
function ExpensiveComponent({ data, filter }) {
  // Memoize expensive calculations
  const filteredData = React.useMemo(() => {
    return data.filter(item => item.category === filter);
  }, [data, filter]);

  // Memoize callbacks
  const handleClick = React.useCallback((id) => {
    console.log('Clicked:', id);
  }, []);

  return (
    <div>
      {filteredData.map(item => (
        <Item key={item.id} item={item} onClick={handleClick} />
      ))}
    </div>
  );
}
```

### Splitting State

```jsx
// ❌ Bad - Single large state object causes unnecessary rerenders
function BadComponent() {
  const [state, setState] = React.useState({
    name: '',
    email: '',
    avatar: null,
    preferences: {},
  });
  // Updating name rerenders everything
}

// ✅ Good - Split into independent states
function GoodComponent() {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [avatar, setAvatar] = React.useState(null);
  const [preferences, setPreferences] = React.useState({});
  // Each state updates independently
}
```

### State Selectors

```jsx
// With Zustand
const useStore = create((set) => ({
  user: { name: 'John', email: 'john@example.com' },
  projects: [],
  // ... more state
}));

// ✅ Good - Select only what you need
function UserName() {
  const name = useStore((state) => state.user.name);
  // Only rerenders when name changes
  return <div>{name}</div>;
}

// ❌ Bad - Selects entire state
function BadUserName() {
  const user = useStore((state) => state.user);
  // Rerenders when any user property changes
  return <div>{user.name}</div>;
}
```

---

## 11. Best Practices

### ✅ DO
- Keep state as local as possible
- Use the right state solution for the use case
- Lift state only when necessary
- Use functional updates for derived state
- Memoize expensive computations
- Split complex state into smaller pieces
- Use proper dependency arrays
- Provide default values
- Handle loading and error states
- Use TypeScript for type safety
- Name state variables descriptively
- Keep actions close to state
- Use custom hooks for reusable logic
- Document complex state logic

### ❌ DON'T
- Store server data in local state (use React Query)
- Put everything in global state
- Mutate state directly
- Forget to handle edge cases
- Over-optimize prematurely
- Use complex state managers for simple needs
- Store derived data in state
- Mix UI state with server state
- Create too many context providers
- Forget cleanup in effects
- Use index as key for dynamic lists
- Ignore TypeScript warnings
- Store functions in state

---

## 12. State Decision Tree

```
Need to manage state?
│
├─ Is it server data? → Use React Query
│
├─ Is it URL-based? → Use useSearchParams
│
├─ Is it just for one component? → Use useState
│
├─ Shared between 2-3 components?
│  └─ Lift state to common parent
│
├─ Complex state logic?
│  └─ Use useReducer
│
├─ Needs to be global?
│  ├─ Simple? → Use Context
│  └─ Complex? → Use Zustand
│
└─ Form state? → Use react-hook-form or custom hook
```

---

## 13. Common Patterns

### Modal State

```jsx
function useModal() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [data, setData] = React.useState(null);

  const open = (modalData) => {
    setData(modalData);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setData(null);
  };

  return { isOpen, data, open, close };
}

// Usage
function App() {
  const modal = useModal();

  return (
    <>
      <Button onClick={() => modal.open({ id: 1 })}>
        Open Modal
      </Button>
      
      <Dialog open={modal.isOpen} onOpenChange={modal.close}>
        {modal.data && <ModalContent data={modal.data} />}
      </Dialog>
    </>
  );
}
```

### Multi-Step Form

```jsx
function useMultiStepForm(steps) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [formData, setFormData] = React.useState({});

  const next = (data) => {
    setFormData(prev => ({ ...prev, ...data }));
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const back = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const goTo = (step) => {
    setCurrentStep(step);
  };

  return {
    currentStep,
    formData,
    next,
    back,
    goTo,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === steps.length - 1,
  };
}
```

---

## Resources

- [React State Management](https://react.dev/learn/managing-state)
- [TanStack Query](https://tanstack.com/query/latest)
- [Zustand](https://github.com/pmndrs/zustand)
- [React Hook Form](https://react-hook-form.com/)
- [Kent C. Dodds - State Management](https://kentcdodds.com/blog/application-state-management-with-react)