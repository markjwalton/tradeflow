import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Palette, ChevronDown, Search } from "lucide-react";
import { toast } from "sonner";

export function StyleEditorPanel({ currentPageName }) {
  const [isOpen, setIsOpen] = useState(false);
  const [pageElements, setPageElements] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [openSections, setOpenSections] = useState({});
  const [elementStyles, setElementStyles] = useState({});

  const styleOptions = {
    backgroundColor: [
      { label: "Background 50", value: "#fdfcf9" },
      { label: "Background 100", value: "#f5f2ed" },
      { label: "Background 200", value: "#ebe5da" },
      { label: "Primary 50", value: "#f6f8f7" },
      { label: "Primary 100", value: "#e9efeb" },
      { label: "Primary 500", value: "#4a6d55" },
      { label: "Primary 600", value: "#3d5946" },
      { label: "Secondary 100", value: "#f8f4ee" },
      { label: "Secondary 400", value: "#c4a37d" },
      { label: "Accent 100", value: "#f9f4f4" },
      { label: "Accent 300", value: "#d9c4c4" },
      { label: "Midnight 800", value: "#2f4254" },
      { label: "Midnight 900", value: "#1f2d3b" },
      { label: "Charcoal 100", value: "#efefef" },
      { label: "Charcoal 800", value: "#434343" },
      { label: "White", value: "#ffffff" },
      { label: "Transparent", value: "transparent" },
    ],
    color: [
      { label: "Primary 500", value: "#4a6d55" },
      { label: "Primary 700", value: "#324839" },
      { label: "Secondary 400", value: "#c4a37d" },
      { label: "Accent 300", value: "#d9c4c4" },
      { label: "Accent 500", value: "#c78e8e" },
      { label: "Midnight 900", value: "#1f2d3b" },
      { label: "Charcoal 600", value: "#676767" },
      { label: "Charcoal 800", value: "#434343" },
      { label: "White", value: "#ffffff" },
    ],
    fontSize: [
      { label: "Extra Small (12px)", value: "0.75rem" },
      { label: "Small (14px)", value: "0.875rem" },
      { label: "Base (16px)", value: "1rem" },
      { label: "Large (18px)", value: "1.125rem" },
      { label: "XL (20px)", value: "1.25rem" },
      { label: "2XL (24px)", value: "1.5rem" },
      { label: "3XL (30px)", value: "1.875rem" },
      { label: "4XL (36px)", value: "2.25rem" },
    ],
    padding: [
      { label: "None", value: "0" },
      { label: "XS (4px)", value: "0.25rem" },
      { label: "Small (8px)", value: "0.5rem" },
      { label: "Medium (12px)", value: "0.75rem" },
      { label: "Base (16px)", value: "1rem" },
      { label: "Large (20px)", value: "1.25rem" },
      { label: "XL (24px)", value: "1.5rem" },
      { label: "2XL (32px)", value: "2rem" },
    ],
    margin: [
      { label: "None", value: "0" },
      { label: "XS (4px)", value: "0.25rem" },
      { label: "Small (8px)", value: "0.5rem" },
      { label: "Medium (12px)", value: "0.75rem" },
      { label: "Base (16px)", value: "1rem" },
      { label: "Large (20px)", value: "1.25rem" },
      { label: "XL (24px)", value: "1.5rem" },
      { label: "2XL (32px)", value: "2rem" },
    ],
    borderRadius: [
      { label: "None", value: "0" },
      { label: "Small", value: "0.25rem" },
      { label: "Medium", value: "0.375rem" },
      { label: "Large", value: "0.5rem" },
      { label: "XL", value: "0.75rem" },
      { label: "2XL", value: "1rem" },
      { label: "Full", value: "9999px" },
    ],
    fontWeight: [
      { label: "Light (300)", value: "300" },
      { label: "Normal (400)", value: "400" },
      { label: "Medium (500)", value: "500" },
      { label: "Semibold (600)", value: "600" },
      { label: "Bold (700)", value: "700" },
    ],
  };

  useEffect(() => {
    if (isOpen) {
      extractPageElements();
    }
  }, [isOpen]);

  const extractPageElements = () => {
    const container = document.querySelector('[data-page-content]');
    if (!container) return;

    const elements = [];
    const allElements = container.querySelectorAll('*');
    
    allElements.forEach((el, idx) => {
      const tagName = el.tagName.toLowerCase();
      const classList = Array.from(el.classList).join(' ');
      const id = el.id || `element-${idx}`;
      
      elements.push({
        id,
        tagName,
        classes: classList,
        element: el,
        text: el.textContent?.substring(0, 50) || '',
      });
    });

    setPageElements(elements);
  };

  const applyStyle = (elementId, styleProp, value) => {
    const element = pageElements.find(e => e.id === elementId);
    if (!element?.element) return;

    element.element.style[styleProp] = value;
    
    setElementStyles(prev => ({
      ...prev,
      [elementId]: {
        ...prev[elementId],
        [styleProp]: value,
      }
    }));

    toast.success(`Style applied to ${element.tagName}`);
  };

  const toggleSection = (id) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredElements = pageElements.filter(el => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      el.tagName.includes(query) ||
      el.classes.toLowerCase().includes(query) ||
      el.text.toLowerCase().includes(query)
    );
  });

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl border-2 border-white hover:scale-105 transition-transform"
          style={{ zIndex: 9998, backgroundColor: 'rgba(199, 142, 142, 0.9)' }}
          title="Style Editor"
        >
          <Palette className="h-6 w-6 text-white" />
        </Button>
      </SheetTrigger>

      <SheetContent className="w-[600px] overflow-y-auto" side="right" style={{ zIndex: 9999 }}>
        <SheetHeader className="px-6 pb-4 border-b">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <Palette className="h-5 w-5" />
            Style Editor
          </SheetTitle>
          <p className="text-sm text-muted-foreground">
            Apply styles to any element on this page
          </p>
        </SheetHeader>

        <div className="px-6 py-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search elements..."
              className="pl-9"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Found {filteredElements.length} element(s)
          </p>
        </div>

        <div className="px-6 py-4 space-y-2">
          {filteredElements.map((element) => (
            <Collapsible
              key={element.id}
              open={openSections[element.id]}
              onOpenChange={() => toggleSection(element.id)}
            >
              <div className="border rounded-lg overflow-hidden">
                <CollapsibleTrigger className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors">
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium">&lt;{element.tagName}&gt;</span>
                      {element.classes && (
                        <span className="text-xs text-muted-foreground">
                          {element.classes.substring(0, 30)}
                        </span>
                      )}
                    </div>
                    {element.text && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {element.text}
                      </p>
                    )}
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${openSections[element.id] ? 'rotate-180' : ''}`}
                  />
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="px-4 py-4 space-y-4 border-t bg-muted/20">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Background Color</Label>
                      <Select
                        value={elementStyles[element.id]?.backgroundColor || ""}
                        onValueChange={(value) => applyStyle(element.id, 'backgroundColor', value)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select color..." />
                        </SelectTrigger>
                        <SelectContent>
                          {styleOptions.backgroundColor.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-4 w-4 rounded border"
                                  style={{ backgroundColor: opt.value }}
                                />
                                {opt.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Text Color</Label>
                      <Select
                        value={elementStyles[element.id]?.color || ""}
                        onValueChange={(value) => applyStyle(element.id, 'color', value)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select color..." />
                        </SelectTrigger>
                        <SelectContent>
                          {styleOptions.color.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-4 w-4 rounded border"
                                  style={{ backgroundColor: opt.value }}
                                />
                                {opt.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Font Size</Label>
                      <Select
                        value={elementStyles[element.id]?.fontSize || ""}
                        onValueChange={(value) => applyStyle(element.id, 'fontSize', value)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select size..." />
                        </SelectTrigger>
                        <SelectContent>
                          {styleOptions.fontSize.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Font Weight</Label>
                      <Select
                        value={elementStyles[element.id]?.fontWeight || ""}
                        onValueChange={(value) => applyStyle(element.id, 'fontWeight', value)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select weight..." />
                        </SelectTrigger>
                        <SelectContent>
                          {styleOptions.fontWeight.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Padding</Label>
                      <Select
                        value={elementStyles[element.id]?.padding || ""}
                        onValueChange={(value) => applyStyle(element.id, 'padding', value)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select padding..." />
                        </SelectTrigger>
                        <SelectContent>
                          {styleOptions.padding.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Margin</Label>
                      <Select
                        value={elementStyles[element.id]?.margin || ""}
                        onValueChange={(value) => applyStyle(element.id, 'margin', value)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select margin..." />
                        </SelectTrigger>
                        <SelectContent>
                          {styleOptions.margin.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Border Radius</Label>
                      <Select
                        value={elementStyles[element.id]?.borderRadius || ""}
                        onValueChange={(value) => applyStyle(element.id, 'borderRadius', value)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select radius..." />
                        </SelectTrigger>
                        <SelectContent>
                          {styleOptions.borderRadius.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}