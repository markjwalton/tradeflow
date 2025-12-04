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
  Play, FileCheck, Layout, Zap
} from "lucide-react";
import { toast } from "sonner";

// Helper: safely get nested or flat property
const get = (obj, key) => obj?.[key] ?? obj?.data?.[key];

export default function BulkVerificationDialog({ 
  isOpen, 
  onClose, 
  items,
  testDataSets,
  entityTemplates,
  onComplete
}) {
  const [phase, setPhase] = useState("idle"); // idle, running, complete
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState({ success: [], failed: [] });

  // Reset when dialog opens
  useEffect(() => {
    if (isOpen) {
      setPhase("idle");
      setProgress({ current: 0, total: 0 });
      setResults({ success: [], failed: [] });
    }
  }, [isOpen]);

  // Find TestData for an item
  const findTestData = (itemId) => {
    return testDataSets.find(td => get(td, "playground_item_id") === itemId);
  };

  // Run bulk verification - marks all items with test data as verified
  const runBulkVerification = async () => {
    const itemsWithData = items.filter(i => i.hasTestData);
    if (itemsWithData.length === 0) {
      toast.info("No items with test data to verify");
      return;
    }

    setPhase("running");
    setProgress({ current: 0, total: itemsWithData.length });
    
    const success = [];
    const failed = [];

    for (let i = 0; i < itemsWithData.length; i++) {
      const item = itemsWithData[i];
      const testData = findTestData(item.id);
      
      setProgress({ current: i + 1, total: itemsWithData.length });

      if (!testData) {
        failed.push({ ...item, error: "No test data found" });
        continue;
      }

      try {
        await base44.entities.TestData.update(testData.id, {
          test_status: "verified"
        });
        success.push(item);
      } catch (e) {
        failed.push({ ...item, error: e.message });
      }

      // Small delay to prevent overwhelming API
      if (i % 5 === 0 && i > 0) {
        await new Promise(r => setTimeout(r, 100));
      }
    }

    setResults({ success, failed });
    setPhase("complete");
    
    if (failed.length === 0) {
      toast.success(`${success.length} items verified successfully`);
    } else {
      toast.warning(`${success.length} verified, ${failed.length} failed`);
    }

    onComplete?.();
  };

  const percentage = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;
  const itemsWithData = items.filter(i => i.hasTestData);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-purple-600" />
            Bulk Verification
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress */}
          {phase === "running" && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Verifying items...</span>
                <span>{progress.current} / {progress.total}</span>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>
          )}

          {/* Idle State */}
          {phase === "idle" && (
            <div className="text-center py-8">
              <FileCheck className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-600 mb-2">
                Ready to verify {itemsWithData.length} items with test data
              </p>
              <p className="text-sm text-gray-500">
                This will mark all items as verified
              </p>
            </div>
          )}

          {/* Complete State */}
          {phase === "complete" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-700">{results.success.length}</div>
                  <div className="text-sm text-green-600">Verified</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-700">{results.failed.length}</div>
                  <div className="text-sm text-red-600">Failed</div>
                </div>
              </div>

              {results.failed.length > 0 && (
                <div className="border rounded-lg max-h-48 overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="text-left p-2">Item</th>
                        <th className="text-left p-2">Error</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {results.failed.map((item, idx) => (
                        <tr key={idx} className="bg-red-50">
                          <td className="p-2 flex items-center gap-2">
                            {item.type === "page" ? (
                              <Layout className="h-3 w-3 text-blue-600" />
                            ) : (
                              <Zap className="h-3 w-3 text-amber-600" />
                            )}
                            {item.name}
                          </td>
                          <td className="p-2 text-red-600">{item.error}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-2 border-t">
            <Button variant="outline" onClick={onClose}>
              {phase === "complete" ? "Done" : "Cancel"}
            </Button>
            
            {phase !== "complete" && (
              <Button 
                onClick={runBulkVerification} 
                disabled={phase === "running" || itemsWithData.length === 0}
                className="bg-green-600 hover:bg-green-700"
              >
                {phase === "running" ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                Verify All ({itemsWithData.length})
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}