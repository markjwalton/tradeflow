import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, ExternalLink, Copy, CheckCircle2, Palette,
  ChevronDown, ChevronRight 
} from "lucide-react";
import { toast } from "sonner";

// Comprehensive Tailwind + Sturij tokens reference
const TAILWIND_SECTIONS = {
  sturij_colors: {
    name: "Sturij Color Tokens",
    description: "Use CSS variables for all colors to maintain brand consistency",
    items: [
      { 
        category: "Primary Colors",
        classes: [
          { class: "bg-[var(--color-primary)]", css: "#4A5D4E", description: "Forest Green - main actions, CTAs" },
          { class: "bg-[var(--color-primary-light)]", css: "#5d7361", description: "Hover states" },
          { class: "bg-[var(--color-primary-dark)]", css: "#3a4a3e", description: "Active/pressed states" },
          { class: "bg-[var(--color-primary-50)]", css: "#f2f5f3", description: "Subtle backgrounds" },
          { class: "bg-[var(--color-primary-100)]", css: "#e5ebe6", description: "Light backgrounds" },
          { class: "bg-[var(--color-primary-500)]", css: "#4A5D4E", description: "Base primary" },
          { class: "bg-[var(--color-primary-900)]", css: "#1e2621", description: "Darkest primary" }
        ]
      },
      {
        category: "Secondary Colors",
        classes: [
          { class: "bg-[var(--color-secondary)]", css: "#D4A574", description: "Warm Copper - accents, highlights" },
          { class: "bg-[var(--color-secondary-light)]", css: "#e0bc94", description: "Hover states" },
          { class: "bg-[var(--color-secondary-dark)]", css: "#c08d54", description: "Active states" },
          { class: "bg-[var(--color-secondary-50)]", css: "#faf6f2", description: "Subtle backgrounds" }
        ]
      },
      {
        category: "Accent Colors",
        classes: [
          { class: "bg-[var(--color-accent)]", css: "#d9b4a7", description: "Soft Blush - decorative" },
          { class: "bg-[var(--color-accent-light)]", css: "#e8cec4", description: "Hover states" },
          { class: "bg-[var(--color-accent-dark)]", css: "#c99a8a", description: "Active states" }
        ]
      },
      {
        category: "Background Colors",
        classes: [
          { class: "bg-[var(--color-background)]", css: "#f5f3ef", description: "Page background" },
          { class: "bg-[var(--color-background-paper)]", css: "#ffffff", description: "Card/surface background" },
          { class: "bg-[var(--color-background-subtle)]", css: "#faf9f7", description: "Subtle background" },
          { class: "bg-[var(--color-background-muted)]", css: "#eceae5", description: "Muted/border background" }
        ]
      },
      {
        category: "Text Colors",
        classes: [
          { class: "text-[var(--color-midnight)]", css: "#1b2a35", description: "Headings, important text" },
          { class: "text-[var(--color-charcoal)]", css: "#3b3b3b", description: "Body text" },
          { class: "text-[var(--color-charcoal-light)]", css: "#555555", description: "Secondary text" }
        ]
      },
      {
        category: "Semantic Colors",
        classes: [
          { class: "text-[var(--color-success)]", css: "#5a7a5e", description: "Success states" },
          { class: "text-[var(--color-warning)]", css: "#c4a35a", description: "Warning states" },
          { class: "text-[var(--color-destructive)]", css: "#8b5b5b", description: "Error/destructive" },
          { class: "text-[var(--color-info)]", css: "#5a7a8b", description: "Info states" }
        ]
      }
    ]
  },
  sturij_typography: {
    name: "Sturij Typography",
    description: "Typography tokens for consistent text styling",
    items: [
      {
        category: "Font Families",
        classes: [
          { class: "font-heading", css: "Degular Display Light", description: "Headings - elegant, light weight" },
          { class: "font-body", css: "Mrs Eaves XL Serif", description: "Body text - readable serif" },
          { class: "font-mono", css: "SF Mono, Menlo", description: "Code, technical content" }
        ]
      },
      {
        category: "Font Sizes",
        classes: [
          { class: "text-xs or text-[var(--font-size-xs)]", css: "0.75rem (12px)", description: "Extra small text" },
          { class: "text-sm or text-[var(--font-size-sm)]", css: "0.875rem (14px)", description: "Small text, labels" },
          { class: "text-base or text-[var(--font-size-base)]", css: "1rem (16px)", description: "Body text" },
          { class: "text-lg or text-[var(--font-size-lg)]", css: "1.125rem (18px)", description: "Large body" },
          { class: "text-xl or text-[var(--font-size-xl)]", css: "1.25rem (20px)", description: "Small headings" },
          { class: "text-2xl or text-[var(--font-size-2xl)]", css: "1.5rem (24px)", description: "Section headings" },
          { class: "text-3xl or text-[var(--font-size-3xl)]", css: "1.875rem (30px)", description: "Page titles" },
          { class: "text-4xl or text-[var(--font-size-4xl)]", css: "2.25rem (36px)", description: "Hero headings" }
        ]
      },
      {
        category: "Line Heights",
        classes: [
          { class: "leading-tight", css: "1.25", description: "Headings" },
          { class: "leading-snug", css: "1.375", description: "Compact text" },
          { class: "leading-normal", css: "1.5", description: "Body text (default)" },
          { class: "leading-relaxed", css: "1.625", description: "Comfortable reading" }
        ]
      },
      {
        category: "Letter Spacing",
        classes: [
          { class: "tracking-tight", css: "-0.025em", description: "Headings" },
          { class: "tracking-normal", css: "0", description: "Default" },
          { class: "tracking-wide", css: "0.025em", description: "Labels, buttons" },
          { class: "tracking-wider", css: "0.05em", description: "All caps text" }
        ]
      }
    ]
  },
  sturij_effects: {
    name: "Sturij Effects",
    description: "Shadows, borders, and transitions",
    items: [
      {
        category: "Shadows",
        classes: [
          { class: "shadow-[var(--shadow-xs)]", css: "0 1px 2px", description: "Subtle shadow" },
          { class: "shadow-[var(--shadow-sm)]", css: "0 1px 3px", description: "Small elements" },
          { class: "shadow-[var(--shadow-md)]", css: "0 4px 6px", description: "Cards, buttons" },
          { class: "shadow-[var(--shadow-lg)]", css: "0 10px 15px", description: "Modals, dropdowns" },
          { class: "shadow-[var(--shadow-xl)]", css: "0 20px 25px", description: "Large modals" },
          { class: "shadow-[var(--shadow-primary)]", css: "0 4px 14px primary", description: "Primary button shadow" },
          { class: "shadow-[var(--shadow-secondary)]", css: "0 4px 14px secondary", description: "Secondary button shadow" }
        ]
      },
      {
        category: "Border Radius",
        classes: [
          { class: "rounded-[var(--radius-sm)]", css: "4px", description: "Small elements" },
          { class: "rounded-[var(--radius-md)]", css: "6px", description: "Buttons, inputs" },
          { class: "rounded-[var(--radius-lg)]", css: "8px", description: "Cards" },
          { class: "rounded-[var(--radius-xl)]", css: "12px", description: "Large cards" },
          { class: "rounded-[var(--radius-2xl)]", css: "16px", description: "Modals" },
          { class: "rounded-full", css: "9999px", description: "Circles, pills" }
        ]
      },
      {
        category: "Transitions",
        classes: [
          { class: "transition-[var(--transition-fast)]", css: "150ms ease", description: "Quick feedback" },
          { class: "transition-[var(--transition-normal)]", css: "200ms ease", description: "Standard transitions" },
          { class: "transition-[var(--transition-slow)]", css: "300ms ease", description: "Smooth animations" }
        ]
      }
    ]
  },
  layout: {
    name: "Layout Utilities",
    description: "Common layout patterns",
    items: [
      {
        category: "Flexbox",
        classes: [
          { class: "flex items-center justify-between", css: "", description: "Space items horizontally" },
          { class: "flex items-center gap-2", css: "", description: "Items with gap" },
          { class: "flex flex-col gap-4", css: "", description: "Vertical stack" },
          { class: "flex flex-wrap gap-2", css: "", description: "Wrapping items" }
        ]
      },
      {
        category: "Grid",
        classes: [
          { class: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", css: "", description: "Responsive grid" },
          { class: "grid grid-cols-12 gap-6", css: "", description: "12-column grid" }
        ]
      },
      {
        category: "Spacing",
        classes: [
          { class: "p-4 or p-6", css: "1rem / 1.5rem", description: "Padding" },
          { class: "space-y-4", css: "", description: "Vertical spacing between children" },
          { class: "gap-2, gap-4, gap-6", css: "0.5rem / 1rem / 1.5rem", description: "Flex/Grid gap" }
        ]
      },
      {
        category: "Common Patterns",
        classes: [
          { class: "min-h-screen bg-[var(--color-background)]", css: "", description: "Full page container" },
          { class: "max-w-4xl mx-auto", css: "", description: "Centered content" },
          { class: "sticky top-0 z-10", css: "", description: "Sticky header" }
        ]
      }
    ]
  },
  patterns: {
    name: "Common Patterns",
    description: "Frequently used component patterns",
    items: [
      {
        category: "Page Header",
        classes: [
          { class: `<div className="flex items-center justify-between mb-6">\n  <div>\n    <h1 className="text-2xl font-heading text-[var(--color-midnight)]">Title</h1>\n    <p className="text-[var(--color-charcoal)]">Description</p>\n  </div>\n  <Button>Action</Button>\n</div>`, css: "", description: "Standard page header" }
        ]
      },
      {
        category: "Card with Border",
        classes: [
          { class: `<Card className="border-[var(--color-background-muted)]">\n  <CardHeader>\n    <CardTitle className="text-[var(--color-midnight)]">Title</CardTitle>\n  </CardHeader>\n  <CardContent>Content</CardContent>\n</Card>`, css: "", description: "Sturij-styled card" }
        ]
      },
      {
        category: "Primary Button",
        classes: [
          { class: `<Button className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white">\n  <Plus className="h-4 w-4 mr-2" />\n  Add Item\n</Button>`, css: "", description: "Sturij primary button" }
        ]
      },
      {
        category: "Status Badge",
        classes: [
          { class: `<Badge className="bg-[var(--color-success)]/20 text-[var(--color-success)]">Active</Badge>\n<Badge className="bg-[var(--color-warning)]/20 text-[var(--color-warning)]">Pending</Badge>\n<Badge className="bg-[var(--color-destructive)]/20 text-[var(--color-destructive)]">Error</Badge>`, css: "", description: "Status badges with tokens" }
        ]
      },
      {
        category: "Search Input",
        classes: [
          { class: `<div className="relative">\n  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-charcoal)]" />\n  <Input placeholder="Search..." className="pl-10" />\n</div>`, css: "", description: "Search with icon" }
        ]
      }
    ]
  }
};

export default function TailwindReference() {
  const [search, setSearch] = useState("");
  const [expandedSections, setExpandedSections] = useState(new Set(["sturij_colors"]));
  const [copiedCode, setCopiedCode] = useState(null);

  const copyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    toast.success("Copied!");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const toggleSection = (key) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-cyan-600" />
            Tailwind CSS + Sturij Tokens Reference
          </CardTitle>
          <Button variant="outline" size="sm" asChild>
            <a href="https://tailwindcss.com/docs" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3 w-3 mr-1" />
              Tailwind Docs
            </a>
          </Button>
        </div>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search classes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {Object.entries(TAILWIND_SECTIONS).map(([key, section]) => {
              const isExpanded = expandedSections.has(key);
              
              // Filter items by search
              const filteredItems = section.items.map(item => ({
                ...item,
                classes: item.classes.filter(c => 
                  !search || 
                  c.class.toLowerCase().includes(search.toLowerCase()) ||
                  c.description?.toLowerCase().includes(search.toLowerCase())
                )
              })).filter(item => item.classes.length > 0);

              if (filteredItems.length === 0) return null;

              return (
                <div key={key} className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection(key)}
                    className="w-full px-4 py-3 flex items-center justify-between bg-cyan-50 hover:bg-cyan-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      <span className="font-medium text-cyan-900">{section.name}</span>
                      <span className="text-sm text-cyan-600">{section.description}</span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-4 bg-white space-y-4">
                      {filteredItems.map((item, idx) => (
                        <div key={idx}>
                          <h4 className="text-sm font-medium text-cyan-800 mb-2">{item.category}</h4>
                          <div className="space-y-2">
                            {item.classes.map((cls, cidx) => (
                              <div 
                                key={cidx} 
                                className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                              >
                                <div className="flex-1 min-w-0">
                                  <code className="text-xs font-mono text-cyan-700 break-all whitespace-pre-wrap">
                                    {cls.class}
                                  </code>
                                  {cls.css && (
                                    <span className="text-xs text-gray-500 ml-2">→ {cls.css}</span>
                                  )}
                                  <p className="text-xs text-gray-600 mt-1">{cls.description}</p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => copyCode(cls.class, `${key}-${idx}-${cidx}`)}
                                >
                                  {copiedCode === `${key}-${idx}-${cidx}` ? (
                                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}