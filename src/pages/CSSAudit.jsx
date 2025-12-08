import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Loader2, AlertTriangle, CheckCircle2, ChevronDown, ChevronRight, FileCode, Sparkles, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export default function CSSAudit() {
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState(null);
  const [expandedFiles, setExpandedFiles] = useState({});
  const [copiedReport, setCopiedReport] = useState(false);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a CSS/design token auditor. Analyze the following codebase for design token violations.

FILES TO AUDIT:
1. Layout.js - Main layout component
2. Dashboard.jsx - Dashboard page with hardcoded colors like #4A5D4E, #D4A574, #5a7a8b, #d9b4a7, #eceae5
3. ComponentShowcase.jsx - Multiple hardcoded hex colors throughout
4. components/library/designTokens.js - Font definitions with wrong format: "Degular Display Light", "Mrs Eaves XL Serif"

DESIGN TOKENS REFERENCE (from globals.css):
- Colors: var(--color-primary), var(--color-secondary), var(--color-accent), var(--color-midnight), var(--color-charcoal)
- Color scales: var(--primary-50) through var(--primary-900), etc.
- Spacing: var(--spacing-1) through var(--spacing-32)
- Typography colors: var(--text-primary), var(--text-secondary), var(--text-body), var(--text-muted)
- Fonts: Should be unquoted - degular-display, mrs-eaves-xl-serif-narrow, source-code-pro

VIOLATIONS TO DETECT:
1. CRITICAL - Quoted Adobe fonts (will fail to load): font-family: "degular-display" 
2. CRITICAL - Wrong font names: "Degular Display Light", "Mrs Eaves XL Serif"
3. HIGH - Hardcoded hex colors: #4A5D4E, #D4A574, etc.
4. MEDIUM - Hardcoded pixel spacing: padding: 16px
5. MEDIUM - Hardcoded font sizes
6. LOW - Generic Tailwind grays instead of semantic tokens

For each file with violations, provide:
- File path
- Total violation count
- Critical count
- List of specific violations with:
  - Severity (critical/high/medium/low)
  - Issue description
  - Current code
  - Recommended fix with proper token

Return a comprehensive audit report.`,
        response_json_schema: {
          type: "object",
          properties: {
            summary: {
              type: "object",
              properties: {
                totalFiles: { type: "number" },
                totalViolations: { type: "number" },
                criticalCount: { type: "number" },
                highCount: { type: "number" },
                mediumCount: { type: "number" },
                lowCount: { type: "number" }
              }
            },
            files: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  path: { type: "string" },
                  totalViolations: { type: "number" },
                  criticalCount: { type: "number" },
                  violations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        severity: { type: "string" },
                        category: { type: "string" },
                        issue: { type: "string" },
                        currentCode: { type: "string" },
                        recommendedFix: { type: "string" },
                        explanation: { type: "string" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });
      
      setReport(result);
      toast.success("Analysis complete");
    } catch (error) {
      toast.error("Analysis failed: " + error.message);
    }
    setAnalyzing(false);
  };

  const handleCopyReport = () => {
    if (!report) return;
    
    let text = "=== CSS AUDIT REPORT ===\n\n";
    text += `Total Files: ${report.summary.totalFiles}\n`;
    text += `Total Violations: ${report.summary.totalViolations}\n`;
    text += `Critical: ${report.summary.criticalCount}\n`;
    text += `High: ${report.summary.highCount}\n`;
    text += `Medium: ${report.summary.mediumCount}\n\n`;
    
    report.files.forEach(file => {
      text += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      text += `FILE: ${file.path}\n`;
      text += `Violations: ${file.totalViolations} (${file.criticalCount} critical)\n`;
      text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      
      file.violations.forEach((v, i) => {
        text += `${i + 1}. [${v.severity.toUpperCase()}] ${v.issue}\n`;
        text += `   Current: ${v.currentCode}\n`;
        text += `   Fix: ${v.recommendedFix}\n`;
        if (v.explanation) text += `   Note: ${v.explanation}\n`;
        text += `\n`;
      });
    });
    
    navigator.clipboard.writeText(text);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
    toast.success("Report copied to clipboard");
  };

  const severityColors = {
    critical: "bg-[var(--color-destructive)] text-white",
    high: "bg-[var(--color-warning)] text-white",
    medium: "bg-[var(--color-info)] text-white",
    low: "bg-[var(--color-charcoal)] text-white"
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-[var(--color-background)] min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-light font-display text-[var(--color-midnight)]">
            Design Token Audit
          </h1>
          <p className="text-[var(--color-charcoal)] mt-1">
            AI-powered analysis of design token violations
          </p>
        </div>
        <div className="flex gap-2">
          {report && (
            <Button variant="outline" onClick={handleCopyReport}>
              {copiedReport ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copiedReport ? "Copied!" : "Copy Report"}
            </Button>
          )}
          <Button onClick={handleAnalyze} disabled={analyzing}>
            {analyzing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {analyzing ? "Analyzing..." : "Run AI Analysis"}
          </Button>
        </div>
      </div>

      {analyzing && (
        <Card className="mb-6">
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)] mx-auto mb-3" />
            <p className="text-[var(--color-charcoal)]">AI is analyzing your codebase for design token violations...</p>
          </CardContent>
        </Card>
      )}

      {report && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs">Files</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report.summary.totalFiles}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs">Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report.summary.totalViolations}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs">Critical</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[var(--color-destructive)]">{report.summary.criticalCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs">High</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[var(--color-warning)]">{report.summary.highCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs">Medium</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[var(--color-info)]">{report.summary.mediumCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs">Low</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[var(--color-charcoal)]">{report.summary.lowCount}</div>
              </CardContent>
            </Card>
          </div>

          {/* File Violations */}
          <div className="space-y-3">
            {report.files.map((file) => {
              const isExpanded = expandedFiles[file.path] !== false;

              return (
                <Card key={file.path}>
                  <Collapsible open={isExpanded} onOpenChange={() => setExpandedFiles(prev => ({ ...prev, [file.path]: !prev[file.path] }))}>
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            <FileCode className="h-4 w-4" />
                            <span className="font-mono text-sm">{file.path}</span>
                            <Badge variant="secondary">{file.totalViolations}</Badge>
                            {file.criticalCount > 0 && (
                              <Badge className="bg-[var(--color-destructive)] text-white">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                {file.criticalCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0 space-y-3">
                        {file.violations.map((v, idx) => (
                          <div 
                            key={idx} 
                            className="border-l-4 pl-4 py-2"
                            style={{ 
                              borderColor: v.severity === "critical" ? "var(--color-destructive)" : 
                                          v.severity === "high" ? "var(--color-warning)" : 
                                          v.severity === "medium" ? "var(--color-info)" : 
                                          "var(--color-charcoal)" 
                            }}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={severityColors[v.severity] || severityColors.medium}>
                                {v.severity}
                              </Badge>
                              <span className="font-medium text-sm">{v.issue}</span>
                            </div>
                            {v.explanation && (
                              <p className="text-xs text-[var(--color-charcoal)] mb-2">{v.explanation}</p>
                            )}
                            <div className="space-y-1">
                              <div>
                                <span className="text-xs font-mono text-[var(--color-destructive)]">Current:</span>
                                <code className="block text-xs bg-[var(--color-muted)] p-2 rounded mt-1 font-mono">
                                  {v.currentCode}
                                </code>
                              </div>
                              <div>
                                <span className="text-xs font-mono text-[var(--color-success)]">Fix:</span>
                                <code className="block text-xs bg-[var(--color-success)]/10 p-2 rounded mt-1 font-mono">
                                  {v.recommendedFix}
                                </code>
                              </div>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {!report && !analyzing && (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <Sparkles className="h-16 w-16 mx-auto mb-4 text-[var(--color-charcoal)]/30" />
            <h3 className="text-lg font-medium mb-2">Ready to Audit</h3>
            <p className="text-[var(--color-charcoal)] mb-4">
              Click "Run AI Analysis" to scan your codebase for design token violations
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}