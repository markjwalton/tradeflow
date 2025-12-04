/**
 * TestDataDisplay - Standalone test data display component
 * 
 * Uses TestDataProvider context to render test data.
 * Works as a standalone element.
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Database, CheckCircle2, Clock, AlertTriangle, 
  Save, RefreshCw, Trash2, Plus 
} from "lucide-react";
import { useTestData } from "./TestDataProvider";

/**
 * TestDataDisplay
 * 
 * Props:
 * - variant: "table" | "cards" | "minimal" - Display variant
 * - showActions: boolean - Show edit actions
 * - showStatus: boolean - Show verification status
 * - className: string - Additional CSS classes
 * - onRecordClick: function - Callback when record clicked
 */
export function TestDataDisplay({
  variant = "table",
  showActions = false,
  showStatus = true,
  className = "",
  onRecordClick = null
}) {
  const { 
    entityData,
    testStatus,
    isLoading,
    hasChanges,
    getEntityNames,
    getTotalRecords,
    hasData,
    save,
    verify,
    refetch,
    deleteRecord
  } = useTestData();

  if (isLoading) {
    return (
      <div className={`animate-pulse space-y-4 ${className}`}>
        <div className="h-8 bg-muted rounded" />
        <div className="h-32 bg-muted rounded" />
      </div>
    );
  }

  const entityNames = getEntityNames();
  const totalRecords = getTotalRecords();

  // Status badge
  const StatusBadge = () => {
    if (!showStatus) return null;
    
    const config = {
      verified: { icon: CheckCircle2, color: "bg-green-100 text-green-700", label: "Verified" },
      pending: { icon: Clock, color: "bg-amber-100 text-amber-700", label: "Pending" },
      failed: { icon: AlertTriangle, color: "bg-red-100 text-red-700", label: "Failed" },
      mock: { icon: Database, color: "bg-blue-100 text-blue-700", label: "Mock Data" },
      none: { icon: AlertTriangle, color: "bg-gray-100 text-gray-700", label: "No Data" },
    }[testStatus] || { icon: Clock, color: "bg-gray-100 text-gray-700", label: testStatus };
    
    const Icon = config.icon;
    return (
      <Badge className={`${config.color} gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  // Table variant
  if (variant === "table") {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Database className="h-4 w-4" />
              Test Data
              <Badge variant="outline">{totalRecords} records</Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <StatusBadge />
              {showActions && (
                <>
                  <Button variant="ghost" size="icon" onClick={refetch}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  {hasChanges && (
                    <Button size="sm" onClick={save}>
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!hasData() ? (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p>No test data</p>
            </div>
          ) : (
            <div className="space-y-4">
              {entityNames.map(entityName => {
                const records = entityData[entityName] || [];
                if (records.length === 0) return null;
                
                const columns = Object.keys(records[0] || {}).filter(k => k !== "id").slice(0, 5);
                
                return (
                  <div key={entityName}>
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                      <Database className="h-3 w-3" />
                      {entityName}
                      <Badge variant="secondary" className="text-xs">{records.length}</Badge>
                    </h4>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-muted/50">
                          <tr>
                            {columns.map(col => (
                              <th key={col} className="text-left p-2 font-medium">{col}</th>
                            ))}
                            {showActions && <th className="w-10" />}
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {records.map((record, i) => (
                            <tr 
                              key={record.id || i} 
                              className="hover:bg-muted/30 cursor-pointer"
                              onClick={() => onRecordClick?.(entityName, record)}
                            >
                              {columns.map(col => (
                                <td key={col} className="p-2 truncate max-w-32">
                                  {formatValue(record[col])}
                                </td>
                              ))}
                              {showActions && (
                                <td className="p-2">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteRecord(entityName, record.id);
                                    }}
                                  >
                                    <Trash2 className="h-3 w-3 text-destructive" />
                                  </Button>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Cards variant
  if (variant === "cards") {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="font-medium">Test Data</span>
            <Badge variant="outline">{totalRecords} records</Badge>
          </div>
          <StatusBadge />
        </div>
        
        {entityNames.map(entityName => {
          const records = entityData[entityName] || [];
          return (
            <div key={entityName}>
              <h4 className="text-sm font-medium mb-2">{entityName}</h4>
              <div className="grid grid-cols-2 gap-2">
                {records.map((record, i) => (
                  <Card 
                    key={record.id || i} 
                    className="p-3 cursor-pointer hover:bg-muted/50"
                    onClick={() => onRecordClick?.(entityName, record)}
                  >
                    <div className="text-xs space-y-1">
                      {Object.entries(record)
                        .filter(([k]) => k !== "id")
                        .slice(0, 3)
                        .map(([k, v]) => (
                          <div key={k} className="flex justify-between">
                            <span className="text-muted-foreground">{k}:</span>
                            <span className="font-medium truncate ml-2">{formatValue(v)}</span>
                          </div>
                        ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Minimal variant
  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      <Database className="h-4 w-4 text-muted-foreground" />
      <span>{totalRecords} records</span>
      <StatusBadge />
    </div>
  );
}

function formatValue(value) {
  if (value === null || value === undefined) return "-";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value).slice(0, 30);
  if (typeof value === "string" && value.length > 30) return value.slice(0, 30) + "...";
  return String(value);
}

export default TestDataDisplay;