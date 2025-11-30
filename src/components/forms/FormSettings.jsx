import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function FormSettings({ open, onOpenChange, formData, onUpdate }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Form Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Form Name</Label>
            <Input
              value={formData.name || ""}
              onChange={(e) => onUpdate({ name: e.target.value })}
            />
          </div>

          <div>
            <Label>Code</Label>
            <Input
              value={formData.code || ""}
              onChange={(e) =>
                onUpdate({ code: e.target.value.toLowerCase().replace(/\s+/g, "_") })
              }
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description || ""}
              onChange={(e) => onUpdate({ description: e.target.value })}
              rows={2}
            />
          </div>

          <div>
            <Label>Category</Label>
            <Select
              value={formData.category || "data_capture"}
              onValueChange={(v) => onUpdate({ category: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="survey">Survey</SelectItem>
                <SelectItem value="checkin">Check-in</SelectItem>
                <SelectItem value="assessment">Assessment</SelectItem>
                <SelectItem value="data_capture">Data Capture</SelectItem>
                <SelectItem value="approval">Approval</SelectItem>
                <SelectItem value="feedback">Feedback</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Linked Entity</Label>
            <Select
              value={formData.linkedEntity || "none"}
              onValueChange={(v) => onUpdate({ linkedEntity: v === "none" ? "" : v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select entity..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="SurveyData">Survey Data</SelectItem>
                <SelectItem value="Enquiry">Enquiry</SelectItem>
                <SelectItem value="Project">Project</SelectItem>
                <SelectItem value="Customer">Customer</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              Form data will be saved to this entity
            </p>
          </div>

          <div>
            <Label>Submit Button Text</Label>
            <Input
              value={formData.submitButtonText || ""}
              onChange={(e) => onUpdate({ submitButtonText: e.target.value })}
            />
          </div>

          <div>
            <Label>Success Message</Label>
            <Textarea
              value={formData.successMessage || ""}
              onChange={(e) => onUpdate({ successMessage: e.target.value })}
              rows={2}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Active</Label>
            <Switch
              checked={formData.isActive !== false}
              onCheckedChange={(v) => onUpdate({ isActive: v })}
            />
          </div>

          <Button onClick={() => onOpenChange(false)} className="w-full">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}