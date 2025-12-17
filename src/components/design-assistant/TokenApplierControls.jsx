import React, { useState } from 'react';
import { useTokenApplier } from './TokenApplierContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Target } from 'lucide-react';

export function TokenApplierControls() {
  const { isActive, selectedElement, activateTokenApplier, deactivateTokenApplier, saveMapping } = useTokenApplier();
  const [componentType, setComponentType] = useState('');
  const [selector, setSelector] = useState('');

  if (!isActive) {
    return (
      <div className="p-4 border-b" data-token-applier-ui>
        <Button onClick={activateTokenApplier} className="w-full">
          <Target className="h-4 w-4 mr-2" />
          Start Token Applier
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          Activate to select elements and apply design tokens
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 border-b space-y-4" data-token-applier-ui>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-primary-600">Token Applier Active</h3>
        <Button 
          onClick={deactivateTokenApplier} 
          variant="ghost" 
          size="sm"
          className="h-8 px-2"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {selectedElement ? (
        <div className="space-y-3">
          <div className="p-3 bg-primary-50 rounded border border-primary-200">
            <p className="text-xs font-medium text-primary-900 mb-1">Selected Element</p>
            <p className="text-xs font-mono text-primary-700">
              {selectedElement.tagName}
              {selectedElement.className ? `.${selectedElement.className.split(' ')[0]}` : ''}
            </p>
          </div>

          <div className="p-3 bg-muted rounded space-y-2 text-xs">
            <p className="font-medium">Current Styles:</p>
            {Object.entries(selectedElement.styles).map(([key, value]) => (
              <p key={key} className="font-mono">
                <span className="text-muted-foreground">{key}:</span> {value}
              </p>
            ))}
          </div>

          <div className="space-y-2">
            <div>
              <Label htmlFor="component-type" className="text-xs">Component Type</Label>
              <Input
                id="component-type"
                value={componentType}
                onChange={(e) => setComponentType(e.target.value)}
                placeholder="e.g., button-primary, card-header"
                className="h-8 text-xs"
              />
            </div>

            <div>
              <Label htmlFor="selector" className="text-xs">CSS Selector</Label>
              <Input
                id="selector"
                value={selector}
                onChange={(e) => setSelector(e.target.value)}
                placeholder="e.g., .btn-primary, .card > .header"
                className="h-8 text-xs"
              />
            </div>

            <Button 
              onClick={() => saveMapping(componentType, selector)} 
              className="w-full h-8 text-xs"
              disabled={!componentType}
            >
              Save Mapping
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-muted rounded">
          <p className="text-xs text-muted-foreground">
            Click any element on the page to select it and apply tokens
          </p>
        </div>
      )}
    </div>
  );
}