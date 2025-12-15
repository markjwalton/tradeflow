import React from 'react';
import { PageHeader } from '@/components/sturij/PageHeader';
import { ChevronLeft, ChevronRight, ArrowLeft, ArrowRight } from 'lucide-react';

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

      {/* Pagination Variations */}
      <section className="space-y-8 mt-12 pt-8 border-t border-border">
        <div>
          <h2 className="text-xl font-display mb-2">Pagination</h2>
          <p className="text-sm text-muted-foreground">Navigation patterns for paginated content</p>
        </div>

        {/* Numbered Pagination */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Numbered with Results Count</h3>
          <div className="flex items-center justify-between border-t border-border bg-card px-4 py-3 sm:px-6 rounded-b-xl">
            <div className="flex flex-1 justify-between sm:hidden">
              <a href="#" className="relative inline-flex items-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent">
                Previous
              </a>
              <a href="#" className="relative ml-3 inline-flex items-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent">
                Next
              </a>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-medium text-foreground">1</span> to <span className="font-medium text-foreground">10</span> of{' '}
                  <span className="font-medium text-foreground">97</span> results
                </p>
              </div>
              <div>
                <nav aria-label="Pagination" className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                  <a href="#" className="relative inline-flex items-center rounded-l-md px-2 py-2 text-muted-foreground ring-1 ring-inset ring-border hover:bg-accent focus:z-20 focus:outline-offset-0">
                    <span className="sr-only">Previous</span>
                    <ChevronLeft aria-hidden="true" className="h-5 w-5" />
                  </a>
                  <a href="#" aria-current="page" className="relative z-10 inline-flex items-center bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground focus:z-20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                    1
                  </a>
                  <a href="#" className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-foreground ring-1 ring-inset ring-border hover:bg-accent focus:z-20 focus:outline-offset-0">
                    2
                  </a>
                  <a href="#" className="relative hidden items-center px-4 py-2 text-sm font-semibold text-foreground ring-1 ring-inset ring-border hover:bg-accent focus:z-20 focus:outline-offset-0 md:inline-flex">
                    3
                  </a>
                  <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-muted-foreground ring-1 ring-inset ring-border focus:outline-offset-0">
                    ...
                  </span>
                  <a href="#" className="relative hidden items-center px-4 py-2 text-sm font-semibold text-foreground ring-1 ring-inset ring-border hover:bg-accent focus:z-20 focus:outline-offset-0 md:inline-flex">
                    8
                  </a>
                  <a href="#" className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-foreground ring-1 ring-inset ring-border hover:bg-accent focus:z-20 focus:outline-offset-0">
                    9
                  </a>
                  <a href="#" className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-foreground ring-1 ring-inset ring-border hover:bg-accent focus:z-20 focus:outline-offset-0">
                    10
                  </a>
                  <a href="#" className="relative inline-flex items-center rounded-r-md px-2 py-2 text-muted-foreground ring-1 ring-inset ring-border hover:bg-accent focus:z-20 focus:outline-offset-0">
                    <span className="sr-only">Next</span>
                    <ChevronRight aria-hidden="true" className="h-5 w-5" />
                  </a>
                </nav>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Active page: <code className="bg-background px-1 py-0.5 rounded">bg-primary text-primary-foreground</code></li>
              <li>• Default pages: <code className="bg-background px-1 py-0.5 rounded">ring-1 ring-inset ring-border hover:bg-accent</code></li>
              <li>• Icons: Lucide <code className="bg-background px-1 py-0.5 rounded">ChevronLeft</code> and <code className="bg-background px-1 py-0.5 rounded">ChevronRight</code></li>
            </ul>
          </div>
        </div>

        {/* Arrow Pagination with Top Border */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Arrow Style with Border Indicators</h3>
          <nav className="flex items-center justify-between border-t border-border px-4 sm:px-0">
            <div className="-mt-px flex w-0 flex-1">
              <a href="#" className="inline-flex items-center border-t-2 border-transparent pt-4 pr-1 text-sm font-medium text-muted-foreground hover:border-border hover:text-foreground">
                <ArrowLeft aria-hidden="true" className="mr-3 h-5 w-5 text-muted-foreground" />
                Previous
              </a>
            </div>
            <div className="hidden md:-mt-px md:flex">
              <a href="#" className="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-muted-foreground hover:border-border hover:text-foreground">
                1
              </a>
              <a href="#" aria-current="page" className="inline-flex items-center border-t-2 border-primary px-4 pt-4 text-sm font-medium text-primary">
                2
              </a>
              <a href="#" className="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-muted-foreground hover:border-border hover:text-foreground">
                3
              </a>
              <span className="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-muted-foreground">
                ...
              </span>
              <a href="#" className="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-muted-foreground hover:border-border hover:text-foreground">
                8
              </a>
              <a href="#" className="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-muted-foreground hover:border-border hover:text-foreground">
                9
              </a>
              <a href="#" className="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-muted-foreground hover:border-border hover:text-foreground">
                10
              </a>
            </div>
            <div className="-mt-px flex w-0 flex-1 justify-end">
              <a href="#" className="inline-flex items-center border-t-2 border-transparent pt-4 pl-1 text-sm font-medium text-muted-foreground hover:border-border hover:text-foreground">
                Next
                <ArrowRight aria-hidden="true" className="ml-3 h-5 w-5 text-muted-foreground" />
              </a>
            </div>
          </nav>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Active indicator: <code className="bg-background px-1 py-0.5 rounded">border-t-2 border-primary text-primary</code></li>
              <li>• Hover state: <code className="bg-background px-1 py-0.5 rounded">hover:border-border hover:text-foreground</code></li>
              <li>• Icons: Lucide <code className="bg-background px-1 py-0.5 rounded">ArrowLeft</code> and <code className="bg-background px-1 py-0.5 rounded">ArrowRight</code></li>
            </ul>
          </div>
        </div>

        {/* Simple Previous/Next */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Simple Previous/Next</h3>
          <nav aria-label="Pagination" className="flex items-center justify-between border-t border-border bg-card px-4 py-3 sm:px-6 rounded-b-xl">
            <div className="hidden sm:block">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">1</span> to <span className="font-medium text-foreground">10</span> of{' '}
                <span className="font-medium text-foreground">20</span> results
              </p>
            </div>
            <div className="flex flex-1 justify-between sm:justify-end">
              <a href="#" className="relative inline-flex items-center rounded-md bg-background px-3 py-2 text-sm font-semibold text-foreground ring-1 ring-inset ring-border hover:bg-accent">
                Previous
              </a>
              <a href="#" className="relative ml-3 inline-flex items-center rounded-md bg-background px-3 py-2 text-sm font-semibold text-foreground ring-1 ring-inset ring-border hover:bg-accent">
                Next
              </a>
            </div>
          </nav>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Buttons: <code className="bg-background px-1 py-0.5 rounded">ring-1 ring-inset ring-border hover:bg-accent</code></li>
              <li>• Text: <code className="bg-background px-1 py-0.5 rounded">text-foreground</code> with <code className="bg-background px-1 py-0.5 rounded">text-muted-foreground</code> for meta</li>
              <li>• Minimal style for simple use cases</li>
            </ul>
          </div>
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