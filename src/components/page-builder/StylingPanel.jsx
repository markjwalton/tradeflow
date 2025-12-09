import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

const colorTokens = {
  primary: ["primary-50", "primary-100", "primary-200", "primary-300", "primary-400", "primary-500", "primary-600", "primary-700", "primary-800", "primary-900"],
  secondary: ["secondary-50", "secondary-100", "secondary-200", "secondary-300", "secondary-400", "secondary-500", "secondary-600", "secondary-700", "secondary-800", "secondary-900"],
  accent: ["accent-50", "accent-100", "accent-200", "accent-300", "accent-400", "accent-500", "accent-600", "accent-700", "accent-800", "accent-900"],
  semantic: ["background", "foreground", "muted", "muted-foreground", "card", "card-foreground", "destructive", "success", "warning", "info"],
};

const spacingTokens = ["0", "1", "2", "3", "4", "5", "6", "8", "10", "12", "16", "20", "24", "32"];
const radiusTokens = ["none", "sm", "md", "lg", "xl", "2xl", "full"];
const fontSizes = ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl"];
const fontWeights = [{ value: "300", label: "Light" }, { value: "400", label: "Normal" }, { value: "500", label: "Medium" }, { value: "600", label: "Semibold" }, { value: "700", label: "Bold" }];

export function StylingPanel({ selectedElement, onApplyStyle }) {
  const [activeTab, setActiveTab] = useState("colors");

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

  const handleApplyRadius = (value) => {
    if (!selectedElement) return;
    onApplyStyle?.({ className: `rounded-${value}` });
  };

  const handleApplyTypography = (property, value) => {
    if (!selectedElement) return;
    const classNames = {
      size: `text-${value}`,
      weight: `font-${value}`,
    };
    onApplyStyle?.({ className: classNames[property] });
  };

  if (!selectedElement) {
    return (
      <div className="flex items-center justify-center h-[300px] border-2 border-dashed rounded-lg">
        <p className="text-sm text-muted-foreground">Select an element to apply styles</p>
      </div>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="colors">Colors</TabsTrigger>
        <TabsTrigger value="spacing">Spacing</TabsTrigger>
        <TabsTrigger value="typography">Typography</TabsTrigger>
        <TabsTrigger value="borders">Borders</TabsTrigger>
      </TabsList>

      <ScrollArea className="h-[280px] mt-4">
        <TabsContent value="colors" className="space-y-4 mt-0">
          {Object.entries(colorTokens).map(([category, tokens]) => (
            <div key={category} className="space-y-2">
              <Label className="text-xs font-medium capitalize">{category}</Label>
              <div className="grid grid-cols-5 gap-2">
                {tokens.map((token) => (
                  <button
                    key={token}
                    className={cn(
                      "h-10 w-full rounded border-2 hover:scale-105 transition-transform",
                      `bg-${token}`
                    )}
                    onClick={() => handleApplyColor("background", token)}
                    title={token}
                  />
                ))}
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="spacing" className="space-y-4 mt-0">
          <div className="space-y-3">
            <div>
              <Label className="text-sm mb-2 block">Padding</Label>
              <div className="grid grid-cols-7 gap-2">
                {spacingTokens.map((value) => (
                  <Button
                    key={value}
                    variant="outline"
                    size="sm"
                    onClick={() => handleApplySpacing("padding", value)}
                    className="text-xs"
                  >
                    {value}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm mb-2 block">Margin</Label>
              <div className="grid grid-cols-7 gap-2">
                {spacingTokens.map((value) => (
                  <Button
                    key={value}
                    variant="outline"
                    size="sm"
                    onClick={() => handleApplySpacing("margin", value)}
                    className="text-xs"
                  >
                    {value}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="typography" className="space-y-4 mt-0">
          <div>
            <Label className="text-sm mb-2 block">Font Size</Label>
            <div className="grid grid-cols-4 gap-2">
              {fontSizes.map((size) => (
                <Button
                  key={size}
                  variant="outline"
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
            <Label className="text-sm mb-2 block">Font Weight</Label>
            <div className="grid grid-cols-3 gap-2">
              {fontWeights.map((weight) => (
                <Button
                  key={weight.value}
                  variant="outline"
                  size="sm"
                  onClick={() => handleApplyTypography("weight", weight.value)}
                  className="text-xs"
                >
                  {weight.label}
                </Button>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="borders" className="space-y-4 mt-0">
          <div>
            <Label className="text-sm mb-2 block">Border Radius</Label>
            <div className="grid grid-cols-4 gap-2">
              {radiusTokens.map((radius) => (
                <Button
                  key={radius}
                  variant="outline"
                  size="sm"
                  onClick={() => handleApplyRadius(radius)}
                  className="text-xs"
                >
                  {radius}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm mb-2 block">Border Width</Label>
            <div className="grid grid-cols-4 gap-2">
              {["0", "1", "2", "4", "8"].map((width) => (
                <Button
                  key={width}
                  variant="outline"
                  size="sm"
                  onClick={() => onApplyStyle?.({ className: `border-${width}` })}
                  className="text-xs"
                >
                  {width}px
                </Button>
              ))}
            </div>
          </div>
        </TabsContent>
      </ScrollArea>
    </Tabs>
  );
}