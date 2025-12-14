import React from 'react';
import { Card } from '@/components/ui/card';

export default function LayoutShowcase() {
  return (
    <div className="space-y-8" data-component="layoutShowcase">
      {/* Grid Layouts */}
      <div data-element="grid-layouts">
        <h3 className="text-lg font-medium mb-3">Grid Layouts</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">2 Columns</p>
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 bg-primary/10 text-center">Column 1</Card>
              <Card className="p-4 bg-primary/10 text-center">Column 2</Card>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">3 Columns</p>
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 bg-secondary/10 text-center">Column 1</Card>
              <Card className="p-4 bg-secondary/10 text-center">Column 2</Card>
              <Card className="p-4 bg-secondary/10 text-center">Column 3</Card>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">4 Columns</p>
            <div className="grid grid-cols-4 gap-4">
              <Card className="p-4 bg-accent/10 text-center">1</Card>
              <Card className="p-4 bg-accent/10 text-center">2</Card>
              <Card className="p-4 bg-accent/10 text-center">3</Card>
              <Card className="p-4 bg-accent/10 text-center">4</Card>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div data-element="two-column">
        <h3 className="text-lg font-medium mb-3">Two Column Layout (2:1 ratio)</h3>
        <div className="grid grid-cols-3 gap-4">
          <Card className="col-span-2 p-6 bg-primary/10">
            <p className="text-sm font-medium">Main Content Area (2fr)</p>
            <p className="text-sm text-muted-foreground mt-2">This is the primary content section.</p>
          </Card>
          <Card className="p-6 bg-secondary/10">
            <p className="text-sm font-medium">Sidebar (1fr)</p>
            <p className="text-sm text-muted-foreground mt-2">Secondary info.</p>
          </Card>
        </div>
      </div>

      {/* Stack Layout */}
      <div data-element="stack-layout">
        <h3 className="text-lg font-medium mb-3">Stack Layout (Vertical)</h3>
        <div className="space-y-3">
          <Card className="p-4 bg-primary/10">Item 1</Card>
          <Card className="p-4 bg-primary/10">Item 2</Card>
          <Card className="p-4 bg-primary/10">Item 3</Card>
        </div>
      </div>

      {/* Flex Layout */}
      <div data-element="flex-layout">
        <h3 className="text-lg font-medium mb-3">Flex Layout (Horizontal)</h3>
        <div className="flex gap-3">
          <Card className="p-4 bg-secondary/10 flex-1">Item 1</Card>
          <Card className="p-4 bg-secondary/10 flex-1">Item 2</Card>
          <Card className="p-4 bg-secondary/10 flex-1">Item 3</Card>
        </div>
      </div>

      {/* Container Sizes */}
      <div data-element="containers">
        <h3 className="text-lg font-medium mb-3">Container Max-Widths</h3>
        <div className="space-y-3">
          <div className="max-w-sm mx-auto">
            <Card className="p-4 bg-primary/10 text-center">
              <p className="text-sm">max-w-sm (24rem / 384px)</p>
            </Card>
          </div>
          <div className="max-w-md mx-auto">
            <Card className="p-4 bg-secondary/10 text-center">
              <p className="text-sm">max-w-md (28rem / 448px)</p>
            </Card>
          </div>
          <div className="max-w-lg mx-auto">
            <Card className="p-4 bg-accent/10 text-center">
              <p className="text-sm">max-w-lg (32rem / 512px)</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}