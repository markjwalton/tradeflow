import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Save } from 'lucide-react';

/**
 * PagePropertiesForm - Form for editing page container properties
 * 
 * @param {Object} properties - Current page properties
 * @param {Function} onUpdate - Callback when properties are updated
 */
export function PagePropertiesForm({ properties = {}, onUpdate }) {
  const [localProps, setLocalProps] = useState({
    containerTitle: properties.containerTitle || '',
    containerDescription: properties.containerDescription || '',
    containerBackground: properties.containerBackground || 'var(--color-card)',
    titleBackground: properties.titleBackground || '',
    defaultCollapsed: properties.defaultCollapsed || false,
    shellWidth: properties.shellWidth || '1600',
    contentWidth: properties.contentWidth || '1400',
    ...properties
  });

  const handleChange = (key, value) => {
    const updated = { ...localProps, [key]: value };
    setLocalProps(updated);
  };

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(localProps);
    }
  };

  return (
    <div className="space-y-6">
      {/* Container Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Container Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="containerTitle">Container Title</Label>
            <Input
              id="containerTitle"
              value={localProps.containerTitle}
              onChange={(e) => handleChange('containerTitle', e.target.value)}
              placeholder="Enter container title..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="containerDescription">Container Description (Optional)</Label>
            <Textarea
              id="containerDescription"
              value={localProps.containerDescription}
              onChange={(e) => handleChange('containerDescription', e.target.value)}
              placeholder="Enter description..."
              rows={3}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="containerBackground">Container Background</Label>
            <Select 
              value={localProps.containerBackground} 
              onValueChange={(val) => handleChange('containerBackground', val)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="var(--color-card)">Card (White)</SelectItem>
                <SelectItem value="var(--color-background)">Background</SelectItem>
                <SelectItem value="var(--color-muted)">Muted</SelectItem>
                <SelectItem value="var(--primary-50)">Primary 50</SelectItem>
                <SelectItem value="var(--secondary-50)">Secondary 50</SelectItem>
                <SelectItem value="var(--accent-50)">Accent 50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="titleBackground">Title Background (Optional)</Label>
            <Select 
              value={localProps.titleBackground} 
              onValueChange={(val) => handleChange('titleBackground', val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>None</SelectItem>
                <SelectItem value="var(--color-muted)">Muted</SelectItem>
                <SelectItem value="var(--primary-100)">Primary 100</SelectItem>
                <SelectItem value="var(--secondary-100)">Secondary 100</SelectItem>
                <SelectItem value="var(--accent-100)">Accent 100</SelectItem>
                <SelectItem value="var(--midnight-50)">Midnight 50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Accordion Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Accordion Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="defaultCollapsed" className="flex-1">
              <div className="font-medium">Default Collapsed</div>
              <div className="text-xs text-muted-foreground">Start with accordion closed</div>
            </Label>
            <Switch
              id="defaultCollapsed"
              checked={localProps.defaultCollapsed}
              onCheckedChange={(val) => handleChange('defaultCollapsed', val)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Layout Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Layout Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shellWidth">Shell Max Width</Label>
            <Select 
              value={localProps.shellWidth} 
              onValueChange={(val) => handleChange('shellWidth', val)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full Width</SelectItem>
                <SelectItem value="1400">1400px</SelectItem>
                <SelectItem value="1600">1600px</SelectItem>
                <SelectItem value="1800">1800px</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contentWidth">Content Max Width</Label>
            <Select 
              value={localProps.contentWidth} 
              onValueChange={(val) => handleChange('contentWidth', val)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full Width</SelectItem>
                <SelectItem value="1200">1200px</SelectItem>
                <SelectItem value="1400">1400px</SelectItem>
                <SelectItem value="1600">1600px</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button onClick={handleSave} className="w-full">
        <Save className="h-4 w-4 mr-2" />
        Save Properties
      </Button>
    </div>
  );
}