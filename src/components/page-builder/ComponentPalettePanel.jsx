import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, Square, Type, ListOrdered, Table2, 
  Calendar, Image, FileText, CheckSquare, Radio,
  GripVertical, Layout, Columns, Grid3x3, Box
} from "lucide-react";
import { cn } from "@/lib/utils";

const componentCategories = {
  layout: {
    name: "Layout",
    components: [
      { id: "container", name: "Container", icon: Box, code: '<div className="container mx-auto px-4">{children}</div>' },
      { id: "grid", name: "Grid", icon: Grid3x3, code: '<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>' },
      { id: "flex", name: "Flex Row", icon: Columns, code: '<div className="flex gap-4">{children}</div>' },
      { id: "stack", name: "Stack", icon: Layout, code: '<div className="flex flex-col gap-4">{children}</div>' },
    ]
  },
  typography: {
    name: "Typography",
    components: [
      { id: "heading", name: "Heading", icon: Type, code: '<h1 className="text-2xl font-bold">Heading</h1>' },
      { id: "paragraph", name: "Paragraph", icon: FileText, code: '<p className="text-base">Paragraph text</p>' },
      { id: "list", name: "List", icon: ListOrdered, code: '<ul className="list-disc pl-5"><li>Item 1</li><li>Item 2</li></ul>' },
    ]
  },
  inputs: {
    name: "Form Inputs",
    components: [
      { id: "button", name: "Button", icon: Square, code: '<Button>Click me</Button>' },
      { id: "input", name: "Input", icon: Type, code: '<Input placeholder="Enter text..." />' },
      { id: "checkbox", name: "Checkbox", icon: CheckSquare, code: '<Checkbox id="check" />' },
      { id: "radio", name: "Radio", icon: Radio, code: '<RadioGroup><RadioGroupItem value="1" /></RadioGroup>' },
    ]
  },
  data: {
    name: "Data Display",
    components: [
      { id: "table", name: "Table", icon: Table2, code: '<Table><TableHeader><TableRow><TableHead>Header</TableHead></TableRow></TableHeader></Table>' },
      { id: "card", name: "Card", icon: Square, code: '<Card><CardHeader><CardTitle>Title</CardTitle></CardHeader></Card>' },
      { id: "badge", name: "Badge", icon: Square, code: '<Badge>Label</Badge>' },
    ]
  },
  media: {
    name: "Media",
    components: [
      { id: "image", name: "Image", icon: Image, code: '<img src="/placeholder.svg" alt="Image" className="rounded-lg" />' },
      { id: "calendar", name: "Calendar", icon: Calendar, code: '<Calendar mode="single" />' },
    ]
  }
};

export function ComponentPalettePanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [draggedComponent, setDraggedComponent] = useState(null);

  const handleDragStart = (component) => {
    setDraggedComponent(component);
  };

  const handleDragEnd = () => {
    setDraggedComponent(null);
  };

  const filteredCategories = Object.entries(componentCategories).reduce((acc, [key, category]) => {
    const filtered = category.components.filter(comp => 
      comp.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedCategory === "all" || selectedCategory === key)
    );
    if (filtered.length > 0) {
      acc[key] = { ...category, components: filtered };
    }
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <Badge
            variant={selectedCategory === "all" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedCategory("all")}
          >
            All
          </Badge>
          {Object.entries(componentCategories).map(([key, category]) => (
            <Badge
              key={key}
              variant={selectedCategory === key ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(key)}
            >
              {category.name}
            </Badge>
          ))}
        </div>
      </div>

      <ScrollArea className="h-[300px]">
        <div className="space-y-4">
          {Object.entries(filteredCategories).map(([key, category]) => (
            <div key={key} className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">{category.name}</h4>
              <div className="grid grid-cols-3 gap-2">
                {category.components.map((component) => {
                  const Icon = component.icon;
                  return (
                    <Card
                      key={component.id}
                      className={cn(
                        "cursor-move hover:border-primary hover:shadow-md transition-all",
                        draggedComponent?.id === component.id && "opacity-50"
                      )}
                      draggable
                      onDragStart={() => handleDragStart(component)}
                      onDragEnd={handleDragEnd}
                    >
                      <CardContent className="p-3 flex flex-col items-center gap-2">
                        <GripVertical className="h-3 w-3 text-muted-foreground" />
                        <Icon className="h-6 w-6 text-primary" />
                        <p className="text-xs text-center font-medium">{component.name}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t pt-4">
        <p className="text-xs text-muted-foreground">
          💡 Drag components onto the canvas to add them to your page
        </p>
      </div>
    </div>
  );
}