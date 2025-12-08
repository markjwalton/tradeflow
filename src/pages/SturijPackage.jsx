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
    <div className="p-6 bg-background min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-heading text-midnight-900">
                Sturij Design System Package
              </h1>
              <p className="text-charcoal-700">
                Complete UI theme package for Base44 applications
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Badge className="bg-success-50 text-success">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Production Ready
            </Badge>
            <Badge className="bg-info-50 text-info">
              v1.0.0
            </Badge>
            <Badge className="bg-secondary-100 text-secondary">
              Base44 Compatible
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">
              <Package className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="files">
              <FileText className="h-4 w-4 mr-2" />
              Package Files
            </TabsTrigger>
            <TabsTrigger value="tokens">
              <Palette className="h-4 w-4 mr-2" />
              Design Tokens
            </TabsTrigger>
            <TabsTrigger value="usage">
              <Code className="h-4 w-4 mr-2" />
              Usage Guide
            </TabsTrigger>
            <TabsTrigger value="llm">
              <Sparkles className="h-4 w-4 mr-2" />
              LLM Guidelines
            </TabsTrigger>
            <TabsTrigger value="showcase">
              <Eye className="h-4 w-4 mr-2" />
              Showcase
            </TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-midnight-900">What is Sturij?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-charcoal-700">
                  Sturij is a comprehensive design system built specifically for Base44 applications. 
                  It provides a cohesive visual language with warm, professional aesthetics inspired by 
                  natural materials and craftsmanship.
                </p>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <Palette className="h-8 w-8 text-primary mb-3" />
                    <h3 className="font-heading font-medium text-midnight-900 mb-2">
                      Design Tokens
                    </h3>
                    <p className="text-sm text-[var(--color-charcoal)]">
                      Complete color palette, typography, spacing, and effects system
                    </p>
                  </div>
                  
                  <div className="p-4 bg-muted rounded-lg">
                    <Layers className="h-8 w-8 text-secondary mb-3" />
                    <h3 className="font-heading font-medium text-midnight-900 mb-2">
                      Components
                    </h3>
                    <p className="text-sm text-[var(--color-charcoal)]">
                      Pre-built, themed React components ready to use
                    </p>
                  </div>
                  
                  <div className="p-4 bg-muted rounded-lg">
                    <Zap className="h-8 w-8 text-accent mb-3" />
                    <h3 className="font-heading font-medium text-midnight-900 mb-2">
                      LLM Optimized
                    </h3>
                    <p className="text-sm text-[var(--color-charcoal)]">
                      Clear guidelines for AI-assisted development
                    </p>
                  </div>
                </div>

                <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                  <h4 className="font-heading font-medium text-primary mb-2">
                    Key Features
                  </h4>
                  <ul className="space-y-1 text-sm text-midnight-900">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success-foreground mt-0.5 flex-shrink-0" />
                      <span>Complete CSS variable system with semantic naming</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success-foreground mt-0.5 flex-shrink-0" />
                      <span>Full color palette with 50-900 shades for each color</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success-foreground mt-0.5 flex-shrink-0" />
                      <span>Typography system with custom fonts and scales</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success-foreground mt-0.5 flex-shrink-0" />
                      <span>Spacing, shadows, and border radius tokens</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success-foreground mt-0.5 flex-shrink-0" />
                      <span>Ready-to-use React components</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success-foreground mt-0.5 flex-shrink-0" />
                      <span>Interactive showcase and documentation</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Files */}
          <TabsContent value="files" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-midnight-900">Package Contents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {packageFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-background-subtle rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-card">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-midnight-900">{file.name}</div>
                          <p className="text-sm text-charcoal-700">{file.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{file.type}</Badge>
                        <Badge className="bg-charcoal-100 text-charcoal-700">
                          {file.size}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-midnight-900">File Structure</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-midnight-900 text-background-50 p-4 rounded-lg text-sm font-mono overflow-x-auto">
{`sturij-design-system/
├── globals.css                 # Complete design tokens
├── components/
│   ├── library/
│   │   ├── designTokens.js    # Exported JS constants
│   │   ├── Typography.jsx     # Typography components
│   │   ├── Buttons.jsx        # Button variants
│   │   ├── Forms.jsx          # Form components
│   │   ├── Layouts.jsx        # Layout components
│   │   └── index.js           # Main export
│   └── sturij/
│       ├── PageHeader.jsx     # Page header component
│       ├── ContentSection.jsx # Section container
│       ├── StatCard.jsx       # Stat card component
│       ├── StatusBadge.jsx    # Status badge
│       ├── FeatureCard.jsx    # Feature card
│       ├── DataRow.jsx        # Data list row
│       └── index.js           # Main export
├── pages/
│   ├── ComponentShowcase.js   # Interactive demo
│   └── SturijPackage.js       # This documentation page
├── Layout.js                   # Reference layout
└── docs/
    ├── IMPLEMENTATION.md       # Setup guide
    ├── LLM_GUIDELINES.md       # AI usage guide
    └── BEST_PRACTICES.md       # Development guide`}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Design Tokens */}
          <TabsContent value="tokens" className="space-y-6">
            {Object.entries(designTokenDocs).map(([category, tokens]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="text-midnight-900 capitalize">
                    {category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {tokens.map((token, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-background-subtle rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-midnight-900">{token.name}</div>
                          {token.var && (
                            <code className="text-xs text-charcoal-700 bg-card px-2 py-0.5 rounded">
                              var({token.var})
                            </code>
                          )}
                        </div>
                        {token.hex && (
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-10 h-10 rounded-md border border-border"
                              style={{ backgroundColor: token.hex }}
                            />
                            <code className="text-sm text-charcoal-700">{token.hex}</code>
                          </div>
                        )}
                        {token.value && (
                          <code className="text-sm text-charcoal-700">{token.value}</code>
                        )}
                        {token.usage && (
                          <span className="text-sm text-charcoal-700">{token.usage}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Usage Guide */}
          <TabsContent value="usage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-midnight-900">Implementation Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {implementationSteps.map((step) => (
                    <div key={step.step} className="flex gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-heading flex-shrink-0">
                        {step.step}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-heading font-medium text-midnight-900 mb-1">
                          {step.title}
                        </h3>
                        <p className="text-sm text-charcoal-700 mb-2">
                          {step.description}
                        </p>
                        <div className="relative">
                          <pre className="bg-midnight-900 text-background-50 p-3 rounded-md text-xs overflow-x-auto">
                            {step.code}
                          </pre>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute top-2 right-2 h-6 w-6 p-0 bg-white/10 hover:bg-white/20"
                            onClick={() => copyToClipboard(step.code, `step-${step.step}`)}
                          >
                            <Copy className="h-3 w-3 text-background-50" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-midnight-900">Code Examples</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {usageExamples.map((example, idx) => (
                    <div key={idx}>
                      <h4 className="font-heading font-medium text-midnight-900 mb-2">
                        {example.title}
                      </h4>
                      <div className="relative">
                        <pre className="bg-midnight-900 text-background-50 p-4 rounded-lg text-sm overflow-x-auto">
                          {example.code}
                        </pre>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-2 right-2 h-6 w-6 p-0 bg-[var(--color-background-paper)]/10 hover:bg-[var(--color-background-paper)]/20"
                          onClick={() => copyToClipboard(example.code, `example-${idx}`)}
                        >
                          <Copy className="h-3 w-3 text-[var(--color-background-paper)]" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* LLM Guidelines */}
          <TabsContent value="llm" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[var(--color-midnight)]">
                  <Sparkles className="h-5 w-5 text-secondary-400" />
                  LLM Implementation Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <pre className="bg-[var(--color-midnight)] text-[var(--color-background-paper)] p-6 rounded-[var(--radius-lg)] text-sm overflow-x-auto whitespace-pre-wrap max-h-[600px] overflow-y-auto">
                    {llmGuidelines}
                  </pre>
                  <Button
                    size="sm"
                    className="absolute top-4 right-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white"
                    onClick={() => copyToClipboard(llmGuidelines, 'llm-guide')}
                  >
                    <Copy className="h-3 w-3 mr-2" />
                    {copiedSection === 'llm-guide' ? 'Copied!' : 'Copy All'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-warning bg-warning/5">
              <CardHeader>
                <CardTitle className="text-[var(--color-midnight)]">Quick Reference</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h5 className="font-heading font-medium text-[var(--color-midnight)] mb-2">
                      ✅ Always Use
                    </h5>
                    <ul className="space-y-1 text-[var(--color-charcoal)]">
                      <li>• text-[var(--color-midnight)]</li>
                      <li>• bg-[var(--color-background)]</li>
                      <li>• border-[var(--color-background-muted)]</li>
                      <li>• font-heading for titles</li>
                      <li>• Design token utility classes</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-heading font-medium text-destructive mb-2">
                      ❌ Never Use
                    </h5>
                    <ul className="space-y-1 text-[var(--color-charcoal)]">
                      <li>• text-gray-500, bg-blue-100</li>
                      <li>• inline style attributes</li>
                      <li>• Hardcoded color values (#hex)</li>
                      <li>• style with fontFamily property</li>
                      <li>• Non-semantic color names</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Showcase Link */}
          <TabsContent value="showcase" className="space-y-6">
            <Card>
              <CardContent className="py-12 text-center">
                <Eye className="h-16 w-16 mx-auto mb-4 text-primary-500" />
                <h3 className="text-xl font-heading text-[var(--color-midnight)] mb-2">
                  Interactive Component Showcase
                </h3>
                <p className="text-[var(--color-charcoal)] mb-6">
                  View live examples of all design tokens, components, and patterns
                </p>
                <Button 
                  size="lg"
                  className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white"
                  onClick={() => {
                    const url = window.location.origin + "/ComponentShowcase";
                    window.open(url, '_blank');
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Open Component Showcase
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Download Section */}
        <Card className="mt-8 border-primary-500">
          <CardContent className="py-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-heading text-[var(--color-midnight)] mb-2">
                  Ready to implement?
                </h3>
                <p className="text-charcoal-700">
                  All files are already in your Base44 project and ready to use
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => {
                    const url = window.location.origin + "/ComponentShowcase";
                    window.open(url, '_blank');
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Showcase
                </Button>
                <Button 
                  className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white"
                  onClick={() => toast.success("Package documentation ready to use!")}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Package Ready
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}