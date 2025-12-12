import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export function LazyImage({ 
  src, 
  alt, 
  className, 
  placeholderClassName,
  onLoad,
  ...props 
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  return (
    <div ref={imgRef} className={cn('relative overflow-hidden', className)}>
      {isLoading && (
        <div className={cn(
          'absolute inset-0 flex items-center justify-center bg-muted',
          placeholderClassName
        )}>
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          className={cn(
            'transition-opacity duration-300',
            isLoading ? 'opacity-0' : 'opacity-100',
            className
          )}
          loading="lazy"
          {...props}
        />
      )}
    </div>
  );
}