import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

export default function TestDataSettingsDialog({ 
  isOpen, 
  onClose, 
  settings, 
  onSettingsChange 
}) {
  const handleChange = (key, value) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-purple-600" />
            Test Data Settings
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Generation Settings */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-gray-700 border-b pb-2">Generation</h4>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="batchSize" className="text-sm">Batch Size</Label>
              <Input
                id="batchSize"
                type="number"
                min={1}
                max={50}
                value={settings.batchSize}
                onChange={(e) => handleChange("batchSize", parseInt(e.target.value) || 10)}
                className="w-20 text-center"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="recordsPerEntity" className="text-sm">Records per Entity</Label>
              <Input
                id="recordsPerEntity"
                type="number"
                min={1}
                max={20}
                value={settings.recordsPerEntity}
                onChange={(e) => handleChange("recordsPerEntity", parseInt(e.target.value) || 3)}
                className="w-20 text-center"
              />
            </div>
          </div>

          {/* Display Settings */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-gray-700 border-b pb-2">Display</h4>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="expandCategories" className="text-sm">Expand Categories by Default</Label>
              <Switch
                id="expandCategories"
                checked={settings.expandCategoriesByDefault}
                onCheckedChange={(checked) => handleChange("expandCategoriesByDefault", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="showCompactView" className="text-sm">Compact View</Label>
              <Switch
                id="showCompactView"
                checked={settings.compactView}
                onCheckedChange={(checked) => handleChange("compactView", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="defaultTab" className="text-sm">Default Tab</Label>
              <Select
                value={settings.defaultTab}
                onValueChange={(value) => handleChange("defaultTab", value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Overview</SelectItem>
                  <SelectItem value="status">Page Status</SelectItem>
                  <SelectItem value="quality">AI Quality</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Seeding Settings */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-gray-700 border-b pb-2">Database Seeding</h4>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="confirmSeed" className="text-sm">Confirm Before Seeding</Label>
              <Switch
                id="confirmSeed"
                checked={settings.confirmBeforeSeed}
                onCheckedChange={(checked) => handleChange("confirmBeforeSeed", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="autoSeed" className="text-sm">Auto-seed on Generation</Label>
              <Switch
                id="autoSeed"
                checked={settings.autoSeedOnGeneration}
                onCheckedChange={(checked) => handleChange("autoSeedOnGeneration", checked)}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t">
          <Button onClick={onClose}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}