import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Package, Download, FileText, Palette, Code, BookOpen, 
  Sparkles, CheckCircle2, Copy, Eye, Layers, Zap
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/sturij";

export default function SturijPackage() {
  const [copiedSection, setCopiedSection] = useState(null);

  const copyToClipboard = (content, section) => {
    navigator.clipboard.writeText(content);
    setCopiedSection(section);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const packageFiles = [
    {
      name: "globals.css",
      type: "Styles",
      description: "Complete CSS design tokens and utility classes",
      size: "~500 lines"
    },
    {
      name: "designTokens.js",
      type: "Config",
      description: "Exported design tokens for programmatic access",
      size: "~200 lines"
    },
    {
      name: "Components (Sturij)",
      type: "React",
      description: "Pre-built themed components (PageHeader, ContentSection, StatCard, etc.)",
      size: "~15 components"
    },
    {
      name: "Layout.js",
      type: "Layout",
      description: "Reference layout implementation with navigation",
      size: "~400 lines"
    },
    {
      name: "ComponentShowcase.js",
      type: "Demo",
      description: "Interactive showcase of all design tokens and components",
      size: "Full page"
    }
  ];

  const implementationSteps = [
    {
      step: 1,
      title: "Install Dependencies",
      description: "Ensure Base44 project has required packages",
      code: `// Already included in Base44:
- React
- Tailwind CSS
- shadcn/ui components
- Lucide React icons`
    },
    {
      step: 2,
      title: "Add Design Tokens",
      description: "Copy Sturij CSS variables to globals.css",
      code: `// Copy the complete :root {} block from 
// the package's globals.css into your 
// project's globals.css file`
    },
    {
      step: 3,
      title: "Configure Tailwind",
      description: "Extend Tailwind with Sturij utilities",
      code: `// The @layer components and @layer utilities
// are already included in globals.css
// No additional tailwind.config.js changes needed`
    },
    {
      step: 4,
      title: "Import Components",
      description: "Copy Sturij components to your project",
      code: `// Copy components from:
// - components/sturij/
// - components/library/
// Into your Base44 project`
    },
    {
      step: 5,
      title: "Apply to Layout",
      description: "Update your Layout.js to use Sturij tokens",
      code: `// Replace hardcoded colors with:
// - var(--color-primary)
// - var(--color-midnight)
// - var(--color-background)
// etc.`
    }
  ];

  const designTokenDocs = {
    colors: [
      { name: "Primary (Forest Green)", var: "--color-primary", hex: "#4A5D4E" },
      { name: "Secondary (Warm Copper)", var: "--color-secondary", hex: "#D4A574" },
      { name: "Accent (Soft Blush)", var: "--color-accent", hex: "#d9b4a7" },
      { name: "Midnight (Dark Blue-Grey)", var: "--color-midnight", hex: "#1b2a35" },
      { name: "Charcoal", var: "--color-charcoal", hex: "#3b3b3b" },
      { name: "Background", var: "--color-background", hex: "#f5f3ef" },
      { name: "Background Paper", var: "--color-background-paper", hex: "#ffffff" },
    ],
    typography: [
      { name: "Heading Font", var: "--font-heading", value: "Degular Display Light" },
      { name: "Body Font", var: "--font-body", value: "Mrs Eaves XL Serif" },
      { name: "Mono Font", var: "--font-mono", value: "ui-monospace" },
    ],
    spacing: [
      { name: "Base Unit", value: "4px", usage: "All spacing uses 4px grid" },
      { name: "Spacing Scale", value: "1-32", usage: "var(--spacing-4) = 1rem (16px)" },
    ],
    effects: [
      { name: "Border Radius", var: "--radius-lg", value: "8px" },
      { name: "Shadows", var: "--shadow-md", value: "Contextual elevation" },
      { name: "Transitions", var: "--transition-normal", value: "200ms ease" },
    ]
  };

  const usageExamples = [
    {
      title: "Text Colors",
      code: `// CSS Variables
className="text-[var(--color-midnight)]"

// Utility Classes
className="text-midnight"
className="text-primary"
className="text-charcoal"`
    },
    {
      title: "Background Colors",
      code: `// CSS Variables
className="bg-[var(--color-background-paper)]"

// Utility Classes  
className="bg-surface"
className="bg-subtle"
className="bg-primary"`
    },
    {
      title: "Typography",
      code: `// Headings (auto-styled)
<h1>Auto uses Degular Display</h1>

// Utility Classes
className="font-heading"
className="font-body"
className="text-display"`
    },
    {
      title: "Spacing",
      code: `// CSS Variables
padding: var(--spacing-4)

// Utility Classes
className="gap-token-4"
className="p-token-6"`
    },
    {
      title: "Components",
      code: `import { PageHeader } from "@/components/sturij";

<PageHeader 
  icon={Database}
  title="Entity Library"
  description="Manage entities"
  actions={<Button>Add</Button>}
/>`
    },
    {
      title: "Sturij Components",
      code: `// Pre-built themed components
<PageHeader />      // Page titles
<ContentSection />  // Section containers
<StatCard />        // Stat displays
<StatusBadge />     // Status indicators
<FeatureCard />     // Feature cards
<DataRow />         // Data list items`
    }
  ];

  const llmGuidelines = `# Sturij Design System - LLM Implementation Guidelines

## Core Principles

1. **ALWAYS use design tokens** - Never use hardcoded colors like "text-gray-500" or "bg-blue-100"
2. **NO inline styles** - Use CSS variables and utility classes only
3. **Typography consistency** - Headings use font-heading, body uses font-body
4. **Spacing system** - Use 4px grid (var(--spacing-*) or gap-token-*)

## Color Usage Patterns

### Text Colors
- Primary text: text-[var(--color-midnight)]
- Secondary text: text-[var(--color-charcoal)]  
- Muted text: text-muted or text-[var(--color-charcoal)]/70
- Links/Actions: text-[var(--color-primary)]

### Background Colors
- Page background: bg-[var(--color-background)]
- Card/Paper: bg-[var(--color-background-paper)]
- Subtle sections: bg-[var(--color-background-subtle)]
- Muted areas: bg-[var(--color-background-muted)]

### Borders
- Standard: border-[var(--color-background-muted)]
- Accent: border-[var(--color-primary)]

### Interactive States
- Primary button: bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]
- Secondary button: bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)]
- Destructive: text-[var(--color-destructive)]

## Typography Rules

### Headings
- Use semantic tags: <h1>, <h2>, <h3>
- Add font-heading class for display font
- Color: text-[var(--color-midnight)]
- Example: <h1 className="text-2xl font-heading text-[var(--color-midnight)]">

### Body Text
- Default body font is applied automatically
- For emphasis: use font-medium or font-semibold
- Never use inline style={{ fontFamily: ... }}

## Component Patterns

### Page Structure
\`\`\`jsx
<div className="p-6 bg-[var(--color-background)] min-h-screen">
  <h1 className="text-2xl font-heading text-[var(--color-midnight)] mb-6">
    Page Title
  </h1>
  {/* Content */}
</div>
\`\`\`

### Cards
\`\`\`jsx
<Card className="border-[var(--color-background-muted)]">
  <CardHeader>
    <CardTitle className="text-[var(--color-midnight)]">Title</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
\`\`\`

### Buttons
\`\`\`jsx
// Primary
<Button className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white">

// Secondary  
<Button className="bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white">

// Destructive
<Button variant="ghost" className="text-[var(--color-destructive)]">
\`\`\`

### Dialogs
\`\`\`jsx
<DialogTitle className="text-[var(--color-midnight)]">
  Dialog Title
</DialogTitle>
\`\`\`

## Forbidden Patterns

❌ NEVER USE:
- style={{ fontFamily: 'var(--font-heading)' }} → Use className="font-heading"
- text-gray-500 → Use text-[var(--color-charcoal)]
- bg-blue-100 → Use bg-[var(--color-info)]/10 or appropriate token
- text-red-500 → Use text-[var(--color-destructive)]
- border-gray-200 → Use border-[var(--color-background-muted)]

## Migration Checklist

When updating existing code:
- [ ] Replace all inline style attributes
- [ ] Convert hardcoded Tailwind colors to design tokens
- [ ] Update heading elements to use font-heading class
- [ ] Replace text-gray-* with appropriate semantic tokens
- [ ] Update border colors to use background-muted
- [ ] Check button colors match Sturij palette
- [ ] Verify dialog titles use text-[var(--color-midnight)]`;

  return (
    <div className="relative min-h-screen">
      {/* Full-width header with dark background */}
      <div className="w-screen relative left-1/2 right-1/2 -mx-[50vw] bg-midnight-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold brand">Sturij</div>
          <nav className="flex gap-6">
            <a href="#" className="hover:text-primary-300 transition-colors">What we treat</a>
            <a href="#" className="hover:text-primary-300 transition-colors">How it works</a>
            <a href="#" className="hover:text-primary-300 transition-colors">About</a>
          </nav>
          <Button variant="ghost" className="text-white hover:text-primary-300">Sign in</Button>
        </div>
      </div>

      {/* Warm beige background */}
      <div 
        className="w-screen relative left-1/2 right-1/2 -mx-[50vw] bg-secondary-100"
        style={{
          minHeight: '100vh'
        }}
      >
      </div>
    </div>
  );
}