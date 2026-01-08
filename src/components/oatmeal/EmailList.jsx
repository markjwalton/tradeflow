import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';

export default function EmailList({ emails, selectedEmail, onSelectEmail, isCollapsed }) {
  return (
    <div className={`${isCollapsed ? 'w-80' : 'flex-1'} border-r border-[var(--color-border)] overflow-y-auto bg-[var(--color-card)]`}>
      {emails.map((email) => (
        <div
          key={email.id}
          onClick={() => onSelectEmail(email)}
          className={`p-[var(--spacing-4)] border-b border-[var(--color-border)] cursor-pointer hover:bg-[var(--color-muted)] transition-colors ${
            email.unread ? 'bg-[var(--primary-50)]' : ''
          } ${selectedEmail?.id === email.id ? 'bg-[var(--color-muted)]' : ''}`}
        >
          <div className="flex items-start justify-between mb-1">
            <span className={`font-medium text-sm font-[family-name:var(--font-family-display)] ${email.unread ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}`}>
              {email.from}
            </span>
            <div className="flex items-center gap-[var(--spacing-2)]">
              {email.starred && <Star className="h-4 w-4 fill-[var(--color-primary)] text-[var(--color-primary)]" />}
              <span className="text-xs text-[var(--color-text-muted)]">{email.time}</span>
            </div>
          </div>
          <p className={`text-sm mb-1 ${email.unread ? 'font-medium text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}`}>
            {email.subject}
          </p>
          <p className="text-xs text-[var(--color-text-muted)] line-clamp-1">{email.preview}</p>
          {email.labels && email.labels.length > 0 && (
            <div className="flex gap-1 mt-2">
              {email.labels.map(label => (
                <Badge key={label} variant="secondary" className="text-xs">
                  {label}
                </Badge>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}