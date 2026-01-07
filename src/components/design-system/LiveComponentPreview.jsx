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

const bgColors = [
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

const textColors = [
  { label: 'Default (from style)', value: 'default' },
  { label: 'Text Primary', value: 'var(--color-text-primary)' },
  { label: 'Text Secondary', value: 'var(--color-text-secondary)' },
  { label: 'Text Muted', value: 'var(--color-text-muted)' },
  { label: 'Primary 500', value: 'var(--primary-500)' },
  { label: 'Primary 700', value: 'var(--primary-700)' },
  { label: 'Secondary 500', value: 'var(--secondary-500)' },
  { label: 'Accent 500', value: 'var(--accent-500)' },
  { label: 'Midnight 700', value: 'var(--midnight-700)' },
  { label: 'Midnight 900', value: 'var(--midnight-900)' },
  { label: 'Charcoal 600', value: 'var(--charcoal-600)' },
  { label: 'Charcoal 900', value: 'var(--charcoal-900)' },
];

export function LiveComponentPreview({ jsxCode, componentName }) {
  const [showCode, setShowCode] = useState(false);
  const [error, setError] = useState(null);
  const [Component, setComponent] = useState(null);
  const [previewBg, setPreviewBg] = useState('transparent');
  const [contentType, setContentType] = useState('lines');
  const [contentCount, setContentCount] = useState(3);
  const [customText, setCustomText] = useState('');
  const [textColor, setTextColor] = useState('default');
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
        // Typography component
        const textMatch = jsxCode.match(/className="([^"]+)"/);
        const className = textMatch?.[1] || 'text-base';
        
        const isHeading = className.includes('h1') || className.includes('h2') || className.includes('h3') || className.includes('heading');
        
        // Extract base styles from jsxCode
        const styleMatch = jsxCode.match(/style={{([^}]+)}}/);
        let baseStyle = {};
        if (styleMatch) {
          const styleStr = styleMatch[1];
          const fontSizeMatch = styleStr.match(/fontSize:\s*['"]([^'"]+)['"]/);
          const lineHeightMatch = styleStr.match(/lineHeight:\s*['"]([^'"]+)['"]/);
          const letterSpacingMatch = styleStr.match(/letterSpacing:\s*['"]([^'"]+)['"]/);
          const wordSpacingMatch = styleStr.match(/wordSpacing:\s*['"]([^'"]+)['"]/);
          const fontWeightMatch = styleStr.match(/fontWeight:\s*['"]([^'"]+)['"]/);
          const colorMatch = styleStr.match(/color:\s*['"]([^'"]+)['"]/);
          
          if (fontSizeMatch) baseStyle.fontSize = fontSizeMatch[1];
          if (lineHeightMatch) baseStyle.lineHeight = lineHeightMatch[1];
          if (letterSpacingMatch) baseStyle.letterSpacing = letterSpacingMatch[1];
          if (wordSpacingMatch) baseStyle.wordSpacing = wordSpacingMatch[1];
          if (fontWeightMatch) baseStyle.fontWeight = fontWeightMatch[1];
          if (colorMatch && textColor === 'default') baseStyle.color = colorMatch[1];
        }
        
        // Apply color override if not default
        if (textColor !== 'default') {
          baseStyle.color = textColor;
        }
        
        // Generate content based on type
        const loremParagraphs = [
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
          'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
          'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
        ];
        
        const quickBrownFox = 'The quick brown fox jumps over the lazy dog.';
        
        let content;
        if (customText) {
          content = [customText];
        } else if (contentType === 'paragraphs') {
          content = loremParagraphs.slice(0, contentCount);
        } else {
          content = Array(contentCount).fill(quickBrownFox);
        }
        
        return () => (
          <div className="w-full max-w-2xl space-y-2">
            {isHeading ? (
              <h1 className={className} style={baseStyle}>{content[0]}</h1>
            ) : (
              <div className={contentType === 'paragraphs' ? 'space-y-3' : 'space-y-1'}>
                {content.map((text, i) => (
                  <p key={i} className={className} style={baseStyle}>{text}</p>
                ))}
              </div>
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
  }, [jsxCode, contentType, contentCount, customText, textColor, refreshKey]);

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-muted/50 p-3 border-b">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-sm font-medium">Live Preview</span>
          <div className="flex items-center gap-2">
            <Select value={previewBg} onValueChange={setPreviewBg}>
              <SelectTrigger className="w-40 h-8 text-xs">
                <SelectValue placeholder="Background" />
              </SelectTrigger>
              <SelectContent>
                {bgColors.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" onClick={() => setShowCode(!showCode)}>
              {showCode ? <Eye className="h-4 w-4" /> : <Code className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        {jsxCode.includes('text-') && (
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={contentType} onValueChange={setContentType}>
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lines">Lines</SelectItem>
                <SelectItem value="paragraphs">Paragraphs</SelectItem>
                <SelectItem value="custom">Custom Text</SelectItem>
              </SelectContent>
            </Select>
            
            {contentType !== 'custom' && (
              <Select value={contentCount.toString()} onValueChange={(v) => setContentCount(parseInt(v))}>
                <SelectTrigger className="w-24 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contentType === 'paragraphs' ? (
                    <>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            )}
            
            {contentType === 'custom' && (
              <Input
                type="text"
                placeholder="Enter custom text..."
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="h-8 text-xs flex-1"
              />
            )}
            
            <Select value={textColor} onValueChange={setTextColor}>
              <SelectTrigger className="w-44 h-8 text-xs">
                <SelectValue placeholder="Text Color" />
              </SelectTrigger>
              <SelectContent>
                {textColors.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
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