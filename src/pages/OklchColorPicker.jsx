import React from "react";
import { OklchColorTool } from "@/components/color-tools/OklchColorTool";

export default function OklchColorPicker() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-light font-display text-primary tracking-wide">
            OKLCH Color Picker
          </h1>
          <p className="text-muted-foreground">
            Create and explore colors using the OKLCH color space - a perceptually uniform color system
            that provides consistent lightness across all hues.
          </p>
        </div>
        
        <OklchColorTool />
        
        <div className="mt-8 p-4 bg-muted/50 rounded-lg border">
          <h3 className="text-sm font-medium mb-2">About OKLCH</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            OKLCH is a perceptually uniform color space that makes it easier to create consistent color palettes.
            Unlike HSL/RGB, colors with the same lightness value will appear equally bright to the human eye,
            regardless of their hue. This makes it ideal for creating accessible and harmonious design systems.
          </p>
        </div>
      </div>
    </div>
  );
}