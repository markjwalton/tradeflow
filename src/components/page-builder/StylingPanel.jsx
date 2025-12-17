import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

// Style categories with their properties
const styleCategories = [
  {
    id: "border",
    name: "Border Styles",
    properties: ["border-width", "border-color", "border-style", "border-radius"]
  },
  {
    id: "spacing",
    name: "Paddings / Margins",
    properties: ["padding", "padding-top", "padding-right", "padding-bottom", "padding-left", "margin", "margin-top", "margin-right", "margin-bottom", "margin-left"]
  },
  {
    id: "font",
    name: "Font Styles",
    properties: ["font-family", "font-size", "font-weight", "font-style", "line-height", "letter-spacing"]
  },
  {
    id: "text",
    name: "Text Styles",
    properties: ["color", "text-align", "text-decoration", "text-transform"]
  },
  {
    id: "background",
    name: "Background Styles",
    properties: ["background-color", "background-image", "background-size", "background-position"]
  },
  {
    id: "position",
    name: "Position Styles",
    properties: ["position", "top", "right", "bottom", "left", "z-index", "display", "flex-direction", "justify-content", "align-items"]
  },
  {
    id: "extras",
    name: "Extras",
    properties: ["opacity", "cursor", "overflow", "visibility"]
  },
  {
    id: "css3",
    name: "CSS3 Styles",
    properties: ["box-shadow", "transform", "transition", "animation"]
  }
];

// Element types that can be styled
const elementTypes = [
  { value: "button", label: "Button" },
  { value: "heading", label: "Heading" },
  { value: "paragraph", label: "Paragraph" },
  { value: "link", label: "Link" },
  { value: "card", label: "Card" },
  { value: "input", label: "Input" },
  { value: "container", label: "Container" },
  { value: "image", label: "Image" },
  { value: "list", label: "List" },
  { value: "table", label: "Table" }
];

// Helper to check if a category has token values applied
const getCategoryStatus = (category, currentStyles) => {
  if (!currentStyles) return "none";
  const hasToken = category.properties.some(prop => currentStyles[prop]?.startsWith("var(--"));
  return hasToken ? "token" : "custom";
};

