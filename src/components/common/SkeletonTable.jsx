import React from 'react';
import { cn } from '@/lib/utils';

export function SkeletonTableRow() {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-border animate-pulse">
      <div className="h-4 bg-muted rounded w-1/4" />
      <div className="h-4 bg-muted rounded w-1/3" />
      <div className="h-4 bg-muted rounded w-1/5" />
      <div className="h-4 bg-muted rounded w-1/6" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, className }) {
  return (
    <div className={cn("space-y-0", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonTableRow key={i} />
      ))}
    </div>
  );
}