import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { CompactButton } from "@/components/library/CompactButton";
import { editorClasses } from "./editorTokens";

const colorTokens = {
  primary: ["primary-50", "primary-100", "primary-200", "primary-300", "primary-400", "primary-500", "primary-600", "primary-700", "primary-800", "primary-900"],
  secondary: ["secondary-50", "secondary-100", "secondary-200", "secondary-300", "secondary-400", "secondary-500", "secondary-600", "secondary-700", "secondary-800", "secondary-900"],
  accent: ["accent-50", "accent-100", "accent-200", "accent-300", "accent-400", "accent-500", "accent-600", "accent-700", "accent-800", "accent-900"],
  semantic: ["background", "foreground", "muted", "muted-foreground", "card", "card-foreground", "destructive", "success", "warning", "info"],
};

const spacingTokens = ["0", "1", "2", "3", "4", "5", "6", "8", "10", "12", "16", "20", "24", "32"];
const fontSizes = ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl"];
const fontWeights = [
  { value: "300", label: "L" },
  { value: "400", label: "N" },
  { value: "500", label: "M" },
  { value: "600", label: "SB" },
  { value: "700", label: "B" }
];
const radiusTokens = ["none", "sm", "md", "lg", "xl", "2xl", "full"];

export function ElementEditor({ selectedElement, activeSection, showHeader = true, onApplyStyle }) {

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
      {/* Colors Section */}
      {activeSection === "colors" && (
        <div className="space-y-4">
          <div>
            <div className="mb-2">
              <Label className={editorClasses.label}>Text Color</Label>
            </div>
            {Object.entries(colorTokens).map(([category, tokens]) => (
              <div key={category} className="mb-3">
                <p className={editorClasses.category}>{category}</p>
                <div className="grid grid-cols-10 gap-1">
                      {tokens.map((token) => (
                        <button
                          key={token}
                          className={cn(
                            editorClasses.swatch,
                            `bg-${token}`,
                            currentStyles.textColor === token && editorClasses.swatchActive
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
            <div className="mb-2">
              <Label className={editorClasses.label}>Background</Label>
            </div>
            {Object.entries(colorTokens).map(([category, tokens]) => (
              <div key={category} className="mb-3">
                <p className={editorClasses.category}>{category}</p>
                <div className="grid grid-cols-10 gap-1">
                      {tokens.map((token) => (
                        <button
                          key={token}
                          className={cn(
                            editorClasses.swatch,
                            `bg-${token}`,
                            currentStyles.bgColor === token && editorClasses.swatchActive
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
            <div className="mb-2">
              <Label className={editorClasses.label}>Padding</Label>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {spacingTokens.map((value) => (
                <CompactButton
                  key={value}
                  isActive={currentStyles.padding === value}
                  onClick={() => handleApplySpacing("padding", value)}
                >
                  {value}
                </CompactButton>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2">
              <Label className={editorClasses.label}>Margin</Label>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {spacingTokens.map((value) => (
                <CompactButton
                  key={value}
                  isActive={currentStyles.margin === value}
                  onClick={() => handleApplySpacing("margin", value)}
                >
                  {value}
                </CompactButton>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Typography Section */}
      {activeSection === "typography" && (
        <div className="space-y-4">
          <div>
            <div className="mb-2">
              <Label className={editorClasses.label}>Font Size</Label>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {fontSizes.map((size) => (
                <CompactButton
                  key={size}
                  isActive={currentStyles.fontSize === size}
                  onClick={() => handleApplyTypography("size", size)}
                >
                  {size}
                </CompactButton>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2">
              <Label className={editorClasses.label}>Font Weight</Label>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {fontWeights.map((weight) => (
                <CompactButton
                  key={weight.value}
                  isActive={currentStyles.fontWeight === weight.value}
                  onClick={() => handleApplyTypography("weight", weight.value)}
                >
                  {weight.label}
                </CompactButton>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Borders Section */}
      {activeSection === "borders" && (
        <div className="space-y-4">
          <div>
            <div className="mb-2">
              <Label className={editorClasses.label}>Border Radius</Label>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {radiusTokens.map((radius) => (
                <CompactButton
                  key={radius}
                  isActive={currentStyles.borderRadius === radius}
                  onClick={() => handleApplyRadius(radius)}
                >
                  {radius}
                </CompactButton>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}