import React, { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Optimized image component with lazy loading, blur placeholder, and error handling
 */
export function OptimizedImage({
  src,
  alt,
  className,
  aspectRatio = '16/9',
  priority = false,
  onLoad,
  onError,
  ...props
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = (e) => {
    setIsLoading(false);
    onLoad?.(e);
  };

  const handleError = (e) => {
    setIsLoading(false);
    setHasError(true);
    onError?.(e);
  };

  if (hasError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted text-muted-foreground',
          className
        )}
        style={{ aspectRatio }}
      >
        <span className="text-sm">Failed to load image</span>
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', className)} style={{ aspectRatio }}>
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        {...props}
      />
    </div>
  );
}

/**
 * Responsive image with srcset support
 */
export function ResponsiveImage({
  src,
  srcSet,
  sizes,
  alt,
  className,
  aspectRatio,
  ...props
}) {
  return (
    <OptimizedImage
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      className={className}
      aspectRatio={aspectRatio}
      {...props}
    />
  );
}