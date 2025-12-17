import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

// Find all DOM elements matching the selected element's classes
function findMatchingElements(element) {
  if (!element) return [];
  
  const className = typeof element.className === 'string' ? element.className : '';
  const classes = className.split(' ').filter(c => c);
  
  if (classes.length === 0) {
    // No classes - match by tag
    return Array.from(document.querySelectorAll(element.tagName));
  }
  
  // Match by first class
  const selector = `.${classes[0]}`;
  return Array.from(document.querySelectorAll(selector));
}

export function StylePropertyEditor({ selectedElement, onApply, horizontal = false }) {
  const [styleEdits, setStyleEdits] = useState({});
  const [tokens, setTokens] = useState({});
  const [currentStyles, setCurrentStyles] = useState({});
  const [matchingElements, setMatchingElements] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!selectedElement?.element) return;

    // Find all matching elements and set current index
    const matches = findMatchingElements(selectedElement.element);
    setMatchingElements(matches);
    const currentIdx = matches.findIndex(el => el === selectedElement.element);
    setCurrentIndex(currentIdx >= 0 ? currentIdx : 0);

    // Highlight all matching elements
    matches.forEach((el, idx) => {
      el.style.outline = idx === currentIdx 
        ? '2px solid var(--color-primary)' 
        : '1px dashed var(--color-primary-300)';
    });

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

    return () => {
      // Clean up highlights on unmount
      matches.forEach(el => {
        el.style.outline = '';
      });
    };

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

  const handleNavigate = (direction) => {
    if (matchingElements.length === 0) return;
    
    const newIndex = direction === 'next' 
      ? (currentIndex + 1) % matchingElements.length 
      : (currentIndex - 1 + matchingElements.length) % matchingElements.length;
    
    setCurrentIndex(newIndex);
    
    // Update highlights
    matchingElements.forEach((el, idx) => {
      el.style.outline = idx === newIndex 
        ? '2px solid var(--color-primary)' 
        : '1px dashed var(--color-primary-300)';
    });
    
    // Scroll to element
    matchingElements[newIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Notify parent of new selection
    if (window.tokenApplier?.selectElement) {
      window.tokenApplier.selectElement(matchingElements[newIndex]);
    }
  };

  const containerClass = horizontal 
    ? "flex flex-wrap items-start gap-3" 
    : "space-y-4";

  return (
    <div className={containerClass}>
      <div className={horizontal ? "flex items-center gap-2 min-w-[200px]" : "flex items-center gap-2 mb-4"}>
        <Badge variant="outline" className="text-xs">
          {selectedElement.tagName}
        </Badge>
        {selectedElement.className && (
          <Badge variant="secondary" className="text-xs">
            .{(typeof selectedElement.className === 'string' ? selectedElement.className : '').split(' ')[0]}
          </Badge>
        )}
        {matchingElements.length > 1 && (
          <div className="flex items-center gap-1 ml-2">
            <Badge variant="default" className="text-xs">
              {matchingElements.length} instances
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleNavigate('prev')}
              className="h-6 w-6 p-0"
              title="Previous instance"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <span className="text-xs text-muted-foreground">
              {currentIndex + 1}/{matchingElements.length}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleNavigate('next')}
              className="h-6 w-6 p-0"
              title="Next instance"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {styleProperties.map(({ key, label, current }) => (
        <div 
          key={key} 
          className={horizontal 
            ? "border rounded-lg p-2 flex items-center gap-2 min-w-[280px]" 
            : "border rounded-lg p-3 space-y-2"
          }
        >
          <div className={horizontal ? "flex-shrink-0 w-24" : ""}>
            <Label className="text-xs font-medium">{label}</Label>
            {!horizontal && (
              <div className="text-xs text-muted-foreground font-mono truncate mt-1">
                {current || 'none'}
              </div>
            )}
          </div>

          {tokens[key]?.length > 0 ? (
            <div className={horizontal ? "flex items-center gap-2 flex-1" : "space-y-2"}>
              <Select 
                value={styleEdits[key] || ''} 
                onValueChange={(value) => setStyleEdits(prev => ({ ...prev, [key]: value }))}
              >
                <SelectTrigger className={horizontal ? "h-7 text-xs flex-1" : "h-8 text-xs"}>
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
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className={horizontal ? "h-7 text-xs px-2" : "flex-1 h-7 text-xs"}
                    onClick={() => handleApply(key, styleEdits[key], false)}
                    title="Apply to current instance"
                  >
                    {horizontal ? "1" : "Apply to This"}
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    className={horizontal ? "h-7 text-xs px-2" : "flex-1 h-7 text-xs"}
                    onClick={() => handleApply(key, styleEdits[key], true)}
                    title="Apply to all instances"
                  >
                    {horizontal ? "All" : "Apply to All"}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground italic">
              No tokens
            </div>
          )}
        </div>
      ))}
    </div>
  );
}