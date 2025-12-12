# TypeScript Guide

## Overview
Comprehensive guide to using TypeScript in React applications, covering types, interfaces, generics, and best practices for type-safe development.

---

## 1. Basic Types

### Primitive Types

```tsx
// String, Number, Boolean
const name: string = 'John';
const age: number = 30;
const isActive: boolean = true;

// Array
const numbers: number[] = [1, 2, 3];
const names: Array<string> = ['John', 'Jane'];

// Tuple
const coordinate: [number, number] = [10, 20];

// Any (avoid when possible)
let anything: any = 'string';
anything = 42;

// Unknown (safer than any)
let value: unknown = 'string';
if (typeof value === 'string') {
  console.log(value.toUpperCase());
}

// Void
function logMessage(message: string): void {
  console.log(message);
}

// Never
function throwError(message: string): never {
  throw new Error(message);
}

// Null and Undefined
let nullable: string | null = null;
let optional: string | undefined = undefined;
```

---

## 2. Object Types

### Interface

```tsx
interface User {
  id: string;
  name: string;
  email: string;
  age?: number; // Optional property
  readonly createdAt: Date; // Read-only
}

const user: User = {
  id: '1',
  name: 'John',
  email: 'john@example.com',
  createdAt: new Date(),
};

// user.createdAt = new Date(); // Error: read-only
```

### Type Alias

```tsx
type Status = 'pending' | 'active' | 'inactive';

type Project = {
  id: string;
  name: string;
  status: Status;
  tags: string[];
};

type ProjectWithUser = Project & {
  userId: string;
};
```

### Interface vs Type

```tsx
// ✅ Use Interface for object shapes
interface UserInterface {
  name: string;
  email: string;
}

// ✅ Use Type for unions, intersections, primitives
type Status = 'active' | 'inactive';
type ID = string | number;

// Interface can be extended
interface Admin extends UserInterface {
  role: 'admin';
}

// Type can use intersections
type AdminType = UserInterface & { role: 'admin' };
```

---

## 3. Function Types

### Function Signatures

```tsx
// Function declaration
function add(a: number, b: number): number {
  return a + b;
}

// Arrow function
const multiply = (a: number, b: number): number => a * b;

// Optional parameters
function greet(name: string, greeting?: string): string {
  return `${greeting || 'Hello'}, ${name}`;
}

// Default parameters
function createUser(name: string, role: string = 'user'): User {
  return { name, role };
}

// Rest parameters
function sum(...numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0);
}

// Function type
type MathOperation = (a: number, b: number) => number;

const divide: MathOperation = (a, b) => a / b;
```

### Callback Types

```tsx
interface ButtonProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onHover?: () => void;
}

function Button({ onClick, onHover }: ButtonProps) {
  return (
    <button 
      onClick={onClick}
      onMouseEnter={onHover}
    >
      Click me
    </button>
  );
}
```

---

## 4. React Component Types

### Function Component

```tsx
import React from 'react';

interface UserCardProps {
  user: {
    name: string;
    email: string;
  };
  onEdit?: (user: User) => void;
  className?: string;
}

// Method 1: React.FC (includes children automatically)
const UserCard: React.FC<UserCardProps> = ({ user, onEdit, className }) => {
  return (
    <div className={className}>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      {onEdit && <button onClick={() => onEdit(user)}>Edit</button>}
    </div>
  );
};

// Method 2: Direct typing (preferred)
function UserCardDirect({ user, onEdit, className }: UserCardProps) {
  return (
    <div className={className}>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
}
```

### Component with Children

```tsx
interface CardProps {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

function Card({ title, children, footer }: CardProps) {
  return (
    <div>
      <h2>{title}</h2>
      <div>{children}</div>
      {footer && <div>{footer}</div>}
    </div>
  );
}
```

### Event Handlers

```tsx
interface FormProps {
  onSubmit: (data: FormData) => void;
}

function Form({ onSubmit }: FormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log('Clicked');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input onChange={handleChange} />
      <button onClick={handleClick}>Submit</button>
    </form>
  );
}
```

---

## 5. Hooks with TypeScript

### useState

```tsx
// Type inference
const [count, setCount] = useState(0); // number
const [name, setName] = useState(''); // string

// Explicit type
const [user, setUser] = useState<User | null>(null);

// With initial undefined
const [data, setData] = useState<Data>();

// Complex state
interface FormState {
  name: string;
  email: string;
  age: number;
}

const [form, setForm] = useState<FormState>({
  name: '',
  email: '',
  age: 0,
});
```

### useRef

```tsx
// DOM ref
const inputRef = useRef<HTMLInputElement>(null);

useEffect(() => {
  inputRef.current?.focus();
}, []);

// Mutable value
const countRef = useRef<number>(0);

useEffect(() => {
  countRef.current += 1;
}, []);
```

### useContext

```tsx
interface ThemeContextType {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(
  undefined
);

function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

### Custom Hooks

```tsx
function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    setStoredValue(value);
    window.localStorage.setItem(key, JSON.stringify(value));
  };

  return [storedValue, setValue];
}

// Usage
const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
```

---

## 6. Generics

### Generic Functions

```tsx
function identity<T>(value: T): T {
  return value;
}

const num = identity<number>(42);
const str = identity<string>('hello');
const auto = identity('auto'); // Type inferred
```

### Generic Components

```tsx
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map(item => (
        <li key={keyExtractor(item)}>
          {renderItem(item)}
        </li>
      ))}
    </ul>
  );
}

