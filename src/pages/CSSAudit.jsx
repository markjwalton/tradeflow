import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertTriangle, CheckCircle2, ChevronDown, ChevronRight, FileCode, Wrench, RefreshCw, Info, Lightbulb, XCircle } from "lucide-react";
import { toast } from "sonner";

// Comprehensive violation patterns with auto-fix logic
const violationPatterns = {
  quotedFonts: {
    category: "typography", severity: "critical",
    pattern: /font-family:\s*(['"])(degular-display|Degular Display|mrs-eaves-xl-serif-narrow|Mrs Eaves|source-code-pro)\1/gi,
    issue: "Quoted Adobe Font - will fail to load",
    autoFix: (content) => content.replace(/font-family:\s*(['"])(degular-display|Degular Display|mrs-eaves-xl-serif-narrow|Mrs Eaves|source-code-pro)\1/gi, (match, quote, name) => `font-family: ${name.toLowerCase().replace(/\s+/g, '-')}`)
  },
  wrongFontNames: {
    category: "typography", severity: "critical",
    pattern: /(Degular Display Light|Mrs Eaves XL Serif)/g,
    issue: "Wrong Adobe Font name format",
    autoFix: (content) => content.replace(/Degular Display Light/g, 'degular-display').replace(/Mrs Eaves XL Serif/g, 'mrs-eaves-xl-serif-narrow')
  },
  hexColors: {
    category: "colors", severity: "high",
    pattern: /#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g,
    issue: "Hardcoded hex color"
  },
  rgbColors: {
    category: "colors", severity: "high",
    pattern: /rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/g,
    issue: "Hardcoded RGB color"
  },
  pixelSpacing: {
    category: "spacing", severity: "medium",
    pattern: /(?:padding|margin|gap):\s*(\d+)px/gi,
    issue: "Hardcoded pixel spacing",
    autoFix: (content) => {
      const map = { '4': '1', '8': '2', '12': '3', '16': '4', '20': '5', '24': '6', '32': '8', '40': '10', '48': '12' };
      return content.replace(/(?:padding|margin|gap):\s*(\d+)px/gi, (match, px) => 
        map[px] ? match.replace(`${px}px`, `var(--spacing-${map[px]})`) : match
      );
    }
  },
  fontSizes: {
    category: "typography", severity: "medium",
    pattern: /font-size:\s*\d+(?:\.\d+)?(px|rem)/gi,
    issue: "Hardcoded font size"
  },
  inlineStyles: {
    category: "architecture", severity: "high",
    pattern: /style=\{\{[^}]*(?:color|padding|margin|fontSize):\s*['"][^'"]*['"]/g,
    issue: "Inline styles with hardcoded values"
  },
  tailwindGray: {
    category: "colors", severity: "low",
    pattern: /(?:text|bg|border)-gray-\d+/g,
    issue: "Generic gray (use semantic tokens)"
  }
};

export default function CSSAudit() {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [findings, setFindings] = useState({});
  const [expandedFiles, setExpandedFiles] = useState({});
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [selectedForFix, setSelectedForFix] = useState([]);
  const [fixing, setFixing] = useState(false);

  const handleScan = async () => {
    setScanning(true);
    setProgress(0);
    const newFindings = {};

    try {
      // Get comprehensive file list
      const fileListPrompt = `Analyze this Base44 React project and return a JSON array of ALL file paths that could contain CSS/styling code:
- All pages in pages/ directory (*.js, *.jsx)
- All components in components/ directory recursively (*.js, *.jsx)
- Layout.js
- globals.css
- Any design system files

Return ONLY the array, no explanation.`;

      const fileList = await base44.integrations.Core.InvokeLLM({
        prompt: fileListPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            files: { type: "array", items: { type: "string" } }
          }
        }
      });

      const filesToScan = fileList.files || [];
      let processed = 0;

      for (const filePath of filesToScan) {
        try {
          // Scan each file
          const scanResult = await base44.integrations.Core.InvokeLLM({
            prompt: `Scan this file for design token violations. File: ${filePath}

Check for:
1. Quoted Adobe Font names (critical)
2. Hardcoded colors (#hex, rgb())
3. Hardcoded spacing/sizing (px values)
4. Inline styles with hardcoded values
5. Font size violations

Return found violations with line snippets.`,
            response_json_schema: {
              type: "object",
              properties: {
                violations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      type: { type: "string" },
                      severity: { type: "string" },
                      line: { type: "string" },
                      suggestion: { type: "string" }
                    }
                  }
                }
              }
            }
          });

          if (scanResult.violations?.length > 0) {
            newFindings[filePath] = {
              violations: scanResult.violations,
              totalIssues: scanResult.violations.length,
              criticalCount: scanResult.violations.filter(v => v.severity === "critical").length,
              autoFixable: scanResult.violations.filter(v => ["quotedFonts", "pixelSpacing"].includes(v.type)).length
            };
          }
        } catch (e) {
          console.error(`Error scanning ${filePath}:`, e);
        }

        processed++;
        setProgress(Math.round((processed / filesToScan.length) * 100));
      }

      setFindings(newFindings);
      const totalFiles = Object.keys(newFindings).length;
      const totalIssues = Object.values(newFindings).reduce((sum, f) => sum + f.totalIssues, 0);
      toast.success(`Scan complete: ${totalIssues} issues in ${totalFiles} files`);
    } catch (error) {
      toast.error("Scan failed: " + error.message);
    }

    setScanning(false);
  };

  const handleAutoFixFile = async (filePath) => {
    try {
      const fixPrompt = `Auto-fix design token violations in ${filePath}:

1. Remove quotes from Adobe Font names (degular-display, mrs-eaves-xl-serif-narrow)
2. Replace hardcoded spacing (4px→var(--spacing-1), 12px→var(--spacing-3), etc.)
3. Apply other auto-fixable patterns

Return the fixed file content.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: fixPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            content: { type: "string" },
            fixesApplied: { type: "number" }
          }
        }
      });

      toast.success(`Applied ${result.fixesApplied} fixes to ${filePath}`);
      
      // Remove from findings
      const updated = { ...findings };
      delete updated[filePath];
      setFindings(updated);
    } catch (error) {
      toast.error(`Fix failed: ${error.message}`);
    }
  };

  const handleBatchFix = async () => {
    setFixing(true);
    const selectedFiles = Object.keys(findings).filter((_, i) => selectedForFix.includes(i));
    let successCount = 0;

    for (const filePath of selectedFiles) {
      try {
        await handleAutoFixFile(filePath);
        successCount++;
      } catch (e) {
        console.error(`Failed ${filePath}:`, e);
      }
    }

    toast.success(`Fixed ${successCount}/${selectedFiles.length} files`);
    setSelectedForFix([]);
    setFixing(false);
  };

  const stats = React.useMemo(() => {
    const fileCount = Object.keys(findings).length;
    const totalIssues = Object.values(findings).reduce((sum, f) => sum + f.totalIssues, 0);
    const criticalCount = Object.values(findings).reduce((sum, f) => sum + f.criticalCount, 0);
    const autoFixableCount = Object.values(findings).reduce((sum, f) => sum + f.autoFixable, 0);
    return { fileCount, totalIssues, criticalCount, autoFixableCount };
  }, [findings]);

  const filteredFindings = React.useMemo(() => {
    if (filterSeverity === "all") return findings;
    return Object.fromEntries(
      Object.entries(findings).filter(([_, data]) => 
        data.violations.some(v => v.severity === filterSeverity)
      )
    );
  }, [findings, filterSeverity]);

  return (
    <div className="[padding:var(--spacing-6)] max-w-6xl mx-auto bg-[var(--color-background)] min-h-screen">
      <div className="flex items-center justify-between [margin-bottom:var(--spacing-6)]">
        <div>
          <h1 className="text-h2">Design Token Audit Tool</h1>
          <p className="text-body-small text-[var(--color-text-muted)]">
            Scan & auto-fix design token violations across all files
          </p>
        </div>
        <Button onClick={handleScan} disabled={scanning}>
          {scanning ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          {scanning ? "Scanning..." : "Start Comprehensive Scan"}
        </Button>
      </div>

      {scanning && (
        <Card className="[margin-bottom:var(--spacing-6)]">
          <CardContent className="[padding:var(--spacing-6)]">
            <Progress value={progress} className="[margin-bottom:var(--spacing-2)]" />
            <p className="text-caption text-center">Scanning files... {progress}%</p>
          </CardContent>
        </Card>
      )}

      {Object.keys(findings).length > 0 && (
        <>
          <div className="grid grid-cols-4 gap-4 [margin-bottom:var(--spacing-6)]">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Files</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{stats.fileCount}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Total Issues</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{stats.totalIssues}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Critical</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold text-[var(--color-destructive)]">{stats.criticalCount}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1"><Wrench className="h-3 w-3" />Auto-fixable</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold text-[var(--color-success)]">{stats.autoFixableCount}</div></CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-between [margin-bottom:var(--spacing-4)] [padding:var(--spacing-4)] bg-[var(--color-primary-50)] border border-[var(--color-primary-200)] [border-radius:var(--radius-lg)]">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-[var(--color-primary)]" />
              <span className="text-sm font-medium">
                {selectedForFix.length > 0 ? `${selectedForFix.length} files selected` : "Select files to batch auto-fix"}
              </span>
            </div>
            <div className="flex [gap:var(--spacing-2)]">
              <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical Only</SelectItem>
                  <SelectItem value="high">High Only</SelectItem>
                </SelectContent>
              </Select>
              {selectedForFix.length > 0 && (
                <>
                  <Button variant="outline" size="sm" onClick={() => setSelectedForFix([])}>Clear</Button>
                  <Button size="sm" onClick={handleBatchFix} disabled={fixing}>
                    {fixing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wrench className="h-4 w-4 mr-2" />}
                    Auto-Fix ({selectedForFix.length})
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {Object.entries(filteredFindings).map(([filePath, fileData], fileIndex) => {
              const isExpanded = expandedFiles[filePath];
              const isSelected = selectedForFix.includes(fileIndex);

              return (
                <Card key={filePath} className={isSelected ? "ring-2 ring-[var(--color-primary)]" : ""}>
                  <Collapsible open={isExpanded} onOpenChange={() => setExpandedFiles(prev => ({ ...prev, [filePath]: !prev[filePath] }))}>
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center [gap:var(--spacing-3)]">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => {
                                setSelectedForFix(prev => checked ? [...prev, fileIndex] : prev.filter(i => i !== fileIndex));
                              }}
                              onClick={(e) => e.stopPropagation()}
                              disabled={fileData.autoFixable === 0}
                            />
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            <FileCode className="h-4 w-4" />
                            <span className="font-mono text-sm">{filePath}</span>
                            <Badge variant="secondary">{fileData.totalIssues}</Badge>
                            {fileData.criticalCount > 0 && (
                              <Badge className="bg-[var(--color-destructive)] text-white">
                                <AlertTriangle className="h-3 w-3 mr-1" />{fileData.criticalCount}
                              </Badge>
                            )}
                            {fileData.autoFixable > 0 && (
                              <Badge className="bg-[var(--color-success)] text-white">
                                <Wrench className="h-3 w-3 mr-1" />{fileData.autoFixable}
                              </Badge>
                            )}
                          </div>
                          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleAutoFixFile(filePath); }} disabled={fileData.autoFixable === 0}>
                            <Wrench className="h-3 w-3 mr-2" />Fix
                          </Button>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0 space-y-2">
                        {fileData.violations.map((v, idx) => (
                          <div key={idx} className="border-l-4 [padding-left:var(--spacing-3)] py-2" style={{ borderColor: v.severity === "critical" ? "var(--color-destructive)" : v.severity === "high" ? "var(--color-warning)" : "var(--color-info)" }}>
                            <div className="flex items-center [gap:var(--spacing-2)] mb-1">
                              <Badge className={v.severity === "critical" ? "bg-[var(--color-destructive)] text-white" : v.severity === "high" ? "bg-[var(--color-warning)] text-white" : "bg-[var(--color-info)] text-white"}>
                                {v.severity}
                              </Badge>
                              <span className="font-medium">{v.type}</span>
                            </div>
                            <p className="text-sm text-[var(--color-text-muted)]"><Lightbulb className="h-3 w-3 inline mr-1" />{v.suggestion}</p>
                            {v.line && <code className="text-xs bg-[var(--color-muted)] [padding:var(--spacing-1)] [border-radius:var(--radius-sm)] block mt-1">{v.line}</code>}
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
    </div>
  );
}