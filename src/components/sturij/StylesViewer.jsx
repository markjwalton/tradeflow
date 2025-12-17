import React from 'react';

export default function StylesViewer() {
  const colorTokens = {
    'Primary': [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
    'Secondary': [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
    'Accent': [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
    'Background': [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
    'Midnight': [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
    'Charcoal': [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
    'Destructive': [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
  };

  const semanticColors = [
    { name: 'Background', var: '--background' },
    { name: 'Foreground', var: '--foreground' },
    { name: 'Card', var: '--card' },
    { name: 'Card Foreground', var: '--card-foreground' },
    { name: 'Primary', var: '--primary' },
    { name: 'Primary Foreground', var: '--primary-foreground' },
    { name: 'Secondary', var: '--secondary' },
    { name: 'Secondary Foreground', var: '--secondary-foreground' },
    { name: 'Muted', var: '--muted' },
    { name: 'Muted Foreground', var: '--muted-foreground' },
    { name: 'Accent', var: '--accent' },
    { name: 'Accent Foreground', var: '--accent-foreground' },
    { name: 'Destructive', var: '--destructive' },
    { name: 'Destructive Foreground', var: '--destructive-foreground' },
    { name: 'Border', var: '--border' },
    { name: 'Input', var: '--input' },
    { name: 'Ring', var: '--ring' },
  ];

  const textColors = [
    { name: 'Text Primary', var: '--text-primary' },
    { name: 'Text Secondary', var: '--text-secondary' },
    { name: 'Text Body', var: '--text-body' },
    { name: 'Text Muted', var: '--text-muted' },
    { name: 'Text Subtle', var: '--text-subtle' },
    { name: 'Text Accent', var: '--text-accent' },
    { name: 'Text Inverse', var: '--text-inverse' },
  ];

  const typography = [
    { name: 'Display', class: 'font-display text-4xl font-light' },
    { name: 'Headline', class: 'font-display text-3xl font-light' },
    { name: 'Title', class: 'font-display text-2xl font-normal' },
    { name: 'Subtitle', class: 'font-display text-lg font-normal' },
    { name: 'Body', class: 'font-body text-base font-normal' },
    { name: 'Caption', class: 'font-body text-sm font-normal' },
    { name: 'Overline', class: 'font-display text-xs font-normal uppercase' },
  ];

  const shadows = [
    { name: 'xs', class: 'shadow-xs' },
    { name: 'sm', class: 'shadow-sm' },
    { name: 'md', class: 'shadow-md' },
    { name: 'lg', class: 'shadow-lg' },
    { name: 'xl', class: 'shadow-xl' },
    { name: '2xl', class: 'shadow-2xl' },
  ];

  const borderRadius = [
    { name: 'none', class: 'rounded-none' },
    { name: 'sm', class: 'rounded-sm' },
    { name: 'md', class: 'rounded-md' },
    { name: 'lg', class: 'rounded-lg' },
    { name: 'xl', class: 'rounded-xl' },
    { name: '2xl', class: 'rounded-2xl' },
    { name: '3xl', class: 'rounded-3xl' },
    { name: 'full', class: 'rounded-full' },
  ];

  return (
    <div className="space-y-8">
      {/* Color Palettes */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Color Palettes</h3>
        {Object.entries(colorTokens).map(([name, shades]) => (
          <div key={name} className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">{name}</h4>
            <div className="grid grid-cols-5 gap-2">
              {shades.map((shade) => (
                <div key={shade} className="text-center">
                  <div
                    className={`h-12 rounded border border-gray-200`}
                    style={{ backgroundColor: `var(--${name.toLowerCase()}-${shade})` }}
                  />
                  <span className="text-xs text-gray-500 mt-1 block">{shade}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Semantic Colors */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Semantic Colors</h3>
        <div className="grid grid-cols-2 gap-3">
          {semanticColors.map((color) => (
            <div key={color.var} className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded border border-gray-200"
                style={{ backgroundColor: `var(${color.var})` }}
              />
              <div>
                <div className="text-xs font-medium text-gray-900">{color.name}</div>
                <code className="text-xs text-gray-500">{color.var}</code>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Text Colors */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Text Colors</h3>
        <div className="space-y-2">
          {textColors.map((color) => (
            <div key={color.var} className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded border border-gray-200"
                style={{ backgroundColor: `var(${color.var})` }}
              />
              <div>
                <div className="text-xs font-medium text-gray-900">{color.name}</div>
                <code className="text-xs text-gray-500">{color.var}</code>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Typography */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Typography</h3>
        <div className="space-y-3">
          {typography.map((type) => (
            <div key={type.name} className="border-b border-gray-200 pb-3">
              <div className="text-xs text-gray-500 mb-1">{type.name}</div>
              <div className={type.class}>The quick brown fox</div>
              <code className="text-xs text-gray-500">{type.class}</code>
            </div>
          ))}
        </div>
      </div>

      {/* Shadows */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Shadows</h3>
        <div className="grid grid-cols-2 gap-4">
          {shadows.map((shadow) => (
            <div key={shadow.name} className="text-center">
              <div className={`h-16 bg-white ${shadow.class}`} />
              <div className="text-xs text-gray-500 mt-2">{shadow.name}</div>
              <code className="text-xs text-gray-500">{shadow.class}</code>
            </div>
          ))}
        </div>
      </div>

      {/* Border Radius */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Border Radius</h3>
        <div className="grid grid-cols-4 gap-4">
          {borderRadius.map((radius) => (
            <div key={radius.name} className="text-center">
              <div className={`h-16 bg-gray-200 ${radius.class}`} />
              <div className="text-xs text-gray-500 mt-2">{radius.name}</div>
              <code className="text-xs text-gray-500">{radius.class}</code>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}