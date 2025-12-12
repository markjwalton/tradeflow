import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { usePerformanceMonitoring, PERFORMANCE_THRESHOLDS } from './usePerformanceMonitoring';

/**
 * Performance budget configuration
 */
const PERFORMANCE_BUDGET = {
  LCP: PERFORMANCE_THRESHOLDS.LCP.good,
  FID: PERFORMANCE_THRESHOLDS.FID.good,
  CLS: PERFORMANCE_THRESHOLDS.CLS.good,
  FCP: PERFORMANCE_THRESHOLDS.FCP.good,
  TTFB: PERFORMANCE_THRESHOLDS.TTFB.good,
};

export function PerformanceBudget() {
  const [violations, setViolations] = useState([]);
  const [passed, setPassed] = useState([]);

  usePerformanceMonitoring((metric) => {
    const budget = PERFORMANCE_BUDGET[metric.name];
    if (!budget) return;

    if (metric.value > budget) {
      setViolations(prev => {
        const existing = prev.find(v => v.name === metric.name);
        if (existing) return prev;
        return [...prev, metric];
      });
    } else {
      setPassed(prev => {
        const existing = prev.find(p => p.name === metric.name);
        if (existing) return prev;
        return [...prev, metric];
      });
    }
  });

  if (violations.length === 0 && passed.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {violations.map((metric) => (
        <Alert key={metric.name} variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Performance Budget Exceeded</AlertTitle>
          <AlertDescription>
            {metric.name} is {Math.round(metric.value)}
            {metric.name === 'CLS' ? '' : 'ms'}, exceeding the budget of{' '}
            {PERFORMANCE_BUDGET[metric.name]}
            {metric.name === 'CLS' ? '' : 'ms'}.
          </AlertDescription>
        </Alert>
      ))}
      
      {violations.length === 0 && passed.length > 0 && (
        <Alert className="border-success bg-success-50">
          <CheckCircle className="h-4 w-4 text-success" />
          <AlertTitle className="text-success">Performance Budget Met</AlertTitle>
          <AlertDescription className="text-success">
            All metrics are within the performance budget.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}