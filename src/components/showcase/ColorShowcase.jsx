import React from 'react';

const ColorSwatch = ({ label, variable, className }) => (
  <div className="flex items-center gap-3">
    <div
      className={`h-10 w-10 rounded-lg border ${className}`}
      style={{ backgroundColor: `var(${variable})` }}
    />
    <div>
      <div className="text-sm font-medium">{label}</div>
      <code className="text-xs text-muted-foreground">{variable}</code>
    </div>
  </div>
);

export default function ColorShowcase() {
  return (
    <div className="space-y-8" data-component="colorShowcase">
      <div>
        <h3 className="text-lg font-display mb-2">Color System</h3>
        <p className="text-sm text-muted-foreground">
          Sturij design tokens - warm, professional color palette
        </p>
      </div>

      <div className="space-y-6" data-element="color-palettes">
        <div>
          <h4 className="text-sm font-medium mb-4">Primary (Sage Green)</h4>
          <div className="grid gap-3 md:grid-cols-2">
            <ColorSwatch label="Primary 50" variable="--primary-50" />
            <ColorSwatch label="Primary 100" variable="--primary-100" />
            <ColorSwatch label="Primary 300" variable="--primary-300" />
            <ColorSwatch label="Primary 500" variable="--primary-500" />
            <ColorSwatch label="Primary 700" variable="--primary-700" />
            <ColorSwatch label="Primary 900" variable="--primary-900" />
          </div>
        </div>

        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-4">Secondary (Warm Beige)</h4>
          <div className="grid gap-3 md:grid-cols-2">
            <ColorSwatch label="Secondary 50" variable="--secondary-50" />
            <ColorSwatch label="Secondary 100" variable="--secondary-100" />
            <ColorSwatch label="Secondary 300" variable="--secondary-300" />
            <ColorSwatch label="Secondary 500" variable="--secondary-500" />
            <ColorSwatch label="Secondary 700" variable="--secondary-700" />
            <ColorSwatch label="Secondary 900" variable="--secondary-900" />
          </div>
        </div>

        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-4">Accent (Dusty Rose)</h4>
          <div className="grid gap-3 md:grid-cols-2">
            <ColorSwatch label="Accent 50" variable="--accent-50" />
            <ColorSwatch label="Accent 100" variable="--accent-100" />
            <ColorSwatch label="Accent 300" variable="--accent-300" />
            <ColorSwatch label="Accent 500" variable="--accent-500" />
            <ColorSwatch label="Accent 700" variable="--accent-700" />
            <ColorSwatch label="Accent 900" variable="--accent-900" />
          </div>
        </div>

        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-4">Midnight (Dark Blue-Grey)</h4>
          <div className="grid gap-3 md:grid-cols-2">
            <ColorSwatch label="Midnight 100" variable="--midnight-100" />
            <ColorSwatch label="Midnight 300" variable="--midnight-300" />
            <ColorSwatch label="Midnight 500" variable="--midnight-500" />
            <ColorSwatch label="Midnight 700" variable="--midnight-700" />
            <ColorSwatch label="Midnight 900" variable="--midnight-900" />
          </div>
        </div>

        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-4">Semantic Colors</h4>
          <div className="grid gap-3 md:grid-cols-2">
            <ColorSwatch label="Success" variable="--success" />
            <ColorSwatch label="Warning" variable="--warning" />
            <ColorSwatch label="Destructive" variable="--destructive" />
            <ColorSwatch label="Info" variable="--info" />
          </div>
        </div>

        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-4">Background & Surface</h4>
          <div className="grid gap-3 md:grid-cols-2">
            <ColorSwatch label="Background" variable="--background" className="border-2" />
            <ColorSwatch label="Card" variable="--card" className="border-2" />
            <ColorSwatch label="Muted" variable="--muted" className="border-2" />
            <ColorSwatch label="Popover" variable="--popover" className="border-2" />
          </div>
        </div>
      </div>
    </div>
  );
}