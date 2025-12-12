# Code Style Guide

## Overview
Comprehensive style guide for maintaining consistent, readable, and maintainable code across the React/TypeScript application.

---

## 1. File Organization

### Directory Structure
```
src/
├── components/
│   ├── common/           # Shared components
│   ├── forms/            # Form components
│   ├── layout/           # Layout components
│   ├── ui/               # UI library components
│   └── [feature]/        # Feature-specific components
├── pages/                # Page components (flat structure)
├── hooks/                # Custom React hooks
├── utils/                # Utility functions
├── api/                  # API clients
├── config/               # Configuration files
├── types/                # TypeScript types
└── test/                 # Test utilities
```

### File Naming
```bash
# Components - PascalCase
Button.jsx
UserProfile.jsx
DataTable.jsx

# Hooks - camelCase with 'use' prefix
useAuth.js
useDebounce.js
useFetch.js

# Utilities - camelCase
formatDate.js
validation.js
constants.js

# Types - PascalCase with .types suffix
User.types.ts
API.types.ts

# Tests - match source file with .test suffix
Button.test.jsx
useAuth.test.js
```

---

## 2. React Component Patterns

### Functional Components
```jsx
// ✅ Good - Clear, concise functional component
import React from 'react';
import { Button } from '@/components/ui/button';

export function UserCard({ user, onEdit }) {
  const [isEditing, setIsEditing] = React.useState(false);
  
  const handleSave = () => {
    onEdit(user.id);
    setIsEditing(false);
  };
  
  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-semibold">{user.name}</h3>
      <p className="text-muted-foreground">{user.email}</p>
      
      {isEditing ? (
        <Button onClick={handleSave}>Save</Button>
      ) : (
        <Button onClick={() => setIsEditing(true)}>Edit</Button>
      )}
    </div>
  );
}

// ❌ Bad - Class component (avoid unless necessary)
class UserCard extends React.Component {
  // Avoid class components
}
```

### Component Structure
```jsx
// Recommended order:
// 1. Imports
// 2. Types/Interfaces
// 3. Constants
// 4. Component definition
// 5. Exports

import React from 'react';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/utils/date';

const STATUS_COLORS = {
  active: 'bg-green-500',
  inactive: 'bg-gray-500',
};

export function ProjectCard({ project }) {
  // Hooks at the top
  const [expanded, setExpanded] = React.useState(false);
  
  // Event handlers
  const handleToggle = () => setExpanded(!expanded);
  
  // Derived state
  const statusColor = STATUS_COLORS[project.status];
  
  // Early returns
  if (!project) return null;
  
  // Main render
  return (
    <Card>
      {/* Component JSX */}
    </Card>
  );
}
```

### Props Destructuring
```jsx
// ✅ Good - Destructure props
export function UserInfo({ name, email, role }) {
  return (
    <div>
      <h3>{name}</h3>
      <p>{email}</p>
      <span>{role}</span>
    </div>
  );
}

// ❌ Bad - Using props object
export function UserInfo(props) {
  return (
    <div>
      <h3>{props.name}</h3>
      <p>{props.email}</p>
    </div>
  );
}
```

---

## 3. Naming Conventions

### Variables and Functions
```js
// ✅ Good - Descriptive, camelCase
const userList = [];
const isAuthenticated = true;
const hasPermission = false;

function getUserById(id) { }
function validateEmail(email) { }
function handleSubmit(event) { }

// ❌ Bad - Unclear, inconsistent
const ul = [];
const auth = true;
const perm = false;

function get(id) { }
function val(email) { }
function submit(e) { }
```

### Boolean Variables
```js
// ✅ Good - Use is/has/should prefixes
const isLoading = true;
const hasError = false;
const shouldRender = true;
const canEdit = true;

// ❌ Bad - Unclear intent
const loading = true;
const error = false;
const render = true;
```

### Constants
```js
// ✅ Good - UPPER_SNAKE_CASE for true constants
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = 'https://api.example.com';
const DEFAULT_PAGE_SIZE = 20;

// ✅ Good - camelCase for config objects
const apiConfig = {
  baseUrl: 'https://api.example.com',
  timeout: 5000,
};

// ❌ Bad - Mixed styles
const max_attempts = 3;
const ApiUrl = 'https://api.example.com';
```

### Event Handlers
```jsx
// ✅ Good - handle* prefix
function handleClick() { }
function handleSubmit() { }
function handleInputChange() { }

// Component
<Button onClick={handleClick} />
<Form onSubmit={handleSubmit} />
<Input onChange={handleInputChange} />

// ❌ Bad - Inconsistent naming
function click() { }
function onSubmit() { }
function changeInput() { }
```

---

## 4. Code Formatting

### Line Length
```js
// ✅ Good - Break long lines
const result = calculateComplexValue(
  firstParameter,
  secondParameter,
  thirdParameter
);

// Chain methods on new lines
const data = items
  .filter(item => item.active)
  .map(item => item.name)
  .sort();

// ❌ Bad - Too long
const result = calculateComplexValue(firstParameter, secondParameter, thirdParameter, fourthParameter);
```

