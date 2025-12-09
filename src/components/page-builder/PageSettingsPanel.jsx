import React, { useState } from "react";
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
  const { isEditMode, toggleEditMode, currentPageData, currentPageContent, setCurrentPageContent } = useEditMode();
  const [isOpen, setIsOpen] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const queryClient = useQueryClient();

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

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed bottom-6 right-20 h-14 w-14 rounded-full shadow-2xl bg-primary text-white hover:bg-primary/90 border-2 border-white"
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