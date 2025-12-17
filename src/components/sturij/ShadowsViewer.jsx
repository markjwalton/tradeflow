import { shadows } from '@/components/library/designTokens';

export default function ShadowsViewer() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-900">Shadow Tokens</h3>
        <p className="text-sm text-gray-600">Elevation and depth through shadows</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {Object.entries(shadows).map(([name, value]) => (
          <div key={name} className="space-y-2">
            <div className="text-xs text-gray-600 capitalize">{name}</div>
            <div 
              className="h-24 bg-white rounded flex items-center justify-center"
              style={{ boxShadow: value }}
            >
              <span className="text-sm text-gray-500">Shadow preview</span>
            </div>
            <code className="text-[10px] text-gray-500 block">{value}</code>
          </div>
        ))}
      </div>
    </div>
  );
}