### Spacing
```js
// ✅ Good - Consistent spacing
function add(a, b) {
  const sum = a + b;
  return sum;
}

const obj = { name: 'John', age: 30 };
const arr = [1, 2, 3, 4, 5];

// ❌ Bad - Inconsistent spacing
function add(a,b){
  const sum=a+b;
  return sum;
}

const obj={name:'John',age:30};
```

### Indentation
```jsx
// ✅ Good - 2 spaces
function Component() {
  return (
    <div>
      <Header />
      <Content>
        <Section>
          <Article />
        </Section>
      </Content>
    </div>
  );
}

// ❌ Bad - Inconsistent indentation
function Component() {
return (
<div>
    <Header />
  <Content>
      <Article />
  </Content>
</div>
);
}
```

---

## 5. JSX Patterns

### Self-Closing Tags
```jsx
// ✅ Good - Self-close when no children
<Input />
<Button variant="primary" />
<Image src="/logo.png" alt="Logo" />

// ❌ Bad - Unnecessary closing tag
<Input></Input>
<Button variant="primary"></Button>
```

### Props Formatting
```jsx
// ✅ Good - One prop per line for many props
<Button
  variant="primary"
  size="lg"
  disabled={isLoading}
  onClick={handleClick}
>
  Submit
</Button>

// ✅ Good - Inline for few props
<Button variant="primary" onClick={handleClick}>
  Submit
</Button>

// ❌ Bad - Multiple props on same line when too long
<Button variant="primary" size="lg" disabled={isLoading} onClick={handleClick}>
  Submit
</Button>
```

### Conditional Rendering
```jsx
// ✅ Good - Clear conditionals
{isLoading && <Spinner />}
{error && <ErrorMessage error={error} />}
{data ? <DataView data={data} /> : <EmptyState />}

// ✅ Good - Early return for complex conditions
if (!user) return <LoginPrompt />;
if (isLoading) return <Spinner />;

return <Dashboard user={user} />;

// ❌ Bad - Nested ternaries
{data ? (
  error ? <Error /> : <Content />
) : (
  loading ? <Spinner /> : null
)}
```

### Lists and Keys
```jsx
// ✅ Good - Use stable keys
{users.map(user => (
  <UserCard key={user.id} user={user} />
))}

// ❌ Bad - Using index as key
{users.map((user, index) => (
  <UserCard key={index} user={user} />
))}
```

---

## 6. State Management

### useState
```jsx
// ✅ Good - Descriptive names
const [isOpen, setIsOpen] = React.useState(false);
const [selectedUser, setSelectedUser] = React.useState(null);
const [formData, setFormData] = React.useState({ name: '', email: '' });

// ✅ Good - Functional updates for derived state
const [count, setCount] = React.useState(0);
const increment = () => setCount(prev => prev + 1);

// ❌ Bad - Generic names
const [open, setOpen] = React.useState(false);
const [user, setUser] = React.useState(null);
```

### useEffect
```jsx
// ✅ Good - Clear dependency array
React.useEffect(() => {
  fetchData();
}, [userId]); // Only re-run when userId changes

// ✅ Good - Cleanup function
React.useEffect(() => {
  const timer = setTimeout(() => {
    doSomething();
  }, 1000);
  
  return () => clearTimeout(timer);
}, []);

// ❌ Bad - Missing dependencies
React.useEffect(() => {
  fetchData(userId);
}, []); // userId should be in dependency array
```

---

## 7. Error Handling

### Try-Catch Blocks
```js
// ✅ Good - Specific error handling
async function fetchUserData(userId) {
  try {
    const response = await api.getUser(userId);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('User not found');
    }
    throw new Error('Failed to fetch user data');
  }
}

// ❌ Bad - Silent failures
async function fetchUserData(userId) {
  try {
    const response = await api.getUser(userId);
    return response.data;
  } catch (error) {
    // Silent failure
  }
}
```

### Error Boundaries
```jsx
// ✅ Good - Use error boundaries for components
<ErrorBoundary fallback={<ErrorMessage />}>
  <ComplexComponent />
</ErrorBoundary>
```

---

## 8. Comments and Documentation

### When to Comment
```js
// ✅ Good - Explain WHY, not WHAT
// Using setTimeout to debounce API calls and prevent rate limiting
const debouncedSearch = debounce(searchAPI, 300);

// Complex business logic deserves explanation
// Calculate discount: 10% for orders over $100, 15% for over $500
const discount = calculateDiscount(orderTotal);

// ❌ Bad - Stating the obvious
// Set loading to true
setLoading(true);

// Call API
fetchData();
```

### JSDoc for Functions
```js
/**
 * Formats a date string into a human-readable format
 * @param {string} dateString - ISO date string
 * @param {string} format - Desired output format
 * @returns {string} Formatted date
 */
export function formatDate(dateString, format = 'MMM DD, YYYY') {
  return moment(dateString).format(format);
}
```

### Component Documentation
```jsx
/**
 * UserCard - Displays user information in a card layout
 * 
 * @param {Object} user - User object containing name, email, role
 * @param {Function} onEdit - Callback when edit button is clicked
 * @param {boolean} isEditable - Whether the card can be edited
 */
export function UserCard({ user, onEdit, isEditable = true }) {
  // Component implementation
}
```

