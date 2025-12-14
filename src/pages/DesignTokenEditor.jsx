import React, { useState, useEffect, lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, RotateCcw, Eye, Code, Palette, Loader2, Shapes } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

const Card = lazy(() => import("@/components/ui/card").then(m => ({ default: m.Card })));
const CardContent = lazy(() => import("@/components/ui/card").then(m => ({ default: m.CardContent })));
const CardDescription = lazy(() => import("@/components/ui/card").then(m => ({ default: m.CardDescription })));
const CardHeader = lazy(() => import("@/components/ui/card").then(m => ({ default: m.CardHeader })));
const CardTitle = lazy(() => import("@/components/ui/card").then(m => ({ default: m.CardTitle })));
const Tabs = lazy(() => import("@/components/ui/tabs").then(m => ({ default: m.Tabs })));
const TabsContent = lazy(() => import("@/components/ui/tabs").then(m => ({ default: m.TabsContent })));
const TabsList = lazy(() => import("@/components/ui/tabs").then(m => ({ default: m.TabsList })));
const TabsTrigger = lazy(() => import("@/components/ui/tabs").then(m => ({ default: m.TabsTrigger })));

// Color conversion utilities
const oklchToRgb = (l, c, h) => {
  const a = c * Math.cos((h * Math.PI) / 180);
  const b = c * Math.sin((h * Math.PI) / 180);
  
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.2914855480 * b;
  
  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;
  
  let r = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  let g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  let bl = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;
  
  r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r;
  g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g;
  bl = bl > 0.0031308 ? 1.055 * Math.pow(bl, 1 / 2.4) - 0.055 : 12.92 * bl;
  
  r = Math.max(0, Math.min(255, Math.round(r * 255)));
  g = Math.max(0, Math.min(255, Math.round(g * 255)));
  bl = Math.max(0, Math.min(255, Math.round(bl * 255)));
  
  return "#" + [r, g, bl].map(x => x.toString(16).padStart(2, "0")).join("");
};

const rgbToOklch = (r, g, b) => {
  // Convert RGB to linear RGB
  r = r / 255;
  g = g / 255;
  b = b / 255;
  
  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
  
  // Convert to LMS
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
  
  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);
  
  // Convert to OKLab
  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const bVal = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;
  
  // Convert to OKLCH
  const c = Math.sqrt(a * a + bVal * bVal);
  let h = Math.atan2(bVal, a) * 180 / Math.PI;
  if (h < 0) h += 360;
  
  return { l: L, c: c, h: h };
};

const hexToOklch = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return rgbToOklch(r, g, b);
};

const parseColorToHex = (value) => {
  if (!value) return '#000000';
  
  const trimmed = value.trim();
  
  // Already hex
  if (trimmed.startsWith('#')) {
    return trimmed.length === 7 ? trimmed : '#000000';
  }
  
  // OKLCH format: oklch(0.5 0.1 150) or oklch(50% 0.1 150) with optional alpha
  const oklchMatch = trimmed.match(/oklch\(([\d.]+%?)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*[\d.]+)?\)/);
  if (oklchMatch) {
    let l = parseFloat(oklchMatch[1]);
    if (oklchMatch[1].includes('%')) l = l / 100;
    const c = parseFloat(oklchMatch[2]);
    const h = parseFloat(oklchMatch[3]);
    return oklchToRgb(l, c, h);
  }
  
  // RGB/RGBA format
  const rgbMatch = trimmed.match(/rgba?\((\d+),?\s*(\d+),?\s*(\d+)(?:,?\s*[\d.]+)?\)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]).toString(16).padStart(2, '0');
    const g = parseInt(rgbMatch[2]).toString(16).padStart(2, '0');
    const b = parseInt(rgbMatch[3]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }
  
  // HSL format
  const hslMatch = trimmed.match(/hsl\((\d+),?\s*(\d+)%?,?\s*(\d+)%?\)/);
  if (hslMatch) {
    const h = parseInt(hslMatch[1]) / 360;
    const s = parseInt(hslMatch[2]) / 100;
    const l = parseInt(hslMatch[3]) / 100;
    
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const r = Math.round(hue2rgb(p, q, h + 1/3) * 255).toString(16).padStart(2, '0');
    const g = Math.round(hue2rgb(p, q, h) * 255).toString(16).padStart(2, '0');
    const b = Math.round(hue2rgb(p, q, h - 1/3) * 255).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }
  
  return '#000000';
};

const formatOklch = (oklch) => {
  return `oklch(${oklch.l.toFixed(3)} ${oklch.c.toFixed(3)} ${oklch.h.toFixed(1)})`;
};

