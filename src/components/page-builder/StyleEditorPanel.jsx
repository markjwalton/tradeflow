import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Palette, ChevronDown, Search, Save, Edit2, Check, Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

export function StyleEditorPanel({ currentPageName }) {
  const [isOpen, setIsOpen] = useState(false);
  const [pageElements, setPageElements] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [openSections, setOpenSections] = useState({});
  const [elementStyles, setElementStyles] = useState({});
  const [friendlyNames, setFriendlyNames] = useState({});
  const [editingName, setEditingName] = useState(null);
  const [tempName, setTempName] = useState("");
  const [highlightedElement, setHighlightedElement] = useState(null);

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
      loadSavedMappings();
      extractPageElements();
      attachClickListeners();
    } else {
      removeClickListeners();
    }
    return () => removeClickListeners();
  }, [isOpen, pageElements]);

  const loadSavedMappings = async () => {
    try {
      const user = await base44.auth.me();
      if (user?.style_editor_mappings) {
        setFriendlyNames(user.style_editor_mappings);
      }
    } catch (e) {
      console.error("Failed to load mappings:", e);
    }
  };

  const saveMappings = async () => {
    try {
      const user = await base44.auth.me();
      await base44.auth.updateMe({
        style_editor_mappings: friendlyNames
      });
      toast.success("Mappings saved successfully");
    } catch (e) {
      toast.error("Failed to save mappings");
      console.error(e);
    }
  };

  const exportTheme = () => {
    const theme = {
      styles: elementStyles,
      mappings: friendlyNames,
      exportedAt: new Date().toISOString(),
      pageName: currentPageName,
    };
    
    const blob = new Blob([JSON.stringify(theme, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `theme-${currentPageName}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Theme exported successfully");
  };

  const importTheme = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const theme = JSON.parse(text);
        
        if (theme.styles) {
          setElementStyles(theme.styles);
          
          // Apply all styles to DOM
          Object.entries(theme.styles).forEach(([elementId, styles]) => {
            const element = pageElements.find(e => e.id === elementId);
            if (element?.element) {
              Object.entries(styles).forEach(([prop, value]) => {
                element.element.style[prop] = value;
              });
            }
          });
        }
        
        if (theme.mappings) {
          setFriendlyNames(theme.mappings);
        }
        
        toast.success("Theme imported and applied successfully");
      } catch (e) {
        toast.error("Failed to import theme");
        console.error(e);
      }
    };
    
    input.click();
  };

  const generateElementKey = (element) => {
    return `${element.tagName}::${element.classes}`;
  };

  const startEditingName = (elementId, currentKey) => {
    setEditingName(elementId);
    setTempName(friendlyNames[currentKey] || "");
  };

  const saveFriendlyName = (elementKey) => {
    if (tempName.trim()) {
      setFriendlyNames(prev => ({
        ...prev,
        [elementKey]: tempName.trim()
      }));
      toast.success("Friendly name updated");
    }
    setEditingName(null);
    setTempName("");
  };

  const extractPageElements = () => {
    const container = document.querySelector('[data-page-content]');
    if (!container) return;

    const elements = [];
    const allElements = container.querySelectorAll('*');
    
    allElements.forEach((el, idx) => {
      const tagName = el.tagName.toLowerCase();
      const classList = Array.from(el.classList).join(' ');
      const id = el.id || `element-${idx}`;
      const elementKey = `${tagName}::${classList}`;
      
      elements.push({
        id,
        tagName,
        classes: classList,
        elementKey,
        element: el,
        text: el.textContent?.substring(0, 50) || '',
        friendlyName: friendlyNames[elementKey] || null,
      });
    });

    setPageElements(elements);
  };

  const attachClickListeners = () => {
    const container = document.querySelector('[data-page-content]');
    if (!container) return;

    container.addEventListener('click', handleElementClick, true);
  };

  const removeClickListeners = () => {
    const container = document.querySelector('[data-page-content]');
    if (!container) return;

    container.removeEventListener('click', handleElementClick, true);
  };

  const handleElementClick = (e) => {
    // Don't handle clicks on the style panel itself
    if (e.target.closest('[data-style-panel]')) {
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    
    const targetElement = pageElements.find(el => el.element === e.target);
    if (targetElement) {
      setHighlightedElement(targetElement.id);
      setOpenSections(prev => ({ ...prev, [targetElement.id]: true }));
      
      // Scroll to element in panel
      setTimeout(() => {
        const elementDiv = document.getElementById(`panel-element-${targetElement.id}`);
        if (elementDiv) {
          elementDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
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

      <SheetContent className="w-[600px] overflow-y-auto [&_[role=dialog]]:z-[100000]" side="right" data-style-panel>
        <SheetHeader className="px-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="flex items-center gap-2 text-xl">
                <Palette className="h-5 w-5" />
                Style Editor
              </SheetTitle>
              <p className="text-sm text-muted-foreground">
                Apply styles to any element on this page
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={exportTheme} size="sm" variant="outline" title="Export theme as JSON">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={importTheme} size="sm" variant="outline" title="Import theme from JSON">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button onClick={saveMappings} size="sm" variant="outline" title="Save friendly names">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
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
              <div 
                id={`panel-element-${element.id}`}
                className={`border rounded-lg overflow-hidden transition-all ${
                  highlightedElement === element.id ? 'ring-2 ring-primary-500 shadow-lg' : ''
                }`}
              >
                <CollapsibleTrigger className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors">
                  <div className="flex-1 text-left">
                    {editingName === element.id ? (
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <Input
                          value={tempName}
                          onChange={(e) => setTempName(e.target.value)}
                          placeholder="Enter friendly name..."
                          className="h-8 text-sm"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveFriendlyName(element.elementKey);
                            if (e.key === 'Escape') setEditingName(null);
                          }}
                        />
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => saveFriendlyName(element.elementKey)}
                          className="h-8 px-2"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          {element.friendlyName ? (
                            <>
                              <span className="font-medium text-sm">{element.friendlyName}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEditingName(element.id, element.elementKey);
                                }}
                                className="h-6 px-2"
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <span className="font-mono text-sm font-medium">&lt;{element.tagName}&gt;</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEditingName(element.id, element.elementKey);
                                }}
                                className="h-6 px-2"
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                            </>
                          )}
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
                      </>
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
                        <SelectContent style={{ zIndex: 100001 }}>
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
                        <SelectContent style={{ zIndex: 100001 }}>
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
                        <SelectContent style={{ zIndex: 100001 }}>
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
                        <SelectContent style={{ zIndex: 100001 }}>
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
                        <SelectContent style={{ zIndex: 100001 }}>
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
                        <SelectContent style={{ zIndex: 100001 }}>
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
                        <SelectContent style={{ zIndex: 100001 }}>
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