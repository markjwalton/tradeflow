import React, { useState, useEffect } from "react";
import { OklchColorTool } from "@/components/color-tools/OklchColorTool";
import { OklchGradientTool } from "@/components/color-tools/OklchGradientTool";
import { OklchPaletteTool } from "@/components/color-tools/OklchPaletteTool";
import { ColorLibrary } from "@/components/color-tools/ColorLibrary";
import { OklchBulkConverter } from "@/components/color-tools/OklchBulkConverter";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { useEditMode } from "@/components/page-builder/EditModeContext";

export default function OklchColorPicker() {
  const [activeTab, setActiveTab] = useState("picker");
  const [tenantId, setTenantId] = useState(null);
  const [pageData, setPageData] = useState(null);
  const { setCustomProperties } = useEditMode();
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tenantSlug = urlParams.get("tenant");
    if (tenantSlug) {
      base44.entities.Tenant.filter({ slug: tenantSlug }).then(tenants => {
        if (tenants.length > 0) setTenantId(tenants[0].id);
      });
    }
    base44.entities.UIPage.filter({ slug: "OklchColorPicker" })
      .then(pages => pages.length > 0 && setPageData(pages[0]))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setCustomProperties([
      {
        key: "page_description",
        label: "Page Description",
        type: "text",
        value: pageData?.page_description || "",
        description: "Description shown below the page title",
        onChange: async (value) => {
          if (pageData?.id) {
            await base44.entities.UIPage.update(pageData.id, { page_description: value });
            setPageData({ ...pageData, page_description: value });
          }
        }
      }
    ]);
    return () => setCustomProperties([]);
  }, [pageData, setCustomProperties]);
  
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
    <div className="[padding:var(--spacing-6)] max-w-4xl mx-auto bg-[var(--color-background)] min-h-screen">
      <div className="[margin-bottom:var(--spacing-6)]">
        <h1 className="text-3xl font-display text-[var(--color-text-primary)] [margin-bottom:var(--spacing-2)]">
          OKLCH Color Tools
        </h1>
        {pageData?.page_description && (
          <p className="text-[var(--color-text-muted)]">
            {pageData.page_description}
          </p>
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 rounded-xl">
          <TabsTrigger value="picker">Color Picker</TabsTrigger>
          <TabsTrigger value="gradient">Gradients</TabsTrigger>
          <TabsTrigger value="palette">Palettes</TabsTrigger>
          <TabsTrigger value="convert">Bulk Convert</TabsTrigger>
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
        
        <TabsContent value="convert">
          <OklchBulkConverter />
        </TabsContent>
        
        <TabsContent value="library">
          <ColorLibrary tenantId={tenantId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}