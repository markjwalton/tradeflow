import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, Inbox, Send, Archive, Star, Trash2, 
  Settings, LogOut, Plus, FileText, Tag
} from 'lucide-react';

export default function EmailSidebar({ user, folders, onFolderSelect, selectedFolder, onCompose, onSignOut, isOpen }) {
  return (
    <div className={`${isOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-[var(--color-card)] border-r border-[var(--color-border)] flex flex-col overflow-hidden`}>
      <div className="p-[var(--spacing-4)] border-b border-[var(--color-border)]">
        <div className="flex items-center gap-[var(--spacing-2)] mb-[var(--spacing-4)]">
          <Mail className="h-6 w-6 text-[var(--color-primary)]" />
          <span className="text-xl font-[family-name:var(--font-family-display)] font-semibold text-[var(--color-text-primary)]">Oatmeal</span>
        </div>
        <Button 
          onClick={onCompose}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Compose
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-[var(--spacing-2)]">
        {folders.map((folder) => (
          <button
            key={folder.name}
            onClick={() => onFolderSelect(folder.name)}
            className={`w-full flex items-center justify-between px-[var(--spacing-3)] py-[var(--spacing-2)] rounded-[var(--radius-lg)] transition-colors ${
              selectedFolder === folder.name 
                ? 'bg-[var(--color-muted)] text-[var(--color-primary)]' 
                : 'hover:bg-[var(--color-muted)] text-[var(--color-text-secondary)]'
            }`}
          >
            <div className="flex items-center gap-[var(--spacing-3)]">
              <folder.icon className="h-5 w-5" />
              <span className="text-sm font-[family-name:var(--font-family-display)]">{folder.name}</span>
            </div>
            {folder.count > 0 && (
              <Badge variant="secondary" className="text-xs">
                {folder.count}
              </Badge>
            )}
          </button>
        ))}
      </div>

      <div className="p-[var(--spacing-4)] border-t border-[var(--color-border)]">
        <div className="flex items-center gap-[var(--spacing-3)] mb-[var(--spacing-3)]">
          <div className="h-8 w-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-sm font-medium">
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{user?.email}</p>
          </div>
        </div>
        <div className="flex gap-[var(--spacing-2)]">
          <Button variant="ghost" size="sm" className="flex-1">
            <Settings className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1"
            onClick={onSignOut}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}