import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";

export default function ProjectTeam({ projectId, tasks = [], isLoading }) {
  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <Card>
      <CardContent className="py-12 text-center">
        <Users className="h-12 w-12 text-stone-300 mx-auto mb-4" />
        <p className="text-stone-500">Team allocation component</p>
      </CardContent>
    </Card>
  );
}