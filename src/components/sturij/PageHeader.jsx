import React from 'react';
import { AppBreadcrumb } from '@/components/layout/AppBreadcrumb';
import { useBreadcrumb } from '@/components/layout/AppContent';

export function PageHeader({ title, description, children }) {
  const breadcrumbContext = useBreadcrumb();

  return (
    <div className="border [margin-bottom:var(--spacing-6)] px-6 py-4 rounded-xl" style={{ marginTop: 0, backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
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