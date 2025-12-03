import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import { 
  CheckCircle2, XCircle, Loader2, Circle, Database,
  AlertTriangle, RefreshCw
} from "lucide-react";

const statusIcons = {
  pending: Circle,
  processing: Loader2,
  success: CheckCircle2,
  error: XCircle
};

const statusColors = {
  pending: "text-gray-400",
  processing: "text-blue-600",
  success: "text-green-600",
  error: "text-red-600"
};

export default function SeedDataProgress({ 
  isRunning,
  progress,
  onRetry,
  seedQueueCount = 0
}) {
  const { current, total, items, phase } = progress;
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  
  const successCount = items.filter(i => i.status === "success").length;
  const errorCount = items.filter(i => i.status === "error").length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="h-5 w-5 text-purple-600" />
            {phase || "Seed Data Generation"}
          </CardTitle>
          <div className="flex items-center gap-2">
            {successCount > 0 && (
              <Badge className="bg-green-100 text-green-700">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {successCount} Success
              </Badge>
            )}
            {errorCount > 0 && (
              <Badge className="bg-red-100 text-red-700">
                <XCircle className="h-3 w-3 mr-1" />
                {errorCount} Failed
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">
              {isRunning ? "Processing..." : percentage === 100 ? "Complete" : "Ready"}
            </span>
            <span className="text-gray-500">{current} / {total}</span>
          </div>
          <Progress value={percentage} className="h-3" />
        </div>

        {/* Items List */}
        {items.length > 0 && (
          <div className="max-h-64 overflow-y-auto border rounded-lg divide-y">
            {items.map((item, idx) => {
              const Icon = statusIcons[item.status] || Circle;
              const colorClass = statusColors[item.status] || "text-gray-400";
              
              return (
                <div 
                  key={item.id || idx}
                  className={`flex items-center justify-between p-3 ${
                    item.status === "processing" ? "bg-blue-50" :
                    item.status === "success" ? "bg-green-50" :
                    item.status === "error" ? "bg-red-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${colorClass} ${item.status === "processing" ? "animate-spin" : ""}`} />
                    <div>
                      <div className="font-medium text-sm">{item.name}</div>
                      {item.entityCount && (
                        <div className="text-xs text-gray-500">{item.entityCount} entities</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.recordsGenerated && (
                      <Badge variant="secondary" className="text-xs">
                        {item.recordsGenerated} records
                      </Badge>
                    )}
                    {item.status === "error" && item.error && (
                      <span className="text-xs text-red-600 max-w-32 truncate" title={item.error}>
                        {item.error}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Status Info */}
        {!isRunning && items.length > 0 && (
          <div className="flex justify-between items-center pt-2 border-t">
            <div className="text-sm text-gray-500">
              {successCount > 0 && seedQueueCount > 0 && (
                <span className="flex items-center gap-2">
                  <Database className="h-3 w-3 text-green-600" />
                  {seedQueueCount} items queued for seeding
                </span>
              )}
              {successCount > 0 && seedQueueCount === 0 && (
                <span className="text-green-600">All items processed</span>
              )}
            </div>
            <div className="flex gap-2">
              {errorCount > 0 && (
                <Button variant="outline" size="sm" onClick={onRetry}>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry Failed ({errorCount})
                </Button>
              )}
            </div>
          </div>
        )}
        </CardContent>
        </Card>
  );
}