import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Trash2, Star, Copy, Check, Search, Plus, X, Upload, Sparkles, ChevronDown, ChevronUp, Settings, Moon, Palette, Layers } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function ColorLibrary({ tenantId }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(null);
  const [showHex, setShowHex] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newPalette, setNewPalette] = useState({ name: "", description: "", colorCount: 5, colors: [], tags: [] });
  const [tagInput, setTagInput] = useState("");
  const [cssInput, setCssInput] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [showTagCloud, setShowTagCloud] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedPalettes, setSelectedPalettes] = useState([]);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const queryClient = useQueryClient();
  
  const { data: palettes = [], isLoading } = useQuery({
    queryKey: ["colorPalettes", tenantId],
    queryFn: async () => {
      const results = await base44.entities.ColorPalette.filter({
        tenant_id: tenantId || "__global__"
      });
      return results;
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ColorPalette.delete(id),
    onSuccess: () => queryClient.invalidateQueries(["colorPalettes"])
  });
  
  const toggleFavoriteMutation = useMutation({
    mutationFn: ({ id, isFavorite }) => 
      base44.entities.ColorPalette.update(id, { is_favorite: !isFavorite }),
    onSuccess: () => queryClient.invalidateQueries(["colorPalettes"])
  });

  const generateDarkModeMutation = useMutation({
    mutationFn: (paletteId) => base44.functions.invoke('generateDarkModePalette', { paletteId }),
    onSuccess: () => {
      queryClient.invalidateQueries(["colorPalettes"]);
    }
  });

  const applyThemeMutation = useMutation({
    mutationFn: (paletteId) => base44.functions.invoke('applyTheme', { paletteId }),
    onSuccess: (result) => {
      if (result.data?.success) {
        // Reload the page to apply the new theme
        window.location.reload();
      }
    }
  });

  const groupPalettesMutation = useMutation({
    mutationFn: async ({ paletteIds, groupName }) => {
      const groupId = `group_${Date.now()}`;
      await Promise.all(
        paletteIds.map(id => 
          base44.entities.ColorPalette.update(id, { 
            palette_group_id: groupId,
            tags: palettes.find(p => p.id === id)?.tags?.concat([groupName]) || [groupName]
          })
        )
      );
      return groupId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["colorPalettes"]);
      setSelectedPalettes([]);
      setGroupDialogOpen(false);
      setGroupName("");
    }
  });
  
  const copyColors = (palette) => {
    const text = palette.colors.map(c => `${c.name}: ${c.hex}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(palette.id);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyColorRef = (color) => {
    const text = showHex ? color.hex : color.oklch;
    navigator.clipboard.writeText(text);
    setCopied(color.hex);
    setTimeout(() => setCopied(null), 2000);
  };

  const addTag = () => {
    if (tagInput.trim() && !newPalette.tags.includes(tagInput.trim())) {
      setNewPalette({ ...newPalette, tags: [...newPalette.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  const removeTag = (tag) => {
    setNewPalette({ ...newPalette, tags: newPalette.tags.filter(t => t !== tag) });
  };

  const parseCSS = () => {
    const matches = cssInput.matchAll(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/g);
    const colors = Array.from(matches).map((match, i) => ({
      name: `Color ${i + 1}`,
      oklch: `oklch(${match[1]} ${match[2]} ${match[3]})`,
      hex: "#cccccc"
    }));
    setNewPalette({ ...newPalette, colors, colorCount: colors.length });
  };

  const generateAINames = async () => {
    const prompt = `Generate descriptive names for these colors: ${newPalette.colors.map((c, i) => `Color ${i + 1}: ${c.oklch}`).join(", ")}. Return a JSON array of names only.`;
    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: { type: "object", properties: { names: { type: "array", items: { type: "string" } } } }
    });
    if (result.names) {
      setNewPalette({
        ...newPalette,
        colors: newPalette.colors.map((c, i) => ({ ...c, name: result.names[i] || c.name }))
      });
    }
  };

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.ColorPalette.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["colorPalettes"]);
      setAddDialogOpen(false);
      setNewPalette({ name: "", description: "", colorCount: 5, colors: [], tags: [] });
      setCssInput("");
    }
  });

  const handleSave = () => {
    if (!newPalette.name || newPalette.colors.length === 0) return;
    saveMutation.mutate({
      tenant_id: tenantId || "__global__",
      name: newPalette.name,
      description: newPalette.description,
      category: "palette",
      colors: newPalette.colors,
      tags: newPalette.tags
    });
  };
  
  const allTags = [...new Set(palettes.flatMap(p => p.tags || []))].sort();
  
  const filteredPalettes = palettes.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => p.tags?.includes(tag));
    return matchesSearch && matchesTags;
  });

  const totalPages = Math.ceil(filteredPalettes.length / itemsPerPage);
  const paginatedPalettes = filteredPalettes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
    setCurrentPage(1);
  };
  
  if (isLoading) {
    return <div className="text-center py-8">Loading library...</div>;
  }
  
  return (
    <div className="space-y-6">
      <Card className="rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Color Library</CardTitle>
            <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="format-toggle" className="text-sm">Hex</Label>
              <Switch id="format-toggle" checked={!showHex} onCheckedChange={(checked) => setShowHex(!checked)} />
              <Label htmlFor="format-toggle" className="text-sm">OKLCH</Label>
            </div>
            {selectedPalettes.length > 0 && (
              <Button size="sm" variant="outline" onClick={() => setGroupDialogOpen(true)}>
                <Layers className="h-4 w-4 mr-1" />Group ({selectedPalettes.length})
              </Button>
            )}
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="h-4 w-4 mr-1" />Add to Library</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Palette to Library</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Palette Name</Label>
                    <Input 
                      value={newPalette.name}
                      onChange={(e) => setNewPalette({ ...newPalette, name: e.target.value })}
                      placeholder="e.g., Sunset Gradient"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input 
                      value={newPalette.description}
                      onChange={(e) => setNewPalette({ ...newPalette, description: e.target.value })}
                      placeholder="e.g., Warm sunset colors from orange to purple"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && addTag()}
                        placeholder="Add tag..."
                      />
                      <Button onClick={addTag} size="sm">Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {newPalette.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="gap-1">
                          {tag}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Import from CSS</Label>
                    <Textarea 
                      value={cssInput}
                      onChange={(e) => setCssInput(e.target.value)}
                      placeholder="Paste CSS with oklch() values..."
                      rows={4}
                    />
                    <Button onClick={parseCSS} size="sm" variant="outline">
                      <Upload className="h-4 w-4 mr-1" />Parse CSS
                    </Button>
                  </div>
                  {newPalette.colors.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>Colors ({newPalette.colors.length})</Label>
                        <Button onClick={generateAINames} size="sm" variant="outline">
                          <Sparkles className="h-4 w-4 mr-1" />AI Name Colors
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {newPalette.colors.map((color, i) => (
                          <div key={i} className="flex gap-2 items-center">
                            <div className="h-10 w-10 rounded border" style={{ backgroundColor: color.hex }} />
                            <Input 
                              value={color.name}
                              onChange={(e) => {
                                const updated = [...newPalette.colors];
                                updated[i].name = e.target.value;
                                setNewPalette({ ...newPalette, colors: updated });
                              }}
                              placeholder="Color name"
                              className="flex-1"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={!newPalette.name || newPalette.colors.length === 0}>
                      Save Palette
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Search className="h-4 w-4 text-muted-foreground mt-3" />
            <Input 
              placeholder="Search by name or tags..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-60">
                <div className="space-y-2">
                  <Label>Items per page</Label>
                  <Input 
                    type="number" 
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Math.max(5, parseInt(e.target.value) || 10));
                      setCurrentPage(1);
                    }}
                    min={5}
                    max={50}
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <Collapsible open={showTagCloud} onOpenChange={setShowTagCloud}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span>Filter by Tags {selectedTags.length > 0 && `(${selectedTags.length})`}</span>
                {showTagCloud ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-muted/30">
                {allTags.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tags available</p>
                ) : (
                  allTags.map(tag => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
      
      {filteredPalettes.length === 0 ? (
        <Card className="rounded-xl">
          <CardContent className="py-8 text-center text-muted-foreground">
            No palettes saved yet. Create and save palettes from the tools above.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            {paginatedPalettes.map((palette) => (
            <Card key={palette.id} className={`rounded-xl ${selectedPalettes.includes(palette.id) ? 'ring-2 ring-primary' : ''}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <input
                  type="checkbox"
                  checked={selectedPalettes.includes(palette.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedPalettes([...selectedPalettes, palette.id]);
                    } else {
                      setSelectedPalettes(selectedPalettes.filter(id => id !== palette.id));
                    }
                  }}
                  className="mr-3 h-4 w-4 rounded border-gray-300"
                />
                <div className="space-y-1">
                  <CardTitle className="text-base">{palette.name}</CardTitle>
                  {palette.description && (
                    <p className="text-sm text-muted-foreground">{palette.description}</p>
                  )}
                  <div className="flex gap-1 mt-2">
                    <Badge variant="outline">{palette.category}</Badge>
                    {palette.is_dark_mode_alternative && (
                      <Badge variant="default" className="bg-midnight-700">Dark Mode</Badge>
                    )}
                    {palette.tags?.map(tag => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => applyThemeMutation.mutate(palette.id)}
                    disabled={applyThemeMutation.isPending}
                    title="Set as Active Theme"
                  >
                    <Palette className="h-4 w-4" />
                  </Button>
                  {!palette.is_dark_mode_alternative && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async () => {
                        const result = await generateDarkModeMutation.mutateAsync(palette.id);
                        if (result.data?.success) {
                          setCopied(`dark-${palette.id}`);
                          setTimeout(() => setCopied(null), 2000);
                        }
                      }}
                      disabled={generateDarkModeMutation.isPending}
                      title="Generate AI Dark Mode"
                    >
                      <Moon className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleFavoriteMutation.mutate({ 
                      id: palette.id, 
                      isFavorite: palette.is_favorite 
                    })}
                  >
                    <Star 
                      className={`h-4 w-4 ${palette.is_favorite ? "fill-yellow-400 text-yellow-400" : ""}`} 
                    />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyColors(palette)}
                  >
                    {copied === palette.id ? 
                      <Check className="h-4 w-4" /> : 
                      <Copy className="h-4 w-4" />
                    }
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteMutation.mutate(palette.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {palette.category === "gradient" && palette.gradient ? (
                  <div 
                    className="w-full h-24 rounded-lg border"
                    style={{
                      background: palette.gradient.type === "linear" 
                        ? `linear-gradient(${palette.gradient.angle}deg, ${palette.colors.map(c => c.hex).join(", ")})`
                        : palette.gradient.type === "radial"
                        ? `radial-gradient(circle, ${palette.colors.map(c => c.hex).join(", ")})`
                        : `conic-gradient(from ${palette.gradient.angle}deg, ${palette.colors.map(c => c.hex).join(", ")})`
                    }}
                  />
                ) : (
                  <div className="grid grid-cols-5 gap-2">
                    {palette.colors?.map((color, i) => (
                      <div key={i} className="space-y-1">
                        <div 
                          className="h-16 rounded border"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div className="text-xs text-center text-muted-foreground">
                          {color.name}
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <div className="text-xs text-center font-mono">
                            {showHex ? color.hex : color.oklch}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-5 w-5 p-0"
                            onClick={() => copyColorRef(color)}
                          >
                            {copied === color.hex ? 
                              <Check className="h-3 w-3" /> : 
                              <Copy className="h-3 w-3" />
                            }
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      <Dialog open={groupDialogOpen} onOpenChange={setGroupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Palette Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Group Name</Label>
              <Input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g., Sunset Collection, Brand Variants..."
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {selectedPalettes.length} palettes will be grouped together
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setGroupDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={() => groupPalettesMutation.mutate({ paletteIds: selectedPalettes, groupName })}
                disabled={!groupName.trim() || groupPalettesMutation.isPending}
              >
                Create Group
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
      );
      }