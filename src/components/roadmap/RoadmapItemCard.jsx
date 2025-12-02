import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  MoreVertical, Edit, Trash2, Star, Focus, ChevronDown, ChevronRight,
  Lightbulb, CheckCircle, Sparkles, Clock, MessageSquare, Bug
} from "lucide-react";

const categories = {
  idea: { label: "Idea", icon: Lightbulb, color: "bg-yellow-100 text-yellow-800" },
  requirement: { label: "Requirement", icon: CheckCircle, color: "bg-blue-100 text-blue-800" },
  feature: { label: "Feature", icon: Sparkles, color: "bg-purple-100 text-purple-800" },
  improvement: { label: "Improvement", icon: Clock, color: "bg-green-100 text-green-800" },
  bug_fix: { label: "Bug Fix", icon: Bug, color: "bg-red-100 text-red-800" },
  discussion_note: { label: "Discussion", icon: MessageSquare, color: "bg-gray-100 text-gray-800" },
};

const priorities = {
  low: { label: "Low", color: "bg-slate-100 text-slate-600" },
  medium: { label: "Medium", color: "bg-blue-100 text-blue-600" },
  high: { label: "High", color: "bg-orange-100 text-orange-600" },
  critical: { label: "Critical", color: "bg-red-100 text-red-600" },
};

export default function RoadmapItemCard({ 
  item, 
  onEdit, 
  onDelete, 
  onToggleStar, 
  onToggleFocus,
  journalCount = 0
}) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleViewJournal = () => {
    navigate(createPageUrl("RoadmapJournal") + `?item=${item.id}`);
  };
  const catInfo = categories[item.category] || categories.idea;
  const priInfo = priorities[item.priority] || priorities.medium;
  const CatIcon = catInfo.icon;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className={`hover:shadow-md transition-shadow ${item.is_focused ? "ring-2 ring-purple-500" : ""} ${item.is_starred ? "border-yellow-400" : ""}`}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CollapsibleTrigger className="flex items-center gap-2 text-left flex-1">
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <div className="flex items-center gap-2">
                {item.is_starred && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                {item.is_focused && <Focus className="h-4 w-4 text-purple-600" />}
                <CatIcon className="h-4 w-4" />
                <CardTitle className="text-base">{item.title}</CardTitle>
              </div>
            </CollapsibleTrigger>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onToggleStar(item)}>
                  <Star className={`h-4 w-4 mr-2 ${item.is_starred ? "fill-yellow-500 text-yellow-500" : ""}`} />
                  {item.is_starred ? "Unstar" : "Star"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleFocus(item)}>
                  <Focus className={`h-4 w-4 mr-2 ${item.is_focused ? "text-purple-600" : ""}`} />
                  {item.is_focused ? "Remove Focus" : "Set Focus"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleViewJournal}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Journal ({journalCount})
                  </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(item)}>
                                        <Edit className="h-4 w-4 mr-2" /> Edit
                                      </DropdownMenuItem>
                                      {onDelete && (
                                        <DropdownMenuItem className="text-red-600" onClick={() => onDelete(item.id)}>
                                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                                        </DropdownMenuItem>
                                      )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex flex-wrap gap-1 ml-6">
            <Badge className={catInfo.color}>{catInfo.label}</Badge>
            <Badge className={priInfo.color}>{priInfo.label}</Badge>
            {item.source === "ai_assistant" && (
              <Badge variant="outline" className="gap-1">
                <Sparkles className="h-3 w-3" /> AI
              </Badge>
            )}
            {journalCount > 0 && (
              <Badge variant="outline">{journalCount} entries</Badge>
            )}
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0">
            {item.description && (
              <p className="text-sm text-gray-600 mb-3">{item.description}</p>
            )}
            {item.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {item.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                ))}
              </div>
            )}
            {item.target_phase && (
              <p className="text-xs text-gray-500">Phase: {item.target_phase}</p>
            )}
            {item.notes && (
              <p className="text-xs text-gray-500 mt-2 italic">{item.notes}</p>
            )}
            <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={handleViewJournal}>
                  <MessageSquare className="h-3 w-3 mr-1" /> Journal
                </Button>
              </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}