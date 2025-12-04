# Sturij Design System - Implementation Guide

## Overview

Sturij is a complete design system for Base44 applications featuring:
- Warm, professional color palette inspired by natural materials
- Elegant typography with custom display and serif fonts
- Comprehensive spacing and layout system
- Pre-built themed React components
- Full dark mode support (future)

## Quick Start

### 1. Copy Design Tokens to globals.css

The complete design token system is already in `globals.css`. It includes:
- CSS variables for all colors, typography, spacing, shadows, and effects
- Tailwind utility classes for common patterns
- Component-level styling utilities

**No additional configuration needed** - tokens are ready to use!

### 2. Import Sturij Components

```jsx
// Import individual components
import { PageHeader, ContentSection, StatCard } from "@/components/sturij";

// Or import all
import * as Sturij from "@/components/sturij";
```

### 3. Apply Tokens in Your Code

```jsx
// Page structure
<div className="p-6 bg-[var(--color-background)] min-h-screen">
  <h1 className="text-2xl font-heading text-[var(--color-midnight)]">
    Page Title
  </h1>
</div>

// Cards
<Card className="border-[var(--color-background-muted)]">
  <CardTitle className="text-[var(--color-midnight)]">Title</CardTitle>
</Card>

// Buttons
<Button className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white">
  Action
</Button>
```

## File Structure

```
your-base44-project/
├── globals.css                    # Design tokens (already configured)
├── Layout.js                      # Reference layout using Sturij
├── components/
│   ├── library/
│   │   ├── designTokens.js       # JS exports of tokens
│   │   ├── Typography.jsx        # Typography components
│   │   ├── Buttons.jsx           # Button patterns
│   │   ├── Forms.jsx             # Form components
│   │   ├── Layouts.jsx           # Layout patterns
│   │   └── index.js
│   └── sturij/
│       ├── PageHeader.jsx        # Page header component
│       ├── ContentSection.jsx    # Section container
│       ├── StatCard.jsx          # Stat display
│       ├── StatusBadge.jsx       # Status indicator
│       ├── FeatureCard.jsx       # Feature card
│       ├── DataRow.jsx           # List row
│       └── index.js
└── pages/
    ├── ComponentShowcase.js      # Interactive demo
    └── SturijPackage.js          # Documentation
```

## Design Token Categories

### Colors

**Primary Palette (Forest Green)**
- Used for: Primary actions, navigation, emphasis
- Variables: `--color-primary`, `--color-primary-light`, `--color-primary-dark`
- Shades: `--color-primary-50` through `--color-primary-900`

**Secondary Palette (Warm Copper)**
- Used for: Secondary actions, accents, highlights
- Variables: `--color-secondary`, `--color-secondary-light`, `--color-secondary-dark`

**Midnight Palette (Dark Blue-Grey)**
- Used for: Text, headings, high-contrast elements
- Variables: `--color-midnight`, `--color-midnight-light`, `--color-midnight-dark`

**Background Palette**
- Variables: `--color-background`, `--color-background-paper`, `--color-background-subtle`, `--color-background-muted`

**Semantic Colors**
- Success: `--color-success`
- Warning: `--color-warning`
- Error/Destructive: `--color-destructive`
- Info: `--color-info`

### Typography

**Fonts**
- Headings: Degular Display Light (use `font-heading` class)
- Body: Mrs Eaves XL Serif (applied automatically)
- Code: System monospace (use `font-mono` class)

**Usage**
```jsx
// Headings - use semantic tags + font-heading class
<h1 className="font-heading text-[var(--color-midnight)]">Title</h1>

// Body text uses default font automatically
<p className="text-[var(--color-charcoal)]">Body text</p>

// Display text
<span className="text-display">Large Display</span>
```

### Spacing

Based on 4px grid system:
- `var(--spacing-1)` = 4px
- `var(--spacing-2)` = 8px
- `var(--spacing-4)` = 16px
- `var(--spacing-6)` = 24px
- etc.

Utility classes:
- `gap-token-4` = gap: 1rem (16px)
- `p-token-6` = padding: 1.5rem (24px)

