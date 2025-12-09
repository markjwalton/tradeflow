import React, { useState } from "react";
import { CompactButton } from "@/components/library/CompactButton";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CompactButtonShowcase() {
  const [openCategory, setOpenCategory] = useState(null);
  const [activeSpacing, setActiveSpacing] = useState("4");
  const [activeFontSize, setActiveFontSize] = useState("base");
  const [activeWeight, setActiveWeight] = useState("500");
  const [activeRadius, setActiveRadius] = useState("md");
  const [activeColor, setActiveColor] = useState("primary-500");
  
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
  
  const colorTokens = {
    primary: ["primary-50", "primary-100", "primary-200", "primary-300", "primary-400", "primary-500", "primary-600", "primary-700", "primary-800", "primary-900"],
    secondary: ["secondary-50", "secondary-100", "secondary-200", "secondary-300", "secondary-400", "secondary-500", "secondary-600", "secondary-700", "secondary-800", "secondary-900"],
    accent: ["accent-50", "accent-100", "accent-200", "accent-300", "accent-400", "accent-500", "accent-600", "accent-700", "accent-800", "accent-900"],
    charcoal: ["charcoal-50", "charcoal-100", "charcoal-200", "charcoal-300", "charcoal-400", "charcoal-500", "charcoal-600", "charcoal-700", "charcoal-800", "charcoal-900"],
    midnight: ["midnight-50", "midnight-100", "midnight-200", "midnight-300", "midnight-400", "midnight-500", "midnight-600", "midnight-700", "midnight-800", "midnight-900"],
  };

  const toggleCategory = (category) => {
    setOpenCategory(openCategory === category ? null : category);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-2 bg-background">
      <div className="w-full max-w-3xl space-y-1">
        {/* Spacing */}
        <div className="border rounded-lg overflow-hidden bg-card">
          <button
            onClick={() => toggleCategory("spacing")}
            className="w-full px-3 py-1.5 text-sm text-left font-medium hover:bg-muted transition-colors"
          >
            Spacing
          </button>
          {openCategory === "spacing" && (
            <div className="p-1">
              <div className="inline-grid grid-cols-12 gap-0.5">
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
          )}
        </div>

        {/* Typography - Font Size */}
        <div className="border rounded-lg overflow-hidden bg-card">
          <button
            onClick={() => toggleCategory("fontSize")}
            className="w-full px-3 py-1.5 text-sm text-left font-medium hover:bg-muted transition-colors"
          >
            Font Size
          </button>
          {openCategory === "fontSize" && (
            <div className="p-1">
              <div className="inline-grid grid-cols-8 gap-0.5">
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
            </div>
          )}
        </div>

        {/* Typography - Font Weight */}
        <div className="border rounded-lg overflow-hidden bg-card">
          <button
            onClick={() => toggleCategory("fontWeight")}
            className="w-full px-3 py-1.5 text-sm text-left font-medium hover:bg-muted transition-colors"
          >
            Font Weight
          </button>
          {openCategory === "fontWeight" && (
            <div className="p-1">
              <div className="inline-grid grid-cols-5 gap-0.5">
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
          )}
        </div>

        {/* Border Radius */}
        <div className="border rounded-lg overflow-hidden bg-card">
          <button
            onClick={() => toggleCategory("radius")}
            className="w-full px-3 py-1.5 text-sm text-left font-medium hover:bg-muted transition-colors"
          >
            Border Radius
          </button>
          {openCategory === "radius" && (
            <div className="p-1">
              <div className="inline-grid grid-cols-7 gap-0.5">
                {radiusOptions.map((value) => (
                  <CompactButton
                    key={value}
                    isActive={activeRadius === value}
                    onClick={() => setActiveRadius(value)}
                  >
                    {value}
                  </CompactButton>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Colors */}
        <div className="border rounded-lg overflow-hidden bg-card">
          <button
            onClick={() => toggleCategory("colors")}
            className="w-full px-3 py-1.5 text-sm text-left font-medium hover:bg-muted transition-colors"
          >
            Colors
          </button>
          {openCategory === "colors" && (
            <div className="p-1 space-y-1">
              {Object.entries(colorTokens).map(([category, tokens]) => (
                <div key={category}>
                  <div className="text-xs text-muted-foreground mb-0.5 capitalize px-1">{category}</div>
                  <div className="inline-grid grid-cols-10 gap-0.5">
                    {tokens.map((token) => (
                      <button
                        key={token}
                        className={cn(
                          "h-7 w-7 rounded border transition-all flex items-center justify-center",
                          activeColor === token ? "border-foreground shadow-md" : "border-border hover:border-muted-foreground"
                        )}
                        style={{ backgroundColor: `var(--${token})` }}
                        onClick={() => setActiveColor(token)}
                        title={token}
                      >
                        {activeColor === token && (
                          <Check className="h-3 w-3 text-white drop-shadow-lg" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}