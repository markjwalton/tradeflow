import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Menu, RefreshCw, Filter } from 'lucide-react';

export default function EmailHeader({ onToggleSidebar, onRefresh, searchQuery, onSearchChange }) {
  return (
    <div className="bg-[var(--color-card)] border-b border-[var(--color-border)] p-[var(--spacing-4)]">
      <div className="flex items-center gap-[var(--spacing-4)]">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onToggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
            <Input
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Filter className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}