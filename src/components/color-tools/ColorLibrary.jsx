import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Star, Copy, Check, Search } from "lucide-react";

export function ColorLibrary({ tenantId }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(null);
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
  
  const copyColors = (palette) => {
    const text = palette.colors.map(c => `${c.name}: ${c.hex}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(palette.id);
    setTimeout(() => setCopied(null), 2000);
  };
  
  const filteredPalettes = palettes.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  if (isLoading) {
    return <div className="text-center py-8">Loading library...</div>;
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Color Library</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Search className="h-4 w-4 text-muted-foreground mt-3" />
            <Input 
              placeholder="Search palettes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
      
      {filteredPalettes.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No palettes saved yet. Create and save palettes from the tools above.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredPalettes.map((palette) => (
            <Card key={palette.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div className="space-y-1">
                  <CardTitle className="text-base">{palette.name}</CardTitle>
                  {palette.description && (
                    <p className="text-sm text-muted-foreground">{palette.description}</p>
                  )}
                  <div className="flex gap-1 mt-2">
                    <Badge variant="outline">{palette.category}</Badge>
                    {palette.tags?.map(tag => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-1">
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
                        <div className="text-xs text-center font-mono">
                          {color.hex}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}