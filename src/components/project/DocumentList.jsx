import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText } from "lucide-react";

export default function DocumentList({ documents = [], projectId, isLoading }) {
  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="h-12 w-12 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-500">No documents yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-stone-500">Document list component - {documents.length} documents</p>
      </CardContent>
    </Card>
  );
}