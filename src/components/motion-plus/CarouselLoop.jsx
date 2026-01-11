import React from 'react'
import { Carousel, useCarousel } from 'motion-plus/react'
import { motion } from 'motion/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Motion+ Carousel - PREMIUM COMPONENTS
 * Using Motion+ v2.0.2 (£289 lifetime license)
 * 
 * Features:
 * ✅ Mouse drag (grab & slide) - Built-in via Ticker component
 * ✅ Touch swipe support - Native touch events
 * ✅ Smooth spring animations - pageTransition prop
 * ✅ Infinite loop - Reprojection rendering
 * ✅ Wheel scroll - motion-plus-dom wheel() function
 * ✅ Page snapping - "page" | "loose" | false
 * ✅ Button controls - useCarousel hook
 * ✅ Dot pagination - currentPage/totalPages
 */

// ==================== CONTROLS ====================
function CarouselControls() {
  const { nextPage, prevPage, isNextActive, isPrevActive } = useCarousel()

  return (
    <>
      <Button
        onClick={prevPage}
        disabled={!isPrevActive}
        variant="ghost"
        size="icon"
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white disabled:opacity-30 transition-opacity"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        onClick={nextPage}
        disabled={!isNextActive}
        variant="ghost"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white disabled:opacity-30 transition-opacity"
        aria-label="Next slide"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </>
  )
}

// ==================== DOTS ====================
function CarouselDots() {
  const { currentPage, totalPages, gotoPage } = useCarousel()

  if (totalPages <= 1) return null

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 rounded-full px-3 py-2 z-10">
      {Array.from({ length: totalPages }, (_, index) => (
        <motion.button
          key={index}
          onClick={() => gotoPage(index)}
          className={`h-2 rounded-full transition-all ${
            index === currentPage 
              ? 'bg-white w-4' 
              : 'bg-white/50 hover:bg-white/75 w-2'
          }`}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          aria-label={`Go to page ${index + 1}`}
          aria-current={index === currentPage ? 'true' : 'false'}
        />
      ))}
    </div>
  )
}

// ==================== MAIN CAROUSEL ====================
export default function CarouselLoop({ 
  items = [],
  gap = 16,
  loop = true,
  className = '',
  showControls = true,
  showDots = false,
  renderItem,
  itemSize = '300px',
  axis = 'x',
  snap = 'page',
  align = 'start',
  transition,
}) {
  // Default spring transition (smooth & premium feel)
  const defaultTransition = {
    type: 'spring',
    stiffness: 300,
    damping: 30,
  }

  // Render items with stagger animation
  const carouselItems = items.map((item, index) => (
    <motion.div 
      key={index}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      style={{
        flexShrink: 0,
        width: itemSize !== 'auto' ? itemSize : undefined,
        minWidth: itemSize !== 'auto' ? itemSize : undefined,
      }}
    >
      {renderItem ? renderItem(item, index) : item}
    </motion.div>
  ))

  return (
    <div className={`relative ${className}`}>
      <Carousel
        items={carouselItems}
        axis={axis}
        gap={gap}
        loop={loop}
        snap={snap}
        align={align}
        itemSize={itemSize}
        transition={transition || defaultTransition}
        className="overflow-hidden"
      >
        {showControls && <CarouselControls />}
        {showDots && <CarouselDots />}
      </Carousel>
    </div>
  )
}

// Export Motion+ hook
export { useCarousel }