import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import TailwindNavigation from '../sturij/TailwindNavigation';
import TailwindTopNav from '../sturij/TailwindTopNav';
import TailwindMobileDrawer from '../sturij/TailwindMobileDrawer';
import TailwindFooter from '../sturij/TailwindFooter';
import TailwindBreadcrumb from '../sturij/TailwindBreadcrumb';
import { 
  LayoutDashboard, Users, FileText, FolderOpen, 
  MessageSquare, Settings, ChevronRight, Home 
} from 'lucide-react';

// CRM-specific navigation
const crmNavigation = [
  { name: 'Dashboard', href: createPageUrl('CRMDashboard'), icon: LayoutDashboard, slug: 'CRMDashboard' },
  { name: 'Customers', href: createPageUrl('CRMCustomers'), icon: Users, slug: 'CRMCustomers' },
  { name: 'Enquiries', href: createPageUrl('CRMEnquiries'), icon: FileText, slug: 'CRMEnquiries' },
  { name: 'Projects', href: createPageUrl('CRMProjects'), icon: FolderOpen, slug: 'CRMProjects' },
  { name: 'Interactions', href: createPageUrl('CRMInteractions'), icon: MessageSquare, slug: 'CRMInteractions' },
  { name: 'Settings', href: createPageUrl('CRMSettings'), icon: Settings, slug: 'CRMSettings' },
];

export function CRMAppShell({ children, currentPage, breadcrumbs = [] }) {
  const [navigationMode, setNavigationMode] = useState('expanded');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Fetch current user
  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  // Build navigation with current state
  const navigation = useMemo(() => {
    return crmNavigation.map(item => ({
      ...item,
      current: item.slug === currentPage,
    }));
  }, [currentPage]);

  // Search through CRM pages
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    const filtered = crmNavigation.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filtered.map(p => ({ name: p.name, slug: p.slug })));
  };

  // User navigation
  const userNavigation = [
    { name: 'Your profile', href: '#' },
    { name: 'Settings', href: createPageUrl('SiteSettings') },
    { name: 'Sign out', href: '#', onClick: () => base44.auth.logout() },
  ];

  const user = currentUser ? {
    name: currentUser.full_name || currentUser.email,
    email: currentUser.email,
    imageUrl: currentUser.avatar_url,
  } : null;

  // Build breadcrumb trail
  const breadcrumbPages = useMemo(() => {
    const trail = [{ name: 'CRM', href: createPageUrl('CRMDashboard'), current: false }];
    breadcrumbs.forEach((crumb, index) => {
      trail.push({
        name: crumb.label,
        href: crumb.href || '#',
        current: index === breadcrumbs.length - 1,
      });
    });
    return trail;
  }, [breadcrumbs]);

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {/* Mobile Navigation Drawer */}
      <TailwindMobileDrawer
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        navigation={navigation}
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
        navigation={navigation.slice(0, 5)}
        userNavigation={userNavigation}
        user={user}
        onSearch={handleSearch}
        searchResults={searchResults}
        searchQuery={searchQuery}
        onMobileMenuClick={() => setMobileNavOpen(true)}
        onSidebarToggle={() => {
          setNavigationMode((prev) => {
            if (prev === 'expanded') return 'icons';
            if (prev === 'icons') return 'hidden';
            return 'expanded';
          });
        }}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        {navigationMode !== 'hidden' && (
          <div className={`hidden md:flex ${navigationMode === 'icons' ? 'w-20' : 'w-64'} flex-col flex-shrink-0`}>
            <TailwindNavigation
              navigation={navigation}
              navigationMode={navigationMode}
              logoSrc="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69274b9c077e61d7cfe78ec7/c94580ddf_sturij-logo.png"
              logoAlt="Sturij"
              onNavigate={(item) => {
                if (item.href && item.href !== '#') {
                  window.location.href = item.href;
                }
              }}
            />
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            <div className="px-4 py-6 sm:px-6 lg:px-8">
              {/* Breadcrumb */}
              {breadcrumbPages.length > 1 && (
                <TailwindBreadcrumb pages={breadcrumbPages} />
              )}
              
              {/* Page Content */}
              <div className={breadcrumbPages.length > 1 ? 'mt-4' : ''}>
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Footer */}
      <TailwindFooter copyrightText="© 2026 Sturij. All rights reserved." />
    </div>
  );
}

// Page Header Component
export function CRMPageHeader({ title, description, icon: Icon, actions }) {
  return (
    <div 
      className="border rounded-xl px-6 py-4 mb-6"
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {Icon && (
            <div 
              className="h-10 w-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--primary-100)' }}
            >
              <Icon className="h-5 w-5" style={{ color: 'var(--primary-600)' }} />
            </div>
          )}
          <div>
            <h1 
              className="text-2xl font-display"
              style={{ color: 'var(--text-primary)' }}
            >
              {title}
            </h1>
            {description && (
              <p className="text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

// Card Components
export function CRMCard({ children, className = '', style = {} }) {
  return (
    <div 
      className={`overflow-hidden shadow-sm rounded-xl ${className}`}
      style={{ backgroundColor: 'var(--card, white)', ...style }}
    >
      {children}
    </div>
  );
}

export function CRMCardHeader({ children, className = '' }) {
  return (
    <div 
      className={`px-6 py-4 border-b ${className}`}
      style={{ borderColor: 'var(--border)' }}
    >
      {children}
    </div>
  );
}

export function CRMCardContent({ children, className = '' }) {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  );
}