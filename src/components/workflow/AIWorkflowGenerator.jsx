import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, Sparkles, Loader2, ArrowRight, Lightbulb, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function AIWorkflowGenerator({ open, onOpenChange, onGenerate }) {
  const [steps, setSteps] = useState([{ name: "", narrative: "" }]);
  const [additionalContext, setAdditionalContext] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [phase, setPhase] = useState("input"); // input, context, generating, result
  const [generatedSteps, setGeneratedSteps] = useState([]);

  const addStep = () => {
    setSteps([...steps, { name: "", narrative: "" }]);
  };

  const updateStep = (index, field, value) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  const removeStep = (index) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(steps);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setSteps(reordered);
  };

  const handleFinishInput = () => {
    const validSteps = steps.filter((s) => s.name.trim());
    if (validSteps.length === 0) {
      toast.error("Please add at least one step");
      return;
    }
    setPhase("context");
  };

  const handleGenerate = async () => {
    setPhase("generating");
    setIsGenerating(true);

    try {
      const validSteps = steps.filter((s) => s.name.trim());
      
      const prompt = `You are an expert workflow designer. Based on the user's high-level step descriptions, create a detailed workflow with proper step configurations.

USER'S WORKFLOW STEPS:
${validSteps.map((s, i) => `${i + 1}. ${s.name}${s.narrative ? `\n   Details: ${s.narrative}` : ""}`).join("\n")}

ADDITIONAL CONTEXT FROM USER:
${additionalContext || "None provided"}

Generate a complete workflow with detailed steps. For each step, determine:
1. The best step type (task, milestone, decision, approval, form, checklist, notification, wait)
2. A clear name and description
3. Suggested assignee type (user, role, team, auto, requester)
4. Estimated duration in hours
5. Whether it requires a form or checklist
6. Any decision branches if applicable
7. Suggested triggers/automations (notifications, emails, entity updates)

Return a JSON object with this structure:
{
  "workflowName": "suggested workflow name",
  "workflowDescription": "workflow description",
  "category": "sales|project|manufacturing|installation|service|admin|custom",
  "estimatedTotalDays": number,
  "steps": [
    {
      "name": "Step Name",
      "code": "step_code",
      "description": "What this step involves",
      "stepType": "task|milestone|decision|approval|form|checklist|notification|wait",
      "assigneeType": "user|role|team|auto|requester",
      "assigneeRole": "suggested role if assigneeType is role",
      "estimatedDurationHours": number,
      "instructions": "detailed instructions for the assignee",
      "isRequired": true/false,
      "canSkip": true/false,
      "suggestedForm": { "name": "form name", "fields": ["field1", "field2"] } or null,
      "suggestedChecklist": { "name": "checklist name", "items": ["item1", "item2"] } or null,
      "decisionOptions": [{ "label": "option", "description": "when to choose this" }] or null,
      "triggers": [{ "event": "on_step_complete|on_step_start", "action": "send_email|send_notification|update_entity", "description": "what it does" }]
    }
  ],
  "aiNotes": "any additional recommendations or insights"
}`;

      console.log("Sending prompt to AI:", prompt);
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            workflowName: { type: "string" },
            workflowDescription: { type: "string" },
            category: { type: "string" },
            estimatedTotalDays: { type: "number" },
            steps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  code: { type: "string" },
                  description: { type: "string" },
                  stepType: { type: "string" },
                  assigneeType: { type: "string" },
                  assigneeRole: { type: "string" },
                  estimatedDurationHours: { type: "number" },
                  instructions: { type: "string" },
                  isRequired: { type: "boolean" },
                  canSkip: { type: "boolean" },
                  suggestedFormName: { type: "string" },
                  suggestedFormFields: { type: "array", items: { type: "string" } },
                  suggestedChecklistName: { type: "string" },
                  suggestedChecklistItems: { type: "array", items: { type: "string" } },
                  decisionOptions: { 
                    type: "array", 
                    items: { 
                      type: "object",
                      properties: {
                        label: { type: "string" },
                        description: { type: "string" }
                      }
                    } 
                  },
                  triggers: { 
                    type: "array", 
                    items: { 
                      type: "object",
                      properties: {
                        event: { type: "string" },
                        action: { type: "string" },
                        description: { type: "string" }
                      }
                    } 
                  },
                },
              },
            },
            aiNotes: { type: "string" },
          },
        },
      });

      console.log("AI result:", result);

      if (!result || !result.steps || result.steps.length === 0) {
        throw new Error("AI returned empty or invalid response");
      }

      setGeneratedSteps(result);
      setPhase("result");
      toast.success(`Generated ${result.steps.length} workflow steps`);
    } catch (error) {
      console.error("AI generation failed:", error);
      toast.error("Failed to generate workflow. Please try again.");
      setPhase("context");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    onGenerate(generatedSteps);
    handleClose();
  };

  const handleClose = () => {
    setSteps([{ name: "", narrative: "" }]);
    setAdditionalContext("");
    setPhase("input");
    setGeneratedSteps([]);
    onOpenChange(false);
  };

  const stepTypeColors = {
    task: "bg-blue-100 text-blue-800",
    milestone: "bg-green-100 text-green-800",
    decision: "bg-purple-100 text-purple-800",
    approval: "bg-amber-100 text-amber-800",
    form: "bg-cyan-100 text-cyan-800",
    checklist: "bg-indigo-100 text-indigo-800",
    notification: "bg-orange-100 text-orange-800",
    wait: "bg-gray-100 text-gray-800",
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            AI Workflow Generator
          </DialogTitle>
          <DialogDescription>
            {phase === "input" && "Describe your workflow steps and let AI build the details"}
            {phase === "context" && "Add any additional context for the AI"}
            {phase === "generating" && "AI is generating your workflow..."}
            {phase === "result" && "Review and apply the generated workflow"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          {/* Phase 1: Input Steps */}
          {phase === "input" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Enter the key steps of your workflow. Drag to reorder. Don't worry about details - just describe what needs to happen.
              </p>

              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="workflow-input-steps">
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
                      {steps.map((step, index) => (
                        <Draggable key={index} draggableId={`step-${index}`} index={index}>
                          {(provided, snapshot) => (
                            <Card 
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`p-4 ${snapshot.isDragging ? "shadow-lg ring-2 ring-blue-300" : ""}`}
                            >
                              <div className="flex items-start gap-3">
                                <div 
                                  {...provided.dragHandleProps}
                                  className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm flex-shrink-0 cursor-grab active:cursor-grabbing"
                                >
                                  <GripVertical className="h-4 w-4" />
                                </div>
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-600 font-semibold text-xs flex-shrink-0">
                                  {index + 1}
                                </div>
                                <div className="flex-1 space-y-2">
                                  <Input
                                    value={step.name}
                                    onChange={(e) => updateStep(index, "name", e.target.value)}
                                    placeholder="Step name (e.g., Book Site Visit, Design Review, Customer Approval)"
                                    className="font-medium"
                                  />
                                  <Textarea
                                    value={step.narrative}
                                    onChange={(e) => updateStep(index, "narrative", e.target.value)}
                                    placeholder="Optional: Add any details, requirements, or context for this step..."
                                    rows={2}
                                    className="text-sm"
                                  />
                                </div>
                                {steps.length > 1 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 h-8 w-8 p-0"
                                    onClick={() => removeStep(index)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              <Button variant="outline" onClick={addStep} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Another Step
              </Button>

              <div className="flex justify-end pt-4">
                <Button onClick={handleFinishInput}>
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Phase 2: Additional Context */}
          {phase === "context" && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">You've added {steps.filter(s => s.name.trim()).length} steps:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {steps.filter(s => s.name.trim()).map((s, i) => (
                        <li key={i}>{s.name}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <Label>Additional Context for AI (Optional)</Label>
                <Textarea
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  placeholder="Add any additional information that might help the AI create a better workflow:

• Industry or business type
• Typical timelines or deadlines
• Key stakeholders or roles involved
• Compliance or quality requirements
• Integration needs (emails, notifications)
• Any specific forms or checklists needed
• Decision points and approval requirements"
                  rows={8}
                  className="mt-1"
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setPhase("input")}>
                  Back
                </Button>
                <Button onClick={handleGenerate}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Workflow
                </Button>
              </div>
            </div>
          )}

          {/* Phase 3: Generating */}
          {phase === "generating" && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
              <p className="text-lg font-medium">Generating your workflow...</p>
              <p className="text-sm text-gray-500 mt-1">
                AI is analyzing your steps and creating detailed configurations
              </p>
            </div>
          )}

          {/* Phase 4: Result */}
          {phase === "result" && generatedSteps && (
            <div className="space-y-4">
              <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50">
                <h3 className="font-semibold text-lg">{generatedSteps.workflowName}</h3>
                <p className="text-sm text-gray-600 mt-1">{generatedSteps.workflowDescription}</p>
                <div className="flex gap-2 mt-2">
                  <Badge>{generatedSteps.category}</Badge>
                  <Badge variant="outline">~{generatedSteps.estimatedTotalDays} days</Badge>
                  <Badge variant="outline">{generatedSteps.steps?.length} steps</Badge>
                </div>
              </Card>

              <div className="space-y-2">
                <Label>Generated Steps</Label>
                {generatedSteps.steps?.map((step, index) => (
                  <Card key={index} className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-600 font-semibold text-xs flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{step.name}</span>
                          <Badge className={stepTypeColors[step.stepType] || "bg-gray-100"}>
                            {step.stepType}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {step.assigneeRole && (
                            <Badge variant="outline" className="text-xs">
                              {step.assigneeRole}
                            </Badge>
                          )}
                          {step.estimatedDurationHours && (
                            <Badge variant="outline" className="text-xs">
                              {step.estimatedDurationHours}h
                            </Badge>
                          )}
                          {step.suggestedForm && (
                            <Badge variant="outline" className="text-xs bg-cyan-50">
                              + Form
                            </Badge>
                          )}
                          {step.suggestedChecklist && (
                            <Badge variant="outline" className="text-xs bg-indigo-50">
                              + Checklist
                            </Badge>
                          )}
                          {step.triggers?.length > 0 && (
                            <Badge variant="outline" className="text-xs bg-amber-50">
                              {step.triggers.length} triggers
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {generatedSteps.aiNotes && (
                <Card className="p-3 bg-amber-50 border-amber-200">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">AI Recommendations</p>
                      <p className="text-sm text-amber-700 mt-1">{generatedSteps.aiNotes}</p>
                    </div>
                  </div>
                </Card>
              )}

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setPhase("context")}>
                  Back & Refine
                </Button>
                <Button onClick={handleApply}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Apply Workflow
                </Button>
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}