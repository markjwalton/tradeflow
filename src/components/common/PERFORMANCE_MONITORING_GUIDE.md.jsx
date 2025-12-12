# Performance Monitoring Guide

## Web Vitals Integration

The app already includes Web Vitals monitoring via `components/common/WebVitals.jsx`.

### Current Metrics Tracked

- **LCP** (Largest Contentful Paint) - Loading performance
- **FID** (First Input Delay) - Interactivity (legacy)
- **INP** (Interaction to Next Paint) - Interactivity (new)
- **CLS** (Cumulative Layout Shift) - Visual stability
- **FCP** (First Contentful Paint) - Initial render
- **TTFB** (Time to First Byte) - Server response

### Accessing Metrics

```javascript
import { getWebVitalsMetrics } from '@/components/common/WebVitals';

// Get current metrics
const metrics = getWebVitalsMetrics();
console.log('LCP:', metrics.LCP?.value);
console.log('CLS:', metrics.CLS?.value);
```

### Listening to Metric Updates

```javascript
useEffect(() => {
  const handleMetricUpdate = (event) => {
    const { name, value, rating } = event.detail;
    console.log(`${name}: ${value} (${rating})`);
    
    // Send to analytics
    if (window.gtag) {
      gtag('event', name, {
        value: Math.round(value),
        metric_rating: rating,
      });
    }
  };

  window.addEventListener('web-vitals-update', handleMetricUpdate);
  return () => window.removeEventListener('web-vitals-update', handleMetricUpdate);
}, []);
```

## RUM (Real User Monitoring) Integration

### Option 1: Google Analytics 4

```javascript
// In Layout.jsx or main entry
import { onCLS, onFID, onLCP, onINP } from 'web-vitals';

function sendToAnalytics({ name, value, rating, id }) {
  gtag('event', name, {
    event_category: 'Web Vitals',
    event_label: id,
    value: Math.round(name === 'CLS' ? value * 1000 : value),
    metric_rating: rating,
    non_interaction: true,
  });
}

onCLS(sendToAnalytics);
onFID(sendToAnalytics);
onLCP(sendToAnalytics);
onINP(sendToAnalytics);
```

### Option 2: Custom Endpoint

```javascript
// functions/reportVitals.js
export default async function handler(req) {
  const { name, value, rating, id } = await req.json();
  
  // Store in database
  await base44.entities.PerformanceMetric.create({
    metric_name: name,
    value: Math.round(value),
    rating,
    session_id: id,
    page: req.headers.get('referer'),
    user_agent: req.headers.get('user-agent'),
  });
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
```

```javascript
// Client-side reporting
function sendToEndpoint(metric) {
  fetch('/api/reportVitals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metric),
  }).catch(console.error);
}
```

## Performance Budget

Set thresholds in `components/monitoring/PerformanceBudget.jsx`:

```javascript
const BUDGET = {
  LCP: { good: 2500, needsImprovement: 4000 },
  FID: { good: 100, needsImprovement: 300 },
  INP: { good: 200, needsImprovement: 500 },
  CLS: { good: 0.1, needsImprovement: 0.25 },
  FCP: { good: 1800, needsImprovement: 3000 },
  TTFB: { good: 800, needsImprovement: 1800 },
};
```

## Monitoring Pages

Access monitoring UI at:
- `/performance-monitor` - Real-time Web Vitals dashboard
- `/dev-tools` - Development performance tools

## Production Validation

### Expected Metrics (70-95% improvement target)

**Before Optimization:**
- LCP: ~4000ms
- FID: ~300ms
- CLS: ~0.25

**After Optimization:**
- LCP: <2500ms (✓ Good)
- FID: <100ms (✓ Good)  
- CLS: <0.1 (✓ Good)

### Regression Detection

```javascript
// Alert if metrics degrade
window.addEventListener('web-vitals-update', ({ detail }) => {
  const { name, rating } = detail;
  
  if (rating === 'poor') {
    console.warn(`⚠️ ${name} is performing poorly`);
    
    // Alert dev team
    if (import.meta.env.PROD) {
      reportToSlack(`Performance regression: ${name}`);
    }
  }
});
```

## Resource Timing API

```javascript
// Monitor specific resources
const entries = performance.getEntriesByType('resource');
const slowResources = entries.filter(e => e.duration > 1000);

slowResources.forEach(resource => {
  console.warn('Slow resource:', resource.name, resource.duration + 'ms');
});
```

## Long Tasks Detection

```javascript
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.duration > 50) {
      console.warn('Long task detected:', entry.duration + 'ms');
    }
  }
});

observer.observe({ entryTypes: ['longtask'] });
```

## Recommendations

1. **Monitor regularly** - Check metrics weekly in production
2. **Set alerts** - Notify team when metrics degrade
3. **Track by page** - Identify problem areas
4. **A/B test** - Validate optimizations with real users
5. **Correlate with business** - Link performance to conversion rates