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
    <div className="bg-white border-b">
      {/* Main Toolbar Row */}
      <div className="flex items-center gap-1 px-3 py-2">
        
        {/* Edit Group */}
        <ToolbarGroup>
          <Button size="sm" onClick={onAddNode} className="h-8">
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
          <Button
            size="sm"
            variant={isConnecting ? "default" : "ghost"}
            onClick={onStartConnection}
            className="h-8"
          >
            <Link className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onDeleteSelected}
            disabled={!hasSelection}
            className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </ToolbarGroup>

        <ToolbarDivider />

        {/* View Group */}
        <ToolbarGroup>
          <Button size="sm" variant="ghost" onClick={onAutoLayout} className="h-8">
            <LayoutGrid className="h-4 w-4 mr-1" />
            Layout
          </Button>
          {focusedBranchId ? (
            <Button
              size="sm"
              onClick={() => onFocusBranch(null)}
              className="h-8 bg-amber-500 hover:bg-amber-600 text-white"
            >
              <X className="h-4 w-4 mr-1" />
              Exit Focus
            </Button>
          ) : mainBranches.length > 0 && (
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
          )}
        </ToolbarGroup>

        <ToolbarDivider />

        {/* AI Group */}
        <ToolbarGroup>
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
        </ToolbarGroup>

        <ToolbarDivider />

        {/* Diagrams Group */}
        <ToolbarGroup>
          <Button size="sm" variant="ghost" onClick={onShowERD} className="h-8">
            <Database className="h-4 w-4 mr-1" />
            ERD
          </Button>
          <Button size="sm" variant="ghost" onClick={onShowWorkflows} className="h-8">
            <Play className="h-4 w-4 mr-1" />
            Flows
          </Button>
        </ToolbarGroup>

        <ToolbarDivider />

        {/* Generate App - Primary Action */}
        <Button
          size="sm"
          onClick={onGenerateApp}
          disabled={isGenerating || isSuggesting || isGeneratingApp}
          className="h-8 bg-green-600 hover:bg-green-700"
        >
          <Rocket className={`h-4 w-4 mr-1 ${isGeneratingApp ? "animate-pulse" : ""}`} />
          Generate App
        </Button>

        <div className="flex-1" />

        {/* Version Status */}
        {currentMindMap && (
          <Badge className={`${statusColors[currentMindMap.status || "draft"]} mr-2`}>
            v{currentMindMap.version || 1}
          </Badge>
        )}

        {/* Version Controls */}
        <ToolbarGroup>
          <Button size="sm" variant="ghost" onClick={onShowHistory} className="h-8">
            <History className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={onForkVersion}
            disabled={isGenerating || isSuggesting || isGeneratingApp}
            className="h-8"
          >
            <GitFork className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={onForkToTenant}
            disabled={isGenerating || isSuggesting || isGeneratingApp}
            className="h-8 text-indigo-600 hover:bg-indigo-50"
          >
            <Building2 className="h-4 w-4" />
          </Button>
          {!isPublished && (
            <Button 
              size="sm" 
              variant="ghost"
              onClick={onPublishVersion}
              disabled={isGenerating || isSuggesting || isGeneratingApp}
              className="h-8 text-green-600 hover:bg-green-50"
            >
              <Lock className="h-4 w-4" />
            </Button>
          )}
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={onShowBusinessContext} 
            disabled={isPublished}
            className="h-8"
          >
            <FileText className="h-4 w-4" />
          </Button>
        </ToolbarGroup>
      </div>
    </div>
  );
}