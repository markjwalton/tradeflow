import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

const themeColors = [
  { label: 'Default', value: 'transparent' },
  { label: 'Background', value: 'var(--color-background)' },
  { label: 'Card', value: 'var(--color-card)' },
  { label: 'Primary 50', value: 'var(--primary-50)' },
  { label: 'Primary 100', value: 'var(--primary-100)' },
  { label: 'Primary 500', value: 'var(--primary-500)' },
  { label: 'Primary 900', value: 'var(--primary-900)' },
  { label: 'Secondary 50', value: 'var(--secondary-50)' },
  { label: 'Secondary 500', value: 'var(--secondary-500)' },
  { label: 'Charcoal 100', value: 'var(--charcoal-100)' },
  { label: 'Charcoal 900', value: 'var(--charcoal-900)' },
];

export function LiveComponentPreview({ jsxCode, componentName }) {
  const [showCode, setShowCode] = useState(false);
  const [error, setError] = useState(null);
  const [Component, setComponent] = useState(null);
  const [previewBg, setPreviewBg] = useState('transparent');

  useEffect(() => {
    // Render based on component patterns
    const renderStaticPreview = () => {
      if (jsxCode.includes('className="text-')) {
        // Typography component
        const textMatch = jsxCode.match(/className="([^"]+)"/);
        const textContent = jsxCode.match(/>([^<]+)</)?.[1] || 'Sample Text';
        const className = textMatch?.[1] || 'text-base';
        return () => <p className={className}>{textContent}</p>;
      }
      
      if (jsxCode.includes('<Button')) {
        // Button component
        const variantMatch = jsxCode.match(/variant="([^"]+)"/);
        const sizeMatch = jsxCode.match(/size="([^"]+)"/);
        return () => (
          <Button variant={variantMatch?.[1]} size={sizeMatch?.[1]}>
            Sample Button
          </Button>
        );
      }
      
      if (jsxCode.includes('<Card')) {
        // Card component
        return () => (
          <Card className="w-full max-w-md">
            <CardComponents.CardHeader>
              <CardComponents.CardTitle>Sample Card</CardComponents.CardTitle>
              <CardComponents.CardDescription>Card preview</CardComponents.CardDescription>
            </CardComponents.CardHeader>
            <CardComponents.CardContent>
              <p className="text-sm">This is a preview of the card component.</p>
            </CardComponents.CardContent>
          </Card>
        );
      }
      
      if (jsxCode.includes('<Badge')) {
        // Badge component
        const variantMatch = jsxCode.match(/variant="([^"]+)"/);
        return () => <Badge variant={variantMatch?.[1]}>Sample Badge</Badge>;
      }
      
      // Default fallback
      return null;
    };
    
    const PreviewComponent = renderStaticPreview();
    setComponent(() => PreviewComponent);
    setError(null);
  }, [jsxCode]);

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-muted/50 p-3 flex items-center justify-between border-b">
        <span className="text-sm font-medium">Live Preview</span>
        <div className="flex items-center gap-2">
          <Select value={previewBg} onValueChange={setPreviewBg}>
            <SelectTrigger className="w-40 h-8 text-xs">
              <SelectValue placeholder="Background" />
            </SelectTrigger>
            <SelectContent>
              {themeColors.map(c => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="ghost" size="sm" onClick={() => setShowCode(!showCode)}>
            {showCode ? <Eye className="h-4 w-4" /> : <Code className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      <div className="p-6 transition-colors" style={{ backgroundColor: previewBg }}>
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