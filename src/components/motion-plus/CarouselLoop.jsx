import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  gap = 16,
  loop = false,
  className = '',
  showControls = true,
  showDots = false,
  renderItem,
}) {
  const scrollContainerRef = React.useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.offsetWidth * 0.75;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative">
      {showControls && (
        <>
          <Button
            onClick={() => scroll('left')}
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => scroll('right')}
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}
      
      <div 
        ref={scrollContainerRef}
        className={`flex gap-${gap / 4} overflow-x-auto scrollbar-hide ${className}`}
        style={{ 
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {items.map((item, index) => (
          <div 
            key={index}
            className="flex-shrink-0 w-[280px]"
            style={{ scrollSnapAlign: 'start' }}
          >
            {renderItem ? renderItem(item, index) : item}
          </div>
        ))}
      </div>
    </div>
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