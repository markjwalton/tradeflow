import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { 
  Mail, Inbox, Send, Archive, Star, Trash2, Search, 
  Menu, Settings, LogOut, Paperclip, MoreVertical,
  ChevronLeft, Plus, Loader2, AlertCircle
} from 'lucide-react';

export default function OatmealInbox({ user, onSignOut }) {
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState('INBOX');
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeMessage, setComposeMessage] = useState('');
  const [sending, setSending] = useState(false);

  const folders = [
    { name: 'Inbox', icon: Inbox, id: 'INBOX' },
    { name: 'Starred', icon: Star, id: 'STARRED' },
    { name: 'Sent', icon: Send, id: 'SENT' },
    { name: 'Trash', icon: Trash2, id: 'TRASH' },
  ];

  useEffect(() => {
    loadEmails();
  }, [selectedFolder]);

  const loadEmails = async () => {
    try {
      setLoading(true);
      const { data } = await base44.functions.invoke('gmailListMessages', {
        folder: selectedFolder,
        maxResults: 50
      });

      if (data.needsAuth) {
        setNeedsAuth(true);
      } else {
        setEmails(data.messages || []);
        setNeedsAuth(false);
      }
    } catch (error) {
      console.error('Failed to load emails:', error);
      if (error.response?.data?.needsAuth) {
        setNeedsAuth(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const connectGmail = async () => {
    try {
      const { data } = await base44.functions.invoke('gmailAuth', {});
      
      if (data.error) {
        console.error('Auth error:', data.error);
        return;
      }
      
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      const popup = window.open(
        data.authUrl, 
        'Gmail Auth', 
        `width=${width},height=${height},left=${left},top=${top}`
      );
      
      if (!popup) {
        alert('Please allow popups for this site to connect Gmail');
        return;
      }
      
      const handleMessage = (event) => {
        if (event.data?.type === 'gmail-auth-success') {
          window.removeEventListener('message', handleMessage);
          setNeedsAuth(false);
          loadEmails();
        }
      };
      
      window.addEventListener('message', handleMessage);
      
      // Fallback: check if popup was closed without success
      const checkPopup = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopup);
          window.removeEventListener('message', handleMessage);
          // Try loading emails in case auth completed
          loadEmails();
        }
      }, 1000);
    } catch (error) {
      console.error('Failed to connect Gmail:', error);
      alert('Failed to connect Gmail: ' + error.message);
    }
  };

  const handleSendEmail = async () => {
    if (!composeTo || !composeSubject || !composeMessage) return;
    
    try {
      setSending(true);
      await base44.functions.invoke('gmailSendMessage', {
        to: composeTo,
        subject: composeSubject,
        message: composeMessage
      });
      
      setShowCompose(false);
      setComposeTo('');
      setComposeSubject('');
      setComposeMessage('');
      loadEmails();
    } catch (error) {
      console.error('Failed to send email:', error);
    } finally {
      setSending(false);
    }
  };

  const formatEmailTime = (date) => {
    const emailDate = new Date(date);
    const now = new Date();
    const diffMs = now - emailDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return emailDate.toLocaleDateString();
  };

  const parseEmailAddress = (fromField) => {
    const match = fromField?.match(/(.*?)\s*<(.+?)>/);
    if (match) return { name: match[1].trim(), email: match[2] };
    return { name: fromField, email: fromField };
  };

  if (needsAuth) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F5F1E8]">
        <Card className="p-8 max-w-md text-center">
          <Mail className="h-16 w-16 text-[#8B7355] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#2C2416] mb-2">Connect Your Gmail</h2>
          <p className="text-[#6B5744] mb-6">
            To access your emails, please connect your Gmail account.
          </p>
          <Button 
            onClick={connectGmail}
            className="bg-[#2C2416] text-white hover:bg-[#3E3420]"
          >
            Connect Gmail
          </Button>
        </Card>
      </div>
    );
  }

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
              key={folder.id}
              onClick={() => setSelectedFolder(folder.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#F5F1E8] transition-colors group ${
                selectedFolder === folder.id ? 'bg-[#F5F1E8]' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <folder.icon className="h-5 w-5 text-[#6B5744]" />
                <span className="text-sm text-[#2C2416]">{folder.name}</span>
              </div>
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
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-[#6B5744]" />
              </div>
            ) : emails.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center p-4">
                <Mail className="h-12 w-12 text-[#E5DCC9] mb-2" />
                <p className="text-sm text-[#6B5744]">No emails in this folder</p>
              </div>
            ) : (
              emails.map((email) => {
                const { name, email: emailAddr } = parseEmailAddress(email.from);
                return (
                  <div
                    key={email.id}
                    onClick={() => setSelectedEmail(email)}
                    className={`p-4 border-b border-[#E5DCC9] cursor-pointer hover:bg-[#F5F1E8] transition-colors ${
                      !email.isRead ? 'bg-[#FDFBF8]' : ''
                    } ${selectedEmail?.id === email.id ? 'bg-[#F5F1E8]' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className={`font-medium text-sm ${!email.isRead ? 'text-[#2C2416]' : 'text-[#6B5744]'}`}>
                        {name}
                      </span>
                      <div className="flex items-center gap-2">
                        {email.isStarred && <Star className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]" />}
                        <span className="text-xs text-[#6B5744]">{formatEmailTime(email.date)}</span>
                      </div>
                    </div>
                    <p className={`text-sm mb-1 ${!email.isRead ? 'font-medium text-[#2C2416]' : 'text-[#6B5744]'}`}>
                      {email.subject}
                    </p>
                    <p className="text-xs text-[#6B5744] line-clamp-1">{email.snippet}</p>
                  </div>
                );
              })
            )}
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
                        {selectedEmail.from}
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
                  <p className="text-[#2C2416] leading-relaxed whitespace-pre-wrap">
                    {selectedEmail.body ? atob(selectedEmail.body.replace(/-/g, '+').replace(/_/g, '/')) : selectedEmail.snippet}
                  </p>
                </div>
              </div>

              <div className="p-4 border-t border-[#E5DCC9]">
                <Button 
                  onClick={() => {
                    const { email } = parseEmailAddress(selectedEmail.from);
                    setComposeTo(email);
                    setComposeSubject(`Re: ${selectedEmail.subject}`);
                    setShowCompose(true);
                  }}
                  className="bg-[#2C2416] text-white hover:bg-[#3E3420]"
                >
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
              <Input 
                placeholder="To" 
                className="border-[#E5DCC9]"
                value={composeTo}
                onChange={(e) => setComposeTo(e.target.value)}
              />
              <Input 
                placeholder="Subject" 
                className="border-[#E5DCC9]"
                value={composeSubject}
                onChange={(e) => setComposeSubject(e.target.value)}
              />
              <Textarea 
                placeholder="Write your message..." 
                className="min-h-[200px] border-[#E5DCC9]"
                value={composeMessage}
                onChange={(e) => setComposeMessage(e.target.value)}
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
                  onClick={() => {
                    setShowCompose(false);
                    setComposeTo('');
                    setComposeSubject('');
                    setComposeMessage('');
                  }}
                  className="border-[#E5DCC9]"
                  disabled={sending}
                >
                  Cancel
                </Button>
                <Button 
                  className="bg-[#2C2416] text-white hover:bg-[#3E3420]"
                  onClick={handleSendEmail}
                  disabled={sending || !composeTo || !composeSubject}
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
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