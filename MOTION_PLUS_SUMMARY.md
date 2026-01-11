# Motion+ Integration Summary - TradeFlow

**For Base44 LLM Context**

---

## Installation Status ✅

**Package:** `motion-plus@2.0.2`  
**Source:** Private registry at `api.motion.dev`  
**License:** £289 lifetime premium (purchased by client)  
**Auth Token:** `b6799b56321768b32397bc30545e0a5eebe959b751bf24751fff6d98ef124a7c`  
**Installed:** January 11, 2026

```bash
# Install command (token configured)
npm install "https://api.motion.dev/registry.tgz?package=motion-plus&version=2.0.2&token=b6799b56321768b32397bc30545e0a5eebe959b751bf24751fff6d98ef124a7c"
```

---

## Package Contents

Motion+ v2.0.2 includes:

1. **Carousel** - Page-based carousel with drag/swipe/wheel
2. **Ticker** - Marquee/ticker foundation component (750+ lines)
3. **Cursor** - Custom cursor with magnetic effects
4. **Typewriter** - Realistic typing animations
5. **AnimateNumber** - Smooth number transitions
6. **AnimateText** - Character/word/line animations

**Dependencies:**
- `motion@12.23.24` - Core Framer Motion
- `motion-plus-dom@2.0.2` - DOM utilities (wheel, splitText)
- `motion-utils@12.23.6` - Shared utilities

---

## TradeFlow Implementation

### CarouselLoop Component

**Location:** `src/components/motion-plus/CarouselLoop.jsx`

**Features:**
- ✅ **Mouse drag & grab** - Smooth pointer dragging
- ✅ **Touch swipe** - Mobile gesture support
- ✅ **Wheel scroll** - Trackpad navigation
- ✅ **Spring animations** - Natural physics (stiffness: 300, damping: 30)
- ✅ **Page snapping** - Intelligent snap points
- ✅ **Infinite loop** - Reprojection rendering
- ✅ **Arrow controls** - Prev/Next buttons with disabled states
- ✅ **Dot pagination** - Visual page indicators
- ✅ **Accessibility** - ARIA labels, keyboard nav

**Usage:**

```jsx
import CarouselLoop from '@/components/motion-plus/CarouselLoop'

<CarouselLoop 
  items={projectCards}
  gap={16}
  loop={true}
  showControls={true}
  showDots={true}
  itemSize="auto"
  snap="page"
  renderItem={(item, index) => <ProjectCard {...item} />}
/>
```

**Props:**
- `items` - Array of React nodes
- `gap` - Gap between items (default: 16px)
- `loop` - Enable infinite scrolling (default: true)
- `showControls` - Show prev/next buttons (default: true)
- `showDots` - Show pagination dots (default: false)
- `itemSize` - "auto" | "fill" | "manual" (default: "auto")
- `axis` - "x" | "y" (default: "x")
- `snap` - "page" | "loose" | false (default: "page")
- `align` - "start" | "center" | "end" (default: "start")
- `transition` - Custom spring transition object
- `renderItem` - Custom render function

**Exports:**
- `CarouselLoop` (default) - Wrapper component with controls
- `useCarousel` - Hook for custom controls

---

## useCarousel Hook

Access carousel state and controls:

```jsx
import { useCarousel } from 'motion-plus/react'

function CustomControls() {
  const { 
    currentPage,      // Current page index (0-based)
    totalPages,       // Total number of pages
    nextPage,         // Function: Go to next page
    prevPage,         // Function: Go to previous page
    gotoPage,         // Function: (index) => void
    isNextActive,     // Boolean: Can go next?
    isPrevActive,     // Boolean: Can go prev?
    targetOffset      // MotionValue<number>: Scroll position
  } = useCarousel()
  
  return (
    <div>
      <button onClick={prevPage} disabled={!isPrevActive}>Prev</button>
      <span>{currentPage + 1} / {totalPages}</span>
      <button onClick={nextPage} disabled={!isNextActive}>Next</button>
    </div>
  )
}
```

**Must be called inside `<Carousel>` component tree.**

---

## Architecture Notes

### Carousel Built on Ticker

Motion+ Carousel **cannot work standalone** - it requires the Ticker component:

```
Ticker (Foundation - 750+ lines)
├── Drag: Pointer events, velocity tracking
├── Wheel: Mouse wheel & trackpad support
├── Offset: wrappedOffset, focusOffset, renderedOffset
├── Reprojection: Infinite scroll without cloning
├── Spring: pageTransition physics
└── MotionValues: x, y, projection

Carousel (Pagination Layer)
├── Uses Ticker internally
├── Adds: Page navigation logic
├── Adds: Snap points calculation
├── Adds: useCarousel hook
└── Props: snap, transition, axis
```

