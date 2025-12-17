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

export function TopEditorPanel({ isOpen, onClose, onViewModeChange }) {
  const { selectedElement } = useEditMode();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState("full"); // 'focus' or 'full' - default to full for better UX
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState("components");
  const [showStyleEditor, setShowStyleEditor] = useState(true);

  // Push content down when editor opens - ensure it happens immediately
  React.useEffect(() => {
    const editorLayout = document.querySelector('[data-editor-layout]');
    if (!editorLayout) return;

    if (isOpen) {
      const marginTop = isCollapsed ? '44px' : (viewMode === 'full' ? '500px' : '120px');
      editorLayout.style.setProperty('margin-top', marginTop, 'important');
      editorLayout.style.setProperty('transition', 'margin-top 300ms ease-in-out');
    } else {
      editorLayout.style.setProperty('margin-top', '0', 'important');
    }
  }, [isOpen, viewMode, isCollapsed]);

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    if (onViewModeChange) onViewModeChange(mode);
  };

  const handleApplyChanges = () => {
    toast.success("Changes applied");
    setHasChanges(false);
  };

  if (!isOpen) return null;

  const panelHeight = isCollapsed ? '44px' : '500px';

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
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expand Editor' : 'Collapse Editor'}
          >
            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
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
          height: '456px',
          overflowY: 'auto',
          backgroundColor: 'var(--color-editor-background, var(--color-background))'
        }}>
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
              <StylingPanel 
                selectedElement={selectedElement}
                onApplyStyle={(style) => {
                  setHasChanges(true);
                  if (!selectedElement?.element) return;
                  
                  if (style.className) {
                    selectedElement.element.className += ` ${style.className}`;
                  }
                  
                  toast.success("Style applied");
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
          </div>
          )}
    </div>
  );
}