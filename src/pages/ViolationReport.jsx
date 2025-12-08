import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Sparkles, Check, X, Edit, BookOpen, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function ViolationReport() {
  const [analyzing, setAnalyzing] = useState(false);
  const [patterns, setPatterns] = useState([]);
  const [editingPattern, setEditingPattern] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  const queryClient = useQueryClient();

  // Fetch learned patterns from DB
  const { data: learnedPatterns = [] } = useQuery({
    queryKey: ['cssPatterns'],
    queryFn: () => base44.entities.CSSPattern?.list() || []
  });

  const handleAnalyze = async () => {
    setAnalyzing(true);
    
    try {
      // Fetch priority files to extract patterns
      const filesToAnalyze = [
        "Layout.js",
        "pages/Dashboard.jsx",
        "pages/ComponentShowcase.jsx",
        "components/library/designTokens.js",
        "components/ui/card.jsx",
        "globals.css"
      ];
      
      let fileContents = {};
      for (const file of filesToAnalyze) {
        try {
          const response = await fetch(`/src/${file}`);
          if (response.ok) {
            fileContents[file] = await response.text();
          }
        } catch (e) {
          console.log(`Could not fetch ${file}`);
        }
      }

      // Extract all CSS patterns using AI
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Extract ALL CSS/style patterns from these files. For each unique pattern found, determine if it's a verified design token or needs refactoring.

FILES TO ANALYZE:
${Object.entries(fileContents).map(([path, content]) => `
=== ${path} ===
${content.substring(0, 10000)}
===
`).join('\n')}

DESIGN TOKEN STANDARDS:
- Colors: var(--color-primary), bg-primary, text-muted-foreground
- Spacing: var(--spacing-4), p-4, gap-4
- Typography: font-display, text-lg, font-medium
- Fonts: degular-display, mrs-eaves-xl-serif-narrow (unquoted)

For EACH unique pattern found, extract:
1. The actual code pattern (e.g., "className='text-gray-500'", "color: #4A5D4E")
2. Where it was found (file + approximate location)
3. Classification: "verified" (follows design tokens) or "violation" (needs refactoring)
4. If violation: severity (critical/high/medium/low)
5. If violation: suggested fix
6. Category (color/spacing/typography/layout/other)

Return ALL unique patterns found, grouped by classification.`,
        response_json_schema: {
          type: "object",
          properties: {
            verified_patterns: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  pattern: { type: "string" },
                  category: { type: "string" },
                  found_in: { type: "array", items: { type: "string" } },
                  occurrences: { type: "number" }
                }
              }
            },
            violations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  pattern: { type: "string" },
                  category: { type: "string" },
                  severity: { type: "string" },
                  found_in: { type: "array", items: { type: "string" } },
                  occurrences: { type: "number" },
                  issue: { type: "string" },
                  suggested_fix: { type: "string" }
                }
              }
            },
            summary: {
              type: "object",
              properties: {
                total_patterns: { type: "number" },
                verified_count: { type: "number" },
                violation_count: { type: "number" }
              }
            }
          }
        }
      });

      // Combine and format patterns
      const allPatterns = [
        ...result.verified_patterns.map(p => ({
          ...p,
          status: 'verified',
          id: Math.random().toString(36).substr(2, 9)
        })),
        ...result.violations.map(p => ({
          ...p,
          status: 'violation',
          id: Math.random().toString(36).substr(2, 9)
        }))
      ];

      setPatterns(allPatterns);
      toast.success(`Found ${allPatterns.length} unique patterns`);
    } catch (error) {
      toast.error("Analysis failed: " + error.message);
    }
    
    setAnalyzing(false);
  };

  const handleConfirmPattern = async (pattern) => {
    try {
      // Save confirmed pattern to database for learning
      await base44.entities.CSSPattern.create({
        pattern: pattern.pattern,
        category: pattern.category,
        status: pattern.status,
        severity: pattern.severity || null,
        found_in: pattern.found_in,
        occurrences: pattern.occurrences,
        suggested_fix: pattern.suggested_fix || null,
        confirmed_by_user: true,
        confirmed_date: new Date().toISOString()
      });
      
      toast.success("Pattern confirmed and stored");
      queryClient.invalidateQueries({ queryKey: ['cssPatterns'] });
      
      // Remove from current list
      setPatterns(prev => prev.filter(p => p.id !== pattern.id));
    } catch (error) {
      toast.error("Failed to save pattern: " + error.message);
    }
  };

  const handleEditPattern = (pattern) => {
    setEditingPattern({ ...pattern });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      await base44.entities.CSSPattern.create({
        ...editingPattern,
        confirmed_by_user: true,
        confirmed_date: new Date().toISOString(),
        user_modified: true
      });
      
      toast.success("Pattern saved with your changes");
      queryClient.invalidateQueries({ queryKey: ['cssPatterns'] });
      
      setPatterns(prev => prev.filter(p => p.id !== editingPattern.id));
      setEditDialogOpen(false);
      setEditingPattern(null);
    } catch (error) {
      toast.error("Failed to save: " + error.message);
    }
  };

  const handleRejectPattern = (pattern) => {
    setPatterns(prev => prev.filter(p => p.id !== pattern.id));
    toast.success("Pattern rejected");
  };

  const statusColors = {
    verified: "bg-green-100 text-green-800 border-green-200",
    violation: "bg-red-100 text-red-800 border-red-200"
  };

  const severityColors = {
    critical: "bg-destructive text-white",
    high: "bg-warning text-white",
    medium: "bg-info text-white",
    low: "bg-muted text-muted-foreground"
  };

  const categoryIcons = {
    color: "🎨",
    spacing: "📏",
    typography: "✍️",
    layout: "📐",
    other: "🔧"
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-light font-display text-midnight">
            Interactive Violation Report
          </h1>
          <p className="text-muted-foreground mt-1">
            AI extracts patterns, you confirm or refine them for learning
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => window.location.href = '/learned-patterns'}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            View Learned Patterns ({learnedPatterns.length})
          </Button>
          <Button onClick={handleAnalyze} disabled={analyzing}>
            {analyzing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {analyzing ? "Analyzing..." : "Extract Patterns"}
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      {patterns.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{patterns.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Verified</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">
                {patterns.filter(p => p.status === 'verified').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Violations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">
                {patterns.filter(p => p.status === 'violation').length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pattern List */}
      {patterns.length > 0 && (
        <div className="space-y-3">
          {patterns.map((pattern) => (
            <Card key={pattern.id} className="border-l-4" style={{
              borderLeftColor: pattern.status === 'verified' ? 'var(--color-success)' : 'var(--color-destructive)'
            }}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{categoryIcons[pattern.category] || categoryIcons.other}</span>
                      <Badge className={statusColors[pattern.status]}>
                        {pattern.status === 'verified' ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
                        {pattern.status}
                      </Badge>
                      {pattern.severity && (
                        <Badge className={severityColors[pattern.severity]}>
                          {pattern.severity}
                        </Badge>
                      )}
                      <Badge variant="outline" className="font-mono text-xs">
                        {pattern.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {pattern.occurrences}x occurrences
                      </span>
                    </div>
                    
                    <code className="block bg-muted p-2 rounded text-sm font-mono mb-2">
                      {pattern.pattern}
                    </code>
                    
                    {pattern.issue && (
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Issue:</strong> {pattern.issue}
                      </p>
                    )}
                    
                    {pattern.suggested_fix && (
                      <div className="mt-2">
                        <p className="text-xs text-success mb-1">Suggested Fix:</p>
                        <code className="block bg-success/10 p-2 rounded text-sm font-mono">
                          {pattern.suggested_fix}
                        </code>
                      </div>
                    )}
                    
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground">
                        Found in: {pattern.found_in?.slice(0, 3).map(f => typeof f === 'string' ? f : JSON.stringify(f)).join(", ") || 'N/A'}
                        {pattern.found_in?.length > 3 && ` +${pattern.found_in.length - 3} more`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditPattern(pattern)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleConfirmPattern(pattern)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRejectPattern(pattern)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <AlertDialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Pattern Classification</AlertDialogTitle>
            <AlertDialogDescription>
              Refine the AI's analysis before storing this pattern
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {editingPattern && (
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Pattern</label>
                <Textarea
                  value={editingPattern.pattern}
                  onChange={(e) => setEditingPattern({...editingPattern, pattern: e.target.value})}
                  className="font-mono"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select
                    value={editingPattern.status}
                    onValueChange={(value) => setEditingPattern({...editingPattern, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="violation">Violation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select
                    value={editingPattern.category}
                    onValueChange={(value) => setEditingPattern({...editingPattern, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="color">Color</SelectItem>
                      <SelectItem value="spacing">Spacing</SelectItem>
                      <SelectItem value="typography">Typography</SelectItem>
                      <SelectItem value="layout">Layout</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {editingPattern.status === 'violation' && (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Severity</label>
                    <Select
                      value={editingPattern.severity}
                      onValueChange={(value) => setEditingPattern({...editingPattern, severity: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Issue Description</label>
                    <Textarea
                      value={editingPattern.issue || ''}
                      onChange={(e) => setEditingPattern({...editingPattern, issue: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Suggested Fix</label>
                    <Textarea
                      value={editingPattern.suggested_fix || ''}
                      onChange={(e) => setEditingPattern({...editingPattern, suggested_fix: e.target.value})}
                      className="font-mono"
                    />
                  </div>
                </>
              )}
            </div>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveEdit}>
              Save Pattern
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {!analyzing && patterns.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <Sparkles className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Ready to Extract Patterns</h3>
            <p className="text-muted-foreground">
              Click "Extract Patterns" to analyze your code and let AI identify all CSS patterns
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}