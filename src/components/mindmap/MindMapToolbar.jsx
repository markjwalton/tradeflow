import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus, Trash2, Link, LayoutGrid, FileText, Sparkles, Lightbulb, Rocket, GitFork, Lock, History, Database, Play, Building2, Focus, X } from "lucide-react";

const statusColors = {
  draft: "bg-yellow-100 text-yellow-700",
  published: "bg-green-100 text-green-700",
  archived: "bg-gray-100 text-gray-700",
};

const ToolbarGroup = ({ children, label }) => (
  <div className="flex items-center gap-1">
    {label && <span className="text-[10px] text-gray-400 uppercase tracking-wider mr-1 hidden lg:inline">{label}</span>}
    {children}
  </div>
);

const ToolbarDivider = () => (
  <Separator orientation="vertical" className="h-6 mx-2" />
);

export default function MindMapToolbar({
  onAddNode,
  onDeleteSelected,
  onStartConnection,
  onAutoLayout,
  onAIGenerate,
  onAISuggest,
  onGenerateApp,
  onShowBusinessContext,
  isConnecting,
  hasSelection,
  isGenerating,
  isSuggesting,
  isGeneratingApp,
  currentMindMap,
  onForkVersion,
  onPublishVersion,
  onShowHistory,
  onShowERD,
  onShowWorkflows,
  onForkToTenant,
  focusedBranchId,
  onFocusBranch,
  mainBranches = [],
}) {
  const isPublished = currentMindMap?.status === "published";
  
  return (
    <TooltipProvider delayDuration={300}>
      <div className="bg-white border-b">
        {/* Main Toolbar Row */}
        <div className="flex items-center gap-1 px-3 py-2">
          
          {/* Edit Group */}
          <ToolbarGroup>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" onClick={onAddNode} className="h-8">
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add a new node to the mind map</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant={isConnecting ? "default" : "ghost"}
                  onClick={onStartConnection}
                  className="h-8"
                >
                  <Link className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Connect two nodes together</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onDeleteSelected}
                  disabled={!hasSelection}
                  className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete selected node or connection</TooltipContent>
            </Tooltip>
          </ToolbarGroup>

          <ToolbarDivider />

          {/* View Group */}
          <ToolbarGroup>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="ghost" onClick={onAutoLayout} className="h-8">
                  <LayoutGrid className="h-4 w-4 mr-1" />
                  Layout
                </Button>
              </TooltipTrigger>
              <TooltipContent>Auto-arrange nodes in a radial layout</TooltipContent>
            </Tooltip>
            {focusedBranchId ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    onClick={() => onFocusBranch(null)}
                    className="h-8 bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Exit Focus
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Return to full mind map view</TooltipContent>
              </Tooltip>
            ) : mainBranches.length > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Select value="" onValueChange={(id) => onFocusBranch(id)}>
                    <SelectTrigger className="h-8 w-32 border-dashed">
                      <Focus className="h-4 w-4 mr-1" />
                      <span className="text-xs">Focus</span>
                    </SelectTrigger>
                    <SelectContent>
                      {mainBranches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.text}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TooltipTrigger>
                <TooltipContent>Focus on a specific branch</TooltipContent>
              </Tooltip>
            )}
          </ToolbarGroup>

          <ToolbarDivider />

          {/* AI Group */}
          <ToolbarGroup>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onAIGenerate}
                  disabled={!hasSelection || isGenerating || isSuggesting}
                  className="h-8"
                >
                  <Sparkles className={`h-4 w-4 mr-1 ${isGenerating ? "animate-pulse text-purple-500" : ""}`} />
                  Expand
                </Button>
              </TooltipTrigger>
              <TooltipContent>AI generates child nodes for selected node</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onAISuggest}
                  disabled={isGenerating || isSuggesting || isGeneratingApp}
                  className="h-8"
                >
                  <Lightbulb className={`h-4 w-4 mr-1 ${isSuggesting ? "animate-pulse text-yellow-500" : ""}`} />
                  Suggest
                </Button>
              </TooltipTrigger>
              <TooltipContent>AI suggests new nodes based on context</TooltipContent>
            </Tooltip>
          </ToolbarGroup>

          <ToolbarDivider />

          {/* Diagrams Group */}
          <ToolbarGroup>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="ghost" onClick={onShowERD} className="h-8">
                  <Database className="h-4 w-4 mr-1" />
                  ERD
                </Button>
              </TooltipTrigger>
              <TooltipContent>View Entity Relationship Diagram</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="ghost" onClick={onShowWorkflows} className="h-8">
                  <Play className="h-4 w-4 mr-1" />
                  Flows
                </Button>
              </TooltipTrigger>
              <TooltipContent>Generate and view business workflows</TooltipContent>
            </Tooltip>
          </ToolbarGroup>

          <ToolbarDivider />

          {/* Generate App - Primary Action */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                onClick={onGenerateApp}
                disabled={isGenerating || isSuggesting || isGeneratingApp}
                className="h-8 bg-green-600 hover:bg-green-700"
              >
                <Rocket className={`h-4 w-4 mr-1 ${isGeneratingApp ? "animate-pulse" : ""}`} />
                Generate App
              </Button>
            </TooltipTrigger>
            <TooltipContent>Generate complete app specification from mind map</TooltipContent>
          </Tooltip>

          <div className="flex-1" />

          {/* Version Status */}
          {currentMindMap && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className={`${statusColors[currentMindMap.status || "draft"]} mr-2 cursor-default`}>
                  v{currentMindMap.version || 1}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>Current version: {currentMindMap.status || "draft"}</TooltipContent>
            </Tooltip>
          )}

          {/* Version Controls */}
          <ToolbarGroup>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="ghost" onClick={onShowHistory} className="h-8">
                  <History className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>View version history</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={onForkVersion}
                  disabled={isGenerating || isSuggesting || isGeneratingApp}
                  className="h-8"
                >
                  <GitFork className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Create a new version (fork)</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={onForkToTenant}
                  disabled={isGenerating || isSuggesting || isGeneratingApp}
                  className="h-8 text-indigo-600 hover:bg-indigo-50"
                >
                  <Building2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Fork this mind map to a tenant</TooltipContent>
            </Tooltip>
            {!isPublished && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={onPublishVersion}
                    disabled={isGenerating || isSuggesting || isGeneratingApp}
                    className="h-8 text-green-600 hover:bg-green-50"
                  >
                    <Lock className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Publish this version (locks editing)</TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={onShowBusinessContext} 
                  disabled={isPublished}
                  className="h-8"
                >
                  <FileText className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit business context & node suggestions</TooltipContent>
            </Tooltip>
          </ToolbarGroup>
        </div>
      </div>
    </TooltipProvider>
  );
}