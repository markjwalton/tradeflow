import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Code, ArrowRight, ChevronDown, Check, X, AlertCircle, Info, Plus, Minus, Settings, User } from 'lucide-react';
import * as ButtonComponents from '@/components/ui/button';
import * as CardComponents from '@/components/ui/card';
import * as BadgeComponents from '@/components/ui/badge';
import * as InputComponents from '@/components/ui/input';
import * as TabsComponents from '@/components/ui/tabs';
import { toast } from 'sonner';

const componentImports = {
  ...ButtonComponents,
  ...CardComponents,
  ...BadgeComponents,
  ...InputComponents,
  ...TabsComponents,
  toast,
  ArrowRight, ChevronDown, Check, X, AlertCircle, Info, Plus, Minus, Settings, User
};

export function LiveComponentPreview({ jsxCode, componentName }) {
  const [showCode, setShowCode] = useState(false);
  const [error, setError] = useState(null);
  const [Component, setComponent] = useState(null);

  useEffect(() => {
    try {
      // Transform JSX to React.createElement calls
      let transformedCode = jsxCode
        .replace(/<(\w+)([^>]*)>/g, (match, tag, attrs) => {
          const propsMatch = attrs.match(/className="([^"]*)"/);
          const className = propsMatch ? propsMatch[1] : '';
          if (className) {
            return `React.createElement(${tag}, { className: "${className}" }, `;
          }
          return `React.createElement(${tag}, null, `;
        })
        .replace(/<\/\w+>/g, ')')
        .replace(/return\s+/, 'return ');

      const componentFunction = new Function(
        'React',
        ...Object.keys(componentImports),
        `
        const { useState, useEffect, useRef, useMemo, useCallback } = React;
        return function PreviewComponent() {
          ${transformedCode}
        };
        `
      );

      const CompiledComponent = componentFunction(React, ...Object.values(componentImports));
      setComponent(() => CompiledComponent);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Component compilation error:', err);
    }
  }, [jsxCode]);

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-muted/50 p-3 flex items-center justify-between border-b">
        <span className="text-sm font-medium">Live Preview</span>
        <Button variant="ghost" size="sm" onClick={() => setShowCode(!showCode)}>
          {showCode ? <Eye className="h-4 w-4" /> : <Code className="h-4 w-4" />}
        </Button>
      </div>
      <div className="p-6 bg-background">
        {showCode ? (
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto">
            <code>{jsxCode}</code>
          </pre>
        ) : error ? (
          <div className="text-xs text-destructive bg-destructive/10 p-3 rounded">
            <strong>Error rendering component:</strong>
            <pre className="mt-2 whitespace-pre-wrap">{error}</pre>
          </div>
        ) : Component ? (
          <div className="flex items-center justify-center min-h-[100px]">
            <Component />
          </div>
        ) : (
          <div className="text-center text-sm text-muted-foreground">
            Initializing preview...
          </div>
        )}
      </div>
    </div>
  );
}