import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function TypographyShowcase() {
  return (
    <div className="space-y-6" data-component="typographyShowcase">
      <div>
        <h3 className="text-lg font-display mb-2">Typography System</h3>
        <p className="text-sm text-muted-foreground">
          Degular Display (Headings) • Mrs Eaves XL Serif (Body)
        </p>
      </div>

      <Tabs defaultValue="headings" className="w-full">
        <TabsList>
          <TabsTrigger value="headings">Headings</TabsTrigger>
          <TabsTrigger value="weights">Weights</TabsTrigger>
          <TabsTrigger value="body">Body Text</TabsTrigger>
          <TabsTrigger value="colors">Text Colors</TabsTrigger>
          <TabsTrigger value="code">Code & Mono</TabsTrigger>
        </TabsList>

        <TabsContent value="headings" className="mt-6 space-y-6" data-element="typography-examples">
          <div className="space-y-4">
            <div className="flex items-baseline gap-4 border-b pb-3">
              <div className="w-20 text-xs text-muted-foreground">H1</div>
              <h1 className="flex-1 !text-2xl font-display font-light">The quick brown fox jumps over the lazy dog</h1>
              <code className="text-xs text-muted-foreground whitespace-nowrap">1.5rem</code>
            </div>
            <div className="flex items-baseline gap-4 border-b pb-3">
              <div className="w-20 text-xs text-muted-foreground">H2</div>
              <h2 className="flex-1 !text-xl font-display font-light">The quick brown fox jumps over the lazy dog</h2>
              <code className="text-xs text-muted-foreground whitespace-nowrap">1.25rem</code>
            </div>
            <div className="flex items-baseline gap-4 border-b pb-3">
              <div className="w-20 text-xs text-muted-foreground">H3</div>
              <h3 className="flex-1 !text-lg font-display font-normal">The quick brown fox jumps over the lazy dog</h3>
              <code className="text-xs text-muted-foreground whitespace-nowrap">1.125rem</code>
            </div>
            <div className="flex items-baseline gap-4 border-b pb-3">
              <div className="w-20 text-xs text-muted-foreground">H4</div>
              <h4 className="flex-1 !text-base font-display font-normal">The quick brown fox jumps over the lazy dog</h4>
              <code className="text-xs text-muted-foreground whitespace-nowrap">1rem</code>
            </div>
            <div className="flex items-baseline gap-4 border-b pb-3">
              <div className="w-20 text-xs text-muted-foreground">H5</div>
              <h5 className="flex-1 !text-sm font-display font-normal">The quick brown fox jumps over the lazy dog</h5>
              <code className="text-xs text-muted-foreground whitespace-nowrap">0.875rem</code>
            </div>
            <div className="flex items-baseline gap-4">
              <div className="w-20 text-xs text-muted-foreground">H6</div>
              <h6 className="flex-1 !text-xs font-display font-normal uppercase">THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG</h6>
              <code className="text-xs text-muted-foreground whitespace-nowrap">0.75rem</code>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="weights" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4 border-b pb-3">
              <div className="w-32 text-xs text-muted-foreground">Light (300)</div>
              <p className="font-light font-display flex-1 text-xl">The quick brown fox jumps over the lazy dog</p>
            </div>
            <div className="flex items-center gap-4 border-b pb-3">
              <div className="w-32 text-xs text-muted-foreground">Normal (400)</div>
              <p className="font-normal font-display flex-1 text-xl">The quick brown fox jumps over the lazy dog</p>
            </div>
            <div className="flex items-center gap-4 border-b pb-3">
              <div className="w-32 text-xs text-muted-foreground">Medium (500)</div>
              <p className="font-medium font-display flex-1 text-xl">The quick brown fox jumps over the lazy dog</p>
            </div>
            <div className="flex items-center gap-4 border-b pb-3">
              <div className="w-32 text-xs text-muted-foreground">Semibold (600)</div>
              <p className="font-semibold font-display flex-1 text-xl">The quick brown fox jumps over the lazy dog</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32 text-xs text-muted-foreground">Bold (700)</div>
              <p className="font-bold font-display flex-1 text-xl">The quick brown fox jumps over the lazy dog</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="body" className="mt-6">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-32 text-xs text-muted-foreground">Large (1.125rem)</div>
                <p className="text-lg flex-1">
                  The quick brown fox jumps over the lazy dog. This is body text in Mrs Eaves XL Serif, designed for excellent readability.
                </p>
              </div>
            </div>
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center gap-4">
                <div className="w-32 text-xs text-muted-foreground">Base (1rem)</div>
                <p className="flex-1">
                  The quick brown fox jumps over the lazy dog. This is body text in Mrs Eaves XL Serif, designed for excellent readability.
                </p>
              </div>
            </div>
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center gap-4">
                <div className="w-32 text-xs text-muted-foreground">Small (0.875rem)</div>
                <p className="text-sm flex-1">
                  The quick brown fox jumps over the lazy dog. This is body text in Mrs Eaves XL Serif, designed for excellent readability.
                </p>
              </div>
            </div>
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center gap-4">
                <div className="w-32 text-xs text-muted-foreground">Extra Small (0.75rem)</div>
                <p className="text-xs flex-1">
                  The quick brown fox jumps over the lazy dog. Used for captions and fine print.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="colors" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg bg-background border">
              <p className="text-[var(--text-primary)] mb-1">Primary text color</p>
              <code className="text-xs text-muted-foreground">var(--text-primary)</code>
            </div>
            <div className="p-4 rounded-lg bg-background border">
              <p className="text-[var(--text-secondary)] mb-1">Secondary text color</p>
              <code className="text-xs text-muted-foreground">var(--text-secondary)</code>
            </div>
            <div className="p-4 rounded-lg bg-background border">
              <p className="text-[var(--text-body)] mb-1">Body text color</p>
              <code className="text-xs text-muted-foreground">var(--text-body)</code>
            </div>
            <div className="p-4 rounded-lg bg-background border">
              <p className="text-[var(--text-muted)] mb-1">Muted text color</p>
              <code className="text-xs text-muted-foreground">var(--text-muted)</code>
            </div>
            <div className="p-4 rounded-lg bg-background border">
              <p className="text-[var(--text-subtle)] mb-1">Subtle text color</p>
              <code className="text-xs text-muted-foreground">var(--text-subtle)</code>
            </div>
            <div className="p-4 rounded-lg bg-background border">
              <p className="text-[var(--text-accent)] mb-1">Accent text color</p>
              <code className="text-xs text-muted-foreground">var(--text-accent)</code>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="code" className="mt-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Inline code:</p>
              <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                const example = "inline code";
              </code>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">Code block:</p>
              <pre className="p-4 bg-muted rounded text-sm font-mono overflow-x-auto">
{`function example() {
  const message = "Code block example";
  return message;
}`}
              </pre>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}