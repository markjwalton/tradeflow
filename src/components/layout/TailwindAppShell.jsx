import { useState, useMemo, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import TailwindTopNav from '../sturij/TailwindTopNav';
import TailwindNavigation from '../sturij/TailwindNavigation';
import TailwindMobileDrawer from '../sturij/TailwindMobileDrawer';
import TailwindFooter from '../sturij/TailwindFooter';
import TailwindBreadcrumb from '../sturij/TailwindBreadcrumb';
import { getIconByName } from '../navigation/NavIconMap';

// Breadcrumb context for child components
const BreadcrumbContext = createContext(null);
export const useBreadcrumb = () => useContext(BreadcrumbContext);

/**
 * TailwindAppShell - Unified application shell using Tailwind UI patterns
 * Replaces the previous AppShell with consistent Tailwind-based navigation
 */
export function TailwindAppShell({ 
  children, 
  user, 
  tenant, 
  navItems = [], 
  currentPageName,
  onEditorToggle 
}) {
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState('expanded'); // 'expanded', 'icons', 'hidden'
  const [searchQuery, setSearchQuery] = useState('');

  // Transform navItems to format expected by Tailwind components
  const transformedNavigation = useMemo(() => {
    const buildNavTree = (items, parentId = null) => {
      return items
        .filter(item => (item.parent_id || null) === parentId)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(item => {
          const children = buildNavTree(items, item.id);
          const IconComponent = item.icon ? getIconByName(item.icon) : null;
          
          return {
            name: item.name,
            slug: item.slug,
            href: item.slug ? createPageUrl(item.slug) : '#',
            icon: IconComponent,
            current: currentPageName === item.slug,
            children: children.length > 0 ? children : undefined,
          };
        });
    };

    return buildNavTree(navItems);
  }, [navItems, currentPageName]);

  // Search results filtering
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    
    const flattenNav = (items) => {
      let results = [];
      items.forEach(item => {
        if (item.slug && item.name.toLowerCase().includes(query)) {
          results.push(item);
        }
        if (item.children) {
          results = results.concat(flattenNav(item.children));
        }
      });
      return results;
    };

    return flattenNav(transformedNavigation).slice(0, 8);
  }, [transformedNavigation, searchQuery]);

  // User menu items
  const userNavigation = [
    { name: 'Your Profile', href: createPageUrl('SiteSettings') },
    { name: 'Settings', href: createPageUrl('SiteSettings') },
    { 
      name: 'Sign out', 
      href: '#',
      onClick: () => base44.auth.logout()
    },
  ];

  // Handle navigation
  const handleNavigate = (item) => {
    if (item.slug) {
      navigate(createPageUrl(item.slug));
    } else if (item.href && item.href !== '#') {
      navigate(item.href);
    }
  };

  // Toggle sidebar mode
  const handleSidebarToggle = () => {
    setSidebarMode(prev => {
      if (prev === 'expanded') return 'icons';
      if (prev === 'icons') return 'hidden';
      return 'expanded';
    });
  };

  // Format user for components
  const formattedUser = user ? {
    name: user.full_name || user.email,
    email: user.email,
    imageUrl: user.avatar_url
  } : null;

  // Build breadcrumb pages from current navigation path
  const breadcrumbPages = useMemo(() => {
    const findPath = (items, slug, path = []) => {
      for (const item of items) {
        if (item.slug === slug) {
          return [...path, { name: item.name, href: item.href, current: true }];
        }
        if (item.children) {
          const found = findPath(item.children, slug, [...path, { name: item.name, href: item.href }]);
          if (found) return found;
        }
      }
      return null;
    };
    return findPath(transformedNavigation, currentPageName) || [];
  }, [transformedNavigation, currentPageName]);

  return (
    <BreadcrumbContext.Provider value={{ navItems, currentPageName }}>
      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* Top Navigation */}
        <TailwindTopNav
          user={formattedUser}
          userNavigation={userNavigation}
          searchQuery={searchQuery}
          searchResults={searchResults}
          onSearch={setSearchQuery}
          onMobileMenuClick={() => setMobileNavOpen(true)}
          onSidebarToggle={handleSidebarToggle}
          onNotificationClick={() => {}}
        />

        {/* Mobile Navigation Drawer */}
        <TailwindMobileDrawer
          open={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
          navigation={transformedNavigation}
          user={formattedUser}
          onNavigate={handleNavigate}
          onSettings={() => navigate(createPageUrl('SiteSettings'))}
          onLogout={() => base44.auth.logout()}
        />

        {/* Main Content Area with Sidebar */}
        <div className="flex flex-1 overflow-hidden">
          {/* Desktop Sidebar - fixed width */}
          <TailwindNavigation
            navigation={transformedNavigation}
            navigationMode={sidebarMode}
            onNavigate={handleNavigate}
            onEditorToggle={onEditorToggle}
          />

          {/* Page Content - takes remaining space */}
          <main className="flex-1 overflow-y-auto min-w-0">
            {/* Breadcrumb */}
            {breadcrumbPages.length > 0 && (
              <div className="border-b border-gray-200 bg-white px-4 py-3">
                <TailwindBreadcrumb pages={breadcrumbPages} />
              </div>
            )}
            
            <div className="p-4 md:p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>

        {/* Footer - hidden on mobile */}
        <div className="hidden md:block">
          <TailwindFooter 
            copyrightText={`${new Date().getFullYear()} ${tenant?.name || 'Sturij'}. All rights reserved.`}
          />
        </div>
      </div>
    </BreadcrumbContext.Provider>
  );
}

export default TailwindAppShell;