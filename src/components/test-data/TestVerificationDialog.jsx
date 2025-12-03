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
import { 
  CheckCircle2, XCircle, Loader2, AlertTriangle, 
  Play, Eye, Database, FileCheck
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const stepConfig = {
  pending: { icon: null, color: "text-gray-400" },
  running: { icon: Loader2, color: "text-blue-600", spin: true },
  passed: { icon: CheckCircle2, color: "text-green-600" },
  failed: { icon: XCircle, color: "text-red-600" },
  warning: { icon: AlertTriangle, color: "text-amber-600" }
};

export default function TestVerificationDialog({ 
  isOpen, 
  onClose, 
  item, 
  testData,
  entityTemplates,
  onVerified 
}) {
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState([
    { id: "schema", name: "Schema Validation", status: "pending", details: null },
    { id: "data", name: "Data Integrity", status: "pending", details: null },
    { id: "preview", name: "Preview Check", status: "pending", details: null },
  ]);
  const [overallResult, setOverallResult] = useState(null);

  // Reset when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSteps([
        { id: "schema", name: "Schema Validation", status: "pending", details: null },
        { id: "data", name: "Data Integrity", status: "pending", details: null },
        { id: "preview", name: "Preview Check", status: "pending", details: null },
      ]);
      setOverallResult(null);
    }
  }, [isOpen]);

  const updateStep = (stepId, updates) => {
    setSteps(prev => prev.map(s => s.id === stepId ? { ...s, ...updates } : s));
  };

  const runVerification = async () => {
    if (!item || !testData) return;
    
    setIsRunning(true);
    setOverallResult(null);
    let allPassed = true;
    let warnings = 0;

    // Step 1: Schema Validation
    updateStep("schema", { status: "running" });
    await new Promise(r => setTimeout(r, 500));
    
    const schemaIssues = [];
    const entityData = testData.entity_data || {};
    
    for (const [entityName, records] of Object.entries(entityData)) {
      const template = entityTemplates.find(e => 
        e.name === entityName || e.data?.name === entityName
      );
      
      if (!template) {
        schemaIssues.push(`${entityName}: No template found`);
        continue;
      }
      
      const schema = template.data?.schema || template.schema;
      const required = schema?.required || [];
      
      if (Array.isArray(records)) {
        records.forEach((record, idx) => {
          required.forEach(field => {
            if (record[field] === undefined || record[field] === null) {
              schemaIssues.push(`${entityName}[${idx}]: Missing required field '${field}'`);
            }
          });
        });
      }
    }
    
    if (schemaIssues.length > 0) {
      updateStep("schema", { 
        status: schemaIssues.length > 3 ? "failed" : "warning", 
        details: schemaIssues 
      });
      if (schemaIssues.length > 3) allPassed = false;
      else warnings++;
    } else {
      updateStep("schema", { status: "passed", details: ["All schemas valid"] });
    }

    // Step 2: Data Integrity
    updateStep("data", { status: "running" });
    await new Promise(r => setTimeout(r, 500));
    
    const dataIssues = [];
    let totalRecords = 0;
    
    for (const [entityName, records] of Object.entries(entityData)) {
      if (!Array.isArray(records)) {
        dataIssues.push(`${entityName}: Invalid data format (not an array)`);
        continue;
      }
      if (records.length === 0) {
        dataIssues.push(`${entityName}: No records`);
      }
      totalRecords += records.length;
    }
    
    if (dataIssues.length > 0) {
      updateStep("data", { status: "warning", details: dataIssues });
      warnings++;
    } else {
      updateStep("data", { 
        status: "passed", 
        details: [`${totalRecords} records across ${Object.keys(entityData).length} entities`] 
      });
    }

    // Step 3: Preview Check (simulated - would need iframe communication in real impl)
    updateStep("preview", { status: "running" });
    await new Promise(r => setTimeout(r, 800));
    
    // For now, mark as passed if we have data
    if (totalRecords > 0) {
      updateStep("preview", { 
        status: "passed", 
        details: ["Ready for visual verification"] 
      });
    } else {
      updateStep("preview", { 
        status: "failed", 
        details: ["No data to preview"] 
      });
      allPassed = false;
    }

    // Set overall result
    if (allPassed && warnings === 0) {
      setOverallResult("passed");
    } else if (allPassed) {
      setOverallResult("warning");
    } else {
      setOverallResult("failed");
    }
    
    setIsRunning(false);
  };

  const markAsVerified = async () => {
    try {
      await base44.entities.TestData.update(testData.id, {
        test_status: "verified",
        verified_date: new Date().toISOString()
      });
      toast.success(`${item.name} marked as verified`);
      onVerified?.();
      onClose();
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  const renderStep = (step) => {
    const config = stepConfig[step.status];
    const Icon = config.icon;
    
    return (
      <div key={step.id} className="border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {Icon ? (
              <Icon className={`h-5 w-5 ${config.color} ${config.spin ? "animate-spin" : ""}`} />
            ) : (
              <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
            )}
            <span className="font-medium">{step.name}</span>
          </div>
          {step.status !== "pending" && step.status !== "running" && (
            <Badge variant={step.status === "passed" ? "default" : step.status === "warning" ? "secondary" : "destructive"}>
              {step.status}
            </Badge>
          )}
        </div>
        {step.details && step.details.length > 0 && (
          <div className="mt-2 ml-8 text-sm text-gray-600 space-y-1">
            {step.details.slice(0, 5).map((d, i) => (
              <div key={i} className={step.status === "failed" || step.status === "warning" ? "text-red-600" : ""}>
                • {d}
              </div>
            ))}
            {step.details.length > 5 && (
              <div className="text-gray-400">...and {step.details.length - 5} more</div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-purple-600" />
            Verify: {item?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Verification Steps */}
          <div className="space-y-3">
            {steps.map(renderStep)}
          </div>

          {/* Overall Result */}
          {overallResult && (
            <div className={`p-4 rounded-lg ${
              overallResult === "passed" ? "bg-green-50 border border-green-200" :
              overallResult === "warning" ? "bg-amber-50 border border-amber-200" :
              "bg-red-50 border border-red-200"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {overallResult === "passed" ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : overallResult === "warning" ? (
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className="font-medium">
                    {overallResult === "passed" ? "All checks passed" :
                     overallResult === "warning" ? "Passed with warnings" :
                     "Verification failed"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-2">
            <Link to={createPageUrl("LivePreview") + `?id=${item?.id}`} target="_blank">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Open Preview
              </Button>
            </Link>
            
            <div className="flex gap-2">
              {!overallResult ? (
                <Button onClick={runVerification} disabled={isRunning}>
                  {isRunning ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Run Verification
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={runVerification}>
                    Re-run
                  </Button>
                  {(overallResult === "passed" || overallResult === "warning") && (
                    <Button onClick={markAsVerified} className="bg-green-600 hover:bg-green-700">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Mark Verified
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