### Effects

**Shadows**: `--shadow-sm`, `--shadow-md`, `--shadow-lg`, etc.
**Border Radius**: `--radius-sm`, `--radius-md`, `--radius-lg`, etc.
**Transitions**: `--transition-normal` (200ms ease)

## Component Usage

### PageHeader
```jsx
import { PageHeader } from "@/components/sturij";

<PageHeader
  icon={Database}
  title="Page Title"
  description="Page description"
  actions={
    <Button>Add Item</Button>
  }
/>
```

### ContentSection
```jsx
import { ContentSection } from "@/components/sturij";

<ContentSection
  icon={Users}
  title="Section Title"
  description="Optional description"
  action={<Button size="sm">Manage</Button>}
>
  {/* Section content */}
</ContentSection>
```

### StatCard
```jsx
import { StatCard } from "@/components/sturij";

<StatCard
  icon={TrendingUp}
  label="Total Users"
  value="1,234"
  trend="+12%"
  trendDirection="up"
/>
```

## Best Practices

### DO ✅

1. **Use CSS variables for colors**
   ```jsx
   className="text-[var(--color-midnight)]"
   className="bg-[var(--color-primary)]"
   ```

2. **Use font-heading class for titles**
   ```jsx
   <h1 className="font-heading text-[var(--color-midnight)]">
   ```

3. **Use semantic token names**
   ```jsx
   className="bg-surface"        // Instead of bg-white
   className="text-midnight"     // Instead of text-gray-900
   className="border-subtle"     // Instead of border-gray-200
   ```

4. **Use utility classes**
   ```jsx
   className="gap-token-4"       // Instead of gap-4
   className="rounded-token-lg"  // Instead of rounded-lg
   ```

### DON'T ❌

1. **NO inline styles**
   ```jsx
   ❌ style={{ fontFamily: 'var(--font-heading)' }}
   ✅ className="font-heading"
   ```

2. **NO hardcoded Tailwind colors**
   ```jsx
   ❌ className="text-gray-500 bg-blue-100"
   ✅ className="text-[var(--color-charcoal)] bg-[var(--color-info)]/10"
   ```

3. **NO hardcoded hex values**
   ```jsx
   ❌ style={{ color: '#4A5D4E' }}
   ✅ className="text-[var(--color-primary)]"
   ```

## Migration Checklist

When converting existing pages to Sturij:

- [ ] Replace all `style={{}}` attributes with className
- [ ] Convert `text-gray-*` to `text-[var(--color-charcoal)]` or `text-muted`
- [ ] Convert `bg-white` to `bg-[var(--color-background-paper)]`
- [ ] Convert `border-gray-*` to `border-[var(--color-background-muted)]`
- [ ] Add `font-heading` class to all `<h1>-<h6>` elements
- [ ] Replace hardcoded colors in buttons with design tokens
- [ ] Update dialog titles to use `text-[var(--color-midnight)]`
- [ ] Test visual consistency across all pages

## Browser Support

Sturij uses modern CSS features:
- CSS Custom Properties (CSS Variables)
- CSS Grid and Flexbox
- Modern font loading

**Minimum browser versions:**
- Chrome/Edge: 88+
- Firefox: 85+
- Safari: 14+

## Troubleshooting

### Fonts not loading?
Check that font files are accessible. Fallback fonts (system-ui, Georgia) will be used if custom fonts fail.

### Colors look wrong?
Ensure `globals.css` is imported in your app entry point and the `:root {}` block is present.

### Dark mode not working?
Dark mode tokens are defined but not yet activated. Coming in v2.0.

## Resources

- **Component Showcase**: `/ComponentShowcase` - Interactive demo of all components
- **Design Tokens**: See `components/library/designTokens.js` for JS access
- **LLM Guidelines**: See documentation for AI-assisted development patterns

## Support

For issues or questions:
1. Check the Component Showcase for live examples
2. Review the LLM Guidelines for AI development
3. Inspect `globals.css` for complete token reference