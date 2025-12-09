import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CompactButton } from "@/components/library/CompactButton";
import { Label } from "@/components/ui/label";
import { editorClasses } from "@/components/page-builder/editorTokens";
import { Code } from "lucide-react";

export default function CompactButtonShowcase() {
  const [activeSpacing, setActiveSpacing] = useState("4");
  const [activeFontSize, setActiveFontSize] = useState("base");
  const [activeWeight, setActiveWeight] = useState("500");
  
  const spacingTokens = ["0", "1", "2", "3", "4", "5", "6", "8", "10", "12", "16", "20"];
  const fontSizes = ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl"];
  const fontWeights = [
    { value: "300", label: "L" },
    { value: "400", label: "N" },
    { value: "500", label: "M" },
    { value: "600", label: "SB" },
    { value: "700", label: "B" }
  ];
  const radiusOptions = ["none", "sm", "md", "lg", "xl", "2xl", "full"];

  return (
    <div className="p-6 w-full space-y-8">
      <div>
        <h1 className="text-4xl font-display mb-2">Compact Buttons</h1>
        <p className="text-muted-foreground">28×28px square buttons for dense editor UIs</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Spacing Controls</CardTitle>
          <CardDescription>Square buttons for padding/margin selection</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-12 gap-1">
              {spacingTokens.map((value) => (
                <CompactButton
                  key={value}
                  isActive={activeSpacing === value}
                  onClick={() => setActiveSpacing(value)}
                >
                  {value}
                </CompactButton>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Typography Controls</CardTitle>
          <CardDescription>Compact controls for font properties</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-8 gap-1">
            {fontSizes.map((value) => (
              <CompactButton
                key={value}
                isActive={activeFontSize === value}
                onClick={() => setActiveFontSize(value)}
              >
                {value}
              </CompactButton>
            ))}
          </div>

          <div className="grid grid-cols-5 gap-1">
              {fontWeights.map((weight) => (
                <CompactButton
                  key={weight.value}
                  isActive={activeWeight === weight.value}
                  onClick={() => setActiveWeight(weight.value)}
                >
                  {weight.label}
                </CompactButton>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Border Radius</CardTitle>
          <CardDescription>Radius token selection</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {radiusOptions.map((value) => (
              <CompactButton
                key={value}
                isActive={false}
                onClick={() => {}}
              >
                {value}
              </CompactButton>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Code Example
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`import { CompactButton } from "@/components/library/CompactButton";
import { Label } from "@/components/ui/label";
import { editorClasses } from "@/components/page-builder/editorTokens";

const [active, setActive] = useState("4");

<Label className={editorClasses.label}>Padding</Label>
<div className="grid grid-cols-7 gap-1">
  {spacingOptions.map((option) => (
    <CompactButton
      key={option}
      isActive={active === option}
      onClick={() => setActive(option)}
    >
      {option}
    </CompactButton>
  ))}
</div>`}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Design Tokens</CardTitle>
          <CardDescription>Specifications from editorTokens.js</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Size</p>
              <code className="text-xs bg-muted px-2 py-1 rounded">28×28px (h-7 w-7)</code>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Padding</p>
              <code className="text-xs bg-muted px-2 py-1 rounded">p-0 (square, centered)</code>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Font Size</p>
              <code className="text-xs bg-muted px-2 py-1 rounded">text-[9px]</code>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Font Weight</p>
              <code className="text-xs bg-muted px-2 py-1 rounded">font-medium (500)</code>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Grid Gap</p>
              <code className="text-xs bg-muted px-2 py-1 rounded">gap-1 (4px)</code>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Border Radius</p>
              <code className="text-xs bg-muted px-2 py-1 rounded">var(--radius-md)</code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}