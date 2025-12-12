import React, { useState, memo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { Copy, Check, Plus, Trash2, Save, Sparkles, Upload, X, Loader2 } from "lucide-react";

const OklchGradientTool = ({ onSave }) => {
  const [gradientType, setGradientType] = useState("linear");
  const [angle, setAngle] = useState(90);
  const [stops, setStops] = useState([
    { position: 0, l: 0.7, c: 0.15, h: 180 },
    { position: 100, l: 0.5, c: 0.2, h: 280 }
  ]);
  const [copied, setCopied] = useState(false);
  const [paletteName, setPaletteName] = useState("");
  const [paletteDescription, setPaletteDescription] = useState("");
  const [paletteTags, setPaletteTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [brandColors, setBrandColors] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
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
  
  const generateGradientCSS = () => {
    const sortedStops = [...stops].sort((a, b) => a.position - b.position);
    const colorStops = sortedStops.map(stop => {
      const hex = oklchToRgb(stop.l, stop.c, stop.h);
      return `${hex} ${stop.position}%`;
    }).join(", ");
    
    if (gradientType === "linear") {
      return `linear-gradient(${angle}deg, ${colorStops})`;
    } else if (gradientType === "radial") {
      return `radial-gradient(circle, ${colorStops})`;
    } else {
      return `conic-gradient(from ${angle}deg, ${colorStops})`;
    }
  };
  
  const gradientCSS = generateGradientCSS();
  
  const addStop = () => {
    const newPosition = stops.length > 0 ? Math.max(...stops.map(s => s.position)) + 10 : 50;
    setStops([...stops, { position: Math.min(100, newPosition), l: 0.6, c: 0.15, h: 200 }]);
  };
  
  const removeStop = (index) => {
    if (stops.length > 2) {
      setStops(stops.filter((_, i) => i !== index));
    }
  };
  
  const updateStop = (index, field, value) => {
    const newStops = [...stops];
    newStops[index] = { ...newStops[index], [field]: value };
    setStops(newStops);
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(gradientCSS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateFromPrompt = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const prompt = `Create a gradient based on: "${aiPrompt}". Generate ${stops.length} color stops in OKLCH format. Return JSON with: name, description, type (linear/radial/conic), angle, stops array (each with position 0-100, lightness 0-1, chroma 0-0.4, hue 0-360).`;
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            type: { type: "string" },
            angle: { type: "number" },
            stops: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  position: { type: "number" },
                  lightness: { type: "number" },
                  chroma: { type: "number" },
                  hue: { type: "number" }
                }
              }
            }
          }
        }
      });
      if (result.stops) {
        setPaletteName(result.name || aiPrompt);
        setPaletteDescription(result.description || "");
        setGradientType(result.type || "linear");
        setAngle(result.angle || 90);
        setStops(result.stops.map(s => ({ position: s.position, l: s.lightness, c: s.chroma, h: s.hue })));
      }
    } catch (e) {
      console.error("AI gradient generation failed:", e);
    }
    setIsGenerating(false);
  };

  const generateFromBrandColors = async () => {
    if (!brandColors.trim()) return;
    setIsGenerating(true);
    try {
      const prompt = `Create a harmonious gradient of ${stops.length} color stops based on these brand colors: ${brandColors}. Return JSON with: name, description, type (linear/radial/conic), angle, stops array (each with position 0-100, lightness 0-1, chroma 0-0.4, hue 0-360).`;
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            type: { type: "string" },
            angle: { type: "number" },
            stops: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  position: { type: "number" },
                  lightness: { type: "number" },
                  chroma: { type: "number" },
                  hue: { type: "number" }
                }
              }
            }
          }
        }
      });
      if (result.stops) {
        setPaletteName(result.name || "Brand Gradient");
        setPaletteDescription(result.description || "");
        setGradientType(result.type || "linear");
        setAngle(result.angle || 90);
        setStops(result.stops.map(s => ({ position: s.position, l: s.lightness, c: s.chroma, h: s.hue })));
      }
    } catch (e) {
      console.error("AI brand gradient failed:", e);
    }
    setIsGenerating(false);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsGenerating(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const prompt = `Analyze this image and create a gradient with ${stops.length} color stops. Return JSON with: name, description, type (linear/radial/conic), angle, stops array (each with position 0-100, lightness 0-1, chroma 0-0.4, hue 0-360).`;
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            type: { type: "string" },
            angle: { type: "number" },
            stops: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  position: { type: "number" },
                  lightness: { type: "number" },
                  chroma: { type: "number" },
                  hue: { type: "number" }
                }
              }
            }
          }
        }
      });
      if (result.stops) {
        setPaletteName(result.name || "Photo Gradient");
        setPaletteDescription(result.description || "");
        setGradientType(result.type || "linear");
        setAngle(result.angle || 90);
        setStops(result.stops.map(s => ({ position: s.position, l: s.lightness, c: s.chroma, h: s.hue })));
      }
    } catch (e) {
      console.error("Photo analysis failed:", e);
    }
    setIsGenerating(false);
  };

  const generateAITags = async () => {
    setIsGenerating(true);
    try {
      const prompt = `Generate 3-5 relevant tags for a gradient with these properties: ${paletteName || gradientType}. Consider mood, style, use case. Return a JSON array of lowercase tags.`;
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

  const addTag = () => {
    if (tagInput.trim() && !paletteTags.includes(tagInput.trim())) {
      setPaletteTags([...paletteTags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag) => {
    setPaletteTags(paletteTags.filter(t => t !== tag));
  };
  
  const handleSave = () => {
    if (onSave && paletteName) {
      const gradientData = {
        name: paletteName,
        description: paletteDescription,
        category: "gradient",
        gradient: {
          type: gradientType,
          angle: angle,
          stops: stops
        },
        colors: stops.map((stop, i) => ({
          name: `Stop ${i + 1}`,
          oklch: `oklch(${stop.l.toFixed(3)} ${stop.c.toFixed(3)} ${stop.h.toFixed(1)})`,
          hex: oklchToRgb(stop.l, stop.c, stop.h)
        })),
        tags: paletteTags
      };
      onSave(gradientData);
      setPaletteName("");
      setPaletteDescription("");
      setPaletteTags([]);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle>AI Gradient Generation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Generate from Prompt</Label>
            <div className="flex gap-2">
              <Textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g., Sunset over ocean, Northern lights, Warm autumn colors..."
                rows={2}
                className="flex-1"
              />
              <Button onClick={generateFromPrompt} disabled={isGenerating || !aiPrompt.trim()}>
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Generate from Brand Colors</Label>
            <div className="flex gap-2">
              <Input
                value={brandColors}
                onChange={(e) => setBrandColors(e.target.value)}
                placeholder="e.g., #FF5733, #3498DB, sage green..."
              />
              <Button onClick={generateFromBrandColors} disabled={isGenerating || !brandColors.trim()}>
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Upload Photo for Gradient</Label>
            <div className="flex gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={isGenerating}
                className="flex-1"
              />
              <Button disabled={isGenerating}>
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle>Gradient Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div 
            className="w-full h-48 rounded-lg border-2 border-border shadow-md"
            style={{ background: gradientCSS }}
          />
          
          <div className="flex gap-2">
            <Input 
              value={gradientCSS} 
              readOnly 
              className="font-mono text-xs"
            />
            <Button size="sm" variant="outline" onClick={copyToClipboard}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Gradient Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={gradientType} onValueChange={setGradientType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linear">Linear</SelectItem>
                  <SelectItem value="radial">Radial</SelectItem>
                  <SelectItem value="conic">Conic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>{gradientType === "conic" ? "Start Angle" : "Angle"}</Label>
                <span className="text-xs text-muted-foreground">{angle}°</span>
              </div>
              <Slider 
                value={[angle]} 
                onValueChange={([val]) => setAngle(val)}
                min={0}
                max={360}
                step={1}
                disabled={gradientType === "radial"}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Color Stops</CardTitle>
          <Button size="sm" onClick={addStop}>
            <Plus className="h-4 w-4 mr-1" /> Add Stop
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {stops.map((stop, index) => (
            <Card key={index} className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Stop {index + 1}</Label>
                  {stops.length > 2 && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => removeStop(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div 
                  className="w-full h-12 rounded border"
                  style={{ backgroundColor: oklchToRgb(stop.l, stop.c, stop.h) }}
                />
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Position (%)</Label>
                    <Input 
                      type="number" 
                      value={stop.position} 
                      onChange={(e) => updateStop(index, "position", Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Lightness</Label>
                    <Input 
                      type="number" 
                      value={stop.l.toFixed(2)} 
                      onChange={(e) => updateStop(index, "l", Math.max(0, Math.min(1, parseFloat(e.target.value) || 0)))}
                      className="h-8 text-xs"
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Chroma</Label>
                    <Input 
                      type="number" 
                      value={stop.c.toFixed(2)} 
                      onChange={(e) => updateStop(index, "c", Math.max(0, Math.min(0.4, parseFloat(e.target.value) || 0)))}
                      className="h-8 text-xs"
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Hue</Label>
                    <Input 
                      type="number" 
                      value={stop.h.toFixed(0)} 
                      onChange={(e) => updateStop(index, "h", Math.max(0, Math.min(360, parseFloat(e.target.value) || 0)))}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </CardContent>
      </Card>
      
      {onSave && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Save to Library</CardTitle>
            <Button size="sm" variant="outline" onClick={generateAITags} disabled={isGenerating}>
              <Sparkles className="h-4 w-4 mr-1" />AI Tags
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Gradient Name</Label>
              <Input 
                placeholder="e.g., Sunset Gradient" 
                value={paletteName}
                onChange={(e) => setPaletteName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={paletteDescription}
                onChange={(e) => setPaletteDescription(e.target.value)}
                placeholder="e.g., Warm transition from orange to purple"
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

            <Button onClick={handleSave} disabled={!paletteName} className="w-full">
              <Save className="h-4 w-4 mr-2" /> Save to Library
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export { OklchGradientTool };
export default memo(OklchGradientTool);