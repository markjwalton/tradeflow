import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  CheckCircle2, XCircle, Clock, Layout, Zap, 
  Database, Play, AlertTriangle, Eye, ChevronDown, 
  ChevronRight, Folder, FolderOpen
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const statusConfig = {
  complete: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100", label: "Complete" },
  verified: { icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-100", label: "Verified" },
  pending: { icon: Clock, color: "text-amber-600", bg: "bg-amber-100", label: "Pending" },
  missing: { icon: XCircle, color: "text-red-600", bg: "bg-red-100", label: "No Data" },
  error: { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-100", label: "Error" }
};

export default function TestDataStatusTable({ 
  items, 
  title,
  description,
  onGenerateData,
  onRunTest,
  onViewItem,
  showActions = true,
  filter = null,
  groupByCategory = true
}) {
  const [expandedGroups, setExpandedGroups] = useState(new Set(["Pages", "Features"]));
  const filteredItems = filter ? items.filter(filter) : items;

  // Group items by type (Pages vs Features)
  const groupedItems = useMemo(() => {
    if (!groupByCategory) return { "All Items": filteredItems };
    
    const groups = {};
    filteredItems.forEach(item => {
      const groupName = item.type === "page" ? "Pages" : "Features";
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(item);
    });
    return groups;
  }, [filteredItems, groupByCategory]);

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupName)) next.delete(groupName);
      else next.add(groupName);
      return next;
    });
  };

  const getGroupStats = (items) => {
    const withData = items.filter(i => i.dataStatus !== "missing").length;
    const verified = items.filter(i => i.testStatus === "verified").length;
    return { total: items.length, withData, verified, missing: items.length - withData };
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
          </div>
          <Badge variant="secondary">{filteredItems.length} items</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {filteredItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-green-500" />
            <p>All items are complete!</p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-10">Type</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-center">Entities</TableHead>
                  <TableHead className="text-center">Records</TableHead>
                  <TableHead className="text-center">Data Status</TableHead>
                  <TableHead className="text-center">Test Status</TableHead>
                  {showActions && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => {
                  const dataStatus = statusConfig[item.dataStatus] || statusConfig.missing;
                  const testStatus = statusConfig[item.testStatus] || statusConfig.pending;
                  const DataIcon = dataStatus.icon;
                  const TestIcon = testStatus.icon;

                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        {item.type === "page" ? (
                          <Layout className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Zap className="h-4 w-4 text-amber-600" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{item.entityCount}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={item.recordCount > 0 ? "secondary" : "outline"}>
                          {item.recordCount}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${dataStatus.bg} ${dataStatus.color}`}>
                          <DataIcon className="h-3 w-3" />
                          {dataStatus.label}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${testStatus.bg} ${testStatus.color}`}>
                          <TestIcon className="h-3 w-3" />
                          {testStatus.label}
                        </div>
                      </TableCell>
                      {showActions && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Link to={createPageUrl("LivePreview") + `?id=${item.id}`}>
                              <Button size="sm" variant="ghost" title="Preview">
                                <Eye className="h-3 w-3" />
                              </Button>
                            </Link>
                            {item.dataStatus === "missing" && (
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => onGenerateData?.(item)}
                                title="Generate Test Data"
                              >
                                <Database className="h-3 w-3" />
                              </Button>
                            )}
                            {item.dataStatus !== "missing" && item.testStatus !== "verified" && (
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => onRunTest?.(item)}
                                title="Run Test"
                              >
                                <Play className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}