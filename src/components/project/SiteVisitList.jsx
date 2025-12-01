import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin } from "lucide-react";

export default function SiteVisitList({ reports = [], projectId, isLoading }) {
  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (reports.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <MapPin className="h-12 w-12 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-500">No site visits yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-stone-500">Site visit list component - {reports.length} visits</p>
      </CardContent>
    </Card>
  );
}