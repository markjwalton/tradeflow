import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SchemaAIPanel({ open, onClose, onSchemaGenerated }) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a description");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a JSON schema for the following description. Return only valid JSON schema with name, type, properties, and required fields:\n\n${prompt}`,
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            type: { type: "string" },
            properties: {
              type: "object",
              additionalProperties: true,
            },
            required: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: ["name", "type", "properties"],
        },
      });

      onSchemaGenerated(result);
      toast.success("Schema generated successfully");
      setPrompt("");
    } catch (e) {
      toast.error("Failed to generate schema: " + e.message);
    }
    setIsGenerating(false);
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[500px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Schema Generator
          </SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-6">
          <div>
            <Label>Describe your entity</Label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., 'A user entity with name, email, age, and profile picture URL'"
              className="mt-2 h-32"
            />
          </div>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Schema
              </>
            )}
          </Button>

          <div className="border-t pt-4 mt-6">
            <h4 className="text-sm font-semibold mb-2">Quick Templates</h4>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() =>
                  setPrompt(
                    "A product entity with name, description, price, stock quantity, category, and image URL"
                  )
                }
              >
                E-commerce Product
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() =>
                  setPrompt(
                    "A blog post entity with title, content, author, published date, tags, and featured image"
                  )
                }
              >
                Blog Post
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() =>
                  setPrompt(
                    "A task entity with title, description, status, priority, due date, and assigned user"
                  )
                }
              >
                Task Management
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}