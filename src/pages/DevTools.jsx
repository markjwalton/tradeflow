import React from 'react';
import { DevToolsPanel } from '@/components/dev-tools/DevToolsPanel';
import { PageHeader } from '@/components/sturij';

export default function DevTools() {
  return (
    <div className="max-w-7xl mx-auto -mt-6 bg-background min-h-screen">
      <PageHeader 
        title="Development Tools"
        description="Tools for development, testing, and debugging"
      />
      
      <DevToolsPanel />
    </div>
  );
}