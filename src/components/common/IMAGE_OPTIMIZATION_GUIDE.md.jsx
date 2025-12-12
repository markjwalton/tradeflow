# Image Optimization Guide

## Overview
This guide provides strategies for optimizing images to improve performance, reduce bandwidth, and enhance user experience.

---

## Current Implementation

### ✅ Already Available
- **LazyImage Component** - Lazy loading with intersection observer
- **OptimizedImage Component** - Responsive images with srcset
- **ImageLoader Component** - Loading states and error handling

### 🎯 Optimization Strategies

---

## 1. Lazy Loading Images

### Basic Usage
```jsx
import { LazyImage } from '@/components/common/LazyImage';

function Gallery() {
  return (
    <LazyImage
      src="https://example.com/large-image.jpg"
      alt="Product photo"
      className="w-full h-64 object-cover"
    />
  );
}
```

### With Placeholder
```jsx
<LazyImage
  src="https://example.com/image.jpg"
  placeholder="https://example.com/image-thumb.jpg"
  alt="Hero image"
  className="w-full h-96"
/>
```

### Eager Loading for Above-Fold
```jsx
{/* First 3 images load immediately */}
{images.slice(0, 3).map((img, i) => (
  <img src={img.url} alt={img.alt} loading="eager" key={i} />
))}

{/* Rest load lazily */}
{images.slice(3).map((img, i) => (
  <LazyImage src={img.url} alt={img.alt} key={i} />
))}
```

---

## 2. Responsive Images

### Using srcset
```jsx
import { OptimizedImage } from '@/components/common/OptimizedImage';

function ResponsiveHero() {
  return (
    <OptimizedImage
      src="https://example.com/hero.jpg"
      srcSet={{
        mobile: "https://example.com/hero-mobile.jpg 640w",
        tablet: "https://example.com/hero-tablet.jpg 1024w",
        desktop: "https://example.com/hero-desktop.jpg 1920w"
      }}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      alt="Hero banner"
    />
  );
}
```

### Picture Element for Art Direction
```jsx
function ArtDirectedImage() {
  return (
    <picture>
      {/* Mobile: Square crop */}
      <source 
        media="(max-width: 640px)" 
        srcSet="https://example.com/image-square.jpg" 
      />
      {/* Tablet: 16:9 */}
      <source 
        media="(max-width: 1024px)" 
        srcSet="https://example.com/image-16-9.jpg" 
      />
      {/* Desktop: Wide */}
      <img 
        src="https://example.com/image-wide.jpg" 
        alt="Responsive artwork" 
      />
    </picture>
  );
}
```

---

## 3. Modern Image Formats

### WebP with Fallback
```jsx
function ModernImage({ src, alt }) {
  const webpSrc = src.replace(/\.(jpg|png)$/, '.webp');
  
  return (
    <picture>
      <source type="image/webp" srcSet={webpSrc} />
      <source type="image/jpeg" srcSet={src} />
      <img src={src} alt={alt} loading="lazy" />
    </picture>
  );
}
```

### AVIF Support (Best Compression)
```jsx
<picture>
  <source type="image/avif" srcSet="image.avif" />
  <source type="image/webp" srcSet="image.webp" />
  <img src="image.jpg" alt="Optimized image" />
</picture>
```

---

## 4. Image CDN Integration

### Unsplash Optimization
```jsx
function UnsplashImage({ id, width = 800, quality = 80 }) {
  const src = `https://images.unsplash.com/${id}?w=${width}&q=${quality}&auto=format`;
  
  return <LazyImage src={src} alt="Unsplash photo" />;
}
```

### Cloudinary Example
```jsx
function CloudinaryImage({ publicId, transformations }) {
  const baseUrl = 'https://res.cloudinary.com/your-cloud/image/upload';
  const src = `${baseUrl}/${transformations}/${publicId}`;
  
  return <LazyImage src={src} alt="Cloud image" />;
}

// Usage
<CloudinaryImage 
  publicId="sample"
  transformations="w_800,q_auto,f_auto"
/>
```

---

## 5. Background Images

### Lazy Background with Intersection Observer
```jsx
function LazyBackgroundSection() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );
    
    if (ref.current) observer.observe(ref.current);
    
    return () => observer.disconnect();
  }, []);
  
  return (
    <div
      ref={ref}
      className="h-96"
      style={{
        backgroundImage: isVisible 
          ? 'url(https://example.com/bg.jpg)' 
          : 'none',
        backgroundColor: '#f0f0f0'
      }}
    />
  );
}
```

### CSS-based Lazy Loading
```css
.hero-bg {
  background-color: #f0f0f0;
  background-image: url('placeholder.jpg');
}

.hero-bg.loaded {
  background-image: url('full-image.jpg');
}
```

---

## 6. Image Compression

### Recommended Tools
- **Squoosh** - https://squoosh.app/ (browser-based)
- **ImageOptim** - https://imageoptim.com/ (Mac)
- **TinyPNG** - https://tinypng.com/ (API available)

### Compression Guidelines
| Image Type | Format | Quality | Max Size |
|------------|--------|---------|----------|
| Hero images | WebP/AVIF | 80-85% | 150KB |
| Thumbnails | WebP/JPEG | 75-80% | 30KB |
| Icons/Logos | SVG/PNG | N/A | 10KB |
| Photos | WebP/JPEG | 80% | 200KB |
| UI elements | SVG preferred | N/A | 5KB |

### Automated Compression
```js
// vite.config.js - Add image optimization plugin
import { defineConfig } from 'vite';
import imagemin from 'vite-plugin-imagemin';

