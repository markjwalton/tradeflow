import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, X, Sparkles, Loader2, Image as ImageIcon, Moon } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const overlayColorOptions = [
  { value: "none", label: "None" },
  { value: "primary-50", label: "Primary 50" },
];

const colorTokens = [
  { value: "primary-50", label: "Primary 50" },
  { value: "primary-100", label: "Primary 100" },
  { value: "primary-200", label: "Primary 200" },
  { value: "primary-300", label: "Primary 300" },
  { value: "primary-400", label: "Primary 400" },
  { value: "primary-500", label: "Primary 500" },
  { value: "primary-600", label: "Primary 600" },
  { value: "primary-700", label: "Primary 700" },
  { value: "primary-800", label: "Primary 800" },
  { value: "primary-900", label: "Primary 900" },
  { value: "secondary-50", label: "Secondary 50" },
  { value: "secondary-100", label: "Secondary 100" },
  { value: "secondary-200", label: "Secondary 200" },
  { value: "secondary-300", label: "Secondary 300" },
  { value: "secondary-400", label: "Secondary 400" },
  { value: "secondary-500", label: "Secondary 500" },
  { value: "secondary-600", label: "Secondary 600" },
  { value: "secondary-700", label: "Secondary 700" },
  { value: "secondary-800", label: "Secondary 800" },
  { value: "secondary-900", label: "Secondary 900" },
  { value: "accent-50", label: "Accent 50" },
  { value: "accent-100", label: "Accent 100" },
  { value: "accent-200", label: "Accent 200" },
  { value: "accent-300", label: "Accent 300" },
  { value: "accent-400", label: "Accent 400" },
  { value: "accent-500", label: "Accent 500" },
  { value: "accent-600", label: "Accent 600" },
  { value: "accent-700", label: "Accent 700" },
  { value: "accent-800", label: "Accent 800" },
  { value: "accent-900", label: "Accent 900" },
  { value: "midnight-50", label: "Midnight 50" },
  { value: "midnight-100", label: "Midnight 100" },
  { value: "midnight-200", label: "Midnight 200" },
  { value: "midnight-300", label: "Midnight 300" },
  { value: "midnight-400", label: "Midnight 400" },
  { value: "midnight-500", label: "Midnight 500" },
  { value: "midnight-600", label: "Midnight 600" },
  { value: "midnight-700", label: "Midnight 700" },
  { value: "midnight-800", label: "Midnight 800" },
  { value: "midnight-900", label: "Midnight 900" },
  { value: "charcoal-50", label: "Charcoal 50" },
  { value: "charcoal-100", label: "Charcoal 100" },
  { value: "charcoal-200", label: "Charcoal 200" },
  { value: "charcoal-300", label: "Charcoal 300" },
  { value: "charcoal-400", label: "Charcoal 400" },
  { value: "charcoal-500", label: "Charcoal 500" },
  { value: "charcoal-600", label: "Charcoal 600" },
  { value: "charcoal-700", label: "Charcoal 700" },
  { value: "charcoal-800", label: "Charcoal 800" },
  { value: "charcoal-900", label: "Charcoal 900" },
];

const blurOptions = [
  { value: "none", label: "None" },
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
  { value: "xl", label: "Extra Large" },
];

