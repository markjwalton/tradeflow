# Visily Generation Prompts - Ready to Execute

## 🎯 Import Design Tokens First

1. **Upload visily-tokens.json to Visily**
2. **Or manually import these token groups:**

### Colors
- 6 complete palettes (50-900): primary, secondary, accent, midnight, charcoal, destructive
- Semantic colors: background, card, border, text-primary, text-secondary, text-muted

### Typography
- Families: degular-display (headings), mrs-eaves-xl-serif-narrow (body), source-code-pro (mono)
- Sizes: xs to 5xl (9 levels)
- Weights: 400, 500, 600, 700
- Line heights: tight (1.25) to loose (2)
- Letter spacing: tight (-0.025em) to airy (0.05em)

### Spacing
- 10 levels: 0.25rem to 4rem

### Border Radius
- 9 levels: none to full (9999px)
- Button default: md (0.375rem)

### Shadows
- 6 elevation levels: xs to 2xl

---

## 🧩 Component Generation Prompts

### 1. Button Component

**Purpose:** Primary interactive element with 5 variants and 4 sizes

**Visily Prompt:**
```
Generate a Button component using the imported design tokens.

Variants (5):
- primary: background primary-500, text white, hover primary-600
- secondary: background secondary-200, text secondary-900, hover secondary-300
- accent: background accent-300, text accent-900, hover accent-400
- ghost: transparent background, text primary-700, hover primary-50
- link: no background, text primary-500 underline, hover primary-600

Sizes (4):
- xs: fontSize sm, padding spacing-2 spacing-3, radius md
- sm: fontSize sm, padding spacing-2 spacing-4, radius md
- md: fontSize base, padding spacing-3 spacing-6, radius md
- lg: fontSize lg, padding spacing-4 spacing-8, radius md

States:
- default: base styles
- hover: darker/lighter shade
- pressed: even darker shade, scale 0.98
- disabled: opacity 50%, cursor not-allowed

Accessibility:
- Include aria-label support
- Focus ring using primary-500
- Keyboard navigation support

Layout:
- Icon slot (left or right)
- Text label slot
- Loading state with spinner
- Full-width option
```

**Component Type:** CONTAINER  
**App Type:** Website  
**Language:** en

---

### 2. Card Component

**Purpose:** Content container with header, body, and footer sections

**Visily Prompt:**
```
Generate a Card component using imported design tokens.

Structure:
- Container: background card (#ffffff), radius lg, shadow sm default
- Header section: padding spacing-6, border-bottom using border color
  - Title: fontFamily display, fontSize 2xl, fontWeight medium, color text-primary
  - Subtitle: fontSize sm, color text-muted
- Content section: padding spacing-6
  - Body text area
  - Optional image/thumbnail slot
- Footer section: padding spacing-6, border-top using border color
  - Actions area (typically buttons)

Variants:
- elevated: shadow md, hover shadow lg with transition 200ms
- flat: no shadow, border 1px solid border color
- interactive: cursor pointer, hover shadow md, transition 200ms

States:
- default: shadow sm
- hover (if interactive): shadow md, slight scale 1.01
- focused: ring 2px primary-500

Spacing:
- Gap between title/subtitle: spacing-2
- Gap between sections: spacing-4
- Internal padding: spacing-6

Accessibility:
- Semantic HTML structure
- Optional clickable card (role="button")
```

**Component Type:** CONTAINER  
**App Type:** Website  
**Language:** en

---

### 3. Input Component

**Purpose:** Form input field with label and validation states

**Visily Prompt:**
```
Generate an Input component using design tokens.

Structure:
- Label: fontFamily display, fontSize sm, fontWeight medium, color text-primary, margin-bottom spacing-2
- Input field:
  - Border: 1px solid border color
  - Background: card (#ffffff)
  - Padding: spacing-3 spacing-4
  - Radius: md
  - Font: fontFamily body, fontSize base
  - Color: text-primary
- Helper text: fontSize xs, color text-muted, margin-top spacing-1
- Error text: fontSize xs, color destructive-600, margin-top spacing-1

States:
- default: border color #d6d1c7
- hover: border primary-300
- focus: border primary-500, ring 2px primary-200
- error: border destructive-500, ring destructive-200
- disabled: background charcoal-100, opacity 60%, cursor not-allowed

Variants:
- sm: padding spacing-2 spacing-3, fontSize sm
- md: padding spacing-3 spacing-4, fontSize base (default)
- lg: padding spacing-4 spacing-6, fontSize lg

Features:
- Optional icon slot (left or right)
- Optional clear button
- Character counter (optional)
```

