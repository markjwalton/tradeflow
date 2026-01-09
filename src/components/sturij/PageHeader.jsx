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
            className={`page-header-title ${description ? 'mb-2' : ''}`}
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
          <div className="ml-4 relative z-20">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}