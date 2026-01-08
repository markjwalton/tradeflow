import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

export default function EmailFilters({ activeFilters, onRemoveFilter, onClearAll }) {
  if (!activeFilters || activeFilters.length === 0) return null;

  return (
    <div className="bg-[var(--color-muted)] border-b border-[var(--color-border)] p-[var(--spacing-3)]">
      <div className="flex items-center gap-[var(--spacing-2)] flex-wrap">
        <span className="text-sm text-[var(--color-text-muted)]">Filters:</span>
        {activeFilters.map((filter, idx) => (
          <Badge key={idx} variant="secondary" className="gap-1">
            {filter.label}
            <button 
              onClick={() => onRemoveFilter(filter)}
              className="ml-1 hover:bg-black/10 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClearAll}
          className="h-6 text-xs"
        >
          Clear all
        </Button>
      </div>
    </div>
  );
}