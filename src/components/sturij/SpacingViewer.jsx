import { spacing } from '@/components/library/designTokens';

export default function SpacingViewer() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-900">Spacing Tokens</h3>
        <p className="text-sm text-gray-600">Consistent spacing scale for margins and padding</p>
      </div>

      <div className="space-y-3">
        {Object.entries(spacing).map(([name, value]) => (
          <div key={name} className="flex items-center gap-4">
            <div className="w-24">
              <span className="text-xs text-gray-600 capitalize">{name}</span>
              <code className="text-[10px] text-gray-500 block">{value}</code>
            </div>
            <div className="flex-1 flex items-center gap-2">
              <div 
                className="bg-indigo-500 h-8"
                style={{ width: value }}
              />
              <span className="text-xs text-gray-500">{value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}