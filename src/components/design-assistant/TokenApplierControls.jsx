import React, { useState } from 'react';
import { useTokenApplier } from './TokenApplierContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Paintbrush, X, Save, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function TokenApplierControls() {
  const { 
    isActive, 
    selectedElement, 
    activateTokenApplier, 
    deactivateTokenApplier,
    saveMapping 
  } = useTokenApplier();
  
  const [componentType, setComponentType] = useState('');
  const [selector, setSelector] = useState('');

  React.useEffect(() => {
    if (selectedElement) {
      setComponentType(selectedElement.tagName);
      setSelector(selectedElement.className || selectedElement.id);
    }
  }, [selectedElement]);

  if (!isActive) {
    return (
      <Button
        onClick={activateTokenApplier}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Paintbrush className="h-4 w-4" />
        Start Token Applier
      </Button>
    );
  }

  return (
    <Card className="p-4 space-y-4 border-primary-300 bg-primary-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Paintbrush className="h-4 w-4 text-primary-600" />
          <span className="font-semibold text-sm">Token Applier Active</span>
        </div>
        <Button
          onClick={deactivateTokenApplier}
          variant="ghost"
          size="sm"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {selectedElement ? (
        <div className="space-y-3">
          <div className="text-sm">
            <div className="font-medium mb-2">Selected Element:</div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{selectedElement.tagName}</Badge>
              {selectedElement.className && (
                <Badge variant="outline" className="font-mono text-xs">
                  .{selectedElement.className.split(' ')[0]}
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              {Object.entries(selectedElement.styles).map(([prop, value]) => (
                value && value !== 'none' && value !== 'normal' && value !== 'auto' && (
                  <div key={prop} className="flex justify-between">
                    <span className="font-mono">{prop}:</span>
                    <span className="font-mono truncate max-w-[200px]">{value}</span>
                  </div>
                )
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Input
              placeholder="Component type (e.g., button-primary)"
              value={componentType}
              onChange={(e) => setComponentType(e.target.value)}
              className="text-sm"
            />
            <Input
              placeholder="CSS selector (e.g., .btn-primary)"
              value={selector}
              onChange={(e) => setSelector(e.target.value)}
              className="text-sm"
            />
            <Button
              onClick={() => saveMapping(componentType, selector)}
              size="sm"
              className="w-full gap-2"
            >
              <Save className="h-3 w-3" />
              Save Mapping
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Click any element on the page to select it
        </div>
      )}
    </Card>
  );
}