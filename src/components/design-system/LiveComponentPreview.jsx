import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Code, ArrowRight, ChevronDown, Check, X, AlertCircle, Info, Plus, Minus, Settings, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
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

  const [customText, setCustomText] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Force refresh when CSS variables change
  useEffect(() => {
    const handleCSSChange = () => setRefreshKey(prev => prev + 1);
    window.addEventListener('css-variables-updated', handleCSSChange);
    return () => window.removeEventListener('css-variables-updated', handleCSSChange);
  }, []);

  useEffect(() => {
    // Render based on component patterns
    const renderStaticPreview = () => {
      if (jsxCode.includes('className="text-')) {
        // Typography component - show multiple lines/paragraphs
        const textMatch = jsxCode.match(/className="([^"]+)"/);
        const className = textMatch?.[1] || 'text-base';
        
        const isParagraph = className.includes('paragraph') || className.includes('body');
        const isHeading = className.includes('h1') || className.includes('h2') || className.includes('h3') || className.includes('heading');
        
        const displayText = customText || (isParagraph 
          ? 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.'
          : 'The quick brown fox jumps over the lazy dog. The quick brown fox jumps over the lazy dog. The quick brown fox jumps over the lazy dog. The quick brown fox jumps over the lazy dog. The quick brown fox jumps over the lazy dog.');
        
        return () => (
          <div className="w-full max-w-2xl space-y-2">
            {isHeading ? (
              <h1 className={className}>{displayText.split('.')[0]}</h1>
            ) : (
              <>
                {isParagraph ? (
                  <div className="space-y-3">
                    <p className={className}>{displayText}</p>
                    <p className={className}>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.</p>
                    <p className={className}>Sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium.</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className={className}>{displayText}</p>
                  </div>
                )}
              </>
            )}
          </div>
        );
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
  }, [jsxCode, customText]);

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-muted/50 p-3 flex items-center justify-between border-b gap-2">
        <span className="text-sm font-medium">Live Preview</span>
        <div className="flex items-center gap-2 flex-1 max-w-xl">
          {jsxCode.includes('text-') && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowCustomInput(!showCustomInput)}
                className="text-xs h-8"
              >
                {showCustomInput ? 'Hide' : 'Custom Text'}
              </Button>
              {showCustomInput && (
                <Input
                  type="text"
                  placeholder="Enter custom text..."
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className="h-8 text-xs flex-1"
                />
              )}
            </>
          )}
        </div>
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
          <div key={refreshKey} className="flex items-center justify-center min-h-[100px]">
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