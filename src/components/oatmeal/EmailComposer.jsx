import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Paperclip, X, Image as ImageIcon, Smile } from 'lucide-react';

export default function EmailComposer({ onClose, onSend, replyTo = null }) {
  const [to, setTo] = useState(replyTo?.email || '');
  const [subject, setSubject] = useState(replyTo ? `Re: ${replyTo.subject}` : '');
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (to && subject && message) {
      onSend({ to, subject, message });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-end md:items-center justify-center p-[var(--spacing-4)] z-[var(--z-modal)]">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-[var(--shadow-xl)]">
        <CardHeader className="border-b border-[var(--color-border)] flex-row items-center justify-between p-[var(--spacing-4)]">
          <CardTitle className="text-lg">New Message</CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-[var(--spacing-4)] space-y-[var(--spacing-3)] flex-1 overflow-y-auto">
          <Input 
            placeholder="To" 
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
          <Input 
            placeholder="Subject" 
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <Textarea 
            placeholder="Write your message..." 
            className="min-h-[200px] resize-none font-[family-name:var(--font-family-body)]"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </CardContent>
        <div className="p-[var(--spacing-4)] border-t border-[var(--color-border)] flex items-center justify-between">
          <div className="flex gap-[var(--spacing-2)]">
            <Button variant="outline" size="sm">
              <Paperclip className="h-4 w-4 mr-2" />
              Attach
            </Button>
            <Button variant="outline" size="sm">
              <ImageIcon className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Smile className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-[var(--spacing-2)]">
            <Button 
              variant="outline" 
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSend}
              disabled={!to || !subject || !message}
            >
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}