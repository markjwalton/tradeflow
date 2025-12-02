import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { 
  Loader2, Brain, HelpCircle, Lightbulb, 
  MessageSquare, AlertTriangle, CheckCircle, Code,
  Zap, Save
} from "lucide-react";
import { toast } from "sonner";

const entryTypes = [
  { value: "brainstorming", label: "Brainstorming", icon: Brain, color: "bg-purple-100 text-purple-800 border-purple-300" },
  { value: "question", label: "Question", icon: HelpCircle, color: "bg-blue-100 text-blue-800 border-blue-300" },
  { value: "advice", label: "Advice", icon: MessageSquare, color: "bg-green-100 text-green-800 border-green-300" },
  { value: "idea", label: "Idea", icon: Lightbulb, color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  { value: "decision", label: "Decision", icon: CheckCircle, color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  { value: "update", label: "Update", icon: Code, color: "bg-gray-100 text-gray-800 border-gray-300" },
  { value: "blocker", label: "Blocker", icon: AlertTriangle, color: "bg-red-100 text-red-800 border-red-300" },
];

export default function QuickCapture({ isOpen, onClose }) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [entryType, setEntryType] = useState("update");
  const [selectedRoadmapItem, setSelectedRoadmapItem] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Remember last used roadmap item
  useEffect(() => {
    const lastItem = localStorage.getItem("quickCapture_lastRoadmapItem");
    if (lastItem) setSelectedRoadmapItem(lastItem);
  }, [isOpen]);

  const { data: roadmapItems = [] } = useQuery({
    queryKey: ["roadmapItems"],
    queryFn: () => base44.entities.RoadmapItem.list("-created_date"),
  });

  // Get focused item first, then starred items
  const sortedItems = [...roadmapItems].sort((a, b) => {
    if (a.is_focused && !b.is_focused) return -1;
    if (!a.is_focused && b.is_focused) return 1;
    if (a.is_starred && !b.is_starred) return -1;
    if (!a.is_starred && b.is_starred) return 1;
    return 0;
  });

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error("Please enter content");
      return;
    }
    if (!selectedRoadmapItem) {
      toast.error("Please select a roadmap item");
      return;
    }

    setIsSaving(true);
    try {
      await base44.entities.RoadmapJournal.create({
        roadmap_item_id: selectedRoadmapItem,
        content: content.trim(),
        entry_type: entryType,
        entry_date: new Date().toISOString()
      });

      localStorage.setItem("quickCapture_lastRoadmapItem", selectedRoadmapItem);
      queryClient.invalidateQueries({ queryKey: ["roadmapJournal"] });
      queryClient.invalidateQueries({ queryKey: ["allRoadmapJournals"] });
      toast.success("Saved to journal");
      setContent("");
      onClose();
    } catch (error) {
      toast.error("Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setContent("");
    onClose();
  };

  const selectedType = entryTypes.find(t => t.value === entryType);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Quick Capture
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Roadmap Item Selector */}
          <div>
            <label className="text-sm font-medium mb-2 block">Roadmap Item</label>
            <Select value={selectedRoadmapItem} onValueChange={setSelectedRoadmapItem}>
              <SelectTrigger>
                <SelectValue placeholder="Select item..." />
              </SelectTrigger>
              <SelectContent>
                {sortedItems.map(item => (
                  <SelectItem key={item.id} value={item.id}>
                    <div className="flex items-center gap-2">
                      {item.is_focused && <span className="text-purple-600">●</span>}
                      {item.is_starred && <span className="text-yellow-500">★</span>}
                      {item.title}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Entry Type Pills */}
          <div>
            <label className="text-sm font-medium mb-2 block">Type</label>
            <div className="flex flex-wrap gap-2">
              {entryTypes.map(type => {
                const Icon = type.icon;
                const isSelected = entryType === type.value;
                return (
                  <button
                    key={type.value}
                    onClick={() => setEntryType(type.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-all ${
                      isSelected 
                        ? type.color + " border-2 font-medium" 
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="text-sm font-medium mb-2 block">Content</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste or type your note..."
              rows={6}
              autoFocus
            />
          </div>

          {/* Save Button */}
          <Button 
            onClick={handleSave} 
            disabled={isSaving || !content.trim() || !selectedRoadmapItem}
            className="w-full"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save to Journal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}