export default function SiteSettings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    backgroundColor: "background-50",
    navbarBackground: "sidebar",
    headerBackground: "background",
    panelBackground: "card",
    footerBackground: "background",
    editorBackground: "card",
    overlayColor: "midnight-900",
    overlayOpacity: 60,
    overlayBlur: "md",
    buttonSize: "md",
    ghostButtonHoverColor: "muted",
    selectedButtonColor: "primary",
    iconOnlyParentHoverColor: "primary-100",
    iconOnlyPageHoverColor: "muted",
    maxWidth: "1400",
    contentAlignment: "center",
    backgroundImage: null,
    backgroundSeason: "spring",
    darkMode: false,
  });
  const [originalSettings, setOriginalSettings] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [generatingBackground, setGeneratingBackground] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const user = await base44.auth.me();
        const defaultSettings = {
          backgroundColor: "background-50",
          navbarBackground: "sidebar",
          headerBackground: "background",
          panelBackground: "card",
          footerBackground: "background",
          editorBackground: "card",
          overlayColor: "midnight-900",
          overlayOpacity: 60,
          overlayBlur: "md",
          buttonSize: "md",
          ghostButtonHoverColor: "muted",
          selectedButtonColor: "primary",
          iconOnlyParentHoverColor: "primary-100",
          iconOnlyPageHoverColor: "muted",
          maxWidth: "1400",
          contentAlignment: "center",
          backgroundImage: null,
          backgroundSeason: "spring",
          darkMode: false,
        };
        const loadedSettings = user?.site_settings || defaultSettings;
        setSettings(loadedSettings);
        setOriginalSettings(loadedSettings);
      } catch (e) {
        console.error("Failed to load site settings:", e);
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    setHasChanges(JSON.stringify(settings) !== JSON.stringify(originalSettings));
  }, [settings, originalSettings]);

  const handleCancel = () => {
    if (hasChanges) {
      if (window.confirm("You have unsaved changes. Are you sure you want to cancel?")) {
        navigate(-1);
      }
    } else {
      navigate(-1);
    }
  };

  const handleSave = async () => {
    try {
      const user = await base44.auth.me();
      await base44.auth.updateMe({
        site_settings: {
          ...settings,
          maxWidth: String(settings.maxWidth || "1400"),
          contentAlignment: String(settings.contentAlignment || "center"),
          backgroundImage: settings.backgroundImage ? String(settings.backgroundImage) : null,
        },
      });
      
      const savedSettings = {
        ...settings,
        maxWidth: String(settings.maxWidth || "1400"),
        contentAlignment: String(settings.contentAlignment || "center"),
        backgroundImage: settings.backgroundImage ? String(settings.backgroundImage) : null,
      };
      
      setSettings(savedSettings);
      setOriginalSettings(savedSettings);
      setHasChanges(false);

      // Update CSS variable for editor background
      if (settings.editorBackground) {
        document.documentElement.style.setProperty('--color-editor-background', `var(--color-${settings.editorBackground})`);
      }

      // Apply dark mode immediately
      if (savedSettings.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      window.dispatchEvent(new CustomEvent('site-settings-changed', { detail: savedSettings }));
      toast.success("Site settings saved successfully");
    } catch (e) {
      console.error("Failed to save site settings:", e);
      toast.error(`Failed to save settings: ${e.message}`);
    }
  };

  const generateBackground = async () => {
    setGeneratingBackground(true);
    try {
      const seasonPrompts = {
        spring: "Subtle spring landscape with soft pastel colors, cherry blossoms, gentle hills, misty morning atmosphere, very muted and calming, minimal contrast",
        summer: "Soft summer meadow with golden sunlight, wildflowers in distance, hazy horizon, warm gentle tones, very subtle and peaceful",
        autumn: "Muted autumn forest with warm earth tones, falling leaves, soft fog, gentle orange and brown hues, calming and serene",
        winter: "Gentle winter landscape with soft snow, minimal details, pale blue and white tones, misty mountains in distance, very subtle and peaceful"
      };
      
      const prompt = `${seasonPrompts[settings.backgroundSeason]}. Ultra-wide panoramic format. Extremely subtle, low contrast, perfect for a website background that won't distract from content. Soft focus, dreamy atmosphere.`;
      
      const result = await base44.integrations.Core.GenerateImage({ prompt });
      setSettings({ ...settings, backgroundImage: result.url });
      toast.success("Background generated");
    } catch (e) {
      console.error("Failed to generate background:", e);
      toast.error("Failed to generate background");
    }
    setGeneratingBackground(false);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-display text-midnight-900 mb-2">Site Settings</h1>
        <p className="text-muted-foreground">Configure global appearance settings for the application</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Background Settings</CardTitle>
            <CardDescription>Control background colors for different areas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="background-color">Main Background</Label>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded border-2 flex-shrink-0"
                  style={{ backgroundColor: `var(--color-${settings.backgroundColor})` }}
                />
                <Select
                  value={settings.backgroundColor}
                  onValueChange={(value) => setSettings({ ...settings, backgroundColor: value })}
                >
                  <SelectTrigger id="background-color" className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorTokens.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: `var(--color-${color.value})` }}
                          />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="navbar-background">Navigation Bar</Label>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded border-2 flex-shrink-0"
                  style={{ backgroundColor: `var(--color-${settings.navbarBackground})` }}
                />
                <Select
                  value={settings.navbarBackground}
                  onValueChange={(value) => setSettings({ ...settings, navbarBackground: value })}
                >
                  <SelectTrigger id="navbar-background" className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorTokens.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: `var(--color-${color.value})` }}
                          />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="header-background">Header</Label>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded border-2 flex-shrink-0"
                  style={{ backgroundColor: `var(--color-${settings.headerBackground})` }}
                />
                <Select
                  value={settings.headerBackground}
                  onValueChange={(value) => setSettings({ ...settings, headerBackground: value })}
                >
                  <SelectTrigger id="header-background" className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorTokens.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: `var(--color-${color.value})` }}
                          />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="panel-background">Settings Panel</Label>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded border-2 flex-shrink-0"
                  style={{ backgroundColor: `var(--color-${settings.panelBackground})` }}
                />
                <Select
                  value={settings.panelBackground}
                  onValueChange={(value) => setSettings({ ...settings, panelBackground: value })}
                >
                  <SelectTrigger id="panel-background" className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorTokens.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: `var(--color-${color.value})` }}
                          />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="footer-background">Footer</Label>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded border-2 flex-shrink-0"
                  style={{ backgroundColor: `var(--color-${settings.footerBackground})` }}
                />
                <Select
                  value={settings.footerBackground}
                  onValueChange={(value) => setSettings({ ...settings, footerBackground: value })}
                >
                  <SelectTrigger id="footer-background" className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorTokens.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: `var(--color-${color.value})` }}
                          />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editor-background">Editor Panel</Label>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded border-2 flex-shrink-0"
                  style={{ backgroundColor: `var(--color-${settings.editorBackground})` }}
                />
                <Select
                  value={settings.editorBackground}
                  onValueChange={(value) => setSettings({ ...settings, editorBackground: value })}
                >
                  <SelectTrigger id="editor-background" className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorTokens.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: `var(--color-${color.value})` }}
                          />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            </CardContent>
            </Card>

        <Card>
          <CardHeader>
            <CardTitle>Overlay Settings</CardTitle>
            <CardDescription>Configure the overlay appearance for modals and panels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="overlay-color">Overlay Color</Label>
              <div className="flex items-center gap-3">
                {settings.overlayColor !== "none" && (
                  <div
                    className="w-8 h-8 rounded border-2 flex-shrink-0"
                    style={{ backgroundColor: `var(--color-${settings.overlayColor})` }}
                  />
                )}
                {settings.overlayColor === "none" && (
                  <div className="w-8 h-8 rounded border-2 flex-shrink-0 bg-transparent" />
                )}
                <Select
                  value={settings.overlayColor}
                  onValueChange={(value) => setSettings({ ...settings, overlayColor: value })}
                >
                  <SelectTrigger id="overlay-color" className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {overlayColorOptions.concat(colorTokens).map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          {color.value !== "none" && (
                            <div
                              className="w-4 h-4 rounded border"
                              style={{ backgroundColor: `var(--color-${color.value})` }}
                            />
                          )}
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="overlay-opacity">Overlay Opacity: {settings.overlayOpacity}%</Label>
              <Input
                id="overlay-opacity"
                type="range"
                min="0"
                max="100"
                step="5"
                value={settings.overlayOpacity}
                onChange={(e) => setSettings({ ...settings, overlayOpacity: Number(e.target.value) })}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="overlay-blur">Blur Effect</Label>
              <Select
                value={settings.overlayBlur}
                onValueChange={(value) => setSettings({ ...settings, overlayBlur: value })}
              >
                <SelectTrigger id="overlay-blur">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {blurOptions.map((blur) => (
                    <SelectItem key={blur.value} value={blur.value}>
                      {blur.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mt-4 relative rounded-lg border overflow-hidden h-32">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-200 to-secondary-200 p-4">
                <p className="text-sm text-midnight-900 font-medium">Sample content behind overlay</p>
                <p className="text-xs text-charcoal-600 mt-1">This shows how the overlay will appear over your content</p>
              </div>
              {settings.overlayColor !== "none" && (
                <div 
                  className="absolute inset-0" 
                  style={{
                    backgroundColor: `var(--color-${settings.overlayColor})`,
                    opacity: settings.overlayOpacity / 100,
                  }}
                />
              )}
              <div 
                className="absolute inset-0" 
                style={{
                  backdropFilter: settings.overlayBlur !== 'none' ? `blur(${settings.overlayBlur === 'sm' ? '4px' : settings.overlayBlur === 'md' ? '8px' : settings.overlayBlur === 'lg' ? '12px' : '16px'})` : 'none'
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-white text-sm font-medium drop-shadow-lg">Overlay Preview</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Button Settings</CardTitle>
            <CardDescription>Control button appearance for view navigation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="button-size">Button Size</Label>
              <Select
                value={settings.buttonSize}
                onValueChange={(value) => setSettings({ ...settings, buttonSize: value })}
              >
                <SelectTrigger id="button-size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sm">Small</SelectItem>
                  <SelectItem value="md">Medium</SelectItem>
                  <SelectItem value="lg">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ghost-hover">Unselected Button Hover</Label>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded border-2 flex-shrink-0"
                  style={{ backgroundColor: `var(--color-${settings.ghostButtonHoverColor})` }}
                />
                <Select
                  value={settings.ghostButtonHoverColor}
                  onValueChange={(value) => setSettings({ ...settings, ghostButtonHoverColor: value })}
                >
                  <SelectTrigger id="ghost-hover" className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorTokens.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: `var(--color-${color.value})` }}
                          />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="selected-color">Selected Button Color</Label>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded border-2 flex-shrink-0"
                  style={{ backgroundColor: `var(--color-${settings.selectedButtonColor})` }}
                />
                <Select
                  value={settings.selectedButtonColor}
                  onValueChange={(value) => setSettings({ ...settings, selectedButtonColor: value })}
                >
                  <SelectTrigger id="selected-color" className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorTokens.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: `var(--color-${color.value})` }}
                          />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Navigation Icon Tooltips</CardTitle>
            <CardDescription>Control hover colors for icon-only navigation mode</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="parent-hover">Parent/Folder Hover Color</Label>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded border-2 flex-shrink-0"
                  style={{ backgroundColor: `var(--color-${settings.iconOnlyParentHoverColor})` }}
                />
                <Select
                  value={settings.iconOnlyParentHoverColor}
                  onValueChange={(value) => setSettings({ ...settings, iconOnlyParentHoverColor: value })}
                >
                  <SelectTrigger id="parent-hover" className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorTokens.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: `var(--color-${color.value})` }}
                          />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="page-hover">Page Hover Color</Label>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded border-2 flex-shrink-0"
                  style={{ backgroundColor: `var(--color-${settings.iconOnlyPageHoverColor})` }}
                />
                <Select
                  value={settings.iconOnlyPageHoverColor}
                  onValueChange={(value) => setSettings({ ...settings, iconOnlyPageHoverColor: value })}
                >
                  <SelectTrigger id="page-hover" className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorTokens.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: `var(--color-${color.value})` }}
                          />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Layout & Width</CardTitle>
            <CardDescription>Control the maximum width and alignment of content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="max-width">Maximum Content Width (px)</Label>
              <Input
                id="max-width"
                type="number"
                min="1000"
                max="2400"
                step="100"
                value={settings.maxWidth}
                onChange={(e) => setSettings({ ...settings, maxWidth: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Recommended: 1400px (balanced), 1600px (wide), 1200px (narrow)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="alignment">Content Alignment</Label>
              <Select
                value={settings.contentAlignment}
                onValueChange={(value) => setSettings({ ...settings, contentAlignment: value })}
              >
                <SelectTrigger id="alignment">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mt-4 rounded-lg border p-4 bg-muted/30">
              <div className="text-xs font-medium mb-2">Preview</div>
              <div className="relative h-20 bg-background rounded border overflow-hidden">
                <div 
                  className="absolute top-0 bottom-0 bg-primary/10 border-x border-primary/30"
                  style={{
                    width: `${Math.min(100, (parseInt(settings.maxWidth) / 2400) * 100)}%`,
                    left: settings.contentAlignment === 'center' ? '50%' : 'auto',
                    right: settings.contentAlignment === 'right' ? '0' : 'auto',
                    transform: settings.contentAlignment === 'center' ? 'translateX(-50%)' : 'none'
                  }}
                >
                  <div className="text-xs text-center mt-2 text-primary">Content Area</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Content will be constrained to {settings.maxWidth}px and aligned {settings.contentAlignment}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dark Mode</CardTitle>
            <CardDescription>Toggle dark theme for the entire application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Moon className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-semibold">Dark Mode</div>
                  <div className="text-sm text-muted-foreground">Switch to dark theme</div>
                </div>
              </div>
              <Button
                variant={settings.darkMode ? "default" : "outline"}
                onClick={() => setSettings({ ...settings, darkMode: !settings.darkMode })}
              >
                {settings.darkMode ? "Enabled" : "Disabled"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Background Image</CardTitle>
            <CardDescription>Generate AI-powered seasonal landscape backgrounds</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="season">Season</Label>
              <Select
                value={settings.backgroundSeason}
                onValueChange={(value) => setSettings({ ...settings, backgroundSeason: value })}
              >
                <SelectTrigger id="season">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spring">Spring</SelectItem>
                  <SelectItem value="summer">Summer</SelectItem>
                  <SelectItem value="autumn">Autumn</SelectItem>
                  <SelectItem value="winter">Winter</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={generateBackground} 
              disabled={generatingBackground}
              variant="outline"
              className="w-full"
            >
              {generatingBackground ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate {settings.backgroundSeason ? (settings.backgroundSeason.charAt(0).toUpperCase() + settings.backgroundSeason.slice(1)) : 'Spring'} Background
                </>
              )}
            </Button>

            {settings.backgroundImage && (
              <div className="space-y-2">
                <Label>Current Background</Label>
                <div className="relative rounded-lg overflow-hidden border h-32">
                  <img 
                    src={settings.backgroundImage} 
                    alt="Background preview"
                    className="w-full h-full object-cover opacity-40"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2"
                    onClick={() => setSettings({ ...settings, backgroundImage: null })}
                  >
                    Remove
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Background will be displayed at low opacity behind content
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 sticky bottom-4 bg-background/95 backdrop-blur-sm p-4 rounded-lg border shadow-lg">
          <Button onClick={handleCancel} variant="outline" size="lg">
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            size="lg" 
            disabled={!hasChanges}
            className={hasChanges ? "bg-primary" : ""}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}