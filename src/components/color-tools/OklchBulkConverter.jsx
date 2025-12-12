import React, { useState, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Copy, Check, ArrowRight } from "lucide-react";

// RGB/Hex to OKLCH conversion
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  return {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  };
}

function rgbToOklch(r, g, b) {
  // Gamma correction
  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  // RGB to OKLab
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const bVal = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;

  // Convert to LCH
  const C = Math.sqrt(a * a + bVal * bVal);
  let H = Math.atan2(bVal, a) * 180 / Math.PI;
  if (H < 0) H += 360;

  return { l: L, c: C, h: H };
}

function convertColorToOklch(color) {
  // Remove whitespace
  color = color.trim();
  
  // Try hex format
  const hexMatch = color.match(/#([a-f\d]{6}|[a-f\d]{3})/i);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    const rgb = hexToRgb('#' + hex);
    if (rgb) {
      const oklch = rgbToOklch(rgb.r, rgb.g, rgb.b);
      return `oklch(${oklch.l.toFixed(3)} ${oklch.c.toFixed(3)} ${oklch.h.toFixed(1)})`;
    }
  }
  
  // Try rgb/rgba format
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]) / 255;
    const g = parseInt(rgbMatch[2]) / 255;
    const b = parseInt(rgbMatch[3]) / 255;
    const oklch = rgbToOklch(r, g, b);
    return `oklch(${oklch.l.toFixed(3)} ${oklch.c.toFixed(3)} ${oklch.h.toFixed(1)})`;
  }
  
  return null;
}

const OklchBulkConverter = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const handleConvert = () => {
    const lines = input.split('\n');
    const converted = lines.map(line => {
      // Find all color values in the line
      const colorRegex = /#[a-f\d]{6}|#[a-f\d]{3}|rgba?\(\d+,\s*\d+,\s*\d+(?:,\s*[\d.]+)?\)/gi;
      
      return line.replace(colorRegex, (match) => {
        const oklch = convertColorToOklch(match);
        return oklch || match;
      });
    });
    
    setOutput(converted.join('\n'));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle>Bulk Color Converter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Convert multiple colors to OKLCH. Paste in your entire CSS config or any file that contains hex or RGB color values.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Input</Label>
              <Textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your CSS, config, or any text with color values...&#10;&#10;Example:&#10;--primary: var(--color-primary);&#10;--secondary: rgb(212, 165, 116);&#10;background-color: var(--color-background);"
                className="font-mono text-sm min-h-[300px]"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Output</Label>
                {output && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={copyToClipboard}
                  >
                    {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                    Copy
                  </Button>
                )}
              </div>
              <Textarea 
                value={output}
                readOnly
                placeholder="Converted colors will appear here..."
                className="font-mono text-sm min-h-[300px] bg-muted"
              />
            </div>
          </div>
          
          <Button 
            onClick={handleConvert}
            className="w-full"
            disabled={!input}
          >
            Convert to OKLCH
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Supported Formats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-medium mb-2">Hex Colors</div>
              <code className="text-xs bg-muted p-1 rounded">var(--color-primary)</code><br/>
              <code className="text-xs bg-muted p-1 rounded">#fff</code>
            </div>
            <div>
              <div className="font-medium mb-2">RGB Colors</div>
              <code className="text-xs bg-muted p-1 rounded">rgb(74, 93, 78)</code><br/>
              <code className="text-xs bg-muted p-1 rounded">rgba(74, 93, 78, 0.5)</code>
            </div>
            <div>
              <div className="font-medium mb-2">In Context</div>
              <code className="text-xs bg-muted p-1 rounded">--color: var(--color-primary);</code><br/>
              <code className="text-xs bg-muted p-1 rounded">background: rgb(255,255,255);</code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default memo(OklchBulkConverter);