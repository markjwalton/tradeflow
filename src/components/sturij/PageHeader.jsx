import React from 'react';
import { AppBreadcrumb } from '@/components/layout/AppBreadcrumb';
import { useBreadcrumb } from '@/components/layout/AppContent';

export function PageHeader({ title, description, children }) {
  const breadcrumbContext = useBreadcrumb();

  return (
    <div className="bg-white border [margin-bottom:var(--spacing-6)] px-6 py-4 rounded-xl" style={{ marginTop: 0 }}>
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
          <h1 className={`text-3xl font-display text-[#C78E8E] text-[var(--accent-500)] ${description ? '[margin-bottom:var(--spacing-2)]' : ''}`}>
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