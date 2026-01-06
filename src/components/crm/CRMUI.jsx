import React from 'react';

// Page Header Component for CRM pages
export function CRMPageHeader({ title, description, icon: Icon, actions }) {
  return (
    <div className="border border-[var(--color-border)] rounded-xl px-6 py-4 mb-6 bg-[var(--color-card)]/80">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-[var(--primary-100)]">
              <Icon className="h-5 w-5 text-[var(--primary-600)]" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-[var(--font-family-display)] font-light leading-tight tracking-wide text-[var(--text-primary)]">
              {title}
            </h1>
            {description && (
              <p className="text-[var(--text-muted)] mt-0.5">{description}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

// Card Components for CRM
export function CRMCard({ children, className = '', style = {} }) {
  return (
    <div 
      className={`overflow-hidden shadow-sm rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

export function CRMCardHeader({ children, className = '' }) {
  return (
    <div className={`px-6 py-4 border-b border-[var(--color-border)] ${className}`}>
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