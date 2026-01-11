import { Carousel, useCarousel } from 'motion-plus/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';

// Carousel Item Component
function CarouselItem({ index, imageSrc, title, description }) {
  return (
    <div className="flex-shrink-0 w-full h-full flex items-center justify-center bg-card rounded-lg border border-border overflow-hidden">
      {imageSrc ? (
        <img 
          src={imageSrc} 
          alt={title || `Slide ${index + 1}`}
          className="w-full h-full object-cover"
        />
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

// Navigation Controls Component
function CarouselNav() {
  const { goToNext, goToPrevious } = useCarousel();

  return (
    <div className="absolute bottom-6 right-6 flex gap-2 z-10">
      <Button
        onClick={goToPrevious}
        variant="secondary"
        size="icon"
        className="rounded-full shadow-lg hover:shadow-xl transition-shadow"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <Button
        onClick={goToNext}
        variant="secondary"
        size="icon"
        className="rounded-full shadow-lg hover:shadow-xl transition-shadow"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}

// Dot Indicators Component
function CarouselDots() {
  const { itemCount, activeIndex, goToItem } = useCarousel();

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
      {Array.from({ length: itemCount }).map((_, index) => (
        <button
          key={index}
          onClick={() => goToItem(index)}
          className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
            index === activeIndex
              ? 'bg-primary w-8'
              : 'bg-white/50 hover:bg-white/75'
          }`}
          aria-label={`Go to slide ${index + 1}`}
          aria-current={index === activeIndex ? 'true' : 'false'}
        />
      ))}
    </div>
  );
}

// Main Carousel Loop Component
export default function CarouselLoop({ items = [], className = '' }) {
  // Default demo items if none provided
  const defaultItems = [
    {
      title: 'Welcome to TradeFlow',
      description: 'Manage your projects with ease and efficiency',
    },
    {
      title: 'Powerful Features',
      description: 'Everything you need to streamline your workflow',
    },
    {
      title: 'Beautiful Design',
      description: 'Built with your design system in mind',
    },
    {
      title: 'Infinite Scrolling',
      description: 'Smooth carousel with infinite loop capability',
    },
  ];

  const carouselItems = items.length > 0 ? items : defaultItems;

  return (
    <div className={`relative w-full ${className}`}>
      <Carousel
        items={carouselItems.map((item, index) => (
          <CarouselItem
            key={index}
            index={index}
            imageSrc={item.imageSrc}
            title={item.title}
            description={item.description}
          />
        ))}
        loop
        className="w-full h-full"
        style={{ height: '500px' }}
      >
        <CarouselNav />
        <CarouselDots />
      </Carousel>
    </div>
  );
}

// Named export for individual components if needed
export { CarouselItem, CarouselNav, CarouselDots };
