import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

export default function BrandIdentity() {
  const [copiedValue, setCopiedValue] = React.useState(null);

  const copyToClipboard = (value, label) => {
    navigator.clipboard.writeText(value);
    setCopiedValue(label);
    toast.success(`Copied ${label}`);
    setTimeout(() => setCopiedValue(null), 2000);
  };

  const brandColors = {
    primary: [
      { name: "Sage Green 50", hex: "#f6f8f7", var: "--primary-50" },
      { name: "Sage Green 100", hex: "#e8f0ea", var: "--primary-100" },
      { name: "Sage Green 200", hex: "#d1e1d5", var: "--primary-200" },
      { name: "Sage Green 300", hex: "#a9c7b1", var: "--primary-300" },
      { name: "Sage Green 400", hex: "#7ba688", var: "--primary-400" },
      { name: "Sage Green 500", hex: "#4a5d4e", var: "--primary-500", featured: true },
      { name: "Sage Green 600", hex: "#3d4d42", var: "--primary-600" },
      { name: "Sage Green 700", hex: "#334036", var: "--primary-700" },
      { name: "Sage Green 800", hex: "#2a342c", var: "--primary-800" },
      { name: "Sage Green 900", hex: "#232b25", var: "--primary-900" },
    ],
    secondary: [
      { name: "Warm Beige 50", hex: "#faf8f4", var: "--secondary-50" },
      { name: "Warm Beige 100", hex: "#f4f0e8", var: "--secondary-100" },
      { name: "Warm Beige 200", hex: "#e8ddc9", var: "--secondary-200" },
      { name: "Warm Beige 300", hex: "#dcc5a0", var: "--secondary-300" },
      { name: "Warm Beige 400", hex: "#d4a574", var: "--secondary-400", featured: true },
      { name: "Warm Beige 500", hex: "#c89558", var: "--secondary-500" },
      { name: "Warm Beige 600", hex: "#b7824a", var: "--secondary-600" },
      { name: "Warm Beige 700", hex: "#98683f", var: "--secondary-700" },
      { name: "Warm Beige 800", hex: "#7c5539", var: "--secondary-800" },
      { name: "Warm Beige 900", hex: "#654731", var: "--secondary-900" },
    ],
    accent: [
      { name: "Dusty Rose 50", hex: "#faf7f6", var: "--accent-50" },
      { name: "Dusty Rose 100", hex: "#f4eeec", var: "--accent-100" },
      { name: "Dusty Rose 200", hex: "#e8d9d5", var: "--accent-200" },
      { name: "Dusty Rose 300", hex: "#d9b4a7", var: "--accent-300", featured: true },
      { name: "Dusty Rose 400", hex: "#ce9c8c", var: "--accent-400" },
      { name: "Dusty Rose 500", hex: "#c18871", var: "--accent-500" },
      { name: "Dusty Rose 600", hex: "#b07460", var: "--accent-600" },
      { name: "Dusty Rose 700", hex: "#93614f", var: "--accent-700" },
      { name: "Dusty Rose 800", hex: "#785043", var: "--accent-800" },
      { name: "Dusty Rose 900", hex: "#63433a", var: "--accent-900" },
    ],
    neutral: [
      { name: "Midnight 900", hex: "#1b2a35", var: "--midnight-900", featured: true },
      { name: "Charcoal 800", hex: "#3b3b3b", var: "--charcoal-800", featured: true },
      { name: "Background", hex: "#f5f3ef", var: "--background-100", featured: true },
      { name: "White", hex: "#ffffff", var: "--background-50", featured: true },
    ],
  };

  const typography = {
    display: {
      name: "Degular Display",
      usage: "Headings, titles, navigation",
      weights: ["Light (300)", "Regular (400)", "Medium (500)", "Semibold (600)", "Bold (700)"],
      features: "Modern, clean, excellent readability",
    },
    body: {
      name: "Mrs Eaves XL Serif Narrow",
      usage: "Body text, paragraphs, descriptions",
      weights: ["Light (300)", "Regular (400)", "Medium (500)", "Bold (700)"],
      features: "Elegant serif, traditional feel",
    },
    mono: {
      name: "Source Code Pro",
      usage: "Code snippets, technical content",
      weights: ["Regular (400)", "Medium (500)", "Semibold (600)"],
      features: "Monospace, technical aesthetic",
    },
  };

  const spacing = [
    { token: "--spacing-1", value: "0.25rem", pixels: "4px" },
    { token: "--spacing-2", value: "0.5rem", pixels: "8px" },
    { token: "--spacing-3", value: "0.75rem", pixels: "12px" },
    { token: "--spacing-4", value: "1rem", pixels: "16px" },
    { token: "--spacing-5", value: "1.25rem", pixels: "20px" },
    { token: "--spacing-6", value: "1.5rem", pixels: "24px" },
    { token: "--spacing-8", value: "2rem", pixels: "32px" },
    { token: "--spacing-10", value: "2.5rem", pixels: "40px" },
    { token: "--spacing-12", value: "3rem", pixels: "48px" },
  ];

  const borderRadius = [
    { token: "--radius-sm", value: "0.25rem", pixels: "4px", usage: "Small elements, badges" },
    { token: "--radius-md", value: "0.375rem", pixels: "6px", usage: "Inputs, small cards" },
    { token: "--radius-lg", value: "0.5rem", pixels: "8px", usage: "Buttons, medium cards" },
    { token: "--radius-xl", value: "0.75rem", pixels: "12px", usage: "Large cards, modals" },
    { token: "--radius-2xl", value: "1rem", pixels: "16px", usage: "Hero sections" },
    { token: "--radius-full", value: "9999px", pixels: "∞", usage: "Pills, avatars" },
  ];

  const shadows = [
    { name: "Extra Small", token: "--shadow-xs", usage: "Subtle depth" },
    { name: "Small", token: "--shadow-sm", usage: "Cards, buttons" },
    { name: "Medium", token: "--shadow-md", usage: "Dropdowns, popovers" },
    { name: "Large", token: "--shadow-lg", usage: "Modals, drawers" },
    { name: "Extra Large", token: "--shadow-xl", usage: "Floating elements" },
    { name: "2X Large", token: "--shadow-2xl", usage: "Major overlays" },
  ];

  const ColorSwatch = ({ color }) => (
    <div className="space-y-2">
      <div
        className="h-20 rounded-lg border-2 border-muted cursor-pointer hover:scale-105 transition-transform"
        style={{ backgroundColor: color.hex }}
        onClick={() => copyToClipboard(color.hex, color.name)}
      />
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{color.name}</p>
          {color.featured && <Badge variant="secondary" className="text-xs">Featured</Badge>}
        </div>
        <button
          onClick={() => copyToClipboard(color.hex, color.name)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
        >
          {copiedValue === color.name ? (
            <Check className="h-3 w-3" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
          <span className="font-mono">{color.hex}</span>
        </button>
        <p className="text-xs text-muted-foreground font-mono">var({color.var})</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-display">Brand Identity</h1>
        <p className="text-body-color mt-2">
          Complete design system tokens, colors, typography, and visual guidelines
        </p>
      </div>

      {/* Brand Colors */}
      <Card>
        <CardHeader>
          <CardTitle>Brand Colors</CardTitle>
          <CardDescription>
            Our carefully curated color palette reflects natural, timeless elegance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Primary - Sage Green</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {brandColors.primary.map((color) => (
                <ColorSwatch key={color.name} color={color} />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Secondary - Warm Beige</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {brandColors.secondary.map((color) => (
                <ColorSwatch key={color.name} color={color} />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Accent - Dusty Rose</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {brandColors.accent.map((color) => (
                <ColorSwatch key={color.name} color={color} />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Neutral Colors</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {brandColors.neutral.map((color) => (
                <ColorSwatch key={color.name} color={color} />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card>
        <CardHeader>
          <CardTitle>Typography</CardTitle>
          <CardDescription>
            Three complementary typefaces for hierarchy and personality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border rounded-lg p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-display">{typography.display.name}</h3>
              <Badge>Display Font</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{typography.display.usage}</p>
            <div className="flex flex-wrap gap-2">
              {typography.display.weights.map((weight) => (
                <Badge key={weight} variant="outline" className="font-display">
                  {weight}
                </Badge>
              ))}
            </div>
            <p className="text-4xl font-display font-light">The quick brown fox</p>
          </div>

          <div className="border rounded-lg p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-display">{typography.body.name}</h3>
              <Badge>Body Font</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{typography.body.usage}</p>
            <div className="flex flex-wrap gap-2">
              {typography.body.weights.map((weight) => (
                <Badge key={weight} variant="outline" className="font-body">
                  {weight}
                </Badge>
              ))}
            </div>
            <p className="text-2xl font-body">The quick brown fox jumps over the lazy dog</p>
          </div>

          <div className="border rounded-lg p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-display">{typography.mono.name}</h3>
              <Badge>Monospace</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{typography.mono.usage}</p>
            <div className="flex flex-wrap gap-2">
              {typography.mono.weights.map((weight) => (
                <Badge key={weight} variant="outline" className="font-mono">
                  {weight}
                </Badge>
              ))}
            </div>
            <p className="text-lg font-mono">const greeting = "Hello World";</p>
          </div>
        </CardContent>
      </Card>

      {/* Spacing */}
      <Card>
        <CardHeader>
          <CardTitle>Spacing Scale</CardTitle>
          <CardDescription>
            Consistent spacing based on 4px grid system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {spacing.map((space) => (
              <div key={space.token} className="flex items-center gap-4">
                <div
                  className="bg-primary-200 h-8 rounded"
                  style={{ width: space.value }}
                />
                <div className="flex-1 flex items-center justify-between">
                  <code className="text-sm font-mono">{space.token}</code>
                  <span className="text-sm text-muted-foreground">{space.value}</span>
                  <span className="text-sm text-muted-foreground">({space.pixels})</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Border Radius */}
      <Card>
        <CardHeader>
          <CardTitle>Border Radius</CardTitle>
          <CardDescription>
            Rounded corners for softer, more approachable UI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {borderRadius.map((radius) => (
              <div key={radius.token} className="border rounded-lg p-4 space-y-3">
                <div
                  className="h-20 bg-primary-100 border-2 border-primary-300"
                  style={{ borderRadius: radius.value }}
                />
                <div className="space-y-1">
                  <code className="text-sm font-mono">{radius.token}</code>
                  <p className="text-sm text-muted-foreground">{radius.value} ({radius.pixels})</p>
                  <p className="text-xs text-muted-foreground">{radius.usage}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Shadows */}
      <Card>
        <CardHeader>
          <CardTitle>Elevation & Shadows</CardTitle>
          <CardDescription>
            Layering and depth through subtle shadows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {shadows.map((shadow) => (
              <div key={shadow.token} className="space-y-3">
                <div
                  className="h-24 bg-white rounded-lg flex items-center justify-center"
                  style={{ boxShadow: `var(${shadow.token})` }}
                >
                  <span className="text-sm font-medium">{shadow.name}</span>
                </div>
                <div className="space-y-1">
                  <code className="text-sm font-mono">{shadow.token}</code>
                  <p className="text-xs text-muted-foreground">{shadow.usage}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Brand Principles */}
      <Card className="bg-primary-50 border-primary-200">
        <CardHeader>
          <CardTitle>Brand Principles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h4 className="font-medium mb-1">Natural Elegance</h4>
            <p className="text-sm text-muted-foreground">
              Inspired by nature with earthy, organic tones that feel timeless and sophisticated
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">Warm & Approachable</h4>
            <p className="text-sm text-muted-foreground">
              Soft, warm colors create an inviting atmosphere while maintaining professionalism
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">Clear Hierarchy</h4>
            <p className="text-sm text-muted-foreground">
              Thoughtful typography and spacing guide users naturally through content
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">Refined Details</h4>
            <p className="text-sm text-muted-foreground">
              Subtle shadows, generous spacing, and rounded corners create a polished experience
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}