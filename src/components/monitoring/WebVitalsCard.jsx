import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, Zap, Eye, MousePointer, Clock, Server } from 'lucide-react';
import { getWebVitalsMetrics } from '../common/WebVitals';

const THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FID: { good: 100, poor: 300 },
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 }
};

const METRIC_INFO = {
  CLS: {
    name: 'Cumulative Layout Shift',
    icon: Activity,
    description: 'Visual stability - measures unexpected layout shifts',
    unit: ''
  },
  FID: {
    name: 'First Input Delay',
    icon: MousePointer,
    description: 'Interactivity - time until page responds to first interaction',
    unit: 'ms'
  },
  FCP: {
    name: 'First Contentful Paint',
    icon: Eye,
    description: 'Loading - time until first content renders',
    unit: 'ms'
  },
  LCP: {
    name: 'Largest Contentful Paint',
    icon: Zap,
    description: 'Loading - time until largest content renders',
    unit: 'ms'
  },
  TTFB: {
    name: 'Time to First Byte',
    icon: Server,
    description: 'Server response - time until first byte received',
    unit: 'ms'
  },
  INP: {
    name: 'Interaction to Next Paint',
    icon: Clock,
    description: 'Responsiveness - time from interaction to visual update',
    unit: 'ms'
  }
};

function getRating(name, value) {
  const threshold = THRESHOLDS[name];
  if (!threshold) return 'good';
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

function formatValue(name, value) {
  const info = METRIC_INFO[name];
  if (!info) return value;
  if (name === 'CLS') return value.toFixed(3);
  return `${Math.round(value)}${info.unit}`;
}

export default function WebVitalsCard() {
  const [metrics, setMetrics] = useState(getWebVitalsMetrics());

  useEffect(() => {
    const handleUpdate = () => {
      setMetrics(getWebVitalsMetrics());
    };

    window.addEventListener('web-vitals-update', handleUpdate);
    return () => window.removeEventListener('web-vitals-update', handleUpdate);
  }, []);

  const coreMetrics = ['LCP', 'CLS', 'INP'];
  const otherMetrics = ['FCP', 'FID', 'TTFB'];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-info" />
            Core Web Vitals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {coreMetrics.map(name => {
            const metric = metrics[name];
            const info = METRIC_INFO[name];
            const Icon = info.icon;

            if (!metric) {
              return (
                <div key={name} className="flex items-center gap-4 p-3 border rounded-lg bg-muted/30">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{info.name}</div>
                    <div className="text-xs text-muted-foreground">Waiting for data...</div>
                  </div>
                </div>
              );
            }

            const rating = metric.rating || getRating(name, metric.value);
            const ratingColor = rating === 'good' ? 'text-success' : 
                               rating === 'needs-improvement' ? 'text-warning' : 'text-destructive';
            const badgeVariant = rating === 'good' ? 'default' : 
                                rating === 'needs-improvement' ? 'secondary' : 'destructive';

            return (
              <div key={name} className="flex items-center gap-4 p-3 border rounded-lg">
                <Icon className="h-5 w-5 text-info" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{info.name}</span>
                    <Badge variant={badgeVariant} className="capitalize">
                      {rating.replace('-', ' ')}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">{info.description}</div>
                  <div className="flex items-center gap-3">
                    <span className={`font-mono font-bold ${ratingColor}`}>
                      {formatValue(name, metric.value)}
                    </span>
                    {THRESHOLDS[name] && (
                      <div className="flex-1">
                        <Progress 
                          value={Math.min((metric.value / THRESHOLDS[name].poor) * 100, 100)} 
                          className="h-2"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Other Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {otherMetrics.map(name => {
            const metric = metrics[name];
            const info = METRIC_INFO[name];
            const Icon = info.icon;

            if (!metric) {
              return (
                <div key={name} className="flex items-center justify-between p-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{info.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Pending...</span>
                </div>
              );
            }

            const rating = metric.rating || getRating(name, metric.value);
            const ratingColor = rating === 'good' ? 'text-success' : 
                               rating === 'needs-improvement' ? 'text-warning' : 'text-destructive';

            return (
              <div key={name} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{info.name}</span>
                </div>
                <span className={`font-mono text-sm font-medium ${ratingColor}`}>
                  {formatValue(name, metric.value)}
                </span>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}