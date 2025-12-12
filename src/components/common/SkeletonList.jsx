import React from 'react';
import { cn } from '@/lib/utils';

export function SkeletonListItem() {
  return (
    <div className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border animate-pulse">
      <div className="h-10 w-10 bg-muted rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2" />
      </div>
      <div className="h-8 w-8 bg-muted rounded" />
    </div>
  );
}

export function SkeletonList({ items = 5, className }) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <SkeletonListItem key={i} />
      ))}
    </div>
  );
}