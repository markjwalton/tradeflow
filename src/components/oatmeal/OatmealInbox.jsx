import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Mail, Inbox, Send, Archive, Star, Trash2, Search, 
  Menu, Settings, LogOut, Paperclip, MoreVertical,
  ChevronLeft, Plus
} from 'lucide-react';

export default function OatmealInbox({ user, onSignOut }) {
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Mock email data
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
      labels: ['work']
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
      labels: ['important']
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
  ];

  const folders = [
    { name: 'Inbox', icon: Inbox, count: 12 },
    { name: 'Starred', icon: Star, count: 3 },
    { name: 'Sent', icon: Send, count: 0 },
    { name: 'Archive', icon: Archive, count: 156 },
    { name: 'Trash', icon: Trash2, count: 8 },
  ];

  return (
    <div className="h-screen flex bg-[#F5F1E8] overflow-hidden">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-white border-r border-[#E5DCC9] flex flex-col overflow-hidden`}>
        <div className="p-4 border-b border-[#E5DCC9]">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="h-6 w-6 text-[#8B7355]" />
            <span className="text-xl font-bold text-[#2C2416]">Oatmeal</span>
          </div>
          <Button 
            onClick={() => setShowCompose(true)}
            className="w-full bg-[#2C2416] text-white hover:bg-[#3E3420]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Compose
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {folders.map((folder) => (
            <button
              key={folder.name}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#F5F1E8] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <folder.icon className="h-5 w-5 text-[#6B5744]" />
                <span className="text-sm text-[#2C2416]">{folder.name}</span>
              </div>
              {folder.count > 0 && (
                <Badge variant="secondary" className="text-xs bg-[#E5DCC9] text-[#2C2416]">
                  {folder.count}
                </Badge>
              )}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-[#E5DCC9]">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-full bg-[#8B7355] flex items-center justify-center text-white text-sm font-medium">
              {user.email[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#2C2416] truncate">{user.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="flex-1 text-[#6B5744]">
              <Settings className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-1 text-[#6B5744]"
              onClick={onSignOut}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-[#E5DCC9] p-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B5744]" />
                <Input
                  placeholder="Search emails..."
                  className="pl-10 bg-[#F5F1E8] border-[#E5DCC9]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Email List & Reader */}
        <div className="flex-1 flex overflow-hidden">
          {/* Email List */}
          <div className={`${selectedEmail ? 'w-80' : 'flex-1'} border-r border-[#E5DCC9] overflow-y-auto bg-white`}>
            {emails.map((email) => (
              <div
                key={email.id}
                onClick={() => setSelectedEmail(email)}
                className={`p-4 border-b border-[#E5DCC9] cursor-pointer hover:bg-[#F5F1E8] transition-colors ${
                  email.unread ? 'bg-[#FDFBF8]' : ''
                } ${selectedEmail?.id === email.id ? 'bg-[#F5F1E8]' : ''}`}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className={`font-medium text-sm ${email.unread ? 'text-[#2C2416]' : 'text-[#6B5744]'}`}>
                    {email.from}
                  </span>
                  <div className="flex items-center gap-2">
                    {email.starred && <Star className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]" />}
                    <span className="text-xs text-[#6B5744]">{email.time}</span>
                  </div>
                </div>
                <p className={`text-sm mb-1 ${email.unread ? 'font-medium text-[#2C2416]' : 'text-[#6B5744]'}`}>
                  {email.subject}
                </p>
                <p className="text-xs text-[#6B5744] line-clamp-1">{email.preview}</p>
              </div>
            ))}
          </div>

          {/* Email Reader */}
          {selectedEmail && (
            <div className="flex-1 flex flex-col overflow-hidden bg-white">
              <div className="p-4 border-b border-[#E5DCC9]">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedEmail(null)}
                      className="md:hidden"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div>
                      <h2 className="text-lg font-semibold text-[#2C2416] mb-1">
                        {selectedEmail.subject}
                      </h2>
                      <p className="text-sm text-[#6B5744]">
                        {selectedEmail.from} &lt;{selectedEmail.email}&gt;
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border-[#E5DCC9]">
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </Button>
                  <Button variant="outline" size="sm" className="border-[#E5DCC9]">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                  <Button variant="outline" size="sm" className="border-[#E5DCC9]">
                    <Star className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="prose max-w-none">
                  <p className="text-[#2C2416] leading-relaxed">
                    {selectedEmail.preview}
                  </p>
                  <p className="text-[#2C2416] leading-relaxed mt-4">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
                  </p>
                  <p className="text-[#2C2416] leading-relaxed mt-4">
                    Best regards,<br />
                    {selectedEmail.from}
                  </p>
                </div>
              </div>

              <div className="p-4 border-t border-[#E5DCC9]">
                <Button className="bg-[#2C2416] text-white hover:bg-[#3E3420]">
                  <Send className="h-4 w-4 mr-2" />
                  Reply
                </Button>
              </div>
            </div>
          )}

          {!selectedEmail && (
            <div className="flex-1 flex items-center justify-center bg-white">
              <div className="text-center">
                <Mail className="h-16 w-16 text-[#E5DCC9] mx-auto mb-4" />
                <p className="text-lg text-[#6B5744]">Select an email to read</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-end md:items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl border-[#E5DCC9] max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[#E5DCC9] flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#2C2416]">New Message</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowCompose(false)}
              >
                ✕
              </Button>
            </div>
            <div className="p-4 space-y-3 flex-1 overflow-y-auto">
              <Input placeholder="To" className="border-[#E5DCC9]" />
              <Input placeholder="Subject" className="border-[#E5DCC9]" />
              <Textarea 
                placeholder="Write your message..." 
                className="min-h-[200px] border-[#E5DCC9]"
              />
            </div>
            <div className="p-4 border-t border-[#E5DCC9] flex items-center justify-between">
              <Button variant="outline" size="sm" className="border-[#E5DCC9]">
                <Paperclip className="h-4 w-4 mr-2" />
                Attach
              </Button>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCompose(false)}
                  className="border-[#E5DCC9]"
                >
                  Cancel
                </Button>
                <Button 
                  className="bg-[#2C2416] text-white hover:bg-[#3E3420]"
                  onClick={() => setShowCompose(false)}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}