import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Code, 
  Database, 
  Activity, 
  AlertCircle,
  CheckCircle,
  Clock,
  Zap 
} from 'lucide-react';
import { DataSeeder } from './DataSeeder';
import { PerformanceMetrics } from '../monitoring/PerformanceMetrics';
import { PerformanceBudget } from '../monitoring/PerformanceBudget';

export function DevToolsPanel() {
  const [showDevTools, setShowDevTools] = useState(
    process.env.NODE_ENV === 'development'
  );

  if (!showDevTools) {
    return (
      <Button
        onClick={() => setShowDevTools(true)}
        className="fixed bottom-4 right-4 rounded-full h-12 w-12"
        variant="outline"
      >
        <Code className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-[600px] max-h-[80vh] overflow-auto shadow-2xl rounded-lg border bg-card z-50">
      <div className="sticky top-0 bg-card border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          <h3 className="font-semibold">Dev Tools</h3>
          <Badge variant="outline" className="text-xs">
            {process.env.NODE_ENV}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDevTools(false)}
        >
          ✕
        </Button>
      </div>

      <Tabs defaultValue="performance" className="p-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="performance" className="text-xs">
            <Activity className="h-3 w-3 mr-1" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="data" className="text-xs">
            <Database className="h-3 w-3 mr-1" />
            Data
          </TabsTrigger>
          <TabsTrigger value="debug" className="text-xs">
            <Zap className="h-3 w-3 mr-1" />
            Debug
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4 mt-4">
          <PerformanceBudget />
          <PerformanceMetrics />
        </TabsContent>

        <TabsContent value="data" className="mt-4">
          <DataSeeder />
        </TabsContent>

        <TabsContent value="debug" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Environment Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mode:</span>
                <Badge variant="outline">{process.env.NODE_ENV}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Browser:</span>
                <span>{navigator.userAgent.split(' ').slice(-2).join(' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Screen:</span>
                <span>{window.screen.width} × {window.screen.height}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Viewport:</span>
                <span>{window.innerWidth} × {window.innerHeight}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Local Storage</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="w-full"
              >
                Clear Local Storage & Reload
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}