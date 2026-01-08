import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Menu, Home, Settings, User, Bell, Search, 
  ChevronRight, PanelLeft, X, LayoutGrid, RefreshCw, Code, Eye
} from 'lucide-react';
import { PageHeader } from '@/components/sturij/PageHeader';

export function AppShellPreview({ config = {} }) {
  const [sidebarMode, setSidebarMode] = useState('expanded'); // 'expanded', 'icons', 'hidden'
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const {
    sidebarWidth = '280px',
    contentMaxWidth = '1440px',
    topNavHeight = '64px',
    topNavBg = 'var(--color-card)',
    sidebarBg = 'var(--color-card)',
    sidebarItemHoverBg = 'var(--primary-100)'
  } = config;

  const navItems = [
    { name: 'Dashboard', icon: Home, active: true },
    { name: 'Projects', icon: LayoutGrid },
    { name: 'Settings', icon: Settings },
    { name: 'Profile', icon: User }
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="App Shell Live Preview"
        description="Full application layout with all components combined"
      >
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSidebarMode(sidebarMode === 'expanded' ? 'icons' : sidebarMode === 'icons' ? 'hidden' : 'expanded')}
          >
            <Eye className="h-4 w-4 mr-2" />
            Toggle Layout
          </Button>
          <Button variant="outline" size="sm">
            <Code className="h-4 w-4 mr-2" />
            View Code
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </PageHeader>

      <div className="border rounded-lg overflow-hidden bg-[var(--color-background)] h-[600px] flex flex-col">
      {/* Top Navigation */}
      <div 
        className="flex items-center justify-between px-4 border-b"
        style={{ 
          height: topNavHeight,
          backgroundColor: topNavBg 
        }}
      >
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              if (sidebarMode === 'expanded') setSidebarMode('icons');
              else if (sidebarMode === 'icons') setSidebarMode('hidden');
              else setSidebarMode('expanded');
            }}
            className="p-2 hover:bg-muted rounded-lg lg:block"
          >
            {sidebarMode === 'hidden' ? <PanelLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="font-semibold text-lg">App Shell Preview</div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-muted rounded-lg">
            <Search className="h-5 w-5" />
          </button>
          <button className="p-2 hover:bg-muted rounded-lg">
            <Bell className="h-5 w-5" />
          </button>
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebarMode !== 'hidden' && (
          <div 
            className="border-r flex flex-col transition-all duration-200"
            style={{ 
              width: sidebarMode === 'expanded' ? sidebarWidth : '80px',
              backgroundColor: sidebarBg 
            }}
          >
            <nav className="flex-1 p-4 space-y-1">
              {navItems.map((item, idx) => (
                <button
                  key={idx}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    item.active ? 'bg-primary text-white' : 'hover:bg-[' + sidebarItemHoverBg + ']'
                  }`}
                  style={!item.active ? { '--hover-bg': sidebarItemHoverBg } : {}}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {sidebarMode === 'expanded' && <span className="text-sm">{item.name}</span>}
                </button>
              ))}
            </nav>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Breadcrumb */}
          <div className="border-b bg-card px-6 py-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="hover:text-foreground cursor-pointer">Home</span>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground font-medium">Dashboard</span>
            </div>
          </div>

          {/* Page Content */}
          <div 
            className="flex-1 overflow-auto"
            style={{ maxWidth: contentMaxWidth }}
          >
            {/* Page Tabs Example */}
            <div className="border-b bg-card px-6">
              <nav className="flex gap-8" aria-label="Tabs">
                {['Overview', 'Analytics', 'Settings'].map((tab, idx) => (
                  <button
                    key={tab}
                    className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
                      idx === 0
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              <Card>
                <CardHeader>
                  <CardTitle>Page Content Area</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    This preview shows the full app shell layout with all components combined, including page tabs for multiple views.
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="p-4 border rounded-lg">
                        <div className="h-3 bg-muted rounded mb-2"></div>
                        <div className="h-3 bg-muted rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

        {/* Configuration Controls */}
        <div className="border-t bg-muted/30 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="text-xs">
              Sidebar: {sidebarMode}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Width: {sidebarMode === 'expanded' ? sidebarWidth : '80px'}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Max Content: {contentMaxWidth}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Top Nav: {topNavHeight}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}