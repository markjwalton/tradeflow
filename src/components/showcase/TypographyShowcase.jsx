import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Plus, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function TypographyShowcase() {
  const [currentFonts, setCurrentFonts] = useState({ heading: null, body: null });
  
  useEffect(() => {
    const loadCurrentFonts = async () => {
      try {
        const user = await base44.auth.me();
        if (user?.theme_fonts) {
          setCurrentFonts({
            heading: user.theme_fonts.heading,
            body: user.theme_fonts.body
          });
        } else {
          // Default fonts from globals.css
          setCurrentFonts({
            heading: { name: 'Degular Display', font_family: 'degular-display, sans-serif', source: 'adobe' },
            body: { name: 'Mrs Eaves XL Serif', font_family: 'mrs-eaves-xl-serif-narrow, serif', source: 'adobe' }
          });
        }
      } catch (e) {
        // Not logged in or error - show defaults
        setCurrentFonts({
          heading: { name: 'Degular Display', font_family: 'degular-display, sans-serif', source: 'adobe' },
          body: { name: 'Mrs Eaves XL Serif', font_family: 'mrs-eaves-xl-serif-narrow, serif', source: 'adobe' }
        });
      }
    };
    loadCurrentFonts();
  }, []);

  return (
    <div className="space-y-6" data-component="typographyShowcase">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-display mb-2">Typography System</h3>
          <p className="text-sm text-muted-foreground">
            {currentFonts.heading?.name || 'Degular Display'} (Headings) • {currentFonts.body?.name || 'Mrs Eaves XL Serif'} (Body)
          </p>
        </div>
        <Link to={createPageUrl('FontManager')}>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Manage Fonts
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="headings" className="w-full">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="headings">Headings</TabsTrigger>
          <TabsTrigger value="weights">Weights</TabsTrigger>
          <TabsTrigger value="sizes">Sizes</TabsTrigger>
          <TabsTrigger value="body">Body Text</TabsTrigger>
          <TabsTrigger value="utilities">Utility Classes</TabsTrigger>
          <TabsTrigger value="fonts">Font Preview</TabsTrigger>
          <TabsTrigger value="colors">Text Colors</TabsTrigger>
          <TabsTrigger value="code">Code & Mono</TabsTrigger>
        </TabsList>

        <TabsContent value="headings" className="mt-6 space-y-6" data-element="typography-examples">
          <div className="space-y-4">
            <div className="flex items-baseline gap-4 border-b pb-3">
              <div className="w-24 text-xs text-muted-foreground">Page Title</div>
              <h1 className="flex-1 !text-3xl font-display font-light">The quick brown fox jumps over the lazy dog</h1>
              <code className="text-xs text-muted-foreground whitespace-nowrap">text-3xl</code>
            </div>
            <div className="flex items-baseline gap-4 border-b pb-3">
              <div className="w-24 text-xs text-muted-foreground">H1</div>
              <h1 className="flex-1 !text-2xl font-display font-light">The quick brown fox jumps over the lazy dog</h1>
              <code className="text-xs text-muted-foreground whitespace-nowrap">text-2xl</code>
            </div>
            <div className="flex items-baseline gap-4 border-b pb-3">
              <div className="w-24 text-xs text-muted-foreground">H2</div>
              <h2 className="flex-1 !text-xl font-display font-light">The quick brown fox jumps over the lazy dog</h2>
              <code className="text-xs text-muted-foreground whitespace-nowrap">text-xl</code>
            </div>
            <div className="flex items-baseline gap-4 border-b pb-3">
              <div className="w-24 text-xs text-muted-foreground">H3</div>
              <h3 className="flex-1 !text-lg font-display font-normal">The quick brown fox jumps over the lazy dog</h3>
              <code className="text-xs text-muted-foreground whitespace-nowrap">text-lg</code>
            </div>
            <div className="flex items-baseline gap-4 border-b pb-3">
              <div className="w-24 text-xs text-muted-foreground">H4</div>
              <h4 className="flex-1 !text-base font-display font-normal">The quick brown fox jumps over the lazy dog</h4>
              <code className="text-xs text-muted-foreground whitespace-nowrap">text-base</code>
            </div>
            <div className="flex items-baseline gap-4 border-b pb-3">
              <div className="w-24 text-xs text-muted-foreground">H5</div>
              <h5 className="flex-1 !text-sm font-display font-normal">The quick brown fox jumps over the lazy dog</h5>
              <code className="text-xs text-muted-foreground whitespace-nowrap">text-sm</code>
            </div>
            <div className="flex items-baseline gap-4">
              <div className="w-24 text-xs text-muted-foreground">H6</div>
              <h6 className="flex-1 !text-xs font-display font-normal uppercase">THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG</h6>
              <code className="text-xs text-muted-foreground whitespace-nowrap">text-xs</code>
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

        <TabsContent value="sizes" className="mt-6">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">Available size tokens from design system</p>
            {[
              { token: 'text-5xl', value: '3rem', var: '--text-5xl' },
              { token: 'text-4xl', value: '2.25rem', var: '--text-4xl' },
              { token: 'text-3xl', value: '1.875rem', var: '--text-3xl' },
              { token: 'text-2xl', value: '1.5rem', var: '--text-2xl' },
              { token: 'text-xl', value: '1.25rem', var: '--text-xl' },
              { token: 'text-lg', value: '1.125rem', var: '--text-lg' },
              { token: 'text-base', value: '1rem', var: '--text-base' },
              { token: 'text-sm', value: '0.875rem', var: '--text-sm' },
              { token: 'text-xs', value: '0.75rem', var: '--text-xs' }
            ].map(({ token, value, var: cssVar }) => (
              <div key={token} className="flex items-center gap-4 border-b pb-3">
                <div className="w-24">
                  <code className="text-xs text-muted-foreground">{token}</code>
                </div>
                <p className={`flex-1 ${token}`}>
                  The quick brown fox jumps over the lazy dog
                </p>
                <div className="text-right">
                  <code className="text-xs text-muted-foreground block">{value}</code>
                  <code className="text-xs text-muted-foreground/60">{cssVar}</code>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="body" className="mt-6">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-32 text-xs text-muted-foreground">Large (text-lg)</div>
                <p className="text-lg flex-1">
                  The quick brown fox jumps over the lazy dog. This is body text in Mrs Eaves XL Serif, designed for excellent readability.
                </p>
              </div>
            </div>
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center gap-4">
                <div className="w-32 text-xs text-muted-foreground">Base (text-base)</div>
                <p className="flex-1">
                  The quick brown fox jumps over the lazy dog. This is body text in Mrs Eaves XL Serif, designed for excellent readability.
                </p>
              </div>
            </div>
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center gap-4">
                <div className="w-32 text-xs text-muted-foreground">Small (text-sm)</div>
                <p className="text-sm flex-1">
                  The quick brown fox jumps over the lazy dog. This is body text in Mrs Eaves XL Serif, designed for excellent readability.
                </p>
              </div>
            </div>
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center gap-4">
                <div className="w-32 text-xs text-muted-foreground">Extra Small (text-xs)</div>
                <p className="text-xs flex-1">
                  The quick brown fox jumps over the lazy dog. Used for captions and fine print.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="utilities" className="mt-6">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">Semantic utility classes from design system</p>
            <div className="space-y-4">
              <div className="p-4 rounded-lg border bg-card">
                <div className="text-xs text-muted-foreground mb-2">.text-display</div>
                <p className="text-display">The quick brown fox jumps over the lazy dog</p>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <div className="text-xs text-muted-foreground mb-2">.text-headline</div>
                <p className="text-headline">The quick brown fox jumps over the lazy dog</p>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <div className="text-xs text-muted-foreground mb-2">.text-title</div>
                <p className="text-title">The quick brown fox jumps over the lazy dog</p>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <div className="text-xs text-muted-foreground mb-2">.text-subtitle</div>
                <p className="text-subtitle">The quick brown fox jumps over the lazy dog</p>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <div className="text-xs text-muted-foreground mb-2">.text-body</div>
                <p className="text-body">The quick brown fox jumps over the lazy dog. This is a longer paragraph to demonstrate how body text flows and wraps naturally with proper line height and spacing for optimal readability.</p>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <div className="text-xs text-muted-foreground mb-2">.text-caption</div>
                <p className="text-caption">The quick brown fox jumps over the lazy dog</p>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <div className="text-xs text-muted-foreground mb-2">.text-overline</div>
                <p className="text-overline">The quick brown fox jumps over the lazy dog</p>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <div className="text-xs text-muted-foreground mb-2">.brand</div>
                <p className="brand">Sturij</p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="fonts" className="mt-6">
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium mb-4">Heading Font Preview</h4>
              <div className="p-6 rounded-lg border bg-card">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{currentFonts.heading?.name || 'Degular Display'}</div>
                    <code className="text-xs text-muted-foreground">{currentFonts.heading?.font_family || 'degular-display, sans-serif'}</code>
                  </div>
                  <div className="text-xs text-muted-foreground capitalize">{currentFonts.heading?.source || 'adobe'}</div>
                </div>
                <div className="space-y-3" style={{ fontFamily: 'var(--font-family-display)' }}>
                  <p className="text-4xl font-light">The quick brown fox</p>
                  <p className="text-2xl font-normal">The quick brown fox jumps</p>
                  <p className="text-xl font-medium">The quick brown fox jumps over</p>
                  <p className="text-lg font-semibold">The quick brown fox jumps over the lazy dog</p>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-4">Body Font Preview</h4>
              <div className="p-6 rounded-lg border bg-card">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{currentFonts.body?.name || 'Mrs Eaves XL Serif'}</div>
                    <code className="text-xs text-muted-foreground">{currentFonts.body?.font_family || 'mrs-eaves-xl-serif-narrow, serif'}</code>
                  </div>
                  <div className="text-xs text-muted-foreground capitalize">{currentFonts.body?.source || 'adobe'}</div>
                </div>
                <div className="space-y-4" style={{ fontFamily: 'var(--font-family-body)' }}>
                  <p className="text-lg">
                    The quick brown fox jumps over the lazy dog. This font is designed for body text, providing excellent readability across various sizes.
                  </p>
                  <p className="text-base">
                    Typography plays a crucial role in design. The right font choice enhances user experience and conveys the right tone and personality for your brand.
                  </p>
                  <p className="text-sm">
                    Smaller sizes maintain clarity and legibility while preserving the character and elegance of the typeface across different contexts and use cases.
                  </p>
                </div>
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