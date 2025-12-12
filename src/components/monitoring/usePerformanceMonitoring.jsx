import { useEffect, useRef } from 'react';
import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals';

/**
 * Performance thresholds (Core Web Vitals)
 */
export const PERFORMANCE_THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 }, // Largest Contentful Paint
  FID: { good: 100, needsImprovement: 300 },   // First Input Delay
  CLS: { good: 0.1, needsImprovement: 0.25 },  // Cumulative Layout Shift
  FCP: { good: 1800, needsImprovement: 3000 }, // First Contentful Paint
  TTFB: { good: 800, needsImprovement: 1800 }, // Time to First Byte
};

/**
 * Get rating based on value and thresholds
 */
function getRating(value, thresholds) {
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.needsImprovement) return 'needs-improvement';
  return 'poor';
}

/**
 * Hook for monitoring Web Vitals
 */
export function usePerformanceMonitoring(onMetric) {
  const metricsRef = useRef({});

  useEffect(() => {
    const handleMetric = (metric) => {
      const { name, value, rating: nativeRating } = metric;
      const threshold = PERFORMANCE_THRESHOLDS[name];
      const rating = threshold ? getRating(value, threshold) : nativeRating;
      
      const metricData = {
        ...metric,
        rating,
        timestamp: Date.now(),
      };
      
      metricsRef.current[name] = metricData;
      
      if (onMetric) {
        onMetric(metricData);
      }
    };

    // Register all Web Vitals metrics
    onLCP(handleMetric);
    onFID(handleMetric);
    onCLS(handleMetric);
    onFCP(handleMetric);
    onTTFB(handleMetric);

    return () => {
      metricsRef.current = {};
    };
  }, [onMetric]);

  return metricsRef.current;
}

/**
 * Track custom performance marks
 */
export function usePerformanceMark(markName) {
  useEffect(() => {
    performance.mark(markName);
    
    return () => {
      try {
        performance.clearMarks(markName);
      } catch (e) {
        // Mark doesn't exist
      }
    };
  }, [markName]);
}

/**
 * Measure performance between two marks
 */
export function measurePerformance(measureName, startMark, endMark) {
  try {
    performance.measure(measureName, startMark, endMark);
    const measure = performance.getEntriesByName(measureName)[0];
    return measure?.duration || 0;
  } catch (e) {
    console.warn(`Failed to measure ${measureName}:`, e);
    return 0;
  }
}