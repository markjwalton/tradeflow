import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

/**
 * Full page loading spinner
 */
export function PageLoader({ message = 'Loading...' }) {
  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

/**
 * Inline loading spinner
 */
export function InlineLoader({ size = 'sm', className = '' }) {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <Loader2 className={`animate-spin text-muted-foreground ${sizeClasses[size]} ${className}`} />
  );
}

/**
 * Table loading skeleton
 */
export function TableLoader({ rows = 5, columns = 4 }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4 pb-3 border-b">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-10 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Form loading skeleton
 */
export function FormLoader({ fields = 5 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex gap-3 pt-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

/**
 * Stats card skeleton
 */
export function StatsLoader({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card p-6 space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-32" />
        </div>
      ))}
    </div>
  );
}

/**
 * List item skeleton
 */
export function ListItemLoader() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-full max-w-[300px]" />
        <Skeleton className="h-3 w-full max-w-[200px]" />
      </div>
      <Skeleton className="h-8 w-20" />
    </div>
  );
}

/**
 * List skeleton
 */
export function ListLoader({ count = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <ListItemLoader key={i} />
      ))}
    </div>
  );
}

/**
 * Button loading state
 */
export function ButtonLoader({ children, loading, ...props }) {
  return (
    <button disabled={loading} {...props}>
      {loading ? (
        <span className="flex items-center gap-2">
          <InlineLoader size="xs" />
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}