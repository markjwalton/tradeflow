import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GitBranch, GitFork, Lock, Clock, ChevronRight } from "lucide-react";
import { format } from "date-fns";

const statusColors = {
  draft: "bg-warning/10 text-warning",
  published: "bg-success-50 text-success",
  archived: "bg-muted text-muted-foreground",
};

export default function VersionHistoryPanel({ 
  currentMindMap, 
  onSelectVersion, 
  onClose 
}) {
  // Get the root parent to find all versions in the lineage
  const getRootId = (map) => {
    return map?.parent_version_id || map?.id;
  };

  const { data: allVersions = [], isLoading } = useQuery({
    queryKey: ["mindmapVersions", currentMindMap?.id],
    queryFn: async () => {
      if (!currentMindMap) return [];
      
      // Get all mindmaps and filter to find the version tree
      const allMaps = await base44.entities.MindMap.list();
      
      // Find all related versions (same name prefix or linked by parent_version_id)
      const rootId = currentMindMap.parent_version_id || currentMindMap.id;
      
      // Build version tree
      const versions = allMaps.filter(m => 
        m.id === rootId || 
        m.parent_version_id === rootId ||
        m.parent_version_id === currentMindMap.id ||
        currentMindMap.parent_version_id === m.id
      );
      
      // Sort by version number descending
      return versions.sort((a, b) => (b.version || 1) - (a.version || 1));
    },
    enabled: !!currentMindMap,
  });

  if (!currentMindMap) return null;

  return (
    <div className="w-80 bg-white border-l flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <GitBranch className="h-4 w-4" />
          Version History
        </h3>
        <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading versions...</p>
          ) : allVersions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No version history</p>
          ) : (
            allVersions.map((version) => {
              const isCurrent = version.id === currentMindMap.id;
              return (
                <div
                  key={version.id}
                  className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                    isCurrent 
                      ? "border-info bg-info-50" 
                      : "border-border hover:border-border/60 hover:bg-muted"
                  }`}
                  onClick={() => !isCurrent && onSelectVersion(version.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {version.status === "published" ? (
                        <Lock className="h-4 w-4 text-success" />
                      ) : (
                        <GitFork className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="font-medium">v{version.version || 1}</span>
                    </div>
                    <Badge className={statusColors[version.status || "draft"]}>
                      {version.status || "draft"}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-1 truncate">
                    {version.name}
                  </p>
                  
                  {version.change_notes && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {version.change_notes}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                    <Clock className="h-3 w-3" />
                    {version.published_date 
                      ? format(new Date(version.published_date), "MMM d, yyyy")
                      : format(new Date(version.created_date), "MMM d, yyyy")
                    }
                  </div>
                  
                  {isCurrent && (
                    <div className="flex items-center gap-1 text-xs text-info mt-1">
                      <ChevronRight className="h-3 w-3" />
                      Current
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}