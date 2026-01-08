import React from 'react';
import { AppBreadcrumb } from '@/components/layout/AppBreadcrumb';
import { useBreadcrumb } from '@/components/layout/AppContent';

export function PageHeader({ title, description, children }) {
  const breadcrumbContext = useBreadcrumb();

  return (
    <div className="sticky top-0 z-10 bg-[var(--color-card)]/95 backdrop-blur-sm border-b border-[var(--color-border)] -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 py-4 mb-6">
      {breadcrumbContext?.navItems && (
        <div className="mb-3">
          <AppBreadcrumb 
            navItems={breadcrumbContext.navItems} 
            currentPageName={breadcrumbContext.currentPageName} 
          />
        </div>
      )}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h1 
            className={`text-[var(--text-3xl)] font-[var(--font-family-display)] font-[var(--font-weight-light)] leading-[var(--leading-tight)] tracking-[var(--tracking-airy)] ${description ? '[margin-bottom:var(--spacing-2)]' : ''}`}
            style={{ color: 'var(--text-primary)' }}
          >
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {children && (
          <div className="ml-4">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}