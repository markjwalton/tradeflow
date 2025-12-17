import { typography } from '@/components/library/designTokens';

export default function TypographyViewer() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-900">Typography Tokens</h3>
        <p className="text-sm text-gray-600">Font families, sizes, weights, and spacing</p>
      </div>

      {/* Font Families */}
      <div>
        <h4 className="text-sm font-semibold mb-2 text-gray-900">Font Families</h4>
        <div className="space-y-2">
          {Object.entries(typography.fonts).map(([name, value]) => (
            <div key={name} className="p-3 bg-gray-50 rounded border border-gray-200">
              <div className="text-xs text-gray-600 mb-1 capitalize">{name}</div>
              <div style={{ fontFamily: value }} className="text-base">
                The quick brown fox jumps over the lazy dog
              </div>
              <code className="text-[10px] text-gray-500 block mt-1">{value}</code>
            </div>
          ))}
        </div>
      </div>

      {/* Font Sizes */}
      <div>
        <h4 className="text-sm font-semibold mb-2 text-gray-900">Font Sizes</h4>
        <div className="space-y-2">
          {Object.entries(typography.sizes).map(([name, value]) => (
            <div key={name} className="p-3 bg-gray-50 rounded border border-gray-200 flex items-baseline justify-between">
              <div style={{ fontSize: value }}>Sample Text</div>
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-gray-600 capitalize">{name}</span>
                <code className="text-[10px] text-gray-500">{value}</code>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Letter Spacing */}
      <div>
        <h4 className="text-sm font-semibold mb-2 text-gray-900">Letter Spacing</h4>
        <div className="space-y-2">
          {Object.entries(typography.letterSpacing).map(([name, value]) => (
            <div key={name} className="p-3 bg-gray-50 rounded border border-gray-200 flex items-baseline justify-between">
              <div style={{ fontWeight: value }}>Sample Text</div>
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-gray-600 capitalize">{name}</span>
                <code className="text-[10px] text-gray-500">{value}</code>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Line Heights */}
      <div>
        <h4 className="text-sm font-semibold mb-2 text-gray-900">Line Heights</h4>
        <div className="space-y-2">
          {Object.entries(typography.lineHeights).map(([name, value]) => (
            <div key={name} className="p-3 bg-gray-50 rounded border border-gray-200">
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-xs text-gray-600 capitalize">{name}</span>
                <code className="text-[10px] text-gray-500">{value}</code>
              </div>
              <div style={{ lineHeight: value }} className="text-sm">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </div>
            </div>
          ))}
        </div>
      </div>


    </div>
  );
}