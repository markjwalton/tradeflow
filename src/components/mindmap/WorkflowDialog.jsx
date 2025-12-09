import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Sparkles, ArrowRight, Play, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

const statusIcons = {
  start: <Play className="h-4 w-4 text-success" />,
  process: <Clock className="h-4 w-4 text-info" />,
  decision: <AlertCircle className="h-4 w-4 text-warning" />,
  end: <CheckCircle2 className="h-4 w-4 text-success" />,
};

export default function WorkflowDialog({
  open,
  onOpenChange,
  nodes,
  connections,
  businessContext,
}) {
  const [workflows, setWorkflows] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);

  // Get entity nodes
  const entityNodes = useMemo(() => {
    return nodes.filter(n => n.node_type === "entity");
  }, [nodes]);

  const handleGenerateWorkflows = async () => {
    if (entityNodes.length === 0) {
      toast.error("Add entity nodes first");
      return;
    }

    setIsGenerating(true);
    try {
      const entitiesInfo = entityNodes.map(node => {
        let schema = null;
        try {
          if (node.entity_schema) {
            schema = typeof node.entity_schema === "string" 
              ? JSON.parse(node.entity_schema) 
              : node.entity_schema;
          }
        } catch (e) {}
        
        return {
          name: node.text,
          description: schema?.description || "",
          fields: schema?.properties ? Object.keys(schema.properties) : [],
        };
      });

      const prompt = `You are a business process expert. Analyze these entities and generate realistic business workflows.

BUSINESS CONTEXT:
${businessContext || "General business application"}

ENTITIES:
${JSON.stringify(entitiesInfo, null, 2)}

Generate 3-5 common business workflows that would involve these entities. For each workflow:
1. Give it a clear name
2. Describe what it accomplishes
3. List the steps with the entities involved
4. Identify any status transitions

Return JSON:
{
  "workflows": [
    {
      "name": "Workflow Name",
      "description": "What this workflow does",
      "trigger": "What starts this workflow",
      "steps": [
        {
          "order": 1,
          "action": "Action description",
          "entity": "EntityName",
          "type": "start|process|decision|end",
          "statusChange": "from -> to (if applicable)"
        }
      ],
      "entities_involved": ["Entity1", "Entity2"]
    }
  ]
}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            workflows: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  trigger: { type: "string" },
                  steps: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        order: { type: "number" },
                        action: { type: "string" },
                        entity: { type: "string" },
                        type: { type: "string" },
                        statusChange: { type: "string" },
                      }
                    }
                  },
                  entities_involved: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      setWorkflows(result.workflows || []);
      if (result.workflows?.length > 0) {
        setSelectedWorkflow(result.workflows[0]);
      }
      toast.success(`Generated ${result.workflows?.length || 0} workflows`);
    } catch (error) {
      toast.error("Failed to generate workflows");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Workflow Modeler
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Generate Button */}
          <Button
            onClick={handleGenerateWorkflows}
            disabled={isGenerating || entityNodes.length === 0}
            className="w-full"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {isGenerating ? "Analyzing Entities..." : "Generate Workflows from Entities"}
          </Button>

          {entityNodes.length === 0 && (
            <p className="text-sm text-warning text-center">
              Mark some nodes as "Entity" type first to generate workflows.
            </p>
          )}

          {/* Workflows Display */}
          {workflows.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {/* Workflow List */}
              <div className="col-span-1 border rounded-lg p-3">
                <h4 className="font-medium mb-2 text-sm">Workflows</h4>
                <div className="space-y-2">
                  {workflows.map((wf, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedWorkflow(wf)}
                      className={`w-full text-left p-2 rounded text-sm transition-colors ${
                        selectedWorkflow?.name === wf.name
                          ? "bg-info-50 border-info border"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      <div className="font-medium">{wf.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {wf.entities_involved?.join(", ")}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Workflow Detail */}
              <div className="col-span-2 border rounded-lg p-3">
                {selectedWorkflow ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-lg">{selectedWorkflow.name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedWorkflow.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs text-muted-foreground">Entities:</span>
                      {selectedWorkflow.entities_involved?.map(e => (
                        <Badge key={e} variant="outline" className="text-xs">{e}</Badge>
                      ))}
                    </div>

                    <div className="text-sm">
                      <span className="text-muted-foreground">Trigger:</span>{" "}
                      <span className="font-medium">{selectedWorkflow.trigger}</span>
                    </div>

                    {/* Steps */}
                    <ScrollArea className="h-64">
                      <div className="space-y-2">
                        {selectedWorkflow.steps?.map((step, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-3 p-3 bg-muted rounded-lg"
                          >
                            <div className="flex flex-col items-center">
                              {statusIcons[step.type] || statusIcons.process}
                              {i < selectedWorkflow.steps.length - 1 && (
                                <div className="w-px h-8 bg-border mt-1" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{step.action}</span>
                                {step.entity && (
                                  <Badge variant="secondary" className="text-xs">
                                    {step.entity}
                                  </Badge>
                                )}
                              </div>
                              {step.statusChange && (
                                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                  <ArrowRight className="h-3 w-3" />
                                  {step.statusChange}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    Select a workflow to view details
                  </div>
                )}
              </div>
            </div>
          )}

          {workflows.length === 0 && !isGenerating && entityNodes.length > 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Play className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Click "Generate Workflows" to analyze your entities</p>
              <p className="text-sm">and discover common business processes.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}