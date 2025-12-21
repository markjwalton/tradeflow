import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import TailwindNavigation from '../components/sturij/TailwindNavigation';
import TailwindTopNav from '../components/sturij/TailwindTopNav';
import TailwindMobileDrawer from '../components/sturij/TailwindMobileDrawer';
import TailwindDrawer from '../components/sturij/TailwindDrawer';
import { TailwindCard, TailwindCardWithHeader } from '../components/sturij/TailwindCard';
import TailwindList from '../components/sturij/TailwindList';
import TailwindFooter from '../components/sturij/TailwindFooter';
import TailwindBreadcrumb from '../components/sturij/TailwindBreadcrumb';
import TailwindTabsNav from '../components/sturij/TailwindTabsNav';
import StylesViewer from '../components/sturij/StylesViewer';
import TypographyViewer from '../components/sturij/TypographyViewer';
import SpacingViewer from '../components/sturij/SpacingViewer';
import ShadowsViewer from '../components/sturij/ShadowsViewer';
import RadiiViewer from '../components/sturij/RadiiViewer';
import { TokenApplierProvider, useTokenApplier } from '../components/design-assistant/TokenApplierContext';
import { TokenApplierControls } from '../components/design-assistant/TokenApplierControls';
import { ElementSelector } from '../components/design-assistant/ElementSelector';
import { TopEditorPanel } from '../components/page-builder/TopEditorPanel';
import { EditModeProvider, useEditMode } from '../components/page-builder/EditModeContext';
import { getIconByName } from '../components/navigation/NavIconMap';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  FolderIcon,
  CalendarIcon,
  DocumentDuplicateIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

const CURRENT_PAGE_SLUG = 'TailwindAppShellDemo';

const listItems = [
  { id: 1, name: 'Task 1', description: 'Complete project documentation' },
  { id: 2, name: 'Task 2', description: 'Review code changes' },
  { id: 3, name: 'Task 3', description: 'Update design system' },
];

// Build hierarchical navigation from flat items
function buildNavHierarchy(items) {
  if (!items || items.length === 0) return [];
  
  const itemMap = new Map();
  const roots = [];
  
  // First pass: create map
  items.forEach(item => {
    itemMap.set(item.id, { ...item, children: [] });
  });
  
  // Second pass: build tree
  items.forEach(item => {
    const node = itemMap.get(item.id);
    if (item.parent_id && itemMap.has(item.parent_id)) {
      itemMap.get(item.parent_id).children.push(node);
    } else if (!item.parent_id) {
      roots.push(node);
    }
  });
  
  // Sort by order
  const sortByOrder = (a, b) => (a.order || 0) - (b.order || 0);
  roots.sort(sortByOrder);
  roots.forEach(root => root.children.sort(sortByOrder));
  
  return roots;
}

// Convert NavigationConfig items to component format with icons
function convertToNavFormat(items, currentSlug) {
  return items.map(item => {
    const IconComponent = getIconByName(item.icon);
    const converted = {
      name: item.name,
      href: item.slug ? createPageUrl(item.slug) : '#',
      icon: IconComponent,
      current: item.slug === currentSlug,
    };
    if (item.children && item.children.length > 0) {
      converted.children = item.children.map(child => ({
        name: child.name,
        href: child.slug ? createPageUrl(child.slug) : '#',
        current: child.slug === currentSlug,
      }));
    }
    return converted;
  });
}

