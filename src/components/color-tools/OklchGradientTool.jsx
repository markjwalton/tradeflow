import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Check, Plus, Trash2, Save } from "lucide-react";

export function OklchGradientTool({ onSave }) {
  const [gradientType, setGradientType] = useState("linear");
  const [angle, setAngle] = useState(90);
  const [stops, setStops] = useState([
    { position: 0, l: 0.7, c: 0.15, h: 180 },
    { position: 100, l: 0.5, c: 0.2, h: 280 }
  ]);
  const [copied, setCopied] = useState(false);
  const [paletteName, setPaletteName] = useState("");
  
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
  
  const handleSave = () => {
    if (onSave && paletteName) {
      const gradientData = {
        name: paletteName,
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
        }))
      };
      onSave(gradientData);
      setPaletteName("");
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
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
          <CardHeader>
            <CardTitle>Save to Library</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Input 
              placeholder="Gradient name..." 
              value={paletteName}
              onChange={(e) => setPaletteName(e.target.value)}
            />
            <Button onClick={handleSave} disabled={!paletteName}>
              <Save className="h-4 w-4 mr-2" /> Save
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}