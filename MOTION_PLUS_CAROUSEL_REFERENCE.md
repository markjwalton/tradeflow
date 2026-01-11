# Motion+ Carousel Component - Complete Reference Guide

**STATUS: ✅ PRODUCTION READY - Motion+ v2.0.2 Installed**

Last Updated: January 11, 2026  
Package: `motion-plus@2.0.2` (Premium License - £289 lifetime)  
Auth Token: Configured in TradeFlow project

---

## Overview

The Motion+ Carousel component creates **performant, accessible, and fully-featured carousels** in React. It goes beyond traditional CSS-only approaches with support for infinite scrolling, advanced animations, and extensive customization options.

**Key Differentiators:**
- ✅ **Mouse drag & grab** - Native pointer events with smooth physics
- ✅ **Touch swipe** - Mobile-optimized gesture support
- ✅ **Wheel scroll** - Trackpad and mouse wheel navigation
- ✅ **Spring animations** - Smooth, natural transitions (not jumpy)
- ✅ **Infinite loop** - Reprojection rendering (minimal DOM cloning)
- ✅ **Built on Ticker** - 750+ lines of proven drag/wheel/offset logic
- ✅ **Page snapping** - Intelligent snap points ("page" | "loose" | false)

---

## Architecture

Motion+ Carousel is built **on top of the Ticker component**:

```
Ticker Component (Foundation)
├── Drag handling (_dragX, _dragY props)
├── Wheel scrolling (motion-plus-dom utilities)
├── Offset management (wrappedOffset, focusOffset)
├── Reprojection rendering (infinite scroll)
├── Velocity tracking (auto-scroll, hover effects)
└── Spring physics (pageTransition)

Carousel Component (Adds pagination)
├── Uses Ticker as base
├── Page navigation (nextPage, prevPage, gotoPage)
├── Snap points ("page" | "loose" | false)
└── useCarousel hook (currentPage, totalPages, controls)
```

**Cannot work standalone** - Requires complete Ticker implementation.

---

## Installation

### ✅ TradeFlow: Motion+ v2.0.2 Installed

**Current Status:** Premium package installed from private registry.

```bash
npm install "https://api.motion.dev/registry.tgz?package=motion-plus&version=2.0.2&token=b6799b56321768b32397bc30545e0a5eebe959b751bf24751fff6d98ef124a7c"
```

**License:** £289 lifetime premium access  
**Version:** 2.0.2 (latest production release)  
**Auth Token:** Configured in Base44 credentials ("the secret is installed in base444")  
**Private Repo:** github.com/motiondivision/plus (MIT licensed source code)

### Package Contents

```
motion-plus@2.0.2
├── Carousel - Page-based carousel with drag/swipe
├── Ticker - Foundation marquee/ticker component
├── Cursor - Custom cursor with magnetic effects
├── Typewriter - Realistic typing animations
├── AnimateNumber - Smooth number transitions
└── AnimateText - Character/word/line animations
```

**Dependencies:**
- `motion@12.23.24` - Core animation library
- `motion-plus-dom@2.0.2` - Wheel utilities, splitText
- `motion-utils@12.23.6` - Shared utilities

---

## Basic Usage

### Import (Production)

```jsx
import { Carousel, useCarousel } from 'motion-plus/react'
```

### TradeFlow Implementation

**Location:** `src/components/motion-plus/CarouselLoop.jsx`

```jsx
import CarouselLoop from '@/components/motion-plus/CarouselLoop'

// Simple usage
<CarouselLoop 
  items={[...]} 
  showControls={true}
  showDots={true}
/>
```

### Minimal Example (Direct Motion+)

The only **required prop** is `items` - an array of React nodes:

```jsx
import { Carousel } from 'motion-plus/react'

const items = [
  <span>One</span>,
  <span>Two</span>,
  <span>Three</span>
]

return <Carousel items={items} />
```

**Features enabled by default:**
- ✅ Mouse drag (horizontal)
- ✅ Touch swipe
- ✅ Page snapping
- ✅ Infinite loop
- ✅ Smooth spring animations

---

## Core Functionality

### Direction (Axis)

**Default:** Horizontal (`x`)

```jsx
// Horizontal carousel (default)
<Carousel items={items} />

// Vertical carousel
<Carousel items={items} axis="y" />
```

### Infinite Scrolling / Looping

