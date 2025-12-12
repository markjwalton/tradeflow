# Testing Strategy Guide

## Overview
Comprehensive guide for implementing testing strategies including unit tests, integration tests, E2E tests, and test-driven development practices.

---

## 1. Testing Pyramid

### Structure
```
         /\
        /E2E\      Few, slow, expensive
       /------\
      /  API  \    Moderate coverage
     /----------\
    /   Unit     \  Many, fast, cheap
   /--------------\
```

### Test Distribution
- **Unit Tests (70%)**: Fast, isolated component/function tests
- **Integration Tests (20%)**: API and component integration
- **E2E Tests (10%)**: Full user journey tests

---

## 2. Unit Testing

### Setup with Vitest
```js
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
      ],
    },
  },
});
```

### Test Setup File
```js
// src/test/setup.js
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
```

### Component Testing
```jsx
// Button.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });
  
  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
  
  it('applies variant styles', () => {
    render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-destructive');
  });
});
```

### Hook Testing
```jsx
// useCounter.test.js
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('initializes with default value', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });
  
  it('increments count', () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });
  
  it('accepts initial value', () => {
    const { result } = renderHook(() => useCounter(10));
    expect(result.current.count).toBe(10);
  });
});
```

### Utility Function Testing
```js
// utils.test.js
import { describe, it, expect } from 'vitest';
import { formatCurrency, validateEmail } from './utils';

describe('formatCurrency', () => {
  it('formats USD currency', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });
  
  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });
  
  it('rounds to 2 decimals', () => {
    expect(formatCurrency(9.999)).toBe('$10.00');
  });
});

describe('validateEmail', () => {
  it('validates correct email', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });
  
  it('rejects invalid email', () => {
    expect(validateEmail('invalid')).toBe(false);
    expect(validateEmail('test@')).toBe(false);
    expect(validateEmail('@example.com')).toBe(false);
  });
});
```

---

## 3. Integration Testing

### API Integration Tests
```js
// api.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { base44 } from '@/api/base44Client';

// Mock the base44 client
vi.mock('@/api/base44Client', () => ({
  base44: {
    entities: {
      Project: {
        list: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    },
  },
}));

describe('Project API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('fetches projects', async () => {
    const mockProjects = [
      { id: '1', name: 'Project 1' },
      { id: '2', name: 'Project 2' },
    ];
    
    base44.entities.Project.list.mockResolvedValue(mockProjects);
    
    const projects = await base44.entities.Project.list();
    
    expect(projects).toEqual(mockProjects);
    expect(base44.entities.Project.list).toHaveBeenCalledTimes(1);
  });
  
  it('creates project', async () => {
    const newProject = { name: 'New Project' };
    const createdProject = { id: '3', ...newProject };
    
    base44.entities.Project.create.mockResolvedValue(createdProject);
    
    const result = await base44.entities.Project.create(newProject);
    
    expect(result).toEqual(createdProject);
    expect(base44.entities.Project.create).toHaveBeenCalledWith(newProject);
  });
});
```

### Component + API Integration
```jsx
// ProjectList.test.jsx
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi } from 'vitest';
import { ProjectList } from './ProjectList';
import { base44 } from '@/api/base44Client';

vi.mock('@/api/base44Client');

describe('ProjectList Integration', () => {
  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    
    return ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
  
  it('displays projects from API', async () => {
    const mockProjects = [
      { id: '1', name: 'Project Alpha' },
      { id: '2', name: 'Project Beta' },
    ];
    
    base44.entities.Project.list.mockResolvedValue(mockProjects);
    
    render(<ProjectList />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('Project Alpha')).toBeInTheDocument();
      expect(screen.getByText('Project Beta')).toBeInTheDocument();
    });
  });
  
  it('displays error message on failure', async () => {
    base44.entities.Project.list.mockRejectedValue(new Error('API Error'));
    
    render(<ProjectList />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
```

---

## 4. E2E Testing with Playwright

### Setup
```bash
npm install -D @playwright/test
npx playwright install
```

### Configuration
```js
// playwright.config.js
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### E2E Test Example
```js
// e2e/project-workflow.spec.js
import { test, expect } from '@playwright/test';

