import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Layout, Plus, Save, Trash2, Copy, Eye, Grid3X3, 
  Maximize, Sidebar, Square, PanelTop, PanelBottom,
  Loader2, Sparkles, Check, X, Move, GripVertical
} from "lucide-react";
import { toast } from "sonner";

const ZONE_PURPOSES = [
  { id: "header", name: "Header", icon: PanelTop, color: "bg-blue-500" },
  { id: "sidebar", name: "Sidebar", icon: Sidebar, color: "bg-purple-500" },
  { id: "main", name: "Main Content", icon: Square, color: "bg-green-500" },
  { id: "footer", name: "Footer", icon: PanelBottom, color: "bg-gray-500" },
  { id: "card", name: "Card Area", icon: Square, color: "bg-orange-500" },
  { id: "stats", name: "Stats Row", icon: Grid3X3, color: "bg-cyan-500" },
  { id: "filters", name: "Filters", icon: Square, color: "bg-pink-500" },
  { id: "actions", name: "Actions", icon: Square, color: "bg-yellow-500" },
  { id: "list", name: "List/Table", icon: Square, color: "bg-indigo-500" },
  { id: "form", name: "Form Area", icon: Square, color: "bg-red-500" },
];

const LAYOUT_PRESETS = [
  {
    name: "Dashboard Grid",
    category: "dashboard_layout",
    zones: [
      { id: "header", name: "Page Header", col_start: 1, col_span: 12, row_start: 1, row_span: 1, purpose: "header" },
      { id: "stats", name: "Stats Row", col_start: 1, col_span: 12, row_start: 2, row_span: 1, purpose: "stats" },
      { id: "main-left", name: "Main Chart", col_start: 1, col_span: 8, row_start: 3, row_span: 3, purpose: "main" },
      { id: "sidebar", name: "Side Panel", col_start: 9, col_span: 4, row_start: 3, row_span: 3, purpose: "sidebar" }
    ]
  },
  {
    name: "List with Filters",
    category: "list_layout",
    zones: [
      { id: "header", name: "Page Header", col_start: 1, col_span: 12, row_start: 1, row_span: 1, purpose: "header" },
      { id: "filters", name: "Filters Bar", col_start: 1, col_span: 12, row_start: 2, row_span: 1, purpose: "filters" },
      { id: "actions", name: "Actions", col_start: 1, col_span: 12, row_start: 3, row_span: 1, purpose: "actions" },
      { id: "list", name: "Data List", col_start: 1, col_span: 12, row_start: 4, row_span: 3, purpose: "list" }
    ]
  },
  {
    name: "Detail with Sidebar",
    category: "detail_page",
    zones: [
      { id: "header", name: "Page Header", col_start: 1, col_span: 12, row_start: 1, row_span: 1, purpose: "header" },
      { id: "main", name: "Main Content", col_start: 1, col_span: 8, row_start: 2, row_span: 5, purpose: "main" },
      { id: "sidebar", name: "Sidebar", col_start: 9, col_span: 4, row_start: 2, row_span: 5, purpose: "sidebar" }
    ]
  },
  {
    name: "Form Layout",
    category: "form_layout",
    zones: [
      { id: "header", name: "Form Header", col_start: 1, col_span: 12, row_start: 1, row_span: 1, purpose: "header" },
      { id: "form", name: "Form Fields", col_start: 1, col_span: 8, row_start: 2, row_span: 4, purpose: "form" },
      { id: "help", name: "Help Panel", col_start: 9, col_span: 4, row_start: 2, row_span: 4, purpose: "sidebar" },
      { id: "actions", name: "Form Actions", col_start: 1, col_span: 8, row_start: 6, row_span: 1, purpose: "actions" }
    ]
  },
  {
    name: "Card Grid",
    category: "card_layout",
    zones: [
      { id: "header", name: "Section Header", col_start: 1, col_span: 12, row_start: 1, row_span: 1, purpose: "header" },
      { id: "card1", name: "Card 1", col_start: 1, col_span: 4, row_start: 2, row_span: 2, purpose: "card" },
      { id: "card2", name: "Card 2", col_start: 5, col_span: 4, row_start: 2, row_span: 2, purpose: "card" },
      { id: "card3", name: "Card 3", col_start: 9, col_span: 4, row_start: 2, row_span: 2, purpose: "card" },
      { id: "card4", name: "Card 4", col_start: 1, col_span: 4, row_start: 4, row_span: 2, purpose: "card" },
      { id: "card5", name: "Card 5", col_start: 5, col_span: 4, row_start: 4, row_span: 2, purpose: "card" },
      { id: "card6", name: "Card 6", col_start: 9, col_span: 4, row_start: 4, row_span: 2, purpose: "card" }
    ]
  }
];

