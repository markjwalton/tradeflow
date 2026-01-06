import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CSPConfig from "@/components/monitoring/CSPConfig";
import NPMAudit from "@/components/monitoring/NPMAudit";
import { Shield, Lock, FileCode2 } from "lucide-react";

export default function SecurityDashboardTab() {
  return (
    <Tabs defaultValue="csp" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="csp" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          CSP Headers
        </TabsTrigger>
        <TabsTrigger value="audit" className="flex items-center gap-2">
          <FileCode2 className="h-4 w-4" />
          NPM Audit
        </TabsTrigger>
        <TabsTrigger value="sentry" className="flex items-center gap-2">
          <Lock className="h-4 w-4" />
          Error Tracking
        </TabsTrigger>
      </TabsList>

      <TabsContent value="csp">
        <CSPConfig />
      </TabsContent>

      <TabsContent value="audit">
        <NPMAudit />
      </TabsContent>

      <TabsContent value="sentry" className="space-y-4">
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Sentry Error Tracking</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Setup Instructions</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Create a free account at <a href="https://sentry.io" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">sentry.io</a></li>
                <li>Create a new project for your application</li>
                <li>Copy your DSN (Data Source Name)</li>
                <li>Add to your environment variables: <code className="bg-muted px-1 rounded">VITE_SENTRY_DSN=your-dsn-here</code></li>
                <li>Optionally set: <code className="bg-muted px-1 rounded">VITE_APP_VERSION=1.0.0</code></li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium mb-2">Features Enabled</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Automatic error capture with stack traces</li>
                <li>Performance monitoring (10% sampling in production)</li>
                <li>Session replay for debugging (10% of sessions)</li>
                <li>User context tracking</li>
                <li>Custom breadcrumbs for debugging</li>
                <li>Filtered errors (network issues, browser extensions, etc.)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Status</h4>
              <p className="text-sm text-muted-foreground">
                {import.meta.env.VITE_SENTRY_DSN ? (
                  <span className="text-success">✓ Sentry is configured and active</span>
                ) : (
                  <span className="text-warning">⚠ Sentry DSN not configured. Add VITE_SENTRY_DSN to enable error tracking.</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}