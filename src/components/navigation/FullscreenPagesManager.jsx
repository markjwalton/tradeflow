import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Maximize2, File } from "lucide-react";
import { toast } from "sonner";

export default function FullscreenPagesManager({ configType }) {
  const queryClient = useQueryClient();

  const { data: navConfigs = [], isLoading } = useQuery({
    queryKey: ["navConfig", configType],
    queryFn: () => base44.entities.NavigationConfig.filter({ config_type: configType }),
  });

  const config = navConfigs[0];
  const sourceSlugs = (config?.source_slugs || []).sort();
  const fullscreenPages = config?.fullscreen_pages || [];

  const updateMutation = useMutation({
    mutationFn: async (newFullscreenPages) => {
      if (!config) {
        throw new Error("No config found");
      }
      return base44.entities.NavigationConfig.update(config.id, {
        fullscreen_pages: newFullscreenPages
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["navConfig", configType] });
      toast.success("Fullscreen pages updated");
    },
    onError: (error) => {
      toast.error("Failed to update: " + error.message);
    }
  });

  const handleToggle = (slug) => {
    const isCurrentlyFullscreen = fullscreenPages.includes(slug);
    const newFullscreenPages = isCurrentlyFullscreen
      ? fullscreenPages.filter(s => s !== slug)
      : [...fullscreenPages, slug];
    
    updateMutation.mutate(newFullscreenPages);
  };

  if (isLoading) {
    return (
      <Card className="rounded-xl border-border bg-card">
        <CardContent className="p-6 text-center text-muted-foreground">
          Loading...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl border-border bg-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Maximize2 className="h-5 w-5 text-primary" />
          <CardTitle>Fullscreen Pages</CardTitle>
          <Badge variant="outline" className="ml-auto">
            {fullscreenPages.length} / {sourceSlugs.length}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Fullscreen pages render without the app shell (no sidebar/header). Perfect for landing pages and showcases.
        </p>
      </CardHeader>
      <CardContent>
        {sourceSlugs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
            No pages found. Add pages to source_slugs first.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sourceSlugs.map(slug => {
              const isFullscreen = fullscreenPages.includes(slug);
              const pageName = slug.replace(/([A-Z])/g, ' $1').trim();
              
              return (
                <div 
                  key={slug}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer
                    ${isFullscreen 
                      ? 'bg-primary/5 border-primary/30 hover:bg-primary/10' 
                      : 'bg-background hover:bg-muted/50 border-border'
                    }
                  `}
                  onClick={() => handleToggle(slug)}
                >
                  <Checkbox
                    checked={isFullscreen}
                    onCheckedChange={() => handleToggle(slug)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex items-center gap-2 flex-1">
                    {isFullscreen ? (
                      <Maximize2 className="h-4 w-4 text-primary" />
                    ) : (
                      <File className="h-4 w-4 text-muted-foreground" />
                    )}
                    <Label className="cursor-pointer font-normal">
                      {pageName}
                    </Label>
                  </div>
                  {isFullscreen && (
                    <Badge className="bg-primary/20 text-primary text-xs">
                      Fullscreen
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}