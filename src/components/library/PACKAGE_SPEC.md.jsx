# Sturij Design System - Package Specification

## Package Information

**Name:** Sturij Design System  
**Version:** 1.0.0  
**Target Platform:** Base44  
**License:** Proprietary  
**Author:** Sturij Team  

## Overview

Sturij is a comprehensive design system providing visual consistency, accessibility, and developer experience improvements for Base44 applications. It features a warm, professional aesthetic inspired by natural materials and traditional craftsmanship.

## Features

### Core Features
- ✅ Complete CSS variable system with semantic naming
- ✅ Full color palette with 50-900 shades for each color
- ✅ Typography system with custom fonts (Degular Display, Mrs Eaves XL Serif)
- ✅ Spacing system based on 4px grid
- ✅ Shadow and border radius tokens
- ✅ Transition timing functions
- ✅ Pre-built React components
- ✅ Tailwind utility class extensions
- ✅ Interactive component showcase
- ✅ Comprehensive documentation
- ✅ LLM-optimized implementation guidelines

### Design Tokens

#### Color Palette (6 main palettes)
1. **Primary** (Forest Green #4A5D4E) - Actions, navigation, emphasis
2. **Secondary** (Warm Copper #D4A574) - Accents, highlights
3. **Accent** (Soft Blush #d9b4a7) - Subtle accents
4. **Midnight** (Dark Blue-Grey #1b2a35) - Text, headings
5. **Charcoal** (#3b3b3b) - Body text, secondary text
6. **Background** (#f5f3ef) - Page backgrounds

Each palette includes:
- Base color (DEFAULT)
- Light and dark variants
- 50-900 shade scale (10 shades)

#### Semantic Colors
- Success: #5a7a5e (forest green)
- Warning: #c4a35a (golden amber)
- Error/Destructive: #8b5b5b (muted red)
- Info: #5a7a8b (slate blue)

#### Typography
- **Heading Font**: Degular Display Light (sans-serif, light weight, airy tracking)
- **Body Font**: Mrs Eaves XL Serif (elegant serif for readability)
- **Mono Font**: System monospace for code

**Font Scale**: xs (12px) → 5xl (48px) with 9 sizes  
**Line Heights**: none (1.0) → loose (2.0) with 6 options  
**Letter Spacing**: tighter (-0.05em) → airy (0.02em) with 7 options

#### Spacing
- Base: 4px grid system
- Scale: 0, px, 1 (4px) → 32 (128px)
- 17 standardized spacing values

#### Effects
- **Shadows**: 7 elevation levels (xs → 2xl) + inner + semantic (primary, secondary, accent)
- **Border Radii**: 8 sizes (none → full/circular)
- **Transitions**: 4 timing functions (fast 150ms → slower 500ms)

### Component Library

#### Sturij Components (`components/sturij/`)
1. **PageHeader** - Consistent page headers with icon, title, description, actions
2. **ContentSection** - Section containers with titles and borders
3. **StatCard** - Statistic display cards with trends
4. **StatusBadge** - Semantic status indicators
5. **FeatureCard** - Feature/capability cards
6. **DataRow** - Consistent list row layout

#### Library Components (`components/library/`)
1. **Typography** - Text component patterns
2. **Buttons** - Button variants and patterns
3. **Forms** - Form field layouts
4. **Layouts** - Page and section layouts
5. **Navigation** - Navigation patterns
6. **DataDisplay** - Tables, lists, grids
7. **Feedback** - Alerts, toasts, modals

### Documentation Pages

1. **ComponentShowcase.js** - Interactive demo of all tokens and components
2. **SturijPackage.js** - Package documentation and guides
3. Layout.js reference implementation

### Documentation Files

1. **IMPLEMENTATION.md** - Step-by-step setup guide
2. **LLM_GUIDELINES.md** - AI-assisted development guide
3. **BEST_PRACTICES.md** - Development patterns and anti-patterns
4. **PACKAGE_SPEC.md** - This file - complete specification

## Technical Requirements

### Dependencies (Already in Base44)
- React 18+
- Tailwind CSS 3.0+
- shadcn/ui components
- Lucide React icons
- Base44 SDK

### Browser Support
- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

### Performance
- CSS bundle: ~25KB (minified)
- No JavaScript runtime overhead
- Leverages browser-native CSS variables
- Optimized Tailwind utilities

## Installation (Base44 Projects)

### Method 1: Already Installed ✅
If you're viewing this in a Base44 project, Sturij is already installed and configured. All files are in place.

### Method 2: Manual Installation
1. Copy `globals.css` (:root block) to your project's globals.css
2. Copy `components/sturij/*` to your components folder
3. Copy `components/library/*` to your components folder
4. Copy `pages/ComponentShowcase.js` for reference
5. Update Layout.js to inject CSS variables

## Usage

### Basic Usage

```jsx
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function MyPage() {
  return (
    <div className="p-6 bg-[var(--color-background)] min-h-screen">
      <h1 className="text-2xl font-heading text-[var(--color-midnight)] mb-6">
        My Page
      </h1>
      
      <Card className="border-[var(--color-background-muted)]">
        <CardHeader>
          <CardTitle className="text-[var(--color-midnight)]">Card Title</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[var(--color-charcoal)]">Content here</p>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Advanced Usage - Programmatic Access

```jsx
import { colors, typography, getColor } from "@/components/library/designTokens";

// Access colors programmatically
const primaryColor = colors.primary.DEFAULT;  // #4A5D4E
const primaryLight = colors.primary.light;    // #5d7361

// Helper functions
const color = getColor('primary.500');        // #4A5D4E
const font = typography.fonts.heading;        // "Degular Display Light"
```

## Customization

### Extending the Palette

To add custom colors while maintaining Sturij consistency:

```css
/* In globals.css */
:root {
  /* Your custom colors using Sturij naming convention */
  --color-brand: #YOUR_COLOR;
  --color-brand-light: #YOUR_LIGHT_COLOR;
  --color-brand-dark: #YOUR_DARK_COLOR;
}
```

### Custom Components

Build on Sturij foundations:

```jsx
export function CustomCard({ children }) {
  return (
    <div className="p-4 bg-[var(--color-background-paper)] border border-[var(--color-primary)] rounded-[var(--radius-lg)] shadow-[var(--shadow-md)]">
      {children}
    </div>
  );
}
```

## Validation

### Automated Checks
Run these checks to validate Sturij compliance:

1. **No inline styles**: Search for `style={{` - should return 0 results
2. **No hardcoded colors**: Search for `text-gray-`, `bg-blue-`, etc. in code
3. **Font classes present**: All `<h1>`-`<h6>` should have `font-heading`

### Manual Review
1. Visual consistency across all pages
2. Proper color contrast (WCAG AA minimum)
3. Responsive behavior on mobile/tablet/desktop
4. Hover states use appropriate tokens
5. Loading states are consistent

## Migration Guide

### From Hardcoded Colors → Sturij

**Step 1**: Identify patterns
```bash
# Search for hardcoded colors
grep -r "text-gray-" src/
grep -r "bg-blue-" src/
grep -r "style={{" src/
```

**Step 2**: Replace with tokens
- `text-gray-900` → `text-[var(--color-midnight)]`
- `text-gray-700` → `text-[var(--color-charcoal)]`
- `bg-white` → `bg-[var(--color-background-paper)]`
- `border-gray-200` → `border-[var(--color-background-muted)]`

**Step 3**: Update typography
- Add `font-heading` to all heading tags
- Remove inline font-family styles

**Step 4**: Test
- Check visual consistency
- Verify responsive behavior
- Test hover/focus states

## API Reference

### CSS Variables

Access any token using CSS variable syntax:

```jsx
className="text-[var(--color-primary)]"
className="bg-[var(--color-background)]"
style={{ color: 'var(--color-midnight)' }}  // Only if necessary
```

### Utility Classes

Pre-built utilities for common patterns:

```jsx
// Typography
className="font-heading"
className="font-body"
className="text-display"

// Colors
className="text-primary"
className="text-midnight"
className="bg-surface"
className="bg-subtle"
className="border-subtle"

// Spacing
className="gap-token-4"
className="p-token-6"

// Effects
className="shadow-card"
className="rounded-token-lg"
className="transition-token-normal"
```

## Changelog

### v1.0.0 (Current)
- Initial release
- Complete color palette with all variants
- Typography system with custom fonts
- Spacing, shadows, and border radius tokens
- 15+ pre-built React components
- Interactive showcase page
- Comprehensive documentation
- LLM implementation guidelines

### Roadmap
- v1.1.0: Dark mode support
- v1.2.0: Animation tokens
- v1.3.0: Additional component variants
- v2.0.0: Theme customization UI

## Support & Resources

### Documentation
- `/SturijPackage` - Package overview and guides
- `/ComponentShowcase` - Interactive component demo
- `IMPLEMENTATION.md` - Setup guide
- `LLM_GUIDELINES.md` - AI development guide
- `BEST_PRACTICES.md` - Development patterns

### Examples
All admin console pages use Sturij:
- Dashboard.js
- EntityLibrary.js
- PageLibrary.js
- FeatureLibrary.js
- RoadmapManager.js
- SecurityMonitor.js
- PerformanceMonitor.js

### Getting Help
1. Check Component Showcase for visual reference
2. Review LLM Guidelines for AI assistance
3. Examine reference implementations in existing pages
4. Consult BEST_PRACTICES.md for common patterns

## License

Proprietary - for use in Base44 applications only.

## Credits

**Design**: Sturij Design Team  
**Development**: Base44 Platform  
**Fonts**: Degular Display (commercial), Mrs Eaves XL (commercial)

---

**Package Version**: 1.0.0  
**Last Updated**: 2025-12-04  
**Compatible With**: Base44 Platform (all versions)