test.describe('Project Management Workflow', () => {
  test('user can create and manage project', async ({ page }) => {
    // Navigate to projects page
    await page.goto('/projects');
    
    // Click create project button
    await page.getByRole('button', { name: /create project/i }).click();
    
    // Fill in project details
    await page.getByLabel(/project name/i).fill('Test Project');
    await page.getByLabel(/description/i).fill('Test Description');
    
    // Submit form
    await page.getByRole('button', { name: /save/i }).click();
    
    // Verify project appears in list
    await expect(page.getByText('Test Project')).toBeVisible();
    
    // Click on project to view details
    await page.getByText('Test Project').click();
    
    // Verify we're on project detail page
    await expect(page).toHaveURL(/\/projects\/\w+/);
    await expect(page.getByRole('heading', { name: 'Test Project' })).toBeVisible();
  });
  
  test('user can filter projects', async ({ page }) => {
    await page.goto('/projects');
    
    // Apply filter
    await page.getByRole('combobox', { name: /status/i }).click();
    await page.getByRole('option', { name: /active/i }).click();
    
    // Verify filtered results
    const projects = page.getByRole('article');
    await expect(projects).toHaveCount(3); // Assuming 3 active projects
  });
});
```

### Authentication Testing
```js
// e2e/auth.spec.js
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
  
  test('successful login flow', async ({ page, context }) => {
    await page.goto('/login');
    
    // Fill in credentials
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('password123');
    
    // Submit login
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Verify user menu appears
    await expect(page.getByRole('button', { name: /profile/i })).toBeVisible();
  });
});
```

---

## 5. Test Coverage

### Package.json Scripts
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "npm run test:coverage && npm run test:e2e"
  }
}
```

### Coverage Configuration
```js
// vitest.config.js
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.test.{js,jsx,ts,tsx}',
        '**/*.config.{js,ts}',
        '**/types.ts',
      ],
    },
  },
});
```

---

## 6. Mocking Strategies

### Mock Base44 Client
```js
// src/test/mocks/base44.js
import { vi } from 'vitest';

export const mockBase44 = {
  entities: {
    Project: {
      list: vi.fn(() => Promise.resolve([])),
      create: vi.fn((data) => Promise.resolve({ id: '1', ...data })),
      update: vi.fn((id, data) => Promise.resolve({ id, ...data })),
      delete: vi.fn(() => Promise.resolve({ success: true })),
    },
    Task: {
      list: vi.fn(() => Promise.resolve([])),
      filter: vi.fn(() => Promise.resolve([])),
    },
  },
  auth: {
    me: vi.fn(() => Promise.resolve({ id: '1', email: 'test@example.com' })),
    isAuthenticated: vi.fn(() => Promise.resolve(true)),
    logout: vi.fn(),
  },
  functions: {
    invoke: vi.fn((name, params) => Promise.resolve({ success: true })),
  },
};

vi.mock('@/api/base44Client', () => ({
  base44: mockBase44,
}));
```

### Mock Fetch
```js
// src/test/mocks/fetch.js
import { vi } from 'vitest';

global.fetch = vi.fn((url) => {
  if (url.includes('/api/projects')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([
        { id: '1', name: 'Project 1' },
      ]),
    });
  }
  
  return Promise.reject(new Error('Not found'));
});
```

### Mock Local Storage
```js
// src/test/mocks/localStorage.js
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

global.localStorage = localStorageMock;
```

---

## 7. Testing Patterns

### Test Structure (AAA Pattern)
```js
test('description', () => {
  // Arrange - Set up test data and conditions
  const input = 'test@example.com';
  const expected = true;
  
  // Act - Execute the code being tested
  const result = validateEmail(input);
  
  // Assert - Verify the result
  expect(result).toBe(expected);
});
```

### Async Testing
```js
test('fetches data', async () => {
  const data = await fetchData();
  expect(data).toBeDefined();
});

test('handles errors', async () => {
  await expect(failingFunction()).rejects.toThrow('Error message');
});
```

### Snapshot Testing
```jsx
import { render } from '@testing-library/react';
import { expect, test } from 'vitest';

test('matches snapshot', () => {
  const { container } = render(<MyComponent />);
  expect(container).toMatchSnapshot();
});
```

