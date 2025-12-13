import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, Download, Trash2, Settings, Plus } from 'lucide-react';

export default function ButtonShowcase() {
  return (
    <div className="space-y-6" data-component="buttonCard">
      <div>
        <h3 className="text-lg font-display mb-2">Buttons</h3>
        <p className="text-sm text-muted-foreground">
          Button variants and states using Sturij design tokens
        </p>
      </div>

      <div className="space-y-6">
        <div data-element="button-variants">
          <h4 className="text-sm font-medium mb-3">Variants</h4>
          <div className="flex flex-wrap gap-3">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
        </div>

        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-3">Sizes</h4>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-3">With Icons</h4>
          <div className="flex flex-wrap gap-3">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
            <Button variant="secondary">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-3">States</h4>
          <div className="flex flex-wrap gap-3">
            <Button disabled>Disabled</Button>
            <Button variant="outline" disabled>
              Disabled Outline
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}