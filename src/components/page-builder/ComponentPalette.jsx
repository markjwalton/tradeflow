import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Search, Copy } from "lucide-react";
import { toast } from "sonner";

const COMPONENT_LIBRARY = {
  layout: [
    {
      name: "Section Container",
      code: `<section className="p-[var(--spacing-8)] bg-[var(--color-background)]" data-element-id="section-${Date.now()}">
  <div className="max-w-7xl mx-auto">
    <h2 className="text-h2 mb-[var(--spacing-4)]">Section Title</h2>
    <p className="text-body-base">Content goes here</p>
  </div>
</section>`,
      category: "layout"
    },
    {
      name: "Two Column Grid",
      code: `<div className="grid md:grid-cols-2 gap-[var(--spacing-6)]" data-element-id="grid-${Date.now()}">
  <div className="p-[var(--spacing-4)] bg-[var(--color-background)] rounded-[var(--radius-lg)]">
    <h3 className="text-h3 mb-[var(--spacing-2)]">Column 1</h3>
    <p className="text-body-base">Content</p>
  </div>
  <div className="p-[var(--spacing-4)] bg-[var(--color-background)] rounded-[var(--radius-lg)]">
    <h3 className="text-h3 mb-[var(--spacing-2)]">Column 2</h3>
    <p className="text-body-base">Content</p>
  </div>
</div>`,
      category: "layout"
    },
    {
      name: "Card Grid",
      code: `<div className="grid md:grid-cols-3 gap-[var(--spacing-4)]" data-element-id="card-grid-${Date.now()}">
  <div className="p-[var(--spacing-6)] bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-md)]">
    <h3 className="text-h3 mb-[var(--spacing-2)]">Card 1</h3>
    <p className="text-body-small text-[var(--color-charcoal)]">Description</p>
  </div>
  <div className="p-[var(--spacing-6)] bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-md)]">
    <h3 className="text-h3 mb-[var(--spacing-2)]">Card 2</h3>
    <p className="text-body-small text-[var(--color-charcoal)]">Description</p>
  </div>
  <div className="p-[var(--spacing-6)] bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-md)]">
    <h3 className="text-h3 mb-[var(--spacing-2)]">Card 3</h3>
    <p className="text-body-small text-[var(--color-charcoal)]">Description</p>
  </div>
</div>`,
      category: "layout"
    },
  ],
  buttons: [
    {
      name: "Primary Button",
      code: `<button className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] px-[var(--spacing-4)] py-[var(--spacing-2)] rounded-[var(--radius-lg)] transition-all" data-element-id="btn-primary-${Date.now()}">
  Click Me
</button>`,
      category: "buttons"
    },
    {
      name: "Secondary Button",
      code: `<button className="bg-[var(--color-secondary)] text-white hover:bg-[var(--color-secondary-dark)] px-[var(--spacing-4)] py-[var(--spacing-2)] rounded-[var(--radius-lg)] transition-all" data-element-id="btn-secondary-${Date.now()}">
  Secondary
</button>`,
      category: "buttons"
    },
    {
      name: "Outline Button",
      code: `<button className="border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 px-[var(--spacing-4)] py-[var(--spacing-2)] rounded-[var(--radius-lg)] transition-all" data-element-id="btn-outline-${Date.now()}">
  Outline
</button>`,
      category: "buttons"
    },
    {
      name: "Button Group",
      code: `<div className="flex gap-[var(--spacing-2)]" data-element-id="btn-group-${Date.now()}">
  <button className="bg-[var(--color-primary)] text-white px-[var(--spacing-4)] py-[var(--spacing-2)] rounded-[var(--radius-lg)]">Save</button>
  <button className="border border-[var(--color-border)] px-[var(--spacing-4)] py-[var(--spacing-2)] rounded-[var(--radius-lg)]">Cancel</button>
</div>`,
      category: "buttons"
    },
  ],
  cards: [
    {
      name: "Basic Card",
      code: `<div className="bg-white p-[var(--spacing-6)] rounded-[var(--radius-lg)] shadow-[var(--shadow-md)]" data-element-id="card-basic-${Date.now()}">
  <h3 className="text-h3 mb-[var(--spacing-2)]">Card Title</h3>
  <p className="text-body-base text-[var(--color-charcoal)]">Card content goes here with some descriptive text.</p>
  <button className="mt-[var(--spacing-4)] bg-[var(--color-primary)] text-white px-[var(--spacing-3)] py-[var(--spacing-2)] rounded-[var(--radius-md)]">Action</button>
</div>`,
      category: "cards"
    },
    {
      name: "Stat Card",
      code: `<div className="bg-white p-[var(--spacing-6)] rounded-[var(--radius-lg)] shadow-[var(--shadow-md)]" data-element-id="stat-card-${Date.now()}">
  <div className="text-body-small text-[var(--color-charcoal)] mb-[var(--spacing-2)]">Total Revenue</div>
  <div className="text-h2 text-[var(--color-primary)] mb-[var(--spacing-1)]">$24,567</div>
  <div className="text-body-small text-[var(--color-success)]">+12% from last month</div>
</div>`,
      category: "cards"
    },
    {
      name: "Feature Card",
      code: `<div className="bg-white p-[var(--spacing-8)] rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] text-center" data-element-id="feature-card-${Date.now()}">
  <div className="w-12 h-12 bg-[var(--color-primary)] rounded-full mx-auto mb-[var(--spacing-4)]"></div>
  <h3 className="text-h3 mb-[var(--spacing-3)]">Feature Name</h3>
  <p className="text-body-base text-[var(--color-charcoal)]">A brief description of this amazing feature.</p>
</div>`,
      category: "cards"
    },
  ],
  forms: [
    {
      name: "Input Field",
      code: `<div className="mb-[var(--spacing-4)]" data-element-id="input-field-${Date.now()}">
  <label className="block text-body-small text-[var(--color-charcoal)] mb-[var(--spacing-2)]">Label</label>
  <input type="text" className="w-full px-[var(--spacing-3)] py-[var(--spacing-2)] border border-[var(--color-border)] rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" placeholder="Enter text..." />
</div>`,
      category: "forms"
    },
    {
      name: "Textarea",
      code: `<div className="mb-[var(--spacing-4)]" data-element-id="textarea-${Date.now()}">
  <label className="block text-body-small text-[var(--color-charcoal)] mb-[var(--spacing-2)]">Message</label>
  <textarea className="w-full px-[var(--spacing-3)] py-[var(--spacing-2)] border border-[var(--color-border)] rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" rows="4" placeholder="Enter message..."></textarea>
</div>`,
      category: "forms"
    },
    {
      name: "Checkbox",
      code: `<div className="flex items-center gap-[var(--spacing-2)] mb-[var(--spacing-3)]" data-element-id="checkbox-${Date.now()}">
  <input type="checkbox" id="check-${Date.now()}" className="w-4 h-4 text-[var(--color-primary)] border-[var(--color-border)] rounded" />
  <label htmlFor="check-${Date.now()}" className="text-body-base">Accept terms and conditions</label>
</div>`,
      category: "forms"
    },
    {
      name: "Form Group",
      code: `<form className="bg-white p-[var(--spacing-6)] rounded-[var(--radius-lg)] shadow-[var(--shadow-md)]" data-element-id="form-group-${Date.now()}">
  <h3 className="text-h3 mb-[var(--spacing-4)]">Contact Form</h3>
  <div className="mb-[var(--spacing-4)]">
    <label className="block text-body-small mb-[var(--spacing-2)]">Name</label>
    <input type="text" className="w-full px-[var(--spacing-3)] py-[var(--spacing-2)] border border-[var(--color-border)] rounded-[var(--radius-md)]" />
  </div>
  <div className="mb-[var(--spacing-4)]">
    <label className="block text-body-small mb-[var(--spacing-2)]">Email</label>
    <input type="email" className="w-full px-[var(--spacing-3)] py-[var(--spacing-2)] border border-[var(--color-border)] rounded-[var(--radius-md)]" />
  </div>
  <button type="submit" className="bg-[var(--color-primary)] text-white px-[var(--spacing-4)] py-[var(--spacing-2)] rounded-[var(--radius-lg)] w-full">Submit</button>
</form>`,
      category: "forms"
    },
  ],
  typography: [
    {
      name: "Hero Heading",
      code: `<div className="text-center mb-[var(--spacing-8)]" data-element-id="hero-heading-${Date.now()}">
  <h1 className="text-h1 mb-[var(--spacing-3)]">Hero Heading</h1>
  <p className="text-body-large text-[var(--color-charcoal)]">A compelling subheading that captures attention</p>
</div>`,
      category: "typography"
    },
    {
      name: "Section Header",
      code: `<div className="mb-[var(--spacing-6)]" data-element-id="section-header-${Date.now()}">
  <h2 className="text-h2 mb-[var(--spacing-2)]">Section Title</h2>
  <p className="text-body-base text-[var(--color-charcoal)]">Section description text</p>
</div>`,
      category: "typography"
    },
    {
      name: "Paragraph",
      code: `<p className="text-body-base text-[var(--color-text-body)] leading-relaxed mb-[var(--spacing-4)]" data-element-id="paragraph-${Date.now()}">
  This is a paragraph of text with proper spacing and typography. It uses design tokens for consistent styling across the application.
</p>`,
      category: "typography"
    },
  ],
  navigation: [
    {
      name: "Header",
      code: `<header className="bg-white border-b border-[var(--color-border)] p-[var(--spacing-4)]" data-element-id="header-${Date.now()}">
  <div className="max-w-7xl mx-auto flex items-center justify-between">
    <div className="text-h3">Logo</div>
    <nav className="flex gap-[var(--spacing-6)]">
      <a href="#" className="text-body-base text-[var(--color-charcoal)] hover:text-[var(--color-primary)]">Home</a>
      <a href="#" className="text-body-base text-[var(--color-charcoal)] hover:text-[var(--color-primary)]">About</a>
      <a href="#" className="text-body-base text-[var(--color-charcoal)] hover:text-[var(--color-primary)]">Contact</a>
    </nav>
  </div>
</header>`,
      category: "navigation"
    },
    {
      name: "Breadcrumbs",
      code: `<nav className="flex items-center gap-[var(--spacing-2)] text-body-small mb-[var(--spacing-4)]" data-element-id="breadcrumbs-${Date.now()}">
  <a href="#" className="text-[var(--color-primary)] hover:underline">Home</a>
  <span className="text-[var(--color-charcoal)]">/</span>
  <a href="#" className="text-[var(--color-primary)] hover:underline">Category</a>
  <span className="text-[var(--color-charcoal)]">/</span>
  <span className="text-[var(--color-charcoal)]">Current Page</span>
</nav>`,
      category: "navigation"
    },
  ],
};

