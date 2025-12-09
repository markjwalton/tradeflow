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
import { Plus, Trash2, Sparkles, Loader2, ArrowRight, Lightbulb } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function AIFormGenerator({ open, onOpenChange, onGenerate }) {
  const [fields, setFields] = useState([{ name: "", description: "" }]);
  const [additionalContext, setAdditionalContext] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [phase, setPhase] = useState("input");
  const [generatedForm, setGeneratedForm] = useState(null);

  const addField = () => {
    setFields([...fields, { name: "", description: "" }]);
  };

  const updateField = (index, field, value) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], [field]: value };
    setFields(newFields);
  };

  const removeField = (index) => {
    if (fields.length > 1) {
      setFields(fields.filter((_, i) => i !== index));
    }
  };

  const handleFinishInput = () => {
    const validFields = fields.filter((f) => f.name.trim());
    if (validFields.length === 0) {
      toast.error("Please add at least one field");
      return;
    }
    setPhase("context");
  };

  const handleGenerate = async () => {
    setPhase("generating");
    setIsGenerating(true);

    try {
      const validFields = fields.filter((f) => f.name.trim());

      const prompt = `You are an expert form designer. Based on the user's field descriptions, create a complete form with proper field configurations.

USER'S FORM FIELDS:
${validFields.map((f, i) => `${i + 1}. ${f.name}${f.description ? `\n   Details: ${f.description}` : ""}`).join("\n")}

ADDITIONAL CONTEXT FROM USER:
${additionalContext || "None provided"}

Generate a complete form with properly configured fields. For each field, determine:
1. The best field type (text, textarea, number, date, datetime, select, multiselect, checkbox, radio, file, image, rating, section, instructions)
2. A clear label
3. Appropriate placeholder text
4. Help text if needed
5. Whether it should be required
6. Validation rules if applicable
7. Options for select/radio/multiselect fields

Return a JSON object with this structure:
{
  "formName": "suggested form name",
  "formDescription": "form description",
  "category": "survey|checkin|assessment|data_capture|approval|feedback|custom",
  "fields": [
    {
      "fieldId": "field_id",
      "label": "Field Label",
      "type": "text|textarea|number|date|datetime|select|multiselect|checkbox|radio|file|image|rating|section|instructions",
      "placeholder": "placeholder text",
      "helpText": "help text",
      "required": true/false,
      "options": ["option1", "option2"] or null,
      "validation": { "min": number, "max": number, "minLength": number, "maxLength": number } or null,
      "defaultValue": "default value or null"
    }
  ],
  "sections": [
    { "name": "Section Name", "fieldIds": ["field_id1", "field_id2"] }
  ],
  "aiNotes": "any recommendations for improving the form"
}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            formName: { type: "string" },
            formDescription: { type: "string" },
            category: { type: "string" },
            fields: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  fieldId: { type: "string" },
                  label: { type: "string" },
                  type: { type: "string" },
                  placeholder: { type: "string" },
                  helpText: { type: "string" },
                  required: { type: "boolean" },
                  options: { type: "array" },
                  validation: { type: "object" },
                  defaultValue: { type: "string" },
                },
              },
            },
            sections: { type: "array" },
            aiNotes: { type: "string" },
          },
        },
      });

      setGeneratedForm(result);
      setPhase("result");
    } catch (error) {
      console.error("AI generation failed:", error);
      toast.error("Failed to generate form. Please try again.");
      setPhase("context");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    onGenerate(generatedForm);
    handleClose();
  };

  const handleClose = () => {
    setFields([{ name: "", description: "" }]);
    setAdditionalContext("");
    setPhase("input");
    setGeneratedForm(null);
    onOpenChange(false);
  };

  const fieldTypeColors = {
    text: "bg-info-50 text-info",
    textarea: "bg-info-50 text-info",
    number: "bg-success-50 text-success",
    date: "bg-accent/10 text-accent",
    datetime: "bg-accent/10 text-accent",
    select: "bg-warning/10 text-warning",
    multiselect: "bg-warning/10 text-warning",
    checkbox: "bg-info-50 text-info",
    radio: "bg-info-50 text-info",
    file: "bg-accent-100 text-accent",
    image: "bg-accent-100 text-accent",
    rating: "bg-secondary/10 text-secondary",
    section: "bg-muted text-muted-foreground",
    instructions: "bg-muted text-muted-foreground",
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-warning" />
            AI Form Generator
          </DialogTitle>
          <DialogDescription>
            {phase === "input" && "Describe the fields you need and let AI configure them"}
            {phase === "context" && "Add any additional context for the AI"}
            {phase === "generating" && "AI is generating your form..."}
            {phase === "result" && "Review and apply the generated form"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          {phase === "input" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter the information you want to capture. Don't worry about field types - AI will figure that out.
              </p>

              {fields.map((field, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 space-y-2">
                      <Input
                        value={field.name}
                        onChange={(e) => updateField(index, "name", e.target.value)}
                        placeholder="What do you want to capture? (e.g., Customer Name, Budget Range, Site Photos)"
                        className="font-medium"
                      />
                      <Textarea
                        value={field.description}
                        onChange={(e) => updateField(index, "description", e.target.value)}
                        placeholder="Optional: Any specific requirements or options..."
                        rows={2}
                        className="text-sm"
                      />
                    </div>
                    {fields.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive h-8 w-8 p-0"
                        onClick={() => removeField(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </Card>
              ))}

              <Button variant="outline" onClick={addField} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Another Field
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
              <div className="bg-info/10 border border-info/30 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-5 w-5 text-info flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-info">
                    <p className="font-medium mb-1">You've added {fields.filter(f => f.name.trim()).length} fields:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {fields.filter(f => f.name.trim()).map((f, i) => (
                        <li key={i}>{f.name}</li>
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

• Purpose of the form
• Who will be filling it out
• Any validation requirements
• Grouping or sections needed
• Mobile-friendly considerations"
                  rows={6}
                  className="mt-1"
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setPhase("input")}>
                  Back
                </Button>
                <Button onClick={handleGenerate} className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Form
                </Button>
              </div>
            </div>
          )}

          {phase === "generating" && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-lg font-medium text-foreground">Generating your form...</p>
              <p className="text-sm text-muted-foreground mt-1">
                AI is configuring field types and validation
              </p>
            </div>
          )}

          {phase === "result" && generatedForm && (
            <div className="space-y-4">
              <Card className="p-4 bg-gradient-to-r from-primary/10 to-accent/10">
                <h3 className="font-semibold text-lg text-foreground">{generatedForm.formName}</h3>
                <p className="text-sm text-muted-foreground mt-1">{generatedForm.formDescription}</p>
                <div className="flex gap-2 mt-2">
                  <Badge>{generatedForm.category}</Badge>
                  <Badge variant="outline">{generatedForm.fields?.length} fields</Badge>
                </div>
              </Card>

              <div className="space-y-2">
                <Label>Generated Fields</Label>
                {generatedForm.fields?.map((field, index) => (
                  <Card key={index} className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{field.label}</span>
                      {field.required && <span className="text-destructive">*</span>}
                      <Badge className={fieldTypeColors[field.type] || "bg-muted text-muted-foreground"}>
                        {field.type}
                      </Badge>
                    </div>
                    {field.helpText && (
                      <p className="text-xs text-muted-foreground mt-1">{field.helpText}</p>
                    )}
                    {field.options?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {field.options.map((opt, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {opt}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </Card>
                ))}
              </div>

              {generatedForm.aiNotes && (
                <Card className="p-3 bg-[var(--color-secondary)]/10 border-[var(--color-secondary)]/30">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-[var(--color-secondary)] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-[var(--color-secondary-dark)]">AI Recommendations</p>
                      <p className="text-sm text-[var(--color-secondary-dark)] mt-1">{generatedForm.aiNotes}</p>
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
                  Apply Form
                </Button>
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}