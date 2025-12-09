import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Edit, Save, X } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

const COLOR_TOKENS = [
  "primary-500", "primary-600", "primary-700",
  "secondary-400", "secondary-500", "secondary-600",
  "accent-300", "accent-400", "accent-500",
  "background", "foreground", "muted", "border",
  "destructive", "warning", "success", "info"
];

const SPACING_TOKENS = [
  "spacing-1", "spacing-2", "spacing-3", "spacing-4",
  "spacing-5", "spacing-6", "spacing-8", "spacing-10"
];

const RADIUS_TOKENS = [
  "radius-sm", "radius", "radius-md", "radius-lg", "radius-xl"
];

export function ShowcaseEditMode({ children }) {
  const [editMode, setEditMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [modifications, setModifications] = useState({});

  const handleElementClick = (e) => {
    if (!editMode) return;
    
    e.stopPropagation();
    e.preventDefault();
    
    const target = e.currentTarget;
    const computedStyle = getComputedStyle(target);
    
    setSelectedElement({
      element: target,
      styles: {
        backgroundColor: rgbToHex(computedStyle.backgroundColor),
        color: rgbToHex(computedStyle.color),
        padding: computedStyle.padding,
        margin: computedStyle.margin,
        borderRadius: computedStyle.borderRadius,
      }
    });
    setPanelOpen(true);
  };

  const rgbToHex = (rgb) => {
    if (!rgb || rgb === 'rgba(0, 0, 0, 0)') return '';
    const values = rgb.match(/\d+/g);
    if (!values) return '';
    return '#' + values.slice(0, 3).map(x => {
      const hex = parseInt(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  const applyTokenChange = (tokenName, value) => {
    document.documentElement.style.setProperty(`--${tokenName}`, value);
    setModifications(prev => ({ ...prev, [tokenName]: value }));
  };

  const saveChanges = async () => {
    try {
      const response = await base44.functions.invoke('updateGlobalCSS', {
        cssVariables: modifications
      });

      if (response.data.success) {
        toast.success('Changes saved to globals.css');
        setModifications({});
      }
    } catch (error) {
      toast.error('Failed to save changes');
    }
  };

  const hasModifications = Object.keys(modifications).length > 0;

  return (
    <div>
      <div className="fixed top-20 right-4 z-50 flex gap-2">
        <Button
          size="sm"
          variant={editMode ? "default" : "outline"}
          onClick={() => setEditMode(!editMode)}
        >
          <Edit className="w-4 h-4 mr-2" />
          {editMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
        </Button>
        
        {hasModifications && (
          <Button size="sm" onClick={saveChanges}>
            <Save className="w-4 h-4 mr-2" />
            Save to CSS
          </Button>
        )}
      </div>

      <div onClick={editMode ? (e) => e.stopPropagation() : undefined}>
        {React.Children.map(children, child => {
          if (!React.isValidElement(child)) return child;
          
          return React.cloneElement(child, {
            onClick: editMode ? handleElementClick : child.props.onClick,
            className: editMode 
              ? `${child.props.className || ''} cursor-pointer hover:ring-2 hover:ring-primary/50`
              : child.props.className
          });
        })}
      </div>

      <Sheet open={panelOpen} onOpenChange={setPanelOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Component Styles</SheetTitle>
          </SheetHeader>

          {selectedElement && (
            <div className="space-y-6 mt-6">
              <div>
                <h3 className="font-medium mb-3">Quick Token Changes</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Changes will be applied globally and saved to globals.css
                </p>

                <div className="space-y-4">
                  <div>
                    <Label>Primary Color</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        defaultValue="#4a5d4e"
                        onChange={(e) => applyTokenChange('primary-500', e.target.value)}
                        className="w-16"
                      />
                      <Input
                        placeholder="--primary-500"
                        onChange={(e) => applyTokenChange('primary-500', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Secondary Color</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        defaultValue="#d4a574"
                        onChange={(e) => applyTokenChange('secondary-400', e.target.value)}
                        className="w-16"
                      />
                      <Input
                        placeholder="--secondary-400"
                        onChange={(e) => applyTokenChange('secondary-400', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Accent Color</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        defaultValue="#d9b4a7"
                        onChange={(e) => applyTokenChange('accent-300', e.target.value)}
                        className="w-16"
                      />
                      <Input
                        placeholder="--accent-300"
                        onChange={(e) => applyTokenChange('accent-300', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Border Radius</Label>
                    <Select onValueChange={(val) => applyTokenChange('radius', val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select radius" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.25rem">Small (0.25rem)</SelectItem>
                        <SelectItem value="0.5rem">Medium (0.5rem)</SelectItem>
                        <SelectItem value="0.75rem">Large (0.75rem)</SelectItem>
                        <SelectItem value="1rem">Extra Large (1rem)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {hasModifications && (
                <Card className="p-4 bg-muted">
                  <h4 className="font-medium text-sm mb-2">Modified Tokens</h4>
                  <div className="space-y-1">
                    {Object.entries(modifications).map(([key, value]) => (
                      <div key={key} className="text-xs flex justify-between">
                        <span className="font-mono">--{key}</span>
                        <span className="text-muted-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}