export function StylingPanel({ selectedElement, onApplyStyle }) {
  const [selectedElementType, setSelectedElementType] = useState("button");
  const [currentStyle, setCurrentStyle] = useState("");
  const [instances, setInstances] = useState([]);
  const [currentInstanceIndex, setCurrentInstanceIndex] = useState(0);
  const [applyToInstance, setApplyToInstance] = useState(false);
  const [applyToAll, setApplyToAll] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [categoryStyles, setCategoryStyles] = useState({});
  const [pageStylesLoaded, setPageStylesLoaded] = useState(false);

  // Find all instances of the selected element type on the page
  const loadPageStyles = () => {
    const selectors = {
      button: "button, [role='button'], .btn",
      heading: "h1, h2, h3, h4, h5, h6",
      paragraph: "p",
      link: "a",
      card: "[class*='card'], .card",
      input: "input, textarea, select",
      container: "div[class*='container'], .container, section",
      image: "img",
      list: "ul, ol",
      table: "table"
    };

    const selector = selectors[selectedElementType];
    if (!selector) return;

    const elements = document.querySelectorAll(`[data-page-content] ${selector}`);
    const foundInstances = Array.from(elements).filter(el => !el.closest('[data-token-applier-ui]'));
    
    setInstances(foundInstances);
    setCurrentInstanceIndex(0);
    setPageStylesLoaded(true);

    // Get computed styles of first instance
    if (foundInstances.length > 0) {
      const computed = window.getComputedStyle(foundInstances[0]);
      const styles = {};
      styleCategories.forEach(cat => {
        cat.properties.forEach(prop => {
          styles[prop] = computed.getPropertyValue(prop);
        });
      });
      setCategoryStyles(styles);
    }
  };

  // Navigate through instances
  const goToPreviousInstance = () => {
    if (currentInstanceIndex > 0) {
      setCurrentInstanceIndex(currentInstanceIndex - 1);
      highlightInstance(currentInstanceIndex - 1);
    }
  };

  const goToNextInstance = () => {
    if (currentInstanceIndex < instances.length - 1) {
      setCurrentInstanceIndex(currentInstanceIndex + 1);
      highlightInstance(currentInstanceIndex + 1);
    }
  };

  const highlightInstance = (index) => {
    // Remove previous highlights
    instances.forEach(el => {
      el.style.outline = "";
    });
    // Add highlight to current
    if (instances[index]) {
      instances[index].style.outline = "2px solid var(--primary-500)";
      instances[index].scrollIntoView({ behavior: "smooth", block: "center" });
      
      // Update category styles for this instance
      const computed = window.getComputedStyle(instances[index]);
      const styles = {};
      styleCategories.forEach(cat => {
        cat.properties.forEach(prop => {
          styles[prop] = computed.getPropertyValue(prop);
        });
      });
      setCategoryStyles(styles);
    }
  };

  // Toggle category expansion
  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Reset all styles
  const handleReset = () => {
    setCurrentStyle("");
    setCategoryStyles({});
    setApplyToInstance(false);
    setApplyToAll(false);
    instances.forEach(el => {
      el.style.outline = "";
    });
  };

  // Save styles
  const handleSave = () => {
    if (applyToAll && instances.length > 0) {
      instances.forEach(el => {
        // Apply current style to all instances
        if (currentStyle) {
          el.style.cssText += currentStyle;
        }
      });
    } else if (applyToInstance && instances[currentInstanceIndex]) {
      // Apply only to current instance
      if (currentStyle) {
        instances[currentInstanceIndex].style.cssText += currentStyle;
      }
    }
    onApplyStyle?.({ style: currentStyle, instances: applyToAll ? instances : [instances[currentInstanceIndex]] });
  };

  // Get current token value for display
  const getCurrentTokenValue = (category) => {
    const firstProp = category.properties[0];
    const value = categoryStyles[firstProp];
    if (value?.startsWith("var(--")) {
      return value.replace("var(", "").replace(")", "");
    }
    return value || "Not set";
  };

  // Cleanup highlights on unmount
  useEffect(() => {
    return () => {
      instances.forEach(el => {
        if (el) el.style.outline = "";
      });
    };
  }, [instances]);

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">Current Page Styles:</Label>
          <Button 
            variant="outline" 
            size="sm"
            onClick={loadPageStyles}
          >
            Load
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={handleReset}>
          <RotateCcw className="h-4 w-4 mr-1" />
          Reset
        </Button>
      </div>

      {/* Element selector and style input */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm">Element</Label>
          <Select value={selectedElementType} onValueChange={setSelectedElementType}>
            <SelectTrigger className="bg-charcoal-900 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {elementTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-sm">Style</Label>
          <Input 
            value={currentStyle}
            onChange={(e) => setCurrentStyle(e.target.value)}
            placeholder="--color-alert-{type}-text"
            className="font-mono text-sm"
          />
        </div>
      </div>

      {/* Instance navigation and preview */}
      {pageStylesLoaded && instances.length > 0 && (
        <div className="flex items-center justify-between border rounded-lg p-4 bg-muted/30">
          <div className="text-sm text-muted-foreground">
            Instances: {instances.length}
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={goToPreviousInstance}
              disabled={currentInstanceIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={goToNextInstance}
              disabled={currentInstanceIndex >= instances.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Preview of selected element */}
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
              {selectedElementType === "button" ? "Button text" : selectedElementType}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Label className="text-sm">Apply</Label>
            <div className="flex items-center gap-2">
              <Checkbox 
                id="apply-instance"
                checked={applyToInstance}
                onCheckedChange={setApplyToInstance}
              />
              <Label htmlFor="apply-instance" className="text-xs">{currentInstanceIndex + 1}</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox 
                id="apply-all"
                checked={applyToAll}
                onCheckedChange={setApplyToAll}
              />
              <Label htmlFor="apply-all" className="text-xs">{instances.length}</Label>
            </div>
          </div>

          <Button size="sm" onClick={handleSave}>
            Save
          </Button>
        </div>
      )}

      {/* Style categories */}
      <ScrollArea className="h-[280px]">
        <div className="space-y-1">
          {styleCategories.map((category) => {
            const status = getCategoryStatus(category, categoryStyles);
            const isExpanded = expandedCategories[category.id];
            const currentValue = getCurrentTokenValue(category);

            return (
              <Collapsible 
                key={category.id}
                open={isExpanded}
                onOpenChange={() => toggleCategory(category.id)}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 rounded-lg">
                  <span className="font-medium text-sm">{category.name}</span>
                  <div className="flex items-center gap-3">
                    {currentValue !== "Not set" && (
                      <span className="text-xs text-muted-foreground font-mono">
                        Current: {currentValue.length > 25 ? currentValue.slice(0, 25) + "..." : currentValue}
                      </span>
                    )}
                    <div 
                      className={cn(
                        "w-3 h-3 rounded-full",
                        status === "token" ? "bg-green-500" : "bg-red-500"
                      )}
                    />
                    <ChevronDown className={cn(
                      "h-4 w-4 transition-transform",
                      isExpanded && "rotate-180"
                    )} />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="px-3 pb-3">
                  <div className="space-y-2 pt-2 border-t">
                    {category.properties.map(prop => (
                      <div key={prop} className="flex items-center justify-between text-sm">
                        <Label className="text-xs text-muted-foreground">{prop}</Label>
                        <Input 
                          className="w-48 h-8 text-xs font-mono"
                          value={categoryStyles[prop] || ""}
                          onChange={(e) => setCategoryStyles(prev => ({
                            ...prev,
                            [prop]: e.target.value
                          }))}
                          placeholder="Enter value or token"
                        />
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}