**Key Implementation:**

```tsx
// Carousel internally uses Ticker
<Ticker
  drag={axis}
  _dragX={axis === "x" ? targetOffset : false}
  _dragY={axis === "y" ? targetOffset : false}
  snap={snap}
  pageTransition={transition}
  offset={renderedOffset}
  {...props}
>
  <CarouselView>...</CarouselView>
</Ticker>
```

### Why Previous Attempts Failed

1. **Tried to recreate Carousel without Ticker** - Missing 750+ lines of drag/wheel/reprojection logic
2. **No drag handlers** - Ticker provides `_dragX`, `_dragY` props
3. **Jumpy navigation** - Missing spring physics from `pageTransition`
4. **No infinite scroll** - Missing reprojection rendering
5. **No wheel support** - Missing `wheel()` function from motion-plus-dom

**Solution:** Install full Motion+ v2.0.2 package from private registry.

---

## Demo Page

**Location:** `src/pages/MotionPlusDemo.jsx`

Shows 3 carousel variants:
1. Default carousel with project cards
2. Custom items with TradeFlow design system
3. Full-width carousel

**Test all features:**
- Mouse drag (grab & slide)
- Touch swipe (mobile)
- Wheel scroll (trackpad)
- Arrow button navigation
- Dot pagination
- Infinite loop
- Spring animations

---

## NPM Package History

### Deprecated Version (DO NOT USE)

- **Package:** `motion-plus@1.5.1` on public NPM
- **Status:** ⚠️ DEPRECATED
- **Issues:** Outdated, missing features, not maintained
- **Warning:** `npm WARN deprecated motion-plus@1.5.1`

### Private Registry (CURRENT)

- **Package:** `motion-plus@2.0.2` from `api.motion.dev`
- **Status:** ✅ PRODUCTION READY
- **Access:** Requires premium auth token
- **Updates:** Active development, latest features

**Always use private registry for TradeFlow projects.**

---

## Troubleshooting

### "Cannot find module 'motion-plus/react'"

**Solution:** Verify installation from private registry:

```bash
npm list motion-plus
# Should show: motion-plus@2.0.2
```

If showing `1.5.1` or `latest`:

```bash
npm uninstall motion-plus
npm install "https://api.motion.dev/registry.tgz?package=motion-plus&version=2.0.2&token=b6799b56321768b32397bc30545e0a5eebe959b751bf24751fff6d98ef124a7c"
```

### "useCarousel must be used within Carousel"

**Solution:** Call `useCarousel()` inside `<Carousel>` component tree:

```jsx
// ❌ Wrong
function MyPage() {
  const carousel = useCarousel() // Error!
  return <Carousel>...</Carousel>
}

// ✅ Correct
function MyControls() {
  const carousel = useCarousel() // Works
  return <button onClick={carousel.nextPage}>Next</button>
}

function MyPage() {
  return (
    <Carousel>
      <MyControls />
    </Carousel>
  )
}
```

### Carousel not draggable

**Check:**
1. Motion+ v2.0.2 installed (not deprecated 1.5.1)
2. Using `motion-plus/react` import (not `motion-plus`)
3. Ticker component included in build
4. No CSS `pointer-events: none` on carousel
5. Browser supports pointer events

---

## Reference Documentation

**Full API Reference:** `MOTION_PLUS_CAROUSEL_REFERENCE.md`

Contains:
- Complete prop documentation
- All hook APIs (useCarousel, useTicker, useTickerItem)
- Integration patterns
- TradeFlow design system examples
- Performance optimization tips
- Accessibility guidelines

---

## Future Components

Motion+ v2.0.2 includes additional components not yet integrated:

1. **Ticker** - Standalone marquee/ticker (foundation component)
2. **Cursor** - Custom cursor with magnetic effects
3. **Typewriter** - Realistic typing animations (speed, variance, backspace)
4. **AnimateNumber** - Smooth number transitions with formatting
5. **AnimateText** - Character/word/line animations

**All available** via `motion-plus/react` import with premium license.

---

## License & Credits

**Motion+ Premium License**
- Cost: £289 lifetime access
- Purchased: Client (TradeFlow project)
- Access: Private registry + GitHub repo
- Author: Matt Perry (motion.dev)
- MIT License (source code)

**TradeFlow Integration**
- Implemented: January 11, 2026
- Developer: Base44 Team
- Package: motion-plus@2.0.2
- Status: Production Ready

---

**Last Updated:** January 11, 2026  
**Package Version:** motion-plus@2.0.2  
**Documentation:** MOTION_PLUS_CAROUSEL_REFERENCE.md
