import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ChevronDown, ChevronRight, AlertTriangle, CheckCircle2, 
  Flag, Lightbulb, Clock, XCircle, Loader2
} from "lucide-react";
import { format } from "date-fns";

const severityColors = {
  info: "bg-gray-100 text-gray-700",
  low: "bg-blue-100 text-blue-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
  warning: "bg-amber-100 text-amber-700"
};

const severityOrder = { critical: 0, high: 1, medium: 2, warning: 3, low: 4, info: 5 };

/**
 * AuditLogCard - Collapsible audit log with roadmap integration
 * 
 * Props:
 * - audit: audit record with findings, score, grade, etc.
 * - onAddToRoadmap: callback(finding) to add finding to roadmap
 * - roadmapItems: array of existing roadmap items to check if fixed
 * - isAddingToRoadmap: boolean
 * - defaultExpanded: boolean
 */
export default function AuditLogCard({ 
  audit, 
  onAddToRoadmap, 
  roadmapItems = [],
  isAddingToRoadmap = false,
  defaultExpanded = false 
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [selectedFindings, setSelectedFindings] = useState(new Set());

  if (!audit) return null;

  const findings = audit.findings || [];
  
  // Count findings by status
  const openFindings = findings.filter(f => f.status !== "resolved" && f.status !== "fixed");
  const resolvedFindings = findings.filter(f => f.status === "resolved" || f.status === "fixed");
  const inRoadmapFindings = findings.filter(f => f.roadmap_item_id);
  
  // Check if finding is linked to a completed roadmap item
  const isFixed = (finding) => {
    if (finding.status === "resolved" || finding.status === "fixed") return true;
    if (finding.roadmap_item_id) {
      const roadmapItem = roadmapItems.find(r => r.id === finding.roadmap_item_id);
      return roadmapItem?.status === "completed";
    }
    return false;
  };

  // Sort findings by severity
  const sortedFindings = [...findings].sort((a, b) => 
    (severityOrder[a.severity] ?? 99) - (severityOrder[b.severity] ?? 99)
  );

  const toggleFinding = (index) => {
    setSelectedFindings(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const addSelectedToRoadmap = () => {
    selectedFindings.forEach(index => {
      const finding = sortedFindings[index];
      if (finding && !finding.roadmap_item_id && onAddToRoadmap) {
        onAddToRoadmap(finding, audit.id);
      }
    });
    setSelectedFindings(new Set());
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
    <Card className={`${isExpanded ? getGradeBgColor(audit.grade) : ""} transition-all`}>
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
          <div className={`text-2xl font-bold ${getGradeColor(audit.grade)}`}>
            {audit.grade || "?"}
          </div>
          
          {/* Score */}
          <div className="text-left">
            <div className="font-medium">
              {audit.audit_type === "ai_review" ? "AI Security Audit" : "Security Audit"}
            </div>
            <div className="text-sm text-gray-500">
              Score: {audit.overall_score}/100 • {format(new Date(audit.audit_date), "MMM d, yyyy HH:mm")}
            </div>
          </div>
        </div>
        
        {/* Summary Badges */}
        <div className="flex items-center gap-3">
          {/* Issue counts */}
          {openFindings.length > 0 && (
            <Badge className="bg-amber-100 text-amber-700">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {openFindings.length} Open
            </Badge>
          )}
          {resolvedFindings.length > 0 && (
            <Badge className="bg-green-100 text-green-700">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {resolvedFindings.length} Fixed
            </Badge>
          )}
          {inRoadmapFindings.length > 0 && (
            <Badge className="bg-blue-100 text-blue-700">
              <Flag className="h-3 w-3 mr-1" />
              {inRoadmapFindings.length} In Roadmap
            </Badge>
          )}
          {findings.length === 0 && (
            <Badge className="bg-green-100 text-green-700">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              No Issues
            </Badge>
          )}
        </div>
      </button>
      
      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t px-4 pb-4">
          {/* Summary */}
          {audit.ai_summary && (
            <div className="py-4 border-b">
              <p className="text-gray-700">{audit.ai_summary}</p>
            </div>
          )}
          
          {/* Bulk Actions */}
          {selectedFindings.size > 0 && (
            <div className="py-3 border-b flex items-center gap-3 bg-blue-50 -mx-4 px-4">
              <span className="text-sm font-medium">{selectedFindings.size} selected</span>
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
                onClick={() => setSelectedFindings(new Set())}
              >
                Clear
              </Button>
            </div>
          )}
          
          {/* Findings List */}
          {sortedFindings.length > 0 && (
            <div className="mt-4 space-y-3">
              <h4 className="font-medium text-sm text-gray-600 flex items-center justify-between">
                <span>Findings ({findings.length})</span>
                {openFindings.length > 0 && (
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => {
                      const openIndexes = sortedFindings
                        .map((f, i) => (!isFixed(f) && !f.roadmap_item_id ? i : -1))
                        .filter(i => i >= 0);
                      setSelectedFindings(new Set(openIndexes));
                    }}
                  >
                    Select All Open
                  </Button>
                )}
              </h4>
              
              {sortedFindings.map((finding, index) => {
                const fixed = isFixed(finding);
                const inRoadmap = !!finding.roadmap_item_id;
                
                return (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg border ${
                      fixed ? "bg-green-50 border-green-200 opacity-75" :
                      finding.severity === "critical" ? "bg-red-50 border-red-200" :
                      finding.severity === "high" ? "bg-orange-50 border-orange-200" :
                      "bg-white border-gray-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox for selection */}
                      {!fixed && !inRoadmap && (
                        <Checkbox
                          checked={selectedFindings.has(index)}
                          onCheckedChange={() => toggleFinding(index)}
                          className="mt-1"
                        />
                      )}
                      
                      {/* Status icon */}
                      <div className="mt-0.5">
                        {fixed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : inRoadmap ? (
                          <Clock className="h-5 w-5 text-blue-600" />
                        ) : finding.severity === "critical" || finding.severity === "high" ? (
                          <XCircle className="h-5 w-5 text-red-600" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-amber-600" />
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <h5 className={`font-medium ${fixed ? "line-through text-gray-500" : ""}`}>
                            {finding.title}
                          </h5>
                          <div className="flex items-center gap-2">
                            <Badge className={severityColors[finding.severity]}>
                              {finding.severity}
                            </Badge>
                            {fixed && (
                              <Badge className="bg-green-100 text-green-700">Fixed</Badge>
                            )}
                            {inRoadmap && !fixed && (
                              <Badge className="bg-blue-100 text-blue-700">
                                <Flag className="h-3 w-3 mr-1" />
                                In Roadmap
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{finding.description}</p>
                        
                        {finding.recommendation && (
                          <div className="bg-white/80 p-2 rounded text-sm">
                            <strong>Recommendation:</strong> {finding.recommendation}
                          </div>
                        )}
                        
                        {/* Add to Roadmap button for individual items */}
                        {!fixed && !inRoadmap && onAddToRoadmap && (
                          <div className="mt-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => onAddToRoadmap(finding, audit.id)}
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
          
          {/* Recommendations */}
          {audit.recommendations?.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-sm text-gray-600 mb-2">Recommendations</h4>
              <ul className="space-y-2">
                {audit.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}