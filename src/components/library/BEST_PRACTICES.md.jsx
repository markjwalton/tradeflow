# Sturij Design System - Best Practices

## Design Principles

### 1. Consistency First
Every page and component should feel like part of a cohesive whole. Use the same patterns, spacing, and color applications across the entire application.

### 2. Semantic Over Decorative
Choose tokens based on **meaning**, not appearance:
- Use `--color-midnight` for important text, not because it's dark
- Use `--color-destructive` for errors, not because it's red
- Use `--color-background-muted` for subtle borders, not because it's gray

### 3. Hierarchy Through Typography
Establish clear visual hierarchy using:
- Font size (text-2xl, text-lg, text-sm)
- Font weight (font-light, font-medium)
- Font family (font-heading for titles)
- Color (midnight for primary, charcoal for secondary)

## Layout Patterns

### Page Structure

Every page should follow this pattern:

```jsx
export default function PageName() {
  return (
    <div className="p-6 bg-[var(--color-background)] min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-heading text-[var(--color-midnight)] mb-2">
          Page Title
        </h1>
        <p className="text-[var(--color-charcoal)]">
          Brief description
        </p>
      </div>

      {/* Filters/Actions */}
      <div className="flex gap-4 mb-6">
        {/* Search, filters, actions */}
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Content cards, grids, etc. */}
      </div>
    </div>
  );
}
```

### Card Usage

Cards are the primary content container:

```jsx
// Standard card
<Card className="border-[var(--color-background-muted)] bg-[var(--color-background-paper)]">
  <CardHeader>
    <CardTitle className="text-[var(--color-midnight)]">Title</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>

// Interactive card (hover effect)
<Card className="border-[var(--color-background-muted)] hover:shadow-[var(--shadow-md)] transition-shadow cursor-pointer">
  {/* ... */}
</Card>

// Accent card (highlighted)
<Card className="border-[var(--color-primary)] bg-[var(--color-primary)]/5">
  {/* ... */}
</Card>
```

## Component Patterns

### Headers and Titles

```jsx
// Page header (h1)
<h1 className="text-2xl font-heading text-[var(--color-midnight)]">
  Page Title
</h1>

// Section header (h2)
<h2 className="text-lg font-heading text-[var(--color-midnight)] mb-4">
  Section Title
</h2>

// Subsection (h3)
<h3 className="text-base font-heading text-[var(--color-midnight)]">
  Subsection
</h3>

// With icon
<h1 className="text-2xl font-heading text-[var(--color-midnight)] flex items-center gap-2">
  <Icon className="h-6 w-6 text-[var(--color-primary)]" />
  Page Title
</h1>
```

### Buttons and Actions

```jsx
// Primary CTA
<Button className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white">
  <Plus className="h-4 w-4 mr-2" />
  Create New
</Button>

// Secondary action
<Button className="bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white">
  Export
</Button>

// Outline/neutral
<Button variant="outline" className="border-[var(--color-background-muted)]">
  Cancel
</Button>

// Destructive
<Button variant="ghost" className="text-[var(--color-destructive)] hover:bg-[var(--color-destructive)]/10">
  <Trash2 className="h-4 w-4 mr-2" />
  Delete
</Button>

// Icon-only
<Button variant="ghost" size="icon">
  <Edit className="h-4 w-4" />
</Button>
```

### Status Badges

```jsx
// Success/Active
<Badge className="bg-[var(--color-success)]/20 text-[var(--color-success-dark)]">
  <CheckCircle2 className="h-3 w-3 mr-1" />
  Active
</Badge>

// Warning
<Badge className="bg-[var(--color-warning)]/20 text-[var(--color-warning-dark)]">
  Pending
</Badge>

// Error
<Badge className="bg-[var(--color-destructive)]/20 text-[var(--color-destructive)]">
  Failed
</Badge>

// Info
<Badge className="bg-[var(--color-info)]/20 text-[var(--color-info-dark)]">
  Processing
</Badge>

// Neutral
<Badge variant="outline">
  Draft
</Badge>
```

### Forms

```jsx
// Form field
<div className="space-y-2">
  <label className="text-sm font-medium text-[var(--color-midnight)]">
    Field Label
  </label>
  <Input placeholder="Enter value..." />
  <p className="text-xs text-[var(--color-charcoal)]">
    Helper text
  </p>
</div>

// Form with validation error
<div className="space-y-2">
  <label className="text-sm font-medium text-[var(--color-midnight)]">
    Email *
  </label>
  <Input className="border-[var(--color-destructive)]" />
  <p className="text-xs text-[var(--color-destructive)]">
    Invalid email address
  </p>
</div>
```

### Lists and Tables

```jsx
// List items
<div className="space-y-2">
  {items.map(item => (
    <div 
      key={item.id}
      className="p-3 bg-[var(--color-background-paper)] border border-[var(--color-background-muted)] rounded-[var(--radius-lg)] hover:shadow-[var(--shadow-sm)] transition-shadow"
    >
      <h3 className="font-medium text-[var(--color-midnight)]">{item.name}</h3>
      <p className="text-sm text-[var(--color-charcoal)]">{item.description}</p>
    </div>
  ))}
</div>

// Table headers
<TableHead className="text-[var(--color-midnight)] font-medium">
  Column Name
</TableHead>

// Table cells
<TableCell className="text-[var(--color-charcoal)]">
  Cell content
</TableCell>
```

