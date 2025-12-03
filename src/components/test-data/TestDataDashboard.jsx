import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Database, CheckCircle2, AlertTriangle, Clock, 
  FileCheck, XCircle
} from "lucide-react";

export default function TestDataDashboard({ 
  stats, 
  onCardClick 
}) {
  // Calculate coverage percentage
  const coveragePercent = stats.total > 0 ? Math.round((stats.withTestData / stats.total) * 100) : 0;
  const verifiedPercent = stats.withTestData > 0 ? Math.round((stats.tested / stats.withTestData) * 100) : 0;
  const isFullyCovered = stats.withoutTestData === 0 && stats.total > 0;
  const isFullyVerified = stats.pending === 0 && stats.withTestData > 0;

  // Dynamic status message
  let statusMessage = "";
  let statusColor = "text-gray-600";
  
  if (stats.errors > 0) {
    statusMessage = `${stats.errors} items have verification errors`;
    statusColor = "text-red-600";
  } else if (!isFullyCovered) {
    statusMessage = `${stats.withoutTestData} items need test data`;
    statusColor = "text-amber-600";
  } else if (!isFullyVerified) {
    statusMessage = `${stats.pending} items require verification`;
    statusColor = "text-blue-600";
  } else {
    statusMessage = "All pages have test data - 100% coverage!";
    statusColor = "text-green-600";
  }

  const cards = [
    {
      id: "coverage",
      label: "Test Data Coverage",
      value: `${coveragePercent}%`,
      subtext: `${stats.withTestData}/${stats.total} items`,
      icon: Database,
      color: isFullyCovered ? "bg-green-50 border-green-200 text-green-700" : "bg-blue-50 border-blue-200 text-blue-700",
      iconColor: isFullyCovered ? "text-green-600" : "text-blue-600"
    },
    {
      id: "withoutData",
      label: "Missing Test Data",
      value: stats.withoutTestData,
      icon: AlertTriangle,
      color: stats.withoutTestData > 0 ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-green-50 border-green-200 text-green-700",
      iconColor: stats.withoutTestData > 0 ? "text-amber-600" : "text-green-600",
      clickable: stats.withoutTestData > 0
    },
    {
      id: "pending",
      label: "Pending Verification",
      value: stats.pending,
      icon: Clock,
      color: stats.pending > 0 ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-green-50 border-green-200 text-green-700",
      iconColor: stats.pending > 0 ? "text-blue-600" : "text-green-600",
      clickable: stats.pending > 0
    },
    {
      id: "tested",
      label: "Verified",
      value: stats.tested,
      subtext: `${verifiedPercent}% of items with data`,
      icon: FileCheck,
      color: isFullyVerified ? "bg-green-50 border-green-200 text-green-700" : "bg-purple-50 border-purple-200 text-purple-700",
      iconColor: isFullyVerified ? "text-green-600" : "text-purple-600",
      clickable: true
    },
    {
      id: "errors",
      label: "Verification Errors",
      value: stats.errors || 0,
      icon: XCircle,
      color: (stats.errors || 0) > 0 ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700",
      iconColor: (stats.errors || 0) > 0 ? "text-red-600" : "text-green-600",
      clickable: (stats.errors || 0) > 0
    }
  ];

  return (
    <div className="space-y-4 mb-6">
      {/* Status Banner */}
      <div className={`p-3 rounded-lg border ${
        stats.errors > 0 ? "bg-red-50 border-red-200" :
        isFullyVerified && isFullyCovered ? "bg-green-50 border-green-200" :
        "bg-blue-50 border-blue-200"
      }`}>
        <div className="flex items-center gap-2">
          {stats.errors > 0 ? (
            <XCircle className="h-5 w-5 text-red-600" />
          ) : isFullyVerified && isFullyCovered ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <Clock className="h-5 w-5 text-blue-600" />
          )}
          <span className={`font-medium ${statusColor}`}>{statusMessage}</span>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map(card => {
          const Icon = card.icon;
          return (
            <Card 
              key={card.id}
              className={`${card.color} border-2 ${card.clickable ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
              onClick={() => card.clickable && onCardClick?.(card.id)}
            >
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
                <div className="text-2xl font-bold">{card.value}</div>
                <div className="text-xs opacity-80">{card.label}</div>
                {card.subtext && (
                  <div className="text-xs opacity-60 mt-1">{card.subtext}</div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}