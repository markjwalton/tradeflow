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
  const [batchState, setBatchState] = useState({
    queue: [],        // Items still to process
    successItems: [], // Successfully verified
    errorItems: [],   // Failed items
    isProcessing: false,
    batchComplete: false
  });

  const BATCH_SIZE = 10;

  // Start batch verification process
  const startBatchVerification = () => {
    const passedItems = results.filter(r => r.status === "passed" || r.status === "warning");
    if (passedItems.length === 0) return;

    // Build queue with test data IDs
    const queue = [];
    const errorItems = [];
    
    for (const item of passedItems) {
      const testData = testDataSets.find(td => 
        td.playground_item_id === item.id || td.data?.playground_item_id === item.id
      );
      if (testData) {
        queue.push({ item, testDataId: testData.id });
      } else {
        errorItems.push({ ...item, error: "No test data found" });
      }
    }

    setBatchState({
      queue,
      successItems: [],
      errorItems,
      isProcessing: false,
      batchComplete: false
    });
    setMarkProgress({ current: 0, total: queue.length });
    
    // Auto-start first batch
    processNextBatch(queue, [], errorItems);
  };

  // Process next batch of 10
  const processNextBatch = async (queue, successItems, errorItems) => {
    if (queue.length === 0) {
      // All done
      onComplete?.();
      if (errorItems.length > 0) {
        toast.warning(`${successItems.length} verified, ${errorItems.length} failed`);
        onErrorReport?.({ success: successItems, errors: errorItems, timestamp: new Date().toISOString() });
      } else {
        toast.success(`${successItems.length} items marked as verified`);
        onClose();
      }
      return;
    }

    setBatchState(prev => ({ ...prev, isProcessing: true, batchComplete: false }));
    
    const batch = queue.slice(0, BATCH_SIZE);
    const remaining = queue.slice(BATCH_SIZE);
    const newSuccess = [...successItems];
    const newErrors = [...errorItems];
    const verifiedDate = new Date().toISOString();

    for (let i = 0; i < batch.length; i++) {
      const { item, testDataId } = batch[i];
      
      try {
        await base44.entities.TestData.update(testDataId, {
          test_status: "verified",
          verified_date: verifiedDate
        });
        newSuccess.push(item);
      } catch (e) {
        newErrors.push({ ...item, error: e.message });
      }
      
      setMarkProgress({ current: successItems.length + newSuccess.length + newErrors.length - errorItems.length, total: queue.length + successItems.length });
      
      // Small delay between each update
      if (i < batch.length - 1) {
        await new Promise(r => setTimeout(r, 200));
      }
    }

    setBatchState({
      queue: remaining,
      successItems: newSuccess,
      errorItems: newErrors,
      isProcessing: false,
      batchComplete: true
    });
    setMarkProgress({ current: newSuccess.length + newErrors.length, total: remaining.length + newSuccess.length + newErrors.length });
  };

  const continueNextBatch = () => {
    processNextBatch(batchState.queue, batchState.successItems, batchState.errorItems);
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