import { useEffect } from 'react';
import { onCLS, onFID, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';

export function WebVitals() {
  useEffect(() => {
    const reportMetric = (metric) => {
      // Log to console in development
      if (import.meta.env.DEV) {
        console.log(`[Web Vitals] ${metric.name}:`, {
          value: metric.value,
          rating: metric.rating,
          delta: metric.delta
        });
      }

      // Send to analytics endpoint (implement when ready)
      // navigator.sendBeacon('/api/analytics', JSON.stringify(metric));
    };

    // Core Web Vitals
    onCLS(reportMetric);  // Cumulative Layout Shift
    onFID(reportMetric);  // First Input Delay (legacy)
    onINP(reportMetric);  // Interaction to Next Paint (new)
    onLCP(reportMetric);  // Largest Contentful Paint

    // Other metrics
    onFCP(reportMetric);  // First Contentful Paint
    onTTFB(reportMetric); // Time to First Byte
  }, []);

  return null;
}