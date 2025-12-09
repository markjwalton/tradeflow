import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export function PageSettingsTab({ pageSettings = {}, onUpdateSettings }) {
  const handleToggle = (key, value) => {
    onUpdateSettings?.({ [key]: value });
  };

  const handleChange = (key, value) => {
    onUpdateSettings?.({ [key]: value });
  };

  return (
    <ScrollArea className="h-[280px]">
      <div className="space-y-4 pr-4">
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm">Page Metadata</CardTitle>
            <CardDescription className="text-xs">Basic page information</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-3">
            <div className="space-y-2">
              <Label className="text-xs">Page Title</Label>
              <Input
                value={pageSettings.title || ""}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Enter page title..."
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Description</Label>
              <Textarea
                value={pageSettings.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Enter page description..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm">Navigation</CardTitle>
            <CardDescription className="text-xs">Configure navigation behavior</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-3">
            <div className="space-y-2">
              <Label className="text-xs">Navigation Mode</Label>
              <Select 
                value={pageSettings.navigationMode || "expanded"} 
                onValueChange={(value) => handleChange("navigationMode", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expanded">Expanded</SelectItem>
                  <SelectItem value="icons">Icons Only</SelectItem>
                  <SelectItem value="hidden">Hidden</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-xs">Show Breadcrumb</Label>
              <Switch
                checked={pageSettings.showBreadcrumb ?? true}
                onCheckedChange={(checked) => handleToggle("showBreadcrumb", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-xs">Show Page Title</Label>
              <Switch
                checked={pageSettings.showTitle ?? true}
                onCheckedChange={(checked) => handleToggle("showTitle", checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm">Layout Options</CardTitle>
            <CardDescription className="text-xs">Page layout configuration</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-3">
            <div className="space-y-2">
              <Label className="text-xs">Container Width</Label>
              <Select 
                value={pageSettings.containerWidth || "full"} 
                onValueChange={(value) => handleChange("containerWidth", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Width</SelectItem>
                  <SelectItem value="xl">Extra Large (1280px)</SelectItem>
                  <SelectItem value="lg">Large (1024px)</SelectItem>
                  <SelectItem value="md">Medium (768px)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-xs">Full Height</Label>
              <Switch
                checked={pageSettings.fullHeight ?? false}
                onCheckedChange={(checked) => handleToggle("fullHeight", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-xs">Centered Content</Label>
              <Switch
                checked={pageSettings.centered ?? false}
                onCheckedChange={(checked) => handleToggle("centered", checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm">Advanced</CardTitle>
            <CardDescription className="text-xs">Additional settings</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-3">
            <div className="space-y-2">
              <Label className="text-xs">Custom CSS Classes</Label>
              <Input
                value={pageSettings.customClasses || ""}
                onChange={(e) => handleChange("customClasses", e.target.value)}
                placeholder="Enter custom classes..."
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-xs">Enable Animations</Label>
              <Switch
                checked={pageSettings.animations ?? true}
                onCheckedChange={(checked) => handleToggle("animations", checked)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}