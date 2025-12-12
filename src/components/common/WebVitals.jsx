import { useEffect, useState } from 'react';
import { onCLS, onFID, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';

// Global storage for latest metrics
let latestMetrics = {
  CLS: null,
  FID: null,
  FCP: null,
  LCP: null,
  TTFB: null,
  INP: null
};

export function getWebVitalsMetrics() {
  return { ...latestMetrics };
}

export function WebVitals() {
  useEffect(() => {
    const reportMetric = (metric) => {
      // Store metric globally
      latestMetrics[metric.name] = {
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        timestamp: Date.now()
      };

      // Log to console in development
      if (import.meta.env.DEV) {
        console.log(`[Web Vitals] ${metric.name}:`, {
          value: metric.value,
          rating: metric.rating,
          delta: metric.delta
        });
      }

      // Dispatch custom event for components to listen
      window.dispatchEvent(new CustomEvent('web-vitals-update', { 
        detail: { name: metric.name, ...latestMetrics[metric.name] } 
      }));
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