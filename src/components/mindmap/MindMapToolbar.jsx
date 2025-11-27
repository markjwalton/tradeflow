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
import { Plus, Trash2, Link, LayoutGrid, FileText, Sparkles, Lightbulb, Rocket, GitFork, Lock, History, Database, Play, Building2 } from "lucide-react";

const nodeTypes = [
  { value: "central", label: "Central Topic" },
  { value: "main_branch", label: "Main Branch" },
  { value: "sub_branch", label: "Sub Branch" },
  { value: "feature", label: "Feature" },
  { value: "entity", label: "Entity" },
  { value: "page", label: "Page" },
  { value: "note", label: "Note" },
];

const colors = [
  { value: "#3b82f6", label: "Blue" },
  { value: "#10b981", label: "Green" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#ef4444", label: "Red" },
  { value: "#8b5cf6", label: "Purple" },
  { value: "#ec4899", label: "Pink" },
  { value: "#06b6d4", label: "Cyan" },
  { value: "#84cc16", label: "Lime" },
];

const statusColors = {
  draft: "bg-yellow-100 text-yellow-700",
  published: "bg-green-100 text-green-700",
  archived: "bg-gray-100 text-gray-700",
};

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
  selectedNodeType,
  onChangeNodeType,
  selectedColor,
  onChangeColor,
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
  selectedNodeIsEntity,
  onEditEntity,
}) {
  const isPublished = currentMindMap?.status === "published";
  return (
    <div className="flex flex-wrap items-center gap-2 p-2 bg-white border-b">
      <Button size="sm" onClick={onAddNode}>
        <Plus className="h-4 w-4 mr-1" />
        Add Node
      </Button>

      <Button
        size="sm"
        variant={isConnecting ? "default" : "outline"}
        onClick={onStartConnection}
      >
        <Link className="h-4 w-4 mr-1" />
        {isConnecting ? "Click Target" : "Connect"}
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={onDeleteSelected}
        disabled={!hasSelection}
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Delete
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={onAutoLayout}
      >
        <LayoutGrid className="h-4 w-4 mr-1" />
        Auto Layout
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={onAIGenerate}
        disabled={!hasSelection || isGenerating || isSuggesting}
      >
        <Sparkles className={`h-4 w-4 mr-1 ${isGenerating ? "animate-pulse" : ""}`} />
        {isGenerating ? "Generating..." : "AI Expand"}
      </Button>

      {selectedNodeIsEntity && (
        <Button
          size="sm"
          variant="outline"
          onClick={onEditEntity}
          className="text-purple-600 border-purple-200 hover:bg-purple-50"
        >
          <Database className="h-4 w-4 mr-1" />
          Edit Entity
        </Button>
      )}

      <Button
        size="sm"
        variant="outline"
        onClick={onShowERD}
      >
        <Database className="h-4 w-4 mr-1" />
        ERD
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={onShowWorkflows}
      >
        <Play className="h-4 w-4 mr-1" />
        Workflows
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={onAISuggest}
        disabled={isGenerating || isSuggesting || isGeneratingApp}
      >
        <Lightbulb className={`h-4 w-4 mr-1 ${isSuggesting ? "animate-pulse" : ""}`} />
        {isSuggesting ? "Suggesting..." : "AI Suggest"}
      </Button>

      <Button
        size="sm"
        variant="default"
        onClick={onGenerateApp}
        disabled={isGenerating || isSuggesting || isGeneratingApp}
        className="bg-green-600 hover:bg-green-700"
      >
        <Rocket className={`h-4 w-4 mr-1 ${isGeneratingApp ? "animate-pulse" : ""}`} />
        {isGeneratingApp ? "Generating..." : "Generate App"}
      </Button>

      <div className="w-px h-6 bg-gray-200 mx-2" />

      <Select value={selectedNodeType || ""} onValueChange={onChangeNodeType} disabled={!hasSelection}>
        <SelectTrigger className="w-36 h-8">
          <SelectValue placeholder="Node Type" />
        </SelectTrigger>
        <SelectContent>
          {nodeTypes.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedColor || ""} onValueChange={onChangeColor} disabled={!hasSelection}>
        <SelectTrigger className="w-28 h-8">
          <SelectValue placeholder="Color" />
        </SelectTrigger>
        <SelectContent>
          {colors.map((color) => (
            <SelectItem key={color.value} value={color.value}>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color.value }}
                />
                {color.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex-1" />

      {/* Version info and controls */}
      {currentMindMap && (
        <div className="flex items-center gap-2 mr-2">
          <Badge className={statusColors[currentMindMap.status || "draft"]}>
            v{currentMindMap.version || 1} - {currentMindMap.status || "draft"}
          </Badge>
        </div>
      )}

      <Button size="sm" variant="outline" onClick={onShowHistory}>
        <History className="h-4 w-4 mr-1" />
        History
      </Button>

      <Button 
        size="sm" 
        variant="outline" 
        onClick={onForkVersion}
        disabled={isGenerating || isSuggesting || isGeneratingApp}
      >
        <GitFork className="h-4 w-4 mr-1" />
        Fork
      </Button>

      <Button 
        size="sm" 
        variant="outline"
        onClick={onForkToTenant}
        disabled={isGenerating || isSuggesting || isGeneratingApp}
        className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
      >
        <Building2 className="h-4 w-4 mr-1" />
        Fork to Tenant
      </Button>

      {!isPublished && (
        <Button 
          size="sm" 
          variant="outline"
          onClick={onPublishVersion}
          disabled={isGenerating || isSuggesting || isGeneratingApp}
          className="text-green-600 border-green-200 hover:bg-green-50"
        >
          <Lock className="h-4 w-4 mr-1" />
          Publish
        </Button>
      )}

      <Button size="sm" variant="outline" onClick={onShowBusinessContext} disabled={isPublished}>
        <FileText className="h-4 w-4 mr-1" />
        Business Context
      </Button>
      </div>
  );
}