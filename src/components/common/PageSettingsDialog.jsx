import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Reusable Page Settings Dialog
 * 
 * Props:
 * - isOpen: boolean
 * - onClose: function
 * - settings: object with setting values
 * - onSave: function(settings)
 * - options: array of { key, label, type, description }
 * - title: string (optional)
 */
export default function PageSettingsDialog({
  isOpen,
  onClose,
  settings = {},
  onSave,
  options = [],
  title = "Page Settings"
}) {
  const [localSettings, setLocalSettings] = React.useState(settings);

  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings, isOpen]);

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {options.map((option) => (
            <div key={option.key} className="flex items-center justify-between">
              <div>
                <Label>{option.label}</Label>
                {option.description && (
                  <p className="text-xs text-gray-500">{option.description}</p>
                )}
              </div>
              {option.type === "boolean" && (
                <Switch
                  checked={localSettings[option.key] ?? option.default ?? false}
                  onCheckedChange={(v) => setLocalSettings({ ...localSettings, [option.key]: v })}
                />
              )}
              {option.type === "select" && (
                <Select
                  value={localSettings[option.key] ?? option.default ?? option.options?.[0]?.value}
                  onValueChange={(v) => setLocalSettings({ ...localSettings, [option.key]: v })}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {option.options?.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ))}
          {options.length === 0 && (
            <p className="text-gray-500 text-sm">No configurable settings for this page.</p>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}