const TOKEN_CATEGORIES = {
  colors: {
    label: "Colors",
    icon: Palette,
    tokens: [
      { name: "primary-500", label: "Primary", type: "color" },
      { name: "secondary-400", label: "Secondary", type: "color" },
      { name: "accent-300", label: "Accent", type: "color" },
      { name: "background", label: "Background", type: "color" },
      { name: "foreground", label: "Foreground", type: "color" },
      { name: "muted", label: "Muted", type: "color" },
      { name: "border", label: "Border", type: "color" },
      { name: "destructive", label: "Destructive", type: "color" },
    ]
  },
  typography: {
    label: "Typography",
    tokens: [
      { name: "font-family-display", label: "Display Font", type: "font" },
      { name: "font-family-body", label: "Body Font", type: "font" },
      { name: "font-family-mono", label: "Mono Font", type: "font" },
      { name: "font-size-base", label: "Base Font Size", type: "size" },
      { name: "leading-normal", label: "Line Height", type: "number" },
    ]
  },
  spacing: {
    label: "Spacing",
    tokens: [
      { name: "spacing-1", label: "Spacing 1", type: "size" },
      { name: "spacing-2", label: "Spacing 2", type: "size" },
      { name: "spacing-3", label: "Spacing 3", type: "size" },
      { name: "spacing-4", label: "Spacing 4", type: "size" },
      { name: "spacing-6", label: "Spacing 6", type: "size" },
      { name: "spacing-8", label: "Spacing 8", type: "size" },
    ]
  },
  radius: {
    label: "Border Radius",
    tokens: [
      { name: "radius-sm", label: "Small", type: "size" },
      { name: "radius", label: "Default", type: "size" },
      { name: "radius-lg", label: "Large", type: "size" },
      { name: "radius-xl", label: "Extra Large", type: "size" },
    ]
  },
  shadows: {
    label: "Shadows",
    tokens: [
      { name: "shadow-sm", label: "Small Shadow", type: "shadow" },
      { name: "shadow-md", label: "Medium Shadow", type: "shadow" },
      { name: "shadow-lg", label: "Large Shadow", type: "shadow" },
    ]
  },
  icons: {
    label: "Icons",
    icon: Shapes,
    tokens: [
      { name: "icon-size-sm", label: "Small Icon", type: "size", default: "16px" },
      { name: "icon-size-md", label: "Medium Icon", type: "size", default: "20px" },
      { name: "icon-size-lg", label: "Large Icon", type: "size", default: "24px" },
      { name: "icon-size-xl", label: "Extra Large Icon", type: "size", default: "32px" },
      { name: "icon-stroke-thin", label: "Thin Stroke", type: "number", default: "1" },
      { name: "icon-stroke-normal", label: "Normal Stroke", type: "number", default: "2" },
      { name: "icon-stroke-bold", label: "Bold Stroke", type: "number", default: "2.5" },
      { name: "icon-color-primary", label: "Primary Icon Color", type: "color" },
      { name: "icon-color-muted", label: "Muted Icon Color", type: "color" },
    ]
  }
};