### Empty States

```jsx
<div className="text-center py-12 text-[var(--color-charcoal)]">
  <EmptyIcon className="h-12 w-12 mx-auto mb-4 opacity-50 text-[var(--color-charcoal)]" />
  <p className="font-medium text-[var(--color-midnight)]">No items found</p>
  <p className="text-sm mt-1">Get started by creating your first item</p>
  <Button className="mt-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white">
    <Plus className="h-4 w-4 mr-2" />
    Create Item
  </Button>
</div>
```

### Loading States

```jsx
// Full page loader
<div className="flex items-center justify-center min-h-screen bg-[var(--color-background)]">
  <Loader2 className="h-8 w-8 animate-spin text-[var(--color-charcoal)]" />
</div>

// Section loader
<div className="flex justify-center py-12">
  <Loader2 className="h-6 w-6 animate-spin text-[var(--color-charcoal)]" />
</div>

// Button loader
<Button disabled className="bg-[var(--color-primary)]">
  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
  Processing...
</Button>
```

## Spacing Guidelines

Use the 4px base grid:

```jsx
// Gaps
className="gap-4"        // 16px - standard element spacing
className="gap-2"        // 8px - tight spacing
className="gap-6"        // 24px - section spacing

// Padding
className="p-6"          // 24px - page padding
className="p-4"          // 16px - card padding
className="p-3"          // 12px - compact padding

// Margins
className="mb-6"         // 24px - section bottom margin
className="mb-4"         // 16px - element bottom margin
className="mb-2"         // 8px - tight bottom margin
```

## Icon Guidelines

Icons should match their context:

```jsx
// Icon colors
<Icon className="h-5 w-5 text-[var(--color-primary)]" />        // Primary emphasis
<Icon className="h-5 w-5 text-[var(--color-secondary)]" />      // Secondary emphasis
<Icon className="h-5 w-5 text-[var(--color-charcoal)]" />       // Neutral
<Icon className="h-5 w-5 text-[var(--color-destructive)]" />    // Destructive action

// Icon sizes
className="h-6 w-6"      // Page headers
className="h-5 w-5"      // Section headers, large buttons
className="h-4 w-4"      // Standard buttons, inline icons
className="h-3 w-3"      // Badges, small buttons
```

## Responsive Design

Sturij works with Tailwind's responsive prefixes:

```jsx
// Responsive grids
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Responsive visibility
<span className="hidden sm:inline">Full Text</span>
<span className="sm:hidden">Short</span>

// Responsive spacing
<div className="p-4 md:p-6 lg:p-8">
```

## Component Composition

Build complex UIs by composing simpler components:

```jsx
// Good - Composed from smaller pieces
<PageHeader icon={Users} title="User Management" />
<ContentSection title="Active Users">
  <div className="grid grid-cols-3 gap-4">
    <StatCard label="Total" value="1,234" />
    <StatCard label="Active" value="856" />
    <StatCard label="New Today" value="42" />
  </div>
</ContentSection>

// Avoid - Monolithic components with everything inline
```

## Performance Considerations

### CSS Variables Are Fast
Modern browsers optimize CSS variables. Using them doesn't impact performance.

### Prefer Utility Classes Over Custom CSS
Tailwind utilities are pre-generated and cached. They're faster than custom CSS.

### Use Semantic Tokens
Semantic tokens make refactoring easier. Change `--color-primary` once instead of updating hundreds of components.

## Testing Checklist

Before considering a page "Sturij-compliant":

- [ ] No inline `style={{}}` attributes
- [ ] No hardcoded Tailwind color classes (gray-*, blue-*, etc.)
- [ ] All headings use `font-heading` class
- [ ] All page backgrounds use `bg-[var(--color-background)]`
- [ ] All cards use `border-[var(--color-background-muted)]`
- [ ] All dialog titles use `text-[var(--color-midnight)]`
- [ ] All primary buttons use Sturij primary colors
- [ ] Destructive actions use `text-[var(--color-destructive)]`
- [ ] Visual consistency with other Sturij pages
- [ ] Responsive on mobile and desktop

## Common Mistakes

### ❌ Mistake 1: Mixing Hardcoded and Token Colors
```jsx
// Don't mix old and new
<div className="text-gray-500 bg-[var(--color-background)]">
```

### ❌ Mistake 2: Using Wrong Token for Context
```jsx
// Don't use blue for success
<Badge className="bg-blue-100 text-blue-700">Success</Badge>

// Use semantic success token
<Badge className="bg-[var(--color-success)]/20 text-[var(--color-success-dark)]">Success</Badge>
```

### ❌ Mistake 3: Forgetting Typography Classes
```jsx
// Don't rely on defaults for headings
<h1 className="text-2xl">Title</h1>

// Explicitly use font-heading
<h1 className="text-2xl font-heading text-[var(--color-midnight)]">Title</h1>
```

### ❌ Mistake 4: Inconsistent Spacing
```jsx
// Don't mix spacing units
<div className="gap-3 p-5 mb-7">

// Use standard 4px grid
<div className="gap-4 p-6 mb-6">
```

## Version History

- **v1.0.0** - Initial release
  - Complete color palette
  - Typography system
  - Spacing and effects
  - Component library
  - LLM guidelines

---

**Questions?** Check the Component Showcase at `/ComponentShowcase` or the package documentation at `/SturijPackage