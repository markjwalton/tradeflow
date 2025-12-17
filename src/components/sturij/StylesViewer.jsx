export default function StylesViewer() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sturij Design Tokens</h3>
        <p className="text-sm text-gray-600 mb-4">
          These are the available design tokens in the Sturij system.
        </p>
      </div>

      {/* Semantic Colors */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Semantic Colors</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-gray-50 rounded">
            <code>--background</code>
            <div className="w-full h-8 mt-1 rounded border" style={{ backgroundColor: 'var(--background)' }} />
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <code>--foreground</code>
            <div className="w-full h-8 mt-1 rounded border" style={{ backgroundColor: 'var(--foreground)' }} />
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <code>--primary</code>
            <div className="w-full h-8 mt-1 rounded border" style={{ backgroundColor: 'var(--primary)' }} />
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <code>--secondary</code>
            <div className="w-full h-8 mt-1 rounded border" style={{ backgroundColor: 'var(--secondary)' }} />
          </div>
        </div>
      </div>

      {/* Text Colors */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Text Colors</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded border" style={{ backgroundColor: 'var(--text-primary)' }} />
            <code>--text-primary</code>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded border" style={{ backgroundColor: 'var(--text-secondary)' }} />
            <code>--text-secondary</code>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded border" style={{ backgroundColor: 'var(--text-muted)' }} />
            <code>--text-muted</code>
          </div>
        </div>
      </div>

      {/* Typography */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Typography Classes</h4>
        <div className="space-y-2 text-xs">
          <div className="p-2 bg-gray-50 rounded">
            <code className="text-xs">text-primary</code>
            <p className="text-primary mt-1">Primary text</p>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <code className="text-xs">text-secondary</code>
            <p className="text-secondary mt-1">Secondary text</p>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <code className="text-xs">text-muted</code>
            <p className="text-muted mt-1">Muted text</p>
          </div>
        </div>
      </div>
    </div>
  );
}