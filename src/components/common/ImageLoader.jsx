import React from 'react';
import { OptimizedImage } from './OptimizedImage';
import { cn } from '@/lib/utils';

/**
 * Smart image loader with automatic WebP conversion and lazy loading
 * Use this component for user-generated or dynamic images
 */
export function ImageLoader({
  src,
  alt,
  className,
  containerClassName,
  aspectRatio = 'auto',
  priority = false,
  fallback = null,
  ...props
}) {
  if (!src) {
    return fallback || (
      <div className={cn('bg-muted rounded-lg', containerClassName)} />
    );
  }

  const aspectClasses = {
    'square': 'aspect-square',
    '16/9': 'aspect-video',
    '4/3': 'aspect-[4/3]',
    '3/2': 'aspect-[3/2]',
    'auto': '',
  };

  return (
    <div className={cn('overflow-hidden', aspectClasses[aspectRatio] || '', containerClassName)}>
      <OptimizedImage
        src={src}
        alt={alt}
        className={cn('w-full h-full object-cover', className)}
        priority={priority}
        {...props}
      />
    </div>
  );
}