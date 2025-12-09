import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { 
  LayoutGrid, Columns, Rows, Grid3x3, Box,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  ArrowUpDown, ArrowLeftRight
} from "lucide-react";

const layoutPatterns = [
  {
    id: "grid-2",
    name: "2 Column Grid",
    icon: Columns,
    code: 'grid grid-cols-1 md:grid-cols-2 gap-4',
    preview: "□ □"
  },
  {
    id: "grid-3",
    name: "3 Column Grid",
    icon: Grid3x3,
    code: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
    preview: "□ □ □"
  },
  {
    id: "grid-4",
    name: "4 Column Grid",
    icon: LayoutGrid,
    code: 'grid grid-cols-2 md:grid-cols-4 gap-4',
    preview: "□ □ □ □"
  },
  {
    id: "sidebar-left",
    name: "Sidebar Left",
    icon: Box,
    code: 'grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6',
    preview: "▌ □"
  },
  {
    id: "sidebar-right",
    name: "Sidebar Right",
    icon: Box,
    code: 'grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-6',
    preview: "□ ▌"
  },
  {
    id: "stack",
    name: "Vertical Stack",
    icon: Rows,
    code: 'flex flex-col gap-4',
    preview: "□\n□\n□"
  },
];

const flexProperties = {
  direction: [
    { value: "flex-row", label: "Row", icon: ArrowLeftRight },
    { value: "flex-col", label: "Column", icon: ArrowUpDown },
  ],
  justify: [
    { value: "justify-start", label: "Start", icon: AlignLeft },
    { value: "justify-center", label: "Center", icon: AlignCenter },
    { value: "justify-end", label: "End", icon: AlignRight },
    { value: "justify-between", label: "Between", icon: AlignJustify },
  ],
  align: [
    { value: "items-start", label: "Start" },
    { value: "items-center", label: "Center" },
    { value: "items-end", label: "End" },
    { value: "items-stretch", label: "Stretch" },
  ],
  gap: ["0", "1", "2", "3", "4", "6", "8"],
};

export function LayoutBuilderPanel({ selectedElement, onApplyLayout }) {
  const [activeTab, setActiveTab] = useState("patterns");
  const [customGrid, setCustomGrid] = useState({ cols: 3, rows: 1, gap: 4 });

  const handleApplyPattern = (pattern) => {
    if (!selectedElement) return;
    onApplyLayout?.({ className: pattern.code });
  };

  const handleApplyFlexProperty = (className) => {
    if (!selectedElement) return;
    onApplyLayout?.({ className });
  };

  const handleApplyCustomGrid = () => {
    if (!selectedElement) return;
    const className = `grid grid-cols-${customGrid.cols} grid-rows-${customGrid.rows} gap-${customGrid.gap}`;
    onApplyLayout?.({ className });
  };

  if (!selectedElement) {
    return (
      <div className="flex items-center justify-center h-[300px] border-2 border-dashed rounded-lg">
        <p className="text-sm text-muted-foreground">Select a container to apply layout</p>
      </div>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="patterns">Patterns</TabsTrigger>
        <TabsTrigger value="flexbox">Flexbox</TabsTrigger>
        <TabsTrigger value="grid">Grid</TabsTrigger>
      </TabsList>

      <ScrollArea className="h-[280px] mt-4">
        <TabsContent value="patterns" className="space-y-3 mt-0">
          {layoutPatterns.map((pattern) => {
            const Icon = pattern.icon;
            return (
              <Card
                key={pattern.id}
                className="cursor-pointer hover:border-primary hover:shadow-md transition-all"
                onClick={() => handleApplyPattern(pattern)}
              >
                <CardHeader className="p-4">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="text-sm">{pattern.name}</CardTitle>
                      <CardDescription className="text-xs mt-1 font-mono">{pattern.code}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="flexbox" className="space-y-4 mt-0">
          <div>
            <Label className="text-sm mb-2 block">Direction</Label>
            <div className="grid grid-cols-2 gap-2">
              {flexProperties.direction.map((prop) => {
                const Icon = prop.icon;
                return (
                  <Button
                    key={prop.value}
                    variant="outline"
                    size="sm"
                    onClick={() => handleApplyFlexProperty(prop.value)}
                    className="justify-start gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {prop.label}
                  </Button>
                );
              })}
            </div>
          </div>

          <div>
            <Label className="text-sm mb-2 block">Justify Content</Label>
            <div className="grid grid-cols-2 gap-2">
              {flexProperties.justify.map((prop) => {
                const Icon = prop.icon;
                return (
                  <Button
                    key={prop.value}
                    variant="outline"
                    size="sm"
                    onClick={() => handleApplyFlexProperty(prop.value)}
                    className="justify-start gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {prop.label}
                  </Button>
                );
              })}
            </div>
          </div>

          <div>
            <Label className="text-sm mb-2 block">Align Items</Label>
            <div className="grid grid-cols-2 gap-2">
              {flexProperties.align.map((prop) => (
                <Button
                  key={prop.value}
                  variant="outline"
                  size="sm"
                  onClick={() => handleApplyFlexProperty(prop.value)}
                >
                  {prop.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm mb-2 block">Gap</Label>
            <div className="grid grid-cols-4 gap-2">
              {flexProperties.gap.map((gap) => (
                <Button
                  key={gap}
                  variant="outline"
                  size="sm"
                  onClick={() => handleApplyFlexProperty(`gap-${gap}`)}
                >
                  {gap}
                </Button>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="grid" className="space-y-4 mt-0">
          <div className="space-y-3">
            <div>
              <Label className="text-sm mb-2 block">Columns</Label>
              <Input
                type="number"
                min="1"
                max="12"
                value={customGrid.cols}
                onChange={(e) => setCustomGrid({ ...customGrid, cols: e.target.value })}
              />
            </div>

            <div>
              <Label className="text-sm mb-2 block">Rows</Label>
              <Input
                type="number"
                min="1"
                max="12"
                value={customGrid.rows}
                onChange={(e) => setCustomGrid({ ...customGrid, rows: e.target.value })}
              />
            </div>

            <div>
              <Label className="text-sm mb-2 block">Gap</Label>
              <Input
                type="number"
                min="0"
                max="32"
                value={customGrid.gap}
                onChange={(e) => setCustomGrid({ ...customGrid, gap: e.target.value })}
              />
            </div>

            <Button onClick={handleApplyCustomGrid} className="w-full">
              Apply Custom Grid
            </Button>
          </div>

          <div className="border-t pt-3">
            <Label className="text-sm mb-2 block">Quick Grid Layouts</Label>
            <div className="grid grid-cols-3 gap-2">
              {["1", "2", "3", "4", "6", "12"].map((cols) => (
                <Button
                  key={cols}
                  variant="outline"
                  size="sm"
                  onClick={() => handleApplyFlexProperty(`grid-cols-${cols}`)}
                >
                  {cols} cols
                </Button>
              ))}
            </div>
          </div>
        </TabsContent>
      </ScrollArea>
    </Tabs>
  );
}