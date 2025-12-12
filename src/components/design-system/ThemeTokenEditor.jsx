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
      base: "oklch(0.398 0.037 159.8)",
      variants: {
        "50": "oklch(0.972 0.011 159.8)",
        "100": "oklch(0.945 0.022 159.8)",
        "200": "oklch(0.890 0.033 159.8)",
        "300": "oklch(0.791 0.044 159.8)",
        "400": "oklch(0.668 0.048 159.8)",
        "500": "oklch(0.398 0.037 159.8)",
        "600": "oklch(0.333 0.031 159.8)",
        "700": "oklch(0.279 0.026 159.8)",
        "800": "oklch(0.237 0.022 159.8)",
        "900": "oklch(0.204 0.019 159.8)",
        "light": "oklch(0.668 0.048 159.8)",
        "dark": "oklch(0.279 0.026 159.8)"
      }
    },
    secondary: {
      label: "Secondary (Warm Copper)",
      base: "oklch(0.728 0.074 70.3)",
      variants: {
        "50": "oklch(0.980 0.010 70.3)",
        "100": "oklch(0.960 0.020 70.3)",
        "200": "oklch(0.906 0.040 70.3)",
        "300": "oklch(0.835 0.060 70.3)",
        "400": "oklch(0.728 0.074 70.3)",
        "500": "oklch(0.676 0.085 70.3)",
        "600": "oklch(0.610 0.090 70.3)",
        "700": "oklch(0.516 0.076 70.3)",
        "800": "oklch(0.437 0.064 70.3)",
        "900": "oklch(0.374 0.054 70.3)",
        "light": "oklch(0.835 0.060 70.3)",
        "dark": "oklch(0.610 0.090 70.3)"
      }
    },
    accent: {
      label: "Accent (Soft Blush)",
      base: "oklch(0.785 0.044 35.6)",
      variants: {
        "50": "oklch(0.980 0.008 35.6)",
        "100": "oklch(0.957 0.016 35.6)",
        "200": "oklch(0.894 0.032 35.6)",
        "300": "oklch(0.785 0.044 35.6)",
        "400": "oklch(0.715 0.048 35.6)",
        "500": "oklch(0.646 0.052 35.6)",
        "600": "oklch(0.577 0.056 35.6)",
        "700": "oklch(0.490 0.047 35.6)",
        "800": "oklch(0.417 0.040 35.6)",
        "900": "oklch(0.357 0.034 35.6)",
        "light": "oklch(0.894 0.032 35.6)",
        "dark": "oklch(0.646 0.052 35.6)"
      }
    },
    background: {
      label: "Background",
      base: "oklch(0.962 0.010 83.1)",
      variants: {
        "paper": "oklch(1.000 0.000 0)",
        "subtle": "oklch(0.990 0.007 83.1)",
        "muted": "oklch(0.927 0.020 83.1)",
        "50": "oklch(0.990 0.007 83.1)",
        "100": "oklch(0.962 0.010 83.1)",
        "200": "oklch(0.927 0.020 83.1)",
        "300": "oklch(0.876 0.030 83.1)",
        "400": "oklch(0.809 0.040 83.1)"
      }
    },
    midnight: {
      label: "Midnight (Dark Blue-Grey)",
      base: "oklch(0.223 0.036 235.4)",
      variants: {
        "50": "oklch(0.970 0.007 235.4)",
        "100": "oklch(0.929 0.014 235.4)",
        "200": "oklch(0.859 0.026 235.4)",
        "300": "oklch(0.749 0.032 235.4)",
        "400": "oklch(0.619 0.038 235.4)",
        "500": "oklch(0.513 0.040 235.4)",
        "600": "oklch(0.451 0.041 235.4)",
        "700": "oklch(0.387 0.040 235.4)",
        "800": "oklch(0.341 0.038 235.4)",
        "900": "oklch(0.223 0.036 235.4)",
        "light": "oklch(0.341 0.038 235.4)",
        "dark": "oklch(0.223 0.036 235.4)"
      }
    },
    charcoal: {
      label: "Charcoal",
      base: "oklch(0.297 0.000 0)",
      variants: {
        "50": "oklch(0.975 0.000 0)",
        "100": "oklch(0.943 0.000 0)",
        "200": "oklch(0.878 0.000 0)",
        "300": "oklch(0.783 0.000 0)",
        "400": "oklch(0.667 0.000 0)",
        "500": "oklch(0.543 0.000 0)",
        "600": "oklch(0.439 0.000 0)",
        "700": "oklch(0.356 0.000 0)",
        "800": "oklch(0.297 0.000 0)",
        "900": "oklch(0.250 0.000 0)",
        "light": "oklch(0.439 0.000 0)",
        "dark": "oklch(0.250 0.000 0)"
      }
    },
    destructive: {
      label: "Destructive (Muted Red)",
      base: "oklch(0.482 0.071 25.7)",
      variants: {
        "light": "oklch(0.580 0.064 25.7)",
        "dark": "oklch(0.410 0.060 25.7)"
      }
    },
    success: {
      label: "Success",
      base: "oklch(0.513 0.040 159.8)",
      variants: {
        "light": "oklch(0.619 0.038 159.8)",
        "dark": "oklch(0.387 0.040 159.8)"
      }
    },
    warning: {
      label: "Warning",
      base: "oklch(0.676 0.085 70.3)",
      variants: {
        "light": "oklch(0.728 0.074 70.3)",
        "dark": "oklch(0.610 0.090 70.3)"
      }
    },
    info: {
      label: "Info",
      base: "oklch(0.513 0.040 235.4)",
      variants: {
        "light": "oklch(0.619 0.038 235.4)",
        "dark": "oklch(0.387 0.040 235.4)"
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
    xs: { label: "Extra Small", value: "0 1px 2px 0 oklch(0.223 0.036 235.4 / 0.05)" },
    sm: { label: "Small", value: "0 1px 3px 0 oklch(0.223 0.036 235.4 / 0.1), 0 1px 2px -1px oklch(0.223 0.036 235.4 / 0.1)" },
    md: { label: "Medium", value: "0 4px 6px -1px oklch(0.223 0.036 235.4 / 0.1), 0 2px 4px -2px oklch(0.223 0.036 235.4 / 0.1)" },
    lg: { label: "Large", value: "0 10px 15px -3px oklch(0.223 0.036 235.4 / 0.1), 0 4px 6px -4px oklch(0.223 0.036 235.4 / 0.1)" },
    xl: { label: "Extra Large", value: "0 20px 25px -5px oklch(0.223 0.036 235.4 / 0.1), 0 8px 10px -6px oklch(0.223 0.036 235.4 / 0.1)" },
    "2xl": { label: "2XL", value: "0 25px 50px -12px oklch(0.223 0.036 235.4 / 0.25)" },
    inner: { label: "Inner", value: "inset 0 2px 4px 0 oklch(0.223 0.036 235.4 / 0.05)" }
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