import React, { useState, useEffect, useRef } from "react";
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

// Load CSS variables from :root
const loadGlobalTokens = () => {
  const tokens = {};
  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);
  
  // Get all CSS custom properties from stylesheets
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) {
        if (rule.selectorText === ':root') {
          const cssText = rule.cssText;
          const matches = cssText.matchAll(/--([a-zA-Z0-9-]+)\s*:\s*([^;]+)/g);
          for (const match of matches) {
            const name = `--${match[1]}`;
            const value = match[2].trim();
            tokens[name] = value;
          }
        }
      }
    } catch (e) {
      // CORS restrictions on external stylesheets
    }
  }
  
  // Also get computed values for common token patterns
  const tokenPatterns = [
    'primary', 'secondary', 'accent', 'background', 'foreground', 
    'muted', 'card', 'destructive', 'border', 'ring', 'midnight', 
    'charcoal', 'success', 'warning', 'info', 'color', 'spacing',
    'radius', 'shadow', 'font'
  ];
  
  tokenPatterns.forEach(pattern => {
    for (let i = 50; i <= 900; i += 50) {
      const name = `--${pattern}-${i}`;
      const value = computedStyle.getPropertyValue(name);
      if (value) tokens[name] = value.trim();
    }
  });
  
  return tokens;
};

// Helper to check if a value uses a CSS token
const isTokenValue = (value) => {
  return value && (value.includes('var(--') || value.startsWith('oklch'));
};

// Helper to check if a category has token values applied
const getCategoryStatus = (category, currentStyles, globalTokens) => {
  if (!currentStyles || Object.keys(currentStyles).length === 0) return "none";
  
  let hasToken = false;
  category.properties.forEach(prop => {
    const value = currentStyles[prop];
    if (value) {
      // Check if value matches any known token
      const matchesToken = Object.values(globalTokens).some(tokenVal => 
        value.includes(tokenVal) || isTokenValue(value)
      );
      if (matchesToken) hasToken = true;
    }
  });
  
  return hasToken ? "token" : "custom";
};

