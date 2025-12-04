import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Palette, Type, Maximize, Layers, Sun, Square, 
  Check, RefreshCw, Eye, Copy
} from "lucide-react";
import { toast } from "sonner";

// Source of truth - Sturij Design Tokens
const STURIJ_TOKENS = {
  colors: {
    primary: {
      label: "Primary (Forest Green)",
      base: "#4A5D4E",
      variants: {
        "50": "#f2f5f3",
        "100": "#e5ebe6",
        "200": "#c9d5cc",
        "300": "#a8bead",
        "400": "#7a9a82",
        "500": "#4A5D4E",
        "600": "#3e4f42",
        "700": "#334137",
        "800": "#28332c",
        "900": "#1e2621",
        "light": "#5d7361",
        "dark": "#3a4a3e"
      }
    },
    secondary: {
      label: "Secondary (Warm Copper)",
      base: "#D4A574",
      variants: {
        "50": "#faf6f2",
        "100": "#f5ede4",
        "200": "#ebdbc9",
        "300": "#e0c4a8",
        "400": "#D4A574",
        "500": "#c89254",
        "600": "#b67d3f",
        "700": "#966633",
        "800": "#78522a",
        "900": "#624423",
        "light": "#e0bc94",
        "dark": "#c08d54"
      }
    },
    accent: {
      label: "Accent (Soft Blush)",
      base: "#d9b4a7",
      variants: {
        "50": "#fdf9f7",
        "100": "#f9f1ed",
        "200": "#f2e2db",
        "300": "#e8cec4",
        "400": "#d9b4a7",
        "500": "#c99a8a",
        "600": "#b5806e",
        "700": "#966858",
        "800": "#7a5548",
        "900": "#64463c",
        "light": "#e8cec4",
        "dark": "#c99a8a"
      }
    },
    background: {
      label: "Background",
      base: "#f5f3ef",
      variants: {
        "paper": "#ffffff",
        "subtle": "#faf9f7",
        "muted": "#eceae5",
        "50": "#faf9f7",
        "100": "#f5f3ef",
        "200": "#eceae5",
        "300": "#e0ddd6",
        "400": "#d4d0c7"
      }
    },
    midnight: {
      label: "Midnight (Dark Blue-Grey)",
      base: "#1b2a35",
      variants: {
        "50": "#f4f6f7",
        "100": "#e3e7ea",
        "200": "#c9d1d7",
        "300": "#a3b1bb",
        "400": "#758997",
        "500": "#5a6e7d",
        "600": "#4d5d6a",
        "700": "#434f59",
        "800": "#3b444d",
        "900": "#1b2a35",
        "light": "#2a3d4a",
        "dark": "#121c24"
      }
    },
    charcoal: {
      label: "Charcoal",
      base: "#3b3b3b",
      variants: {
        "50": "#f6f6f6",
        "100": "#e7e7e7",
        "200": "#d1d1d1",
        "300": "#b0b0b0",
        "400": "#888888",
        "500": "#6d6d6d",
        "600": "#5d5d5d",
        "700": "#4f4f4f",
        "800": "#3b3b3b",
        "900": "#262626",
        "light": "#555555",
        "dark": "#2a2a2a"
      }
    },
    destructive: {
      label: "Destructive (Muted Red)",
      base: "#8b5b5b",
      variants: {
        "light": "#a87272",
        "dark": "#6e4747"
      }
    },
    success: {
      label: "Success",
      base: "#5a7a5e",
      variants: {
        "light": "#6d8f71",
        "dark": "#486249"
      }
    },
    warning: {
      label: "Warning",
      base: "#c4a35a",
      variants: {
        "light": "#d4b872",
        "dark": "#a88c42"
      }
    },
    info: {
      label: "Info",
      base: "#5a7a8b",
      variants: {
        "light": "#6d8f9f",
        "dark": "#486270"
      }
    }
  },
  typography: {
    fontFamily: {
      heading: { label: "Heading Font", value: "Degular Display Light, system-ui, sans-serif" },
      body: { label: "Body Font", value: "Mrs Eaves XL Serif, Georgia, serif" },
      mono: { label: "Monospace Font", value: "ui-monospace, SFMono-Regular, SF Mono, Menlo, monospace" }
    },
    fontSize: {
      xs: { label: "Extra Small", value: "0.75rem" },
      sm: { label: "Small", value: "0.875rem" },
      base: { label: "Base", value: "1rem" },
      lg: { label: "Large", value: "1.125rem" },
      xl: { label: "Extra Large", value: "1.25rem" },
      "2xl": { label: "2XL", value: "1.5rem" },
      "3xl": { label: "3XL", value: "1.875rem" },
      "4xl": { label: "4XL", value: "2.25rem" },
      "5xl": { label: "5XL", value: "3rem" }
    },
    lineHeight: {
      none: { label: "None", value: "1" },
      tight: { label: "Tight", value: "1.25" },
      snug: { label: "Snug", value: "1.375" },
      normal: { label: "Normal", value: "1.5" },
      relaxed: { label: "Relaxed", value: "1.625" },
      loose: { label: "Loose", value: "2" }
    },
    letterSpacing: {
      tighter: { label: "Tighter", value: "-0.05em" },
      tight: { label: "Tight", value: "-0.025em" },
      normal: { label: "Normal", value: "0em" },
      wide: { label: "Wide", value: "0.025em" },
      wider: { label: "Wider", value: "0.05em" },
      widest: { label: "Widest", value: "0.1em" }
    }
  },
  spacing: {
    "0": "0",
    "px": "1px",
    "1": "0.25rem",
    "2": "0.5rem",
    "3": "0.75rem",
    "4": "1rem",
    "5": "1.25rem",
    "6": "1.5rem",
    "8": "2rem",
    "10": "2.5rem",
    "12": "3rem",
    "16": "4rem",
    "20": "5rem",
    "24": "6rem",
    "32": "8rem"
  },
  radius: {
    none: { label: "None", value: "0" },
    xs: { label: "Extra Small", value: "0.125rem" },
    sm: { label: "Small", value: "4px" },
    md: { label: "Medium", value: "6px" },
    lg: { label: "Large", value: "8px" },
    xl: { label: "Extra Large", value: "12px" },
    "2xl": { label: "2XL", value: "16px" },
    "3xl": { label: "3XL", value: "24px" },
    full: { label: "Full (Pill)", value: "9999px" }
  },
  shadows: {
    xs: { label: "Extra Small", value: "0 1px 2px 0 rgb(27 42 53 / 0.05)" },
    sm: { label: "Small", value: "0 1px 3px 0 rgb(27 42 53 / 0.1), 0 1px 2px -1px rgb(27 42 53 / 0.1)" },
    md: { label: "Medium", value: "0 4px 6px -1px rgb(27 42 53 / 0.1), 0 2px 4px -2px rgb(27 42 53 / 0.1)" },
    lg: { label: "Large", value: "0 10px 15px -3px rgb(27 42 53 / 0.1), 0 4px 6px -4px rgb(27 42 53 / 0.1)" },
    xl: { label: "Extra Large", value: "0 20px 25px -5px rgb(27 42 53 / 0.1), 0 8px 10px -6px rgb(27 42 53 / 0.1)" },
    "2xl": { label: "2XL", value: "0 25px 50px -12px rgb(27 42 53 / 0.25)" },
    inner: { label: "Inner", value: "inset 0 2px 4px 0 rgb(27 42 53 / 0.05)" }
  },
  transitions: {
    fast: { label: "Fast (150ms)", value: "150ms ease" },
    normal: { label: "Normal (200ms)", value: "200ms ease" },
    slow: { label: "Slow (300ms)", value: "300ms ease" },
    slower: { label: "Slower (500ms)", value: "500ms ease" }
  }
};

