# Sturij Design System - LLM Implementation Guidelines

## Critical Rules for AI Code Generation

### 1. NEVER Use Inline Styles

❌ **WRONG:**
```jsx
<h1 style={{ fontFamily: 'var(--font-heading)' }}>Title</h1>
<div style={{ backgroundColor: '#4A5D4E' }}>Content</div>
```

✅ **CORRECT:**
```jsx
<h1 className="font-heading text-[var(--color-midnight)]">Title</h1>
<div className="bg-[var(--color-primary)]">Content</div>
```

### 2. ALWAYS Use Design Token CSS Variables

❌ **WRONG:**
```jsx
className="text-gray-500 bg-blue-100 border-gray-200"
```

✅ **CORRECT:**
```jsx
className="text-[var(--color-charcoal)] bg-[var(--color-info)]/10 border-[var(--color-background-muted)]"
```

### 3. Typography: Use Classes, Not Inline Styles

❌ **WRONG:**
```jsx
<h1 style={{ fontFamily: 'var(--font-heading)' }}>
<span style={{ fontFamily: 'Degular Display Light' }}>
```

✅ **CORRECT:**
```jsx
<h1 className="font-heading text-[var(--color-midnight)]">
<span className="font-heading">
```

## Color Token Reference

### Text Colors (Most Common)

| Use Case | Token | Example |
|----------|-------|---------|
| Primary headings | `text-[var(--color-midnight)]` | Page titles, section headers |
| Body text | `text-[var(--color-charcoal)]` | Paragraphs, descriptions |
| Muted/secondary | `text-muted` or `text-[var(--color-charcoal)]/70` | Helper text, timestamps |
| Links/actions | `text-[var(--color-primary)]` | Clickable text |
| Error text | `text-[var(--color-destructive)]` | Error messages |
| Success text | `text-[var(--color-success)]` | Success messages |

### Background Colors

| Use Case | Token | Example |
|----------|-------|---------|
| Page background | `bg-[var(--color-background)]` | Main page wrapper |
| Card/paper | `bg-[var(--color-background-paper)]` | Cards, modals |
| Subtle sections | `bg-[var(--color-background-subtle)]` | Alternating rows |
| Muted areas | `bg-[var(--color-background-muted)]` | Disabled states |
| Primary | `bg-[var(--color-primary)]` | Primary buttons |
| Secondary | `bg-[var(--color-secondary)]` | Secondary buttons |

### Border Colors

| Use Case | Token |
|----------|-------|
| Standard borders | `border-[var(--color-background-muted)]` |
| Primary accent | `border-[var(--color-primary)]` |
| Error borders | `border-[var(--color-destructive)]` |

## Component Patterns

### Standard Page Structure

```jsx
export default function MyPage() {
  return (
    <div className="p-6 bg-[var(--color-background)] min-h-screen">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-heading text-[var(--color-midnight)] mb-2">
          Page Title
        </h1>
        <p className="text-[var(--color-charcoal)]">
          Page description
        </p>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Cards, lists, etc. */}
      </div>
    </div>
  );
}
```

### Cards

```jsx
<Card className="border-[var(--color-background-muted)] bg-[var(--color-background-paper)]">
  <CardHeader>
    <CardTitle className="text-[var(--color-midnight)]">
      Card Title
    </CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-[var(--color-charcoal)]">Content</p>
  </CardContent>
</Card>
```

### Buttons

```jsx
// Primary action
<Button className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white">
  Primary Action
</Button>

// Secondary action
<Button className="bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white">
  Secondary Action
</Button>

// Destructive action
<Button variant="ghost" className="text-[var(--color-destructive)] hover:bg-[var(--color-destructive)]/10">
  Delete
</Button>

// Outline (uses default shadcn styling)
<Button variant="outline">
  Cancel
</Button>
```

### Dialogs

```jsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle className="text-[var(--color-midnight)]">
        Dialog Title
      </DialogTitle>
    </DialogHeader>
    <div className="space-y-4">
      {/* Dialog content */}
    </div>
  </DialogContent>
</Dialog>
```

### Lists with Badges

```jsx
<div className="space-y-2">
  {items.map(item => (
    <div key={item.id} className="p-3 bg-[var(--color-background-paper)] border border-[var(--color-background-muted)] rounded-[var(--radius-lg)]">
      <h3 className="font-medium text-[var(--color-midnight)]">{item.name}</h3>
      <p className="text-sm text-[var(--color-charcoal)]">{item.description}</p>
      <div className="flex gap-2 mt-2">
        <Badge className="bg-[var(--color-success)]/20 text-[var(--color-success-dark)]">
          Active
        </Badge>
      </div>
    </div>
  ))}
</div>
```

