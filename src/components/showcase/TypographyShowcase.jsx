import React from 'react';

export default function TypographyShowcase() {
  return (
    <div className="space-y-8" data-component="typographyShowcase">
      <div>
        <h3 className="text-lg font-display mb-2">Typography</h3>
        <p className="text-sm text-muted-foreground">
          Typography system using Degular Display and Mrs Eaves XL Serif
        </p>
      </div>

      <div className="space-y-6" data-element="typography-examples">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Headings</h4>
          <div className="space-y-3">
            <h1 className="font-display">Heading 1 - Display Font</h1>
            <h2 className="font-display">Heading 2 - Display Font</h2>
            <h3 className="font-display">Heading 3 - Display Font</h3>
            <h4 className="font-display">Heading 4 - Display Font</h4>
            <h5 className="font-display">Heading 5 - Display Font</h5>
            <h6 className="font-display">Heading 6 - Display Font</h6>
          </div>
        </div>

        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Body Text</h4>
          <div className="space-y-3">
            <p className="text-lg">
              Large body text - This is a paragraph using the body font (Mrs Eaves XL Serif).
            </p>
            <p>
              Regular body text - This is a paragraph using the body font (Mrs Eaves XL Serif).
              It's designed for excellent readability at various sizes.
            </p>
            <p className="text-sm">
              Small body text - This is a smaller paragraph using the body font.
            </p>
            <p className="text-xs">
              Extra small text - Used for captions and fine print.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Text Colors</h4>
          <div className="space-y-2">
            <p className="text-[var(--text-primary)]">Primary text color</p>
            <p className="text-[var(--text-secondary)]">Secondary text color</p>
            <p className="text-[var(--text-body)]">Body text color</p>
            <p className="text-[var(--text-muted)]">Muted text color</p>
            <p className="text-[var(--text-subtle)]">Subtle text color</p>
            <p className="text-[var(--text-accent)]">Accent text color</p>
          </div>
        </div>

        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Code & Mono</h4>
          <div className="space-y-2">
            <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
              inline code
            </code>
            <pre className="p-4 bg-muted rounded text-sm font-mono overflow-x-auto">
{`function example() {
  return "Code block example";
}`}
            </pre>
          </div>
        </div>

        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Font Weights</h4>
          <div className="space-y-2">
            <p className="font-light">Light weight (300)</p>
            <p className="font-normal">Normal weight (400)</p>
            <p className="font-medium">Medium weight (500)</p>
            <p className="font-semibold">Semibold weight (600)</p>
            <p className="font-bold">Bold weight (700)</p>
          </div>
        </div>
      </div>
    </div>
  );
}