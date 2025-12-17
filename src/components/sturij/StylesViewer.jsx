import { colors } from '@/components/library/designTokens';

export default function StylesViewer() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-900">Sturij Design Tokens</h3>
        <p className="text-sm text-gray-600">Directly loaded from designTokens.js</p>
      </div>

      {Object.entries(colors).map(([paletteName, paletteObject]) => (
        <div key={paletteName}>
          <h4 className="text-sm font-semibold mb-2 capitalize text-gray-900">{paletteName}</h4>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(paletteObject).map(([shadeName, colorValue]) => (
              <div key={shadeName}>
                <div 
                  className="h-12 rounded border border-gray-300" 
                  style={{ backgroundColor: colorValue || 'transparent' }}
                />
                <div className="text-xs text-gray-700 mt-1 capitalize">{shadeName}</div>
                <code className="text-[10px] text-gray-500 block" title={colorValue}>
                  {colorValue || 'not found'}
                </code>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}