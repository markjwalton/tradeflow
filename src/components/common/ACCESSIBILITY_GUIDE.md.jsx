# Accessibility (a11y) Guide

## Color Contrast Verification

After OKLCH token migration, verify all color combinations meet WCAG AA standards (4.5:1 ratio).

### Using a11yUtils

```javascript
import { meetsContrastRequirement } from '@/components/common/a11yUtils';

// Check text/background contrast
const isAccessible = meetsContrastRequirement('#333333', '#FFFFFF');
console.log('Meets WCAG AA:', isAccessible);
```

### Automated Contrast Checking

```javascript
// Run on token updates
const tokens = {
  text: 'var(--text-primary)',
  background: 'var(--background)',
};

Object.entries(tokens).forEach(([key, value]) => {
  const computed = getComputedStyle(document.documentElement).getPropertyValue(value);
  // Check contrast
});
```

## Focus Ring Visibility

All interactive elements must have visible focus indicators:

```css
/* globals.css - ensure focus rings are visible */
*:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}

button:focus-visible,
a:focus-visible {
  outline: 2px solid var(--primary-600);
  outline-offset: 2px;
}
```

## Skip Links

Add skip navigation for keyboard users:

```jsx
// In Layout.jsx
<a 
  href="#main-content" 
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white"
>
  Skip to main content
</a>

<main id="main-content">
  {children}
</main>
```

## Keyboard Navigation

### Menu Navigation

```jsx
import { useKeyboardNav } from '@/components/common/useKeyboardNav';

function Menu({ items }) {
  const [activeIndex, setActiveIndex] = useState(0);
  
  useKeyboardNav(items, (item) => {
    handleSelect(item);
  }, {
    activeIndex,
    onIndexChange: setActiveIndex,
    loop: true,
  });

  return (
    <div role="menu">
      {items.map((item, i) => (
        <div
          key={i}
          role="menuitem"
          tabIndex={i === activeIndex ? 0 : -1}
          className={i === activeIndex ? 'bg-accent' : ''}
        >
          {item.label}
        </div>
      ))}
    </div>
  );
}
```

### Focus Trapping in Dialogs

```jsx
import { trapFocus } from '@/components/common/a11yUtils';

function Dialog({ isOpen, children }) {
  const dialogRef = useRef();

  useEffect(() => {
    if (isOpen && dialogRef.current) {
      const cleanup = trapFocus(dialogRef.current);
      return cleanup;
    }
  }, [isOpen]);

  return (
    <div ref={dialogRef} role="dialog" aria-modal="true">
      {children}
    </div>
  );
}
```

## Screen Reader Announcements

```jsx
import { announceToScreenReader } from '@/components/common/a11yUtils';

function SaveButton() {
  const handleSave = async () => {
    await save();
    announceToScreenReader('Changes saved successfully', 'polite');
  };

  return <button onClick={handleSave}>Save</button>;
}
```

## ARIA Labels

### Form Fields

```jsx
<ValidatedInput
  label="Email"
  aria-describedby="email-help"
  aria-invalid={!!error}
  aria-required="true"
/>
<p id="email-help" className="text-sm text-muted-foreground">
  We'll never share your email
</p>
```

### Icon Buttons

```jsx
<button aria-label="Close dialog">
  <X className="h-4 w-4" />
</button>
```

### Loading States

```jsx
<div role="status" aria-live="polite" aria-busy={isLoading}>
  {isLoading ? 'Loading...' : content}
</div>
```

## Running axe-core Checks

### Install axe-core

```bash
npm install -D @axe-core/react
```

### Development Setup

```javascript
// main.jsx (development only)
if (import.meta.env.DEV) {
  import('@axe-core/react').then(axe => {
    axe.default(React, ReactDOM, 1000);
  });
}
```

### Manual Testing

```javascript
// Run in console
const axe = require('@axe-core/core');

axe.run(document, {
  rules: {
    'color-contrast': { enabled: true },
    'keyboard-navigation': { enabled: true },
  }
}).then(results => {
  console.log('Violations:', results.violations);
});
```

## Radix UI Accessibility

Radix UI components are accessible by default, but verify:

### Dialog

```jsx
<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogTitle>Title</DialogTitle>
    <DialogDescription>Description</DialogDescription>
    {/* Content */}
  </DialogContent>
</Dialog>
```

### Dropdown Menu

```jsx
<DropdownMenu>
  <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onSelect={() => {}}>
      Item 1
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

## Testing Checklist

- [ ] All colors meet WCAG AA contrast (4.5:1)
- [ ] Focus indicators visible on all interactive elements
- [ ] Skip links implemented
- [ ] Keyboard navigation works (Tab, Arrow keys, Enter, Escape)
- [ ] Screen reader testing (NVDA/JAWS/VoiceOver)
- [ ] All images have alt text
- [ ] All form fields have labels
- [ ] Error messages are associated with fields
- [ ] Loading states announced to screen readers
- [ ] Modal/dialog focus trapping works
- [ ] No axe-core violations
- [ ] Semantic HTML used (heading hierarchy, landmarks)

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Radix UI Accessibility](https://www.radix-ui.com/docs/primitives/overview/accessibility)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)