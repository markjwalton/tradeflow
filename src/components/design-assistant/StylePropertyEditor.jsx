import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export function StylePropertyEditor({ selectedElement, onApply }) {
  const [styleEdits, setStyleEdits] = useState({});
  const [tokens, setTokens] = useState({});
  const [currentStyles, setCurrentStyles] = useState({});

  useEffect(() => {
    if (!selectedElement?.element) return;

    // Get computed styles from the actual element
    const computed = window.getComputedStyle(selectedElement.element);
    setCurrentStyles({
      backgroundColor: computed.backgroundColor,
      color: computed.color,
      fontFamily: computed.fontFamily,
      fontSize: computed.fontSize,
      padding: computed.padding,
      margin: computed.margin,
      borderRadius: computed.borderRadius,
      boxShadow: computed.boxShadow,
    });

    // Extract all CSS variables from :root
    const root = getComputedStyle(document.documentElement);
    const allProps = Array.from(document.styleSheets)
      .flatMap(sheet => {
        try {
          return Array.from(sheet.cssRules);
        } catch (e) {
          return [];
        }
      })
      .filter(rule => rule.selectorText === ':root')
      .flatMap(rule => Array.from(rule.style))
      .filter(prop => prop.startsWith('--'));

    const tokensByCategory = {
      backgroundColor: [],
      color: [],
      fontFamily: [],
      fontSize: [],
      padding: [],
      margin: [],
      borderRadius: [],
      boxShadow: [],
    };

    allProps.forEach(prop => {
      const value = root.getPropertyValue(prop).trim();
      const cssVar = `var(${prop})`;

      if (prop.includes('background') || prop.startsWith('--primary-') || prop.startsWith('--secondary-') || prop.startsWith('--accent-') || prop.startsWith('--color-')) {
        tokensByCategory.backgroundColor.push({ label: prop.replace('--', ''), value: cssVar });
        tokensByCategory.color.push({ label: prop.replace('--', ''), value: cssVar });
      }
      
      if (prop.startsWith('--font-family-')) {
        tokensByCategory.fontFamily.push({ label: prop.replace('--', ''), value: cssVar });
      }
      
      if (prop.startsWith('--font-size-') || prop.startsWith('--text-')) {
        tokensByCategory.fontSize.push({ label: prop.replace('--', ''), value: cssVar });
      }
      
      if (prop.startsWith('--spacing-')) {
        tokensByCategory.padding.push({ label: prop.replace('--', ''), value: cssVar });
        tokensByCategory.margin.push({ label: prop.replace('--', ''), value: cssVar });
      }
      
      if (prop.startsWith('--radius-') || prop.includes('border-radius')) {
        tokensByCategory.borderRadius.push({ label: prop.replace('--', ''), value: cssVar });
      }
      
      if (prop.startsWith('--shadow-') || prop.includes('box-shadow')) {
        tokensByCategory.boxShadow.push({ label: prop.replace('--', ''), value: cssVar });
      }
    });

    setTokens(tokensByCategory);
  }, [selectedElement]);

  if (!selectedElement) {
    return (
      <div className="text-sm text-muted-foreground p-4 border rounded-lg text-center">
        Select an element to edit its styles
      </div>
    );
  }

  const styleProperties = [
    { key: 'backgroundColor', label: 'Background', current: currentStyles.backgroundColor },
    { key: 'color', label: 'Text Color', current: currentStyles.color },
    { key: 'fontFamily', label: 'Font Family', current: currentStyles.fontFamily },
    { key: 'fontSize', label: 'Font Size', current: currentStyles.fontSize },
    { key: 'padding', label: 'Padding', current: currentStyles.padding },
    { key: 'margin', label: 'Margin', current: currentStyles.margin },
    { key: 'borderRadius', label: 'Border Radius', current: currentStyles.borderRadius },
    { key: 'boxShadow', label: 'Box Shadow', current: currentStyles.boxShadow },
  ];

  const handleApply = (property, value, applyToAll) => {
    onApply(property, value, applyToAll);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Badge variant="outline" className="text-xs">
          {selectedElement.tagName}
        </Badge>
        {selectedElement.className && (
          <Badge variant="secondary" className="text-xs">
            .{(typeof selectedElement.className === 'string' ? selectedElement.className : '').split(' ')[0]}
          </Badge>
        )}
      </div>

      {styleProperties.map(({ key, label, current }) => (
        <div key={key} className="border rounded-lg p-3 space-y-2">
          <Label className="text-xs font-medium">{label}</Label>
          
          <div className="text-xs text-muted-foreground font-mono truncate">
            Current: {current || 'none'}
          </div>

          {tokens[key]?.length > 0 ? (
            <>
              <Select 
                value={styleEdits[key] || ''} 
                onValueChange={(value) => setStyleEdits(prev => ({ ...prev, [key]: value }))}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select token..." />
                </SelectTrigger>
                <SelectContent>
                  {tokens[key].map((token) => (
                    <SelectItem key={token.value} value={token.value} className="text-xs">
                      {token.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {styleEdits[key] && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-7 text-xs"
                    onClick={() => handleApply(key, styleEdits[key], false)}
                  >
                    Apply to This
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    className="flex-1 h-7 text-xs"
                    onClick={() => handleApply(key, styleEdits[key], true)}
                  >
                    Apply to All
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-xs text-muted-foreground italic">
              No tokens available for this property
            </div>
          )}
        </div>
      ))}
    </div>
  );
}