**Default:** `true` (infinite loop enabled)

```jsx
// Infinite loop (default)
<Carousel items={items} />

// Disable infinite loop (hard stops at start/end)
<Carousel items={items} loop={false} />
```

**When `loop={false}`:**
- Items won't be cloned
- Pagination stops at carousel boundaries
- `isPrevActive` and `isNextActive` become `false` at limits

### Snapping Behavior

**Default:** `"page"` (snaps to pages)

```jsx
// Page snapping (default) - drag/wheel snap to nearest page
<Carousel items={items} snap="page" />

// Free scrolling - no snapping, natural momentum
<Carousel items={items} snap={false} />

// Loose snapping - snaps to nearest item at rest
<Carousel items={items} snap="loose" />
```

---

## Layout & Styling

### Item Sizing

**Default:** Items sized by content

```jsx
// Content-based sizing (default)
<Carousel items={items} />

// Fill container width/height
<Carousel items={items} itemSize="fill" />
```

When `itemSize="fill"`:
- Each item extends to match container dimensions
- Perfect for full-width/height slides

### Gap Between Items

**Default:** `10` (pixels)

```jsx
<Carousel items={items} gap={20} />  // 20px gap
<Carousel items={items} gap={0} />   // No gap
```

### Item Alignment (Off-Axis)

**Default:** `"center"`

```jsx
// Center alignment (default)
<Carousel items={items} align="center" />

// Align to start
<Carousel items={items} align="start" />

// Align to end
<Carousel items={items} align="end" />
```

**What this controls:**
- For `axis="x"`: Vertical alignment of items
- For `axis="y"`: Horizontal alignment of items

### Overflow Beyond Container

**Default:** `false`

```jsx
<Carousel items={items} overflow={true} />
```

**Use case:** Place carousel in document flow but extend items to viewport edges. Items visually extend beyond container boundaries.

### Fade Effect at Edges

**Default:** `0` (no fade)

```jsx
// Fade 100px at each edge
<Carousel items={items} fade={100} />

// Fade 20% at each edge
<Carousel items={items} fade="20%" />
```

**Behavior:** 
- Fades content out at start/end of container
- When `loop={false}`, fade automatically disappears at carousel limits

**Customize fade transition:**
```jsx
<Carousel
  items={items}
  fade={100}
  fadeTransition={{ duration: 2 }}
/>
```

---

## Transitions & Animations

### Page Transition

**Default:** `{ type: "spring", stiffness: 200, damping: 40 }`

```jsx
<Carousel 
  items={items}
  transition={{ type: "spring", stiffness: 300, damping: 25 }}
/>

// Tween transition
<Carousel 
  items={items}
  transition={{ type: "tween", duration: 0.5, ease: "easeInOut" }}
/>
```

This controls the animation when paginating via `nextPage()`, `prevPage()`, or `gotoPage()`.

---

## Custom Controls & State

### The `useCarousel` Hook

Any component rendered as children of `<Carousel>` can access carousel state and controls:

```jsx
import { useCarousel } from "motion-plus/react"

function CustomControls() {
  const { 
    nextPage,        // Function: Go to next page
    prevPage,        // Function: Go to previous page
    gotoPage,        // Function: Go to specific page index
    isNextActive,    // Boolean: Can go forward? (false at end if loop=false)
    isPrevActive,    // Boolean: Can go back? (false at start if loop=false)
    currentPage,     // Number: Current page index
    totalPages,      // Number: Total number of pages
    targetOffset     // MotionValue: Target scroll offset
  } = useCarousel()

  return (
    <div>
      <button disabled={!isPrevActive} onClick={prevPage}>
        Previous
      </button>
      <span>Page {currentPage + 1} of {totalPages}</span>
      <button disabled={!isNextActive} onClick={nextPage}>
        Next
      </button>
    </div>
  )
}

// Usage
<Carousel items={items}>
  <CustomControls />
</Carousel>
```

### Navigation Controls Example

```jsx
function CarouselNav() {
  const { prevPage, nextPage, isNextActive, isPrevActive } = useCarousel()
  
  return (
    <div className="absolute inset-0 flex justify-between items-center p-4">
      <button 
        disabled={!isPrevActive} 
        onClick={prevPage}
        style={{ opacity: isPrevActive ? 1 : 0.5 }}
      >
        ← Previous
      </button>
      <button 
        disabled={!isNextActive} 
        onClick={nextPage}
        style={{ opacity: isNextActive ? 1 : 0.5 }}
      >
        Next →
      </button>
    </div>
  )
}
```

