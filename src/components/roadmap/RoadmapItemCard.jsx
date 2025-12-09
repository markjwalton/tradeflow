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
  idea: { label: "Idea", icon: Lightbulb, color: "bg-[var(--color-warning)]/20 text-[var(--color-warning-dark)]" },
  requirement: { label: "Requirement", icon: CheckCircle, color: "bg-[var(--color-info)]/20 text-[var(--color-info-dark)]" },
  feature: { label: "Feature", icon: Sparkles, color: "bg-[var(--color-accent)]/20 text-[var(--color-accent-dark)]" },
  improvement: { label: "Improvement", icon: Clock, color: "bg-[var(--color-success)]/20 text-[var(--color-success-dark)]" },
  bug_fix: { label: "Bug Fix", icon: Bug, color: "bg-[var(--color-destructive)]/20 text-[var(--color-destructive)]" },
  discussion_note: { label: "Discussion", icon: MessageSquare, color: "bg-[var(--color-charcoal)]/10 text-[var(--color-charcoal)]" },
};

const priorities = {
  low: { label: "Low", color: "bg-[var(--color-charcoal)]/10 text-[var(--color-charcoal)]" },
  medium: { label: "Medium", color: "bg-[var(--color-info)]/20 text-[var(--color-info-dark)]" },
  high: { label: "High", color: "bg-[var(--color-secondary)]/20 text-[var(--color-secondary-dark)]" },
  critical: { label: "Critical", color: "bg-[var(--color-destructive)]/20 text-[var(--color-destructive)]" },
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
      <Card className={`hover:shadow-md transition-shadow border-border ${item.is_focused ? "ring-2 ring-accent" : ""} ${item.is_starred ? "border-warning" : ""}`}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CollapsibleTrigger className="flex items-center gap-2 text-left flex-1">
              {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              <div className="flex items-center gap-2">
                {item.is_starred && <Star className="h-4 w-4 text-warning fill-warning" />}
                {item.is_focused && <Focus className="h-4 w-4 text-accent" />}
                <CatIcon className="h-4 w-4" />
                <CardTitle className="text-base text-foreground">{item.title}</CardTitle>
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
                  <Star className={`h-4 w-4 mr-2 ${item.is_starred ? "fill-warning text-warning" : ""}`} />
                  {item.is_starred ? "Unstar" : "Star"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleFocus(item)}>
                  <Focus className={`h-4 w-4 mr-2 ${item.is_focused ? "text-accent" : ""}`} />
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
                                        <DropdownMenuItem className="text-destructive" onClick={() => onDelete(item.id)}>
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
              <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
            )}
            {item.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {item.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                ))}
              </div>
            )}
            {item.target_phase && (
              <p className="text-xs text-muted-foreground">Phase: {item.target_phase}</p>
            )}
            {item.notes && (
              <p className="text-xs text-muted-foreground mt-2 italic">{item.notes}</p>
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