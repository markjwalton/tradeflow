import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const colorTokens = {
  primary: ["primary-50", "primary-100", "primary-200", "primary-300", "primary-400", "primary-500", "primary-600", "primary-700", "primary-800", "primary-900"],
  secondary: ["secondary-50", "secondary-100", "secondary-200", "secondary-300", "secondary-400", "secondary-500", "secondary-600", "secondary-700", "secondary-800", "secondary-900"],
  accent: ["accent-50", "accent-100", "accent-200", "accent-300", "accent-400", "accent-500", "accent-600", "accent-700", "accent-800", "accent-900"],
  semantic: ["background", "foreground", "muted", "muted-foreground", "card", "card-foreground", "destructive", "success", "warning", "info"],
};

const spacingTokens = ["0", "1", "2", "3", "4", "5", "6", "8", "10", "12", "16", "20", "24", "32"];
const fontSizes = ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl"];
const fontWeights = [
  { value: "300", label: "Light" },
  { value: "400", label: "Normal" },
  { value: "500", label: "Medium" },
  { value: "600", label: "Semibold" },
  { value: "700", label: "Bold" }
];
const radiusTokens = ["none", "sm", "md", "lg", "xl", "2xl", "full"];

export function ElementEditor({ selectedElement, activeSection, onApplyStyle }) {

  // Parse current element classes
  const currentStyles = useMemo(() => {
    if (!selectedElement) return {};
    
    const classes = selectedElement.currentClasses?.split(/\s+/) || [];
    const styles = {
      textColor: null,
      bgColor: null,
      padding: null,
      margin: null,
      fontSize: null,
      fontWeight: null,
      borderRadius: null,
    };

    classes.forEach(cls => {
      if (cls.startsWith('text-') && !cls.includes('muted') && !cls.includes('foreground')) {
        styles.textColor = cls.replace('text-', '');
      } else if (cls.startsWith('bg-')) {
        styles.bgColor = cls.replace('bg-', '');
      } else if (cls.match(/^p-\d+$/)) {
        styles.padding = cls.replace('p-', '');
      } else if (cls.match(/^m-\d+$/)) {
        styles.margin = cls.replace('m-', '');
      } else if (cls.match(/^text-(xs|sm|base|lg|xl|2xl|3xl|4xl)$/)) {
        styles.fontSize = cls.replace('text-', '');
      } else if (cls.match(/^font-\d+$/)) {
        styles.fontWeight = cls.replace('font-', '');
      } else if (cls.startsWith('rounded-')) {
        styles.borderRadius = cls.replace('rounded-', '');
      }
    });

    return styles;
  }, [selectedElement]);

  const handleApplyColor = (type, value) => {
    if (!selectedElement) return;
    const className = type === "text" ? `text-${value}` : `bg-${value}`;
    onApplyStyle?.({ className });
  };

  const handleApplySpacing = (type, value) => {
    if (!selectedElement) return;
    const className = type === "padding" ? `p-${value}` : `m-${value}`;
    onApplyStyle?.({ className });
  };

  const handleApplyTypography = (property, value) => {
    if (!selectedElement) return;
    const classNames = {
      size: `text-${value}`,
      weight: `font-${value}`,
    };
    onApplyStyle?.({ className: classNames[property] });
  };

  const handleApplyRadius = (value) => {
    if (!selectedElement) return;
    onApplyStyle?.({ className: `rounded-${value}` });
  };

  return (
    <div className="space-y-2">

      {/* Current Styles Tab */}
      {activeSection === "current" && (
        <div className="space-y-3 py-2">
          <div className="grid grid-cols-2 gap-3 text-xs">
            {currentStyles.textColor && (
              <div>
                <Label className="text-xs text-muted-foreground">Text Color</Label>
                <Badge className="mt-1 w-full justify-center">text-{currentStyles.textColor}</Badge>
              </div>
            )}
            {currentStyles.bgColor && (
              <div>
                <Label className="text-xs text-muted-foreground">Background</Label>
                <Badge className="mt-1 w-full justify-center">bg-{currentStyles.bgColor}</Badge>
              </div>
            )}
            {currentStyles.fontSize && (
              <div>
                <Label className="text-xs text-muted-foreground">Font Size</Label>
                <Badge className="mt-1 w-full justify-center">text-{currentStyles.fontSize}</Badge>
              </div>
            )}
            {currentStyles.fontWeight && (
              <div>
                <Label className="text-xs text-muted-foreground">Font Weight</Label>
                <Badge className="mt-1 w-full justify-center">
                  {fontWeights.find(w => w.value === currentStyles.fontWeight)?.label}
                </Badge>
              </div>
            )}
            {currentStyles.padding && (
              <div>
                <Label className="text-xs text-muted-foreground">Padding</Label>
                <Badge className="mt-1 w-full justify-center">p-{currentStyles.padding}</Badge>
              </div>
            )}
            {currentStyles.margin && (
              <div>
                <Label className="text-xs text-muted-foreground">Margin</Label>
                <Badge className="mt-1 w-full justify-center">m-{currentStyles.margin}</Badge>
              </div>
            )}
            {currentStyles.borderRadius && (
              <div>
                <Label className="text-xs text-muted-foreground">Border Radius</Label>
                <Badge className="mt-1 w-full justify-center">rounded-{currentStyles.borderRadius}</Badge>
              </div>
            )}
          </div>
          {!currentStyles.textColor && !currentStyles.bgColor && !currentStyles.fontSize && 
           !currentStyles.fontWeight && !currentStyles.padding && !currentStyles.margin && 
           !currentStyles.borderRadius && (
            <p className="text-xs text-muted-foreground text-center py-4">No styles applied yet</p>
          )}
        </div>
      )}

      {/* Colors Section */}
      {activeSection === "colors" && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs font-medium">Text Color</Label>
              {currentStyles.textColor && (
                <Badge variant="outline" className="text-xs">
                  {currentStyles.textColor}
                </Badge>
              )}
            </div>
            {Object.entries(colorTokens).map(([category, tokens]) => (
              <div key={category} className="mb-3">
                <p className="text-xs text-muted-foreground mb-1 capitalize">{category}</p>
                <div className="grid grid-cols-10 gap-1">
                  {tokens.map((token) => (
                    <button
                      key={token}
                      className={cn(
                        "h-6 w-full rounded border transition-all hover:scale-110",
                        `bg-${token}`,
                        currentStyles.textColor === token && "ring-2 ring-primary ring-offset-1"
                      )}
                      onClick={() => handleApplyColor("text", token)}
                      title={token}
                    >
                      {currentStyles.textColor === token && (
                        <Check className="h-3 w-3 text-white mx-auto drop-shadow" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs font-medium">Background</Label>
              {currentStyles.bgColor && (
                <Badge variant="outline" className="text-xs">
                  {currentStyles.bgColor}
                </Badge>
              )}
            </div>
            {Object.entries(colorTokens).map(([category, tokens]) => (
              <div key={category} className="mb-3">
                <p className="text-xs text-muted-foreground mb-1 capitalize">{category}</p>
                <div className="grid grid-cols-10 gap-1">
                  {tokens.map((token) => (
                    <button
                      key={token}
                      className={cn(
                        "h-6 w-full rounded border transition-all hover:scale-110",
                        `bg-${token}`,
                        currentStyles.bgColor === token && "ring-2 ring-primary ring-offset-1"
                      )}
                      onClick={() => handleApplyColor("background", token)}
                      title={token}
                    >
                      {currentStyles.bgColor === token && (
                        <Check className="h-3 w-3 text-white mx-auto drop-shadow" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Spacing Section */}
      {activeSection === "spacing" && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs font-medium">Padding</Label>
              {currentStyles.padding && (
                <Badge variant="outline" className="text-xs">
                  p-{currentStyles.padding}
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {spacingTokens.map((value) => (
                <Button
                  key={value}
                  variant={currentStyles.padding === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleApplySpacing("padding", value)}
                  className="text-xs h-8"
                >
                  {value}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs font-medium">Margin</Label>
              {currentStyles.margin && (
                <Badge variant="outline" className="text-xs">
                  m-{currentStyles.margin}
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {spacingTokens.map((value) => (
                <Button
                  key={value}
                  variant={currentStyles.margin === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleApplySpacing("margin", value)}
                  className="text-xs h-8"
                >
                  {value}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Typography Section */}
      {activeSection === "typography" && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs font-medium">Font Size</Label>
              {currentStyles.fontSize && (
                <Badge variant="outline" className="text-xs">
                  text-{currentStyles.fontSize}
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {fontSizes.map((size) => (
                <Button
                  key={size}
                  variant={currentStyles.fontSize === size ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleApplyTypography("size", size)}
                  className="text-xs"
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs font-medium">Font Weight</Label>
              {currentStyles.fontWeight && (
                <Badge variant="outline" className="text-xs">
                  {fontWeights.find(w => w.value === currentStyles.fontWeight)?.label}
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {fontWeights.map((weight) => (
                <Button
                  key={weight.value}
                  variant={currentStyles.fontWeight === weight.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleApplyTypography("weight", weight.value)}
                  className="text-xs"
                >
                  {weight.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Borders Section */}
      {activeSection === "borders" && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs font-medium">Border Radius</Label>
              {currentStyles.borderRadius && (
                <Badge variant="outline" className="text-xs">
                  rounded-{currentStyles.borderRadius}
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {radiusTokens.map((radius) => (
                <Button
                  key={radius}
                  variant={currentStyles.borderRadius === radius ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleApplyRadius(radius)}
                  className="text-xs"
                >
                  {radius}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}