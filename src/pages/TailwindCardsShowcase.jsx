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
        <div className="space-y-8">
          {/* Basic Card */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Basic Card</h3>
              <p className="text-xs text-muted-foreground">Simple card with padding and shadow</p>
            </div>
            
            <div className="overflow-hidden rounded-xl bg-card border border-border shadow-sm">
              <div className="px-4 py-5 sm:p-6">
                <p className="text-sm text-muted-foreground">Content goes here</p>
              </div>
            </div>
          </div>

          {/* Full-width on Mobile */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Full-width Mobile Card</h3>
              <p className="text-xs text-muted-foreground">Full-width on mobile, rounded on desktop</p>
            </div>
            
            <div className="overflow-hidden bg-card border border-border shadow-sm sm:rounded-xl">
              <div className="px-4 py-5 sm:p-6">
                <p className="text-sm text-muted-foreground">Content goes here - full-width on mobile</p>
              </div>
            </div>
          </div>

          {/* Card with Header */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Card with Header</h3>
              <p className="text-xs text-muted-foreground">Divided sections with header and body</p>
            </div>
            
            <div className="divide-y divide-border overflow-hidden rounded-xl bg-card border border-border shadow-sm">
              <div className="px-4 py-5 sm:px-6">
                <h4 className="text-base font-display">Card Header</h4>
                <p className="text-xs text-muted-foreground mt-1">Less vertical padding on headers</p>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <p className="text-sm text-muted-foreground">Body content goes here</p>
              </div>
            </div>
          </div>

          {/* Card with Footer */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Card with Footer</h3>
              <p className="text-xs text-muted-foreground">Body with footer section</p>
            </div>
            
            <div className="divide-y divide-border overflow-hidden rounded-xl bg-card border border-border shadow-sm">
              <div className="px-4 py-5 sm:p-6">
                <p className="text-sm text-muted-foreground">Body content goes here</p>
              </div>
              <div className="px-4 py-4 sm:px-6">
                <p className="text-xs text-muted-foreground">Footer content - less vertical padding</p>
              </div>
            </div>
          </div>

          {/* Card with Header, Body, Footer */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Full Card Structure</h3>
              <p className="text-xs text-muted-foreground">Complete card with all sections</p>
            </div>
            
            <div className="divide-y divide-border overflow-hidden rounded-xl bg-card border border-border shadow-sm">
              <div className="px-4 py-5 sm:px-6">
                <h4 className="text-base font-display">Card Title</h4>
                <p className="text-xs text-muted-foreground mt-1">Card header section</p>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <p className="text-sm text-muted-foreground">Main content area with more padding</p>
              </div>
              <div className="px-4 py-4 sm:px-6">
                <p className="text-xs text-muted-foreground">Footer actions or metadata</p>
              </div>
            </div>
          </div>

          {/* Card with Muted Footer */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Card with Muted Footer</h3>
              <p className="text-xs text-muted-foreground">Footer with alternate background</p>
            </div>
            
            <div className="overflow-hidden rounded-xl bg-card border border-border shadow-sm">
              <div className="px-4 py-5 sm:p-6">
                <p className="text-sm text-muted-foreground">Main content area</p>
              </div>
              <div className="bg-muted px-4 py-4 sm:px-6 border-t border-border">
                <p className="text-xs text-muted-foreground">Muted footer background</p>
              </div>
            </div>
          </div>

          {/* Card with Muted Header */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Card with Muted Header</h3>
              <p className="text-xs text-muted-foreground">Header with alternate background</p>
            </div>
            
            <div className="overflow-hidden rounded-xl bg-card border border-border shadow-sm">
              <div className="px-4 py-5 sm:px-6 border-b border-border">
                <h4 className="text-base font-display">Card Header</h4>
                <p className="text-xs text-muted-foreground mt-1">Less padding on desktop</p>
              </div>
              <div className="bg-muted px-4 py-5 sm:p-6">
                <p className="text-sm text-muted-foreground">Muted body background</p>
              </div>
            </div>
          </div>

          {/* Well Card */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Well Card</h3>
              <p className="text-xs text-muted-foreground">Subtle inset appearance</p>
            </div>
            
            <div className="overflow-hidden rounded-xl bg-muted border border-border">
              <div className="px-4 py-5 sm:p-6">
                <p className="text-sm text-muted-foreground">Well-style card with muted background</p>
              </div>
            </div>
          </div>

          {/* Full-width Well Mobile */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Full-width Well (Mobile)</h3>
              <p className="text-xs text-muted-foreground">Well card that's full-width on mobile</p>
            </div>
            
            <div className="overflow-hidden bg-muted border border-border sm:rounded-xl">
              <div className="px-4 py-5 sm:p-6">
                <p className="text-sm text-muted-foreground">Full-width well on mobile, rounded on desktop</p>
              </div>
            </div>
          </div>
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="Design System Reference" defaultOpen={false}>
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