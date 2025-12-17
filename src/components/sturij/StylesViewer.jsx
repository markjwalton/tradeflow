import { useEffect, useState } from 'react';

export default function StylesViewer() {
  const [colors, setColors] = useState({});
  
  useEffect(() => {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    const colorData = {};
    
    ['primary', 'secondary', 'accent', 'background', 'midnight', 'charcoal', 'destructive'].forEach(name => {
      colorData[name] = {};
      [50, 100, 200, 300, 400, 500, 600, 700, 800, 900].forEach(shade => {
        const value = computedStyle.getPropertyValue(`--${name}-${shade}`).trim();
        colorData[name][shade] = value || 'not found';
      });
    });
    
    setColors(colorData);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-900">Sturij Design Tokens</h3>
        <p className="text-sm text-gray-600">Loaded from :root CSS variables</p>
      </div>

      {Object.entries(colors).map(([name, shades]) => (
        <div key={name}>
          <h4 className="text-sm font-semibold mb-2 capitalize text-gray-900">{name}</h4>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(shades).map(([shade, value]) => (
              <div key={shade}>
                <div 
                  className="h-12 rounded border border-gray-300" 
                  style={{ backgroundColor: value }}
                />
                <div className="text-xs text-gray-700 mt-1">{shade}</div>
                <code className="text-[10px] text-gray-500 block" title={value}>
                  {value}
                </code>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}