import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CompactButton } from "@/components/library/CompactButton";
import { Code } from "lucide-react";

export default function CompactButtonShowcase() {
  const [activeSpacing, setActiveSpacing] = useState("4");
  const [activeFontSize, setActiveFontSize] = useState("base");
  
  const spacingTokens = ["0", "1", "2", "3", "4", "5", "6", "8", "10", "12", "16", "20", "24", "32"];
  const fontSizes = ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl"];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-display mb-2">Compact Buttons</h1>
        <p className="text-muted-foreground">Ultra-compact buttons for dense UI controls like editors and toolbars</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic Usage</CardTitle>
          <CardDescription>Compact buttons with active/inactive states</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-3">Spacing Selector</h3>
            <div className="grid grid-cols-7 gap-1">
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

          <div>
            <h3 className="text-sm font-medium mb-3">Font Size Selector</h3>
            <div className="grid grid-cols-4 gap-1">
              {fontSizes.map((size) => (
                <CompactButton
                  key={size}
                  isActive={activeFontSize === size}
                  onClick={() => setActiveFontSize(size)}
                >
                  {size}
                </CompactButton>
              ))}
            </div>
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

const [active, setActive] = useState("base");
const options = ["xs", "sm", "base", "lg", "xl"];

<div className="grid grid-cols-5 gap-1">
  {options.map((option) => (
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
          <CardDescription>Compact button specifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Height</p>
              <code className="text-xs bg-muted px-2 py-1 rounded">h-6 (24px)</code>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Padding</p>
              <code className="text-xs bg-muted px-2 py-1 rounded">px-2 (8px horizontal)</code>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Font Size</p>
              <code className="text-xs bg-muted px-2 py-1 rounded">text-[10px]</code>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Font Weight</p>
              <code className="text-xs bg-muted px-2 py-1 rounded">font-medium (500)</code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}