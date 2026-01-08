import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Archive, Trash2, Star, MoreVertical, 
  ChevronLeft, Send, Reply, ReplyAll, Forward, Mail 
} from 'lucide-react';

export default function EmailReader({ email, onClose, onReply }) {
  if (!email) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[var(--color-card)]">
        <div className="text-center">
          <Mail className="h-16 w-16 text-[var(--color-muted)] mx-auto mb-[var(--spacing-4)]" />
          <p className="text-lg text-[var(--color-text-muted)]">Select an email to read</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[var(--color-card)]">
      <div className="p-[var(--spacing-4)] border-b border-[var(--color-border)]">
        <div className="flex items-start justify-between mb-[var(--spacing-4)]">
          <div className="flex items-center gap-[var(--spacing-3)]">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClose}
              className="md:hidden"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-lg font-semibold font-[family-name:var(--font-family-display)] text-[var(--color-text-primary)] mb-1">
                {email.subject}
              </h2>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {email.from} &lt;{email.email}&gt;
              </p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">{email.time}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex gap-[var(--spacing-2)]">
          <Button variant="outline" size="sm">
            <Reply className="h-4 w-4 mr-2" />
            Reply
          </Button>
          <Button variant="outline" size="sm">
            <ReplyAll className="h-4 w-4 mr-2" />
            Reply All
          </Button>
          <Button variant="outline" size="sm">
            <Forward className="h-4 w-4 mr-2" />
            Forward
          </Button>
          <Button variant="outline" size="sm">
            <Archive className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Star className={email.starred ? "fill-[var(--color-primary)] text-[var(--color-primary)]" : ""} />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-[var(--spacing-6)]">
        <div className="prose max-w-none">
          <p className="text-[var(--color-text-primary)] leading-[var(--leading-relaxed)]">
            {email.preview}
          </p>
          <p className="text-[var(--color-text-primary)] leading-[var(--leading-relaxed)] mt-[var(--spacing-4)]">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
          </p>
          <p className="text-[var(--color-text-primary)] leading-[var(--leading-relaxed)] mt-[var(--spacing-4)]">
            Best regards,<br />
            {email.from}
          </p>
        </div>
      </div>
    </div>
  );
}