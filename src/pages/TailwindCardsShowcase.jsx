import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { PageHeader } from '@/components/sturij/PageHeader';
import { Button } from '@/components/ui/button';
import { ShowcaseSection } from '@/components/showcase/ShowcaseSection';

export default function TailwindCardsShowcase() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Card Layouts"
        description="Tailwind UI card patterns converted to use design tokens, proper semantic HTML, and accessibility features."
      >
        <Link to={createPageUrl('TailwindShowcaseGallery')}>
          <Button variant="outline" size="sm">← Back to Gallery</Button>
        </Link>
      </PageHeader>

      <ShowcaseSection title="Card Variants" defaultOpen={true}>
        <div>
          <h2 className="text-xl font-display mb-2">Basic Card</h2>
          <p className="text-sm text-muted-foreground">Simple card with padding and shadow</p>
        </div>
        
        <div className="overflow-hidden rounded-xl bg-card border border-border shadow-sm">
          <div className="px-4 py-5 sm:p-6">
            <p className="text-sm text-muted-foreground">Content goes here</p>
          </div>
        </div>

        <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
          <p className="font-medium">Design Token Mappings:</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Background: <code className="bg-background px-1 py-0.5 rounded">bg-card</code></li>
            <li>• Border: <code className="bg-background px-1 py-0.5 rounded">border-border</code></li>
            <li>• Radius: <code className="bg-background px-1 py-0.5 rounded">rounded-xl</code> (var(--radius-xl))</li>
            <li>• Shadow: <code className="bg-background px-1 py-0.5 rounded">shadow-sm</code> (var(--shadow-sm))</li>
          </ul>
        </div>
      </section>

      {/* Full-width on Mobile */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-display mb-2">Full-width Mobile Card</h2>
          <p className="text-sm text-muted-foreground">Full-width on mobile, rounded on desktop</p>
        </div>
        
        <div className="overflow-hidden bg-card border border-border shadow-sm sm:rounded-xl">
          <div className="px-4 py-5 sm:p-6">
            <p className="text-sm text-muted-foreground">Content goes here - full-width on mobile</p>
          </div>
        </div>

        <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
          <p className="font-medium">Responsive Design:</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Mobile: Full-width, no border radius</li>
            <li>• Desktop: <code className="bg-background px-1 py-0.5 rounded">sm:rounded-xl</code></li>
          </ul>
        </div>
      </section>

      {/* Card with Header */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-display mb-2">Card with Header</h2>
          <p className="text-sm text-muted-foreground">Divided sections with header and body</p>
        </div>
        
        <div className="divide-y divide-border overflow-hidden rounded-xl bg-card border border-border shadow-sm">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-base font-display">Card Header</h3>
            <p className="text-xs text-muted-foreground mt-1">Less vertical padding on headers</p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <p className="text-sm text-muted-foreground">Body content goes here</p>
          </div>
        </div>

        <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
          <p className="font-medium">Design Token Mappings:</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Divider: <code className="bg-background px-1 py-0.5 rounded">divide-border</code> (var(--border))</li>
            <li>• Header padding: <code className="bg-background px-1 py-0.5 rounded">px-4 py-5 sm:px-6</code></li>
            <li>• Body padding: <code className="bg-background px-1 py-0.5 rounded">px-4 py-5 sm:p-6</code></li>
          </ul>
        </div>
      </section>

      {/* Card with Footer */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-display mb-2">Card with Footer</h2>
          <p className="text-sm text-muted-foreground">Body with footer section</p>
        </div>
        
        <div className="divide-y divide-border overflow-hidden rounded-xl bg-card border border-border shadow-sm">
          <div className="px-4 py-5 sm:p-6">
            <p className="text-sm text-muted-foreground">Body content goes here</p>
          </div>
          <div className="px-4 py-4 sm:px-6">
            <p className="text-xs text-muted-foreground">Footer content - less vertical padding</p>
          </div>
        </div>

        <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
          <p className="font-medium">Padding Hierarchy:</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Footer padding: <code className="bg-background px-1 py-0.5 rounded">px-4 py-4 sm:px-6</code></li>
            <li>• Less vertical padding on footers than headers/body</li>
          </ul>
        </div>
      </section>

      {/* Card with Header, Body, Footer */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-display mb-2">Full Card Structure</h2>
          <p className="text-sm text-muted-foreground">Complete card with all sections</p>
        </div>
        
        <div className="divide-y divide-border overflow-hidden rounded-xl bg-card border border-border shadow-sm">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-base font-display">Card Title</h3>
            <p className="text-xs text-muted-foreground mt-1">Card header section</p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <p className="text-sm text-muted-foreground">Main content area with more padding</p>
          </div>
          <div className="px-4 py-4 sm:px-6">
            <p className="text-xs text-muted-foreground">Footer actions or metadata</p>
          </div>
        </div>

        <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
          <p className="font-medium">Complete Structure:</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Header: Less padding on desktop</li>
            <li>• Body: Full padding on all sizes</li>
            <li>• Footer: Least vertical padding</li>
          </ul>
        </div>
      </section>

      {/* Card with Muted Footer */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-display mb-2">Card with Muted Footer</h2>
          <p className="text-sm text-muted-foreground">Footer with alternate background</p>
        </div>
        
        <div className="overflow-hidden rounded-xl bg-card border border-border shadow-sm">
          <div className="px-4 py-5 sm:p-6">
            <p className="text-sm text-muted-foreground">Main content area</p>
          </div>
          <div className="bg-muted px-4 py-4 sm:px-6 border-t border-border">
            <p className="text-xs text-muted-foreground">Muted footer background</p>
          </div>
        </div>

        <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
          <p className="font-medium">Design Token Mappings:</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Footer BG: <code className="bg-background px-1 py-0.5 rounded">bg-muted</code> (var(--muted))</li>
            <li>• Footer Border: <code className="bg-background px-1 py-0.5 rounded">border-t border-border</code></li>
          </ul>
        </div>
      </section>

      {/* Card with Muted Header */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-display mb-2">Card with Muted Header</h2>
          <p className="text-sm text-muted-foreground">Header with alternate background</p>
        </div>
        
        <div className="overflow-hidden rounded-xl bg-card border border-border shadow-sm">
          <div className="px-4 py-5 sm:px-6 border-b border-border">
            <h3 className="text-base font-display">Card Header</h3>
            <p className="text-xs text-muted-foreground mt-1">Less padding on desktop</p>
          </div>
          <div className="bg-muted px-4 py-5 sm:p-6">
            <p className="text-sm text-muted-foreground">Muted body background</p>
          </div>
        </div>

        <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
          <p className="font-medium">Design Token Mappings:</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Body BG: <code className="bg-background px-1 py-0.5 rounded">bg-muted</code> (var(--muted))</li>
            <li>• Header Border: <code className="bg-background px-1 py-0.5 rounded">border-b border-border</code></li>
          </ul>
        </div>
      </section>

      {/* Well Card */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-display mb-2">Well Card</h2>
          <p className="text-sm text-muted-foreground">Subtle inset appearance</p>
        </div>
        
        <div className="overflow-hidden rounded-xl bg-muted border border-border">
          <div className="px-4 py-5 sm:p-6">
            <p className="text-sm text-muted-foreground">Well-style card with muted background</p>
          </div>
        </div>

        <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
          <p className="font-medium">Design Token Mappings:</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Background: <code className="bg-background px-1 py-0.5 rounded">bg-muted</code> (var(--muted))</li>
            <li>• No shadow for subtle inset effect</li>
          </ul>
        </div>
      </section>

      {/* Full-width Well Mobile */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-display mb-2">Full-width Well (Mobile)</h2>
          <p className="text-sm text-muted-foreground">Well card that's full-width on mobile</p>
        </div>
        
        <div className="overflow-hidden bg-muted border border-border sm:rounded-xl">
          <div className="px-4 py-5 sm:p-6">
            <p className="text-sm text-muted-foreground">Full-width well on mobile, rounded on desktop</p>
          </div>
        </div>

        <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
          <p className="font-medium">Responsive Design:</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Mobile: Full-width with no radius</li>
            <li>• Desktop: Rounded with <code className="bg-background px-1 py-0.5 rounded">sm:rounded-xl</code></li>
          </ul>
        </div>
      </section>

      </ShowcaseSection>

      <ShowcaseSection title="Design System Reference" defaultOpen={false}>
        <div>
          <h2 className="text-xl font-display mb-2">Design System Reference</h2>
          <p className="text-sm text-muted-foreground">Complete list of design tokens used in card components</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-border p-4 space-y-2">
            <h3 className="text-sm font-medium">Colors</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• <code className="bg-muted px-1 py-0.5 rounded">bg-card</code></li>
              <li>• <code className="bg-muted px-1 py-0.5 rounded">bg-muted</code></li>
              <li>• <code className="bg-muted px-1 py-0.5 rounded">border-border</code></li>
              <li>• <code className="bg-muted px-1 py-0.5 rounded">divide-border</code></li>
            </ul>
          </div>

          <div className="rounded-lg border border-border p-4 space-y-2">
            <h3 className="text-sm font-medium">Spacing</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Header: <code className="bg-muted px-1 py-0.5 rounded">px-4 py-5 sm:px-6</code></li>
              <li>• Body: <code className="bg-muted px-1 py-0.5 rounded">px-4 py-5 sm:p-6</code></li>
              <li>• Footer: <code className="bg-muted px-1 py-0.5 rounded">px-4 py-4 sm:px-6</code></li>
            </ul>
          </div>

          <div className="rounded-lg border border-border p-4 space-y-2">
            <h3 className="text-sm font-medium">Effects</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Shadow: <code className="bg-muted px-1 py-0.5 rounded">shadow-sm</code></li>
              <li>• Radius: <code className="bg-muted px-1 py-0.5 rounded">rounded-xl</code></li>
              <li>• Overflow: <code className="bg-muted px-1 py-0.5 rounded">overflow-hidden</code></li>
            </ul>
          </div>
        </div>
      </ShowcaseSection>
    </div>
  );
}