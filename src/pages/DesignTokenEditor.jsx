import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Save, RotateCcw, Eye, Code, Palette } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

const TOKEN_CATEGORIES = {
  colors: {
    label: "Colors",
    icon: Palette,
    tokens: [
      { name: "primary-500", label: "Primary", type: "color" },
      { name: "secondary-400", label: "Secondary", type: "color" },
      { name: "accent-300", label: "Accent", type: "color" },
      { name: "background", label: "Background", type: "color" },
      { name: "foreground", label: "Foreground", type: "color" },
      { name: "muted", label: "Muted", type: "color" },
      { name: "border", label: "Border", type: "color" },
      { name: "destructive", label: "Destructive", type: "color" },
    ]
  },
  typography: {
    label: "Typography",
    tokens: [
      { name: "font-family-display", label: "Display Font", type: "font" },
      { name: "font-family-body", label: "Body Font", type: "font" },
      { name: "font-family-mono", label: "Mono Font", type: "font" },
      { name: "font-size-base", label: "Base Font Size", type: "size" },
      { name: "leading-normal", label: "Line Height", type: "number" },
    ]
  },
  spacing: {
    label: "Spacing",
    tokens: [
      { name: "spacing-1", label: "Spacing 1", type: "size" },
      { name: "spacing-2", label: "Spacing 2", type: "size" },
      { name: "spacing-3", label: "Spacing 3", type: "size" },
      { name: "spacing-4", label: "Spacing 4", type: "size" },
      { name: "spacing-6", label: "Spacing 6", type: "size" },
      { name: "spacing-8", label: "Spacing 8", type: "size" },
    ]
  },
  radius: {
    label: "Border Radius",
    tokens: [
      { name: "radius-sm", label: "Small", type: "size" },
      { name: "radius", label: "Default", type: "size" },
      { name: "radius-lg", label: "Large", type: "size" },
      { name: "radius-xl", label: "Extra Large", type: "size" },
    ]
  },
  shadows: {
    label: "Shadows",
    tokens: [
      { name: "shadow-sm", label: "Small Shadow", type: "shadow" },
      { name: "shadow-md", label: "Medium Shadow", type: "shadow" },
      { name: "shadow-lg", label: "Large Shadow", type: "shadow" },
    ]
  }
};

export default function DesignTokenEditor() {
  const [tokens, setTokens] = useState({});
  const [originalTokens, setOriginalTokens] = useState({});
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    loadCurrentTokens();
  }, []);

  const loadCurrentTokens = () => {
    const computedStyle = getComputedStyle(document.documentElement);
    const loadedTokens = {};

    Object.values(TOKEN_CATEGORIES).forEach(category => {
      category.tokens.forEach(token => {
        const value = computedStyle.getPropertyValue(`--${token.name}`).trim();
        loadedTokens[token.name] = value;
      });
    });

    setTokens(loadedTokens);
    setOriginalTokens(loadedTokens);
  };

  const updateToken = (name, value) => {
    setTokens(prev => ({ ...prev, [name]: value }));
    if (previewMode) {
      document.documentElement.style.setProperty(`--${name}`, value);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await base44.functions.invoke('updateGlobalCSS', {
        cssVariables: tokens
      });

      if (response.data.success) {
        toast.success('Design tokens saved successfully');
        setOriginalTokens(tokens);
      } else {
        toast.error('Failed to save tokens');
      }
    } catch (error) {
      console.error('Error saving tokens:', error);
      toast.error('Error saving design tokens');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setTokens(originalTokens);
    Object.entries(originalTokens).forEach(([name, value]) => {
      document.documentElement.style.setProperty(`--${name}`, value);
    });
    toast.info('Tokens reset to saved values');
  };

  const hasChanges = JSON.stringify(tokens) !== JSON.stringify(originalTokens);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Design Token Editor</h1>
          <p className="text-muted-foreground">
            Modify design tokens and save changes to globals.css
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? 'Preview On' : 'Preview Off'}
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasChanges}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={saving || !hasChanges}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {hasChanges && (
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
          <p className="text-sm">
            You have unsaved changes. Click "Save Changes" to persist them to globals.css
          </p>
        </div>
      )}

      <Tabs defaultValue="colors" className="space-y-4">
        <TabsList>
          {Object.entries(TOKEN_CATEGORIES).map(([key, category]) => (
            <TabsTrigger key={key} value={key}>
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(TOKEN_CATEGORIES).map(([key, category]) => (
          <TabsContent key={key} value={key}>
            <Card>
              <CardHeader>
                <CardTitle>{category.label}</CardTitle>
                <CardDescription>
                  Modify {category.label.toLowerCase()} tokens for your design system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {category.tokens.map(token => (
                    <TokenEditor
                      key={token.name}
                      token={token}
                      value={tokens[token.name] || ''}
                      onChange={(value) => updateToken(token.name, value)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Preview Components
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button>Primary Button</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
          
          <Card className="p-4">
            <h3 className="font-display text-lg mb-2">Sample Card</h3>
            <p className="text-body text-muted-foreground">
              This is sample text to preview typography changes.
            </p>
          </Card>

          <div className="flex gap-4 items-center">
            <div className="w-16 h-16 rounded bg-primary" />
            <div className="w-16 h-16 rounded bg-secondary" />
            <div className="w-16 h-16 rounded bg-accent" />
            <div className="w-16 h-16 rounded bg-muted" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TokenEditor({ token, value, onChange }) {
  return (
    <div className="space-y-2">
      <Label>{token.label}</Label>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`var(--${token.name})`}
          className="flex-1"
        />
        {token.type === 'color' && (
          <input
            type="color"
            value={value.startsWith('#') ? value : '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="w-12 h-10 rounded border cursor-pointer"
          />
        )}
      </div>
      <p className="text-xs text-muted-foreground">--{token.name}</p>
    </div>
  );
}