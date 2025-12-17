import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { X, ChevronDown, ChevronUp, Layout, Palette, Layers, Settings, Maximize2, Minimize2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { ComponentPalettePanel } from "./ComponentPalettePanel";
import { StylingPanel } from "./StylingPanel";
import { LayoutBuilderPanel } from "./LayoutBuilderPanel";
import { PageSettingsTab } from "./PageSettingsTab";
import { ElementEditor } from "./ElementEditor";
import { useEditMode } from "./EditModeContext";
import { StylePropertyEditor } from "@/components/design-assistant/StylePropertyEditor";
import { StyleEditorPanel } from "./StyleEditorPanel";

export function TopEditorPanel({ isOpen, onClose, onViewModeChange }) {
  const { selectedElement } = useEditMode();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState("focus"); // 'focus' or 'full'
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState("current");
  const [showStyleEditor, setShowStyleEditor] = useState(true);

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    if (onViewModeChange) onViewModeChange(mode);
    // Update layout margin to push content down
    const marginTop = mode === 'full' ? '500px' : (selectedElement && showStyleEditor ? '400px' : (selectedElement ? '250px' : '120px'));
    document.querySelector('[data-editor-layout]')?.style.setProperty('margin-top', marginTop);
  };

  const handleApplyChanges = () => {
    toast.success("Changes applied");
    setHasChanges(false);
  };

  if (!isOpen) return null;

  const panelHeight = isCollapsed ? '44px' : (
    viewMode === 'focus' 
      ? (selectedElement ? (showStyleEditor ? '400px' : '250px') : '120px')
      : '500px'
  );

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-[100] bg-card border-b transition-all duration-300"
      style={{ height: panelHeight }}
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
            <div className="flex gap-2">
              <Button
                variant={showStyleEditor ? "default" : "outline"}
                size="sm"
                onClick={() => setShowStyleEditor(!showStyleEditor)}
                className="text-xs h-7 px-3"
              >
                <Palette className="h-3 w-3 mr-1" />
                Style Editor
              </Button>
              <div className="flex gap-1 border-l pl-2">
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
        <div className="px-6 py-2" style={{ 
          height: viewMode === 'focus' 
            ? (selectedElement ? (showStyleEditor ? '356px' : '206px') : '76px')
            : '456px',
          overflowY: 'auto',
          backgroundColor: 'var(--color-editor-background, var(--color-background))'
        }}>
          {viewMode === 'focus' ? (
            selectedElement ? (
              <div className="h-full space-y-2">
                {showStyleEditor && (
                  <div className="pb-2 border-b bg-accent/5 rounded-md p-3">
                    <StylePropertyEditor
                      selectedElement={selectedElement}
                      horizontal={true}
                      onApply={(property, value, applyToAll) => {
                        setHasChanges(true);
                        if (!selectedElement?.element) return;

                        if (applyToAll) {
                          const className = typeof selectedElement.className === 'string' ? selectedElement.className : '';
                          const targetClass = className.split(' ').filter(c => c)[0];
                          
                          if (targetClass) {
                            const elements = document.querySelectorAll(`.${targetClass}`);
                            elements.forEach(el => {
                              el.style[property] = value;
                            });
                            toast.success(`Applied to ${elements.length} elements`);
                          }
                        } else {
                          selectedElement.element.style[property] = value;
                          toast.success(`Applied to selected element`);
                        }
                      }}
                    />
                  </div>
                )}
                <ElementEditor 
                  selectedElement={selectedElement}
                  activeSection={activeTab}
                  showHeader={false}
                  onApplyStyle={(style) => {
                    setHasChanges(true);
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

            <TabsContent value="styling" className="mt-0">
              <div className="h-[400px]">
                <StyleEditorPanel currentPageName="" />
              </div>
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