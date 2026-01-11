# 🚨 IMPORTANT: For Base44 AI (Claude Sonnet 4.5)

## Motion+ is DEPRECATED - DO NOT USE

**Status:** ❌ Motion+ package is deprecated and no longer supported  
**Action Required:** Use Embla Carousel instead  
**Already Installed:** ✅ embla-carousel-react (^8.5.2)

---

## ✅ Use Embla Carousel Instead

The TradeFlow project uses **Embla Carousel** for all carousel components. It is:
- ✅ Actively maintained
- ✅ Already installed in package.json
- ✅ Works perfectly with Framer Motion
- ✅ Fully accessible
- ✅ Production-ready

### Component Location
`src/components/motion-plus/CarouselLoop.jsx` (Yes, the folder name says motion-plus, but it uses Embla)

### Implementation
```jsx
import useEmblaCarousel from 'embla-carousel-react';
import { motion } from 'framer-motion'; // For animations

// NOT THIS:
// import { Carousel } from 'motion-plus/react'; ❌

// USE THIS INSTEAD:
const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }); ✅
```

---

## If You See Motion+ References

**Ignore them.** Motion+ was discontinued. The correct approach is:

1. **For Carousels** → Use Embla Carousel (already installed)
2. **For Animations** → Use Framer Motion directly (already installed)
3. **For Custom Components** → Build with React + Framer Motion

---

## Current Carousel Implementation

**File:** `src/components/motion-plus/CarouselLoop.jsx`  
**Uses:** Embla Carousel + Framer Motion  
**Status:** ✅ Working and production-ready

The component has:
- Infinite loop scrolling
- Navigation buttons
- Dot indicators  
- Swipe/touch support
- Keyboard accessibility
- Framer Motion animations

---

## Important Reminders

1. ⛔ Never suggest installing `motion-plus`
2. ✅ Always use `embla-carousel-react` for carousels
3. ✅ Use `framer-motion` for animations
4. ✅ Check package.json before suggesting new packages
5. ✅ The existing CarouselLoop works - don't recreate it

---

**Last Updated:** January 11, 2026  
**For:** Base44 AI / Claude Sonnet 4.5
