import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Settings, Menu, X } from 'lucide-react';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { AppBreadcrumb } from './AppBreadcrumb';
import { AppFooter } from './AppFooter';
import { cn } from '@/lib/utils';

/**
 * AppShellV2 - Complete application shell with header, sidebar, breadcrumb, footer, and page properties drawer
 * 
 * @param {ReactNode} children - Page content
 * @param {string} pageTitle - Current page title
 * @param {Array} breadcrumbItems - Breadcrumb navigation items
 * @param {Object} user - Current user object
 * @param {Object} tenant - Current tenant object
 * @param {Array} navItems - Navigation menu items
 * @param {string} shellWidth - Max width for the shell ('full', '1400', '1600', '1800')
 * @param {string} contentWidth - Max width for content container ('full', '1200', '1400', '1600')
 * @param {ReactNode} pageProperties - Page properties form/content for right drawer
 */
export function AppShellV2({
  children,
  pageTitle,
  breadcrumbItems = [],
  user,
  tenant,
  navItems = [],
  shellWidth = '1600',
  contentWidth = '1400',
  pageProperties,
  onEditorToggle
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [propertiesOpen, setPropertiesOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const shellMaxWidth = shellWidth === 'full' ? '100%' : `${shellWidth}px`;
  const contentMaxWidth = contentWidth === 'full' ? '100%' : `${contentWidth}px`;

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex">
      {/* Sidebar - Desktop */}
      <aside 
        className={cn(
          "hidden lg:flex flex-col border-r border-[var(--color-border)] bg-[var(--color-card)] transition-all duration-300",
          sidebarOpen ? "w-64" : "w-16"
        )}
      >
        <AppSidebar 
          user={user}
          tenant={tenant}
          navItems={navItems}
          collapsed={!sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <AppSidebar 
            user={user}
            tenant={tenant}
            navItems={navItems}
            collapsed={false}
            onToggle={() => setMobileSidebarOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-card)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--color-card)]/80">
          <div 
            className="mx-auto px-4 sm:px-6 lg:px-8"
            style={{ maxWidth: shellMaxWidth }}
          >
            <AppHeader 
              user={user}
              tenant={tenant}
              onEditorToggle={onEditorToggle}
              leftActions={
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    onClick={() => setMobileSidebarOpen(true)}
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden lg:flex"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </>
              }
              rightActions={
                pageProperties && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setPropertiesOpen(true)}
                    title="Page Properties"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                )
              }
            />
          </div>
        </header>

        {/* Breadcrumb */}
        {breadcrumbItems.length > 0 && (
          <div 
            className="mx-auto px-4 sm:px-6 lg:px-8 py-3 border-b border-[var(--color-border)]"
            style={{ maxWidth: shellMaxWidth, width: '100%' }}
          >
            <AppBreadcrumb items={breadcrumbItems} />
          </div>
        )}

        {/* Page Title */}
        {pageTitle && (
          <div 
            className="mx-auto px-4 sm:px-6 lg:px-8 py-6 border-b border-[var(--color-border)]"
            style={{ maxWidth: shellMaxWidth, width: '100%' }}
          >
            <h1 className="text-[length:var(--text-4xl)] font-[var(--font-family-display)] font-[var(--font-weight-bold)] text-[var(--color-text-primary)] tracking-[var(--tracking-tight)]">
              {pageTitle}
            </h1>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1">
          <div 
            className="mx-auto px-4 sm:px-6 lg:px-8 py-6"
            style={{ maxWidth: contentMaxWidth, width: '100%' }}
          >
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer 
          className="mx-auto px-4 sm:px-6 lg:px-8 border-t border-[var(--color-border)]"
          style={{ maxWidth: shellMaxWidth, width: '100%' }}
        >
          <AppFooter />
        </footer>
      </div>

      {/* Page Properties Drawer */}
      {pageProperties && (
        <Sheet open={propertiesOpen} onOpenChange={setPropertiesOpen}>
          <SheetContent side="right" className="w-full sm:w-96 overflow-y-auto">
            <SheetHeader>
              <div className="flex items-center justify-between">
                <SheetTitle>Page Properties</SheetTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setPropertiesOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </SheetHeader>
            <div className="mt-6">
              {pageProperties}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}