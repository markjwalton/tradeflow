# Performance Monitoring Guide

## Overview
This performance monitoring system tracks Core Web Vitals and provides real-time feedback on application performance.

## Core Web Vitals Tracked

### LCP (Largest Contentful Paint)
- **Good**: < 2.5s
- **Needs Improvement**: 2.5s - 4s
- **Poor**: > 4s
- Measures loading performance

### FID (First Input Delay)
- **Good**: < 100ms
- **Needs Improvement**: 100ms - 300ms
- **Poor**: > 300ms
- Measures interactivity

### CLS (Cumulative Layout Shift)
- **Good**: < 0.1
- **Needs Improvement**: 0.1 - 0.25
- **Poor**: > 0.25
- Measures visual stability

### FCP (First Contentful Paint)
- **Good**: < 1.8s
- **Needs Improvement**: 1.8s - 3s
- **Poor**: > 3s
- Measures perceived load speed

### TTFB (Time to First Byte)
- **Good**: < 800ms
- **Needs Improvement**: 800ms - 1800ms
- **Poor**: > 1800ms
- Measures server responsiveness

## Usage

### Basic Monitoring
```jsx
import { usePerformanceMonitoring } from '@/components/monitoring/usePerformanceMonitoring';

function MyComponent() {
  usePerformanceMonitoring((metric) => {
    console.log(`${metric.name}: ${metric.value} (${metric.rating})`);
  });
}
```

### Display Metrics
```jsx
import { PerformanceMetrics } from '@/components/monitoring/PerformanceMetrics';

function Dashboard() {
  return <PerformanceMetrics />;
}
```

### Performance Budget Alerts
```jsx
import { PerformanceBudget } from '@/components/monitoring/PerformanceBudget';

function App() {
  return (
    <>
      <PerformanceBudget />
      {/* Your app content */}
    </>
  );
}
```

### Custom Performance Marks
```jsx
import { usePerformanceMark, measurePerformance } from '@/components/monitoring/usePerformanceMonitoring';

function DataLoadingComponent() {
  usePerformanceMark('data-load-start');
  
  useEffect(() => {
    fetchData().then(() => {
      performance.mark('data-load-end');
      const duration = measurePerformance('data-load', 'data-load-start', 'data-load-end');
      console.log(`Data loaded in ${duration}ms`);
    });
  }, []);
}
```

## Best Practices

1. **Monitor in Production**: Performance metrics are most valuable in production environments
2. **Set Budgets**: Define performance budgets for your application
3. **Track Trends**: Monitor metrics over time to identify regressions
4. **Prioritize**: Focus on metrics that impact user experience most
5. **Test on Real Devices**: Test on various devices and network conditions

## Optimization Tips

### Improve LCP
- Use `OptimizedImage` component for all images
- Implement code splitting with `React.lazy()`
- Preload critical resources
- Use CDN for static assets

### Improve FID
- Defer non-critical JavaScript
- Break up long tasks
- Use web workers for heavy computations
- Minimize third-party scripts

### Improve CLS
- Always specify image dimensions
- Reserve space for ads/embeds
- Avoid inserting content above existing content
- Use CSS transforms instead of layout properties

### Improve FCP
- Minimize critical CSS
- Remove render-blocking resources
- Implement server-side rendering
- Use resource hints (preload, prefetch)

### Improve TTFB
- Use server-side caching
- Optimize database queries
- Use edge computing (CDN)
- Reduce API response times