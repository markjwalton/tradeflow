# Accessibility (a11y) Implementation Guide

## Overview
Comprehensive guide for implementing WCAG 2.1 Level AA accessibility standards in the application.

---

## Current Implementation

### ✅ Already Available
- **a11yUtils.js** - Color contrast checking, focus trapping, ARIA utilities
- **Keyboard Navigation Hooks** - useKeyboardNav, useEscapeKey
- **Shadcn/UI Components** - Built with accessibility in mind
- **Semantic HTML** - Proper heading hierarchy

---

## 1. Keyboard Navigation

### Focus Management
```jsx
import { useFocusTrap } from '@/components/common/a11yUtils';

function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef(null);
  
  useFocusTrap(modalRef, isOpen);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent ref={modalRef}>
        {children}
      </DialogContent>
    </Dialog>
  );
}
```

### Skip to Main Content
```jsx
function Layout({ children }) {
  return (
    <>
      <a 
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-primary focus:text-primary-foreground"
      >
        Skip to main content
      </a>
      
      <Header />
      
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
    </>
  );
}
```

### Keyboard Shortcuts
```jsx
function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd/Ctrl + K for search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }
      
      // Escape to close modals
      if (e.key === 'Escape') {
        closeModal();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
}
```

---

## 2. ARIA Attributes

### Landmark Roles
```jsx
function AppLayout() {
  return (
    <>
      <header role="banner">
        <nav role="navigation" aria-label="Main navigation">
          {/* Navigation items */}
        </nav>
      </header>
      
      <main role="main">
        {/* Main content */}
      </main>
      
      <aside role="complementary" aria-label="Sidebar">
        {/* Sidebar content */}
      </aside>
      
      <footer role="contentinfo">
        {/* Footer content */}
      </footer>
    </>
  );
}
```

### Live Regions
```jsx
import { announceToScreenReader } from '@/components/common/a11yUtils';

function useNotifications() {
  const notify = (message, priority = 'polite') => {
    announceToScreenReader(message, priority);
    toast(message);
  };
  
  return { notify };
}

// Usage
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>
```

### Dynamic Content Updates
```jsx
function TaskList({ tasks }) {
  return (
    <div role="region" aria-label="Task list">
      <div 
        aria-live="polite" 
        aria-atomic="false"
        className="sr-only"
      >
        {tasks.length} tasks in list
      </div>
      
      <ul>
        {tasks.map(task => (
          <TaskItem key={task.id} task={task} />
        ))}
      </ul>
    </div>
  );
}
```

---

## 3. Color Contrast

### Check Contrast Ratios
```jsx
import { checkColorContrast } from '@/components/common/a11yUtils';

function ColorPicker({ color, onChange }) {
  const [error, setError] = useState('');
  
  const handleChange = (newColor) => {
    const background = getComputedStyle(document.body).backgroundColor;
    const contrast = checkColorContrast(newColor, background);
    
    if (!contrast.AA) {
      setError('Color contrast too low (WCAG AA failure)');
    } else {
      setError('');
      onChange(newColor);
    }
  };
  
  return (
    <div>
      <input type="color" onChange={(e) => handleChange(e.target.value)} />
      {error && <span role="alert">{error}</span>}
    </div>
  );
}
```

### Text Contrast Requirements
- **Normal text (< 18px)**: Minimum 4.5:1
- **Large text (≥ 18px or bold ≥ 14px)**: Minimum 3:1
- **UI components**: Minimum 3:1

### Color-Independent Information
```jsx
// ❌ Bad - relies only on color
<span className="text-red-500">Error</span>

// ✅ Good - color + icon + text
<span className="text-red-500 flex items-center gap-2">
  <AlertCircle className="h-4 w-4" aria-hidden="true" />
  <span>Error: Invalid input</span>
</span>
```

---

## 4. Form Accessibility

### Label Association
```jsx
// ✅ Explicit labels
<div>
  <Label htmlFor="email">Email address</Label>
  <Input 
    id="email" 
    type="email" 
    aria-describedby="email-hint"
    aria-required="true"
  />
  <p id="email-hint" className="text-sm text-muted-foreground">
    We'll never share your email
  </p>
</div>
```

