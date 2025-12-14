import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, Users, Settings, ChevronRight, ChevronDown } from 'lucide-react';

export default function NavigationShowcase() {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedNav, setExpandedNav] = useState(true);

  return (
    <div className="space-y-8" data-component="navigationShowcase">
      {/* Breadcrumbs */}
      <div data-element="breadcrumbs">
        <h3 className="text-lg font-medium mb-3">Breadcrumbs</h3>
        <nav className="flex items-center gap-2 text-sm">
          <a href="#" className="text-primary hover:underline">Home</a>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <a href="#" className="text-primary hover:underline">Projects</a>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="text-foreground">Project Alpha</span>
        </nav>
      </div>

      {/* Tabs Navigation */}
      <div data-element="tabs-navigation">
        <h3 className="text-lg font-medium mb-3">Tabs Navigation</h3>
        <div className="flex gap-1 border-b">
          {['overview', 'details', 'settings'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 border-b-2 transition-colors capitalize ${
                activeTab === tab 
                  ? 'border-primary text-primary font-medium' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Sidebar Navigation */}
      <div data-element="sidebar-nav">
        <h3 className="text-lg font-medium mb-3">Sidebar Navigation</h3>
        <div className="w-64 bg-card border rounded-lg p-3">
          <nav className="space-y-1">
            <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-md bg-primary/10 text-primary font-medium">
              <Home className="h-4 w-4" />
              Dashboard
            </a>
            <button 
              onClick={() => setExpandedNav(!expandedNav)}
              className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-md hover:bg-muted text-foreground"
            >
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4" />
                Team
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">3</Badge>
                <ChevronDown className={`h-4 w-4 transition-transform ${expandedNav ? '' : '-rotate-90'}`} />
              </div>
            </button>
            {expandedNav && (
              <div className="ml-7 space-y-1">
                <a href="#" className="block px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-muted">
                  Members
                </a>
                <a href="#" className="block px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-muted">
                  Invitations
                </a>
              </div>
            )}
            <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-muted-foreground">
              <Settings className="h-4 w-4" />
              Settings
            </a>
          </nav>
        </div>
      </div>

      {/* Pagination */}
      <div data-element="pagination">
        <h3 className="text-lg font-medium mb-3">Pagination</h3>
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm">Previous</Button>
          <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">1</Button>
          <Button variant="outline" size="sm">2</Button>
          <Button variant="outline" size="sm">3</Button>
          <span className="px-2 text-muted-foreground">...</span>
          <Button variant="outline" size="sm">10</Button>
          <Button variant="outline" size="sm">Next</Button>
        </div>
      </div>
    </div>
  );
}