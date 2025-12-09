import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { X, ChevronDown, ChevronUp, Layout, Palette, Layers, Settings, Maximize2, Minimize2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ComponentPalettePanel } from "./ComponentPalettePanel";
import { StylingPanel } from "./StylingPanel";
import { LayoutBuilderPanel } from "./LayoutBuilderPanel";
import { PageSettingsTab } from "./PageSettingsTab";
import { ElementEditor } from "./ElementEditor";
import { useEditMode } from "./EditModeContext";

export function TopEditorPanel({ isOpen, onClose, onViewModeChange }) {
  const { selectedElement } = useEditMode();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState("focus"); // 'focus' or 'full'
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState("current");

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
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69274b9c077e61d7cfe78ec7/ad5ea2e54_editor.png" 
              alt="Editor branding" 
              className="h-6"
            />
          </div>

          {viewMode === 'focus' && selectedElement && (
            <div className="flex gap-1">
              {["current", "colors", "spacing", "typography", "borders"].map(tab => (
                <Button
                  key={tab}
                  variant={activeTab === tab ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab(tab)}
                  className="text-xs h-7 px-3 capitalize"
                >
                  {tab}
                </Button>
              ))}
            </div>
          )}
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
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={async () => {
              onClose();
              // Turn off live edit mode
              try {
                const user = await base44.auth.me();
                await base44.auth.updateMe({
                  ui_preferences: {
                    ...(user.ui_preferences || {}),
                    liveEditMode: false
                  }
                });
                window.dispatchEvent(new CustomEvent('ui-preferences-changed', { 
                  detail: { liveEditMode: false } 
                }));
              } catch (e) {
                console.error("Failed to turn off live edit:", e);
              }
            }}
          >
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
            selectedElement ? (
              <div className="h-full overflow-auto">
                <div className="text-sm text-muted-foreground mb-3 pb-3 border-b">
                  <p>Selected: <code className="text-xs bg-muted px-2 py-1 rounded">{selectedElement.tagName}</code></p>
                  <p className="text-xs truncate mt-1">Path: {selectedElement.path}</p>
                </div>
                <ElementEditor 
                  selectedElement={selectedElement}
                  activeSection={activeTab}
                  showHeader={false}
                  onApplyStyle={(style) => {
                    setHasChanges(true);
                    // Dispatch event to LiveEditWrapper to apply the style
                    window.dispatchEvent(new CustomEvent('apply-element-style', { detail: style }));
                  }}
                />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
                <div className="text-center">
                  <Layers className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium text-muted-foreground">Click any element on the page to edit</p>
                </div>
              </div>
            )
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

            <TabsContent value="components">
              <ComponentPalettePanel />
            </TabsContent>

            <TabsContent value="styling">
              <StylingPanel 
                selectedElement={selectedElement}
                onApplyStyle={(style) => {
                  setHasChanges(true);
                  toast.info("Style applied");
                }}
              />
            </TabsContent>

            <TabsContent value="layout">
              <LayoutBuilderPanel 
                selectedElement={selectedElement}
                onApplyLayout={(layout) => {
                  setHasChanges(true);
                  toast.info("Layout applied");
                }}
              />
            </TabsContent>

            <TabsContent value="settings">
              <PageSettingsTab 
                pageSettings={{}}
                onUpdateSettings={(settings) => {
                  setHasChanges(true);
                  toast.info("Settings updated");
                }}
              />
            </TabsContent>
          </Tabs>
          )}
        </div>
      )}
    </div>
  );
}