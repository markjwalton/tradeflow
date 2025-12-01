import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Database, Loader2, Plus, Check } from "lucide-react";

const categoryColors = {
  Core: "bg-blue-100 text-blue-700",
  CRM: "bg-green-100 text-green-700",
  Finance: "bg-emerald-100 text-emerald-700",
  Operations: "bg-amber-100 text-amber-700",
  HR: "bg-purple-100 text-purple-700",
  Inventory: "bg-pink-100 text-pink-700",
  Communication: "bg-cyan-100 text-cyan-700",
  Custom: "bg-indigo-100 text-indigo-700",
  Other: "bg-gray-100 text-gray-700",
};

export default function AddFromLibraryDialog({
  open,
  onOpenChange,
  onAddEntity,
  existingEntityNames = [],
  isAdding,
}) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState([]);

  const { data: libraryEntities = [], isLoading } = useQuery({
    queryKey: ["libraryEntities"],
    queryFn: () => base44.entities.EntityTemplate.filter({ custom_project_id: null }),
    enabled: open,
  });

  const categories = [...new Set(libraryEntities.map(e => e.category).filter(Boolean))];

  const filteredEntities = libraryEntities.filter(entity => {
    const matchesSearch = !search || 
      entity.name?.toLowerCase().includes(search.toLowerCase()) ||
      entity.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || entity.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleAdd = () => {
    const selected = libraryEntities.filter(e => selectedIds.includes(e.id));
    onAddEntity(selected);
    setSelectedIds([]);
  };

  const alreadyExists = (name) => existingEntityNames.includes(name);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Add Entity from Library
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search entities..."
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ScrollArea className="h-80 border rounded-lg">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : filteredEntities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Database className="h-10 w-10 mb-2 opacity-30" />
              <p>No entities found</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredEntities.map(entity => {
                const exists = alreadyExists(entity.name);
                const isSelected = selectedIds.includes(entity.id);
                return (
                  <div
                    key={entity.id}
                    onClick={() => !exists && toggleSelect(entity.id)}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                      exists 
                        ? "opacity-50 cursor-not-allowed bg-gray-50" 
                        : isSelected 
                          ? "bg-blue-50 border-blue-300" 
                          : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{entity.name}</span>
                        {entity.category && (
                          <Badge className={`text-xs ${categoryColors[entity.category] || categoryColors.Other}`}>
                            {entity.category}
                          </Badge>
                        )}
                        {exists && (
                          <Badge variant="outline" className="text-xs">Already added</Badge>
                        )}
                      </div>
                      {entity.description && (
                        <p className="text-sm text-gray-500 mt-1">{entity.description}</p>
                      )}
                    </div>
                    {isSelected && !exists && (
                      <Check className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="flex items-center justify-between pt-4 border-t">
          <span className="text-sm text-gray-500">
            {selectedIds.length} selected
          </span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAdd} 
              disabled={selectedIds.length === 0 || isAdding}
            >
              {isAdding ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Add {selectedIds.length > 0 ? `(${selectedIds.length})` : ""}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}