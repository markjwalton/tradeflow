import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ColorSwatch = ({ label, variable, hex }) => (
  <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow">
    <div
      className="h-12 w-12 rounded-lg border-2 border-border shadow-sm"
      style={{ backgroundColor: `var(${variable})` }}
    />
    <div className="flex-1">
      <div className="text-sm font-medium">{label}</div>
      <code className="text-xs text-muted-foreground block">{variable}</code>
      {hex && <code className="text-xs text-muted-foreground">{hex}</code>}
    </div>
  </div>
);

export default function ColorShowcase() {
  return (
    <div className="space-y-6" data-component="colorShowcase">
      <div>
        <h3 className="text-lg font-display mb-2">Color System</h3>
        <p className="text-sm text-muted-foreground">
          OKLCH color space • Warm, professional palette
        </p>
      </div>

      <Tabs defaultValue="primary" className="w-full">
        <TabsList>
          <TabsTrigger value="primary">Primary</TabsTrigger>
          <TabsTrigger value="secondary">Secondary</TabsTrigger>
          <TabsTrigger value="accent">Accent</TabsTrigger>
          <TabsTrigger value="midnight">Midnight</TabsTrigger>
          <TabsTrigger value="semantic">Semantic</TabsTrigger>
        </TabsList>

        <TabsContent value="primary" className="mt-6" data-element="color-palettes">
          <div>
            <h4 className="text-sm font-medium mb-4">Sage Green Scale</h4>
            <p className="text-xs text-muted-foreground mb-4">
              Primary brand color • Used for interactive elements, CTAs, and key highlights
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              <ColorSwatch label="Primary 50" variable="--primary-50" hex="oklch(0.972 0.011 159.8)" />
              <ColorSwatch label="Primary 100" variable="--primary-100" hex="oklch(0.945 0.022 159.8)" />
              <ColorSwatch label="Primary 200" variable="--primary-200" hex="oklch(0.890 0.033 159.8)" />
              <ColorSwatch label="Primary 300" variable="--primary-300" hex="oklch(0.791 0.044 159.8)" />
              <ColorSwatch label="Primary 400" variable="--primary-400" hex="oklch(0.668 0.048 159.8)" />
              <ColorSwatch label="Primary 500" variable="--primary-500" hex="oklch(0.398 0.037 159.8)" />
              <ColorSwatch label="Primary 600" variable="--primary-600" hex="oklch(0.333 0.031 159.8)" />
              <ColorSwatch label="Primary 700" variable="--primary-700" hex="oklch(0.279 0.026 159.8)" />
              <ColorSwatch label="Primary 800" variable="--primary-800" hex="oklch(0.237 0.022 159.8)" />
              <ColorSwatch label="Primary 900" variable="--primary-900" hex="oklch(0.204 0.019 159.8)" />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="secondary" className="mt-6">
          <div>
            <h4 className="text-sm font-medium mb-4">Warm Beige Scale</h4>
            <p className="text-xs text-muted-foreground mb-4">
              Secondary accent • Used for complementary elements and subtle highlights
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              <ColorSwatch label="Secondary 50" variable="--secondary-50" hex="oklch(0.980 0.010 70.3)" />
              <ColorSwatch label="Secondary 100" variable="--secondary-100" hex="oklch(0.960 0.020 70.3)" />
              <ColorSwatch label="Secondary 200" variable="--secondary-200" hex="oklch(0.906 0.040 70.3)" />
              <ColorSwatch label="Secondary 300" variable="--secondary-300" hex="oklch(0.835 0.060 70.3)" />
              <ColorSwatch label="Secondary 400" variable="--secondary-400" hex="oklch(0.728 0.074 70.3)" />
              <ColorSwatch label="Secondary 500" variable="--secondary-500" hex="oklch(0.676 0.085 70.3)" />
              <ColorSwatch label="Secondary 600" variable="--secondary-600" hex="oklch(0.610 0.090 70.3)" />
              <ColorSwatch label="Secondary 700" variable="--secondary-700" hex="oklch(0.516 0.076 70.3)" />
              <ColorSwatch label="Secondary 800" variable="--secondary-800" hex="oklch(0.437 0.064 70.3)" />
              <ColorSwatch label="Secondary 900" variable="--secondary-900" hex="oklch(0.374 0.054 70.3)" />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="accent" className="mt-6">
          <div>
            <h4 className="text-sm font-medium mb-4">Dusty Rose Scale</h4>
            <p className="text-xs text-muted-foreground mb-4">
              Accent color • Used for special highlights and decorative elements
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              <ColorSwatch label="Accent 50" variable="--accent-50" hex="oklch(0.980 0.008 35.6)" />
              <ColorSwatch label="Accent 100" variable="--accent-100" hex="oklch(0.957 0.016 35.6)" />
              <ColorSwatch label="Accent 200" variable="--accent-200" hex="oklch(0.894 0.032 35.6)" />
              <ColorSwatch label="Accent 300" variable="--accent-300" hex="oklch(0.785 0.044 35.6)" />
              <ColorSwatch label="Accent 400" variable="--accent-400" hex="oklch(0.715 0.048 35.6)" />
              <ColorSwatch label="Accent 500" variable="--accent-500" hex="oklch(0.646 0.052 35.6)" />
              <ColorSwatch label="Accent 600" variable="--accent-600" hex="oklch(0.577 0.056 35.6)" />
              <ColorSwatch label="Accent 700" variable="--accent-700" hex="oklch(0.490 0.047 35.6)" />
              <ColorSwatch label="Accent 800" variable="--accent-800" hex="oklch(0.417 0.040 35.6)" />
              <ColorSwatch label="Accent 900" variable="--accent-900" hex="oklch(0.357 0.034 35.6)" />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="midnight" className="mt-6">
          <div>
            <h4 className="text-sm font-medium mb-4">Dark Blue-Gray Scale</h4>
            <p className="text-xs text-muted-foreground mb-4">
              Neutral dark tones • Used for text, backgrounds, and structural elements
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              <ColorSwatch label="Midnight 50" variable="--midnight-50" hex="oklch(0.970 0.007 235.4)" />
              <ColorSwatch label="Midnight 100" variable="--midnight-100" hex="oklch(0.929 0.014 235.4)" />
              <ColorSwatch label="Midnight 200" variable="--midnight-200" hex="oklch(0.859 0.026 235.4)" />
              <ColorSwatch label="Midnight 300" variable="--midnight-300" hex="oklch(0.749 0.032 235.4)" />
              <ColorSwatch label="Midnight 400" variable="--midnight-400" hex="oklch(0.619 0.038 235.4)" />
              <ColorSwatch label="Midnight 500" variable="--midnight-500" hex="oklch(0.513 0.040 235.4)" />
              <ColorSwatch label="Midnight 600" variable="--midnight-600" hex="oklch(0.451 0.041 235.4)" />
              <ColorSwatch label="Midnight 700" variable="--midnight-700" hex="oklch(0.387 0.040 235.4)" />
              <ColorSwatch label="Midnight 800" variable="--midnight-800" hex="oklch(0.341 0.038 235.4)" />
              <ColorSwatch label="Midnight 900" variable="--midnight-900" hex="oklch(0.223 0.036 235.4)" />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="semantic" className="mt-6">
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium mb-4">Status Colors</h4>
              <div className="grid gap-3 md:grid-cols-2">
                <ColorSwatch label="Success" variable="--success" hex="Primary 600" />
                <ColorSwatch label="Warning" variable="--warning" hex="Secondary 500" />
                <ColorSwatch label="Destructive" variable="--destructive" hex="oklch(0.482 0.071 25.7)" />
                <ColorSwatch label="Info" variable="--info" hex="Midnight 600" />
              </div>
            </div>
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-4">Surface Colors</h4>
              <div className="grid gap-3 md:grid-cols-2">
                <ColorSwatch label="Background" variable="--background" hex="Background 100" />
                <ColorSwatch label="Card" variable="--card" hex="#ffffff" />
                <ColorSwatch label="Muted" variable="--muted" hex="Background 200" />
                <ColorSwatch label="Popover" variable="--popover" hex="#ffffff" />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}