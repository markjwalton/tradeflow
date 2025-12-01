import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";

export default function ContactList({ contacts = [], projectId, isLoading }) {
  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (contacts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Users className="h-12 w-12 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-500">No contacts yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-stone-500">Contact list component - {contacts.length} contacts</p>
      </CardContent>
    </Card>
  );
}