### Pagination Dots Example

```jsx
function PaginationDots() {
  const { currentPage, totalPages, gotoPage } = useCarousel()

  return (
    <ul className="dots">
      {Array.from({ length: totalPages }, (_, index) => (
        <li key={index}>
          <motion.button
            initial={false}
            animate={{ opacity: currentPage === index ? 1 : 0.5 }}
            onClick={() => gotoPage(index)}
          />
        </li>
      ))}
    </ul>
  )
}
```

### Autoplay Implementation

```jsx
import { useEffect } from "react"
import { animate, useMotionValue } from "framer-motion"
import { useCarousel } from "motion-plus/react"

function AutoplayCarousel({ duration = 3000 }) {
  const { currentPage, nextPage } = useCarousel()
  const progress = useMotionValue(0)

  useEffect(() => {
    const animation = animate(progress, [0, 1], {
      duration: duration / 1000, // Convert ms to seconds
      ease: "linear",
      onComplete: nextPage,
    })

    return () => animation.stop()
  }, [duration, nextPage, progress, currentPage])

  return null // This is just a controller component
}

// Usage
<Carousel items={items}>
  <AutoplayCarousel duration={3000} />
  <PaginationDots />
</Carousel>
```

**Key:** Passing `currentPage` to `useEffect` dependency array restarts timer whenever page changes (whether from swipe, autoplay, or manual click).

---

## Advanced: Scroll-Based Item Animations

### The `useTickerItem` Hook

Carousel renders a `Ticker` under the hood, giving access to `useTickerItem` for per-item scroll animations:

```jsx
import { useTickerItem } from "motion-plus/react"
import { useTransform, motion } from "framer-motion"

function AnimatedItem({ emoji }) {
  const { offset, start, end, itemIndex } = useTickerItem()
  
  // Rotate item based on scroll position
  const rotate = useTransform(
    offset, 
    [0, 300],      // Input range
    [0, 360],      // Output range (degrees)
    { clamp: false }
  )

  return (
    <motion.div style={{ rotate }}>
      {emoji}
    </motion.div>
  )
}

// Usage
<Carousel items={[
  <AnimatedItem emoji="😂" />,
  <AnimatedItem emoji="🎉" />,
  <AnimatedItem emoji="🚀" />
]} />
```

### `useTickerItem` Return Values

| Property | Type | Description |
|----------|------|-------------|
| `offset` | `MotionValue<number>` | Item's scroll offset relative to container. At `0`, item is aligned to start. **Flipped in RTL layouts** |
| `start` | `number` | Start boundary of item layout within ticker. **Reversed in RTL** |
| `end` | `number` | End boundary of item layout within ticker. **Reversed in RTL** |
| `itemIndex` | `number` | Index of this item. For clones, represents original item's index |

**Example use cases:**
- Parallax effects based on scroll position
- Scale/rotate items as they enter/exit view
- Opacity transitions
- Complex entrance animations

---

## Complete Props Reference

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `items` | `Array<ReactNode>` | **Required.** Array of components, strings, or numbers to render |

### Layout Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `axis` | `"x" \| "y"` | `"x"` | Scroll direction (horizontal or vertical) |
| `gap` | `number` | `10` | Gap between items in pixels |
| `align` | `"start" \| "center" \| "end"` | `"center"` | Off-axis alignment of items |
| `overflow` | `boolean` | `false` | Allow items to extend beyond container bounds |
| `itemSize` | `"auto" \| "fill"` | `"auto"` | Item sizing: content-based or fill container |

### Behavior Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `loop` | `boolean` | `true` | Enable infinite scrolling (clones items as needed) |
| `snap` | `"page" \| "loose" \| false` | `"page"` | Snapping behavior: page snap, item snap, or free scroll |
| `page` | `number` | `undefined` | Initial page index to display on mount |

### Visual Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `fade` | `number \| string` | `0` | Fade effect at edges (pixels or %). Auto-disappears at limits when `loop={false}` |
| `fadeTransition` | `Transition` | `undefined` | Framer Motion transition for fade animation |

### Animation Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `transition` | `Transition` | `{ type: "spring", stiffness: 200, damping: 40 }` | Transition for pagination animations |

