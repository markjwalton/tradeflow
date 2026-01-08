import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layout, Menu, Navigation, PanelLeft, User } from 'lucide-react';

export default function AppShellShowcase() {
  return (
    <div className="space-y-6" data-component="appShellShowcase">
      <Card data-element="appshell-structure">
        <CardContent className="pt-6">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <Layout className="h-4 w-4" />
            App Shell Structure
          </h4>
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">TailwindAppShell</span>
                <Badge variant="outline">Layout Component</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Main application shell that wraps all pages. Handles navigation, breadcrumbs, and layout.
              </p>
              <div className="mt-3 text-xs text-muted-foreground">
                <code>components/layout/TailwindAppShell.js</code>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="border rounded-lg p-3 bg-background">
                <div className="flex items-center gap-2 mb-2">
                  <Menu className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Top Navigation</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Horizontal navigation bar with logo, search, and user menu
                </p>
                <code className="text-xs text-muted-foreground mt-1 block">TailwindTopNav</code>
              </div>

              <div className="border rounded-lg p-3 bg-background">
                <div className="flex items-center gap-2 mb-2">
                  <PanelLeft className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Sidebar</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Collapsible sidebar with hierarchical navigation
                </p>
                <code className="text-xs text-muted-foreground mt-1 block">TailwindNavigation</code>
              </div>

              <div className="border rounded-lg p-3 bg-background">
                <div className="flex items-center gap-2 mb-2">
                  <Navigation className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Breadcrumbs</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Current page location and navigation trail
                </p>
                <code className="text-xs text-muted-foreground mt-1 block">TailwindBreadcrumb</code>
              </div>

              <div className="border rounded-lg p-3 bg-background">
                <div className="flex items-center gap-2 mb-2">
                  <Menu className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Mobile Drawer</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Slide-out navigation menu for mobile devices
                </p>
                <code className="text-xs text-muted-foreground mt-1 block">TailwindMobileDrawer</code>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card data-element="appshell-usage">
        <CardContent className="pt-6">
          <h4 className="font-medium mb-4">Usage & Customization</h4>
          <div className="space-y-3">
            <div className="bg-muted/50 rounded-lg p-4">
              <h5 className="text-sm font-medium mb-2">How to Edit</h5>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>Open <code className="text-xs">components/layout/TailwindAppShell.js</code> in the code editor</li>
                <li>Modify props, styling, or layout structure</li>
                <li>Changes automatically apply to all pages</li>
              </ol>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <h5 className="text-sm font-medium mb-2">Key Props</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <code className="text-xs">children</code>
                  <span className="text-muted-foreground">Page content to render</span>
                </div>
                <div className="flex justify-between">
                  <code className="text-xs">navItems</code>
                  <span className="text-muted-foreground">Navigation items from NavigationConfig</span>
                </div>
                <div className="flex justify-between">
                  <code className="text-xs">currentPageName</code>
                  <span className="text-muted-foreground">Active page for highlighting</span>
                </div>
                <div className="flex justify-between">
                  <code className="text-xs">user</code>
                  <span className="text-muted-foreground">Current user object</span>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <h5 className="text-sm font-medium mb-2 text-primary">Layout Features</h5>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Responsive design (mobile, tablet, desktop)</li>
                <li>Collapsible sidebar with icon-only mode</li>
                <li>Dynamic breadcrumb navigation</li>
                <li>User profile dropdown with settings</li>
                <li>Global search functionality</li>
                <li>Editor toggle button for page editing</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}