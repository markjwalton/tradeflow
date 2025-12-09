import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { X, ChevronDown, ChevronUp, Layout, Palette, Layers, Settings, Maximize2, Minimize2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function TopEditorPanel({ isOpen, onClose, onViewModeChange }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState("focus"); // 'focus' or 'full'
  const [hasChanges, setHasChanges] = useState(false);

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    if (onViewModeChange) onViewModeChange(mode);
    // Update layout margin
    const marginTop = mode === 'full' ? '500px' : '120px';
    document.querySelector('[data-editor-layout]')?.style.setProperty('margin-top', marginTop);
  };

  const handleApplyChanges = () => {
    toast.success("Changes applied");
    setHasChanges(false);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-[100] bg-card border-b transition-all duration-300"
      style={{ height: isCollapsed ? '44px' : (viewMode === 'focus' ? '120px' : '500px') }}
    >
      <div className="flex items-center justify-between px-6 py-2 border-b bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69274b9c077e61d7cfe78ec7/b7a61dbf6_black_logo_300x300_transparent.png" 
              alt="Editor icon" 
              className="h-8 w-8"
            />
            <div className="brand">editor</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Button
              size="sm"
              onClick={handleApplyChanges}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Check className="h-4 w-4 mr-1" />
              Apply Changes
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewModeChange(viewMode === 'focus' ? 'full' : 'focus')}
            title={viewMode === 'focus' ? 'Switch to Full View' : 'Switch to Focus View'}
          >
            {viewMode === 'focus' ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="px-6 py-4" style={{ 
          height: viewMode === 'focus' ? '76px' : '456px', 
          overflowY: viewMode === 'focus' ? 'hidden' : 'auto',
          backgroundColor: 'var(--color-editor-background, var(--color-background))'
        }}>
          {viewMode === 'focus' ? (
            <div className="h-full flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
              <div className="text-center">
                <Layers className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium text-muted-foreground">Select an element for properties and token options</p>
              </div>
            </div>
          ) : (
          <Tabs defaultValue="components" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="components" className="gap-2">
                <Layers className="h-4 w-4" />
                Components
              </TabsTrigger>
              <TabsTrigger value="styling" className="gap-2">
                <Palette className="h-4 w-4" />
                Styling
              </TabsTrigger>
              <TabsTrigger value="layout" className="gap-2">
                <Layout className="h-4 w-4" />
                Layout
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="components" className="space-y-4">
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">
                  Component library and palette will be accessible here
                </p>
                <div className="grid grid-cols-6 gap-2 mt-3">
                  {["Button", "Input", "Card", "Table", "Form", "Chart"].map((comp) => (
                    <div
                      key={comp}
                      className="p-3 border rounded-lg text-center hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <div className="h-8 w-8 mx-auto mb-1 rounded bg-primary/10 flex items-center justify-center">
                        <Layers className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-xs">{comp}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="styling" className="space-y-4">
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">
                  Quick edit styling controls will appear here when elements are selected
                </p>
                <div className="grid grid-cols-4 gap-3 mt-3">
                  {["Colors", "Spacing", "Typography", "Borders"].map((style) => (
                    <div
                      key={style}
                      className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <Palette className="h-5 w-5 text-primary mb-2" />
                      <p className="text-sm font-medium">{style}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="layout" className="space-y-4">
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">
                  Layout builder and pattern manager will be integrated here
                </p>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  {["Grid", "Flexbox", "Stack"].map((layout) => (
                    <div
                      key={layout}
                      className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <Layout className="h-5 w-5 text-primary mb-2" />
                      <p className="text-sm font-medium">{layout}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">
                  Page settings and configuration options will be available here
                </p>
                <div className="space-y-2 mt-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <span className="text-sm">Navigation Mode</span>
                    <span className="text-xs text-muted-foreground">Expanded</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <span className="text-sm">Breadcrumb</span>
                    <span className="text-xs text-muted-foreground">Visible</span>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
          )}
        </div>
      )}
    </div>
  );
}