function AppShellContent() {
  const { isActive } = useTokenApplier();
  const { selectedElement } = useEditMode();
  const [navigationMode, setNavigationMode] = useState('expanded');
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);
  const [pagePropertiesOpen, setPagePropertiesOpen] = useState(false);
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [topDrawerOpen, setTopDrawerOpen] = useState(false);
  const [bottomDrawerOpen, setBottomDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('colours');
  const [editorOpen, setEditorOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Fetch current user
  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  // Fetch navigation configs
  const { data: navConfigs = [] } = useQuery({
    queryKey: ['navigationConfigs'],
    queryFn: () => base44.entities.NavigationConfig.list(),
  });

  // Fetch UIPage for current page
  const { data: currentPageData } = useQuery({
    queryKey: ['uiPage', CURRENT_PAGE_SLUG],
    queryFn: async () => {
      const pages = await base44.entities.UIPage.filter({ slug: CURRENT_PAGE_SLUG });
      return pages[0] || null;
    },
  });

  // Get main nav (admin_console) and secondary nav (app_pages_source or live_pages_source)
  const mainNavConfig = navConfigs.find(c => c.config_type === 'admin_console');
  const secondaryNavConfig = navConfigs.find(c => c.config_type === 'app_pages_source' || c.config_type === 'live_pages_source');

  // Build navigation hierarchy
  const mainNavigation = useMemo(() => {
    if (!mainNavConfig?.items) return [];
    const hierarchy = buildNavHierarchy(mainNavConfig.items.filter(i => i.is_visible !== false));
    return convertToNavFormat(hierarchy, CURRENT_PAGE_SLUG);
  }, [mainNavConfig]);

  // Build secondary navigation - all pages from live_pages_source
  const secondaryNavigation = useMemo(() => {
    if (!secondaryNavConfig?.items) return [];
    // Get all page items (not folders)
    const allPages = secondaryNavConfig.items
      .filter(i => i.is_visible !== false && i.item_type === 'page')
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .slice(0, 8); // Limit for header
    return allPages.map(item => ({
      name: item.name,
      href: item.slug ? createPageUrl(item.slug) : '#',
      current: item.slug === CURRENT_PAGE_SLUG,
    }));
  }, [secondaryNavConfig]);

  // Search through all pages
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    const allPages = secondaryNavConfig?.items?.filter(i => i.item_type === 'page') || [];
    const filtered = allPages.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.slug?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10);
    setSearchResults(filtered);
  };

  // Build breadcrumb from navigation hierarchy
  const breadcrumbPages = useMemo(() => {
    if (!mainNavConfig?.items) return [];
    const currentItem = mainNavConfig.items.find(i => i.slug === CURRENT_PAGE_SLUG);
    if (!currentItem) return [{ name: 'AppShell Demo', href: '#', current: true }];
    
    const trail = [];
    let item = currentItem;
    while (item) {
      trail.unshift({
        name: item.name,
        href: item.slug ? createPageUrl(item.slug) : '#',
        current: item.slug === CURRENT_PAGE_SLUG,
      });
      item = item.parent_id ? mainNavConfig.items.find(i => i.id === item.parent_id) : null;
    }
    return trail;
  }, [mainNavConfig]);

  // Page title from breadcrumb or UIPage
  const pageTitle = currentPageData?.page_name || breadcrumbPages[breadcrumbPages.length - 1]?.name || 'AppShell Demo';
  const pageDescription = currentPageData?.description || 'Explore the full-featured application shell with customizable navigation, drawers, and layouts.';

  // User navigation with actual links
  const userNavigation = [
    { name: 'Your profile', href: '#', onClick: () => {} },
    { name: 'Settings', href: createPageUrl('SiteSettings'), onClick: () => {} },
    { name: 'Sign out', href: '#', onClick: () => base44.auth.logout() },
  ];

  const user = currentUser ? {
    name: currentUser.full_name || currentUser.email,
    email: currentUser.email,
    imageUrl: currentUser.avatar_url,
  } : null;

  const drawerTabs = [
    { id: 'colours', name: 'Colours', current: activeTab === 'colours' },
    { id: 'typography', name: 'Type', current: activeTab === 'typography' },
    { id: 'spacing', name: 'Spacing', current: activeTab === 'spacing' },
    { id: 'shadows', name: 'Shadows', current: activeTab === 'shadows' },
    { id: 'radii', name: 'Radii', current: activeTab === 'radii' },
  ];

  return (
    <>
      <TopEditorPanel 
        isOpen={editorOpen} 
        onClose={() => setEditorOpen(false)}
        selectedElement={selectedElement}
      />
      <div className="flex flex-col h-screen bg-gray-100" style={{ marginTop: editorOpen ? '120px' : '0', transition: 'margin-top 300ms ease-in-out' }}>
      {/* Mobile Navigation Drawer */}
      <TailwindMobileDrawer
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        navigation={mainNavigation}
        secondaryNavigation={secondaryNavigation}
        user={user}
        onNavigate={(item) => {
          if (item.href && item.href !== '#') {
            window.location.href = item.href;
          }
        }}
        onSettings={() => window.location.href = createPageUrl('SiteSettings')}
        onLogout={() => base44.auth.logout()}
      />

      {/* Top Navigation */}
      <TailwindTopNav
        navigation={secondaryNavigation}
        userNavigation={userNavigation}
        user={user}
        onNotificationClick={() => setTopDrawerOpen(true)}
        onSearch={handleSearch}
        searchResults={searchResults}
        searchQuery={searchQuery}
        onMobileMenuClick={() => setMobileNavOpen(true)}
        onSidebarToggle={() => {
          // Cycle through navigation modes: expanded -> icons -> hidden -> expanded
          setNavigationMode((prev) => {
            if (prev === 'expanded') return 'icons';
            if (prev === 'icons') return 'hidden';
            return 'expanded';
          });
        }}
      />

      {/* Top Drawer - Pushes content */}
      <TailwindDrawer
        open={topDrawerOpen}
        onClose={() => setTopDrawerOpen(false)}
        title="Notifications"
        side="top"
        maxHeight="lg"
        pushContent={true}
      >
        <TailwindList
          items={[
            { id: 1, title: 'New comment', message: 'John commented on your task' },
            { id: 2, title: 'Task completed', message: 'Project milestone reached' },
            { id: 3, title: 'Reminder', message: 'Meeting in 30 minutes' },
          ]}
          renderItem={(item) => (
            <div>
              <h4 className="font-medium text-gray-900">{item.title}</h4>
              <p className="text-sm text-gray-500">{item.message}</p>
            </div>
          )}
        />
      </TailwindDrawer>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        {navigationMode !== 'hidden' && (
          <div className={`hidden md:flex ${navigationMode === 'icons' ? 'w-20' : 'w-64'} flex-col`}>
            <TailwindNavigation
              navigation={mainNavigation}
              navigationMode={navigationMode}
              logoSrc="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69274b9c077e61d7cfe78ec7/c94580ddf_sturij-logo.png"
              logoAlt="Sturij"
              onNavigate={(item) => {
                if (item.href && item.href !== '#') {
                  window.location.href = item.href;
                }
              }}
              onEditorToggle={() => setEditorOpen(!editorOpen)}
            />
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Scrollable Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="px-4 py-6 sm:px-6 lg:px-8">
              {/* Breadcrumb */}
              <TailwindBreadcrumb pages={breadcrumbPages} />

              {/* Page Header */}
              <div className="mt-6 mb-6 border-b border-gray-200 pb-5">
                <div className="sm:flex sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <h1 className="text-2xl font-semibold text-gray-900">{pageTitle}</h1>
                    <p className="mt-1 text-sm text-gray-500">{pageDescription}</p>
                  </div>
                  <div className="mt-4 flex gap-2 sm:ml-4 sm:mt-0">
                    <button
                      onClick={() => setPagePropertiesOpen(true)}
                      className="px-3 py-1 rounded text-sm bg-gray-200 hover:bg-gray-300"
                    >
                      Page Properties
                    </button>
                    <button
                      onClick={() => setNavigationMode('expanded')}
                      className={`px-3 py-1 rounded text-sm ${navigationMode === 'expanded' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
                    >
                      Expanded
                    </button>
                    <button
                      onClick={() => setNavigationMode('icons')}
                      className={`px-3 py-1 rounded text-sm ${navigationMode === 'icons' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
                    >
                      Icons
                    </button>
                    <button
                      onClick={() => setNavigationMode('hidden')}
                      className={`px-3 py-1 rounded text-sm ${navigationMode === 'hidden' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
                    >
                      Hidden
                    </button>
                  </div>
                </div>
              </div>

              {/* Demo Controls */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => setTopDrawerOpen(true)}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                >
                  Open Top Drawer
                </button>
                <button
                  onClick={() => setRightDrawerOpen(true)}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                >
                  Open Right Drawer
                </button>
                <button
                  onClick={() => setBottomDrawerOpen(true)}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                >
                  Open Bottom Drawer
                </button>
                <button
                  onClick={() => setLeftDrawerOpen(true)}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                >
                  Open Left Drawer
                </button>
              </div>

              {/* Cards Grid */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <TailwindCard>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Plain Card</h3>
                  <p className="text-gray-600">This is a simple card with content.</p>
                </TailwindCard>

                <TailwindCardWithHeader title="Card with Header" headerContent={<span className="text-sm text-gray-500">Last updated 2 hours ago</span>}>
                  <p className="text-gray-600">This card has a header section.</p>
                </TailwindCardWithHeader>
              </div>

              {/* List */}
              <div className="mt-8">
                <TailwindCard>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Task List</h3>
                  <TailwindList
                    items={listItems}
                    renderItem={(item) => (
                      <div>
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>
                    )}
                  />
                </TailwindCard>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Footer - Full Width */}
      <TailwindFooter 
        copyrightText="© 2024 Your Company, Inc. All rights reserved."
      />

      {/* Right Drawer with Tabs */}
      {!editorOpen && (
      <div data-token-applier-ui>
        <TailwindDrawer
          open={rightDrawerOpen}
          onClose={() => setRightDrawerOpen(false)}
          title="Design Tokens"
          side="right"
          maxWidth="lg"
          preventBackdropClose={isActive}
        >
          <div data-token-applier-ui>
          <TokenApplierControls />
          <TailwindTabsNav
            key={activeTab}
            tabs={drawerTabs}
            activeTab={activeTab}
            onTabChange={(tab) => setActiveTab(tab.id)}
          />
        </div>
        <div className="mt-6">
          {activeTab === 'colours' ? (
            <StylesViewer />
          ) : activeTab === 'typography' ? (
            <TypographyViewer />
          ) : activeTab === 'spacing' ? (
            <SpacingViewer />
          ) : activeTab === 'shadows' ? (
            <ShadowsViewer />
          ) : activeTab === 'radii' ? (
            <RadiiViewer />
          ) : null}
        </div>
        </TailwindDrawer>
      </div>
      )}

      {/* Left Drawer */}
      <TailwindDrawer
        open={leftDrawerOpen}
        onClose={() => setLeftDrawerOpen(false)}
        title="Filters"
        side="left"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
              <option>All</option>
              <option>Active</option>
              <option>Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Team</label>
            <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
              <option>All Teams</option>
              <option>Engineering</option>
              <option>Design</option>
            </select>
          </div>
        </div>
      </TailwindDrawer>

      {/* Bottom Drawer */}
      <TailwindDrawer
        open={bottomDrawerOpen}
        onClose={() => setBottomDrawerOpen(false)}
        title="Quick Actions"
        side="bottom"
        maxHeight="md"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
            <DocumentDuplicateIcon className="h-6 w-6 mx-auto text-gray-600" />
            <span className="mt-2 block text-sm text-gray-900">New Document</span>
          </button>
          <button className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
            <FolderIcon className="h-6 w-6 mx-auto text-gray-600" />
            <span className="mt-2 block text-sm text-gray-900">New Project</span>
          </button>
          <button className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
            <UsersIcon className="h-6 w-6 mx-auto text-gray-600" />
            <span className="mt-2 block text-sm text-gray-900">Add Member</span>
          </button>
          <button className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
            <CalendarIcon className="h-6 w-6 mx-auto text-gray-600" />
            <span className="mt-2 block text-sm text-gray-900">Schedule</span>
          </button>
        </div>
      </TailwindDrawer>

      {/* Page Properties Drawer */}
      <TailwindDrawer
        open={pagePropertiesOpen}
        onClose={() => setPagePropertiesOpen(false)}
        title="Page Properties"
        side="right"
        maxWidth="md"
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="page-name">Page Name</Label>
            <Input 
              id="page-name" 
              defaultValue={currentPageData?.page_name || pageTitle} 
              placeholder="Enter page name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="page-slug">URL Slug</Label>
            <Input 
              id="page-slug" 
              defaultValue={currentPageData?.slug || CURRENT_PAGE_SLUG} 
              placeholder="page-url-slug"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="page-description">Description</Label>
            <Textarea 
              id="page-description" 
              defaultValue={currentPageData?.description || ''} 
              placeholder="Brief description of this page"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="page-category">Category</Label>
            <Select defaultValue={currentPageData?.category || 'Custom'}>
              <SelectTrigger id="page-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Dashboard">Dashboard</SelectItem>
                <SelectItem value="Form">Form</SelectItem>
                <SelectItem value="Detail">Detail</SelectItem>
                <SelectItem value="List">List</SelectItem>
                <SelectItem value="Custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nav-mode">Default Navigation Mode</Label>
            <Select defaultValue={currentPageData?.navigation_mode || 'expanded'}>
              <SelectTrigger id="nav-mode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expanded">Expanded</SelectItem>
                <SelectItem value="icons">Icons Only</SelectItem>
                <SelectItem value="hidden">Hidden</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <Label>Show Breadcrumb</Label>
              <p className="text-xs text-gray-500">Display breadcrumb navigation</p>
            </div>
            <Switch defaultChecked={currentPageData?.show_breadcrumb ?? true} />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <Label>Include in App Shell</Label>
              <p className="text-xs text-gray-500">Render within the main layout</p>
            </div>
            <Switch defaultChecked={currentPageData?.includes_app_shell ?? true} />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <Label>Enable Pagination</Label>
              <p className="text-xs text-gray-500">Show pagination controls</p>
            </div>
            <Switch defaultChecked={currentPageData?.pagination_enabled ?? false} />
          </div>

          <div className="pt-4 border-t">
            <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500">
              Save Properties
            </button>
          </div>
        </div>
      </TailwindDrawer>
      </div>
    </>
  );
}

export default function TailwindAppShellDemo() {
  return (
    <EditModeProvider>
      <TokenApplierProvider>
        <ElementSelector>
          <AppShellContent />
        </ElementSelector>
      </TokenApplierProvider>
    </EditModeProvider>
  );
}