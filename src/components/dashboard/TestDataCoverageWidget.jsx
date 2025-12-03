import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { AlertTriangle, CheckCircle2, ArrowRight, Loader2, Flag } from "lucide-react";

export default function TestDataCoverageWidget() {
  const { data: playgroundItems = [], isLoading: loadingItems } = useQuery({
    queryKey: ["playgroundItems-widget"],
    queryFn: () => base44.entities.PlaygroundItem.list(),
  });

  const { data: testDataSets = [], isLoading: loadingTestData } = useQuery({
    queryKey: ["testData-widget"],
    queryFn: () => base44.entities.TestData.list(),
  });

  const isLoading = loadingItems || loadingTestData;

  // Calculate coverage
  const previewableItems = playgroundItems.filter(p => 
    p.source_type === "page" || p.source_type === "feature"
  );
  
  const itemsWithData = previewableItems.filter(item => 
    testDataSets.some(td => td.playground_item_id === item.id)
  );

  const missingCount = previewableItems.length - itemsWithData.length;
  const coveragePercent = previewableItems.length > 0 
    ? Math.round((itemsWithData.length / previewableItems.length) * 100) 
    : 100;

  const isCritical = missingCount > 0;

  if (isLoading) {
    return (
      <Card className="h-full border-0 shadow-lg">
        <CardContent className="p-5 flex items-center justify-center h-full">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`h-full border-0 shadow-lg overflow-hidden ${isCritical ? "ring-2 ring-red-200" : ""}`}>
      <CardContent className="p-0">
        <div className={`h-1.5 ${isCritical ? "bg-gradient-to-r from-red-500 to-orange-500" : "bg-gradient-to-r from-green-500 to-emerald-500"}`} />
        <div className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Test Data Coverage</p>
                {isCritical && (
                  <Badge className="bg-red-100 text-red-700 text-xs flex items-center gap-1">
                    <Flag className="h-3 w-3" />
                    Action Needed
                  </Badge>
                )}
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <p className="text-3xl font-bold text-slate-900">{coveragePercent}%</p>
                <span className="text-sm text-slate-500">covered</span>
              </div>
            </div>
            {isCritical ? (
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            ) : (
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            )}
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Pages/Features</span>
              <span className="font-medium">{previewableItems.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">With Test Data</span>
              <span className="font-medium text-green-600">{itemsWithData.length}</span>
            </div>
            {missingCount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-red-600 font-medium">Missing Data</span>
                <span className="font-bold text-red-600">{missingCount}</span>
              </div>
            )}
          </div>

          {isCritical && (
            <Link to={createPageUrl("TestDataManager")}>
              <Button className="w-full mt-4 bg-red-600 hover:bg-red-700 gap-2">
                Fix Now
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}

          {!isCritical && (
            <Link to={createPageUrl("TestDataManager")}>
              <Button variant="outline" className="w-full mt-4 gap-2">
                View Details
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}