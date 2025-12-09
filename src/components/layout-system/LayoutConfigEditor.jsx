import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

/**
 * Right-side panel for editing layout configuration (field labels, sections, etc.)
 */
export default function LayoutConfigEditor({ isOpen, onClose, config, onSave }) {
  const [localConfig, setLocalConfig] = useState(JSON.parse(JSON.stringify(config)));

  const handleSave = () => {
    onSave(localConfig);
    onClose();
  };

  const updateFieldLabel = (sectionIndex, fieldIndex, newLabel) => {
    const updated = { ...localConfig };
    updated.sections[sectionIndex].fields[fieldIndex].label = newLabel;
    setLocalConfig(updated);
  };

  const updateSectionTitle = (sectionIndex, newTitle) => {
    const updated = { ...localConfig };
    updated.sections[sectionIndex].title = newTitle;
    setLocalConfig(updated);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full sm:w-[500px] bg-background shadow-xl z-50 flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Configure Editor Layout</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Customize field labels and section titles
          </p>
        </div>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            {/* Page Header */}
            {localConfig.pageHeader && (
              <div>
                <h3 className="font-medium mb-3">Page Header</h3>
                <div className="space-y-2">
                  <div>
                    <Label className="text-xs">Title</Label>
                    <Input
                      value={localConfig.pageHeader.title || ""}
                      onChange={(e) => setLocalConfig({
                        ...localConfig,
                        pageHeader: { ...localConfig.pageHeader, title: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* Sections */}
            {(localConfig.sections || []).map((section, sectionIndex) => (
              <div key={section.id} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium flex-1">Section: {section.title}</h3>
                </div>
                
                <div>
                  <Label className="text-xs">Section Title</Label>
                  <Input
                    value={section.title}
                    onChange={(e) => updateSectionTitle(sectionIndex, e.target.value)}
                  />
                </div>

                <div className="space-y-2 pl-4 border-l-2 border-muted">
                  <p className="text-xs font-medium text-muted-foreground">Fields</p>
                  {(section.fields || []).map((field, fieldIndex) => (
                    <div key={field.id}>
                      <Label className="text-xs">{field.id}</Label>
                      <Input
                        value={field.label}
                        onChange={(e) => updateFieldLabel(sectionIndex, fieldIndex, e.target.value)}
                        placeholder="Field label"
                      />
                    </div>
                  ))}
                </div>

                <Separator />
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-6 border-t flex gap-2">
          <Button onClick={handleSave} className="flex-1">Save Changes</Button>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </>
  );
}