export default function DesignTokenEditor() {
  const [tokens, setTokens] = useState({});
  const [originalTokens, setOriginalTokens] = useState({});
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    loadCurrentTokens();
  }, []);

  const loadCurrentTokens = async () => {
    try {
      const response = await base44.functions.invoke('readFileContent', {
        filePath: 'globals.css'
      });
      
      if (response.data.content) {
        const cssContent = response.data.content;
        const loadedTokens = {};
        
        // Parse CSS variables from :root section
        const rootMatch = cssContent.match(/:root\s*{([^}]+)}/s);
        if (rootMatch) {
          const rootContent = rootMatch[1];
          
          Object.values(TOKEN_CATEGORIES).forEach(category => {
            category.tokens.forEach(token => {
              const regex = new RegExp(`--${token.name}:\\s*([^;]+);`, 'i');
              const match = rootContent.match(regex);
              if (match) {
                loadedTokens[token.name] = match[1].trim();
              } else {
                loadedTokens[token.name] = '';
              }
            });
          });
        }
        
        setTokens(loadedTokens);
        setOriginalTokens(loadedTokens);
      }
    } catch (error) {
      console.error('Error loading tokens:', error);
      toast.error('Failed to load design tokens');
    }
  };

  const updateToken = (name, value) => {
    setTokens(prev => ({ ...prev, [name]: value }));
    if (previewMode) {
      document.documentElement.style.setProperty(`--${name}`, value);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await base44.functions.invoke('updateGlobalCSS', {
        cssVariables: tokens
      });

      if (response.data.success) {
        toast.success('Design tokens saved successfully');
        setOriginalTokens(tokens);
      } else {
        toast.error('Failed to save tokens');
      }
    } catch (error) {
      console.error('Error saving tokens:', error);
      toast.error('Error saving design tokens');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setTokens(originalTokens);
    Object.entries(originalTokens).forEach(([name, value]) => {
      document.documentElement.style.setProperty(`--${name}`, value);
    });
    toast.info('Tokens reset to saved values');
  };

  const hasChanges = JSON.stringify(tokens) !== JSON.stringify(originalTokens);

  return (
    <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Design Token Editor</h1>
          <p className="text-muted-foreground">
            Modify design tokens and save changes to globals.css
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? 'Preview On' : 'Preview Off'}
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasChanges}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={saving || !hasChanges}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {hasChanges && (
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
          <p className="text-sm">
            You have unsaved changes. Click "Save Changes" to persist them to globals.css
          </p>
        </div>
      )}

      <Tabs defaultValue="colors" className="space-y-4">
        <TabsList>
          {Object.entries(TOKEN_CATEGORIES).map(([key, category]) => (
            <TabsTrigger key={key} value={key}>
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(TOKEN_CATEGORIES).map(([key, category]) => (
          <TabsContent key={key} value={key}>
            <Card>
              <CardHeader>
                <CardTitle>{category.label}</CardTitle>
                <CardDescription>
                  Modify {category.label.toLowerCase()} tokens for your design system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {category.tokens.map(token => (
                    <TokenEditor
                      key={token.name}
                      token={token}
                      value={tokens[token.name] || ''}
                      onChange={(value) => updateToken(token.name, value)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Preview Components
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button>Primary Button</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
          
          <Card className="p-4">
            <h3 className="font-display text-lg mb-2">Sample Card</h3>
            <p className="text-body text-muted-foreground">
              This is sample text to preview typography changes.
            </p>
          </Card>

          <div className="flex gap-4 items-center">
            <div className="w-16 h-16 rounded bg-primary" />
            <div className="w-16 h-16 rounded bg-secondary" />
            <div className="w-16 h-16 rounded bg-accent" />
            <div className="w-16 h-16 rounded bg-muted" />
          </div>

          <div className="flex gap-4 items-center pt-4 border-t">
            <Eye className="text-primary" style={{ width: 'var(--icon-size-sm, 16px)', strokeWidth: 'var(--icon-stroke-thin, 1)' }} />
            <Eye className="text-primary" style={{ width: 'var(--icon-size-md, 20px)', strokeWidth: 'var(--icon-stroke-normal, 2)' }} />
            <Eye className="text-primary" style={{ width: 'var(--icon-size-lg, 24px)', strokeWidth: 'var(--icon-stroke-bold, 2.5)' }} />
            <Eye className="text-primary" style={{ width: 'var(--icon-size-xl, 32px)', strokeWidth: 'var(--icon-stroke-bold, 2.5)' }} />
          </div>
        </CardContent>
      </Card>
      </div>
    </Suspense>
  );
}

const DESIGN_TOKEN_COLORS = [
  { value: 'var(--primary-500)', label: 'Primary', cssVar: '--primary-500', rgb: '#3d5d45' },
  { value: 'var(--secondary-400)', label: 'Secondary', cssVar: '--secondary-400', rgb: '#bda176' },
  { value: 'var(--accent-300)', label: 'Accent', cssVar: '--accent-300', rgb: '#c9aca9' },
  { value: 'var(--foreground)', label: 'Foreground', cssVar: '--foreground', rgb: '#0f1621' },
  { value: 'var(--muted-foreground)', label: 'Muted', cssVar: '--muted-foreground', rgb: '#6b7280' },
  { value: 'var(--destructive)', label: 'Destructive', cssVar: '--destructive', rgb: '#a84032' },
  { value: 'var(--charcoal-900)', label: 'Charcoal', cssVar: '--charcoal-900', rgb: '#1a1a1a' },
  { value: 'var(--midnight-900)', label: 'Midnight', cssVar: '--midnight-900', rgb: '#0f1621' },
];

function TokenEditor({ token, value, onChange }) {
  const hexValue = token.type === 'color' ? parseColorToHex(value) : null;
  
  const handleColorPickerChange = (hexColor) => {
    // Convert HEX to OKLCH when user picks a color
    const oklch = hexToOklch(hexColor);
    const oklchString = formatOklch(oklch);
    onChange(oklchString);
  };
  
  return (
    <div className="space-y-2">
      <Label>{token.label}</Label>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={token.type === 'color' ? `oklch(0.5 0.1 150)` : token.default || ''}
          className="flex-1 font-mono text-sm"
        />
        {token.type === 'color' && (
          <input
            type="color"
            value={hexValue}
            onChange={(e) => handleColorPickerChange(e.target.value)}
            className="w-12 h-10 rounded border cursor-pointer"
          />
        )}
      </div>
      {token.type === 'color' && (
        <div className="flex gap-1.5 flex-wrap">
          {DESIGN_TOKEN_COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => onChange(color.value)}
              className="w-7 h-7 rounded border-2 hover:scale-110 transition-transform relative"
              style={{ backgroundColor: color.rgb || `var(${color.cssVar})` }}
              title={color.label}
            >
              {value === color.value && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full border border-black" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground font-mono">--{token.name}</p>
        {token.type === 'color' && hexValue && (
          <p className="text-xs text-muted-foreground font-mono">{hexValue}</p>
        )}
      </div>
    </div>
  );
}