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
import { Plus, Trash2, Sparkles, Loader2, ArrowRight, Lightbulb, CheckSquare } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function AIChecklistGenerator({ open, onOpenChange, onGenerate }) {
  const [items, setItems] = useState([{ name: "", description: "" }]);
  const [additionalContext, setAdditionalContext] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [phase, setPhase] = useState("input");
  const [generatedChecklist, setGeneratedChecklist] = useState(null);

  const addItem = () => {
    setItems([...items, { name: "", description: "" }]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleFinishInput = () => {
    const validItems = items.filter((i) => i.name.trim());
    if (validItems.length === 0) {
      toast.error("Please add at least one item");
      return;
    }
    setPhase("context");
  };

  const handleGenerate = async () => {
    setPhase("generating");
    setIsGenerating(true);

    try {
      const validItems = items.filter((i) => i.name.trim());

      const prompt = `You are an expert checklist designer. Based on the user's item descriptions, create a comprehensive checklist with properly organized items.

USER'S CHECKLIST ITEMS:
${validItems.map((i, idx) => `${idx + 1}. ${i.name}${i.description ? `\n   Details: ${i.description}` : ""}`).join("\n")}

ADDITIONAL CONTEXT FROM USER:
${additionalContext || "None provided"}

Generate a complete checklist with well-organized items. For each item:
1. Write a clear, actionable label
2. Add a helpful description if needed
3. Determine if it's a required item
4. Group related items into categories if applicable

Also suggest any additional items that might be missing based on best practices.

Return a JSON object with this structure:
{
  "checklistName": "suggested checklist name",
  "checklistDescription": "checklist description",
  "category": "quality|safety|compliance|preparation|verification|custom",
  "items": [
    {
      "itemId": "item_id",
      "label": "Clear action item",
      "description": "helpful context or instructions",
      "required": true/false,
      "category": "optional category/group name"
    }
  ],
  "requireAllItems": true/false,
  "aiNotes": "any recommendations or items you suggest adding"
}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            checklistName: { type: "string" },
            checklistDescription: { type: "string" },
            category: { type: "string" },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  itemId: { type: "string" },
                  label: { type: "string" },
                  description: { type: "string" },
                  required: { type: "boolean" },
                  category: { type: "string" },
                },
              },
            },
            requireAllItems: { type: "boolean" },
            aiNotes: { type: "string" },
          },
        },
      });

      setGeneratedChecklist(result);
      setPhase("result");
    } catch (error) {
      console.error("AI generation failed:", error);
      toast.error("Failed to generate checklist. Please try again.");
      setPhase("context");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    onGenerate(generatedChecklist);
    handleClose();
  };

  const handleClose = () => {
    setItems([{ name: "", description: "" }]);
    setAdditionalContext("");
    setPhase("input");
    setGeneratedChecklist(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            AI Checklist Generator
          </DialogTitle>
          <DialogDescription>
            {phase === "input" && "Describe the items you need to check and let AI organize them"}
            {phase === "context" && "Add any additional context for the AI"}
            {phase === "generating" && "AI is generating your checklist..."}
            {phase === "result" && "Review and apply the generated checklist"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          {phase === "input" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Enter the items that need to be checked. AI will organize and expand them.
              </p>

              {items.map((item, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-semibold text-sm flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 space-y-2">
                      <Input
                        value={item.name}
                        onChange={(e) => updateItem(index, "name", e.target.value)}
                        placeholder="What needs to be checked? (e.g., Safety equipment, Documents signed, Area clean)"
                        className="font-medium"
                      />
                      <Textarea
                        value={item.description}
                        onChange={(e) => updateItem(index, "description", e.target.value)}
                        placeholder="Optional: Any specific criteria or details..."
                        rows={2}
                        className="text-sm"
                      />
                    </div>
                    {items.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 h-8 w-8 p-0"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </Card>
              ))}

              <Button variant="outline" onClick={addItem} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Another Item
              </Button>

              <div className="flex justify-end pt-4">
                <Button onClick={handleFinishInput}>
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {phase === "context" && (
            <div className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-indigo-800">
                    <p className="font-medium mb-1">You've added {items.filter(i => i.name.trim()).length} items:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {items.filter(i => i.name.trim()).map((i, idx) => (
                        <li key={idx}>{i.name}</li>
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
                  placeholder="Add any additional information:

• Purpose of the checklist (quality, safety, compliance)
• Industry or context
• Regulatory requirements
• Who will be using it
• Any items you might be forgetting"
                  rows={6}
                  className="mt-1"
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setPhase("input")}>
                  Back
                </Button>
                <Button onClick={handleGenerate}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Checklist
                </Button>
              </div>
            </div>
          )}

          {phase === "generating" && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-indigo-500 mb-4" />
              <p className="text-lg font-medium">Generating your checklist...</p>
              <p className="text-sm text-gray-500 mt-1">
                AI is organizing items and suggesting additions
              </p>
            </div>
          )}

          {phase === "result" && generatedChecklist && (
            <div className="space-y-4">
              <Card className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50">
                <h3 className="font-semibold text-lg">{generatedChecklist.checklistName}</h3>
                <p className="text-sm text-gray-600 mt-1">{generatedChecklist.checklistDescription}</p>
                <div className="flex gap-2 mt-2">
                  <Badge>{generatedChecklist.category}</Badge>
                  <Badge variant="outline">{generatedChecklist.items?.length} items</Badge>
                  {generatedChecklist.requireAllItems && (
                    <Badge variant="outline">All required</Badge>
                  )}
                </div>
              </Card>

              <div className="space-y-2">
                <Label>Generated Items</Label>
                {generatedChecklist.items?.map((item, index) => (
                  <Card key={index} className="p-3">
                    <div className="flex items-start gap-2">
                      <CheckSquare className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.label}</span>
                          {item.required && <span className="text-red-500 text-xs">*</span>}
                          {item.category && (
                            <Badge variant="outline" className="text-xs">
                              {item.category}
                            </Badge>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {generatedChecklist.aiNotes && (
                <Card className="p-3 bg-amber-50 border-amber-200">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">AI Recommendations</p>
                      <p className="text-sm text-amber-700 mt-1">{generatedChecklist.aiNotes}</p>
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
                  Apply Checklist
                </Button>
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}