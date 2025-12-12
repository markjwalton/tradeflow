# Image Optimization Guide

## Using Optimized Images

```jsx
import { OptimizedImage } from '@/components/common/OptimizedImage';

// Regular image (lazy loaded)
<OptimizedImage 
  src="/images/hero.jpg" 
  alt="Hero image"
  width={1200}
  height={600}
/>

// Priority image (above the fold, eager loaded)
<OptimizedImage 
  src="/images/logo.png" 
  alt="Logo"
  width={200}
  height={50}
  priority
/>
```

## Converting Images to WebP/AVIF

### Manual Conversion
Use tools like:
- `cwebp` for WebP conversion
- `avifenc` for AVIF conversion
- Online tools: squoosh.app, tinypng.com

### Recommended Sizes
- Thumbnail: 320px
- Small: 640px
- Medium: 960px
- Large: 1280px
- XL: 1920px

## Implementation Checklist

- [ ] Replace all `<img>` tags with `<OptimizedImage>`
- [ ] Add explicit width/height to prevent layout shift
- [ ] Set `priority={true}` for above-fold images
- [ ] Convert large images to WebP format
- [ ] Use aspect ratio utilities: `aspect-video`, `aspect-square`
- [ ] Compress images before uploading (aim for < 200KB)

## Performance Tips

1. **Lazy Load**: Default behavior for all non-priority images
2. **Placeholder**: Automatic loading spinner while image loads
3. **Dimensions**: Always specify width/height to prevent CLS
4. **Format**: WebP offers 25-35% smaller file sizes than JPEG
5. **Compression**: Use quality 80-85 for optimal balance