import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Archive, Trash2, Tag, FolderOpen, 
  MailOpen, Mail, Clock 
} from 'lucide-react';

export default function EmailToolbar({ selectedCount, onSelectAll, onArchive, onDelete, onMarkRead, onMarkUnread }) {
  return (
    <div className="bg-[var(--color-card)] border-b border-[var(--color-border)] p-[var(--spacing-3)] flex items-center gap-[var(--spacing-2)]">
      <Checkbox 
        checked={selectedCount > 0}
        onCheckedChange={onSelectAll}
      />
      {selectedCount > 0 && (
        <>
          <span className="text-sm text-[var(--color-text-muted)]">{selectedCount} selected</span>
          <div className="h-4 w-px bg-[var(--color-border)]" />
          <Button variant="ghost" size="sm" onClick={onArchive}>
            <Archive className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onMarkRead}>
            <MailOpen className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onMarkUnread}>
            <Mail className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Tag className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <FolderOpen className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
}