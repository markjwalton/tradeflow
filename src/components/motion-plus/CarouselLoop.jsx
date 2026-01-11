import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Carousel, useCarousel } from './Carousel';

/**
 * CarouselLoop - Infinite looping carousel component
 * Using Motion+ Carousel from private GitHub repo
 * Source: github.com/motiondivision/plus
 */

// Navigation controls component
function CarouselNav() {
  const { prevPage, nextPage, isNextActive, isPrevActive } = useCarousel();

  return (
    <div className="absolute inset-0 flex items-center justify-between p-4 pointer-events-none">
      <Button
        onClick={prevPage}
        disabled={!isPrevActive}
        variant="ghost"
        size="icon"
        className="pointer-events-auto bg-black/50 hover:bg-black/70 text-white"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        onClick={nextPage}
        disabled={!isNextActive}
        variant="ghost"
        size="icon"
        className="pointer-events-auto bg-black/50 hover:bg-black/70 text-white"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

// Dots indicator component
function CarouselDots() {
  const { currentPage, totalPages, gotoPage } = useCarousel();

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 rounded-full px-3 py-2">
      {Array.from({ length: totalPages }).map((_, index) => (
        <button
          key={index}
          onClick={() => gotoPage(index)}
          className={`w-2 h-2 rounded-full transition-colors ${
            index === currentPage ? 'bg-white' : 'bg-white/50'
          }`}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
    </div>
  );
}

export default function CarouselLoop({ 
  items = [],
  gap = 20,
  loop = true,
  className = '',
  showControls = true,
  showDots = true,
  renderItem,
}) {
  // Render items as JSX if renderItem is provided
  const renderedItems = renderItem 
    ? items.map((item, index) => renderItem(item, index))
    : items;

  return (
    <Carousel
      items={renderedItems}
      loop={loop}
      gap={gap}
      className={className}
      style={{ width: '100%', minHeight: '400px' }}
    >
      {showControls && <CarouselNav />}
      {showDots && <CarouselDots />}
    </Carousel>
  );
}

// Individual carousel item component (for manual item creation)
export function CarouselItem({ children, className = '' }) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

// Re-export for convenience
export { Carousel, useCarousel } from './Carousel';