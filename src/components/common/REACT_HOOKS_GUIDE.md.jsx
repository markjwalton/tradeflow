# React Hooks Guide

## Overview
Comprehensive guide to React Hooks - built-in hooks, custom hooks, rules, patterns, and best practices for functional components.

---

## 1. useState

### Basic Usage

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <Button onClick={() => setCount(count + 1)}>Increment</Button>
    </div>
  );
}
```

### Functional Updates

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  // ✅ Good - Uses previous state
  const increment = () => setCount(prev => prev + 1);

  // ❌ Bad - May use stale value
  const incrementBad = () => setCount(count + 1);

  return <Button onClick={increment}>Count: {count}</Button>;
}
```

### Lazy Initialization

```jsx
function ExpensiveComponent() {
  // ✅ Good - Only runs once on mount
  const [data, setData] = useState(() => {
    const expensiveValue = computeExpensiveValue();
    return expensiveValue;
  });

  // ❌ Bad - Runs on every render
  const [dataBad, setDataBad] = useState(computeExpensiveValue());
}
```

### Object and Array State

```jsx
function Form() {
  const [user, setUser] = useState({ name: '', email: '' });

  // Update specific field
  const updateName = (name) => {
    setUser(prev => ({ ...prev, name }));
  };

  // Array operations
  const [items, setItems] = useState([]);
  
  const addItem = (item) => {
    setItems(prev => [...prev, item]);
  };

  const removeItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateItem = (id, updates) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };
}
```

---

## 2. useEffect

### Basic Side Effects

```jsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Effect runs after render
    fetchUser(userId).then(setUser);
  }, [userId]); // Dependency array

  return <div>{user?.name}</div>;
}
```

### Cleanup Functions

```jsx
function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);

    // Cleanup runs before next effect and on unmount
    return () => clearInterval(interval);
  }, []); // Empty array = run once

  return <div>{seconds}s</div>;
}
```

### Dependency Array Rules

```jsx
function Example({ userId, filter }) {
  // ❌ Missing dependencies
  useEffect(() => {
    fetchData(userId, filter);
  }, []); // Should include userId and filter

  // ✅ Correct dependencies
  useEffect(() => {
    fetchData(userId, filter);
  }, [userId, filter]);

  // ✅ No dependencies needed
  useEffect(() => {
    const staticValue = 42;
    console.log(staticValue);
  }, []); // OK - no external dependencies
}
```

### Common Patterns

```jsx
// Fetching data
useEffect(() => {
  let cancelled = false;

  async function fetchData() {
    const data = await api.fetch();
    if (!cancelled) {
      setData(data);
    }
  }

  fetchData();

  return () => {
    cancelled = true; // Prevent state update if unmounted
  };
}, []);

// Event listeners
useEffect(() => {
  const handleResize = () => setWidth(window.innerWidth);
  
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

// Local storage sync
useEffect(() => {
  localStorage.setItem('theme', theme);
}, [theme]);
```

---

## 3. useContext

### Creating and Using Context

```jsx
// Create context
const ThemeContext = React.createContext();

// Provider component
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  const value = {
    theme,
    setTheme,
    toggleTheme: () => setTheme(t => t === 'light' ? 'dark' : 'light'),
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook for consuming context
function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// Usage
function App() {
  return (
    <ThemeProvider>
      <Header />
      <Main />
    </ThemeProvider>
  );
}

function Header() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <header className={theme}>
      <Button onClick={toggleTheme}>Toggle Theme</Button>
    </header>
  );
}
```

---

## 4. useReducer

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
  const [state, dispatch] = useReducer(reducer, initialState);

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

### Complex State Management

```jsx
function todoReducer(state, action) {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        ...state,
        todos: [...state.todos, action.todo],
      };
    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.id ? { ...todo, done: !todo.done } : todo
        ),
      };
    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.id),
      };
    case 'SET_FILTER':
      return {
        ...state,
        filter: action.filter,
      };
    default:
      return state;
  }
}

function TodoApp() {
  const [state, dispatch] = useReducer(todoReducer, {
    todos: [],
    filter: 'all',
  });

  const addTodo = (text) => {
    dispatch({
      type: 'ADD_TODO',
      todo: { id: Date.now(), text, done: false },
    });
  };

  return <div>{/* UI */}</div>;
}
```

---

## 5. useRef

### DOM References

```jsx
function TextInput() {
  const inputRef = useRef(null);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <>
      <input ref={inputRef} />
      <Button onClick={focusInput}>Focus Input</Button>
    </>
  );
}
```

### Storing Mutable Values

```jsx
function Timer() {
  const [count, setCount] = useState(0);
  const intervalRef = useRef(null);

  const startTimer = () => {
    intervalRef.current = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(intervalRef.current);
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div>
      <p>{count}</p>
      <Button onClick={startTimer}>Start</Button>
      <Button onClick={stopTimer}>Stop</Button>
    </div>
  );
}
```

### Previous Value Tracking

```jsx
function usePrevious(value) {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

// Usage
function Counter() {
  const [count, setCount] = useState(0);
  const prevCount = usePrevious(count);

  return (
    <div>
      <p>Current: {count}</p>
      <p>Previous: {prevCount}</p>
    </div>
  );
}
```

---

## 6. useMemo

### Memoizing Expensive Calculations

