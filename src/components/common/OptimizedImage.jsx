import React, { useState } from 'react';
import { LazyImage } from './LazyImage';

// Convert image URL to WebP format
const toWebP = (src) => {
  if (!src || src.startsWith('data:') || src.includes('.svg')) return src;
  
  const ext = src.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png'].includes(ext)) {
    return src.replace(new RegExp(`\\.${ext}$`), '.webp');
  }
  
  return src;
};

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
  useWebP = true,
  ...props
}) {
  const [imgError, setImgError] = useState(false);
  
  // Determine final src (WebP or fallback)
  const finalSrc = useWebP && !imgError ? toWebP(src) : src;
  
  const handleError = () => {
    if (useWebP && !imgError) {
      setImgError(true);
    }
  };

  // For priority images (above fold), skip lazy loading
  if (priority) {
    return (
      <img
        src={finalSrc}
        alt={alt}
        width={width}
        height={height}
        loading="eager"
        fetchpriority="high"
        onError={handleError}
        {...props}
      />
    );
  }

  // For regular images, use lazy loading
  return (
    <LazyImage
      src={finalSrc}
      alt={alt}
      width={width}
      height={height}
      onError={handleError}
      {...props}
    />
  );
}