import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ChevronDown, ChevronRight, AlertTriangle, CheckCircle2, 
  Flag, Lightbulb, Clock, XCircle, Loader2, Sparkles, TrendingUp
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const severityColors = {
  low: "bg-info-50 text-info",
  medium: "bg-warning/10 text-warning",
  high: "bg-accent-100 text-accent",
  critical: "bg-destructive-50 text-destructive"
};

const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };

/**
 * PerformanceAuditCard - Collapsible performance review with roadmap integration
 * 
 * Props:
 * - review: AI review object with grade, recommendations, etc.
 * - issues: related performance issues
 * - onAddToRoadmap: callback to add recommendation to roadmap
 * - roadmapItems: array of existing roadmap items
 * - isAddingToRoadmap: boolean
 * - defaultExpanded: boolean
 * - reviewDate: when the review was generated
 */
export default function PerformanceAuditCard({ 
  review,
  issues = [],
  onAddToRoadmap, 
  roadmapItems = [],
  isAddingToRoadmap = false,
  defaultExpanded = false,
  reviewDate
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [selectedRecs, setSelectedRecs] = useState(new Set());

  if (!review) return null;

  const recommendations = review.recommendations || [];
  const priorityAreas = review.priorityAreas || [];
  const quickWins = review.quickWins || [];
  const longTermImprovements = review.longTermImprovements || [];

  // Count issues by status
  const openIssues = issues.filter(i => i.status === "open");
  const resolvedIssues = issues.filter(i => i.status === "resolved");
  const inRoadmapIssues = issues.filter(i => i.roadmap_item_id);

  // Check if recommendation is in roadmap
  const isInRoadmap = (recTitle) => {
    return roadmapItems.some(r => r.title?.includes(recTitle) || r.notes?.includes(recTitle));
  };

  const toggleRec = (index) => {
    setSelectedRecs(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const addSelectedToRoadmap = () => {
    selectedRecs.forEach(index => {
      const rec = recommendations[index];
      if (rec && onAddToRoadmap) {
        onAddToRoadmap(rec);
      }
    });
    setSelectedRecs(new Set());
  };

  // Grade colors
  const getGradeColor = (grade) => {
    if (!grade) return "text-[var(--color-charcoal)]";
    if (grade.startsWith("A")) return "text-[var(--color-success)]";
    if (grade.startsWith("B")) return "text-[var(--color-info)]";
    if (grade.startsWith("C")) return "text-[var(--color-warning)]";
    return "text-[var(--color-destructive)]";
  };

  const getGradeBgColor = (grade) => {
    if (!grade) return "bg-[var(--color-background)] border-[var(--color-background-muted)]";
    if (grade.startsWith("A")) return "bg-[var(--color-success)]/10 border-[var(--color-success)]/30";
    if (grade.startsWith("B")) return "bg-[var(--color-info)]/10 border-[var(--color-info)]/30";
    if (grade.startsWith("C")) return "bg-[var(--color-warning)]/10 border-[var(--color-warning)]/30";
    return "bg-[var(--color-destructive)]/10 border-[var(--color-destructive)]/30";
  };

  return (
    <Card className={`${isExpanded ? getGradeBgColor(review.grade) : ""} transition-all`}>
      {/* Collapsed Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-[var(--color-background)]/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-[var(--color-charcoal)]" />
          ) : (
            <ChevronRight className="h-5 w-5 text-[var(--color-charcoal)]" />
          )}
          
          {/* Grade Badge */}
          <div className={`text-2xl font-bold ${getGradeColor(review.grade)}`}>
            {review.grade || "?"}
          </div>
          
          {/* Info */}
          <div className="text-left">
            <div className="font-medium flex items-center gap-2 text-[var(--color-midnight)]">
              <Sparkles className="h-4 w-4 text-[var(--color-accent)]" />
              AI Performance Review
            </div>
            <div className="text-sm text-[var(--color-charcoal)]">
              {reviewDate ? format(new Date(reviewDate), "MMM d, yyyy HH:mm") : "Recent"}
              {review.improvementPotential && ` • ${review.improvementPotential} improvement potential`}
            </div>
          </div>
        </div>
        
        {/* Summary Badges */}
        <div className="flex items-center gap-3">
          {openIssues.length > 0 && (
            <Badge className="bg-[var(--color-warning)]/20 text-[var(--color-warning-dark)]">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {openIssues.length} Open Issues
            </Badge>
          )}
          {resolvedIssues.length > 0 && (
            <Badge className="bg-[var(--color-success)]/20 text-[var(--color-success-dark)]">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {resolvedIssues.length} Fixed
            </Badge>
          )}
          {inRoadmapIssues.length > 0 && (
            <Badge className="bg-[var(--color-info)]/20 text-[var(--color-info-dark)]">
              <Flag className="h-3 w-3 mr-1" />
              {inRoadmapIssues.length} In Roadmap
            </Badge>
          )}
          {recommendations.length > 0 && (
            <Badge variant="outline">
              {recommendations.length} Recommendations
            </Badge>
          )}
        </div>
      </button>
      
      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t px-4 pb-4">
          {/* Summary */}
          {review.gradeExplanation && (
            <div className="py-4 border-b border-[var(--color-background-muted)]">
              <p className="text-[var(--color-charcoal)]">{review.gradeExplanation}</p>
            </div>
          )}
          
          {/* Priority Areas */}
          {priorityAreas.length > 0 && (
            <div className="py-4 border-b border-[var(--color-background-muted)]">
              <h4 className="font-medium text-sm text-[var(--color-warning-dark)] flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4" />
                Priority Areas
              </h4>
              <div className="space-y-2">
                {priorityAreas.map((area, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-[var(--color-warning)]/10 rounded-lg">
                    <span className="font-bold text-[var(--color-warning)]">{i + 1}</span>
                    <div>
                      <p className="font-medium text-[var(--color-midnight)]">{area.area}</p>
                      <p className="text-sm text-[var(--color-charcoal)]">{area.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Quick Wins & Long Term side by side */}
          {(quickWins.length > 0 || longTermImprovements.length > 0) && (
            <div className="py-4 border-b border-[var(--color-background-muted)] grid grid-cols-2 gap-4">
              {quickWins.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-[var(--color-success-dark)] flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Quick Wins
                  </h4>
                  <ul className="space-y-1">
                    {quickWins.map((win, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-midnight)]">
                        <CheckCircle2 className="h-3 w-3 text-[var(--color-success)] mt-1 flex-shrink-0" />
                        {win}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {longTermImprovements.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-[var(--color-info-dark)] flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4" />
                    Long-term Improvements
                  </h4>
                  <ul className="space-y-1">
                    {longTermImprovements.map((imp, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-midnight)]">
                        <TrendingUp className="h-3 w-3 text-[var(--color-info)] mt-1 flex-shrink-0" />
                        {imp}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {/* Bulk Actions */}
          {selectedRecs.size > 0 && (
            <div className="py-3 border-b border-[var(--color-background-muted)] flex items-center gap-3 bg-[var(--color-info)]/10 -mx-4 px-4">
              <span className="text-sm font-medium text-[var(--color-midnight)]">{selectedRecs.size} selected</span>
              <Button 
                size="sm" 
                onClick={addSelectedToRoadmap}
                disabled={isAddingToRoadmap}
                className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white"
              >
                {isAddingToRoadmap ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Flag className="h-3 w-3 mr-1" />
                )}
                Add to Roadmap
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => setSelectedRecs(new Set())}
              >
                Clear
              </Button>
            </div>
          )}
          
          {/* Detailed Recommendations */}
          {recommendations.length > 0 && (
            <div className="mt-4 space-y-3">
              <h4 className="font-medium text-sm text-[var(--color-charcoal)] flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-[var(--color-accent)]" />
                  Detailed Recommendations ({recommendations.length})
                </span>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => {
                    const unaddedIndexes = recommendations
                      .map((r, i) => (!isInRoadmap(r.title) ? i : -1))
                      .filter(i => i >= 0);
                    setSelectedRecs(new Set(unaddedIndexes));
                  }}
                >
                  Select All
                </Button>
              </h4>
              
              {recommendations.map((rec, index) => {
                const inRoadmap = isInRoadmap(rec.title);
                
                return (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg border ${
                      inRoadmap ? "bg-[var(--color-success)]/10 border-[var(--color-success)]/30 opacity-75" : "bg-[var(--color-background-paper)] border-[var(--color-background-muted)]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      {!inRoadmap && (
                        <Checkbox
                          checked={selectedRecs.has(index)}
                          onCheckedChange={() => toggleRec(index)}
                          className="mt-1"
                        />
                      )}
                      
                      {/* Status icon */}
                      <div className="mt-0.5">
                        {inRoadmap ? (
                          <CheckCircle2 className="h-5 w-5 text-[var(--color-success)]" />
                        ) : (
                          <Lightbulb className="h-5 w-5 text-[var(--color-accent)]" />
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <h5 className={`font-medium ${inRoadmap ? "line-through text-[var(--color-charcoal)]" : "text-[var(--color-midnight)]"}`}>
                            {rec.title}
                          </h5>
                          <div className="flex items-center gap-2">
                            {rec.effort && <Badge variant="outline">Effort: {rec.effort}</Badge>}
                            {rec.impact && (
                              <Badge className={
                                rec.impact === "high" ? "bg-[var(--color-success)]/20 text-[var(--color-success-dark)]" :
                                rec.impact === "medium" ? "bg-[var(--color-warning)]/20 text-[var(--color-warning-dark)]" :
                                "bg-[var(--color-charcoal)]/10 text-[var(--color-charcoal)]"
                              }>
                                Impact: {rec.impact}
                              </Badge>
                            )}
                            {inRoadmap && (
                              <Badge className="bg-[var(--color-success)]/20 text-[var(--color-success-dark)]">In Roadmap</Badge>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm text-[var(--color-charcoal)]">{rec.description}</p>
                        
                        {/* Add to Roadmap button */}
                        {!inRoadmap && onAddToRoadmap && (
                          <div className="mt-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => onAddToRoadmap(rec)}
                              disabled={isAddingToRoadmap}
                            >
                              {isAddingToRoadmap ? (
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              ) : (
                                <Lightbulb className="h-3 w-3 mr-1" />
                              )}
                              Add to Roadmap
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}