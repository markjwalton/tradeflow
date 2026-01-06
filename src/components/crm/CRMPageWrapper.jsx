import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ChevronRight, Home } from 'lucide-react';

export function CRMPageHeader({ 
  title, 
  description, 
  icon: Icon,
  breadcrumbs = [],
  actions 
}) {
  return (
    <div 
      className="border rounded-xl px-6 py-4 mb-6"
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
    >
      {/* Breadcrumb */}
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 text-sm mb-3" aria-label="Breadcrumb">
          <Link 
            to={createPageUrl('CRMDashboard')} 
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Home className="h-4 w-4" />
          </Link>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              {crumb.href ? (
                <Link 
                  to={crumb.href} 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Header */}
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
              style={{ color: 'var(--accent-500, var(--text-primary))' }}
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

export function CRMPageWrapper({ children, className = '' }) {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
}

export function CRMCard({ children, className = '' }) {
  return (
    <div 
      className={`overflow-hidden shadow-sm rounded-xl ${className}`}
      style={{ backgroundColor: 'var(--card, white)' }}
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