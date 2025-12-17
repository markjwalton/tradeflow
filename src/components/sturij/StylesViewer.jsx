export default function StylesViewer() {
  const colorPalettes = ['primary', 'secondary', 'accent', 'background', 'midnight', 'charcoal', 'destructive'];
  const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-900">Sturij Design Tokens</h3>
        <p className="text-sm text-gray-600">Current page styles from globals.css</p>
      </div>

      {colorPalettes.map((name) => (
        <div key={name}>
          <h4 className="text-sm font-semibold mb-2 capitalize text-gray-900">{name}</h4>
          <div className="grid grid-cols-5 gap-2">
            {shades.map((shade) => {
              const cssVarName = `--${name}-${shade}`;
              return (
                <div key={shade}>
                  <div 
                    className="h-12 rounded border border-gray-300" 
                    style={{ background: `var(${cssVarName})` }} 
                  />
                  <div className="text-xs text-gray-700 mt-1">{shade}</div>
                  <code className="text-[10px] text-gray-500 block truncate">{cssVarName}</code>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}