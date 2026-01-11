import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * CarouselLoop - Smooth scrolling carousel with navigation
 */

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