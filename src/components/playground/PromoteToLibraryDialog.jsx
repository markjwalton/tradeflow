import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowUpCircle, Loader2, Sparkles, CheckCircle2, Code
} from "lucide-react";
import { toast } from "sonner";

export default function PromoteToLibraryDialog({ 
  item, 
  template, 
  workingData,
  journalEntries = [],
  onClose,
  type
}) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [devPrompt, setDevPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSprintId, setSelectedSprintId] = useState("");

  const { data: sprints = [] } = useQuery({
    queryKey: ["sprints"],
    queryFn: () => base44.entities.DevelopmentSprint.filter({ status: "active" }),
  });

  const { data: planingSprints = [] } = useQuery({
    queryKey: ["planningSprints"],
    queryFn: () => base44.entities.DevelopmentSprint.filter({ status: "planning" }),
  });

  const allSprints = [...sprints, ...planingSprints];

  const generateDevPrompt = async () => {
    setIsGenerating(true);
    try {
      const journalContext = journalEntries.length > 0
        ? journalEntries.map(e => `[${e.entry_type}] ${e.content}`).join("\n\n")
        : "No journal entries";

      const dataToAnalyze = workingData || template;
      
      let templateContext = "";
      if (type === "entity") {
        templateContext = `Entity: ${dataToAnalyze.name}
Description: ${dataToAnalyze.description}
Fields: ${JSON.stringify(dataToAnalyze.schema?.properties || {}, null, 2)}
Relationships: ${JSON.stringify(dataToAnalyze.relationships || [])}`;
      } else if (type === "page") {
        templateContext = `Page: ${dataToAnalyze.name}
Description: ${dataToAnalyze.description}
Components: ${JSON.stringify(dataToAnalyze.components || [])}
Entities Used: ${JSON.stringify(dataToAnalyze.entities_used || [])}`;
      } else if (type === "feature") {
        templateContext = `Feature: ${dataToAnalyze.name}
Description: ${dataToAnalyze.description}
Requirements: ${JSON.stringify(dataToAnalyze.requirements || [])}
User Stories: ${JSON.stringify(dataToAnalyze.user_stories || [])}`;
      }

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a comprehensive development prompt for implementing this ${type} in a production application.

${type.toUpperCase()} DETAILS:
${templateContext}

PLAYGROUND JOURNAL (change requests, enhancements, notes):
${journalContext}

VERSION: ${item.current_version}
TEST STATUS: ${item.test_status}

Create a detailed, actionable development prompt that:
1. Provides clear context about the ${type}
2. Lists specific requirements and acceptance criteria
3. Incorporates insights from the playground journal
4. References the tested schema/components
5. Is ready to paste into an AI coding assistant

Output only the prompt text.`
      });

      setDevPrompt(result);
      setStep(2);
    } catch (error) {
      toast.error("Failed to generate development prompt");
    } finally {
      setIsGenerating(false);
    }
  };

  const createRoadmapItem = useMutation({
    mutationFn: async () => {
      const dataToUse = workingData || template;
      
      // Create roadmap item
      const roadmapItem = await base44.entities.RoadmapItem.create({
        title: `Implement ${type}: ${dataToUse.name}`,
        description: dataToUse.description,
        category: "feature",
        priority: "high",
        status: selectedSprintId ? "in_sprint" : "ready",
        source: "discussion",
        tags: [type, "playground", "promoted"],
        development_prompt: devPrompt,
        sprints: selectedSprintId ? [{
          sprint_id: selectedSprintId,
          sprint_name: allSprints.find(s => s.id === selectedSprintId)?.name,
          added_date: new Date().toISOString()
        }] : []
      });

      // Update playground item status
      await base44.entities.PlaygroundItem.update(item.id, {
        status: "promoted",
        promotion_status: "approved",
        development_prompt: devPrompt
      });

      return roadmapItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playgroundItems"] });
      queryClient.invalidateQueries({ queryKey: ["roadmapItems"] });
      toast.success("Promoted to roadmap! Ready for sprint development.");
      onClose();
    }
  });

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[var(--color-midnight)]">
            <ArrowUpCircle className="h-5 w-5 text-[var(--color-success)]" />
            Promote to Library & Sprint
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <div className="bg-[var(--color-info)]/10 p-4 rounded-lg">
              <h3 className="font-medium text-[var(--color-info-dark)] mb-2">Ready to Promote</h3>
              <p className="text-sm text-[var(--color-info-dark)]">
                This will generate a development prompt based on your playground work 
                and create a roadmap item for the sprint process.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-[var(--color-midnight)]">Summary</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-[var(--color-background)] p-2 rounded">
                  <span className="text-[var(--color-charcoal)]">Type:</span> <span className="text-[var(--color-midnight)]">{type}</span>
                </div>
                <div className="bg-[var(--color-background)] p-2 rounded">
                  <span className="text-[var(--color-charcoal)]">Version:</span> <span className="text-[var(--color-midnight)]">{item.current_version}</span>
                </div>
                <div className="bg-[var(--color-background)] p-2 rounded">
                  <span className="text-[var(--color-charcoal)]">Test Status:</span> 
                  <Badge className={
                    item.test_status === "passed" ? "ml-2 bg-[var(--color-success)]/20 text-[var(--color-success-dark)]" :
                    item.test_status === "failed" ? "ml-2 bg-[var(--color-destructive)]/20 text-[var(--color-destructive)]" :
                    "ml-2 bg-[var(--color-charcoal)]/10 text-[var(--color-charcoal)]"
                  }>{item.test_status}</Badge>
                </div>
                <div className="bg-[var(--color-background)] p-2 rounded">
                  <span className="text-[var(--color-charcoal)]">Journal Entries:</span> <span className="text-[var(--color-midnight)]">{journalEntries.length}</span>
                </div>
              </div>
            </div>

            <Button onClick={generateDevPrompt} disabled={isGenerating} className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white">
              {isGenerating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Generate Development Prompt
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[var(--color-success)]">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">Development Prompt Generated</span>
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--color-midnight)]">Development Prompt</label>
              <Textarea
                value={devPrompt}
                onChange={(e) => setDevPrompt(e.target.value)}
                rows={10}
                className="font-mono text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--color-midnight)]">Assign to Sprint (optional)</label>
              <Select value={selectedSprintId} onValueChange={setSelectedSprintId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a sprint..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>No sprint (mark as Ready)</SelectItem>
                  {allSprints.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({s.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button 
                onClick={() => createRoadmapItem.mutate()} 
                disabled={createRoadmapItem.isPending}
                className="flex-1 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white"
              >
                {createRoadmapItem.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Code className="h-4 w-4 mr-2" />
                )}
                Create Roadmap Item
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}