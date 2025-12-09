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
  info: "bg-muted text-muted-foreground",
  low: "bg-info-50 text-info",
  medium: "bg-warning/10 text-warning",
  high: "bg-accent-100 text-accent",
  critical: "bg-destructive-50 text-destructive",
  warning: "bg-warning/10 text-warning"
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
    <Card className={`${isExpanded ? getGradeBgColor(audit.grade) : ""} transition-all`}>
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
          <div className={`text-2xl font-bold ${getGradeColor(audit.grade)}`}>
            {audit.grade || "?"}
          </div>
          
          {/* Score */}
          <div className="text-left">
            <div className="font-medium text-[var(--color-midnight)]">
              {audit.audit_type === "ai_review" ? "AI Security Audit" : "Security Audit"}
            </div>
            <div className="text-sm text-[var(--color-charcoal)]">
              Score: {audit.overall_score}/100 • {format(new Date(audit.audit_date), "MMM d, yyyy HH:mm")}
            </div>
          </div>
        </div>
        
        {/* Summary Badges */}
        <div className="flex items-center gap-3">
          {/* Issue counts */}
          {openFindings.length > 0 && (
            <Badge className="bg-[var(--color-warning)]/20 text-[var(--color-warning-dark)]">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {openFindings.length} Open
            </Badge>
          )}
          {resolvedFindings.length > 0 && (
            <Badge className="bg-[var(--color-success)]/20 text-[var(--color-success-dark)]">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {resolvedFindings.length} Fixed
            </Badge>
          )}
          {inRoadmapFindings.length > 0 && (
            <Badge className="bg-[var(--color-info)]/20 text-[var(--color-info-dark)]">
              <Flag className="h-3 w-3 mr-1" />
              {inRoadmapFindings.length} In Roadmap
            </Badge>
          )}
          {findings.length === 0 && (
            <Badge className="bg-[var(--color-success)]/20 text-[var(--color-success-dark)]">
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
            <div className="py-4 border-b border-[var(--color-background-muted)]">
              <p className="text-[var(--color-charcoal)]">{audit.ai_summary}</p>
            </div>
          )}
          
          {/* Bulk Actions */}
          {selectedFindings.size > 0 && (
            <div className="py-3 border-b border-[var(--color-background-muted)] flex items-center gap-3 bg-[var(--color-info)]/10 -mx-4 px-4">
              <span className="text-sm font-medium">{selectedFindings.size} selected</span>
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
                onClick={() => setSelectedFindings(new Set())}
              >
                Clear
              </Button>
            </div>
          )}
          
          {/* Findings List */}
          {sortedFindings.length > 0 && (
            <div className="mt-4 space-y-3">
              <h4 className="font-medium text-sm text-[var(--color-charcoal)] flex items-center justify-between">
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
                      fixed ? "bg-[var(--color-success)]/10 border-[var(--color-success)]/30 opacity-75" :
                      finding.severity === "critical" ? "bg-[var(--color-destructive)]/10 border-[var(--color-destructive)]/30" :
                      finding.severity === "high" ? "bg-[var(--color-secondary)]/10 border-[var(--color-secondary)]/30" :
                      "bg-[var(--color-background-paper)] border-[var(--color-background-muted)]"
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
                          <CheckCircle2 className="h-5 w-5 text-[var(--color-success)]" />
                        ) : inRoadmap ? (
                          <Clock className="h-5 w-5 text-[var(--color-info)]" />
                        ) : finding.severity === "critical" || finding.severity === "high" ? (
                          <XCircle className="h-5 w-5 text-[var(--color-destructive)]" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-[var(--color-warning)]" />
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <h5 className={`font-medium ${fixed ? "line-through text-[var(--color-charcoal)]" : "text-[var(--color-midnight)]"}`}>
                            {finding.title}
                          </h5>
                          <div className="flex items-center gap-2">
                            <Badge className={severityColors[finding.severity]}>
                              {finding.severity}
                            </Badge>
                            {fixed && (
                              <Badge className="bg-[var(--color-success)]/20 text-[var(--color-success-dark)]">Fixed</Badge>
                            )}
                            {inRoadmap && !fixed && (
                              <Badge className="bg-[var(--color-info)]/20 text-[var(--color-info-dark)]">
                                <Flag className="h-3 w-3 mr-1" />
                                In Roadmap
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm text-[var(--color-charcoal)] mb-2">{finding.description}</p>
                        
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
              <h4 className="font-medium text-sm text-[var(--color-charcoal)] mb-2">Recommendations</h4>
              <ul className="space-y-2">
                {audit.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-midnight)]">
                    <CheckCircle2 className="h-4 w-4 text-[var(--color-success)] mt-0.5 flex-shrink-0" />
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