import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Database, CheckCircle2, AlertTriangle, Clock, 
  FileCheck, FileX, Sparkles
} from "lucide-react";

export default function TestDataDashboard({ 
  stats, 
  onCardClick 
}) {
  const cards = [
    {
      id: "total",
      label: "Total Pages/Features",
      value: stats.total,
      icon: Database,
      color: "bg-blue-50 border-blue-200 text-blue-700",
      iconColor: "text-blue-600"
    },
    {
      id: "withData",
      label: "With Test Data",
      value: stats.withTestData,
      icon: CheckCircle2,
      color: "bg-green-50 border-green-200 text-green-700",
      iconColor: "text-green-600",
      clickable: true
    },
    {
      id: "withoutData",
      label: "Without Test Data",
      value: stats.withoutTestData,
      icon: AlertTriangle,
      color: stats.withoutTestData > 0 ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-green-50 border-green-200 text-green-700",
      iconColor: stats.withoutTestData > 0 ? "text-amber-600" : "text-green-600",
      clickable: true
    },
    {
      id: "tested",
      label: "Verified & Tested",
      value: stats.tested,
      icon: FileCheck,
      color: "bg-purple-50 border-purple-200 text-purple-700",
      iconColor: "text-purple-600",
      clickable: true
    },
    {
      id: "pending",
      label: "Pending Verification",
      value: stats.pending,
      icon: Clock,
      color: stats.pending > 0 ? "bg-gray-50 border-gray-200 text-gray-700" : "bg-green-50 border-green-200 text-green-700",
      iconColor: "text-gray-600",
      clickable: true
    },
    {
      id: "quality",
      label: "AI Quality Score",
      value: stats.qualityScore ? `${stats.qualityScore}%` : "—",
      icon: Sparkles,
      color: stats.qualityScore >= 80 ? "bg-green-50 border-green-200 text-green-700" : 
             stats.qualityScore >= 60 ? "bg-amber-50 border-amber-200 text-amber-700" : 
             "bg-red-50 border-red-200 text-red-700",
      iconColor: "text-purple-600"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
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
                {card.clickable && (
                  <span className="text-xs opacity-60">Click to view</span>
                )}
              </div>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="text-xs opacity-80">{card.label}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}