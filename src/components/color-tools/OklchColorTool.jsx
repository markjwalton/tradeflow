import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// OKLCH to RGB conversion
function oklchToRgb(l, c, h) {
  // Convert to OKLab
  const a = c * Math.cos((h * Math.PI) / 180);
  const b = c * Math.sin((h * Math.PI) / 180);
  
  // OKLab to linear RGB
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.2914855480 * b;
  
  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;
  
  let r = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  let g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  let bl = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;
  
  // Gamma correction
  r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r;
  g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g;
  bl = bl > 0.0031308 ? 1.055 * Math.pow(bl, 1 / 2.4) - 0.055 : 12.92 * bl;
  
  // Clamp and convert to 0-255
  r = Math.max(0, Math.min(255, Math.round(r * 255)));
  g = Math.max(0, Math.min(255, Math.round(g * 255)));
  bl = Math.max(0, Math.min(255, Math.round(bl * 255)));
  
  return { r, g, b: bl };
}

function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
}

export function OklchColorTool({ onSave }) {
  const [lightness, setLightness] = useState(0.7);
  const [chroma, setChroma] = useState(0.15);
  const [hue, setHue] = useState(180);
  const [copied, setCopied] = useState(null);
  
  const rgb = oklchToRgb(lightness, chroma, hue);
  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
  const oklchString = `oklch(${lightness.toFixed(3)} ${chroma.toFixed(3)} ${hue.toFixed(1)})`;
  const cssVar = `var(--color-custom)`;
  
  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>OKLCH Color Creator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Color Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div 
              className="w-full h-32 rounded-lg border-2 border-border shadow-md transition-colors"
              style={{ backgroundColor: hex }}
            />
          </div>
          
          {/* Lightness Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Lightness (L)</Label>
              <Input 
                type="number" 
                value={lightness.toFixed(3)} 
                onChange={(e) => setLightness(Math.max(0, Math.min(1, parseFloat(e.target.value) || 0)))}
                className="w-20 h-8 text-xs"
                step="0.001"
              />
            </div>
            <Slider 
              value={[lightness * 100]} 
              onValueChange={([val]) => setLightness(val / 100)}
              min={0}
              max={100}
              step={0.1}
              className="w-full"
            />
            <div className="text-xs text-muted-foreground">0 = black, 1 = white</div>
          </div>
          
          {/* Chroma Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Chroma (C)</Label>
              <Input 
                type="number" 
                value={chroma.toFixed(3)} 
                onChange={(e) => setChroma(Math.max(0, Math.min(0.4, parseFloat(e.target.value) || 0)))}
                className="w-20 h-8 text-xs"
                step="0.001"
              />
            </div>
            <Slider 
              value={[chroma * 250]} 
              onValueChange={([val]) => setChroma(val / 250)}
              min={0}
              max={100}
              step={0.1}
              className="w-full"
            />
            <div className="text-xs text-muted-foreground">0 = grayscale, 0.4 = max saturation</div>
          </div>
          
          {/* Hue Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Hue (H)</Label>
              <Input 
                type="number" 
                value={hue.toFixed(1)} 
                onChange={(e) => setHue(Math.max(0, Math.min(360, parseFloat(e.target.value) || 0)))}
                className="w-20 h-8 text-xs"
                step="0.1"
              />
            </div>
            <Slider 
              value={[hue]} 
              onValueChange={([val]) => setHue(val)}
              min={0}
              max={360}
              step={0.1}
              className="w-full"
            />
            <div className="text-xs text-muted-foreground">0° = red, 120° = green, 240° = blue</div>
          </div>
        </CardContent>
      </Card>
      
      {/* Output Formats */}
      <Card>
        <CardHeader>
          <CardTitle>Output Formats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">OKLCH</Label>
            <div className="flex gap-2">
              <Input value={oklchString} readOnly className="font-mono text-sm" />
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => copyToClipboard(oklchString, "oklch")}
              >
                {copied === "oklch" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">HEX</Label>
            <div className="flex gap-2">
              <Input value={hex} readOnly className="font-mono text-sm" />
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => copyToClipboard(hex, "hex")}
              >
                {copied === "hex" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">RGB</Label>
            <div className="flex gap-2">
              <Input 
                value={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`} 
                readOnly 
                className="font-mono text-sm" 
              />
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => copyToClipboard(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, "rgb")}
              >
                {copied === "rgb" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">CSS Variable</Label>
            <div className="flex gap-2">
              <Input value={cssVar} readOnly className="font-mono text-sm" />
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => copyToClipboard(cssVar, "css")}
              >
                {copied === "css" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Presets */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Presets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button 
              variant="outline" 
              className="h-auto flex flex-col gap-1 p-3"
              onClick={() => { setLightness(0.95); setChroma(0.02); setHue(0); }}
            >
              <div className="w-full h-8 rounded bg-[oklch(0.95_0.02_0)]" />
              <span className="text-xs">Near White</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto flex flex-col gap-1 p-3"
              onClick={() => { setLightness(0.2); setChroma(0.02); setHue(0); }}
            >
              <div className="w-full h-8 rounded bg-[oklch(0.2_0.02_0)]" />
              <span className="text-xs">Near Black</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto flex flex-col gap-1 p-3"
              onClick={() => { setLightness(0.646); setChroma(0.222); setHue(41.116); }}
            >
              <div className="w-full h-8 rounded bg-[oklch(0.646_0.222_41.116)]" />
              <span className="text-xs">Chart 1</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto flex flex-col gap-1 p-3"
              onClick={() => { setLightness(0.6); setChroma(0.118); setHue(184.704); }}
            >
              <div className="w-full h-8 rounded bg-[oklch(0.6_0.118_184.704)]" />
              <span className="text-xs">Chart 2</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}