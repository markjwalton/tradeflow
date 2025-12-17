import { colors } from '@/components/library/designTokens';
import { useTokenApplier } from '@/components/design-assistant/TokenApplierContext';
import { Button } from '@/components/ui/button';
import { Paintbrush } from 'lucide-react';

export default function StylesViewer() {
  const { isActive, applyToken } = useTokenApplier();

  return (
    <div className="space-y-6" data-token-applier-ui>
      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-900">Sturij Design Tokens</h3>
        <p className="text-sm text-gray-600">Directly loaded from designTokens.js</p>
      </div>

      {Object.entries(colors).map(([paletteName, paletteObject]) => (
        <div key={paletteName}>
          <h4 className="text-sm font-semibold mb-2 capitalize text-gray-900">{paletteName}</h4>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(paletteObject).map(([shadeName, colorValue]) => (
              <div key={shadeName} className="space-y-1">
                <div 
                  className="h-12 rounded border border-gray-300" 
                  style={{ backgroundColor: colorValue || 'transparent' }}
                />
                <div className="text-xs text-gray-700 capitalize">{shadeName}</div>
                <code className="text-[10px] text-gray-500 block truncate" title={colorValue}>
                  {colorValue || 'not found'}
                </code>
                {isActive && colorValue && (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 text-[10px]"
                      onClick={() => applyToken('backgroundColor', colorValue, `${paletteName}-${shadeName}`)}
                    >
                      <Paintbrush className="h-3 w-3 mr-1" />
                      BG
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 text-[10px]"
                      onClick={() => applyToken('color', colorValue, `${paletteName}-${shadeName}`)}
                    >
                      <Paintbrush className="h-3 w-3 mr-1" />
                      Text
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}