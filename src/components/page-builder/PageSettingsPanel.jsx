import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Settings, Save, Code, Eye } from "lucide-react";
import { useEditMode } from "./EditModeContext";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function PageSettingsPanel({ currentPageName }) {
  const { isEditMode, toggleEditMode, currentPageData, currentPageContent, setCurrentPageContent, pageTextElements, setPageTextElements } = useEditMode();
  const [isOpen, setIsOpen] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [textOverrides, setTextOverrides] = useState({});
  const queryClient = useQueryClient();

  useEffect(() => {
    const handlePreferencesChange = (event) => {
      setIsVisible(event.detail.showPageEditor ?? true);
    };

    const loadPreferences = async () => {
      try {
        const user = await base44.auth.me();
        if (user?.ui_preferences?.showPageEditor !== undefined) {
          setIsVisible(user.ui_preferences.showPageEditor);
        }
      } catch (e) {
        // User not logged in or error - show by default
      }
    };

    loadPreferences();
    window.addEventListener('ui-preferences-changed', handlePreferencesChange);
    return () => window.removeEventListener('ui-preferences-changed', handlePreferencesChange);
  }, []);

  // Extract text elements when panel opens
  useEffect(() => {
    if (isOpen && !isEditMode) {
      const elements = [];
      const container = document.querySelector('[data-page-content]');
      if (container) {
        const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6, button, label');
        headings.forEach((el, idx) => {
          const text = el.textContent?.trim();
          if (text && text.length > 0 && text.length < 200) {
            elements.push({
              id: `element-${idx}`,
              tagName: el.tagName.toLowerCase(),
              text: text,
              element: el,
            });
          }
        });
      }
      setPageTextElements(elements);
    }
  }, [isOpen, isEditMode, setPageTextElements]);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.UIPage.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uiPages"] });
      toast.success("Page saved");
    },
  });

  const handleSave = () => {
    if (!currentPageData || !currentPageContent) {
      toast.error("No changes to save");
      return;
    }

    const newVersion = {
      version_number: (currentPageData.current_version_number || 0) + 1,
      saved_date: new Date().toISOString(),
      content_jsx: currentPageContent,
      change_summary: `Live edit ${new Date().toLocaleString()}`,
    };

    updateMutation.mutate({
      id: currentPageData.id,
      data: {
        ...currentPageData,
        current_content_jsx: currentPageContent,
        versions: [...(currentPageData.versions || []), newVersion],
        current_version_number: newVersion.version_number,
      },
    });
  };

  if (!isVisible) return null;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed bottom-6 right-24 h-14 w-14 rounded-full shadow-2xl bg-primary text-white hover:bg-primary/90 border-2 border-white"
          style={{ zIndex: 1050 }}
          title="Page Settings"
        >
          <Settings className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-96">
        <SheetHeader>
          <SheetTitle>Page Settings</SheetTitle>
          <p className="text-sm text-muted-foreground">{currentPageName}</p>
        </SheetHeader>

        <div className="space-y-6 py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Live Edit Mode</Label>
              <p className="text-xs text-muted-foreground">
                Click elements to style them with design tokens
              </p>
            </div>
            <Switch checked={isEditMode} onCheckedChange={toggleEditMode} />
          </div>

          {!isEditMode && pageTextElements.length > 0 && (
            <div className="border-t pt-4 space-y-4">
              <div>
                <Label className="text-sm font-medium">Text Overrides</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Edit text content on this page
                </p>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {pageTextElements.map((element) => (
                  <div key={element.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-muted-foreground uppercase">
                        {element.tagName}
                      </Label>
                    </div>
                    <Input
                      value={textOverrides[element.id] ?? element.text}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setTextOverrides(prev => ({ ...prev, [element.id]: newValue }));
                        element.element.textContent = newValue;
                      }}
                      className="text-sm"
                      placeholder={element.text}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {isEditMode && (
            <>
              <div className="border-t pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <Label>View Code</Label>
                  <Switch checked={showCode} onCheckedChange={setShowCode} />
                </div>

                {showCode && currentPageContent && (
                  <div>
                    <Label className="mb-2 block">Page HTML</Label>
                    <Textarea
                      value={currentPageContent}
                      onChange={(e) => setCurrentPageContent(e.target.value)}
                      className="font-mono text-xs h-64"
                      placeholder="Page content will appear here..."
                    />
                  </div>
                )}

                {currentPageData && (
                  <div className="space-y-2">
                    <Label>Page Info</Label>
                    <div className="text-xs space-y-1 text-muted-foreground">
                      <p>Version: {currentPageData.current_version_number || 1}</p>
                      <p>Category: {currentPageData.category || "Custom"}</p>
                      <p>Versions: {currentPageData.versions?.length || 1}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-900">
                  <strong>How to use:</strong>
                </p>
                <ul className="text-xs text-blue-900 mt-2 space-y-1 list-disc list-inside">
                  <li>Click any element to edit its text, colors, spacing</li>
                  <li>Use the component palette to add pre-built sections</li>
                  <li>Changes are live - save when ready</li>
                </ul>
              </div>
            </>
          )}
        </div>

        {isEditMode && currentPageContent && (
          <SheetFooter>
            <Button onClick={handleSave} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}