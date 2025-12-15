import React from 'react';
import { PageHeader } from '@/components/sturij/PageHeader';

const sampleItems = [
  { id: 1, title: 'First item', description: 'Sample content for demonstration' },
  { id: 2, title: 'Second item', description: 'Sample content for demonstration' },
  { id: 3, title: 'Third item', description: 'Sample content for demonstration' },
];

export default function TailwindListsShowcase() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="List Layouts"
        description="Tailwind UI list patterns converted to use design tokens for consistent styling."
      />

      {/* Simple Divided List */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-display mb-2">Simple Divided List</h2>
          <p className="text-sm text-muted-foreground">Basic divided list with responsive padding</p>
        </div>
        
        <ul role="list" className="divide-y divide-border">
          {sampleItems.map((item) => (
            <li key={item.id} className="px-4 py-4 sm:px-0">
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
            </li>
          ))}
        </ul>

        <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
          <p className="font-medium">Design Token Mappings:</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Divider: <code className="bg-background px-1 py-0.5 rounded">divide-border</code> (var(--border))</li>
            <li>• Padding: <code className="bg-background px-1 py-0.5 rounded">px-4 py-4 sm:px-0</code></li>
          </ul>
        </div>
      </section>

      {/* Bordered Container List */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-display mb-2">Bordered Container List</h2>
          <p className="text-sm text-muted-foreground">List within a bordered container</p>
        </div>
        
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <ul role="list" className="divide-y divide-border">
            {sampleItems.map((item) => (
              <li key={item.id} className="px-6 py-4">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
          <p className="font-medium">Design Token Mappings:</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Container BG: <code className="bg-background px-1 py-0.5 rounded">bg-card</code> (var(--card))</li>
            <li>• Border: <code className="bg-background px-1 py-0.5 rounded">border-border</code> (var(--border))</li>
            <li>• Radius: <code className="bg-background px-1 py-0.5 rounded">rounded-xl</code> (var(--radius-xl))</li>
          </ul>
        </div>
      </section>

      {/* Spaced Card Items */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-display mb-2">Spaced Card Items</h2>
          <p className="text-sm text-muted-foreground">Individual card items with spacing, responsive radius</p>
        </div>
        
        <ul role="list" className="space-y-3">
          {sampleItems.map((item) => (
            <li key={item.id} className="overflow-hidden bg-card px-4 py-4 shadow-sm sm:rounded-xl sm:px-6 border border-border">
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
            </li>
          ))}
        </ul>

        <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
          <p className="font-medium">Design Token Mappings:</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Item BG: <code className="bg-background px-1 py-0.5 rounded">bg-card</code></li>
            <li>• Shadow: <code className="bg-background px-1 py-0.5 rounded">shadow-sm</code> (var(--shadow-sm))</li>
            <li>• Radius: <code className="bg-background px-1 py-0.5 rounded">sm:rounded-xl</code></li>
            <li>• Spacing: <code className="bg-background px-1 py-0.5 rounded">space-y-3</code> (var(--spacing-3))</li>
          </ul>
        </div>
      </section>

      {/* Spaced Rounded Card Items */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-display mb-2">Spaced Rounded Items</h2>
          <p className="text-sm text-muted-foreground">Fully rounded card items with consistent spacing</p>
        </div>
        
        <ul role="list" className="space-y-3">
          {sampleItems.map((item) => (
            <li key={item.id} className="overflow-hidden rounded-xl bg-card px-6 py-4 shadow-sm border border-border">
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
            </li>
          ))}
        </ul>

        <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
          <p className="font-medium">Design Token Mappings:</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Radius: <code className="bg-background px-1 py-0.5 rounded">rounded-xl</code> on all screen sizes</li>
            <li>• Padding: <code className="bg-background px-1 py-0.5 rounded">px-6 py-4</code> consistent</li>
          </ul>
        </div>
      </section>

      {/* Contained Divided List (Responsive) */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-display mb-2">Contained List (Responsive)</h2>
          <p className="text-sm text-muted-foreground">Full-width mobile, rounded desktop container</p>
        </div>
        
        <div className="overflow-hidden bg-card shadow-sm sm:rounded-xl border border-border">
          <ul role="list" className="divide-y divide-border">
            {sampleItems.map((item) => (
              <li key={item.id} className="px-4 py-4 sm:px-6">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
          <p className="font-medium">Responsive Design:</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Mobile: Full-width, no radius</li>
            <li>• Desktop: <code className="bg-background px-1 py-0.5 rounded">sm:rounded-xl</code></li>
            <li>• Padding: <code className="bg-background px-1 py-0.5 rounded">px-4 py-4 sm:px-6</code></li>
          </ul>
        </div>
      </section>

      {/* Contained Divided List (Always Rounded) */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-display mb-2">Contained List (Always Rounded)</h2>
          <p className="text-sm text-muted-foreground">Rounded container on all screen sizes</p>
        </div>
        
        <div className="overflow-hidden rounded-xl bg-card shadow-sm border border-border">
          <ul role="list" className="divide-y divide-border">
            {sampleItems.map((item) => (
              <li key={item.id} className="px-6 py-4">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
          <p className="font-medium">Design Token Mappings:</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Radius: <code className="bg-background px-1 py-0.5 rounded">rounded-xl</code> on all sizes</li>
            <li>• Padding: <code className="bg-background px-1 py-0.5 rounded">px-6 py-4</code> consistent</li>
          </ul>
        </div>
      </section>

      {/* Simple Divided List (No Padding) */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-display mb-2">Simple Divided List (Minimal)</h2>
          <p className="text-sm text-muted-foreground">Clean divided list with vertical padding only</p>
        </div>
        
        <ul role="list" className="divide-y divide-border">
          {sampleItems.map((item) => (
            <li key={item.id} className="py-4">
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
            </li>
          ))}
        </ul>

        <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
          <p className="font-medium">Design Token Mappings:</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Divider: <code className="bg-background px-1 py-0.5 rounded">divide-border</code></li>
            <li>• Padding: <code className="bg-background px-1 py-0.5 rounded">py-4</code> (vertical only)</li>
            <li>• No horizontal padding - edge to edge</li>
          </ul>
        </div>
      </section>

      {/* Token Reference */}
      <section className="space-y-4 mt-12 pt-8 border-t border-border">
        <div>
          <h2 className="text-xl font-display mb-2">Design System Reference</h2>
          <p className="text-sm text-muted-foreground">Complete list of design tokens used in list components</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-border p-4 space-y-2">
            <h3 className="text-sm font-medium">Colors</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• <code className="bg-muted px-1 py-0.5 rounded">bg-card</code> → var(--card)</li>
              <li>• <code className="bg-muted px-1 py-0.5 rounded">border-border</code> → var(--border)</li>
              <li>• <code className="bg-muted px-1 py-0.5 rounded">divide-border</code> → var(--border)</li>
            </ul>
          </div>

          <div className="rounded-lg border border-border p-4 space-y-2">
            <h3 className="text-sm font-medium">Spacing</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• <code className="bg-muted px-1 py-0.5 rounded">space-y-3</code> → var(--spacing-3)</li>
              <li>• <code className="bg-muted px-1 py-0.5 rounded">px-4 py-4</code></li>
              <li>• <code className="bg-muted px-1 py-0.5 rounded">px-6 py-4</code></li>
            </ul>
          </div>

          <div className="rounded-lg border border-border p-4 space-y-2">
            <h3 className="text-sm font-medium">Effects</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• <code className="bg-muted px-1 py-0.5 rounded">shadow-sm</code> → var(--shadow-sm)</li>
              <li>• <code className="bg-muted px-1 py-0.5 rounded">rounded-xl</code> → var(--radius-xl)</li>
              <li>• <code className="bg-muted px-1 py-0.5 rounded">overflow-hidden</code></li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}