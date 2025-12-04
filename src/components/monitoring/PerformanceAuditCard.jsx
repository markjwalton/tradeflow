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
  low: "bg-blue-100 text-blue-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700"
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
    if (!grade) return "text-gray-600";
    if (grade.startsWith("A")) return "text-green-600";
    if (grade.startsWith("B")) return "text-blue-600";
    if (grade.startsWith("C")) return "text-amber-600";
    return "text-red-600";
  };

  const getGradeBgColor = (grade) => {
    if (!grade) return "bg-gray-50 border-gray-200";
    if (grade.startsWith("A")) return "bg-green-50 border-green-200";
    if (grade.startsWith("B")) return "bg-blue-50 border-blue-200";
    if (grade.startsWith("C")) return "bg-amber-50 border-amber-200";
    return "bg-red-50 border-red-200";
  };

  return (
    <Card className={`${isExpanded ? getGradeBgColor(review.grade) : ""} transition-all`}>
      {/* Collapsed Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-400" />
          )}
          
          {/* Grade Badge */}
          <div className={`text-2xl font-bold ${getGradeColor(review.grade)}`}>
            {review.grade || "?"}
          </div>
          
          {/* Info */}
          <div className="text-left">
            <div className="font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              AI Performance Review
            </div>
            <div className="text-sm text-gray-500">
              {reviewDate ? format(new Date(reviewDate), "MMM d, yyyy HH:mm") : "Recent"}
              {review.improvementPotential && ` • ${review.improvementPotential} improvement potential`}
            </div>
          </div>
        </div>
        
        {/* Summary Badges */}
        <div className="flex items-center gap-3">
          {openIssues.length > 0 && (
            <Badge className="bg-amber-100 text-amber-700">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {openIssues.length} Open Issues
            </Badge>
          )}
          {resolvedIssues.length > 0 && (
            <Badge className="bg-green-100 text-green-700">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {resolvedIssues.length} Fixed
            </Badge>
          )}
          {inRoadmapIssues.length > 0 && (
            <Badge className="bg-blue-100 text-blue-700">
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
            <div className="py-4 border-b">
              <p className="text-gray-700">{review.gradeExplanation}</p>
            </div>
          )}
          
          {/* Priority Areas */}
          {priorityAreas.length > 0 && (
            <div className="py-4 border-b">
              <h4 className="font-medium text-sm text-amber-700 flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4" />
                Priority Areas
              </h4>
              <div className="space-y-2">
                {priorityAreas.map((area, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                    <span className="font-bold text-amber-600">{i + 1}</span>
                    <div>
                      <p className="font-medium">{area.area}</p>
                      <p className="text-sm text-gray-600">{area.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Quick Wins & Long Term side by side */}
          {(quickWins.length > 0 || longTermImprovements.length > 0) && (
            <div className="py-4 border-b grid grid-cols-2 gap-4">
              {quickWins.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-green-700 flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Quick Wins
                  </h4>
                  <ul className="space-y-1">
                    {quickWins.map((win, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-3 w-3 text-green-600 mt-1 flex-shrink-0" />
                        {win}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {longTermImprovements.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-blue-700 flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4" />
                    Long-term Improvements
                  </h4>
                  <ul className="space-y-1">
                    {longTermImprovements.map((imp, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <TrendingUp className="h-3 w-3 text-blue-600 mt-1 flex-shrink-0" />
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
            <div className="py-3 border-b flex items-center gap-3 bg-blue-50 -mx-4 px-4">
              <span className="text-sm font-medium">{selectedRecs.size} selected</span>
              <Button 
                size="sm" 
                onClick={addSelectedToRoadmap}
                disabled={isAddingToRoadmap}
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
              <h4 className="font-medium text-sm text-gray-600 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-purple-600" />
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
                      inRoadmap ? "bg-green-50 border-green-200 opacity-75" : "bg-white border-gray-200"
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
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <Lightbulb className="h-5 w-5 text-purple-600" />
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <h5 className={`font-medium ${inRoadmap ? "line-through text-gray-500" : ""}`}>
                            {rec.title}
                          </h5>
                          <div className="flex items-center gap-2">
                            {rec.effort && <Badge variant="outline">Effort: {rec.effort}</Badge>}
                            {rec.impact && (
                              <Badge className={
                                rec.impact === "high" ? "bg-green-100 text-green-700" :
                                rec.impact === "medium" ? "bg-amber-100 text-amber-700" :
                                "bg-gray-100 text-gray-700"
                              }>
                                Impact: {rec.impact}
                              </Badge>
                            )}
                            {inRoadmap && (
                              <Badge className="bg-green-100 text-green-700">In Roadmap</Badge>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600">{rec.description}</p>
                        
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