### Advanced Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `safeMargin` | `number` | `0` | Extra visible area for reprojection calculations. Increase if items disappear during rotation/transform |
| `as` | `keyof HTMLElements` | `"div"` | HTML element to render carousel container as |

### Motion Props

Carousel also accepts all standard `<motion.div>` props:
- `style`
- `className`
- `onMouseEnter`/`onMouseLeave`
- `whileHover`/`whileTap`
- `initial`/`animate`/`exit`
- etc.

---

## Technical Details

### Rendering Strategy

**Unique Reprojection Approach:**
- Traditional carousels clone items multiple times for infinite scroll (performance cost)
- Motion+ Carousel uses **reprojection**: items that scroll off-screen are repositioned to the opposite end
- **Result:** Minimal or zero DOM cloning, better performance

**Safe Margin Explained:**
- Reprojection is based on item/container layout calculations
- If you rotate the carousel or transform items in ways that bring them back into view, they may disappear during reprojection
- Increase `safeMargin` to expand the visible area calculation and prevent this

```jsx
// Rotating carousel container? Increase safe margin
<motion.div style={{ rotate: 15 }}>
  <Carousel items={items} safeMargin={100} />
</motion.div>
```

### Accessibility Features

**Automatic ARIA:**
```html
<div role="region" aria-roledescription="carousel">
  <!-- items -->
</div>
```

**Respects User Preferences:**
- `prefers-reduced-motion`: Disables/reduces animations
- RTL layouts: Automatically flips direction and offset calculations

**Input Methods:**
- **Mouse:** Click and drag
- **Touch:** Swipe gestures
- **Wheel:** Scroll with mouse wheel or trackpad
- **Keyboard:** Arrow keys for navigation (when focused)

### RTL Support

All layout calculations automatically flip for right-to-left languages:
- `offset` values are inverted
- `start`/`end` boundaries are reversed
- Visual direction matches reading direction

---

## Common Patterns

### Full-Width Slides with Navigation

```jsx
<Carousel 
  items={slides}
  itemSize="fill"
  gap={0}
  className="h-[500px]"
>
  <CarouselNav />
  <PaginationDots />
</Carousel>
```

### Card Carousel with Gaps

```jsx
<Carousel 
  items={cards}
  gap={20}
  align="start"
  loop={true}
  snap="page"
>
  <PaginationDots />
</Carousel>
```

### Vertical Carousel (Testimonials)

```jsx
<Carousel 
  items={testimonials}
  axis="y"
  itemSize="fill"
  className="h-[400px]"
  loop={true}
>
  <AutoplayCarousel duration={5000} />
</Carousel>
```

### Free-Scrolling Gallery

```jsx
<Carousel 
  items={images}
  snap={false}
  loop={false}
  gap={16}
  overflow={true}
/>
```

### Carousel with Scroll-Based Animations

```jsx
function ScaleItem({ children }) {
  const { offset } = useTickerItem()
  const scale = useTransform(offset, [-200, 0, 200], [0.8, 1, 0.8])
  const opacity = useTransform(offset, [-300, 0, 300], [0.3, 1, 0.3])
  
  return (
    <motion.div style={{ scale, opacity }}>
      {children}
    </motion.div>
  )
}

<Carousel items={slides.map(slide => <ScaleItem>{slide}</ScaleItem>)} />
```

---

## Critical Implementation Notes

### 1. Children Render Context

Custom controls **must be children** of `<Carousel>` to access `useCarousel`:

```jsx
// ✅ Correct
<Carousel items={items}>
  <CustomControls />
</Carousel>

// ❌ Wrong - useCarousel will fail
<div>
  <Carousel items={items} />
  <CustomControls />
</div>
```

### 2. Page Index is Zero-Based

- `currentPage` starts at `0`
- `totalPages` is the count (e.g., 5 pages)
- Valid `gotoPage()` range: `0` to `totalPages - 1`

### 3. Loop vs. No-Loop Behavior

| Feature | `loop={true}` | `loop={false}` |
|---------|---------------|----------------|
| Scrolling | Infinite | Stops at boundaries |
| Items | Cloned as needed | No cloning |
| `isNextActive` | Always `true` | `false` at last page |
| `isPrevActive` | Always `true` | `false` at first page |
| Fade | Always visible | Disappears at limits |

### 4. Transitions Apply to Pagination Only

