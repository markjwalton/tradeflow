import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ListTodo } from "lucide-react";

export default function TaskList({ tasks = [], projectId, isLoading }) {
  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <ListTodo className="h-12 w-12 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-500">No tasks yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-stone-500">Task list component - {tasks.length} tasks</p>
      </CardContent>
    </Card>
  );
}