### Error Handling
```jsx
function FormField({ name, label, error, register }) {
  const errorId = `${name}-error`;
  
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        {...register(name)}
      />
      {error && (
        <p 
          id={errorId} 
          role="alert" 
          className="text-destructive text-sm"
        >
          {error.message}
        </p>
      )}
    </div>
  );
}
```

### Required Fields
```jsx
<Label htmlFor="name">
  Name 
  <span aria-label="required" className="text-destructive">*</span>
</Label>
<Input 
  id="name" 
  required 
  aria-required="true"
/>
```

### Fieldset for Related Inputs
```jsx
<fieldset>
  <legend>Contact Information</legend>
  <div>
    <Label htmlFor="phone">Phone</Label>
    <Input id="phone" type="tel" />
  </div>
  <div>
    <Label htmlFor="email">Email</Label>
    <Input id="email" type="email" />
  </div>
</fieldset>
```

---

## 5. Screen Reader Support

### Descriptive Link Text
```jsx
// ❌ Bad
<Link to="/projects">Click here</Link>

// ✅ Good
<Link to="/projects">View all projects</Link>

// ✅ Good - with context
<Link to={`/projects/${id}`} aria-label={`Edit ${projectName} project`}>
  Edit
</Link>
```

### Hidden Content
```jsx
// Visually hidden but accessible to screen readers
<span className="sr-only">Loading...</span>

// Hidden from everyone
<div aria-hidden="true">Decorative content</div>

// Icon with accessible label
<Button aria-label="Close dialog">
  <X aria-hidden="true" />
</Button>
```

### Image Alt Text
```jsx
// ✅ Descriptive alt text
<img src="chart.png" alt="Bar chart showing sales increased 25% in Q4" />

// ✅ Decorative images
<img src="decorative.png" alt="" role="presentation" />

// ✅ Complex images with long description
<figure>
  <img 
    src="diagram.png" 
    alt="System architecture diagram"
    aria-describedby="diagram-desc"
  />
  <figcaption id="diagram-desc">
    Detailed description of the architecture...
  </figcaption>
</figure>
```

---

## 6. Interactive Elements

### Button vs Link
```jsx
// ✅ Button for actions
<Button onClick={handleSubmit}>Submit form</Button>

// ✅ Link for navigation
<Link to="/projects">View projects</Link>

// ❌ Don't do this
<div onClick={handleClick}>Click me</div>

// ✅ If you must use div, make it accessible
<div 
  role="button" 
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  Click me
</div>
```

### Disabled States
```jsx
<Button 
  disabled={isLoading}
  aria-disabled={isLoading}
  aria-label={isLoading ? 'Submitting form...' : 'Submit form'}
>
  {isLoading ? (
    <>
      <Loader2 className="animate-spin" aria-hidden="true" />
      <span>Submitting...</span>
    </>
  ) : (
    'Submit'
  )}
</Button>
```

### Toggle Buttons
```jsx
function ToggleButton({ pressed, onToggle, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={pressed}
      aria-label={label}
      onClick={onToggle}
    >
      {pressed ? 'On' : 'Off'}
    </button>
  );
}
```

---

## 7. Tables

