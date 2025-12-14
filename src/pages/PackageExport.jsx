import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Package, ArrowLeft, Download, Copy, FileCode, FileJson,
  CheckCircle2, Loader2, Code, Palette, Settings
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { STURIJ_TOKENS } from "@/components/design-system/ThemeTokenEditor";
import { PageHeader } from "@/components/sturij";

export default function PackageExport() {
  const urlParams = new URLSearchParams(window.location.search);
  const packageId = urlParams.get("id");
  const [activeTab, setActiveTab] = useState("css");
  const [exportOptions, setExportOptions] = useState({
    includeComments: true,
    includeDefaults: false,
    minify: false,
    cssFormat: "variables", // variables | tailwind | scss
  });

  const { data: pkg, isLoading } = useQuery({
    queryKey: ["designSystemPackage", packageId],
    queryFn: async () => {
      const packages = await base44.entities.DesignSystemPackage.filter({ id: packageId });
      return packages[0] || null;
    },
    enabled: !!packageId
  });

  // Generate CSS Variables
  const generateCSSVariables = () => {
    const tokens = pkg?.design_tokens || {};
    let css = "";
    
    if (exportOptions.includeComments) {
      css += `/**\n * ${pkg?.package_name || "Theme"} - Design Tokens\n * Version: ${pkg?.version || "1.0.0"}\n * Generated: ${new Date().toISOString()}\n */\n\n`;
    }
    
    css += ":root {\n";
    
    // Colors
    if (exportOptions.includeComments) css += "  /* Colors */\n";
    Object.entries(tokens.colors || {}).forEach(([key, value]) => {
      css += `  --color-${key}: ${value};\n`;
    });
    
    // Include defaults if selected
    if (exportOptions.includeDefaults) {
      Object.entries(STURIJ_TOKENS.colors).forEach(([key, data]) => {
        if (!tokens.colors?.[key]) {
          css += `  --color-${key}: ${data.base};\n`;
        }
      });
    }
    
    // Typography
    if (Object.keys(tokens.typography || {}).length > 0 || exportOptions.includeDefaults) {
      if (exportOptions.includeComments) css += "\n  /* Typography */\n";
      Object.entries(tokens.typography || {}).forEach(([key, value]) => {
        css += `  --${key}: ${value};\n`;
      });
    }
    
    // Spacing
    if (Object.keys(tokens.spacing || {}).length > 0) {
      if (exportOptions.includeComments) css += "\n  /* Spacing */\n";
      Object.entries(tokens.spacing || {}).forEach(([key, value]) => {
        css += `  --spacing-${key}: ${value};\n`;
      });
    }
    
    // Effects
    if (Object.keys(tokens.effects || {}).length > 0) {
      if (exportOptions.includeComments) css += "\n  /* Effects */\n";
      Object.entries(tokens.effects || {}).forEach(([key, value]) => {
        css += `  --${key}: ${value};\n`;
      });
    }
    
    css += "}\n";
    
    if (exportOptions.minify) {
      css = css.replace(/\n\s*/g, "").replace(/:\s+/g, ":").replace(/;\s*}/g, "}");
    }
    
    return css;
  };

  // Generate Tailwind Config
  const generateTailwindConfig = () => {
    const tokens = pkg?.design_tokens || {};
    
    const config = {
      theme: {
        extend: {
          colors: {},
          fontFamily: {},
          spacing: {},
          borderRadius: {},
          boxShadow: {}
        }
      }
    };
    
    // Map colors
    Object.entries(tokens.colors || {}).forEach(([key, value]) => {
      config.theme.extend.colors[key] = value;
    });
    
    // Add defaults if selected
    if (exportOptions.includeDefaults) {
      Object.entries(STURIJ_TOKENS.colors).forEach(([key, data]) => {
        if (!tokens.colors?.[key]) {
          config.theme.extend.colors[key] = data.base;
        }
      });
    }
    
    let output = "";
    if (exportOptions.includeComments) {
      output += `/** @type {import('tailwindcss').Config} */\n`;
      output += `// ${pkg?.package_name || "Theme"} - Tailwind Configuration\n`;
      output += `// Version: ${pkg?.version || "1.0.0"}\n\n`;
    }
    
    output += `module.exports = ${JSON.stringify(config, null, 2)}`;
    
    return output;
  };

  // Generate JSON tokens
  const generateJSONTokens = () => {
    const tokens = pkg?.design_tokens || {};
    
    const output = {
      $schema: "https://tr.designtokens.org/format/",
      name: pkg?.package_name || "Theme",
      version: pkg?.version || "1.0.0",
      tokens: {
        color: {},
        typography: {},
        spacing: {},
        effect: {}
      }
    };
    
    Object.entries(tokens.colors || {}).forEach(([key, value]) => {
      output.tokens.color[key] = { $value: value, $type: "color" };
    });
    
    Object.entries(tokens.typography || {}).forEach(([key, value]) => {
      output.tokens.typography[key] = { $value: value };
    });
    
    Object.entries(tokens.spacing || {}).forEach(([key, value]) => {
      output.tokens.spacing[key] = { $value: value, $type: "dimension" };
    });
    
    Object.entries(tokens.effects || {}).forEach(([key, value]) => {
      output.tokens.effect[key] = { $value: value };
    });
    
    return JSON.stringify(output, null, 2);
  };

  // Generate SCSS Variables
  const generateSCSSVariables = () => {
    const tokens = pkg?.design_tokens || {};
    let scss = "";
    
    if (exportOptions.includeComments) {
      scss += `// ${pkg?.package_name || "Theme"} - SCSS Variables\n`;
      scss += `// Version: ${pkg?.version || "1.0.0"}\n\n`;
    }
    
    // Colors
    if (exportOptions.includeComments) scss += "// Colors\n";
    Object.entries(tokens.colors || {}).forEach(([key, value]) => {
      scss += `$color-${key}: ${value};\n`;
    });
    
    // Typography
    if (Object.keys(tokens.typography || {}).length > 0) {
      if (exportOptions.includeComments) scss += "\n// Typography\n";
      Object.entries(tokens.typography || {}).forEach(([key, value]) => {
        scss += `$${key}: ${value};\n`;
      });
    }
    
    return scss;
  };

  const getExportContent = () => {
    switch (activeTab) {
      case "css": return generateCSSVariables();
      case "tailwind": return generateTailwindConfig();
      case "json": return generateJSONTokens();
      case "scss": return generateSCSSVariables();
      default: return "";
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getExportContent());
    toast.success("Copied to clipboard");
  };

  const downloadFile = () => {
    const content = getExportContent();
    const extensions = { css: "css", tailwind: "js", json: "json", scss: "scss" };
    const filename = `${pkg?.package_code || "theme"}.${extensions[activeTab]}`;
    
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto min-h-screen -mt-6">
      <PageHeader 
        title="Export Package"
        description={pkg ? `${pkg.package_name} v${pkg.version}` : "Loading..."}
      >
        <div className="flex gap-2">
          <Link to={createPageUrl("PackageDetail") + `?id=${packageId}`}>
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <Button variant="outline" onClick={copyToClipboard}>
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
          <Button onClick={downloadFile} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </PageHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-0">
        <TabsList className="mb-4">
          <TabsTrigger value="css" className="gap-1">
            <FileCode className="h-4 w-4" />
            CSS Variables
          </TabsTrigger>
          <TabsTrigger value="tailwind" className="gap-1">
            <Code className="h-4 w-4" />
            Tailwind
          </TabsTrigger>
          <TabsTrigger value="json" className="gap-1">
            <FileJson className="h-4 w-4" />
            JSON Tokens
          </TabsTrigger>
          <TabsTrigger value="scss" className="gap-1">
            <Palette className="h-4 w-4" />
            SCSS
          </TabsTrigger>
        </TabsList>

        <TabsContent value="css" className="mt-4">
          <div className="space-y-4">
            {/* Options Sidebar */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-midnight-900 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Export Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Include Comments</Label>
                  <Switch
                    checked={exportOptions.includeComments}
                    onCheckedChange={(v) => setExportOptions({ ...exportOptions, includeComments: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Include Defaults</Label>
                  <Switch
                    checked={exportOptions.includeDefaults}
                    onCheckedChange={(v) => setExportOptions({ ...exportOptions, includeDefaults: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Minify Output</Label>
                  <Switch
                    checked={exportOptions.minify}
                    onCheckedChange={(v) => setExportOptions({ ...exportOptions, minify: v })}
                  />
                </div>

                <div className="pt-4 border-t border-border">
                  <Label className="text-sm font-medium">Token Summary</Label>
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Colors</span>
                      <Badge variant="outline">{Object.keys(pkg?.design_tokens?.colors || {}).length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Typography</span>
                      <Badge variant="outline">{Object.keys(pkg?.design_tokens?.typography || {}).length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Spacing</span>
                      <Badge variant="outline">{Object.keys(pkg?.design_tokens?.spacing || {}).length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Effects</span>
                      <Badge variant="outline">{Object.keys(pkg?.design_tokens?.effects || {}).length}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Export Preview */}
            <Card className="border-border">
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  <pre className="p-4 text-sm font-mono text-midnight-900 whitespace-pre-wrap">
                    {getExportContent()}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tailwind" className="mt-4">
          <div className="space-y-4">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-midnight-900 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Export Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Include Comments</Label>
                  <Switch
                    checked={exportOptions.includeComments}
                    onCheckedChange={(v) => setExportOptions({ ...exportOptions, includeComments: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Include Defaults</Label>
                  <Switch
                    checked={exportOptions.includeDefaults}
                    onCheckedChange={(v) => setExportOptions({ ...exportOptions, includeDefaults: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Minify Output</Label>
                  <Switch
                    checked={exportOptions.minify}
                    onCheckedChange={(v) => setExportOptions({ ...exportOptions, minify: v })}
                  />
                </div>

                <div className="pt-4 border-t border-border">
                  <Label className="text-sm font-medium">Token Summary</Label>
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Colors</span>
                      <Badge variant="outline">{Object.keys(pkg?.design_tokens?.colors || {}).length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Typography</span>
                      <Badge variant="outline">{Object.keys(pkg?.design_tokens?.typography || {}).length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Spacing</span>
                      <Badge variant="outline">{Object.keys(pkg?.design_tokens?.spacing || {}).length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Effects</span>
                      <Badge variant="outline">{Object.keys(pkg?.design_tokens?.effects || {}).length}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  <pre className="p-4 text-sm font-mono text-midnight-900 whitespace-pre-wrap">
                    {getExportContent()}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="json" className="mt-4">
          <div className="space-y-4">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-midnight-900 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Export Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Include Comments</Label>
                  <Switch
                    checked={exportOptions.includeComments}
                    onCheckedChange={(v) => setExportOptions({ ...exportOptions, includeComments: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Include Defaults</Label>
                  <Switch
                    checked={exportOptions.includeDefaults}
                    onCheckedChange={(v) => setExportOptions({ ...exportOptions, includeDefaults: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Minify Output</Label>
                  <Switch
                    checked={exportOptions.minify}
                    onCheckedChange={(v) => setExportOptions({ ...exportOptions, minify: v })}
                  />
                </div>

                <div className="pt-4 border-t border-border">
                  <Label className="text-sm font-medium">Token Summary</Label>
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Colors</span>
                      <Badge variant="outline">{Object.keys(pkg?.design_tokens?.colors || {}).length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Typography</span>
                      <Badge variant="outline">{Object.keys(pkg?.design_tokens?.typography || {}).length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Spacing</span>
                      <Badge variant="outline">{Object.keys(pkg?.design_tokens?.spacing || {}).length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Effects</span>
                      <Badge variant="outline">{Object.keys(pkg?.design_tokens?.effects || {}).length}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  <pre className="p-4 text-sm font-mono text-midnight-900 whitespace-pre-wrap">
                    {getExportContent()}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scss" className="mt-4">
          <div className="space-y-4">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-midnight-900 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Export Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Include Comments</Label>
                  <Switch
                    checked={exportOptions.includeComments}
                    onCheckedChange={(v) => setExportOptions({ ...exportOptions, includeComments: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Include Defaults</Label>
                  <Switch
                    checked={exportOptions.includeDefaults}
                    onCheckedChange={(v) => setExportOptions({ ...exportOptions, includeDefaults: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Minify Output</Label>
                  <Switch
                    checked={exportOptions.minify}
                    onCheckedChange={(v) => setExportOptions({ ...exportOptions, minify: v })}
                  />
                </div>

                <div className="pt-4 border-t border-border">
                  <Label className="text-sm font-medium">Token Summary</Label>
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Colors</span>
                      <Badge variant="outline">{Object.keys(pkg?.design_tokens?.colors || {}).length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Typography</span>
                      <Badge variant="outline">{Object.keys(pkg?.design_tokens?.typography || {}).length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Spacing</span>
                      <Badge variant="outline">{Object.keys(pkg?.design_tokens?.spacing || {}).length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Effects</span>
                      <Badge variant="outline">{Object.keys(pkg?.design_tokens?.effects || {}).length}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  <pre className="p-4 text-sm font-mono text-midnight-900 whitespace-pre-wrap">
                    {getExportContent()}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}