export function ComponentPalette({ onInsertComponent }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("layout");

  const allComponents = Object.values(COMPONENT_LIBRARY).flat();
  const filteredComponents = search
    ? allComponents.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    : COMPONENT_LIBRARY[activeCategory] || [];

  const handleInsert = (component) => {
    onInsertComponent(component.code);
    toast.success(`${component.name} added to page`);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Package className="h-4 w-4" />
          Components
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-96 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Component Library</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--color-charcoal)]" />
            <Input
              placeholder="Search components..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {!search && (
            <Tabs value={activeCategory} onValueChange={setActiveCategory}>
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="layout">Layout</TabsTrigger>
                <TabsTrigger value="buttons">Buttons</TabsTrigger>
                <TabsTrigger value="cards">Cards</TabsTrigger>
              </TabsList>
              <TabsList className="grid grid-cols-3 w-full mt-2">
                <TabsTrigger value="forms">Forms</TabsTrigger>
                <TabsTrigger value="typography">Text</TabsTrigger>
                <TabsTrigger value="navigation">Nav</TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="space-y-3">
              {filteredComponents.map((component, idx) => (
                <Card key={idx} className="hover:shadow-md transition-shadow">
                  <CardHeader className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-sm">{component.name}</CardTitle>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {component.category}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleInsert(component)}
                        className="gap-1"
                      >
                        <Copy className="h-3 w-3" />
                        Insert
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div 
                      className="text-xs bg-muted/50 p-2 rounded overflow-x-auto"
                      dangerouslySetInnerHTML={{ __html: component.code.substring(0, 100) + '...' }}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}