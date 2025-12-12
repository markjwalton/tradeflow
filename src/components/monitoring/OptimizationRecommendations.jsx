import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lightbulb, CheckCircle } from 'lucide-react';
import { usePerformanceMonitoring, PERFORMANCE_THRESHOLDS } from './usePerformanceMonitoring';

const recommendations = {
  LCP: [
    'Optimize images with WebP format and lazy loading',
    'Reduce server response times',
    'Eliminate render-blocking resources',
    'Implement route-based code splitting',
  ],
  FID: [
    'Break up long JavaScript tasks',
    'Optimize event handlers',
    'Use web workers for heavy computation',
    'Reduce JavaScript execution time',
  ],
  CLS: [
    'Add size attributes to images and videos',
    'Reserve space for dynamic content',
    'Avoid inserting content above existing content',
    'Use CSS transform animations',
  ],
  FCP: [
    'Eliminate render-blocking resources',
    'Minimize main thread work',
    'Reduce server response times',
    'Implement critical CSS inline',
  ],
  TTFB: [
    'Optimize database queries',
    'Implement server-side caching',
    'Use a CDN for static assets',
    'Reduce API response times',
  ],
};

export function OptimizationRecommendations() {
  const [poorMetrics, setPoorMetrics] = useState([]);

  usePerformanceMonitoring((metric) => {
    if (metric.rating === 'poor') {
      setPoorMetrics(prev => {
        const existing = prev.find(m => m.name === metric.name);
        if (existing) return prev;
        return [...prev, metric];
      });
    } else {
      setPoorMetrics(prev => prev.filter(m => m.name !== metric.name));
    }
  });

  if (poorMetrics.length === 0) {
    return (
      <Alert className="border-success bg-success-50">
        <CheckCircle className="h-4 w-4 text-success" />
        <AlertDescription className="text-success">
          All performance metrics are looking good! No immediate optimizations needed.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Lightbulb className="h-4 w-4" />
          Optimization Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {poorMetrics.map((metric) => (
            <div key={metric.name} className="space-y-2">
              <h4 className="font-medium text-sm">
                Improve {metric.name}
              </h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {recommendations[metric.name]?.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}