### Parameterized Tests
```js
import { describe, it, expect } from 'vitest';

describe.each([
  { input: 'test@example.com', expected: true },
  { input: 'invalid', expected: false },
  { input: '', expected: false },
])('validateEmail($input)', ({ input, expected }) => {
  it(`returns ${expected}`, () => {
    expect(validateEmail(input)).toBe(expected);
  });
});
```

---

## 8. TDD (Test-Driven Development)

### Red-Green-Refactor Cycle
```js
// 1. RED - Write failing test first
describe('calculateDiscount', () => {
  it('applies 10% discount', () => {
    expect(calculateDiscount(100, 10)).toBe(90);
  });
});

// 2. GREEN - Write minimal code to pass
function calculateDiscount(price, percentage) {
  return price - (price * percentage / 100);
}

// 3. REFACTOR - Improve code quality
function calculateDiscount(price, percentage) {
  if (price < 0 || percentage < 0 || percentage > 100) {
    throw new Error('Invalid input');
  }
  return price * (1 - percentage / 100);
}

// 4. Add more tests
it('throws on invalid input', () => {
  expect(() => calculateDiscount(-10, 10)).toThrow();
  expect(() => calculateDiscount(100, -5)).toThrow();
  expect(() => calculateDiscount(100, 150)).toThrow();
});
```

---

## 9. Accessibility Testing

### Jest-axe Integration
```bash
npm install -D jest-axe
```

```jsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('should not have accessibility violations', async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Keyboard Navigation Testing
```jsx
test('can navigate with keyboard', async () => {
  render(<Menu />);
  
  const firstItem = screen.getByRole('menuitem', { name: 'Home' });
  firstItem.focus();
  
  // Press Tab
  await userEvent.keyboard('{Tab}');
  
  const secondItem = screen.getByRole('menuitem', { name: 'About' });
  expect(secondItem).toHaveFocus();
});
```

---

## 10. Visual Regression Testing

### Playwright Visual Comparison
```js
test('visual regression', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveScreenshot('dashboard.png');
});

// Update snapshots
// npx playwright test --update-snapshots
```

### Percy Integration
```bash
npm install -D @percy/playwright
```

```js
import { test } from '@playwright/test';
import percySnapshot from '@percy/playwright';

test('visual test', async ({ page }) => {
  await page.goto('/');
  await percySnapshot(page, 'Homepage');
});
```

---

## 11. Performance Testing

### Test Load Time
```js
test('page loads within 2 seconds', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/');
  const loadTime = Date.now() - startTime;
  
  expect(loadTime).toBeLessThan(2000);
});
```

### Bundle Size Testing
```js
import { test, expect } from 'vitest';
import { statSync } from 'fs';

test('bundle size is within limit', () => {
  const stats = statSync('dist/assets/index.js');
  const sizeInKB = stats.size / 1024;
  
  expect(sizeInKB).toBeLessThan(500); // Max 500KB
});
```

---

## 12. Best Practices

### ✅ DO
- Write tests before fixing bugs
- Test behavior, not implementation
- Keep tests independent and isolated
- Use descriptive test names
- Mock external dependencies
- Test edge cases and error conditions
- Maintain test code quality
- Run tests before committing
- Aim for high coverage on critical paths
- Use data-testid sparingly (prefer semantic queries)

### ❌ DON'T
- Test implementation details
- Write brittle tests that break easily
- Share state between tests
- Test third-party libraries
- Ignore failing tests
- Skip tests in CI/CD
- Test everything (focus on critical paths)
- Over-mock (test real integrations when possible)
- Commit without running tests

---

## 13. Testing Checklist

### Component Testing
- [ ] Renders without crashing
- [ ] Displays correct content
- [ ] Handles user interactions
- [ ] Updates on prop/state changes
- [ ] Handles loading states
- [ ] Handles error states
- [ ] Accessibility (keyboard, screen readers)
- [ ] Responsive behavior

### API Testing
- [ ] Successful responses
- [ ] Error handling
- [ ] Loading states
- [ ] Authentication
- [ ] Authorization
- [ ] Validation
- [ ] Rate limiting

### E2E Testing
- [ ] Critical user journeys
- [ ] Authentication flows
- [ ] Form submissions
- [ ] Navigation
- [ ] Error scenarios
- [ ] Cross-browser compatibility

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Jest-axe](https://github.com/nickcolley/jest-axe)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)