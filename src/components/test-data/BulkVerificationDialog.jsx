import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, XCircle, Loader2, AlertTriangle, 
  Play, FileCheck, Download, Layout, Zap
} from "lucide-react";
import { toast } from "sonner";

export default function BulkVerificationDialog({ 
  isOpen, 
  onClose, 
  items,
  testDataSets,
  entityTemplates,
  onComplete,
  onErrorReport
}) {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState(null);

  // Reset when dialog opens
  useEffect(() => {
    if (isOpen) {
      setResults([]);
      setSummary(null);
      setProgress({ current: 0, total: 0 });
    }
  }, [isOpen]);

  const verifyItem = async (item, testData) => {
    const result = {
      id: item.id,
      name: item.name,
      type: item.type,
      checks: { schema: "pending", data: "pending", preview: "pending" },
      issues: [],
      status: "pending"
    };

    const entityData = testData?.entity_data || {};
    const entityCount = Object.keys(entityData).length;
    let totalRecords = 0;

    // Schema check
    for (const [entityName, records] of Object.entries(entityData)) {
      const template = entityTemplates.find(e => 
        e.name === entityName || e.data?.name === entityName
      );
      
      if (!template) {
        result.issues.push(`${entityName}: No template`);
        continue;
      }
      
      const schema = template.data?.schema || template.schema;
      const required = schema?.required || [];
      
      if (Array.isArray(records)) {
        totalRecords += records.length;
        records.forEach((record, idx) => {
          required.forEach(field => {
            if (record[field] === undefined || record[field] === null) {
              result.issues.push(`${entityName}[${idx}]: Missing '${field}'`);
            }
          });
        });
      }
    }

    result.checks.schema = result.issues.length === 0 ? "passed" : 
                           result.issues.length <= 3 ? "warning" : "failed";

    // Data check
    if (entityCount === 0) {
      result.checks.data = "passed"; // No entities needed
    } else if (totalRecords === 0) {
      result.checks.data = "warning";
      result.issues.push("No test records");
    } else {
      result.checks.data = "passed";
    }

    // Preview check
    if (totalRecords > 0 || entityCount === 0) {
      result.checks.preview = "passed";
    } else {
      result.checks.preview = "warning";
    }

    // Overall status
    const checkValues = Object.values(result.checks);
    if (checkValues.includes("failed")) {
      result.status = "failed";
    } else if (checkValues.includes("warning")) {
      result.status = "warning";
    } else {
      result.status = "passed";
    }

    result.recordCount = totalRecords;
    result.entityCount = entityCount;

    return result;
  };

  const runBulkVerification = async () => {
    const itemsWithData = items.filter(i => i.hasTestData);
    if (itemsWithData.length === 0) {
      toast.info("No items with test data to verify");
      return;
    }

    setIsRunning(true);
    setResults([]);
    setProgress({ current: 0, total: itemsWithData.length });

    const allResults = [];

    for (let i = 0; i < itemsWithData.length; i++) {
      const item = itemsWithData[i];
      const testData = testDataSets.find(td => td.playground_item_id === item.id);
      
      setProgress({ current: i + 1, total: itemsWithData.length });
      
      const result = await verifyItem(item, testData);
      allResults.push(result);
      setResults([...allResults]);

      // Small delay to prevent UI freezing
      if (i % 10 === 0) {
        await new Promise(r => setTimeout(r, 50));
      }
    }

    // Generate summary
    const passed = allResults.filter(r => r.status === "passed").length;
    const warnings = allResults.filter(r => r.status === "warning").length;
    const failed = allResults.filter(r => r.status === "failed").length;

    setSummary({
      total: allResults.length,
      passed,
      warnings,
      failed,
      passRate: Math.round((passed / allResults.length) * 100),
      timestamp: new Date().toISOString()
    });

    setIsRunning(false);
  };

  const [isMarkingVerified, setIsMarkingVerified] = useState(false);
  const [markProgress, setMarkProgress] = useState({ current: 0, total: 0 });
  const [markReport, setMarkReport] = useState(null);

  const markAllVerified = async () => {
    const passedItems = results.filter(r => r.status === "passed" || r.status === "warning");
    if (passedItems.length === 0) return;

    setIsMarkingVerified(true);
    setMarkProgress({ current: 0, total: passedItems.length });
    setMarkReport(null);
    
    const successItems = [];
    const errorItems = [];

    try {
      // Collect all test data IDs to update
      const testDataToUpdate = [];
      const itemMap = new Map();
      
      for (const item of passedItems) {
        const testData = testDataSets.find(td => 
          td.playground_item_id === item.id || td.data?.playground_item_id === item.id
        );
        if (testData) {
          testDataToUpdate.push(testData.id);
          itemMap.set(testData.id, item);
        } else {
          errorItems.push({ ...item, error: "No test data found" });
        }
      }

      setMarkProgress({ current: 0, total: testDataToUpdate.length });

      // Call backend function for bulk update (avoids rate limits)
      if (testDataToUpdate.length > 0) {
        const response = await base44.functions.invoke('bulkVerifyTestData', {
          testDataIds: testDataToUpdate
        });
        
        const result = response.data;
        
        // Map results back to items
        result.success?.forEach?.(id => {
          const item = itemMap.get(id);
          if (item) successItems.push(item);
        });
        
        result.failedItems?.forEach?.(({ id, error }) => {
          const item = itemMap.get(id);
          if (item) errorItems.push({ ...item, error });
        });
        
        // If response structure is different, handle counts
        if (typeof result.verified === 'number' && !result.success) {
          // All passed items succeeded
          for (const [id, item] of itemMap) {
            if (!result.failedItems?.some(f => f.id === id)) {
              successItems.push(item);
            }
          }
        }
        
        setMarkProgress({ current: testDataToUpdate.length, total: testDataToUpdate.length });
      }
      
      onComplete?.(); // Always refresh data
      
      if (errorItems.length > 0) {
        const report = {
          success: successItems,
          errors: errorItems,
          timestamp: new Date().toISOString()
        };
        toast.warning(`${successItems.length} verified, ${errorItems.length} failed`);
        onErrorReport?.(report);
      } else {
        toast.success(`${successItems.length} items marked as verified`);
        onClose();
      }
    } catch (e) {
      toast.error("Failed to update items: " + e.message);
    } finally {
      setIsMarkingVerified(false);
      setMarkProgress({ current: 0, total: 0 });
    }
  };

  const percentage = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-purple-600" />
            Bulk Verification
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Progress */}
          {isRunning && (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Verifying items...</span>
                <span>{progress.current} / {progress.total}</span>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>
          )}

          {/* Summary Report */}
          {summary && (
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold">{summary.total}</div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-700">{summary.passed}</div>
                <div className="text-xs text-green-600">Passed</div>
              </div>
              <div className="bg-amber-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-amber-700">{summary.warnings}</div>
                <div className="text-xs text-amber-600">Warnings</div>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-red-700">{summary.failed}</div>
                <div className="text-xs text-red-600">Failed</div>
              </div>
            </div>
          )}

          {/* Results Table */}
                        {results.length > 0 && (
            <div className="flex-1 overflow-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-left p-2">Item</th>
                    <th className="text-center p-2">Schema</th>
                    <th className="text-center p-2">Data</th>
                    <th className="text-center p-2">Preview</th>
                    <th className="text-center p-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {results.map((result) => (
                    <tr key={result.id} className={
                      result.status === "failed" ? "bg-red-50" :
                      result.status === "warning" ? "bg-amber-50" : ""
                    }>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          {result.type === "page" ? (
                            <Layout className="h-3 w-3 text-blue-600" />
                          ) : (
                            <Zap className="h-3 w-3 text-amber-600" />
                          )}
                          <span className="truncate max-w-[200px]">{result.name}</span>
                        </div>
                      </td>
                      <td className="text-center p-2">
                        {result.checks.schema === "passed" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" />
                        ) : result.checks.schema === "warning" ? (
                          <AlertTriangle className="h-4 w-4 text-amber-600 mx-auto" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600 mx-auto" />
                        )}
                      </td>
                      <td className="text-center p-2">
                        {result.checks.data === "passed" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" />
                        ) : result.checks.data === "warning" ? (
                          <AlertTriangle className="h-4 w-4 text-amber-600 mx-auto" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600 mx-auto" />
                        )}
                      </td>
                      <td className="text-center p-2">
                        {result.checks.preview === "passed" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" />
                        ) : result.checks.preview === "warning" ? (
                          <AlertTriangle className="h-4 w-4 text-amber-600 mx-auto" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600 mx-auto" />
                        )}
                      </td>
                      <td className="text-center p-2">
                        <Badge variant={
                          result.status === "passed" ? "default" :
                          result.status === "warning" ? "secondary" : "destructive"
                        } className="text-xs">
                          {result.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Empty state */}
          {!isRunning && results.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <FileCheck className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Click "Run Bulk Verification" to test all items with data</p>
              <p className="text-sm mt-1">{items.filter(i => i.hasTestData).length} items ready to verify</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-2 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            
            <div className="flex gap-2">
              {!summary ? (
                <Button onClick={runBulkVerification} disabled={isRunning}>
                  {isRunning ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Run Bulk Verification
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={runBulkVerification}>
                    Re-run All
                  </Button>
                  {(summary.passed + summary.warnings) > 0 && (
                    <Button 
                      onClick={markAllVerified} 
                      disabled={isMarkingVerified}
                      className="bg-green-600 hover:bg-green-700 min-w-[180px]"
                    >
                      {isMarkingVerified ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {markProgress.current}/{markProgress.total}
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Mark {summary.passed + summary.warnings} Verified
                        </>
                      )}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}