// Usage
<List
  items={users}
  renderItem={(user) => <UserCard user={user} />}
  keyExtractor={(user) => user.id}
/>
```

### Generic Constraints

```tsx
interface HasId {
  id: string;
}

function getIds<T extends HasId>(items: T[]): string[] {
  return items.map(item => item.id);
}

// Works with any type that has an id
const userIds = getIds(users);
const projectIds = getIds(projects);
```

---

## 7. Union and Intersection Types

### Union Types

```tsx
type Status = 'pending' | 'success' | 'error';

type Result = 
  | { status: 'success'; data: User }
  | { status: 'error'; error: string }
  | { status: 'pending' };

function handleResult(result: Result) {
  switch (result.status) {
    case 'success':
      console.log(result.data); // TypeScript knows data exists
      break;
    case 'error':
      console.log(result.error); // TypeScript knows error exists
      break;
    case 'pending':
      console.log('Loading...');
      break;
  }
}
```

### Intersection Types

```tsx
type Timestamped = {
  createdAt: Date;
  updatedAt: Date;
};

type UserWithTimestamps = User & Timestamped;

const user: UserWithTimestamps = {
  id: '1',
  name: 'John',
  email: 'john@example.com',
  createdAt: new Date(),
  updatedAt: new Date(),
};
```

---

## 8. Utility Types

### Partial

```tsx
interface User {
  id: string;
  name: string;
  email: string;
}

// All properties optional
type PartialUser = Partial<User>;

function updateUser(id: string, updates: Partial<User>) {
  // Can update any subset of properties
}

updateUser('1', { name: 'John' }); // OK
updateUser('1', { email: 'john@example.com' }); // OK
```

### Required

```tsx
interface Config {
  apiUrl?: string;
  timeout?: number;
}

// All properties required
type RequiredConfig = Required<Config>;

const config: RequiredConfig = {
  apiUrl: 'https://api.example.com',
  timeout: 5000, // Must provide
};
```

### Pick

```tsx
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
}

// Pick specific properties
type UserPreview = Pick<User, 'id' | 'name'>;

const preview: UserPreview = {
  id: '1',
  name: 'John',
  // email and password not allowed
};
```

### Omit

```tsx
// Omit specific properties
type UserWithoutPassword = Omit<User, 'password'>;

const user: UserWithoutPassword = {
  id: '1',
  name: 'John',
  email: 'john@example.com',
  // password not allowed
};
```

### Record

```tsx
// Create object type with specific keys
type UserRoles = 'admin' | 'editor' | 'viewer';

type Permissions = Record<UserRoles, string[]>;

const permissions: Permissions = {
  admin: ['read', 'write', 'delete'],
  editor: ['read', 'write'],
  viewer: ['read'],
};
```

### ReturnType

```tsx
function getUser() {
  return {
    id: '1',
    name: 'John',
    email: 'john@example.com',
  };
}

// Extract return type
type User = ReturnType<typeof getUser>;
```

---

## 9. Type Guards

### typeof Guard

```tsx
function processValue(value: string | number) {
  if (typeof value === 'string') {
    return value.toUpperCase(); // TypeScript knows it's string
  } else {
    return value * 2; // TypeScript knows it's number
  }
}
```

### instanceof Guard

```tsx
class User {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}

function greet(entity: User | string) {
  if (entity instanceof User) {
    console.log(`Hello, ${entity.name}`);
  } else {
    console.log(`Hello, ${entity}`);
  }
}
```

### Custom Type Guards

```tsx
interface User {
  type: 'user';
  name: string;
}

interface Admin {
  type: 'admin';
  name: string;
  permissions: string[];
}

function isAdmin(entity: User | Admin): entity is Admin {
  return entity.type === 'admin';
}

function handleEntity(entity: User | Admin) {
  if (isAdmin(entity)) {
    console.log(entity.permissions); // TypeScript knows it's Admin
  } else {
    console.log(entity.name); // TypeScript knows it's User
  }
}
```

---

## 10. Best Practices

### ✅ DO
- Use TypeScript strict mode
- Prefer interfaces for object shapes
- Use type for unions and aliases
- Type component props explicitly
- Use generics for reusable components
- Leverage utility types
- Create custom type guards
- Use const assertions for literals
- Type event handlers properly
- Document complex types
- Use enums for constants
- Avoid `any` type
- Enable ESLint TypeScript rules

### ❌ DON'T
- Use `any` unless absolutely necessary
- Ignore TypeScript errors
- Over-complicate types
- Forget to type event handlers
- Use `@ts-ignore` without comments
- Create overly nested types
- Duplicate type definitions
- Skip type annotations for complex cases
- Use implicit any
- Forget generic constraints

---

## 11. Common Patterns

### API Response Types

```tsx
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

interface ApiError {
  error: string;
  status: number;
}

type Result<T> = ApiResponse<T> | ApiError;

function isError(result: Result<any>): result is ApiError {
  return 'error' in result;
}

async function fetchUser(id: string): Promise<Result<User>> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}
```

### Form Types

```tsx
interface FormValues {
  name: string;
  email: string;
  age: number;
}

interface FormErrors {
  [K in keyof FormValues]?: string;
}

interface FormState {
  values: FormValues;
  errors: FormErrors;
  touched: Partial<Record<keyof FormValues, boolean>>;
  isSubmitting: boolean;
}
```

---

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [Total TypeScript](https://www.totaltypescript.com/)