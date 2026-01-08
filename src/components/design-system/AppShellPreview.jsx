import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Menu, Home, Settings, User, Bell, Search, 
  ChevronRight, PanelLeft, X, LayoutGrid, RefreshCw, Code, Eye,
  ChevronDown, Calendar, ShoppingCart, LogOut, Shield, Lightbulb, Plus, Inbox
} from 'lucide-react';
import { PageHeader } from '@/components/sturij/PageHeader';
import { PageSectionHeader } from '@/components/sturij/PageSectionHeader';
import { PageTitleHeader } from '@/components/sturij/PageTitleHeader';
import { TailwindFooter } from '@/components/sturij/TailwindFooter';
import { Avatar } from '@/components/ui/avatar';
import { 
  Dropdown, 
  DropdownButton, 
  DropdownDivider, 
  DropdownItem, 
  DropdownLabel, 
  DropdownMenu 
} from '@/components/ui/dropdown';
import { 
  Navbar, 
  NavbarDivider, 
  NavbarItem, 
  NavbarLabel, 
  NavbarSection, 
  NavbarSpacer 
} from '@/components/ui/navbar';

export function AppShellPreview({ config = {} }) {
  const [sidebarMode, setSidebarMode] = useState('expanded'); // 'expanded', 'icons', 'hidden'
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

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
      {/* Top Navigation - Catalyst Style */}
      <div 
        className="border-b"
        style={{ 
          height: topNavHeight,
          backgroundColor: topNavBg 
        }}
      >
        <Navbar>
          {/* Sidebar Toggle */}
          <button 
            onClick={() => {
              if (sidebarMode === 'expanded') setSidebarMode('icons');
              else if (sidebarMode === 'icons') setSidebarMode('hidden');
              else setSidebarMode('expanded');
            }}
            className="p-2 hover:bg-muted rounded-lg lg:inline-flex hidden"
          >
            {sidebarMode === 'hidden' ? <PanelLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Organization Dropdown */}
          <Dropdown>
            <DropdownButton as={NavbarItem}>
              <Avatar initials="TL" className="size-6" />
              <NavbarLabel>Sturij Design</NavbarLabel>
              <ChevronDown className="h-4 w-4" />
            </DropdownButton>
            <DropdownMenu className="min-w-64" anchor="bottom start">
              <DropdownItem>
                <Settings className="h-4 w-4" />
                <DropdownLabel>Settings</DropdownLabel>
              </DropdownItem>
              <DropdownDivider />
              <DropdownItem>
                <Avatar initials="TL" className="size-5" />
                <DropdownLabel>Sturij Design</DropdownLabel>
              </DropdownItem>
              <DropdownItem>
                <Avatar initials="WC" className="size-5 bg-purple-500" />
                <DropdownLabel>Workspace</DropdownLabel>
              </DropdownItem>
              <DropdownDivider />
              <DropdownItem>
                <Plus className="h-4 w-4" />
                <DropdownLabel>New team...</DropdownLabel>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>

          <NavbarDivider className="max-lg:hidden" />

          {/* Main Navigation */}
          <NavbarSection className="max-lg:hidden">
            <NavbarItem href="#" current>
              <Home className="h-4 w-4" />
              Home
            </NavbarItem>
            <NavbarItem href="#">
              <Calendar className="h-4 w-4" />
              Events
            </NavbarItem>
            <NavbarItem href="#">
              <ShoppingCart className="h-4 w-4" />
              Orders
            </NavbarItem>
          </NavbarSection>

          <NavbarSpacer />

          {/* Right Section */}
          <NavbarSection>
            <NavbarItem aria-label="Search">
              <Search className="h-5 w-5" />
            </NavbarItem>
            <NavbarItem aria-label="Inbox">
              <Inbox className="h-5 w-5" />
            </NavbarItem>
            
            {/* User Dropdown */}
            <Dropdown>
              <DropdownButton as={NavbarItem}>
                <Avatar initials="JD" className="size-8" />
              </DropdownButton>
              <DropdownMenu className="min-w-64" anchor="bottom end">
                <DropdownItem>
                  <User className="h-4 w-4" />
                  <DropdownLabel>My profile</DropdownLabel>
                </DropdownItem>
                <DropdownItem>
                  <Settings className="h-4 w-4" />
                  <DropdownLabel>Settings</DropdownLabel>
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem>
                  <Shield className="h-4 w-4" />
                  <DropdownLabel>Privacy policy</DropdownLabel>
                </DropdownItem>
                <DropdownItem>
                  <Lightbulb className="h-4 w-4" />
                  <DropdownLabel>Share feedback</DropdownLabel>
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem>
                  <LogOut className="h-4 w-4" />
                  <DropdownLabel>Sign out</DropdownLabel>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarSection>
        </Navbar>
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
            {/* Page Title Header */}
            <div className="bg-card px-6 py-6 border-b">
              <PageTitleHeader
                title="Back End Developer"
                metadata={[
                  { label: 'Full-time', icon: LayoutGrid },
                  { label: 'Remote', icon: Home },
                  { label: '$120k – $140k', icon: LayoutGrid },
                  { label: 'Closing on January 9, 2026', icon: Calendar }
                ]}
                actions={[
                  { label: 'Edit', variant: 'outline', icon: Settings },
                  { label: 'View', variant: 'outline', icon: Eye },
                  { label: 'Publish', variant: 'default', icon: ChevronRight, primary: true }
                ]}
              />
            </div>

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

            <div className="p-6 space-y-6">
              {/* Section Header Example */}
              <PageSectionHeader
                title="Candidates"
                currentTab={activeTab}
                onTabChange={setActiveTab}
                tabs={[
                  { value: 'overview', label: 'Applied', count: 12 },
                  { value: 'screening', label: 'Phone Screening', count: 8 },
                  { value: 'interview', label: 'Interview', count: 5 },
                  { value: 'offer', label: 'Offer', count: 2 },
                  { value: 'hired', label: 'Hired', count: 15 }
                ]}
                actions={[
                  { label: 'Share', variant: 'outline' },
                  { label: 'Create', variant: 'default' }
                ]}
              />

              <Card>
                <CardHeader>
                  <CardTitle>Page Content Area</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    This preview shows the full app shell layout with all components combined, including section headers with tabs and action buttons.
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