// Color picker with preset options
function ColorTokenEditor({ tokenKey, tokenData, value, onChange }) {
  const [customColor, setCustomColor] = useState(value || tokenData.base);
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{tokenData.label}</Label>
        <div 
          className="w-8 h-8 rounded-md border border-[var(--color-background-muted)]"
          style={{ backgroundColor: customColor }}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <Select 
          value={customColor} 
          onValueChange={(v) => {
            setCustomColor(v);
            onChange(tokenKey, v);
          }}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Select variant..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={tokenData.base}>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded" style={{ backgroundColor: tokenData.base }} />
                Base
              </span>
            </SelectItem>
            {Object.entries(tokenData.variants || {}).map(([variantKey, variantValue]) => (
              <SelectItem key={variantKey} value={variantValue}>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded" style={{ backgroundColor: variantValue }} />
                  {variantKey}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Input
          type="color"
          value={customColor}
          onChange={(e) => {
            setCustomColor(e.target.value);
            onChange(tokenKey, e.target.value);
          }}
          className="h-8 p-1 cursor-pointer"
        />
      </div>
    </div>
  );
}

// Font selector with predefined options
function FontTokenEditor({ tokenKey, tokenData, value, onChange }) {
  const fontOptions = [
    { value: "Degular Display Light, system-ui, sans-serif", label: "Degular Display" },
    { value: "Mrs Eaves XL Serif, Georgia, serif", label: "Mrs Eaves XL Serif" },
    { value: "system-ui, sans-serif", label: "System UI" },
    { value: "Georgia, serif", label: "Georgia" },
    { value: "Arial, sans-serif", label: "Arial" },
    { value: "Helvetica, sans-serif", label: "Helvetica" },
    { value: "Inter, sans-serif", label: "Inter" },
    { value: "Roboto, sans-serif", label: "Roboto" },
    { value: "ui-monospace, SFMono-Regular, monospace", label: "Monospace" }
  ];

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{tokenData.label}</Label>
      <Select 
        value={value || tokenData.value} 
        onValueChange={(v) => onChange(tokenKey, v)}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {fontOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              <span style={{ fontFamily: opt.value }}>{opt.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// Size selector with predefined options
function SizeTokenEditor({ tokenKey, tokenData, value, onChange, options }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{tokenData.label}</Label>
      <Select 
        value={value || tokenData.value} 
        onValueChange={(v) => onChange(tokenKey, v)}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(options).map(([key, opt]) => (
            <SelectItem key={key} value={opt.value}>
              {opt.label} ({opt.value})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default function ThemeTokenEditor({ 
  packageData, 
  onSave, 
  isSaving = false 
}) {
  const [activeSection, setActiveSection] = useState("colors");
  const [customTokens, setCustomTokens] = useState({
    colors: {},
    typography: {},
    spacing: {},
    effects: {}
  });
  const [previewMode, setPreviewMode] = useState(false);

  // Initialize from package data
  useEffect(() => {
    if (packageData?.design_tokens) {
      setCustomTokens(packageData.design_tokens);
    }
  }, [packageData]);

  const handleTokenChange = (category, key, value) => {
    setCustomTokens(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleSave = () => {
    onSave(customTokens);
  };

  const resetToDefaults = () => {
    setCustomTokens({
      colors: {},
      typography: {},
      spacing: {},
      effects: {}
    });
    toast.success("Reset to Sturij defaults");
  };

  const copyTokensToClipboard = () => {
    const cssVars = generateCSSVariables(customTokens);
    navigator.clipboard.writeText(cssVars);
    toast.success("CSS variables copied to clipboard");
  };

  const generateCSSVariables = (tokens) => {
    let css = ":root {\n";
    
    // Colors
    Object.entries(tokens.colors || {}).forEach(([key, value]) => {
      css += `  --color-${key}: ${value};\n`;
    });
    
    // Typography
    Object.entries(tokens.typography || {}).forEach(([key, value]) => {
      css += `  --font-${key}: ${value};\n`;
    });
    
    css += "}\n";
    return css;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading font-medium text-[var(--color-midnight)]">
            Theme Token Editor
          </h3>
          <p className="text-sm text-[var(--color-charcoal)]">
            Customize design tokens using dropdown selections to avoid errors
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={resetToDefaults}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Reset
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={copyTokensToClipboard}
          >
            <Copy className="h-3 w-3 mr-1" />
            Copy CSS
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="h-3 w-3 mr-1" />
            {previewMode ? "Edit" : "Preview"}
          </Button>
        </div>
      </div>

      <Tabs value={activeSection} onValueChange={setActiveSection}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="colors" className="gap-1">
            <Palette className="h-4 w-4" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="typography" className="gap-1">
            <Type className="h-4 w-4" />
            Typography
          </TabsTrigger>
          <TabsTrigger value="spacing" className="gap-1">
            <Maximize className="h-4 w-4" />
            Spacing
          </TabsTrigger>
          <TabsTrigger value="effects" className="gap-1">
            <Layers className="h-4 w-4" />
            Effects
          </TabsTrigger>
        </TabsList>

        {/* Colors Tab */}
        <TabsContent value="colors">
          <Card className="border-[var(--color-background-muted)]">
            <CardContent className="pt-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="grid md:grid-cols-2 gap-6">
                  {Object.entries(STURIJ_TOKENS.colors).map(([colorKey, colorData]) => (
                    <ColorTokenEditor
                      key={colorKey}
                      tokenKey={colorKey}
                      tokenData={colorData}
                      value={customTokens.colors?.[colorKey]}
                      onChange={(key, value) => handleTokenChange("colors", key, value)}
                    />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Typography Tab */}
        <TabsContent value="typography">
          <Card className="border-[var(--color-background-muted)]">
            <CardContent className="pt-4">
              <Accordion type="multiple" defaultValue={["fonts", "sizes"]}>
                <AccordionItem value="fonts">
                  <AccordionTrigger>Font Families</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid md:grid-cols-2 gap-4 pt-2">
                      {Object.entries(STURIJ_TOKENS.typography.fontFamily).map(([key, data]) => (
                        <FontTokenEditor
                          key={key}
                          tokenKey={key}
                          tokenData={data}
                          value={customTokens.typography?.[`font-${key}`]}
                          onChange={(k, v) => handleTokenChange("typography", `font-${k}`, v)}
                        />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="sizes">
                  <AccordionTrigger>Font Sizes</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid md:grid-cols-3 gap-4 pt-2">
                      {Object.entries(STURIJ_TOKENS.typography.fontSize).map(([key, data]) => (
                        <div key={key} className="space-y-1">
                          <Label className="text-xs">{data.label}</Label>
                          <Select 
                            value={customTokens.typography?.[`size-${key}`] || data.value}
                            onValueChange={(v) => handleTokenChange("typography", `size-${key}`, v)}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(STURIJ_TOKENS.typography.fontSize).map(([k, d]) => (
                                <SelectItem key={k} value={d.value}>{d.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="lineHeight">
                  <AccordionTrigger>Line Heights</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid md:grid-cols-3 gap-4 pt-2">
                      {Object.entries(STURIJ_TOKENS.typography.lineHeight).map(([key, data]) => (
                        <div key={key} className="flex items-center justify-between p-2 bg-[var(--color-background)] rounded">
                          <span className="text-sm">{data.label}</span>
                          <Badge variant="outline">{data.value}</Badge>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="letterSpacing">
                  <AccordionTrigger>Letter Spacing</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid md:grid-cols-3 gap-4 pt-2">
                      {Object.entries(STURIJ_TOKENS.typography.letterSpacing).map(([key, data]) => (
                        <div key={key} className="flex items-center justify-between p-2 bg-[var(--color-background)] rounded">
                          <span className="text-sm">{data.label}</span>
                          <Badge variant="outline">{data.value}</Badge>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Spacing Tab */}
        <TabsContent value="spacing">
          <Card className="border-[var(--color-background-muted)]">
            <CardContent className="pt-4">
              <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                {Object.entries(STURIJ_TOKENS.spacing).map(([key, value]) => (
                  <div 
                    key={key} 
                    className="p-3 bg-[var(--color-background)] rounded-lg text-center border border-[var(--color-background-muted)]"
                  >
                    <div className="text-xs text-[var(--color-charcoal)] mb-1">--spacing-{key}</div>
                    <div className="font-mono text-sm text-[var(--color-midnight)]">{value}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Effects Tab */}
        <TabsContent value="effects">
          <Card className="border-[var(--color-background-muted)]">
            <CardContent className="pt-4">
              <Accordion type="multiple" defaultValue={["radius", "shadows"]}>
                <AccordionItem value="radius">
                  <AccordionTrigger>Border Radius</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid md:grid-cols-3 gap-4 pt-2">
                      {Object.entries(STURIJ_TOKENS.radius).map(([key, data]) => (
                        <div key={key} className="flex items-center gap-3 p-2 bg-[var(--color-background)] rounded">
                          <div 
                            className="w-8 h-8 bg-[var(--color-primary)]"
                            style={{ borderRadius: data.value }}
                          />
                          <div>
                            <div className="text-sm font-medium">{data.label}</div>
                            <div className="text-xs text-[var(--color-charcoal)]">{data.value}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="shadows">
                  <AccordionTrigger>Shadows</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid md:grid-cols-2 gap-4 pt-2">
                      {Object.entries(STURIJ_TOKENS.shadows).map(([key, data]) => (
                        <div 
                          key={key} 
                          className="p-4 bg-white rounded-lg"
                          style={{ boxShadow: data.value }}
                        >
                          <div className="text-sm font-medium text-[var(--color-midnight)]">{data.label}</div>
                          <div className="text-xs text-[var(--color-charcoal)] mt-1">--shadow-{key}</div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="transitions">
                  <AccordionTrigger>Transitions</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid md:grid-cols-2 gap-4 pt-2">
                      {Object.entries(STURIJ_TOKENS.transitions).map(([key, data]) => (
                        <div key={key} className="flex items-center justify-between p-3 bg-[var(--color-background)] rounded">
                          <span className="text-sm font-medium">{data.label}</span>
                          <Badge variant="outline">{data.value}</Badge>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end gap-2 pt-4 border-t border-[var(--color-background-muted)]">
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white"
        >
          {isSaving ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Check className="h-4 w-4 mr-2" />
          )}
          Save Token Customizations
        </Button>
      </div>
    </div>
  );
}

// Export tokens for use elsewhere
export { STURIJ_TOKENS };