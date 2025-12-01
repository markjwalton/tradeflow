import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";

export default function ClientAccessManager({ projectId }) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <User className="h-12 w-12 text-stone-300 mx-auto mb-4" />
        <p className="text-stone-500">Client portal access manager</p>
      </CardContent>
    </Card>
  );
}