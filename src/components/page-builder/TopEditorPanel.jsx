import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { X, ChevronDown, ChevronUp, Layout, Palette, Layers, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function TopEditorPanel({ isOpen, onClose }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-card border-b shadow-lg">
      <div className="flex items-center justify-between px-6 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
              <Layout className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Page Editor</h2>
              <p className="text-xs text-muted-foreground">Visual placeholder - no functionality yet</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="px-6 py-4 bg-background">
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
        </div>
      )}
    </div>
  );
}