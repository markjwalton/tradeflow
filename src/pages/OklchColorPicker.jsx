import React, { useState, useEffect, lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

const OklchColorTool = lazy(() => import("@/components/color-tools/OklchColorTool").then(m => ({ default: m.OklchColorTool })));
const OklchGradientTool = lazy(() => import("@/components/color-tools/OklchGradientTool").then(m => ({ default: m.OklchGradientTool })));
const OklchPaletteTool = lazy(() => import("@/components/color-tools/OklchPaletteTool"));
const ColorLibrary = lazy(() => import("@/components/color-tools/ColorLibrary"));
const OklchBulkConverter = lazy(() => import("@/components/color-tools/OklchBulkConverter").then(m => ({ default: m.OklchBulkConverter })));
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { useEditMode } from "@/components/page-builder/EditModeContext";

export default function OklchColorPicker() {
  const [activeTab, setActiveTab] = useState("palette");
  const [tenantId, setTenantId] = useState(null);
  const [pageData, setPageData] = useState(null);
  const [tenantProfile, setTenantProfile] = useState(null);
  const { setCustomProperties } = useEditMode();
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tenantSlug = urlParams.get("tenant");
    const directTenantId = urlParams.get("tenantId");
    
    if (directTenantId) {
      setTenantId(directTenantId);
      base44.entities.TenantProfile.filter({ tenant_id: directTenantId }).then(profiles => {
        if (profiles.length > 0) setTenantProfile(profiles[0]);
      });
    } else if (tenantSlug) {
      base44.entities.Tenant.filter({ slug: tenantSlug }).then(tenants => {
        if (tenants.length > 0) {
          setTenantId(tenants[0].id);
          base44.entities.TenantProfile.filter({ tenant_id: tenants[0].id }).then(profiles => {
            if (profiles.length > 0) setTenantProfile(profiles[0]);
          });
        }
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
        {tenantProfile?.brand_colors && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Brand Colors Detected:</p>
            <div className="flex gap-4 flex-wrap">
              {tenantProfile.brand_colors.primary && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded border" style={{ backgroundColor: tenantProfile.brand_colors.primary }} />
                  <span className="text-xs">Primary: {tenantProfile.brand_colors.primary}</span>
                </div>
              )}
              {tenantProfile.brand_colors.secondary && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded border" style={{ backgroundColor: tenantProfile.brand_colors.secondary }} />
                  <span className="text-xs">Secondary: {tenantProfile.brand_colors.secondary}</span>
                </div>
              )}
              {tenantProfile.brand_colors.accent && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded border" style={{ backgroundColor: tenantProfile.brand_colors.accent }} />
                  <span className="text-xs">Accent: {tenantProfile.brand_colors.accent}</span>
                </div>
              )}
            </div>
          </div>
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
          <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <OklchColorTool />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="gradient">
          <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <OklchGradientTool onSave={handleSave} />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="palette">
          <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <OklchPaletteTool onSave={handleSave} brandColors={tenantProfile?.brand_colors} />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="convert">
          <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <OklchBulkConverter />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="library">
          <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <ColorLibrary tenantId={tenantId} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}