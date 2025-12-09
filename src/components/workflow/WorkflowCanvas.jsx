import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckSquare,
  Flag,
  GitBranch,
  UserCheck,
  FileText,
  ListChecks,
  Plug,
  Bell,
  Clock,
  GripVertical,
  Trash2,
  ArrowDown,
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const stepIcons = {
  task: CheckSquare,
  milestone: Flag,
  decision: GitBranch,
  approval: UserCheck,
  form: FileText,
  checklist: ListChecks,
  integration: Plug,
  notification: Bell,
  wait: Clock,
};

const stepColors = {
  task: "border-info/30 bg-info-50",
  milestone: "border-success/30 bg-success-50",
  decision: "border-accent/30 bg-accent/10",
  approval: "border-warning/30 bg-warning/10",
  form: "border-info/30 bg-info-50",
  checklist: "border-primary/30 bg-primary-100",
  integration: "border-accent/30 bg-accent-100",
  notification: "border-warning/30 bg-warning/10",
  wait: "border-border bg-muted",
};

export default function WorkflowCanvas({
  steps,
  selectedStepId,
  onSelectStep,
  onReorderSteps,
  onDeleteStep,
  formTemplates = [],
  checklistTemplates = [],
}) {
  const getFormName = (id) => formTemplates.find(f => f.id === id)?.name || "Form";
  const getChecklistName = (id) => checklistTemplates.find(c => c.id === id)?.name || "Checklist";
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const reordered = Array.from(steps);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    onReorderSteps(reordered);
  };

  if (steps.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <CheckSquare className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-foreground">No steps yet</h3>
          <p className="text-sm">Add steps from the palette on the left</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="workflow-steps">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {steps.map((step, index) => {
                const Icon = stepIcons[step.stepType] || CheckSquare;
                const colorClass = stepColors[step.stepType] || stepColors.task;
                const isSelected = selectedStepId === step.id;

                return (
                  <Draggable key={step.id} draggableId={step.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="mb-4"
                      >
                        {/* Connector line */}
                        {index > 0 && (
                          <div className="flex justify-center -mt-4 mb-0">
                            <div className="w-0.5 h-8 bg-border" />
                          </div>
                        )}

                        {/* Step Card */}
                        <Card
                          className={`border-2 cursor-pointer transition-all ${colorClass} ${
                            isSelected
                              ? "ring-2 ring-primary shadow-lg"
                              : "hover:shadow-md"
                          } ${snapshot.isDragging ? "shadow-xl" : ""}`}
                          onClick={() => onSelectStep(step.id)}
                        >
                          <div className="p-4">
                            <div className="flex items-start gap-3">
                              <div
                                {...provided.dragHandleProps}
                                className="mt-1 cursor-grab active:cursor-grabbing"
                              >
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                              </div>

                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <Icon className="h-5 w-5" />
                                  <span className="font-medium text-foreground">{step.name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {step.stepNumber}
                                  </Badge>
                                  {!step.isRequired && (
                                    <Badge variant="secondary" className="text-xs">
                                      Optional
                                    </Badge>
                                  )}
                                </div>

                                {step.description && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {step.description}
                                  </p>
                                )}

                                <div className="flex flex-wrap gap-2 mt-2">
                                  {step.assigneeType && (
                                    <Badge variant="outline" className="text-xs">
                                      Assign: {step.assigneeType}
                                    </Badge>
                                  )}
                                  {step.estimatedDurationHours && (
                                    <Badge variant="outline" className="text-xs">
                                      ~{step.estimatedDurationHours}h
                                    </Badge>
                                  )}
                                  {step.formTemplateId && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs bg-info-50 flex items-center gap-1"
                                    >
                                      <FileText className="h-3 w-3" />
                                      {getFormName(step.formTemplateId)}
                                    </Badge>
                                  )}
                                  {step.checklistTemplateId && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs bg-primary-100 flex items-center gap-1"
                                    >
                                      <ListChecks className="h-3 w-3" />
                                      {getChecklistName(step.checklistTemplateId)}
                                    </Badge>
                                  )}
                                </div>

                                {/* Decision options preview */}
                                {step.stepType === "decision" &&
                                  step.decisionOptions?.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                      {step.decisionOptions.map((opt, i) => (
                                        <Badge
                                          key={i}
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          → {opt.label}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                              </div>

                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteStep(step.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>

                        {/* Arrow to next step */}
                        {index < steps.length - 1 && (
                          <div className="flex justify-center mt-0">
                            <ArrowDown className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* End marker */}
      <div className="flex justify-center mt-4">
        <div className="px-4 py-2 bg-muted rounded-full text-sm font-medium text-muted-foreground">
          End of Workflow
        </div>
      </div>
    </div>
  );
}