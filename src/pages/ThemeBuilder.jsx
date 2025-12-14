import React, { useState, lazy, Suspense, memo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Save, Eye, Trash2, Play, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { PageHeader } from "@/components/sturij";

const Card = lazy(() => import("@/components/ui/card").then(m => ({ default: m.Card })));
const CardContent = lazy(() => import("@/components/ui/card").then(m => ({ default: m.CardContent })));
const CardHeader = lazy(() => import("@/components/ui/card").then(m => ({ default: m.CardHeader })));
const CardTitle = lazy(() => import("@/components/ui/card").then(m => ({ default: m.CardTitle })));
const Textarea = lazy(() => import("@/components/ui/textarea").then(m => ({ default: m.Textarea })));
const Badge = lazy(() => import("@/components/ui/badge").then(m => ({ default: m.Badge })));
const Select = lazy(() => import("@/components/ui/select").then(m => ({ default: m.Select })));
const SelectContent = lazy(() => import("@/components/ui/select").then(m => ({ default: m.SelectContent })));
const SelectItem = lazy(() => import("@/components/ui/select").then(m => ({ default: m.SelectItem })));
const SelectTrigger = lazy(() => import("@/components/ui/select").then(m => ({ default: m.SelectTrigger })));
const SelectValue = lazy(() => import("@/components/ui/select").then(m => ({ default: m.SelectValue })));
const Tabs = lazy(() => import("@/components/ui/tabs").then(m => ({ default: m.Tabs })));
const TabsList = lazy(() => import("@/components/ui/tabs").then(m => ({ default: m.TabsList })));
const TabsTrigger = lazy(() => import("@/components/ui/tabs").then(m => ({ default: m.TabsTrigger })));
const TabsContent = lazy(() => import("@/components/ui/tabs").then(m => ({ default: m.TabsContent })));

const ThemeBuilder = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState({
    name: "",
    description: "",
    color_palette_id: "",
    heading_font_id: "",
    body_font_id: "",
    custom_css: "",
    tags: []
  });
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  const { data: palettes = [] } = useQuery({
    queryKey: ["colorPalettes"],
    queryFn: () => base44.entities.ColorPalette.filter({})
  });

  const { data: fonts = [] } = useQuery({
    queryKey: ["fonts"],
    queryFn: () => base44.entities.FontLibrary.filter({})
  });

  const { data: themes = [] } = useQuery({
    queryKey: ["themes"],
    queryFn: () => base44.entities.ThemeTemplate.filter({})
  });

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.ThemeTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["themes"]);
      toast.success("Theme saved");
      setTheme({
        name: "",
        description: "",
        color_palette_id: "",
        heading_font_id: "",
        body_font_id: "",
        custom_css: "",
        tags: []
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ThemeTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["themes"]);
      toast.success("Theme deleted");
    }
  });

  const applyThemeMutation = useMutation({
    mutationFn: async (themeId) => {
      const selectedTheme = themes.find(t => t.id === themeId);
      if (!selectedTheme) return;

      const user = await base44.auth.me();
      const palette = palettes.find(p => p.id === selectedTheme.color_palette_id);
      const headingFont = fonts.find(f => f.id === selectedTheme.heading_font_id);
      const bodyFont = fonts.find(f => f.id === selectedTheme.body_font_id);

      // Generate CSS from palette
      let css = `:root {\n`;
      if (palette?.colors) {
        palette.colors.forEach(color => {
          const varName = color.name.toLowerCase().replace(/\s+/g, '-');
          css += `  --color-${varName}: ${color.hex};\n`;
          if (color.color_type && color.shade) {
            css += `  --${color.color_type}-${color.shade}: ${color.hex};\n`;
          }
        });
      }
      
      // Add font families
      if (headingFont) {
        css += `  --font-family-display: ${headingFont.font_family};\n`;
      }
      if (bodyFont) {
        css += `  --font-family-body: ${bodyFont.font_family};\n`;
      }

      // Add custom CSS
      if (selectedTheme.custom_css) {
        css += `}\n\n${selectedTheme.custom_css}`;
      } else {
        css += `}\n`;
      }

      await base44.auth.updateMe({
        active_theme: {
          theme_id: themeId,
          theme_name: selectedTheme.name,
          css_variables: css,
          applied_date: new Date().toISOString()
        },
        theme_fonts: headingFont && bodyFont ? {
          heading: {
            id: headingFont.id,
            name: headingFont.name,
            font_family: headingFont.font_family,
            source: headingFont.source,
            url: headingFont.google_font_url || headingFont.adobe_font_id
          },
          body: {
            id: bodyFont.id,
            name: bodyFont.name,
            font_family: bodyFont.font_family,
            source: bodyFont.source,
            url: bodyFont.google_font_url || bodyFont.adobe_font_id
          }
        } : undefined
      });
    },
    onSuccess: () => {
      toast.success("Theme applied");
      window.location.reload();
    }
  });

  const generateThemeFromAI = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const prompt = `Create a complete design system theme based on: "${aiPrompt}".
      
Generate:
1. Theme name and description
2. Suggest which existing palette ID to use (or describe colors if creating new)
3. CSS custom properties for spacing, shadows, borders
4. Any additional design tokens

Return JSON with: name, description, suggested_palette_name, custom_css (CSS code as string), tags (array)`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            suggested_palette_name: { type: "string" },
            custom_css: { type: "string" },
            tags: { type: "array", items: { type: "string" } }
          }
        }
      });

      setTheme(prev => ({
        ...prev,
        name: result.name || aiPrompt,
        description: result.description || "",
        custom_css: result.custom_css || "",
        tags: result.tags || []
      }));

      toast.success("AI theme generated");
    } catch (e) {
      toast.error("Failed to generate theme");
      console.error(e);
    }
    setIsGenerating(false);
  };

  const handleSave = () => {
    if (!theme.name) {
      toast.error("Theme name is required");
      return;
    }
    saveMutation.mutate({
      ...theme,
      tenant_id: "__global__"
    });
  };

  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <div className="max-w-6xl mx-auto -mt-6 space-y-6">
      <PageHeader 
        title="Theme Builder"
        description="Create and manage complete design themes"
      />

      <Tabs defaultValue="build" className="w-full">
        <TabsList>
          <TabsTrigger value="build">Build Theme</TabsTrigger>
          <TabsTrigger value="library">Theme Library</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="build" className="space-y-6 mt-6">
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle>AI Theme Generator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Describe your theme</Label>
                <Textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g., Modern tech startup with bold colors and clean typography, or Elegant luxury brand with sophisticated serif fonts..."
                  rows={3}
                />
              </div>
              <Button onClick={generateThemeFromAI} disabled={isGenerating || !aiPrompt.trim()} className="w-full">
                {isGenerating ? "Generating..." : <><Sparkles className="h-4 w-4 mr-2" />Generate Theme</>}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Theme Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme Name</Label>
                <Input
                  value={theme.name}
                  onChange={(e) => setTheme({ ...theme, name: e.target.value })}
                  placeholder="e.g., Modern Tech"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={theme.description}
                  onChange={(e) => setTheme({ ...theme, description: e.target.value })}
                  placeholder="e.g., Bold colors with clean typography"
                />
              </div>

              <div className="space-y-2">
                <Label>Color Palette</Label>
                <Select value={theme.color_palette_id} onValueChange={(val) => setTheme({ ...theme, color_palette_id: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select palette" />
                  </SelectTrigger>
                  <SelectContent>
                    {palettes.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Heading Font</Label>
                  <Select value={theme.heading_font_id} onValueChange={(val) => setTheme({ ...theme, heading_font_id: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select font" />
                    </SelectTrigger>
                    <SelectContent>
                      {fonts.map(f => (
                        <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Body Font</Label>
                  <Select value={theme.body_font_id} onValueChange={(val) => setTheme({ ...theme, body_font_id: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select font" />
                    </SelectTrigger>
                    <SelectContent>
                      {fonts.map(f => (
                        <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Custom CSS</Label>
                <Textarea
                  value={theme.custom_css}
                  onChange={(e) => setTheme({ ...theme, custom_css: e.target.value })}
                  placeholder="/* Additional CSS variables or rules */
:root {
  --spacing-custom: 2rem;
  --shadow-custom: 0 4px 6px rgba(0,0,0,0.1);
}"
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>

              <Button onClick={handleSave} className="w-full" disabled={saveMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />Save Theme
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="library" className="space-y-4 mt-6">
          {themes.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No themes created yet. Build your first theme!
              </CardContent>
            </Card>
          ) : (
            themes.map(t => (
              <Card key={t.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle>{t.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{t.description}</p>
                    {t.tags && t.tags.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {t.tags.map(tag => (
                          <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      onClick={() => applyThemeMutation.mutate(t.id)}
                      disabled={applyThemeMutation.isPending}
                    >
                      <Play className="h-4 w-4 mr-1" />Apply
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(t.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                {t.custom_css && (
                  <CardContent>
                    <Label className="text-xs">Custom CSS:</Label>
                    <pre className="mt-2 p-3 bg-muted rounded text-xs font-mono overflow-x-auto">
                      {t.custom_css.substring(0, 200)}...
                    </pre>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="preview" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Gradients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="h-24 rounded-lg bg-gradient-primary" />
                  <p className="text-xs text-center text-muted-foreground">Primary Gradient</p>
                </div>
                <div className="space-y-2">
                  <div className="h-24 rounded-lg bg-gradient-secondary" />
                  <p className="text-xs text-center text-muted-foreground">Secondary Gradient</p>
                </div>
                <div className="space-y-2">
                  <div className="h-24 rounded-lg bg-gradient-accent" />
                  <p className="text-xs text-center text-muted-foreground">Accent Gradient</p>
                </div>
                <div className="space-y-2">
                  <div className="h-24 rounded-lg bg-gradient-sunset" />
                  <p className="text-xs text-center text-muted-foreground">Sunset</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Typography</CardTitle>
              <CardDescription>Heading and body font styles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h1 className="text-4xl font-display mb-2">Display Heading</h1>
                <h2 className="text-3xl font-display mb-2">Headline</h2>
                <h3 className="text-2xl font-display mb-2">Title</h3>
                <p className="text-base font-body">Body text: The quick brown fox jumps over the lazy dog.</p>
                <p className="text-sm text-muted-foreground mt-2">Caption text in muted color</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Form Elements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Input Field</Label>
                <Input placeholder="Enter some text..." />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>This is an informational alert message.</AlertDescription>
              </Alert>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>This is a destructive alert message.</AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </Suspense>
  );
};

export default memo(ThemeBuilder);