**Component Type:** CONTAINER  
**App Type:** Website  
**Language:** en

---

## 📱 Screen Generation Prompts

### Dashboard Sample Screen

**Purpose:** Comprehensive demo screen showcasing all design system components

**Visily Prompt:**
```
Generate a Dashboard sample screen demonstrating the complete design system.

Layout Structure:

1. Top Navbar (fixed, full-width):
   - Background: primary-700
   - Height: 64px
   - Left section: logo + app name (fontFamily display, fontSize xl, color white)
   - Center: search bar (Input component, width 400px)
   - Right: user avatar, notifications icon, settings icon
   - Padding: spacing-4 spacing-6

2. Left Sidebar (fixed, 240px wide):
   - Background: midnight-900
   - Navigation items:
     - fontFamily display, fontSize sm
     - color midnight-300, hover midnight-50
     - Active: background primary-600, color white
     - Icons from Lucide library
   - Sections: Dashboard, Projects, Team, Analytics, Settings
   - Padding: spacing-4

3. Main Content Area (margin-left 240px, margin-top 64px):
   - Background: background (#f5f3ef)
   - Padding: spacing-8

   Header Section:
   - Page title: fontFamily display, fontSize 4xl, color text-primary
   - Breadcrumbs: Home > Dashboard
   - Action button: Button component, variant primary
   - Margin-bottom: spacing-8

   Stats Cards Row (3 columns, gap spacing-6):
   Each card shows:
   - Title: fontSize sm, color text-muted
   - Value: fontSize 3xl, fontWeight bold, color primary-700
   - Change indicator: fontSize xs, color accent-600
   - Icon (top-right)

   Recent Activity Section:
   - Card component (variant elevated)
   - Header: "Recent Activity" + "View all" link
   - List of 5 items with avatars, text, timestamps
   - Dividers between items (separator component)

   Quick Actions Section:
   - Grid: 2x2 cards
   - Each card: icon, title, description, primary button

4. Toast Notification (bottom-right):
   - Background: card, shadow lg
   - Success variant: border-left 4px primary-500
   - Content: title + message
   - Close button

Design Token Usage:
- Colors: Use all 6 palettes where appropriate
- Typography: Mix display (headings) and body (content) fonts
- Spacing: Consistent spacing-4, spacing-6, spacing-8 throughout
- Shadows: sm on cards, md on hover, lg on modals
- Radius: md for buttons/inputs, lg for cards
- Transitions: 200ms on hover states

Responsive:
- Desktop: 1440px viewport
- Show full layout with sidebar
```

**App Type:** WebApp  
**Screen Width:** 1440  
**App Description:** Design system demonstration for TradeFlow - showcasing tokens, components, and layout patterns  
**Language:** en

---

## 📋 Execution Checklist

- [ ] Upload visily-tokens.json to Visily (or manually import token groups)
- [ ] Generate Button component
- [ ] Generate Card component  
- [ ] Generate Input component
- [ ] Generate Dashboard sample screen
- [ ] Verify color palettes render correctly
- [ ] Test component states (hover, focus, disabled)
- [ ] Export sample screen as PNG for review
- [ ] Share with Base44 AI for UI/UX feedback

---

## 🔤 Font Setup Notes

**Adobe Fonts Required:**
1. **degular-display** - Used for all headings, navigation, labels
2. **mrs-eaves-xl-serif-narrow** - Used for body text, descriptions

**Fallback Stack:**
- Display: system-ui, sans-serif
- Body: Georgia, 'Times New Roman', serif
- Mono: 'SF Mono', Monaco, monospace

**Important:** If Adobe fonts aren't available in Visily, the fallbacks will be used automatically. Export final designs with a note about font requirements.

---

## 💡 Next Steps After Import

1. **Create additional components** from src/components/ui/ (51 total available)
2. **Build real screens** for your actual app flows
3. **Export designs** as PNG/PDF to share with Base44 AI
4. **Iterate on UI/UX** with visual feedback instead of just code
5. **Generate component specs** from Visily back to development

The key advantage: You can now visually design screens and communicate intent clearly before implementation.