### Empty States

```jsx
<div className="text-center py-12 text-[var(--color-charcoal)]">
  <IconComponent className="h-12 w-12 mx-auto mb-4 opacity-50" />
  <p>No items found</p>
  <p className="text-sm mt-1">Get started by creating your first item</p>
  <Button className="mt-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white">
    Create Item
  </Button>
</div>
```

## Common Replacements

When migrating existing code, replace:

| Old (Hardcoded) | New (Sturij Token) |
|-----------------|-------------------|
| `text-gray-900` | `text-[var(--color-midnight)]` |
| `text-gray-700` | `text-[var(--color-charcoal)]` |
| `text-gray-500` | `text-[var(--color-charcoal)]` or `text-muted` |
| `text-gray-400` | `text-[var(--color-charcoal)]/70` |
| `bg-white` | `bg-[var(--color-background-paper)]` |
| `bg-gray-50` | `bg-[var(--color-background-subtle)]` |
| `bg-gray-100` | `bg-[var(--color-background)]` |
| `border-gray-200` | `border-[var(--color-background-muted)]` |
| `text-blue-600` | `text-[var(--color-info)]` |
| `text-green-600` | `text-[var(--color-success)]` |
| `text-red-600` | `text-[var(--color-destructive)]` |
| `text-amber-600` | `text-[var(--color-warning)]` |
| `bg-blue-100` | `bg-[var(--color-info)]/10` |
| `bg-green-100` | `bg-[var(--color-success)]/10` |
| `bg-red-100` | `bg-[var(--color-destructive)]/10` |

## Advanced Patterns

### Status Badges with Semantic Colors

```jsx
const statusConfig = {
  active: { bg: "bg-[var(--color-success)]/20", text: "text-[var(--color-success-dark)]" },
  pending: { bg: "bg-[var(--color-warning)]/20", text: "text-[var(--color-warning-dark)]" },
  error: { bg: "bg-[var(--color-destructive)]/20", text: "text-[var(--color-destructive)]" },
  info: { bg: "bg-[var(--color-info)]/20", text: "text-[var(--color-info-dark)]" }
};

<Badge className={`${statusConfig[status].bg} ${statusConfig[status].text}`}>
  {status}
</Badge>
```

### Hover States

```jsx
// Cards
<Card className="border-[var(--color-background-muted)] hover:shadow-[var(--shadow-md)] transition-shadow">

// Interactive rows
<div className="p-3 rounded-[var(--radius-lg)] hover:bg-[var(--color-background-subtle)] transition-colors cursor-pointer">

// Buttons (already handled by default variants)
<Button className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]">
```

### Loading States

```jsx
<div className="flex justify-center py-12">
  <Loader2 className="h-8 w-8 animate-spin text-[var(--color-charcoal)]" />
</div>
```

## Accessibility

Sturij tokens maintain WCAG AA contrast ratios:
- `--color-midnight` on `--color-background-paper`: 16.8:1 (AAA)
- `--color-charcoal` on `--color-background-paper`: 10.5:1 (AAA)
- `--color-primary` on white: 5.2:1 (AA)

Always use semantic HTML and ARIA labels where appropriate.

## Performance

Design tokens add minimal overhead:
- CSS variables are highly performant
- No JavaScript runtime cost for color calculations
- Utility classes prevent style duplication

## Validation

Before committing code, verify:
1. No inline `style={{}}` attributes exist
2. No hardcoded Tailwind colors (gray-*, blue-*, etc.)
3. All headings use `font-heading` class
4. All dialog titles use `text-[var(--color-midnight)]`
5. All cards use `border-[var(--color-background-muted)]`

## Examples Repository

See these pages for reference implementations:
- `pages/Dashboard.js` - Dashboard with stats and widgets
- `pages/EntityLibrary.js` - List page with filters
- `pages/RoadmapManager.js` - Complex page with tabs
- `Layout.js` - Navigation and layout structure
- `pages/ComponentShowcase.js` - All component examples

## Testing

Test your implementation:
1. Check visual consistency across pages
2. Verify responsive behavior on mobile/desktop
3. Test hover and focus states
4. Validate color contrast ratios
5. Review in Component Showcase

---

**Remember**: When in doubt, check the Component Showcase or reference existing pages that already use Sturij tokens correctly.