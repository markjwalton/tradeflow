import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { 
  Sparkles, Loader2, CheckCircle2, AlertTriangle, 
  XCircle, RefreshCw, FileText
} from "lucide-react";
import { toast } from "sonner";

export default function AIQualityReport({ 
  testDataSets,
  entityTemplates,
  onReportGenerated
}) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState(null);

  const analyzeQuality = async () => {
    if (testDataSets.length === 0) {
      toast.error("No test data to analyze");
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Build summary of all test data
      const dataSummary = testDataSets.map(td => {
        const entityData = td.entity_data || {};
        const entities = Object.entries(entityData).map(([name, records]) => ({
          name,
          recordCount: Array.isArray(records) ? records.length : 0,
          sampleRecord: Array.isArray(records) && records.length > 0 ? records[0] : null
        }));
        return {
          name: td.name,
          entities
        };
      });

      // Get entity schemas for comparison
      const schemas = entityTemplates.slice(0, 20).map(e => ({
        name: e.data?.name || e.name,
        properties: Object.keys(e.data?.schema?.properties || {}),
        required: e.data?.schema?.required || []
      }));

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze the quality of this test data for a business application.

Test Data Summary:
${JSON.stringify(dataSummary, null, 2)}

Entity Schemas (for reference):
${JSON.stringify(schemas, null, 2)}

Evaluate and return a JSON report with:
1. overallScore (0-100): Overall quality rating
2. grade (A/B/C/D/F): Letter grade
3. summary: 2-3 sentence summary of data quality
4. strengths: Array of 2-3 positive aspects
5. issues: Array of issues found, each with {severity: "critical"|"warning"|"info", title, description, affectedEntities: []}
6. recommendations: Array of 2-3 actionable recommendations
7. coverage: {complete: number, partial: number, missing: number} - entity coverage stats
8. dataIntegrity: {valid: number, invalid: number, warnings: number} - record integrity stats`,
        response_json_schema: {
          type: "object",
          properties: {
            overallScore: { type: "number" },
            grade: { type: "string" },
            summary: { type: "string" },
            strengths: { type: "array", items: { type: "string" } },
            issues: { 
              type: "array", 
              items: { 
                type: "object",
                properties: {
                  severity: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  affectedEntities: { type: "array", items: { type: "string" } }
                }
              } 
            },
            recommendations: { type: "array", items: { type: "string" } },
            coverage: { 
              type: "object",
              properties: {
                complete: { type: "number" },
                partial: { type: "number" },
                missing: { type: "number" }
              }
            },
            dataIntegrity: {
              type: "object",
              properties: {
                valid: { type: "number" },
                invalid: { type: "number" },
                warnings: { type: "number" }
              }
            }
          }
        }
      });

      setReport({
        ...result,
        generatedAt: new Date().toISOString()
      });
      onReportGenerated?.(result);
      toast.success("Quality analysis complete");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to analyze: " + (error.message || "Unknown error"));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const gradeColors = {
    A: "bg-green-100 text-green-700 border-green-300",
    B: "bg-blue-100 text-blue-700 border-blue-300",
    C: "bg-amber-100 text-amber-700 border-amber-300",
    D: "bg-orange-100 text-orange-700 border-orange-300",
    F: "bg-red-100 text-red-700 border-red-300"
  };

  const severityConfig = {
    critical: { icon: XCircle, color: "text-red-600", bg: "bg-red-50 border-red-200" },
    warning: { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
    info: { icon: FileText, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI Quality Analysis
          </CardTitle>
          <Button 
            onClick={analyzeQuality} 
            disabled={isAnalyzing || testDataSets.length === 0}
            size="sm"
          >
            {isAnalyzing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {report ? "Re-analyze" : "Analyze Quality"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!report && !isAnalyzing && (
          <div className="text-center py-8 text-gray-500">
            <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>Click "Analyze Quality" to get an AI-powered assessment</p>
            <p className="text-sm mt-1">of your test data completeness and integrity</p>
          </div>
        )}

        {isAnalyzing && (
          <div className="text-center py-8">
            <Loader2 className="h-10 w-10 mx-auto mb-3 animate-spin text-purple-600" />
            <p className="font-medium">Analyzing test data quality...</p>
            <p className="text-sm text-gray-500">This may take a moment</p>
          </div>
        )}

        {report && !isAnalyzing && (
          <div className="space-y-4">
            {/* Score and Grade */}
            <div className="flex items-center gap-6">
              <div className={`px-4 py-3 rounded-lg border-2 ${gradeColors[report.grade] || gradeColors.C}`}>
                <div className="text-3xl font-bold">{report.grade}</div>
                <div className="text-xs opacity-80">Grade</div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="font-medium">Quality Score</span>
                  <span className="font-bold">{report.overallScore}%</span>
                </div>
                <Progress value={report.overallScore} className="h-3" />
              </div>
            </div>

            {/* Summary */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm">{report.summary}</p>
            </div>

            {/* Coverage Stats */}
            {report.coverage && (
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-green-50 rounded-lg text-center">
                  <div className="text-xl font-bold text-green-700">{report.coverage.complete}</div>
                  <div className="text-xs text-green-600">Complete</div>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg text-center">
                  <div className="text-xl font-bold text-amber-700">{report.coverage.partial}</div>
                  <div className="text-xs text-amber-600">Partial</div>
                </div>
                <div className="p-3 bg-red-50 rounded-lg text-center">
                  <div className="text-xl font-bold text-red-700">{report.coverage.missing}</div>
                  <div className="text-xs text-red-600">Missing</div>
                </div>
              </div>
            )}

            {/* Strengths */}
            {report.strengths?.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2 text-green-700">Strengths</h4>
                <ul className="space-y-1">
                  {report.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Issues */}
            {report.issues?.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2 text-red-700">Issues Found</h4>
                <div className="space-y-2">
                  {report.issues.map((issue, i) => {
                    const config = severityConfig[issue.severity] || severityConfig.info;
                    const Icon = config.icon;
                    return (
                      <Alert key={i} className={config.bg}>
                        <Icon className={`h-4 w-4 ${config.color}`} />
                        <AlertTitle className="text-sm">{issue.title}</AlertTitle>
                        <AlertDescription className="text-xs">
                          {issue.description}
                          {issue.affectedEntities?.length > 0 && (
                            <div className="mt-1">
                              <span className="font-medium">Affected: </span>
                              {issue.affectedEntities.join(", ")}
                            </div>
                          )}
                        </AlertDescription>
                      </Alert>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {report.recommendations?.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2 text-blue-700">Recommendations</h4>
                <ul className="space-y-1">
                  {report.recommendations.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs flex-shrink-0">
                        {i + 1}
                      </span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="text-xs text-gray-400 pt-2 border-t">
              Generated: {new Date(report.generatedAt).toLocaleString()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}