---

## 9. Performance Best Practices

### Memoization
```jsx
// ✅ Good - Memoize expensive calculations
const expensiveValue = React.useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// ✅ Good - Memoize callbacks
const handleClick = React.useCallback(() => {
  doSomething(value);
}, [value]);

// ❌ Bad - Unnecessary memoization
const simpleValue = React.useMemo(() => data.length, [data]); // Too simple
```

### Component Splitting
```jsx
// ✅ Good - Split large components
function UserDashboard({ user }) {
  return (
    <div>
      <UserHeader user={user} />
      <UserStats user={user} />
      <UserActivity user={user} />
    </div>
  );
}

// ❌ Bad - Everything in one component
function UserDashboard({ user }) {
  return (
    <div>
      {/* 500 lines of JSX */}
    </div>
  );
}
```

---

## 10. Imports Organization

### Import Order
```jsx
// 1. External dependencies
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

// 2. Internal components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// 3. Hooks and utilities
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/utils/format';

// 4. Types
import type { User } from '@/types/User';

// 5. Styles (if any)
import './styles.css';
```

### Named vs Default Exports
```js
// ✅ Good - Named exports for utilities
export function formatDate() { }
export function parseDate() { }

// ✅ Good - Default export for components
export default function UserProfile() { }

// Or named export
export function UserProfile() { }

// ❌ Bad - Mixing inconsistently
export default function formatDate() { } // Utility as default
export UserProfile; // Component without function keyword
```

---

## 11. Testing Conventions

### Test File Organization
```js
// UserCard.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { UserCard } from './UserCard';

describe('UserCard', () => {
  // Group related tests
  describe('rendering', () => {
    it('displays user name', () => {
      // Test implementation
    });
    
    it('displays user email', () => {
      // Test implementation
    });
  });
  
  describe('interactions', () => {
    it('calls onEdit when edit button clicked', () => {
      // Test implementation
    });
  });
});
```

### Test Naming
```js
// ✅ Good - Descriptive test names
it('displays error message when API call fails', () => { });
it('disables submit button when form is invalid', () => { });
it('redirects to login when user is not authenticated', () => { });

// ❌ Bad - Vague test names
it('works correctly', () => { });
it('handles errors', () => { });
it('test button', () => { });
```

---

## 12. Git Commit Messages

### Commit Format
```bash
# Format: <type>(<scope>): <subject>

# ✅ Good examples
feat(auth): add password reset functionality
fix(dashboard): correct data calculation error
refactor(components): simplify Button component API
docs(readme): update installation instructions
test(utils): add tests for date formatting
style(global): fix indentation in Layout component
chore(deps): update React to v18.2.0

# Types:
# feat: New feature
# fix: Bug fix
# refactor: Code refactoring
# docs: Documentation
# test: Adding tests
# style: Code style changes
# chore: Maintenance tasks
# perf: Performance improvements

# ❌ Bad examples
updated stuff
fix
WIP
changes
```

---

## 13. ESLint and Prettier

### ESLint Configuration
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "error",
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

### Prettier Configuration
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "always"
}
```

---

## 14. Accessibility in Code

### Semantic HTML
```jsx
// ✅ Good - Semantic elements
<header>
  <nav>
    <ul>
      <li><a href="/">Home</a></li>
    </ul>
  </nav>
</header>

<main>
  <article>
    <h1>Title</h1>
    <p>Content</p>
  </article>
</main>

// ❌ Bad - Generic divs
<div className="header">
  <div className="nav">
    <div className="item">Home</div>
  </div>
</div>
```

### ARIA Attributes
```jsx
// ✅ Good - Proper ARIA usage
<button
  aria-label="Close dialog"
  aria-expanded={isOpen}
  onClick={handleClose}
>
  <X />
</button>

// ❌ Bad - Missing accessibility
<div onClick={handleClose}>
  <X />
</div>
```

---

## 15. Code Review Checklist

### Self-Review
- [ ] Code follows style guide
- [ ] No console.log statements
- [ ] No commented-out code
- [ ] Proper error handling
- [ ] Tests added/updated
- [ ] No hardcoded values
- [ ] Responsive design
- [ ] Accessibility considered
- [ ] Performance optimized
- [ ] Security best practices
- [ ] Documentation updated

---

## 16. Best Practices Summary

### ✅ DO
- Write self-documenting code
- Use meaningful variable names
- Keep functions small and focused
- Follow single responsibility principle
- Write tests for critical functionality
- Handle errors gracefully
- Use TypeScript for type safety
- Optimize for readability first
- Use consistent formatting
- Document complex logic
- Review your own code before PR

### ❌ DON'T
- Use magic numbers
- Write deeply nested code
- Ignore ESLint warnings
- Skip code reviews
- Commit console.log statements
- Use var instead of const/let
- Write 1000-line components
- Copy-paste code without understanding
- Ignore accessibility
- Commit broken code
- Push directly to main

---

## Resources

- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [React Best Practices](https://react.dev/learn/thinking-in-react)
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)