export default function LayoutBuilder() {
  const queryClient = useQueryClient();
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [zones, setZones] = useState([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [patternName, setPatternName] = useState("");
  const [patternDescription, setPatternDescription] = useState("");
  const [patternCategory, setPatternCategory] = useState("page_layout");
  const [selectedZone, setSelectedZone] = useState(null);
  const [generating, setGenerating] = useState(false);

  const { data: patterns = [], isLoading } = useQuery({
    queryKey: ["layoutPatterns"],
    queryFn: () => base44.entities.LayoutPattern.list("-created_date")
  });

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.LayoutPattern.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["layoutPatterns"] });
      toast.success("Layout pattern saved");
      setShowSaveDialog(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.LayoutPattern.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["layoutPatterns"] });
      toast.success("Pattern deleted");
    }
  });

  const handleLoadPreset = (preset) => {
    setZones(preset.zones.map(z => ({ ...z })));
    setPatternName(preset.name);
    setPatternCategory(preset.category);
    toast.success(`Loaded "${preset.name}" preset`);
  };

  const handleLoadPattern = (pattern) => {
    setSelectedPattern(pattern);
    setZones(pattern.zones || []);
    setPatternName(pattern.name);
    setPatternDescription(pattern.description || "");
    setPatternCategory(pattern.category);
  };

  const handleAddZone = () => {
    const newZone = {
      id: `zone_${Date.now()}`,
      name: "New Zone",
      col_start: 1,
      col_span: 4,
      row_start: zones.length + 1,
      row_span: 1,
      purpose: "content"
    };
    setZones([...zones, newZone]);
    setSelectedZone(newZone.id);
  };

  const handleUpdateZone = (zoneId, updates) => {
    setZones(zones.map(z => z.id === zoneId ? { ...z, ...updates } : z));
  };

  const handleDeleteZone = (zoneId) => {
    setZones(zones.filter(z => z.id !== zoneId));
    if (selectedZone === zoneId) setSelectedZone(null);
  };

  const generateTailwindClasses = () => {
    // Generate grid container classes
    let containerClasses = "grid grid-cols-12 gap-4 p-6";
    
    // Generate zone-specific classes
    const zoneClasses = zones.map(zone => ({
      id: zone.id,
      classes: `col-start-${zone.col_start} col-span-${zone.col_span} row-start-${zone.row_start} row-span-${zone.row_span}`
    }));
    
    return { containerClasses, zoneClasses };
  };

  const generateJSXTemplate = () => {
    const { containerClasses, zoneClasses } = generateTailwindClasses();
    
    let jsx = `<div className="${containerClasses}">\n`;
    zones.forEach((zone, idx) => {
      const zc = zoneClasses.find(z => z.id === zone.id);
      jsx += `  {/* ${zone.name} */}\n`;
      jsx += `  <div className="${zc?.classes}">\n`;
      jsx += `    {/* ${zone.purpose} content */}\n`;
      jsx += `  </div>\n`;
    });
    jsx += `</div>`;
    
    return jsx;
  };

  const handleSave = () => {
    if (!patternName.trim()) {
      toast.error("Pattern name is required");
      return;
    }
    
    saveMutation.mutate({
      name: patternName,
      description: patternDescription,
      category: patternCategory,
      preview_config: { columns: 12, rows: 6, gap: "gap-4", padding: "p-6" },
      zones: zones,
      tailwind_classes: generateTailwindClasses().containerClasses,
      jsx_template: generateJSXTemplate(),
      is_system: false
    });
  };

  const handleAIGenerate = async () => {
    setGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a professional page layout for a ${patternCategory.replace(/_/g, " ")}.

Consider best practices:
- Clear visual hierarchy
- Consistent spacing
- Responsive-friendly structure
- Professional appearance

Return a JSON object with zones array. Each zone should have:
- id: unique identifier
- name: descriptive name
- col_start: starting column (1-12)
- col_span: column width (1-12)
- row_start: starting row (1-6)
- row_span: row height (1-6)
- purpose: one of [header, sidebar, main, footer, card, stats, filters, actions, list, form, content]
- suggested_components: array of component names that could go here

Create 4-8 zones for a complete layout.`,
        response_json_schema: {
          type: "object",
          properties: {
            zones: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                  col_start: { type: "number" },
                  col_span: { type: "number" },
                  row_start: { type: "number" },
                  row_span: { type: "number" },
                  purpose: { type: "string" },
                  suggested_components: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });
      
      setZones(result.zones || []);
      toast.success("AI generated layout");
    } catch (error) {
      toast.error("Generation failed: " + error.message);
    }
    setGenerating(false);
  };

  const getPurposeColor = (purpose) => {
    return ZONE_PURPOSES.find(z => z.id === purpose)?.color || "bg-gray-400";
  };

  return (
    <div className="p-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading text-midnight-900 flex items-center gap-2">
            <Layout className="h-6 w-6 text-primary" />
            Layout Builder
          </h1>
          <p className="text-muted-foreground">
            Design page layouts visually and save as reusable patterns
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleAIGenerate} disabled={generating}>
            {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            AI Generate
          </Button>
          <Button 
            onClick={() => setShowSaveDialog(true)}
            disabled={zones.length === 0}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Pattern
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Sidebar - Presets & Saved Patterns */}
        <div className="col-span-3 space-y-4">
          <Card className="border-border">
            <CardHeader className="py-3">
              <CardTitle className="text-sm text-midnight-900">Presets</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {LAYOUT_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handleLoadPreset(preset)}
                    className="w-full text-left p-2 rounded-lg hover:bg-background transition-colors text-sm"
                  >
                    <p className="font-medium text-midnight-900">{preset.name}</p>
                    <p className="text-xs text-muted-foreground">{preset.zones.length} zones</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="py-3">
              <CardTitle className="text-sm text-midnight-900">Saved Patterns</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="h-[200px]">
                {isLoading ? (
                  <div className="text-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  </div>
                ) : patterns.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No saved patterns</p>
                ) : (
                  <div className="space-y-2">
                    {patterns.map((pattern) => (
                      <div
                        key={pattern.id}
                        className="p-2 rounded-lg hover:bg-background transition-colors group"
                      >
                        <div className="flex items-center justify-between">
                          <button onClick={() => handleLoadPattern(pattern)} className="text-left flex-1">
                            <p className="font-medium text-sm text-midnight-900">{pattern.name}</p>
                            <p className="text-xs text-muted-foreground">{pattern.zones?.length || 0} zones</p>
                          </button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 opacity-0 group-hover:opacity-100"
                            onClick={() => deleteMutation.mutate(pattern.id)}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="py-3">
              <CardTitle className="text-sm text-midnight-900">Zone Types</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-1">
                {ZONE_PURPOSES.map((purpose) => (
                  <div key={purpose.id} className="flex items-center gap-1 text-xs p-1">
                    <div className={`w-3 h-3 rounded ${purpose.color}`} />
                    <span className="text-muted-foreground">{purpose.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Canvas */}
        <div className="col-span-6">
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between py-3">
              <CardTitle className="text-sm text-midnight-900">Layout Canvas (12-column grid)</CardTitle>
              <Button variant="outline" size="sm" onClick={handleAddZone}>
                <Plus className="h-3 w-3 mr-1" />
                Add Zone
              </Button>
            </CardHeader>
            <CardContent>
              {/* Grid Preview */}
              <div 
                className="relative bg-background rounded-lg p-4 min-h-[400px]"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(12, 1fr)",
                  gridTemplateRows: "repeat(6, 60px)",
                  gap: "8px"
                }}
              >
                {/* Grid lines (visual guide) */}
                {Array.from({ length: 12 }).map((_, i) => (
                  <div 
                    key={`col-${i}`} 
                    className="absolute top-0 bottom-0 border-l border-dashed border-charcoal-300"
                    style={{ left: `${(i / 12) * 100}%` }}
                  />
                ))}
                
                {/* Zones */}
                {zones.map((zone) => (
                  <div
                    key={zone.id}
                    onClick={() => setSelectedZone(zone.id)}
                    className={`rounded-lg p-2 cursor-pointer transition-all ${getPurposeColor(zone.purpose)} ${
                      selectedZone === zone.id ? "ring-2 ring-primary ring-offset-2" : ""
                    }`}
                    style={{
                      gridColumnStart: zone.col_start,
                      gridColumnEnd: `span ${zone.col_span}`,
                      gridRowStart: zone.row_start,
                      gridRowEnd: `span ${zone.row_span}`,
                      opacity: 0.8
                    }}
                  >
                    <div className="flex items-center justify-between h-full">
                      <div className="text-white">
                        <p className="text-xs font-medium truncate">{zone.name}</p>
                        <p className="text-xs opacity-75">{zone.col_span}×{zone.row_span}</p>
                      </div>
                      <GripVertical className="h-4 w-4 text-white/50" />
                    </div>
                  </div>
                ))}
                
                {zones.length === 0 && (
                  <div className="col-span-12 row-span-6 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Grid3X3 className="h-12 w-12 mx-auto mb-2 opacity-30" />
                      <p>Click "Add Zone" or select a preset to start</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - Zone Properties */}
        <div className="col-span-3 space-y-4">
          <Card className="border-border">
            <CardHeader className="py-3">
              <CardTitle className="text-sm text-midnight-900">Zone Properties</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {selectedZone ? (
                <div className="space-y-3">
                  {(() => {
                    const zone = zones.find(z => z.id === selectedZone);
                    if (!zone) return null;
                    return (
                      <>
                        <div>
                          <Label className="text-xs">Name</Label>
                          <Input 
                            value={zone.name}
                            onChange={(e) => handleUpdateZone(zone.id, { name: e.target.value })}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Purpose</Label>
                          <Select 
                            value={zone.purpose} 
                            onValueChange={(v) => handleUpdateZone(zone.id, { purpose: v })}
                          >
                            <SelectTrigger className="h-8 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ZONE_PURPOSES.map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Col Start</Label>
                            <Input 
                              type="number" min={1} max={12}
                              value={zone.col_start}
                              onChange={(e) => handleUpdateZone(zone.id, { col_start: parseInt(e.target.value) || 1 })}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Col Span</Label>
                            <Input 
                              type="number" min={1} max={12}
                              value={zone.col_span}
                              onChange={(e) => handleUpdateZone(zone.id, { col_span: parseInt(e.target.value) || 1 })}
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Row Start</Label>
                            <Input 
                              type="number" min={1} max={6}
                              value={zone.row_start}
                              onChange={(e) => handleUpdateZone(zone.id, { row_start: parseInt(e.target.value) || 1 })}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Row Span</Label>
                            <Input 
                              type="number" min={1} max={6}
                              value={zone.row_span}
                              onChange={(e) => handleUpdateZone(zone.id, { row_span: parseInt(e.target.value) || 1 })}
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleDeleteZone(zone.id)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete Zone
                        </Button>
                      </>
                    );
                  })()}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Select a zone to edit its properties
                </p>
              )}
            </CardContent>
          </Card>

          {zones.length > 0 && (
            <Card className="border-border">
              <CardHeader className="py-3">
                <CardTitle className="text-sm text-midnight-900">Generated Code</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ScrollArea className="h-[150px]">
                  <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
                    {generateJSXTemplate()}
                  </pre>
                </ScrollArea>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2"
                  onClick={() => {
                    navigator.clipboard.writeText(generateJSXTemplate());
                    toast.success("Copied to clipboard");
                  }}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy Code
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-midnight-900">Save Layout Pattern</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Pattern Name</Label>
              <Input 
                value={patternName}
                onChange={(e) => setPatternName(e.target.value)}
                placeholder="e.g., Dashboard with Stats"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea 
                value={patternDescription}
                onChange={(e) => setPatternDescription(e.target.value)}
                placeholder="When to use this layout..."
                rows={2}
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={patternCategory} onValueChange={setPatternCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="page_layout">Page Layout</SelectItem>
                  <SelectItem value="section_layout">Section Layout</SelectItem>
                  <SelectItem value="card_layout">Card Layout</SelectItem>
                  <SelectItem value="form_layout">Form Layout</SelectItem>
                  <SelectItem value="list_layout">List Layout</SelectItem>
                  <SelectItem value="dashboard_layout">Dashboard Layout</SelectItem>
                  <SelectItem value="detail_page">Detail Page</SelectItem>
                  <SelectItem value="landing_page">Landing Page</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowSaveDialog(false)}>Cancel</Button>
              <Button 
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Pattern
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}