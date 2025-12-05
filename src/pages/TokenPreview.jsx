import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Package, ArrowLeft, Eye, Loader2, Type, MousePointer, 
  Square, Bell, CheckCircle2, AlertCircle, Info, XCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { STURIJ_TOKENS } from "@/components/design-system/ThemeTokenEditor";

export default function TokenPreview() {
  const urlParams = new URLSearchParams(window.location.search);
  const packageId = urlParams.get("id");
  const [activeTab, setActiveTab] = useState("buttons");

  const { data: pkg, isLoading } = useQuery({
    queryKey: ["designSystemPackage", packageId],
    queryFn: async () => {
      const packages = await base44.entities.DesignSystemPackage.filter({ id: packageId });
      return packages[0] || null;
    },
    enabled: !!packageId
  });

  // Merge custom tokens with defaults
  const mergedTokens = useMemo(() => {
    const custom = pkg?.design_tokens || {};
    const colors = { ...Object.fromEntries(Object.entries(STURIJ_TOKENS.colors).map(([k, v]) => [k, v.base])), ...custom.colors };
    return { colors, typography: custom.typography || {}, spacing: custom.spacing || {}, effects: custom.effects || {} };
  }, [pkg]);

  // Generate inline styles from tokens
  const tokenStyles = useMemo(() => {
    const styles = {};
    Object.entries(mergedTokens.colors).forEach(([key, value]) => {
      styles[`--preview-color-${key}`] = value;
    });
    return styles;
  }, [mergedTokens]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-charcoal)]" />
      </div>
    );
  }

  const primary = mergedTokens.colors.primary || "#4A5D4E";
  const secondary = mergedTokens.colors.secondary || "#D4A574";
  const accent = mergedTokens.colors.accent || "#d9b4a7";
  const destructive = mergedTokens.colors.destructive || "#8b5b5b";
  const success = mergedTokens.colors.success || "#5a7a5e";
  const warning = mergedTokens.colors.warning || "#c4a35a";
  const info = mergedTokens.colors.info || "#5a7a8b";
  const midnight = mergedTokens.colors.midnight || "#1b2a35";
  const charcoal = mergedTokens.colors.charcoal || "#3b3b3b";
  const background = mergedTokens.colors.background || "#f5f3ef";

  return (
    <div className="p-6 min-h-screen" style={{ backgroundColor: background, ...tokenStyles }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to={createPageUrl("PackageDetail") + `?id=${packageId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-heading flex items-center gap-2" style={{ color: midnight }}>
              <Eye className="h-6 w-6" style={{ color: primary }} />
              Token Preview
            </h1>
            <p style={{ color: charcoal }}>
              {pkg?.package_name} v{pkg?.version}
            </p>
          </div>
        </div>
        <Link to={createPageUrl("PackageExport") + `?id=${packageId}`}>
          <Button style={{ backgroundColor: primary, color: "white" }}>
            Export Package
          </Button>
        </Link>
      </div>

      {/* Color Swatches */}
      <Card className="mb-6 border" style={{ borderColor: `${charcoal}20` }}>
        <CardHeader>
          <CardTitle style={{ color: midnight }}>Color Palette</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
            {Object.entries(mergedTokens.colors).map(([name, color]) => (
              <div key={name} className="text-center">
                <div 
                  className="w-12 h-12 rounded-lg mx-auto mb-1 border"
                  style={{ backgroundColor: color, borderColor: `${charcoal}20` }}
                />
                <p className="text-xs truncate" style={{ color: charcoal }}>{name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="buttons" className="gap-1">
            <MousePointer className="h-4 w-4" />
            Buttons
          </TabsTrigger>
          <TabsTrigger value="cards" className="gap-1">
            <Square className="h-4 w-4" />
            Cards
          </TabsTrigger>
          <TabsTrigger value="typography" className="gap-1">
            <Type className="h-4 w-4" />
            Typography
          </TabsTrigger>
          <TabsTrigger value="feedback" className="gap-1">
            <Bell className="h-4 w-4" />
            Feedback
          </TabsTrigger>
        </TabsList>

        {/* Buttons */}
        <TabsContent value="buttons" className="space-y-6">
          <Card className="border" style={{ borderColor: `${charcoal}20` }}>
            <CardHeader>
              <CardTitle style={{ color: midnight }}>Button Variants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <button 
                  className="px-4 py-2 rounded-lg font-medium text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: primary }}
                >
                  Primary Button
                </button>
                <button 
                  className="px-4 py-2 rounded-lg font-medium text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: secondary }}
                >
                  Secondary Button
                </button>
                <button 
                  className="px-4 py-2 rounded-lg font-medium transition-all hover:opacity-90"
                  style={{ backgroundColor: accent, color: midnight }}
                >
                  Accent Button
                </button>
                <button 
                  className="px-4 py-2 rounded-lg font-medium text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: destructive }}
                >
                  Destructive
                </button>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <button 
                  className="px-4 py-2 rounded-lg font-medium border-2 transition-all hover:bg-opacity-10"
                  style={{ borderColor: primary, color: primary }}
                >
                  Outline Primary
                </button>
                <button 
                  className="px-4 py-2 rounded-lg font-medium border-2 transition-all"
                  style={{ borderColor: secondary, color: secondary }}
                >
                  Outline Secondary
                </button>
                <button 
                  className="px-4 py-2 rounded-lg font-medium transition-all"
                  style={{ color: primary }}
                >
                  Ghost Button
                </button>
              </div>

              <div className="flex flex-wrap gap-3">
                <button 
                  className="px-3 py-1.5 rounded text-sm font-medium text-white"
                  style={{ backgroundColor: primary }}
                >
                  Small
                </button>
                <button 
                  className="px-4 py-2 rounded-lg font-medium text-white"
                  style={{ backgroundColor: primary }}
                >
                  Medium
                </button>
                <button 
                  className="px-6 py-3 rounded-xl text-lg font-medium text-white"
                  style={{ backgroundColor: primary }}
                >
                  Large
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cards */}
        <TabsContent value="cards" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border" style={{ borderColor: `${charcoal}20` }}>
              <CardHeader>
                <CardTitle style={{ color: midnight }}>Basic Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p style={{ color: charcoal }}>
                  This is a basic card component using the theme tokens.
                </p>
              </CardContent>
            </Card>

            <Card 
              className="border-2" 
              style={{ borderColor: primary, backgroundColor: `${primary}08` }}
            >
              <CardHeader>
                <CardTitle style={{ color: primary }}>Highlighted Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p style={{ color: charcoal }}>
                  A card with primary color accent.
                </p>
              </CardContent>
            </Card>

            <Card 
              className="border" 
              style={{ borderColor: `${charcoal}20`, backgroundColor: midnight, color: "white" }}
            >
              <CardHeader>
                <CardTitle>Dark Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="opacity-80">
                  A card using the midnight background.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="border" style={{ borderColor: `${charcoal}20` }}>
            <CardHeader>
              <CardTitle style={{ color: midnight }}>Stat Cards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg text-center" style={{ backgroundColor: `${primary}15` }}>
                  <p className="text-2xl font-bold" style={{ color: primary }}>1,234</p>
                  <p className="text-sm" style={{ color: charcoal }}>Total Users</p>
                </div>
                <div className="p-4 rounded-lg text-center" style={{ backgroundColor: `${secondary}15` }}>
                  <p className="text-2xl font-bold" style={{ color: secondary }}>567</p>
                  <p className="text-sm" style={{ color: charcoal }}>Active</p>
                </div>
                <div className="p-4 rounded-lg text-center" style={{ backgroundColor: `${success}15` }}>
                  <p className="text-2xl font-bold" style={{ color: success }}>89%</p>
                  <p className="text-sm" style={{ color: charcoal }}>Success Rate</p>
                </div>
                <div className="p-4 rounded-lg text-center" style={{ backgroundColor: `${warning}15` }}>
                  <p className="text-2xl font-bold" style={{ color: warning }}>12</p>
                  <p className="text-sm" style={{ color: charcoal }}>Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Typography */}
        <TabsContent value="typography" className="space-y-6">
          <Card className="border" style={{ borderColor: `${charcoal}20` }}>
            <CardHeader>
              <CardTitle style={{ color: midnight }}>Headings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h1 className="text-4xl font-light" style={{ color: midnight }}>Heading 1 - Display</h1>
              <h2 className="text-3xl font-light" style={{ color: midnight }}>Heading 2 - Title</h2>
              <h3 className="text-2xl font-light" style={{ color: midnight }}>Heading 3 - Subtitle</h3>
              <h4 className="text-xl font-medium" style={{ color: midnight }}>Heading 4 - Section</h4>
              <h5 className="text-lg font-medium" style={{ color: midnight }}>Heading 5 - Subsection</h5>
              <h6 className="text-base font-medium" style={{ color: midnight }}>Heading 6 - Label</h6>
            </CardContent>
          </Card>

          <Card className="border" style={{ borderColor: `${charcoal}20` }}>
            <CardHeader>
              <CardTitle style={{ color: midnight }}>Body Text</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg" style={{ color: midnight }}>
                Large body text for important content that needs emphasis.
              </p>
              <p style={{ color: charcoal }}>
                Regular body text for standard content. This is the default size for 
                most paragraphs and descriptions in the application.
              </p>
              <p className="text-sm" style={{ color: charcoal }}>
                Small text for captions, labels, and secondary information.
              </p>
              <p className="text-xs" style={{ color: `${charcoal}80` }}>
                Extra small text for fine print and metadata.
              </p>
            </CardContent>
          </Card>

          <Card className="border" style={{ borderColor: `${charcoal}20` }}>
            <CardHeader>
              <CardTitle style={{ color: midnight }}>Colored Text</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p style={{ color: primary }}>Primary colored text</p>
              <p style={{ color: secondary }}>Secondary colored text</p>
              <p style={{ color: accent }}>Accent colored text</p>
              <p style={{ color: success }}>Success message text</p>
              <p style={{ color: warning }}>Warning message text</p>
              <p style={{ color: destructive }}>Error/destructive text</p>
              <p style={{ color: info }}>Informational text</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feedback */}
        <TabsContent value="feedback" className="space-y-6">
          <Card className="border" style={{ borderColor: `${charcoal}20` }}>
            <CardHeader>
              <CardTitle style={{ color: midnight }}>Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg flex items-start gap-3" style={{ backgroundColor: `${success}15` }}>
                <CheckCircle2 className="h-5 w-5 mt-0.5" style={{ color: success }} />
                <div>
                  <p className="font-medium" style={{ color: success }}>Success</p>
                  <p className="text-sm" style={{ color: charcoal }}>Your changes have been saved successfully.</p>
                </div>
              </div>

              <div className="p-4 rounded-lg flex items-start gap-3" style={{ backgroundColor: `${warning}15` }}>
                <AlertCircle className="h-5 w-5 mt-0.5" style={{ color: warning }} />
                <div>
                  <p className="font-medium" style={{ color: warning }}>Warning</p>
                  <p className="text-sm" style={{ color: charcoal }}>Please review the following items before continuing.</p>
                </div>
              </div>

              <div className="p-4 rounded-lg flex items-start gap-3" style={{ backgroundColor: `${destructive}15` }}>
                <XCircle className="h-5 w-5 mt-0.5" style={{ color: destructive }} />
                <div>
                  <p className="font-medium" style={{ color: destructive }}>Error</p>
                  <p className="text-sm" style={{ color: charcoal }}>Something went wrong. Please try again.</p>
                </div>
              </div>

              <div className="p-4 rounded-lg flex items-start gap-3" style={{ backgroundColor: `${info}15` }}>
                <Info className="h-5 w-5 mt-0.5" style={{ color: info }} />
                <div>
                  <p className="font-medium" style={{ color: info }}>Information</p>
                  <p className="text-sm" style={{ color: charcoal }}>Here's some helpful information for you.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border" style={{ borderColor: `${charcoal}20` }}>
            <CardHeader>
              <CardTitle style={{ color: midnight }}>Badges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-sm font-medium text-white" style={{ backgroundColor: primary }}>
                  Primary
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-sm font-medium text-white" style={{ backgroundColor: secondary }}>
                  Secondary
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-sm font-medium" style={{ backgroundColor: `${accent}40`, color: midnight }}>
                  Accent
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-sm font-medium text-white" style={{ backgroundColor: success }}>
                  Success
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-sm font-medium text-white" style={{ backgroundColor: warning }}>
                  Warning
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-sm font-medium text-white" style={{ backgroundColor: destructive }}>
                  Error
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-sm font-medium text-white" style={{ backgroundColor: info }}>
                  Info
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border" style={{ borderColor: `${charcoal}20` }}>
            <CardHeader>
              <CardTitle style={{ color: midnight }}>Form States</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block" style={{ color: midnight }}>Default Input</label>
                <Input placeholder="Enter text..." className="border" style={{ borderColor: `${charcoal}30` }} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block" style={{ color: midnight }}>Focused State</label>
                <Input 
                  placeholder="Focused input" 
                  className="border-2" 
                  style={{ borderColor: primary, boxShadow: `0 0 0 3px ${primary}20` }} 
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block" style={{ color: destructive }}>Error State</label>
                <Input 
                  placeholder="Invalid input" 
                  className="border-2" 
                  style={{ borderColor: destructive }} 
                />
                <p className="text-sm mt-1" style={{ color: destructive }}>This field is required</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}