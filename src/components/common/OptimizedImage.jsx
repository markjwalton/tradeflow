import React from 'react';
import { LazyImage } from './LazyImage';

// Helper to generate srcset for responsive images
const generateSrcSet = (src, widths = [320, 640, 960, 1280, 1920]) => {
  if (!src || src.startsWith('data:')) return '';
  
  const ext = src.split('.').pop()?.toLowerCase();
  const baseSrc = src.replace(`.${ext}`, '');
  
  // If using a CDN or image service, generate multiple sizes
  // For now, just return the original
  return widths.map(w => `${src} ${w}w`).join(', ');
};

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  sizes = '100vw',
  priority = false,
  ...props
}) {
  // For priority images (above fold), skip lazy loading
  if (priority) {
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="eager"
        fetchpriority="high"
        {...props}
      />
    );
  }

  // For regular images, use lazy loading
  return (
    <LazyImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      {...props}
    />
  );
}