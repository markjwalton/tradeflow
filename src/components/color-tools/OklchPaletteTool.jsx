import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Check, Plus, Trash2, Save, RefreshCw } from "lucide-react";

export function OklchPaletteTool({ onSave }) {
  const [baseColor, setBaseColor] = useState({ l: 0.6, c: 0.15, h: 180 });
  const [paletteType, setPaletteType] = useState("monochromatic");
  const [colorCount, setColorCount] = useState(5);
  const [colors, setColors] = useState([]);
  const [paletteName, setPaletteName] = useState("");
  const [copied, setCopied] = useState(null);
  
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
  
  React.useEffect(() => {
    generatePalette();
  }, [baseColor, paletteType, colorCount]);
  
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
  
  const handleSave = () => {
    if (onSave && paletteName) {
      const paletteData = {
        name: paletteName,
        category: "palette",
        colors: colors.map(color => ({
          name: color.name,
          oklch: `oklch(${color.l.toFixed(3)} ${color.c.toFixed(3)} ${color.h.toFixed(1)})`,
          hex: oklchToRgb(color.l, color.c, color.h)
        })),
        tags: [paletteType]
      };
      onSave(paletteData);
      setPaletteName("");
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Base Color</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Palette Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
          
          <Button onClick={generatePalette} variant="outline" className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" /> Regenerate
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Generated Palette</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {colors.map((color, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center gap-2">
                <div 
                  className="h-12 flex-1 rounded border"
                  style={{ backgroundColor: oklchToRgb(color.l, color.c, color.h) }}
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
              <div className="text-xs text-muted-foreground flex justify-between">
                <span>{color.name}</span>
                <span className="font-mono">{oklchToRgb(color.l, color.c, color.h)}</span>
              </div>
            </div>
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
              placeholder="Palette name..." 
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