export default defineConfig({
  plugins: [
    imagemin({
      gifsicle: { optimizationLevel: 3 },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 80 },
      svgo: { plugins: [{ removeViewBox: false }] },
      webp: { quality: 80 }
    })
  ]
});
```

---

## 7. Performance Patterns

### Progressive Image Loading (Blur-up)
```jsx
function ProgressiveImage({ src, placeholder }) {
  const [loaded, setLoaded] = useState(false);
  
  return (
    <div className="relative">
      {/* Blurred placeholder */}
      <img
        src={placeholder}
        alt=""
        className={cn(
          "absolute inset-0 w-full h-full object-cover transition-opacity",
          loaded ? "opacity-0" : "opacity-100 blur-md"
        )}
      />
      
      {/* Full image */}
      <img
        src={src}
        alt="Content"
        className={cn(
          "w-full h-full object-cover transition-opacity",
          loaded ? "opacity-100" : "opacity-0"
        )}
        onLoad={() => setLoaded(true)}
        loading="lazy"
      />
    </div>
  );
}
```

### Skeleton Placeholders
```jsx
function ImageWithSkeleton({ src, alt }) {
  const [loaded, setLoaded] = useState(false);
  
  return (
    <div className="relative">
      {!loaded && <Skeleton className="absolute inset-0" />}
      <LazyImage 
        src={src} 
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={loaded ? "opacity-100" : "opacity-0"}
      />
    </div>
  );
}
```

### Dominant Color Placeholder
```jsx
function ColorPlaceholderImage({ src, dominantColor }) {
  return (
    <div 
      className="relative"
      style={{ backgroundColor: dominantColor }}
    >
      <LazyImage src={src} alt="Content" />
    </div>
  );
}

// Usage
<ColorPlaceholderImage 
  src="photo.jpg"
  dominantColor="#8B7355"
/>
```

---

## 8. Aspect Ratio Control

### Using aspect-ratio CSS
```jsx
function AspectImage({ src, ratio = "16/9" }) {
  return (
    <div style={{ aspectRatio: ratio }}>
      <img 
        src={src} 
        alt="Content"
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  );
}
```

### Padding Hack (Legacy Support)
```jsx
function PaddingAspect({ src, ratio = 56.25 }) {
  return (
    <div className="relative" style={{ paddingTop: `${ratio}%` }}>
      <img 
        src={src}
        alt="Content"
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  );
}
```

---

## 9. Image Loading States

### Complete Loading UI
```jsx
import { ImageLoader } from '@/components/common/ImageLoader';

function Gallery() {
  return (
    <ImageLoader
      src="https://example.com/image.jpg"
      alt="Gallery image"
      loadingComponent={<Skeleton className="w-full h-64" />}
      errorComponent={
        <div className="flex items-center justify-center h-64 bg-muted">
          <AlertCircle className="text-muted-foreground" />
        </div>
      }
    />
  );
}
```

---

## 10. Best Practices Checklist

### Development
- [ ] Use lazy loading for images below the fold
- [ ] Implement responsive images with srcset
- [ ] Add proper width/height attributes (prevents layout shift)
- [ ] Use modern formats (WebP/AVIF) with fallbacks
- [ ] Compress images before deployment
- [ ] Set appropriate alt text for accessibility
- [ ] Use aspect ratios to prevent layout shift

### Production
- [ ] Serve images from CDN
- [ ] Enable HTTP/2 for multiplexing
- [ ] Configure cache headers (1 year for static images)
- [ ] Monitor image performance (LCP, CLS)
- [ ] Audit bundle size regularly
- [ ] Test on slow connections (3G)

---

## 11. Performance Metrics

### Key Indicators
```jsx
// Measure image load time
function measureImageLoad(src) {
  const start = performance.now();
  const img = new Image();
  
  img.onload = () => {
    const duration = performance.now() - start;
    console.log(`Image loaded in ${duration}ms`);
  };
  
  img.src = src;
}
```

### Largest Contentful Paint (LCP)
```jsx
// Optimize LCP image
<img
  src="hero.jpg"
  alt="Hero"
  loading="eager"
  fetchpriority="high"
  width="1920"
  height="1080"
/>
```

### Cumulative Layout Shift (CLS)
```jsx
// Prevent CLS with explicit dimensions
<img
  src="image.jpg"
  alt="Content"
  width="800"
  height="600"
  className="w-full h-auto"
/>
```

---

## 12. Troubleshooting

### Issue: Images Load Slowly
**Solutions:**
1. Compress images further
2. Use image CDN with global distribution
3. Enable HTTP/2
4. Preload critical images

### Issue: Layout Shift
**Solutions:**
1. Add explicit width/height
2. Use aspect-ratio CSS
3. Reserve space with padding
4. Use skeleton loaders

### Issue: High Bandwidth Usage
**Solutions:**
1. Implement responsive images
2. Use modern formats (WebP/AVIF)
3. Reduce quality for non-critical images
4. Lazy load aggressively

---

## Resources

- [Web.dev - Image Optimization](https://web.dev/fast/#optimize-your-images)
- [MDN - Responsive Images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)
- [Squoosh Image Compressor](https://squoosh.app/)
- [Can I Use - WebP](https://caniuse.com/webp)
- [Can I Use - AVIF](https://caniuse.com/avif)