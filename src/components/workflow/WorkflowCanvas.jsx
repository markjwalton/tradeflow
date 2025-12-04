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
  task: "border-blue-300 bg-blue-50",
  milestone: "border-green-300 bg-green-50",
  decision: "border-purple-300 bg-purple-50",
  approval: "border-amber-300 bg-amber-50",
  form: "border-cyan-300 bg-cyan-50",
  checklist: "border-indigo-300 bg-indigo-50",
  integration: "border-pink-300 bg-pink-50",
  notification: "border-orange-300 bg-orange-50",
  wait: "border-gray-300 bg-gray-50",
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
        <div className="text-center text-[var(--color-charcoal)]">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-background)] flex items-center justify-center">
            <CheckSquare className="h-8 w-8 text-[var(--color-charcoal)]" />
          </div>
          <h3 className="font-medium text-[var(--color-midnight)]">No steps yet</h3>
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
                            <div className="w-0.5 h-8 bg-[var(--color-background-muted)]" />
                          </div>
                        )}

                        {/* Step Card */}
                        <Card
                          className={`border-2 cursor-pointer transition-all ${colorClass} ${
                            isSelected
                              ? "ring-2 ring-[var(--color-primary)] shadow-lg"
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
                                <GripVertical className="h-4 w-4 text-[var(--color-charcoal)]" />
                              </div>

                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <Icon className="h-5 w-5" />
                                  <span className="font-medium text-[var(--color-midnight)]">{step.name}</span>
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
                                  <p className="text-sm text-[var(--color-charcoal)] mt-1">
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
                                      className="text-xs bg-cyan-100 flex items-center gap-1"
                                    >
                                      <FileText className="h-3 w-3" />
                                      {getFormName(step.formTemplateId)}
                                    </Badge>
                                  )}
                                  {step.checklistTemplateId && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs bg-indigo-100 flex items-center gap-1"
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
                                className="h-8 w-8 p-0 text-[var(--color-charcoal)] hover:text-[var(--color-destructive)]"
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
                            <ArrowDown className="h-6 w-6 text-[var(--color-charcoal)]" />
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
        <div className="px-4 py-2 bg-[var(--color-background-muted)] rounded-full text-sm font-medium text-[var(--color-charcoal)]">
          End of Workflow
        </div>
      </div>
    </div>
  );
}