```jsx
function ProductList({ products, filter }) {
  // Only recalculates when products or filter changes
  const filteredProducts = useMemo(() => {
    console.log('Filtering products...');
    return products.filter(p => p.category === filter);
  }, [products, filter]);

  return (
    <div>
      {filteredProducts.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### Preventing Unnecessary Rerenders

```jsx
function Parent() {
  const [count, setCount] = useState(0);

  // ❌ New object on every render
  const configBad = { theme: 'dark', size: 'large' };

  // ✅ Same object reference unless dependencies change
  const config = useMemo(() => ({
    theme: 'dark',
    size: 'large',
  }), []);

  return <Child config={config} />;
}
```

---

## 7. useCallback

### Memoizing Functions

```jsx
function Parent() {
  const [count, setCount] = useState(0);

  // ❌ New function on every render
  const handleClickBad = () => {
    console.log('Clicked!');
  };

  // ✅ Same function reference
  const handleClick = useCallback(() => {
    console.log('Clicked!');
  }, []);

  return <Child onClick={handleClick} />;
}
```

### With Dependencies

```jsx
function SearchComponent({ onSearch }) {
  const [query, setQuery] = useState('');

  // Recreated when query changes
  const handleSearch = useCallback(() => {
    onSearch(query);
  }, [query, onSearch]);

  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <Button onClick={handleSearch}>Search</Button>
    </div>
  );
}
```

---

## 8. useLayoutEffect

### Synchronous DOM Measurements

```jsx
function Tooltip({ children }) {
  const [tooltipHeight, setTooltipHeight] = useState(0);
  const tooltipRef = useRef(null);

  // Runs synchronously after DOM mutations but before paint
  useLayoutEffect(() => {
    const height = tooltipRef.current?.offsetHeight;
    setTooltipHeight(height);
  }, [children]);

  return (
    <div ref={tooltipRef} style={{ top: -tooltipHeight }}>
      {children}
    </div>
  );
}
```

### useEffect vs useLayoutEffect

```jsx
// useEffect - Asynchronous, after paint
useEffect(() => {
  // Runs after browser paints
  // Good for: data fetching, subscriptions, logging
}, []);

// useLayoutEffect - Synchronous, before paint
useLayoutEffect(() => {
  // Runs before browser paints
  // Good for: DOM measurements, scroll position
}, []);
```

---

## 9. Custom Hooks

### Basic Custom Hook

```jsx
function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue(v => !v);
  }, []);

  return [value, toggle];
}

// Usage
function Modal() {
  const [isOpen, toggleOpen] = useToggle();

  return (
    <>
      <Button onClick={toggleOpen}>Open Modal</Button>
      <Dialog open={isOpen} onOpenChange={toggleOpen}>
        {/* Content */}
      </Dialog>
    </>
  );
}
```

### Custom Hook Library

```jsx
// useLocalStorage
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

// useDebounce
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// useWindowSize
function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

// useOnClickOutside
function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

// useInterval
function useInterval(callback, delay) {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      savedCallback.current();
    }

    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}
```

---

## 10. Hook Rules

### Rules of Hooks

```jsx
// ✅ Always call hooks at the top level
function Component() {
  const [state, setState] = useState(0);
  useEffect(() => {}, []);
  
  // ❌ Don't call hooks conditionally
  if (condition) {
    useState(0); // Wrong!
  }
  
  // ❌ Don't call hooks in loops
  for (let i = 0; i < 10; i++) {
    useEffect(() => {}, []); // Wrong!
  }
  
  // ❌ Don't call hooks in callbacks
  const handleClick = () => {
    useState(0); // Wrong!
  };
}

// ✅ Only call hooks from React functions
function MyComponent() {
  const [state, setState] = useState(0); // OK
}

function useMyHook() {
  const [state, setState] = useState(0); // OK
}

// ❌ Don't call hooks from regular JavaScript functions
function regularFunction() {
  const [state, setState] = useState(0); // Wrong!
}
```

---

## 11. Common Patterns

### Data Fetching Hook

```jsx
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch(url);
        const json = await response.json();
        
        if (!cancelled) {
          setData(json);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [url]);

  return { data, loading, error };
}
```

### Form Hook

```jsx
function useForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const fieldErrors = validate({ ...values, [name]: value });
      setErrors(prev => ({ ...prev, [name]: fieldErrors[name] }));
    }
  };

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const fieldErrors = validate(values);
    setErrors(prev => ({ ...prev, [name]: fieldErrors[name] }));
  };

  const handleSubmit = (onSubmit) => (e) => {
    e.preventDefault();
    const formErrors = validate(values);
    setErrors(formErrors);

    if (Object.keys(formErrors).length === 0) {
      onSubmit(values);
    }
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
  };
}
```

---

## 12. Best Practices

### ✅ DO
- Always follow the Rules of Hooks
- Use ESLint plugin for hooks
- Extract reusable logic into custom hooks
- Clean up side effects
- Use proper dependency arrays
- Memoize expensive calculations
- Name custom hooks with "use" prefix
- Keep hooks small and focused
- Document custom hooks
- Test custom hooks

### ❌ DON'T
- Call hooks conditionally
- Call hooks in loops
- Call hooks from regular functions
- Forget cleanup in useEffect
- Omit dependencies
- Over-memoize everything
- Create overly complex custom hooks
- Ignore ESLint warnings
- Use hooks for everything (sometimes props are better)
- Mutate refs during render

---

## Resources

- [React Hooks Documentation](https://react.dev/reference/react)
- [Rules of Hooks](https://react.dev/warnings/invalid-hook-call-warning)
- [useHooks Collection](https://usehooks.com/)
- [React Hooks Cheatsheet](https://react-hooks-cheatsheet.com/)