The `transition` prop controls **programmatic pagination** (`nextPage`, `prevPage`, `gotoPage`).

**Drag/wheel scrolling** uses natural physics/momentum (not the transition prop).

### 5. Performance Considerations

- **Best:** 10-50 items
- **Good:** 50-100 items
- **Be cautious:** 100+ items (consider virtualization)

Reprojection minimizes DOM nodes, but extremely large item counts may still impact performance.

---

## TradeFlow-Specific Implementation

### File Locations

- **Core Component:** `src/components/motion-plus/Carousel.jsx`
- **Wrapper Component:** `src/components/motion-plus/CarouselLoop.jsx`
- **Demo Page:** `src/pages/MotionPlusDemo.jsx`
- **Documentation:** `MOTION_PLUS_CAROUSEL_REFERENCE.md`

### Source

Components copied from Motion+ private repository:
- Repo: `github.com/motiondivision/plus`
- Path: `/packages/motion-plus/src/components/Carousel/`
- License: MIT (can be freely used in TradeFlow)

### Integration with TradeFlow Design System

```jsx
import { Carousel, useCarousel } from '@/components/motion-plus/Carousel'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

function TradeFlowCarousel({ items }) {
  return (
    <Carousel 
      items={items}
      gap={20}
      className="w-full rounded-lg"
    >
      <CarouselNav />
      <CarouselDots />
    </Carousel>
  )
}

function CarouselNav() {
  const { prevPage, nextPage, isPrevActive, isNextActive } = useCarousel()
  
  return (
    <div className="absolute inset-0 flex items-center justify-between p-4 pointer-events-none">
      <Button
        onClick={prevPage}
        disabled={!isPrevActive}
        variant="ghost"
        size="icon"
        className="pointer-events-auto bg-black/50 hover:bg-black/70"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        onClick={nextPage}
        disabled={!isNextActive}
        variant="ghost"
        size="icon"
        className="pointer-events-auto bg-black/50 hover:bg-black/70"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

function CarouselDots() {
  const { currentPage, totalPages, gotoPage } = useCarousel()
  
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 rounded-full px-3 py-2">
      {Array.from({ length: totalPages }, (_, index) => (
        <button
          key={index}
          onClick={() => gotoPage(index)}
          className={`w-2 h-2 rounded-full transition-colors ${
            index === currentPage ? 'bg-white' : 'bg-white/50'
          }`}
        />
      ))}
    </div>
  )
}
```

---

## Troubleshooting

### Items disappearing during rotation

**Problem:** Rotating carousel or items causes them to disappear during scroll.

**Solution:** Increase `safeMargin` to expand visible area calculation:
```jsx
<Carousel items={items} safeMargin={100} />
```

### Controls not working (useCarousel undefined)

**Problem:** `useCarousel()` returns undefined or throws error.

**Solution:** Ensure controls are **children** of `<Carousel>`:
```jsx
<Carousel items={items}>
  <MyControls /> {/* ✅ Will work */}
</Carousel>
```

### Carousel not looping at end

**Problem:** Carousel stops at the last item instead of looping.

**Solution:** Ensure `loop={true}` (or omit, as it's the default):
```jsx
<Carousel items={items} loop={true} />
```

### Page snapping too aggressive

**Problem:** Drag immediately snaps to pages, want free scrolling.

**Solution:** Disable snapping:
```jsx
<Carousel items={items} snap={false} />
```

### Autoplay not restarting after manual navigation

**Problem:** Autoplay timer doesn't reset when user manually changes pages.

**Solution:** Add `currentPage` to `useEffect` dependencies:
```jsx
useEffect(() => {
  const animation = animate(progress, [0, 1], {
    duration,
    onComplete: nextPage,
  })
  return () => animation.stop()
}, [currentPage]) // ← Add currentPage here
```

---

## Summary

The Motion+ Carousel is a **production-ready, accessible, performant** carousel solution that combines:
- ✅ Framer Motion's animation capabilities
- ✅ Unique reprojection rendering (minimal DOM cloning)
- ✅ Full customization via hooks and children
- ✅ Accessibility features out of the box
- ✅ Flexible layout and styling options
- ✅ True infinite scrolling without performance penalties

**Best for:** Hero sliders, product galleries, testimonials, image carousels, content showcases, multi-section navigators.

**TradeFlow has full access** to Motion+ premium components via private repository credentials.
