import { useState } from 'react';
import { PageHeader } from '@/components/sturij/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { X } from 'lucide-react';

function DrawerExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="px-4 py-2"
      >
        Open drawer
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent 
          side="right" 
          className="w-screen sm:max-w-md flex flex-col divide-y divide-border"
        >
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto py-6">
            <div className="px-4 sm:px-6">
              <div className="flex items-start justify-between">
                <SheetHeader>
                  <SheetTitle className="text-base font-semibold">Panel title</SheetTitle>
                </SheetHeader>
                <SheetClose className="ml-3 flex h-7 items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-md text-muted-foreground hover:text-foreground"
                  >
                    <span className="sr-only">Close panel</span>
                    <X className="h-6 w-6" />
                  </Button>
                </SheetClose>
              </div>
            </div>
            <div className="relative mt-6 flex-1 px-4 sm:px-6">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  This is a drawer component converted from Tailwind UI using Radix UI primitives
                  and design tokens.
                </p>
                
                <div className="space-y-3">
                  <div className="rounded-lg border border-border p-4">
                    <h3 className="text-sm font-medium mb-2">Design Tokens Used</h3>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Background: var(--background)</li>
                      <li>• Foreground: var(--foreground)</li>
                      <li>• Border: var(--border)</li>
                      <li>• Muted: var(--muted-foreground)</li>
                    </ul>
                  </div>
                  
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-xs text-muted-foreground">
                      Content area - Add your form fields or content here
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <SheetFooter className="flex shrink-0 justify-end px-4 py-4 gap-3">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => setOpen(false)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Save
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default function TailwindDrawerShowcase() {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <div className="max-w-[1400px] mx-auto pb-6">
        <PageHeader
          title="Tailwind UI Drawer (Converted)"
          description="Headless UI → Radix UI Sheet with design tokens"
        />

        <div className="mt-6 space-y-6">
          <Card style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-2">Conversion Details</h2>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p><strong>From:</strong> Headless UI Dialog</p>
                    <p><strong>To:</strong> Radix UI Sheet</p>
                    <p><strong>Colors:</strong> All hardcoded values replaced with CSS variables</p>
                    <p><strong>Icons:</strong> Heroicons → Lucide React</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <h3 className="text-base font-medium mb-4">Live Demo</h3>
                  <DrawerExample />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
            <CardContent className="p-6">
              <h3 className="text-base font-semibold mb-3">Color Mapping</h3>
              <div className="grid gap-3 text-sm">
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <code className="text-xs">bg-gray-950/5</code>
                  <span className="text-muted-foreground">→</span>
                  <code className="text-xs">variant="outline"</code>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <code className="text-xs">bg-indigo-600</code>
                  <span className="text-muted-foreground">→</span>
                  <code className="text-xs">bg-primary</code>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <code className="text-xs">text-gray-900</code>
                  <span className="text-muted-foreground">→</span>
                  <code className="text-xs">text-foreground</code>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <code className="text-xs">text-gray-400</code>
                  <span className="text-muted-foreground">→</span>
                  <code className="text-xs">text-muted-foreground</code>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <code className="text-xs">divide-gray-200</code>
                  <span className="text-muted-foreground">→</span>
                  <code className="text-xs">divide-border</code>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}