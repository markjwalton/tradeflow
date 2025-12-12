import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { Copy, Check, Sparkles, Save, X, Loader2, RefreshCw } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const OklchPaletteTool = ({ onSave, brandColors: initialBrandColors }) => {
  const [baseColor, setBaseColor] = useState({ l: 0, c: 0, h: 0 });
  const [startingColorInput, setStartingColorInput] = useState("");
  const [paletteType, setPaletteType] = useState("monochromatic");
  const [colorCount, setColorCount] = useState(5);
  const [colors, setColors] = useState([]);
  const [paletteName, setPaletteName] = useState("");
  const [paletteDescription, setPaletteDescription] = useState("");
  const [paletteTags, setPaletteTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [brandColors, setBrandColors] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(null);
  // Brand color generator state
  const [primaryColor, setPrimaryColor] = useState("var(--color-primary)");
  const [secondaryColor, setSecondaryColor] = useState("var(--color-secondary)");
  const [accentColor, setAccentColor] = useState("var(--color-accent)");

  // Load colors from CSS variables after component mounts - now OKLCH-first
  useEffect(() => {
    const loadThemeColors = () => {
      const primary = getComputedStyle(document.documentElement).getPropertyValue('--primary-500').trim();
      const secondary = getComputedStyle(document.documentElement).getPropertyValue('--secondary-400').trim();
      const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent-300').trim();
      
      // Colors are now in OKLCH format, parse and display accordingly
      if (primary) {
        const parsed = parseColorInput(primary);
        if (parsed) {
          setPrimaryColor(formatColorForDisplay(parsed, primaryFormat));
        }
      }
      
      if (secondary) {
        const parsed = parseColorInput(secondary);
        if (parsed) {
          setSecondaryColor(formatColorForDisplay(parsed, secondaryFormat));
        }
      }
      
      if (accent) {
        const parsed = parseColorInput(accent);
        if (parsed) {
          setAccentColor(formatColorForDisplay(parsed, accentFormat));
        }
      }
    };

    loadThemeColors();
    const timer = setTimeout(loadThemeColors, 300);
    return () => clearTimeout(timer);
  }, []);
  const [customColors, setCustomColors] = useState([]);
  const [customColorName, setCustomColorName] = useState("");
  const [customColorHex, setCustomColorHex] = useState("oklch(0.0 0.0 0)");
  
  // Format selectors and alpha support - default to OKLCH
  const [primaryFormat, setPrimaryFormat] = useState("oklch");
  const [secondaryFormat, setSecondaryFormat] = useState("oklch");
  const [accentFormat, setAccentFormat] = useState("oklch");
  const [manualInputFormat, setManualInputFormat] = useState("oklch");
  const [alphaEnabled, setAlphaEnabled] = useState(false);
  const [alphaPercentage, setAlphaPercentage] = useState(50);
  
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
  
  const generatePalette = () => {
    const palette = [];
    const { l, c, h } = baseColor;
    
    if (paletteType === "monochromatic") {
      for (let i = 0; i < colorCount; i++) {
        const lightness = 0.2 + (0.8 / (colorCount - 1)) * i;
        palette.push({ l: lightness, c, h, name: `Shade ${i + 1}` });
      }
    } else if (paletteType === "analogous") {
      const spread = 30;
      for (let i = 0; i < colorCount; i++) {
        const hueShift = -spread + (spread * 2 / (colorCount - 1)) * i;
        palette.push({ l, c, h: (h + hueShift + 360) % 360, name: `Color ${i + 1}` });
      }
    } else if (paletteType === "complementary") {
      palette.push({ l, c, h, name: "Base" });
      palette.push({ l, c, h: (h + 180) % 360, name: "Complement" });
      if (colorCount > 2) {
        for (let i = 2; i < colorCount; i++) {
          const lightness = 0.3 + (0.6 / (colorCount - 2)) * (i - 2);
          palette.push({ l: lightness, c: c * 0.5, h, name: `Tint ${i - 1}` });
        }
      }
    } else if (paletteType === "triadic") {
      palette.push({ l, c, h, name: "Base" });
      palette.push({ l, c, h: (h + 120) % 360, name: "Triadic 1" });
      palette.push({ l, c, h: (h + 240) % 360, name: "Triadic 2" });
      if (colorCount > 3) {
        for (let i = 3; i < colorCount; i++) {
          const lightness = 0.3 + (0.6 / (colorCount - 3)) * (i - 3);
          palette.push({ l: lightness, c: c * 0.6, h, name: `Tint ${i - 2}` });
        }
      }
    } else if (paletteType === "split-complementary") {
      palette.push({ l, c, h, name: "Base" });
      palette.push({ l, c, h: (h + 150) % 360, name: "Split 1" });
      palette.push({ l, c, h: (h + 210) % 360, name: "Split 2" });
      if (colorCount > 3) {
        for (let i = 3; i < colorCount; i++) {
          const lightness = 0.3 + (0.6 / (colorCount - 3)) * (i - 3);
          palette.push({ l: lightness, c: c * 0.5, h, name: `Tint ${i - 2}` });
        }
      }
    }
    
    setColors(palette);
  };
  
  // Don't auto-generate on mount, only when user clicks generate
  
  const copyColor = (color, format) => {
    let text = "";
    if (format === "oklch") {
      text = `oklch(${color.l.toFixed(3)} ${color.c.toFixed(3)} ${color.h.toFixed(1)})`;
    } else {
      text = oklchToRgb(color.l, color.c, color.h);
    }
    navigator.clipboard.writeText(text);
    setCopied(`${format}-${color.name}`);
    setTimeout(() => setCopied(null), 2000);
  };

  const generateAINames = async () => {
    setIsGenerating(true);
    try {
      const prompt = `Generate creative, descriptive names for these colors: ${colors.map((c, i) => `Color ${i + 1}: oklch(${c.l.toFixed(3)} ${c.c.toFixed(3)} ${c.h.toFixed(1)})`).join(", ")}. Return a JSON array of names only.`;
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: { type: "object", properties: { names: { type: "array", items: { type: "string" } } } }
      });
      if (result.names) {
        setColors(colors.map((c, i) => ({ ...c, name: result.names[i] || c.name })));
      }
    } catch (e) {
      console.error("AI naming failed:", e);
    }
    setIsGenerating(false);
  };

  const generateAITags = async () => {
    setIsGenerating(true);
    try {
      const prompt = `Generate 3-5 relevant tags for a color palette with these colors: ${colors.map(c => c.name).join(", ")}. Consider mood, style, use case. Return a JSON array of lowercase tags.`;
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: { type: "object", properties: { tags: { type: "array", items: { type: "string" } } } }
      });
      if (result.tags) {
        setPaletteTags(result.tags);
      }
    } catch (e) {
      console.error("AI tag generation failed:", e);
    }
    setIsGenerating(false);
  };

  const generateFromPrompt = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const prompt = `Create a color palette based on: "${aiPrompt}". Generate ${colorCount} colors in OKLCH format. Return JSON with: name, description, colors array (each with name, lightness 0-1, chroma 0-0.4, hue 0-360).`;
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            colors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  lightness: { type: "number" },
                  chroma: { type: "number" },
                  hue: { type: "number" }
                }
              }
            }
          }
        }
      });
      if (result.colors) {
        setPaletteName(result.name || aiPrompt);
        setPaletteDescription(result.description || "");
        setColors(result.colors.map(c => ({
          l: c.lightness,
          c: c.chroma,
          h: c.hue,
          name: c.name
        })));
      }
    } catch (e) {
      console.error("AI palette generation failed:", e);
    }
    setIsGenerating(false);
  };

  const generateFromBrandColors = async () => {
    if (!brandColors.trim()) return;
    setIsGenerating(true);
    try {
      const prompt = `Create a harmonious color palette of ${colorCount} colors based on these brand colors: ${brandColors}. Return JSON with: name, description, colors array (each with name, lightness 0-1, chroma 0-0.4, hue 0-360).`;
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            colors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  lightness: { type: "number" },
                  chroma: { type: "number" },
                  hue: { type: "number" }
                }
              }
            }
          }
        }
      });
      if (result.colors) {
        setPaletteName(result.name || "Brand Palette");
        setPaletteDescription(result.description || "");
        setColors(result.colors.map(c => ({
          l: c.lightness,
          c: c.chroma,
          h: c.hue,
          name: c.name
        })));
      }
    } catch (e) {
      console.error("AI brand palette failed:", e);
    }
    setIsGenerating(false);
  };

  const [uploadedFile, setUploadedFile] = useState(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const analyzePhoto = async () => {
    if (!uploadedFile) return;
    setIsGenerating(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: uploadedFile });
      const prompt = `${aiPrompt}\n\nAnalyze this image and extract a harmonious color palette of ${colorCount} colors based on the description above. Return JSON with: name, description, colors array (each with name, lightness 0-1, chroma 0-0.4, hue 0-360).`;
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            colors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  lightness: { type: "number" },
                  chroma: { type: "number" },
                  hue: { type: "number" }
                }
              }
            }
          }
        }
      });
      if (result.colors) {
        setPaletteName(result.name || "Photo Palette");
        setPaletteDescription(result.description || "");
        setColors(result.colors.map(c => ({
          l: c.lightness,
          c: c.chroma,
          h: c.hue,
          name: c.name
        })));
      }
    } catch (e) {
      console.error("Photo analysis failed:", e);
    }
    setIsGenerating(false);
  };

  const applyStartingColor = () => {
    const input = startingColorInput.trim();
    if (!input) return;
    
    const parsed = parseColorInput(input);
    if (parsed) {
      setBaseColor(parsed);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !paletteTags.includes(tagInput.trim())) {
      setPaletteTags([...paletteTags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag) => {
    setPaletteTags(paletteTags.filter(t => t !== tag));
  };
  
  const rgbToOklch = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const c = Math.sqrt(Math.pow(r - l, 2) + Math.pow(g - l, 2) + Math.pow(b - l, 2)) * 0.4;
    const h = Math.atan2(b - l, r - l) * 180 / Math.PI;
    return { l, c, h: (h + 360) % 360 };
  };

  const hslToOklch = (h, s, l) => {
    // Convert HSL to RGB first
    s /= 100; l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; }
    else if (h < 120) { r = x; g = c; }
    else if (h < 180) { g = c; b = x; }
    else if (h < 240) { g = x; b = c; }
    else if (h < 300) { r = x; b = c; }
    else { r = c; b = x; }
    return rgbToOklch((r + m) * 255, (g + m) * 255, (b + m) * 255);
  };

  const hexToOklch = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return rgbToOklch(r, g, b);
  };

  const parseColorInput = (input) => {
    const trimmed = input.trim();
    if (trimmed.startsWith('#')) {
      return hexToOklch(trimmed);
    } else if (trimmed.startsWith('oklch')) {
      const match = trimmed.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/);
      if (match) {
        return { l: parseFloat(match[1]), c: parseFloat(match[2]), h: parseFloat(match[3]) };
      }
    } else if (trimmed.startsWith('rgb')) {
      const match = trimmed.match(/rgb\((\d+),?\s*(\d+),?\s*(\d+)\)/);
      if (match) {
        return rgbToOklch(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]));
      }
    } else if (trimmed.startsWith('hsl')) {
      const match = trimmed.match(/hsl\((\d+),?\s*(\d+)%?,?\s*(\d+)%?\)/);
      if (match) {
        return hslToOklch(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]));
      }
    }
    return null;
  };

  const formatColorForDisplay = (oklch, format) => {
    if (format === "oklch") {
      return `oklch(${oklch.l.toFixed(3)} ${oklch.c.toFixed(3)} ${oklch.h.toFixed(1)})`;
    } else if (format === "hex") {
      return oklchToRgb(oklch.l, oklch.c, oklch.h);
    } else if (format === "rgb") {
      const hex = oklchToRgb(oklch.l, oklch.c, oklch.h);
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgb(${r}, ${g}, ${b})`;
    } else if (format === "hsl") {
      const hex = oklchToRgb(oklch.l, oklch.c, oklch.h);
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;
      if (max === min) { h = s = 0; }
      else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        else if (max === g) h = ((b - r) / d + 2) / 6;
        else h = ((r - g) / d + 4) / 6;
      }
      return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
    }
    return oklchToRgb(oklch.l, oklch.c, oklch.h);
  };

  const generateShades = (baseHex, colorType) => {
    const base = hexToOklch(baseHex);
    return generateShadesFromOklch(base, colorType);
  };

  const generateShadesFromOklch = (base, colorType) => {
    const shades = [
      { shade: "100", l: Math.min(0.95, base.l + 0.3), c: base.c * 0.3 },
      { shade: "300", l: Math.min(0.8, base.l + 0.15), c: base.c * 0.6 },
      { shade: "500", l: base.l, c: base.c },
      { shade: "700", l: Math.max(0.3, base.l - 0.15), c: base.c * 1.1 },
      { shade: "900", l: Math.max(0.2, base.l - 0.3), c: base.c * 0.8 }
    ];
    
    return shades.map(s => ({
      name: `${colorType}-${s.shade}`,
      l: s.l,
      c: s.c,
      h: base.h,
      color_type: colorType,
      shade: s.shade
    }));
  };

  const generateBrandPalette = () => {
    const palette = [];
    
    // Parse colors - handle multiple formats
    const parsedPrimary = parseColorInput(primaryColor) || hexToOklch(primaryColor);
    const parsedSecondary = parseColorInput(secondaryColor) || hexToOklch(secondaryColor);
    const parsedAccent = parseColorInput(accentColor) || hexToOklch(accentColor);
    
    // Generate shades for primary, secondary, accent
    palette.push(...generateShadesFromOklch(parsedPrimary, "primary"));
    palette.push(...generateShadesFromOklch(parsedSecondary, "secondary"));
    palette.push(...generateShadesFromOklch(parsedAccent, "accent"));
    
    // Add alpha variants if enabled
    if (alphaEnabled) {
      const alpha = alphaPercentage / 100;
      palette.push({
        name: `primary-alpha-${alphaPercentage}`,
        l: parsedPrimary.l,
        c: parsedPrimary.c,
        h: parsedPrimary.h,
        alpha,
        color_type: "primary",
        shade: "alpha"
      });
      palette.push({
        name: `secondary-alpha-${alphaPercentage}`,
        l: parsedSecondary.l,
        c: parsedSecondary.c,
        h: parsedSecondary.h,
        alpha,
        color_type: "secondary",
        shade: "alpha"
      });
      palette.push({
        name: `accent-alpha-${alphaPercentage}`,
        l: parsedAccent.l,
        c: parsedAccent.c,
        h: parsedAccent.h,
        alpha,
        color_type: "accent",
        shade: "alpha"
      });
    }
    
    // Add custom colors
    customColors.forEach(cc => {
      const parsed = parseColorInput(cc.hex) || hexToOklch(cc.hex);
      palette.push({
        name: cc.name,
        l: parsed.l,
        c: parsed.c,
        h: parsed.h,
        color_type: "custom",
        shade: null
      });
    });
    
    setColors(palette);
    setPaletteName("Brand Color System");
    setPaletteDescription("Generated brand color palette with shades" + (alphaEnabled ? ` and ${alphaPercentage}% alpha variants` : ""));
    setPaletteTags(["brand", "system"]);
  };

  const addCustomColor = () => {
    if (customColorName.trim() && customColorHex) {
      setCustomColors([...customColors, { name: customColorName, hex: customColorHex }]);
      setCustomColorName("");
      setCustomColorHex("#000000");
    }
  };

  const removeCustomColor = (index) => {
    setCustomColors(customColors.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (onSave && paletteName && colors.length > 0) {
      // Check if this is a brand palette (has color_type)
      const isBrandPalette = colors.some(c => c.color_type);
      
      const paletteData = {
        name: paletteName,
        description: paletteDescription,
        category: isBrandPalette ? "group" : "palette",
        colors: colors.map(color => ({
          name: color.name,
          oklch: color.alpha 
            ? `oklch(${color.l.toFixed(3)} ${color.c.toFixed(3)} ${color.h.toFixed(1)} / ${color.alpha})`
            : `oklch(${color.l.toFixed(3)} ${color.c.toFixed(3)} ${color.h.toFixed(1)})`,
          hex: oklchToRgb(color.l, color.c, color.h), // HEX kept for display/compatibility only
          color_type: color.color_type || null,
          shade: color.shade || null,
          alpha: color.alpha || null
        })),
        tags: paletteTags.length > 0 ? paletteTags : [paletteType]
      };
      
      // If it's a brand palette, set it to be its own group
      if (isBrandPalette) {
        const result = await onSave(paletteData);
        // The saved palette will have its ID set as palette_group_id
      } else {
        onSave(paletteData);
      }
      
      setPaletteName("");
      setPaletteDescription("");
      setPaletteTags([]);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card className="rounded-xl border-2 border-primary/20">
        <CardHeader>
          <CardTitle>Brand Color System Generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-end mb-3">
            <div className="flex items-center gap-2">
              <Label className="text-xs">Input Format:</Label>
              <Select value={primaryFormat} onValueChange={(val) => {
                setPrimaryFormat(val);
                setSecondaryFormat(val);
                setAccentFormat(val);
                // Convert current values to new format
                const primary = parseColorInput(primaryColor);
                const secondary = parseColorInput(secondaryColor);
                const accent = parseColorInput(accentColor);
                if (primary) setPrimaryColor(formatColorForDisplay(primary, val));
                if (secondary) setSecondaryColor(formatColorForDisplay(secondary, val));
                if (accent) setAccentColor(formatColorForDisplay(accent, val));
              }}>
                <SelectTrigger className="w-24 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hex">HEX</SelectItem>
                  <SelectItem value="rgb">RGB</SelectItem>
                  <SelectItem value="hsl">HSL</SelectItem>
                  <SelectItem value="oklch">OKLCH</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={(() => {
                    const parsed = parseColorInput(primaryColor);
                    return parsed ? oklchToRgb(parsed.l, parsed.c, parsed.h) : (primaryColor.startsWith('#') ? primaryColor : 'var(--color-primary)');
                  })()}
                  onChange={(e) => {
                    const oklch = hexToOklch(e.target.value);
                    setPrimaryColor(formatColorForDisplay(oklch, primaryFormat));
                  }}
                  className="w-16 h-10 p-1"
                />
                <div className="flex-1 space-y-1">
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    placeholder={primaryFormat === 'hex' ? 'var(--color-primary)' : primaryFormat === 'rgb' ? 'rgb(74, 93, 78)' : primaryFormat === 'hsl' ? 'hsl(135, 15%, 33%)' : 'oklch(0.5 0.1 150)'}
                  />
                  {primaryFormat !== 'oklch' && parseColorInput(primaryColor) && (
                    <p className="text-xs text-muted-foreground font-mono">
                      → {formatColorForDisplay(parseColorInput(primaryColor), "oklch")}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Secondary Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={(() => {
                    const parsed = parseColorInput(secondaryColor);
                    return parsed ? oklchToRgb(parsed.l, parsed.c, parsed.h) : (secondaryColor.startsWith('#') ? secondaryColor : 'var(--color-secondary)');
                  })()}
                  onChange={(e) => {
                    const oklch = hexToOklch(e.target.value);
                    setSecondaryColor(formatColorForDisplay(oklch, secondaryFormat));
                  }}
                  className="w-16 h-10 p-1"
                />
                <div className="flex-1 space-y-1">
                  <Input
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    placeholder={secondaryFormat === 'hex' ? 'var(--color-secondary)' : secondaryFormat === 'rgb' ? 'rgb(212, 165, 116)' : secondaryFormat === 'hsl' ? 'hsl(31, 52%, 64%)' : 'oklch(0.7 0.09 70)'}
                  />
                  {secondaryFormat !== 'oklch' && parseColorInput(secondaryColor) && (
                    <p className="text-xs text-muted-foreground font-mono">
                      → {formatColorForDisplay(parseColorInput(secondaryColor), "oklch")}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Accent Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={(() => {
                    const parsed = parseColorInput(accentColor);
                    return parsed ? oklchToRgb(parsed.l, parsed.c, parsed.h) : (accentColor.startsWith('#') ? accentColor : 'var(--color-accent)');
                  })()}
                  onChange={(e) => {
                    const oklch = hexToOklch(e.target.value);
                    setAccentColor(formatColorForDisplay(oklch, accentFormat));
                  }}
                  className="w-16 h-10 p-1"
                />
                <div className="flex-1 space-y-1">
                  <Input
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    placeholder={accentFormat === 'hex' ? 'var(--color-accent)' : accentFormat === 'rgb' ? 'rgb(217, 180, 167)' : accentFormat === 'hsl' ? 'hsl(16, 37%, 75%)' : 'oklch(0.78 0.05 35)'}
                  />
                  {accentFormat !== 'oklch' && parseColorInput(accentColor) && (
                    <p className="text-xs text-muted-foreground font-mono">
                      → {formatColorForDisplay(parseColorInput(accentColor), "oklch")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Additional Custom Colors</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Color name..."
                value={customColorName}
                onChange={(e) => setCustomColorName(e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="var(--color-*) or hex/rgb/hsl/oklch"
                value={customColorHex}
                onChange={(e) => setCustomColorHex(e.target.value)}
                className="flex-1"
              />
              <Button onClick={addCustomColor} size="sm">Add</Button>
            </div>
            {customColors.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {customColors.map((cc, i) => (
                  <Badge key={i} variant="secondary" className="gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cc.hex }} />
                    {cc.name}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeCustomColor(i)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2 border-t pt-4">
            <div className="flex items-center justify-between">
              <Label>Alpha/Transparency Variants</Label>
              <Switch checked={alphaEnabled} onCheckedChange={setAlphaEnabled} />
            </div>
            {alphaEnabled && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs">Alpha Percentage</Label>
                  <span className="text-xs text-muted-foreground">{alphaPercentage}%</span>
                </div>
                <Slider
                  value={[alphaPercentage]}
                  onValueChange={([val]) => setAlphaPercentage(val)}
                  min={10}
                  max={90}
                  step={5}
                />
                <p className="text-xs text-muted-foreground">
                  Generates alpha variants for overlays on photos/backgrounds
                </p>
              </div>
            )}
          </div>

          <Button onClick={generateBrandPalette} className="w-full">
            <Sparkles className="h-4 w-4 mr-2" /> Generate Brand Palette ({alphaEnabled ? '18' : '15'} colors + custom)
          </Button>
          
          <p className="text-xs text-muted-foreground">
            Generates 5 shades (100, 300, 500, 700, 900) for each base color plus any custom colors you add.
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle>AI Palette Generation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Upload Photo (Optional)</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              disabled={isGenerating}
            />
            {uploadedFile && (
              <p className="text-xs text-muted-foreground">Photo uploaded: {uploadedFile.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Describe Your Palette</Label>
            <Textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder={uploadedFile 
                ? "Describe the elements to take inspiration from in the photo (e.g., the warm tones in the sunset, the blue-green ocean water, the golden sand...)" 
                : "Describe your desired palette (e.g., modern tech startup, warm autumn, ocean sunset...)"}
              disabled={isGenerating}
              rows={3}
            />
            <Button onClick={uploadedFile ? analyzePhoto : generateFromPrompt} disabled={isGenerating || !aiPrompt.trim()} className="w-full">
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
              Generate Palette
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manual Palette Generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-end mb-2">
            <div className="flex items-center gap-2">
              <Label className="text-xs">Input Format:</Label>
              <Select value={manualInputFormat} onValueChange={(val) => {
                setManualInputFormat(val);
                // Convert current base color to new format
                if (baseColor.l || baseColor.c || baseColor.h) {
                  setStartingColorInput(formatColorForDisplay(baseColor, val));
                }
              }}>
                <SelectTrigger className="w-24 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hex">HEX</SelectItem>
                  <SelectItem value="rgb">RGB</SelectItem>
                  <SelectItem value="hsl">HSL</SelectItem>
                  <SelectItem value="oklch">OKLCH</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Starting Color (Optional)</Label>
            <div className="flex gap-2">
              <Input
                value={startingColorInput}
                onChange={(e) => setStartingColorInput(e.target.value)}
                placeholder={
                  manualInputFormat === 'hex' ? 'var(--color-primary)' : 
                  manualInputFormat === 'rgb' ? 'rgb(74, 93, 78)' : 
                  manualInputFormat === 'hsl' ? 'hsl(135, 15%, 33%)' : 
                  'oklch(0.5 0.1 150)'
                }
              />
              <Button onClick={applyStartingColor} size="sm">Apply</Button>
            </div>
            {manualInputFormat !== 'oklch' && startingColorInput && parseColorInput(startingColorInput) && (
              <p className="text-xs text-muted-foreground font-mono">
                → {formatColorForDisplay(parseColorInput(startingColorInput), "oklch")}
              </p>
            )}
          </div>
          
          <div 
            className="w-full h-24 rounded-lg border-2 border-border"
            style={{ backgroundColor: oklchToRgb(baseColor.l, baseColor.c, baseColor.h) }}
          />
          
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-xs">Lightness</Label>
                <span className="text-xs text-muted-foreground">{baseColor.l.toFixed(2)}</span>
              </div>
              <Slider 
                value={[baseColor.l * 100]} 
                onValueChange={([val]) => setBaseColor({...baseColor, l: val / 100})}
                min={0}
                max={100}
                step={1}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-xs">Chroma</Label>
                <span className="text-xs text-muted-foreground">{baseColor.c.toFixed(2)}</span>
              </div>
              <Slider 
                value={[baseColor.c * 250]} 
                onValueChange={([val]) => setBaseColor({...baseColor, c: val / 250})}
                min={0}
                max={100}
                step={1}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-xs">Hue</Label>
                <span className="text-xs text-muted-foreground">{baseColor.h.toFixed(0)}°</span>
              </div>
              <Slider 
                value={[baseColor.h]} 
                onValueChange={([val]) => setBaseColor({...baseColor, h: val})}
                min={0}
                max={360}
                step={1}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={paletteType} onValueChange={setPaletteType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monochromatic">Monochromatic</SelectItem>
                  <SelectItem value="analogous">Analogous</SelectItem>
                  <SelectItem value="complementary">Complementary</SelectItem>
                  <SelectItem value="triadic">Triadic</SelectItem>
                  <SelectItem value="split-complementary">Split Complementary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Color Count</Label>
              <Input 
                type="number" 
                value={colorCount} 
                onChange={(e) => setColorCount(Math.max(2, Math.min(10, parseInt(e.target.value) || 5)))}
                min={2}
                max={10}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={generatePalette} variant="outline" className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" /> Generate
            </Button>
            {colors.length > 0 && (
              <Button onClick={() => setColors([])} variant="ghost" className="flex-1">
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      {colors.length > 0 && (
        <Card className="rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Generated Palette</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={generateAINames} disabled={isGenerating}>
                <Sparkles className="h-4 w-4 mr-1" />AI Names
              </Button>
              <Button size="sm" variant="outline" onClick={generateAITags} disabled={isGenerating}>
                <Sparkles className="h-4 w-4 mr-1" />AI Tags
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {colors.map((color, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div 
                    className="h-12 flex-1 rounded border relative overflow-hidden"
                  >
                    <div 
                      className="absolute inset-0"
                      style={{ 
                        backgroundColor: oklchToRgb(color.l, color.c, color.h),
                        opacity: color.alpha || 1
                      }}
                    />
                    {color.alpha && (
                      <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,#ccc_0,#ccc_10px,#fff_10px,#fff_20px)] -z-10" />
                    )}
                  </div>
                  <Input
                    value={color.name}
                    onChange={(e) => {
                      const updated = [...colors];
                      updated[index].name = e.target.value;
                      setColors(updated);
                    }}
                    className="flex-1"
                  />
                  <div className="flex flex-col gap-1">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyColor(color, "hex")}
                      className="h-7 px-2"
                    >
                      {copied === `hex-${color.name}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyColor(color, "oklch")}
                      className="h-7 px-2"
                    >
                      {copied === `oklch-${color.name}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground font-mono space-y-1">
                  <div>HEX: {oklchToRgb(color.l, color.c, color.h)}</div>
                  <div>OKLCH: oklch({color.l.toFixed(3)} {color.c.toFixed(3)} {color.h.toFixed(1)}{color.alpha ? ` / ${color.alpha}` : ''})</div>
                  {color.alpha && <div className="text-primary">Alpha: {Math.round(color.alpha * 100)}%</div>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      
      {onSave && colors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Save to Library</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Palette Name</Label>
              <Input 
                placeholder="e.g., Ocean Breeze" 
                value={paletteName}
                onChange={(e) => setPaletteName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={paletteDescription}
                onChange={(e) => setPaletteDescription(e.target.value)}
                placeholder="e.g., Cool tones inspired by coastal waters"
              />
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addTag()}
                  placeholder="Add tag..."
                />
                <Button onClick={addTag} size="sm">Add</Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {paletteTags.map(tag => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                  </Badge>
                ))}
              </div>
            </div>

            <Button onClick={handleSave} className="w-full" disabled={!paletteName}>
              <Save className="h-4 w-4 mr-2" /> Save to Library
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OklchPaletteTool;