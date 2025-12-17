import { radii } from '@/components/library/designTokens';

export default function RadiiViewer() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-900">Border Radius Tokens</h3>
        <p className="text-sm text-gray-600">Rounded corners for UI elements</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {Object.entries(radii).map(([name, value]) => (
          <div key={name} className="space-y-2">
            <div className="text-xs text-gray-600 capitalize">{name}</div>
            <div 
              className="h-24 bg-indigo-100 border-2 border-indigo-300 flex items-center justify-center"
              style={{ borderRadius: value }}
            >
              <span className="text-sm text-gray-700">{value}</span>
            </div>
            <code className="text-[10px] text-gray-500 block">{value}</code>
          </div>
        ))}
      </div>
    </div>
  );
}