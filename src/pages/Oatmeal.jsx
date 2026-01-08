import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Inbox, Send, Archive, Star, Trash2, Tag, FileText } from 'lucide-react';
import { toast } from 'sonner';
import EmailSidebar from '@/components/oatmeal/EmailSidebar';
import EmailList from '@/components/oatmeal/EmailList';
import EmailReader from '@/components/oatmeal/EmailReader';
import EmailComposer from '@/components/oatmeal/EmailComposer';
import EmailHeader from '@/components/oatmeal/EmailHeader';
import EmailToolbar from '@/components/oatmeal/EmailToolbar';
import EmailFilters from '@/components/oatmeal/EmailFilters';

export default function Oatmeal() {
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState('Inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState({ email: 'user@example.com' });
  const [selectedCount, setSelectedCount] = useState(0);
  const [activeFilters, setActiveFilters] = useState([]);

  // Mock email data - replace with actual data from backend
  const emails = [
    {
      id: 1,
      from: 'Sarah Chen',
      email: 'sarah@company.com',
      subject: 'Q4 Marketing Review',
      preview: 'Hi team, I wanted to share some insights from our Q4 campaign...',
      time: '10:30 AM',
      unread: true,
      starred: false,
      labels: ['work', 'important']
    },
    {
      id: 2,
      from: 'Alex Morgan',
      email: 'alex@startup.io',
      subject: 'Partnership Opportunity',
      preview: 'I came across your product and think there could be a great synergy...',
      time: '9:15 AM',
      unread: true,
      starred: true,
      labels: ['business']
    },
    {
      id: 3,
      from: 'Newsletter',
      email: 'hello@designnews.com',
      subject: 'Weekly Design Inspiration',
      preview: 'This week: Minimalist web design trends, color theory basics...',
      time: 'Yesterday',
      unread: false,
      starred: false,
      labels: ['newsletter']
    },
    {
      id: 4,
      from: 'Team Updates',
      email: 'updates@company.com',
      subject: 'Sprint Planning for Next Week',
      preview: 'The sprint planning session is scheduled for Monday at 10 AM...',
      time: 'Yesterday',
      unread: false,
      starred: true,
      labels: ['work']
    },
    {
      id: 5,
      from: 'Support Team',
      email: 'support@service.com',
      subject: 'Your Ticket Has Been Resolved',
      preview: 'We are happy to inform you that your support ticket #12345 has been...',
      time: '2 days ago',
      unread: false,
      starred: false,
      labels: ['support']
    },
  ];

  const folders = [
    { name: 'Inbox', icon: Inbox, count: 12 },
    { name: 'Starred', icon: Star, count: 3 },
    { name: 'Sent', icon: Send, count: 24 },
    { name: 'Archive', icon: Archive, count: 156 },
    { name: 'Drafts', icon: FileText, count: 2 },
    { name: 'Trash', icon: Trash2, count: 8 },
  ];

  const handleSendEmail = (emailData) => {
    toast.success('Email sent successfully');
    console.log('Sending email:', emailData);
  };

  const handleSignOut = async () => {
    await base44.auth.logout();
  };

  const handleRefresh = () => {
    toast.success('Emails refreshed');
  };

  return (
    <div className="h-screen flex bg-[var(--color-background)] overflow-hidden">
      <EmailSidebar
        user={user}
        folders={folders}
        onFolderSelect={setSelectedFolder}
        selectedFolder={selectedFolder}
        onCompose={() => setShowCompose(true)}
        onSignOut={handleSignOut}
        isOpen={sidebarOpen}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <EmailHeader
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onRefresh={handleRefresh}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <EmailFilters
          activeFilters={activeFilters}
          onRemoveFilter={(filter) => setActiveFilters(activeFilters.filter(f => f !== filter))}
          onClearAll={() => setActiveFilters([])}
        />

        <EmailToolbar
          selectedCount={selectedCount}
          onSelectAll={() => setSelectedCount(selectedCount > 0 ? 0 : emails.length)}
          onArchive={() => toast.success('Archived')}
          onDelete={() => toast.success('Deleted')}
          onMarkRead={() => toast.success('Marked as read')}
          onMarkUnread={() => toast.success('Marked as unread')}
        />

        <div className="flex-1 flex overflow-hidden">
          <EmailList
            emails={emails}
            selectedEmail={selectedEmail}
            onSelectEmail={setSelectedEmail}
            isCollapsed={!!selectedEmail}
          />

          <EmailReader
            email={selectedEmail}
            onClose={() => setSelectedEmail(null)}
          />
        </div>
      </div>

      {showCompose && (
        <EmailComposer
          onClose={() => setShowCompose(false)}
          onSend={handleSendEmail}
        />
      )}
    </div>
  );
}