### Accessible Table Structure
```jsx
<table role="table">
  <caption>Project list with status and due dates</caption>
  <thead>
    <tr>
      <th scope="col">Project Name</th>
      <th scope="col">Status</th>
      <th scope="col">Due Date</th>
      <th scope="col">Actions</th>
    </tr>
  </thead>
  <tbody>
    {projects.map(project => (
      <tr key={project.id}>
        <th scope="row">{project.name}</th>
        <td>{project.status}</td>
        <td>{project.dueDate}</td>
        <td>
          <Button 
            variant="ghost" 
            size="sm"
            aria-label={`Edit ${project.name}`}
          >
            Edit
          </Button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

### Sortable Tables
```jsx
function SortableHeader({ column, sortConfig, onSort }) {
  const isSorted = sortConfig.column === column;
  
  return (
    <th scope="col">
      <button
        onClick={() => onSort(column)}
        aria-sort={
          isSorted 
            ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending')
            : 'none'
        }
      >
        {column}
        {isSorted && (
          <span aria-hidden="true">
            {sortConfig.direction === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </button>
    </th>
  );
}
```

---

## 8. Modals and Dialogs

### Accessible Modal
```jsx
function AccessibleModal({ isOpen, onClose, title, children }) {
  const contentRef = useRef(null);
  
  useEffect(() => {
    if (isOpen && contentRef.current) {
      // Focus first focusable element
      const focusable = contentRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      focusable?.focus();
    }
  }, [isOpen]);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        ref={contentRef}
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        <DialogHeader>
          <DialogTitle id="dialog-title">{title}</DialogTitle>
        </DialogHeader>
        
        <div id="dialog-description">
          {children}
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 9. Loading States

### Accessible Loading Indicators
```jsx
function LoadingState({ message = 'Loading...' }) {
  return (
    <div 
      role="status" 
      aria-live="polite" 
      aria-label={message}
      className="flex items-center gap-2"
    >
      <Loader2 className="animate-spin" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
```

### Skeleton Screens
```jsx
function SkeletonCard() {
  return (
    <div 
      role="status" 
      aria-live="polite"
      aria-label="Loading content"
    >
      <Skeleton className="h-24 w-full" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
```

---

## 10. Testing Checklist

### Manual Testing
- [ ] Navigate entire app using only keyboard (Tab, Enter, Escape)
- [ ] Test with screen reader (NVDA, JAWS, VoiceOver)
- [ ] Verify all interactive elements are focusable
- [ ] Check focus indicators are visible
- [ ] Test at 200% zoom
- [ ] Use browser dev tools accessibility panel
- [ ] Test with reduced motion preference

### Automated Testing
```jsx
// Using jest-axe
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('should not have accessibility violations', async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Tools
- **Chrome Lighthouse** - Automated accessibility audit
- **axe DevTools** - Browser extension for a11y testing
- **WAVE** - Web accessibility evaluation tool
- **Screen readers**: NVDA (Windows), JAWS (Windows), VoiceOver (macOS/iOS)

---

## 11. Common Patterns

### Accessible Dropdown Menu
```jsx
<DropdownMenu>
  <DropdownMenuTrigger aria-haspopup="true" aria-expanded={isOpen}>
    Options
  </DropdownMenuTrigger>
  <DropdownMenuContent role="menu">
    <DropdownMenuItem role="menuitem" onSelect={handleEdit}>
      <Edit className="mr-2 h-4 w-4" aria-hidden="true" />
      <span>Edit</span>
    </DropdownMenuItem>
    <DropdownMenuItem role="menuitem" onSelect={handleDelete}>
      <Trash className="mr-2 h-4 w-4" aria-hidden="true" />
      <span>Delete</span>
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Accessible Tabs
```jsx
<Tabs defaultValue="tab1">
  <TabsList role="tablist" aria-label="Project sections">
    <TabsTrigger value="tab1" role="tab" aria-controls="panel1">
      Overview
    </TabsTrigger>
    <TabsTrigger value="tab2" role="tab" aria-controls="panel2">
      Tasks
    </TabsTrigger>
  </TabsList>
  
  <TabsContent value="tab1" role="tabpanel" id="panel1">
    Overview content
  </TabsContent>
  <TabsContent value="tab2" role="tabpanel" id="panel2">
    Tasks content
  </TabsContent>
</Tabs>
```

### Accessible Accordion
```jsx
<Accordion type="single" collapsible>
  <AccordionItem value="item1">
    <AccordionTrigger aria-expanded={isOpen} aria-controls="content1">
      Section 1
    </AccordionTrigger>
    <AccordionContent id="content1" role="region">
      Content for section 1
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

---

## 12. Best Practices

### ✅ DO
- Use semantic HTML elements
- Provide text alternatives for non-text content
- Ensure keyboard operability for all functionality
- Use sufficient color contrast (4.5:1 minimum)
- Make focus indicators clearly visible
- Use ARIA attributes correctly
- Test with actual assistive technologies
- Support reduced motion preferences

### ❌ DON'T
- Use `div` or `span` for interactive elements
- Rely on color alone to convey information
- Remove focus outlines without replacement
- Use placeholder as label
- Make content keyboard-inaccessible
- Override native semantics unnecessarily
- Forget alt text for images
- Use auto-playing media without controls

---

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Inclusive Components](https://inclusive-components.design/)