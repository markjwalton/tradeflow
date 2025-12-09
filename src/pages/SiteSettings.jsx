import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { toast } from "sonner";

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
  const [settings, setSettings] = useState({
    backgroundColor: "background-50",
    overlayColor: "midnight-900",
    overlayOpacity: 60,
    overlayBlur: "md",
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const user = await base44.auth.me();
        if (user?.site_settings) {
          setSettings(user.site_settings);
        }
      } catch (e) {
        console.error("Failed to load site settings:", e);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      await base44.auth.updateMe({
        site_settings: settings,
      });
      window.dispatchEvent(new CustomEvent('site-settings-changed', { detail: settings }));
      toast.success("Site settings saved");
    } catch (e) {
      console.error("Failed to save site settings:", e);
      toast.error("Failed to save settings");
    }
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
            <CardDescription>Control the main background color</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="background-color">Background Color</Label>
              <Select
                value={settings.backgroundColor}
                onValueChange={(value) => setSettings({ ...settings, backgroundColor: value })}
              >
                <SelectTrigger id="background-color">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colorTokens.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: `var(--${color.value})` }}
                        />
                        {color.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Select
                value={settings.overlayColor}
                onValueChange={(value) => setSettings({ ...settings, overlayColor: value })}
              >
                <SelectTrigger id="overlay-color">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colorTokens.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: `var(--${color.value})` }}
                        />
                        {color.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

            <div className="mt-4 p-4 rounded-lg border" style={{
              backgroundColor: `var(--${settings.overlayColor})`,
              opacity: settings.overlayOpacity / 100,
              backdropFilter: settings.overlayBlur !== 'none' ? `blur(${settings.overlayBlur === 'sm' ? '4px' : settings.overlayBlur === 'md' ? '8px' : settings.overlayBlur === 'lg' ? '12px' : '16px'})` : 'none'
            }}>
              <p className="text-white text-sm">Preview of overlay appearance</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg">
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}