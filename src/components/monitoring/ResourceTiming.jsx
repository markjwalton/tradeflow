import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export function ResourceTiming() {
  const [resources, setResources] = useState([]);

  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const resourceData = entries
        .filter(entry => entry.entryType === 'resource')
        .map(entry => ({
          name: entry.name.split('/').pop() || entry.name,
          type: entry.initiatorType,
          duration: Math.round(entry.duration),
          size: entry.transferSize || 0,
        }))
        .filter(r => r.duration > 100) // Only slow resources
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 10);

      setResources(resourceData);
    });

    observer.observe({ entryTypes: ['resource'] });

    return () => observer.disconnect();
  }, []);

  if (resources.length === 0) {
    return null;
  }

  const maxDuration = Math.max(...resources.map(r => r.duration));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Slow Resources</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {resources.map((resource, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Badge variant="outline" className="text-xs">
                    {resource.type}
                  </Badge>
                  <span className="truncate text-muted-foreground">
                    {resource.name}
                  </span>
                </div>
                <span className="font-medium ml-2">
                  {resource.duration}ms
                </span>
              </div>
              <Progress 
                value={(resource.duration / maxDuration) * 100} 
                className="h-1"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}