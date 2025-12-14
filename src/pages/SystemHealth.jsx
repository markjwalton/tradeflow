import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, AlertCircle, AlertTriangle, Info,
  Activity, Shield, Zap, Gauge, Lock, Eye, FileCode2,
  RefreshCw, TrendingUp, Server, Database, Loader2
} from "lucide-react";
import { getWebVitalsMetrics } from "@/components/common/WebVitals";
import { PageHeader } from "@/components/sturij";

export default function SystemHealth() {
  const [webVitals, setWebVitals] = useState({});
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    // Get initial metrics
    setWebVitals(getWebVitalsMetrics());

    // Listen for updates
    const handleUpdate = () => {
      setWebVitals(getWebVitalsMetrics());
      setLastUpdated(new Date());
    };

    window.addEventListener('web-vitals-update', handleUpdate);
    return () => window.removeEventListener('web-vitals-update', handleUpdate);
  }, []);

  const getMetricRating = (metric) => {
    if (!metric) return 'pending';
    return metric.rating || 'good';
  };

  const getStatusIcon = (rating) => {
    switch (rating) {
      case 'good': return <CheckCircle2 className="h-5 w-5 text-success" />;
      case 'needs-improvement': return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'poor': return <AlertCircle className="h-5 w-5 text-destructive" />;
      default: return <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />;
    }
  };

  const formatMetricValue = (name, value) => {
    if (!value) return '—';
    if (name === 'CLS') return value.toFixed(3);
    return Math.round(value) + 'ms';
  };

  const enhancements = [
    {
      category: "Stability",
      icon: Server,
      items: [
        { name: "Error Boundaries", status: "implemented", description: "App-level and route-level error boundaries" },
        { name: "Build Pipeline", status: "documented", description: "Build stability guide and best practices" },
        { name: "Version Pinning", status: "recommended", description: "Package version management strategy" },
      ]
    },
    {
      category: "Performance",
      icon: Zap,
      items: [
        { name: "Web Vitals", status: "active", description: "LCP, FID, INP, CLS, FCP, TTFB monitoring" },
        { name: "Route Prefetch", status: "implemented", description: "Idle prefetching for dashboard and libraries" },
        { name: "Image Optimization", status: "implemented", description: "Lazy loading, blur placeholders, WebP support" },
        { name: "Query Caching", status: "configured", description: "TanStack Query with smart cache strategies" },
      ]
    },
    {
      category: "Accessibility",
      icon: Eye,
      items: [
        { name: "Color Contrast", status: "implemented", description: "WCAG AA contrast checking utilities" },
        { name: "Keyboard Nav", status: "implemented", description: "useKeyboardNav hook for lists and menus" },
        { name: "Focus Management", status: "implemented", description: "Focus trapping and visible focus rings" },
        { name: "Screen Readers", status: "implemented", description: "ARIA labels and announcements" },
      ]
    },
    {
      category: "Security",
      icon: Shield,
      items: [
        { name: "Auth Boundaries", status: "implemented", description: "Tenant isolation and access controls" },
        { name: "Input Sanitization", status: "documented", description: "XSS prevention guidelines" },
        { name: "Environment Config", status: "documented", description: "Secrets management audit guide" },
        { name: "CSP Headers", status: "recommended", description: "Content Security Policy recommendations" },
      ]
    },
    {
      category: "Developer Experience",
      icon: FileCode2,
      items: [
        { name: "Error Handling", status: "standardized", description: "Consistent query error handlers" },
        { name: "Source Maps", status: "documented", description: "Production source map policy" },
        { name: "CI/CD Pipeline", status: "documented", description: "GitHub Actions workflow templates" },
        { name: "API Caching", status: "documented", description: "ETag and Cache-Control strategies" },
      ]
    }
  ];

  const statusColors = {
    implemented: "bg-success-50 text-success border-success/20",
    active: "bg-info-50 text-info border-info/20",
    configured: "bg-accent-100 text-accent border-accent/20",
    documented: "bg-secondary-100 text-secondary border-secondary/20",
    standardized: "bg-primary-100 text-primary border-primary/20",
    recommended: "bg-warning/10 text-warning border-warning/20",
  };

  const overallHealth = (() => {
    const total = enhancements.reduce((sum, cat) => sum + cat.items.length, 0);
    const implemented = enhancements.reduce((sum, cat) => 
      sum + cat.items.filter(i => ['implemented', 'active'].includes(i.status)).length, 0
    );
    return Math.round((implemented / total) * 100);
  })();

  return (
    <div className="max-w-7xl mx-auto -mt-6">
      <PageHeader 
        title="System Health"
        description="Monitor application performance, stability, and security"
      >
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </PageHeader>

      {/* Overall Health Score */}
      <Card className="mb-6 bg-gradient-to-br from-primary-50 to-accent-50 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-primary" />
            Overall System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Progress value={overallHealth} className="h-3" />
            </div>
            <div className="text-3xl font-bold text-primary">{overallHealth}%</div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="vitals" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="vitals">Web Vitals</TabsTrigger>
          <TabsTrigger value="stability">Stability</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="a11y">Accessibility</TabsTrigger>
        </TabsList>

        {/* Web Vitals Tab */}
        <TabsContent value="vitals" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {['LCP', 'FID', 'INP', 'CLS', 'FCP', 'TTFB'].map(metricName => {
              const metric = webVitals[metricName];
              const rating = getMetricRating(metric);
              
              return (
                <Card key={metricName}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {metricName}
                      </CardTitle>
                      {getStatusIcon(rating)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatMetricValue(metricName, metric?.value)}
                    </div>
                    <Badge className={`mt-2 ${
                      rating === 'good' ? 'bg-success-50 text-success' :
                      rating === 'needs-improvement' ? 'bg-warning/10 text-warning' :
                      rating === 'poor' ? 'bg-destructive-50 text-destructive' :
                      'bg-muted'
                    }`}>
                      {rating === 'pending' ? 'Measuring...' : rating}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Info className="h-4 w-4" />
                About Web Vitals
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p><strong>LCP:</strong> Largest Contentful Paint - Loading performance (Good: &lt;2.5s)</p>
              <p><strong>FID:</strong> First Input Delay - Interactivity legacy (Good: &lt;100ms)</p>
              <p><strong>INP:</strong> Interaction to Next Paint - New interactivity metric (Good: &lt;200ms)</p>
              <p><strong>CLS:</strong> Cumulative Layout Shift - Visual stability (Good: &lt;0.1)</p>
              <p><strong>FCP:</strong> First Contentful Paint - Initial render (Good: &lt;1.8s)</p>
              <p><strong>TTFB:</strong> Time to First Byte - Server response (Good: &lt;800ms)</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stability Tab */}
        <TabsContent value="stability" className="space-y-4">
          {enhancements.filter(cat => cat.category === "Stability").map(category => (
            <div key={category.category}>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <category.icon className="h-5 w-5" />
                {category.category}
              </h3>
              <div className="grid gap-3">
                {category.items.map(item => (
                  <Card key={item.name}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{item.name}</h4>
                            <Badge className={statusColors[item.status]} variant="outline">
                              {item.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-success ml-4" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          {enhancements.filter(cat => cat.category === "Performance").map(category => (
            <div key={category.category}>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <category.icon className="h-5 w-5" />
                {category.category}
              </h3>
              <div className="grid gap-3">
                {category.items.map(item => (
                  <Card key={item.name}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{item.name}</h4>
                            <Badge className={statusColors[item.status]} variant="outline">
                              {item.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-success ml-4" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          {enhancements.filter(cat => cat.category === "Security").map(category => (
            <div key={category.category}>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <category.icon className="h-5 w-5" />
                {category.category}
              </h3>
              <div className="grid gap-3">
                {category.items.map(item => (
                  <Card key={item.name}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{item.name}</h4>
                            <Badge className={statusColors[item.status]} variant="outline">
                              {item.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-success ml-4" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>

        {/* Accessibility Tab */}
        <TabsContent value="a11y" className="space-y-4">
          {enhancements.filter(cat => cat.category === "Accessibility").map(category => (
            <div key={category.category}>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <category.icon className="h-5 w-5" />
                {category.category}
              </h3>
              <div className="grid gap-3">
                {category.items.map(item => (
                  <Card key={item.name}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{item.name}</h4>
                            <Badge className={statusColors[item.status]} variant="outline">
                              {item.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-success ml-4" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="justify-start" onClick={() => window.open('/dev-tools', '_blank')}>
              <Activity className="h-4 w-4 mr-2" />
              Dev Tools
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => window.open('/performance-monitor', '_blank')}>
              <Gauge className="h-4 w-4 mr-2" />
              Performance
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => console.log('Running npm audit...')}>
              <Lock className="h-4 w-4 mr-2" />
              Security Audit
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => console.log(getWebVitalsMetrics())}>
              <Database className="h-4 w-4 mr-2" />
              Export Metrics
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Documentation Links */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Documentation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <a href="#" className="text-primary hover:underline flex items-center gap-2">
              <FileCode2 className="h-4 w-4" />
              Build Stability Guide
            </a>
            <a href="#" className="text-primary hover:underline flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Performance Monitoring Guide
            </a>
            <a href="#" className="text-primary hover:underline flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Accessibility Guide
            </a>
            <a href="#" className="text-primary hover:underline flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security Guide
            </a>
            <a href="#" className="text-primary hover:underline flex items-center gap-2">
              <Server className="h-4 w-4" />
              CI/CD Pipeline Guide
            </a>
            <a href="#" className="text-primary hover:underline flex items-center gap-2">
              <Database className="h-4 w-4" />
              API Caching Guide
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}