import React from 'react';
import { Carousel, useCarousel } from './Carousel';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

function CarouselControls() {
  const { nextPage, prevPage, isNextActive, isPrevActive } = useCarousel();
  
  return (
    <>
      <Button
        onClick={prevPage}
        disabled={!isPrevActive}
        variant="ghost"
        size="icon"
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white disabled:opacity-50"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        onClick={nextPage}
        disabled={!isNextActive}
        variant="ghost"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white disabled:opacity-50"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </>
  );
}

export default function CarouselLoop({ 
  items = [],
  gap = 16,
  loop = true,
  className = '',
  showControls = true,
  showDots = false,
  renderItem,
}) {
  const carouselItems = items.map((item, index) => (
    <div key={index} className="flex-shrink-0 w-[280px]">
      {renderItem ? renderItem(item, index) : item}
    </div>
  ));

  return (
    <div className="relative">
      <Carousel
        items={carouselItems}
        gap={gap}
        loop={loop}
        snap="page"
        className={className}
      >
        {showControls && <CarouselControls />}
      </Carousel>
    </div>
  );
}