export default function StylingPanel({ selectedElement, onApplyStyle }) {
  const [selectedElementType, setSelectedElementType] = useState("button");
  const [currentStyle, setCurrentStyle] = useState("");
  const [instances, setInstances] = useState([]);
  const [currentInstanceIndex, setCurrentInstanceIndex] = useState(0);
  const [applyToInstance, setApplyToInstance] = useState(false);
  const [applyToAll, setApplyToAll] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [categoryStyles, setCategoryStyles] = useState({});
  const [pageStylesLoaded, setPageStylesLoaded] = useState(false);
  const [globalTokens, setGlobalTokens] = useState({});
  const previewRef = useRef(null);

  // Load global tokens on mount
  useEffect(() => {
    const tokens = loadGlobalTokens();
    setGlobalTokens(tokens);
  }, []);

  // Find all instances of the selected element type on the page
  const loadPageStyles = () => {
    // Clear previous highlights
    instances.forEach(el => {
      if (el) el.style.outline = "";
    });

    const selectors = {
      button: "button:not([data-token-applier-ui] button):not([class*='editor']):not([class*='Editor'])",
      heading: "h1:not([data-token-applier-ui] *), h2:not([data-token-applier-ui] *), h3:not([data-token-applier-ui] *), h4:not([data-token-applier-ui] *), h5:not([data-token-applier-ui] *), h6:not([data-token-applier-ui] *)",
      paragraph: "p:not([data-token-applier-ui] *)",
      link: "a:not([data-token-applier-ui] *)",
      card: "[class*='card']:not([data-token-applier-ui] *), .card:not([data-token-applier-ui] *)",
      input: "input:not([data-token-applier-ui] *), textarea:not([data-token-applier-ui] *), select:not([data-token-applier-ui] *)",
      container: "section:not([data-token-applier-ui] *), main:not([data-token-applier-ui] *)",
      image: "img:not([data-token-applier-ui] *)",
      list: "ul:not([data-token-applier-ui] *), ol:not([data-token-applier-ui] *)",
      table: "table:not([data-token-applier-ui] *)"
    };

    const selector = selectors[selectedElementType];
    if (!selector) return;

    // Find elements within the page content area, excluding editor UI
    const pageContent = document.querySelector('[data-page-content]') || document.querySelector('main') || document.body;
    const elements = pageContent.querySelectorAll(selector);
    
    // Filter out any elements inside the editor panel
    const foundInstances = Array.from(elements).filter(el => {
      const isInEditor = el.closest('[class*="TopEditor"]') || 
                         el.closest('[class*="editor-panel"]') ||
                         el.closest('[data-token-applier-ui]');
      return !isInEditor;
    });
    
    setInstances(foundInstances);
    setCurrentInstanceIndex(0);
    setPageStylesLoaded(true);

    // Highlight all instances initially
    foundInstances.forEach((el, idx) => {
      el.style.outline = "2px dashed var(--primary-300)";
      el.style.outlineOffset = "2px";
    });

    // Get computed styles of first instance
    if (foundInstances.length > 0) {
      updateStylesForInstance(foundInstances[0]);
      // Highlight current instance differently
      foundInstances[0].style.outline = "3px solid var(--primary-500)";
    }
  };

  const updateStylesForInstance = (element) => {
    if (!element) return;
    
    const computed = window.getComputedStyle(element);
    const styles = {};
    styleCategories.forEach(cat => {
      cat.properties.forEach(prop => {
        styles[prop] = computed.getPropertyValue(prop);
      });
    });
    setCategoryStyles(styles);
  };

  // Navigate through instances
  const goToPreviousInstance = () => {
    if (currentInstanceIndex > 0) {
      const newIndex = currentInstanceIndex - 1;
      setCurrentInstanceIndex(newIndex);
      highlightInstance(newIndex);
    }
  };

  const goToNextInstance = () => {
    if (currentInstanceIndex < instances.length - 1) {
      const newIndex = currentInstanceIndex + 1;
      setCurrentInstanceIndex(newIndex);
      highlightInstance(newIndex);
    }
  };

  const highlightInstance = (index) => {
    // Reset all to dashed outline
    instances.forEach((el, idx) => {
      if (el) {
        el.style.outline = "2px dashed var(--primary-300)";
        el.style.outlineOffset = "2px";
      }
    });
    
    // Highlight current instance with solid outline
    if (instances[index]) {
      instances[index].style.outline = "3px solid var(--primary-500)";
      instances[index].style.outlineOffset = "2px";
      instances[index].scrollIntoView({ behavior: "smooth", block: "center" });
      
      // Update category styles for this instance
      updateStylesForInstance(instances[index]);
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
    setPageStylesLoaded(false);
    instances.forEach(el => {
      if (el) {
        el.style.outline = "";
        el.style.outlineOffset = "";
      }
    });
    setInstances([]);
  };

  // Save styles
  const handleSave = () => {
    const targetInstances = applyToAll ? instances : (applyToInstance ? [instances[currentInstanceIndex]] : []);
    
    targetInstances.forEach(el => {
      if (el && currentStyle) {
        // Parse and apply style
        el.style.cssText += currentStyle;
      }
    });
    
    onApplyStyle?.({ 
      style: currentStyle, 
      instances: targetInstances,
      elementType: selectedElementType 
    });
  };

  // Get current token value for display
  const getCurrentTokenValue = (category) => {
    const firstProp = category.properties[0];
    const value = categoryStyles[firstProp];
    
    if (!value) return "Not set";
    
    // Check if it matches a known token
    for (const [tokenName, tokenValue] of Object.entries(globalTokens)) {
      if (value.includes(tokenValue) || value === tokenValue) {
        return tokenName;
      }
    }
    
    return value.length > 30 ? value.slice(0, 30) + "..." : value;
  };

  // Clone current instance for preview
  const renderPreview = () => {
    if (!instances[currentInstanceIndex]) {
      return (
        <div className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
          Button text
        </div>
      );
    }

    const el = instances[currentInstanceIndex];
    const tagName = el.tagName.toLowerCase();
    const text = el.textContent?.slice(0, 20) || selectedElementType;
    const computedStyle = window.getComputedStyle(el);

    // Create simplified preview styles
    const previewStyles = {
      backgroundColor: computedStyle.backgroundColor,
      color: computedStyle.color,
      padding: computedStyle.padding,
      borderRadius: computedStyle.borderRadius,
      fontSize: computedStyle.fontSize,
      fontWeight: computedStyle.fontWeight,
      border: computedStyle.border,
    };

    return (
      <div style={previewStyles} className="max-w-[150px] truncate">
        {text}
      </div>
    );
  };

  // Cleanup highlights on unmount
  useEffect(() => {
    return () => {
      instances.forEach(el => {
        if (el) {
          el.style.outline = "";
          el.style.outlineOffset = "";
        }
      });
    };
  }, [instances]);

  // Get token options for a property
  const getTokenOptionsForProperty = (prop) => {
    const options = [];
    
    // Color properties
    if (prop.includes('color') || prop === 'background-color') {
      Object.entries(globalTokens).forEach(([name, value]) => {
        if (name.includes('color') || name.includes('primary') || name.includes('secondary') || 
            name.includes('accent') || name.includes('background') || name.includes('foreground')) {
          options.push({ name, value });
        }
      });
    }
    
    // Spacing properties
    if (prop.includes('padding') || prop.includes('margin')) {
      Object.entries(globalTokens).forEach(([name, value]) => {
        if (name.includes('spacing')) {
          options.push({ name, value });
        }
      });
    }
    
    // Border radius
    if (prop.includes('radius')) {
      Object.entries(globalTokens).forEach(([name, value]) => {
        if (name.includes('radius')) {
          options.push({ name, value });
        }
      });
    }
    
    // Font properties
    if (prop.includes('font')) {
      Object.entries(globalTokens).forEach(([name, value]) => {
        if (name.includes('font')) {
          options.push({ name, value });
        }
      });
    }
    
    // Shadow properties
    if (prop.includes('shadow')) {
      Object.entries(globalTokens).forEach(([name, value]) => {
        if (name.includes('shadow')) {
          options.push({ name, value });
        }
      });
    }
    
    return options;
  };

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
      {pageStylesLoaded && (
        <div className="flex items-center justify-between border rounded-lg p-4 bg-muted/30 gap-4">
          <div className="text-sm text-muted-foreground whitespace-nowrap">
            Instances: {instances.length}
          </div>
          
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8"
              onClick={goToPreviousInstance}
              disabled={currentInstanceIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8"
              onClick={goToNextInstance}
              disabled={currentInstanceIndex >= instances.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Preview of selected element */}
          <div className="flex items-center gap-4" ref={previewRef}>
            {renderPreview()}
          </div>

          <div className="flex items-center gap-4">
            <Label className="text-sm">Apply</Label>
            <div className="flex items-center gap-1">
              <Checkbox 
                id="apply-instance"
                checked={applyToInstance}
                onCheckedChange={(checked) => {
                  setApplyToInstance(checked);
                  if (checked) setApplyToAll(false);
                }}
              />
              <Label htmlFor="apply-instance" className="text-xs">{currentInstanceIndex + 1}</Label>
            </div>
            <div className="flex items-center gap-1">
              <Checkbox 
                id="apply-all"
                checked={applyToAll}
                onCheckedChange={(checked) => {
                  setApplyToAll(checked);
                  if (checked) setApplyToInstance(false);
                }}
              />
              <Label htmlFor="apply-all" className="text-xs">{instances.length}</Label>
            </div>
          </div>

          <Button size="sm" onClick={handleSave} disabled={!applyToInstance && !applyToAll}>
            Save
          </Button>
        </div>
      )}

      {/* Style categories */}
      <ScrollArea className="h-[250px]">
        <div className="space-y-1">
          {styleCategories.map((category) => {
            const status = getCategoryStatus(category, categoryStyles, globalTokens);
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
                    {pageStylesLoaded && currentValue !== "Not set" && (
                      <span className="text-xs text-muted-foreground font-mono">
                        Current: {currentValue}
                      </span>
                    )}
                    <div 
                      className={cn(
                        "w-3 h-3 rounded-full",
                        status === "token" ? "bg-green-500" : status === "custom" ? "bg-red-500" : "bg-amber-500"
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
                    {category.properties.map(prop => {
                      const tokenOptions = getTokenOptionsForProperty(prop);
                      
                      return (
                        <div key={prop} className="flex items-center justify-between text-sm gap-2">
                          <Label className="text-xs text-muted-foreground min-w-[100px]">{prop}</Label>
                          {tokenOptions.length > 0 ? (
                            <Select 
                              value={categoryStyles[prop] || ""}
                              onValueChange={(value) => {
                                setCategoryStyles(prev => ({
                                  ...prev,
                                  [prop]: `var(${value})`
                                }));
                                setCurrentStyle(prev => prev + `${prop}: var(${value}); `);
                              }}
                            >
                              <SelectTrigger className="w-48 h-8 text-xs font-mono">
                                <SelectValue placeholder="Select token" />
                              </SelectTrigger>
                              <SelectContent>
                                {tokenOptions.slice(0, 20).map(opt => (
                                  <SelectItem key={opt.name} value={opt.name} className="text-xs">
                                    {opt.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input 
                              className="w-48 h-8 text-xs font-mono"
                              value={categoryStyles[prop] || ""}
                              onChange={(e) => {
                                setCategoryStyles(prev => ({
                                  ...prev,
                                  [prop]: e.target.value
                                }));
                                setCurrentStyle(prev => prev + `${prop}: ${e.target.value}; `);
                              }}
                              placeholder="Enter value"
                            />
                          )}
                        </div>
                      );
                    })}
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