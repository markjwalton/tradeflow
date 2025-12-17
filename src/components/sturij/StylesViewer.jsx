import { useEffect, useState } from 'react';

export default function StylesViewer() {
  const [colorTokens, setColorTokens] = useState({});

  useEffect(() => {
    const root = getComputedStyle(document.documentElement);
    const colors = {};
    
    ['primary', 'secondary', 'accent', 'background', 'midnight', 'charcoal', 'destructive'].forEach(name => {
      colors[name] = {};
      [50, 100, 200, 300, 400, 500, 600, 700, 800, 900].forEach(shade => {
        const value = root.getPropertyValue(`--${name}-${shade}`).trim();
        colors[name][shade] = value || `oklch(0.5 0.1 0)`;
      });
    });
    
    setColorTokens(colors);
  }, []);

  return (
    <div className="space-y-6 text-gray-900">
      <div>
        <h3 className="text-lg font-semibold mb-2">Sturij Design Tokens</h3>
        <p className="text-sm text-gray-600">Current page styles from globals.css</p>
      </div>

      {Object.entries(colorTokens).map(([name, shades]) => (
        <div key={name}>
          <h4 className="text-sm font-semibold mb-2 capitalize">{name}</h4>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(shades).map(([shade, value]) => (
              <div key={shade}>
                <div className="h-12 rounded border border-gray-300" style={{ backgroundColor: value }} />
                <div className="text-xs text-gray-700 mt-1">{shade}</div>
                <code className="text-[10px] text-gray-500 block truncate">{value}</code>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}