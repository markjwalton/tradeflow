import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Palette } from "lucide-react";
import { toast } from "sonner";

export default function ThemeEditorDialog({ open, onOpenChange, websiteFolderId, currentTheme }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    primary_color: "#4a7c6b",
    secondary_color: "#b5956a",
    background_color: "#f5f3ef",
    text_color: "#2a463b",
    heading_font: "degular-display",
    body_font: "mrs-eaves-xl-serif-narrow"
  });

  useEffect(() => {
    if (currentTheme) {
      // Parse existing theme if editing
      setFormData({
        name: currentTheme.name || "",
        primary_color: "#4a7c6b",
        secondary_color: "#b5956a",
        background_color: "#f5f3ef",
        text_color: "#2a463b",
        heading_font: "degular-display",
        body_font: "mrs-eaves-xl-serif-narrow"
      });
    }
  }, [currentTheme]);

  const generateCSSVariables = () => {
    return `:root {
  --color-primary: ${formData.primary_color};
  --color-secondary: ${formData.secondary_color};
  --color-background: ${formData.background_color};
  --color-text-primary: ${formData.text_color};
  --font-family-display: ${formData.heading_font}, sans-serif;
  --font-family-body: ${formData.body_font}, serif;
}`;
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const themeData = {
        name: formData.name,
        website_folder_id: websiteFolderId,
        css_variables: generateCSSVariables(),
        is_active: true,
        is_library_theme: false
      };

      if (currentTheme) {
        return await base44.entities.WebsiteTheme.update(currentTheme.id, themeData);
      } else {
        return await base44.entities.WebsiteTheme.create(themeData);
      }
    },
    onSuccess: (newTheme) => {
      // Update WebsiteFolder with new theme
      base44.entities.WebsiteFolder.update(websiteFolderId, { theme_id: newTheme.id });
      
      toast.success('Theme saved and applied successfully');
      queryClient.invalidateQueries({ queryKey: ['websiteThemes'] });
      queryClient.invalidateQueries({ queryKey: ['websiteFolders'] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error('Failed to save theme: ' + error.message);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            {currentTheme ? 'Edit Theme' : 'Create Theme'}
          </DialogTitle>
          <DialogDescription>
            Customize colors and fonts for your website
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="col-span-2 space-y-2">
            <Label htmlFor="themeName">Theme Name</Label>
            <Input
              id="themeName"
              placeholder="My Custom Theme"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="primaryColor">Primary Color</Label>
            <div className="flex gap-2">
              <Input
                id="primaryColor"
                type="color"
                value={formData.primary_color}
                onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                className="w-20 h-10"
              />
              <Input
                value={formData.primary_color}
                onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                placeholder="#4a7c6b"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondaryColor">Secondary Color</Label>
            <div className="flex gap-2">
              <Input
                id="secondaryColor"
                type="color"
                value={formData.secondary_color}
                onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                className="w-20 h-10"
              />
              <Input
                value={formData.secondary_color}
                onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                placeholder="#b5956a"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="backgroundColor">Background Color</Label>
            <div className="flex gap-2">
              <Input
                id="backgroundColor"
                type="color"
                value={formData.background_color}
                onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                className="w-20 h-10"
              />
              <Input
                value={formData.background_color}
                onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                placeholder="#f5f3ef"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="textColor">Text Color</Label>
            <div className="flex gap-2">
              <Input
                id="textColor"
                type="color"
                value={formData.text_color}
                onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                className="w-20 h-10"
              />
              <Input
                value={formData.text_color}
                onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                placeholder="#2a463b"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="headingFont">Heading Font</Label>
            <Input
              id="headingFont"
              value={formData.heading_font}
              onChange={(e) => setFormData({ ...formData, heading_font: e.target.value })}
              placeholder="degular-display"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bodyFont">Body Font</Label>
            <Input
              id="bodyFont"
              value={formData.body_font}
              onChange={(e) => setFormData({ ...formData, body_font: e.target.value })}
              placeholder="mrs-eaves-xl-serif-narrow"
            />
          </div>

          <div className="col-span-2 p-4 bg-muted rounded-lg">
            <Label className="text-xs text-muted-foreground mb-2 block">Preview</Label>
            <div 
              className="p-4 rounded border"
              style={{
                backgroundColor: formData.background_color,
                color: formData.text_color
              }}
            >
              <h3 
                style={{ 
                  color: formData.primary_color,
                  fontFamily: formData.heading_font
                }}
                className="text-xl font-bold mb-2"
              >
                Heading Preview
              </h3>
              <p style={{ fontFamily: formData.body_font }}>
                This is how your body text will look with the selected fonts and colors.
              </p>
              <Button 
                className="mt-2"
                style={{ backgroundColor: formData.secondary_color }}
              >
                Button Preview
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || !formData.name}
          >
            {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save & Apply Theme
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}