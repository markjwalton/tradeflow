import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePerformanceMonitoring, PERFORMANCE_THRESHOLDS } from './usePerformanceMonitoring';
import { Activity, Zap, Gauge, TrendingUp } from 'lucide-react';

const metricIcons = {
  LCP: TrendingUp,
  FID: Zap,
  CLS: Gauge,
  FCP: Activity,
  TTFB: Activity,
};

const metricNames = {
  LCP: 'Largest Contentful Paint',
  FID: 'First Input Delay',
  CLS: 'Cumulative Layout Shift',
  FCP: 'First Contentful Paint',
  TTFB: 'Time to First Byte',
};

const ratingColors = {
  good: 'bg-success-50 text-success border-success',
  'needs-improvement': 'bg-warning/10 text-warning border-warning',
  poor: 'bg-destructive-50 text-destructive border-destructive',
};

export function PerformanceMetrics() {
  const [metrics, setMetrics] = useState({});
  
  usePerformanceMonitoring((metric) => {
    setMetrics(prev => ({ ...prev, [metric.name]: metric }));
  });

  const formatValue = (name, value) => {
    if (name === 'CLS') return value.toFixed(3);
    return `${Math.round(value)}ms`;
  };

  const getThresholdText = (name) => {
    const threshold = PERFORMANCE_THRESHOLDS[name];
    if (!threshold) return '';
    if (name === 'CLS') {
      return `Good: <${threshold.good}`;
    }
    return `Good: <${threshold.good}ms`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Object.entries(metrics).map(([name, metric]) => {
        const Icon = metricIcons[name] || Activity;
        return (
          <Card key={name} className="relative overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {metricNames[name]}
                </CardTitle>
                <Badge className={ratingColors[metric.rating]}>
                  {metric.rating}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {formatValue(name, metric.value)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {getThresholdText(name)}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}