import React from 'react';

// Page Header Component for CRM pages
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

// Card Components for CRM
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