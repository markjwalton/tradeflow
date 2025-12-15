import { useState } from 'react';
import { 
  Search, 
  Plus, 
  GripVertical, 
  ChevronDown, 
  ChevronRight,
  HelpCircle,
  MessageCircle,
  LayoutDashboard,
  FileText,
  Wrench,
  Calendar,
  Users,
  Trello,
  Briefcase,
  Home,
  Clock,
  Activity,
  Tag,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

// Simple Header Component
function Header() {
  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold">Navigation Manager</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search..." 
            className="pl-9 w-64"
          />
        </div>
      </div>
    </div>
  );
}

// Simple Breadcrumb Component
function BreadcrumbNavigation({ items }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && <span className="text-muted-foreground">/</span>}
          {item.href ? (
            <a href={item.href} className="text-muted-foreground hover:text-foreground">
              {item.label}
            </a>
          ) : (
            <span className="text-foreground">{item.label}</span>
          )}
        </div>
      ))}
    </div>
  );
}

export default function NavigationManagerTest() {
  const [activeTab, setActiveTab] = useState('system');
  const [expandedSections, setExpandedSections] = useState(new Set(['top-tabs']));
  const [navItems, setNavItems] = useState({
    'marketplace': true,
    'blueprints': true,
    'design-tokens': true,
    'worklog': true,
    'memberships': true,
    'kanban': true,
    'business-day': true,
    'home': false,
    'temp': false,
  });

  // Mock sidebar navigation structure
  const sidebarItems = [
    { label: 'Dashboard', icon: LayoutDashboard },
    { label: 'Navigation Manager', icon: FileText, active: true, children: [
      { label: 'System Navigation', icon: Tag },
      { label: 'Site Pages', icon: FileText },
      { label: 'Social Links', icon: MessageCircle }
    ]},
    { label: 'Architect Workspace', icon: Wrench },
    { label: 'Token Manager', icon: Tag },
    { label: 'Blueprint', icon: FileText },
    { label: 'App Tools', icon: Wrench },
    { label: 'Shadcn Apps', icon: Package },
    { label: 'AI Tech Service Builder', icon: Activity },
    { label: 'Job Work', icon: Briefcase },
    { label: 'Scheduling & Dispatch', icon: Calendar },
    { label: 'Timesheet & Resource', icon: Clock },
    { label: 'Inventory & Assets', icon: Package },
    { label: 'Purchasing', icon: Tag },
    { label: 'Product Administrator', icon: Package },
    { label: 'Token Studio Manager', icon: Tag },
    { label: 'Admin Dashboard', icon: LayoutDashboard },
    { label: 'Performance Manager', icon: Activity },
    { label: 'Template Manager', icon: FileText },
    { label: 'System Monitor', icon: Activity },
    { label: 'Advanced Settings', icon: Wrench },
    { label: 'Email Designer', icon: FileText },
    { label: 'Notification Manager', icon: MessageCircle },
    { label: 'Component Library', icon: Package },
    { label: 'Design Kit', icon: Package },
    { label: 'API Marketplace', icon: Package },
  ];

  const navigationSections = [
    {
      id: 'top-tabs',
      title: 'Top Tabs',
      items: [
        { id: 'marketplace', label: 'Marketplace', type: 'Menu', icon: Package, enabled: navItems['marketplace'] },
        { id: 'blueprints', label: 'Blueprints', type: 'Menu', icon: FileText, enabled: navItems['blueprints'] },
        { id: 'design-tokens', label: 'Design Tokens', type: 'Menu', icon: Tag, enabled: navItems['design-tokens'] },
        { id: 'worklog', label: 'Worklog', type: 'Menu', icon: Clock, enabled: navItems['worklog'] },
        { id: 'memberships', label: 'Memberships', type: 'Menu', icon: Users, enabled: navItems['memberships'] },
        { id: 'kanban', label: 'Kanban', type: 'Menu', icon: Trello, enabled: navItems['kanban'] },
        { id: 'business-day', label: 'Business Day', type: 'Menu', icon: Briefcase, enabled: navItems['business-day'] },
        { id: 'home', label: 'Home', icon: Home, enabled: navItems['home'] },
        { id: 'temp', label: 'Temp', icon: FileText, enabled: navItems['temp'] },
      ]
    },
    {
      id: 'dashboard-cta',
      title: 'Dashboard Super CTA',
      items: []
    },
    {
      id: 'badge-cta',
      title: 'Badge CTA',
      items: []
    }
  ];

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const toggleNavItem = (itemId) => {
    setNavItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Settings', href: '/settings' },
    { label: 'Navigation Manager' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-white via-[var(--color-background)] to-white">
      {/* Full Width Header */}
      <div className="w-full bg-white/80 backdrop-blur-sm border-b border-[var(--color-border)] sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto">
          <Header />
        </div>
      </div>

      {/* Centered Content Container */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto px-6 pt-24 pb-6 gap-6 overflow-hidden">
        {/* Floating Left Sidebar Navigation */}
        <aside className="w-64 bg-white rounded-2xl shadow-lg border border-[var(--color-border)]/50 flex flex-col overflow-hidden">
          {/* Sidebar Items */}
          <ScrollArea className="flex-1 pt-6">
            <nav className="p-4 space-y-1">
              {sidebarItems.map((item, index) => (
                <div key={index}>
                  <button
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-2xl text-sm transition-all
                      ${item.active 
                        ? 'bg-[var(--color-accent)]/50 text-[var(--color-text-primary)] border border-[var(--color-accent)] shadow-sm' 
                        : 'text-[var(--color-text-secondary)] hover:bg-gray-50 hover:shadow-sm'
                      }
                    `}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                  {/* Children items */}
                  {item.active && item.children && (
                    <div className="mt-1 ml-4 space-y-1">
                      {item.children.map((child, childIndex) => (
                        <button
                          key={childIndex}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-2xl text-sm transition-all bg-[var(--color-accent)]/30 text-[var(--color-text-secondary)] hover:bg-[var(--color-accent)]/40"
                        >
                          <child.icon className="w-3 h-3" />
                          <span className="text-xs">{child.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </ScrollArea>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
            <div className="flex items-center justify-between">
              <span>User Preferences</span>
              <span>v2.0.4</span>
            </div>
          </div>
        </aside>

        {/* Floating Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden bg-white rounded-2xl shadow-lg">
          {/* Breadcrumbs */}
          <div className="px-8 py-4">
            <BreadcrumbNavigation items={breadcrumbs} />
          </div>

          {/* Page Header */}
          <div className="px-8 py-6">
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-transparent border-b border-[var(--color-border)] rounded-none w-full justify-start h-auto p-0">
                <TabsTrigger 
                  value="system" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--color-primary)] data-[state=active]:bg-transparent"
                >
                  System
                </TabsTrigger>
                <TabsTrigger 
                  value="site-pages"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--color-primary)] data-[state=active]:bg-transparent"
                >
                  Site Pages
                </TabsTrigger>
                <TabsTrigger 
                  value="social"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--color-primary)] data-[state=active]:bg-transparent"
                >
                  Social
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto bg-gradient-to-b from-[var(--color-background)]/30 to-white">
            <div className="p-8">
              <Tabs value={activeTab} className="w-full">
                <TabsContent value="system" className="mt-0">
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                    {navigationSections.map((section, sectionIndex) => (
                      <div key={section.id} className={sectionIndex > 0 ? 'border-t border-[var(--color-border)]' : ''}>
                        {/* Section Header */}
                        <div className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors">
                          <button
                            onClick={() => toggleSection(section.id)}
                            className="flex items-center gap-3 flex-1"
                          >
                            <GripVertical className="w-4 h-4 text-[var(--color-text-muted)]" />
                            <div className="flex items-center gap-2">
                              {expandedSections.has(section.id) ? (
                                <ChevronDown className="w-4 h-4 text-[var(--color-text-secondary)]" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-[var(--color-text-secondary)]" />
                              )}
                              <span className="font-medium text-[var(--color-text-primary)]">
                                {section.title}
                              </span>
                            </div>
                          </button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-2 rounded-lg hover:shadow-sm transition-all"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <Plus className="w-4 h-4" />
                            Add Navigation
                          </Button>
                        </div>

                        {/* Section Items */}
                        {expandedSections.has(section.id) && (
                          <div className="bg-gradient-to-b from-gray-50/50 to-white">
                            {section.items.length === 0 ? (
                              <div className="px-6 py-8 text-center text-[var(--color-text-muted)] text-sm">
                                No navigation items yet
                              </div>
                            ) : (
                              <div className="divide-y divide-[var(--color-border)]">
                                {section.items.map((item, itemIndex) => {
                                  const Icon = item.icon || FileText;
                                  return (
                                    <div
                                      key={item.id}
                                      className="flex items-center gap-4 px-6 py-4 bg-white hover:bg-gray-50/50 transition-all hover:shadow-sm"
                                    >
                                      {/* Drag Handle */}
                                      <GripVertical className="w-4 h-4 text-[var(--color-text-muted)] cursor-grab" />
                                      
                                      {/* Order Number */}
                                      <span className="text-sm text-[var(--color-text-muted)] w-6">
                                        {itemIndex + 1}.
                                      </span>

                                      {/* Icon */}
                                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-background)] to-gray-50 flex items-center justify-center shadow-sm">
                                        <Icon className="w-4 h-4 text-[var(--color-text-secondary)]" />
                                      </div>

                                      {/* Label */}
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm text-[var(--color-text-primary)]">
                                            {item.label}
                                          </span>
                                          {item.type && (
                                            <Badge variant="secondary" className="text-xs rounded-md">
                                              {item.type}
                                            </Badge>
                                          )}
                                        </div>
                                      </div>

                                      {/* Toggle */}
                                      <Switch
                                        checked={item.enabled}
                                        onCheckedChange={() => toggleNavItem(item.id)}
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="site-pages" className="mt-0">
                  <div className="bg-white rounded-lg border border-[var(--color-border)] p-12 text-center">
                    <FileText className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-4" />
                    <h3 className="text-[var(--color-text-primary)] mb-2">Site Pages</h3>
                    <p className="text-[var(--color-text-secondary)] text-sm">
                      Manage your site pages navigation structure
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="social" className="mt-0">
                  <div className="bg-white rounded-lg border border-[var(--color-border)] p-12 text-center">
                    <MessageCircle className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-4" />
                    <h3 className="text-[var(--color-text-primary)] mb-2">Social</h3>
                    <p className="text-[var(--color-text-secondary)] text-sm">
                      Configure social media links and integrations
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex gap-3">
        <Button
          size="icon"
          className="w-12 h-12 rounded-full shadow-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]"
        >
          <HelpCircle className="w-5 h-5" />
        </Button>
        <Button
          size="icon"
          className="w-12 h-12 rounded-full shadow-lg bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-hover)]"
        >
          <MessageCircle className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}