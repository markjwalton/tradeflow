import React from 'react';
import { DevToolsPanel } from '@/components/dev-tools/DevToolsPanel';

export default function DevTools() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Development Tools</h1>
          <p className="text-muted-foreground">
            Tools for development, testing, and debugging
          </p>
        </div>
        
        <DevToolsPanel />
      </div>
    </div>
  );
}