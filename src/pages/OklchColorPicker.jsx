import React, { useState, useEffect } from "react";
import { OklchColorTool } from "@/components/color-tools/OklchColorTool";
import { OklchGradientTool } from "@/components/color-tools/OklchGradientTool";
import { OklchPaletteTool } from "@/components/color-tools/OklchPaletteTool";
import { ColorLibrary } from "@/components/color-tools/ColorLibrary";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function OklchColorPicker() {
  const [activeTab, setActiveTab] = useState("picker");
  const [tenantId, setTenantId] = useState(null);
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tenantSlug = urlParams.get("tenant");
    if (tenantSlug) {
      base44.entities.Tenant.filter({ slug: tenantSlug }).then(tenants => {
        if (tenants.length > 0) setTenantId(tenants[0].id);
      });
    }
  }, []);
  
  const handleSave = async (paletteData) => {
    try {
      await base44.entities.ColorPalette.create({
        ...paletteData,
        tenant_id: tenantId || "__global__"
      });
      toast.success("Saved to library!");
      setActiveTab("library");
    } catch (error) {
      toast.error("Failed to save");
    }
  };
  
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-light font-display text-primary tracking-wide">
            OKLCH Color Tools
          </h1>
          <p className="text-muted-foreground">
            Create and explore colors using the OKLCH color space - a perceptually uniform color system
            that provides consistent lightness across all hues.
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="picker">Color Picker</TabsTrigger>
            <TabsTrigger value="gradient">Gradients</TabsTrigger>
            <TabsTrigger value="palette">Palettes</TabsTrigger>
            <TabsTrigger value="library">Library</TabsTrigger>
          </TabsList>
          
          <TabsContent value="picker">
            <OklchColorTool />
          </TabsContent>
          
          <TabsContent value="gradient">
            <OklchGradientTool onSave={handleSave} />
          </TabsContent>
          
          <TabsContent value="palette">
            <OklchPaletteTool onSave={handleSave} />
          </TabsContent>
          
          <TabsContent value="library">
            <ColorLibrary tenantId={tenantId} />
          </TabsContent>
        </Tabs>
        
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