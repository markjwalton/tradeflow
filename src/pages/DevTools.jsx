import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Code, 
  Database, 
  Activity, 
  Zap 
} from 'lucide-react';
import { DataSeeder } from '@/components/dev-tools/DataSeeder';
import { PerformanceMetrics } from '@/components/monitoring/PerformanceMetrics';
import { PerformanceBudget } from '@/components/monitoring/PerformanceBudget';
import { PageHeader } from '@/components/sturij';

export default function DevTools() {
  return (
    <div className="max-w-7xl mx-auto -mt-6 min-h-screen">
      <PageHeader 
        title="Development Tools"
        description="Tools for development, testing, and debugging"
      />

      <Tabs defaultValue="performance">
        <TabsList>
          <TabsTrigger value="performance">
            <Activity className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="data">
            <Database className="h-4 w-4 mr-2" />
            Data
          </TabsTrigger>
          <TabsTrigger value="debug">
            <Zap className="h-4 w-4 mr-2" />
            Debug
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="mt-6">
          <Card className="border-border">
            <CardContent className="p-4 space-y-4">
              <PerformanceBudget />
              <PerformanceMetrics />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="mt-6">
          <Card className="border-border">
            <CardContent className="p-4">
              <DataSeeder />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="debug" className="mt-6">
          <Card className="border-border">
            <CardContent className="p-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Environment Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mode:</span>
                    <Badge variant="outline">{process.env.NODE_ENV}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Browser:</span>
                    <span className="text-sm">{navigator.userAgent.split(' ').slice(-2).join(' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Screen:</span>
                    <span className="text-sm">{window.screen.width} × {window.screen.height}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Viewport:</span>
                    <span className="text-sm">{window.innerWidth} × {window.innerHeight}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Local Storage</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}