import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, Trash2, Archive, Globe, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function BulkActionsBar({ 
  selectedCount, 
  onPublish, 
  onArchive, 
  onDelete, 
  onClear 
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-card border shadow-lg rounded-lg px-4 py-3 flex items-center gap-4">
        <Badge variant="secondary" className="text-sm">
          {selectedCount} selected
        </Badge>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm">
                Bulk Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={onPublish}>
                <Globe className="h-4 w-4 mr-2" />
                Publish Selected
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onArchive}>
                <Archive className="h-4 w-4 mr-2" />
                Archive Selected
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={onDelete}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button size="sm" variant="ghost" onClick={onClear}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}