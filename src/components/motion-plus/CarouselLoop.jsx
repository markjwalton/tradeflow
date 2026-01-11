import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { Button } from '../ui/button';

// Carousel Item Component
function CarouselItem({ index, imageSrc, title, description, isFavorite, onFavoriteClick }) {
  return (
    <div className="flex-[0_0_100%] min-w-0 h-full flex items-center justify-center bg-card rounded-lg border border-border overflow-hidden relative group">
      {imageSrc ? (
        <>
          <img 
            src={imageSrc} 
            alt={title || `Slide ${index + 1}`}
            className="w-full h-full object-cover"
          />
          {onFavoriteClick && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFavoriteClick();
              }}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all opacity-0 group-hover:opacity-100"
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart 
                className="w-5 h-5" 
                fill={isFavorite ? 'currentColor' : 'none'}
                style={{ color: 'white' }}
              />
            </button>
          )}
          {(title || description) && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
              {title && (
                <h3 className="text-2xl font-display font-semibold text-white mb-2">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-sm text-white/90">
                  {description}
                </p>
              )}
            </div>
          )}
        </>
      ) : (
        <div 
          className="w-full h-full flex flex-col items-center justify-center p-8"
          style={{ 
            backgroundColor: `hsl(${index * 40}, 70%, ${50 + (index % 3) * 10}%)` 
          }}
        >
          <h3 className="text-4xl font-display font-semibold text-white mb-4">
            {title || `Slide ${index + 1}`}
          </h3>
          {description && (
            <p className="text-lg text-white/90 text-center max-w-md">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Main Carousel Loop Component
export default function CarouselLoop({
  items = [],
  className = '',
  height = '400px',
  showNav = true,
  showDots = true,
  loop = true,
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop, align: 'start' });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  // Default items if none provided
  const defaultItems = [
    { title: 'Slide 1', description: 'Beautiful carousel component', imageSrc: null },
    { title: 'Slide 2', description: 'Smooth animations', imageSrc: null },
    { title: 'Slide 3', description: 'Fully customizable', imageSrc: null },
  ];

  const carouselItems = items.length > 0 ? items : defaultItems;

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {carouselItems.map((item, index) => (
            <CarouselItem 
              key={index}
              index={index}
              imageSrc={item.imageSrc}
              title={item.title}
              description={item.description}
              isFavorite={item.isFavorite}
              onFavoriteClick={item.onFavoriteClick}
            />
          ))}
        </div>
      </div>
      
      {showNav && (
        <div className="absolute bottom-6 right-6 flex gap-2 z-10">
          <Button
            onClick={scrollPrev}
            variant="secondary"
            size="icon"
            disabled={!canScrollPrev}
            className="rounded-full shadow-lg hover:shadow-xl transition-shadow"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            onClick={scrollNext}
            variant="secondary"
            size="icon"
            disabled={!canScrollNext}
            className="rounded-full shadow-lg hover:shadow-xl transition-shadow"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      )}
      
      {showDots && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {carouselItems.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                index === selectedIndex
                  ? 'bg-primary w-8'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === selectedIndex ? 'true' : 'false'}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Named export for individual components if needed
export { CarouselItem };