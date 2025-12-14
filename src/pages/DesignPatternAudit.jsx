import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Trash2, Check, X, Eye } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/sturij";

export default function DesignPatternAudit() {
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: patterns = [], isLoading: patternsLoading } = useQuery({
    queryKey: ["designPatterns"],
    queryFn: () => base44.entities.DesignPattern.list("-created_date"),
  });

  const { data: interactions = [], isLoading: interactionsLoading } = useQuery({
    queryKey: ["designInteractions"],
    queryFn: () => base44.entities.DesignInteraction.list("-created_date", 100),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.DesignPattern.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["designPatterns"] });
      toast.success("Pattern deleted");
    },
  });

  const validateMutation = useMutation({
    mutationFn: ({ id, isValidated }) => 
      base44.entities.DesignPattern.update(id, { is_validated: isValidated }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["designPatterns"] });
      toast.success("Pattern updated");
    },
  });

  const validatedPatterns = patterns.filter(p => p.is_validated);
  const unvalidatedPatterns = patterns.filter(p => !p.is_validated);

  const categoryColors = {
    spacing: "bg-blue-100 text-blue-800",
    typography: "bg-purple-100 text-purple-800",
    color: "bg-pink-100 text-pink-800",
    layout: "bg-green-100 text-green-800",
    component: "bg-orange-100 text-orange-800",
    other: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="max-w-6xl mx-auto -mt-6">
      <PageHeader 
        title="Design Pattern Audit"
        description="Review and manage design patterns learned by the AI assistant"
      />

      <Tabs defaultValue="patterns" className="space-y-6">
        <TabsList>
          <TabsTrigger value="patterns">Patterns ({patterns.length})</TabsTrigger>
          <TabsTrigger value="interactions">Interactions ({interactions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="patterns" className="space-y-6">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Validated Patterns</CardTitle>
                <CardDescription>Patterns marked as correct and reusable</CardDescription>
              </CardHeader>
              <CardContent>
                {validatedPatterns.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No validated patterns yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {validatedPatterns.map((pattern) => (
                      <div
                        key={pattern.id}
                        className="border rounded-lg p-4 flex items-start justify-between hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">{pattern.pattern_name}</h3>
                            <Badge className={categoryColors[pattern.category]}>
                              {pattern.category}
                            </Badge>
                            <Badge variant="outline">
                              {pattern.element_type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{pattern.description}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Used {pattern.use_count} times
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedPattern(pattern);
                              setViewDetailsOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => validateMutation.mutate({ id: pattern.id, isValidated: false })}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => deleteMutation.mutate(pattern.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Unvalidated Patterns</CardTitle>
                <CardDescription>Review and validate or delete these patterns</CardDescription>
              </CardHeader>
              <CardContent>
                {unvalidatedPatterns.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No unvalidated patterns
                  </p>
                ) : (
                  <div className="space-y-3">
                    {unvalidatedPatterns.map((pattern) => (
                      <div
                        key={pattern.id}
                        className="border rounded-lg p-4 flex items-start justify-between hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">{pattern.pattern_name}</h3>
                            <Badge className={categoryColors[pattern.category]}>
                              {pattern.category}
                            </Badge>
                            <Badge variant="outline">
                              {pattern.element_type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{pattern.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedPattern(pattern);
                              setViewDetailsOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-green-600"
                            onClick={() => validateMutation.mutate({ id: pattern.id, isValidated: true })}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => deleteMutation.mutate(pattern.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="interactions" className="space-y-4">
          {interactionsLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading interactions...</p>
          ) : interactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No interactions yet</p>
          ) : (
            <div className="space-y-3">
              {interactions.map((interaction) => (
                <Card key={interaction.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{interaction.user_request}</CardTitle>
                        <CardDescription>
                          Page: {interaction.page_slug} • {new Date(interaction.created_date).toLocaleString()}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        {interaction.saved_as_pattern && (
                          <Badge className="bg-green-100 text-green-800">Saved as Pattern</Badge>
                        )}
                        {interaction.was_applied && (
                          <Badge className="bg-blue-100 text-blue-800">Applied</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>Element:</strong> {interaction.selected_element?.tagName}
                      </div>
                      <div>
                        <strong>AI Assessment:</strong>
                        <p className="text-muted-foreground mt-1">{interaction.ai_assessment}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedPattern && (
        <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedPattern.pattern_name}</DialogTitle>
              <DialogDescription>{selectedPattern.description}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Before Styles</h4>
                <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                  {JSON.stringify(selectedPattern.before_styles, null, 2)}
                </pre>
              </div>
              <div>
                <h4 className="font-medium mb-2">After Styles</h4>
                <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                  {JSON.stringify(selectedPattern.after_styles, null, 2)}
                </pre>
              </div>
              {selectedPattern.change_notes && (
                <div>
                  <h4 className="font-medium mb-2">Change Notes</h4>
                  <p className="text-sm text-muted-foreground">{selectedPattern.change_notes}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}