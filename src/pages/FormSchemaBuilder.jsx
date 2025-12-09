import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Trash2, Plus, GripVertical, ChevronRight, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

// Control palette items
const LAYOUT_CONTROLS = [
  { id: "horizontal", type: "layout", label: "Horizontal Layout", icon: "↔" },
  { id: "vertical", type: "layout", label: "Vertical Layout", icon: "↕" },
  { id: "group", type: "layout", label: "Group", icon: "{}" },
  { id: "label", type: "layout", label: "Label", icon: "Tt" },
  { id: "categorization", type: "layout", label: "Categorization", icon: "📑" },
];

const FIELD_CONTROLS = [
  { id: "text", type: "field", label: "Text", fieldType: "string" },
  { id: "number", type: "field", label: "Number", fieldType: "number" },
  { id: "date", type: "field", label: "Date", fieldType: "string", format: "date" },
  { id: "boolean", type: "field", label: "Boolean", fieldType: "boolean" },
  { id: "array", type: "field", label: "Array", fieldType: "array" },
  { id: "object", type: "field", label: "Object", fieldType: "object" },
];

const COMPOSITE_CONTROLS = [
  {
    id: "person",
    type: "composite",
    label: "Person",
    schema: {
      type: "object",
      properties: {
        name: { type: "string" },
        birthDate: { type: "string", format: "date" },
        personalData: { type: "object" },
        friends: { type: "array", items: { type: "string" } },
        nationality: { type: "string" },
        occupation: { type: "string" }
      }
    }
  },
];

export default function FormSchemaBuilder() {
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [schemaName, setSchemaName] = useState("FormSchema");

  const generateId = () => `elem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const onDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) return;

    // Dragging from palette to editor
    if (source.droppableId === "palette" && destination.droppableId === "editor") {
      const control = [...LAYOUT_CONTROLS, ...FIELD_CONTROLS, ...COMPOSITE_CONTROLS].find(
        c => c.id === result.draggableId.replace("palette-", "")
      );
      
      if (control) {
        const newElement = createElementFromControl(control);
        const newElements = [...elements];
        newElements.splice(destination.index, 0, newElement);
        setElements(newElements);
      }
      return;
    }

    // Reordering within editor
    if (source.droppableId === "editor" && destination.droppableId === "editor") {
      const newElements = [...elements];
      const [removed] = newElements.splice(source.index, 1);
      newElements.splice(destination.index, 0, removed);
      setElements(newElements);
    }
  };

  const createElementFromControl = (control) => {
    const baseElement = {
      id: generateId(),
      controlType: control.id,
      label: control.label,
    };

    if (control.type === "layout") {
      return {
        ...baseElement,
        type: "layout",
        layout: control.id,
        children: [],
      };
    }

    if (control.type === "composite") {
      const children = Object.keys(control.schema.properties).map(key => ({
        id: generateId(),
        type: "field",
        fieldName: key,
        fieldType: control.schema.properties[key].type,
        format: control.schema.properties[key].format,
        label: key,
      }));
      
      return {
        ...baseElement,
        type: "group",
        children,
      };
    }

    return {
      ...baseElement,
      type: "field",
      fieldName: control.label.toLowerCase(),
      fieldType: control.fieldType,
      format: control.format,
    };
  };

  const deleteElement = (id) => {
    setElements(elements.filter(e => e.id !== id));
    if (selectedElement?.id === id) setSelectedElement(null);
  };

  const updateElement = (id, updates) => {
    setElements(elements.map(e => e.id === id ? { ...e, ...updates } : e));
    if (selectedElement?.id === id) setSelectedElement({ ...selectedElement, ...updates });
  };

  const generateJSONSchema = () => {
    const properties = {};
    const required = [];

    const processElement = (element) => {
      if (element.type === "field" && element.fieldName) {
        properties[element.fieldName] = {
          type: element.fieldType,
          ...(element.format && { format: element.format }),
          ...(element.description && { description: element.description }),
        };
        if (element.required) required.push(element.fieldName);
      }

      if (element.children) {
        element.children.forEach(processElement);
      }
    };

    elements.forEach(processElement);

    return {
      type: "object",
      properties,
      ...(required.length > 0 && { required }),
    };
  };

  const generateUISchema = () => {
    const uiSchema = {
      type: "VerticalLayout",
      elements: [],
    };

    const processElement = (element) => {
      if (element.type === "layout") {
        const layoutType = element.layout === "horizontal" ? "HorizontalLayout" : "VerticalLayout";
        return {
          type: layoutType,
          elements: element.children?.map(processElement) || [],
        };
      }

      if (element.type === "group") {
        return {
          type: "Group",
          label: element.label,
          elements: element.children?.map(processElement) || [],
        };
      }

      if (element.type === "field") {
        return {
          type: "Control",
          scope: `#/properties/${element.fieldName}`,
          label: element.label,
        };
      }

      return null;
    };

    uiSchema.elements = elements.map(processElement).filter(Boolean);
    return uiSchema;
  };

  const copyToClipboard = (content) => {
    navigator.clipboard.writeText(JSON.stringify(content, null, 2));
    toast.success("Copied to clipboard");
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="border-b p-4">
        <h1 className="text-2xl font-bold">Form Schema Builder</h1>
        <p className="text-sm text-muted-foreground">Drag and drop form controls to build your schema</p>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Palette */}
        <div className="w-64 border-r bg-muted/30">
          <Tabs defaultValue="layouts" className="h-full flex flex-col">
            <TabsList className="w-full justify-start rounded-none border-b">
              <TabsTrigger value="layouts" className="flex-1">Layouts</TabsTrigger>
              <TabsTrigger value="controls" className="flex-1">Controls</TabsTrigger>
            </TabsList>

            <DragDropContext onDragEnd={onDragEnd}>
              <TabsContent value="layouts" className="flex-1 mt-0">
                <ScrollArea className="h-full">
                  <div className="p-3 space-y-2">
                    <div className="font-medium text-sm mb-2">Layouts & Other</div>
                    <Droppable droppableId="palette" isDropDisabled>
                      {(provided) => (
                        <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                          {LAYOUT_CONTROLS.map((control, index) => (
                            <Draggable key={`palette-${control.id}`} draggableId={`palette-${control.id}`} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="p-2 bg-background border rounded cursor-move hover:border-primary flex items-center gap-2"
                                >
                                  <span className="text-lg">{control.icon}</span>
                                  <span className="text-sm">{control.label}</span>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="controls" className="flex-1 mt-0">
                <ScrollArea className="h-full">
                  <div className="p-3 space-y-4">
                    <div>
                      <div className="font-medium text-sm mb-2">Controls</div>
                      <Droppable droppableId="palette-fields" isDropDisabled>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                            {FIELD_CONTROLS.map((control, index) => (
                              <Draggable key={`palette-${control.id}`} draggableId={`palette-${control.id}`} index={index}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="p-2 bg-background border rounded cursor-move hover:border-primary flex items-center gap-2"
                                  >
                                    <span className="text-sm font-mono">▫</span>
                                    <span className="text-sm">{control.label}</span>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>

                    <div>
                      <div className="font-medium text-sm mb-2">Composite Controls</div>
                      <Droppable droppableId="palette-composite" isDropDisabled>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                            {COMPOSITE_CONTROLS.map((control, index) => (
                              <Draggable key={`palette-${control.id}`} draggableId={`palette-${control.id}`} index={index}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="p-2 bg-background border rounded cursor-move hover:border-primary"
                                  >
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-sm font-mono">☰</span>
                                      <span className="text-sm font-medium">{control.label}</span>
                                    </div>
                                    <div className="ml-4 space-y-0.5">
                                      {Object.keys(control.schema.properties).map(key => (
                                        <div key={key} className="text-xs text-muted-foreground flex items-center gap-1">
                                          <span className="text-[10px]">▫</span>
                                          {key}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
            </DragDropContext>
          </Tabs>
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col">
          <Tabs defaultValue="editor" className="flex-1 flex flex-col">
            <TabsList className="w-full justify-start rounded-none border-b">
              <TabsTrigger value="editor">EDITOR</TabsTrigger>
              <TabsTrigger value="json-schema">JSON SCHEMA</TabsTrigger>
              <TabsTrigger value="ui-schema">UI SCHEMA</TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="flex-1 mt-0 overflow-hidden">
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="editor">
                  {(provided, snapshot) => (
                    <ScrollArea className="h-full">
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`p-6 min-h-full ${snapshot.isDraggingOver ? 'bg-primary/5' : ''}`}
                      >
                        {elements.length === 0 ? (
                          <div className="h-[400px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded">
                            Drag and drop an element from the Palette to begin.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {elements.map((element, index) => (
                              <Draggable key={element.id} draggableId={element.id} index={index}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    onClick={() => setSelectedElement(element)}
                                    className={`border rounded p-3 bg-background ${
                                      selectedElement?.id === element.id ? 'border-primary ring-2 ring-primary/20' : ''
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <div {...provided.dragHandleProps} className="cursor-move">
                                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                                      </div>
                                      <div className="flex-1">
                                        <ElementRenderer element={element} />
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          deleteElement(element.id);
                                        }}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                          </div>
                        )}
                        {provided.placeholder}
                      </div>
                    </ScrollArea>
                  )}
                </Droppable>
              </DragDropContext>
            </TabsContent>

            <TabsContent value="json-schema" className="flex-1 mt-0">
              <div className="p-6 h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Generated JSON Schema</h3>
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard(generateJSONSchema())}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <ScrollArea className="flex-1">
                  <pre className="text-xs bg-muted p-4 rounded">
                    {JSON.stringify(generateJSONSchema(), null, 2)}
                  </pre>
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="ui-schema" className="flex-1 mt-0">
              <div className="p-6 h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Generated UI Schema</h3>
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard(generateUISchema())}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <ScrollArea className="flex-1">
                  <pre className="text-xs bg-muted p-4 rounded">
                    {JSON.stringify(generateUISchema(), null, 2)}
                  </pre>
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Properties Panel */}
        {selectedElement && (
          <div className="w-80 border-l bg-muted/30">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                <div>
                  <h3 className="font-medium mb-3">Element Properties</h3>
                  <div className="text-xs text-muted-foreground mb-3">
                    Type: {selectedElement.type}
                  </div>
                </div>

                <div>
                  <Label>Label</Label>
                  <Input
                    value={selectedElement.label || ""}
                    onChange={(e) => updateElement(selectedElement.id, { label: e.target.value })}
                    className="mt-1"
                  />
                </div>

                {selectedElement.type === "field" && (
                  <>
                    <div>
                      <Label>Field Name</Label>
                      <Input
                        value={selectedElement.fieldName || ""}
                        onChange={(e) => updateElement(selectedElement.id, { fieldName: e.target.value })}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Description</Label>
                      <Input
                        value={selectedElement.description || ""}
                        onChange={(e) => updateElement(selectedElement.id, { description: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
}

function ElementRenderer({ element }) {
  const [expanded, setExpanded] = useState(true);

  if (element.type === "layout") {
    return (
      <div>
        <div className="flex items-center gap-2">
          <button onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          <span className="font-medium text-sm">
            {element.layout === "horizontal" ? "↔" : "↕"} {element.label}
          </span>
        </div>
        {expanded && element.children && element.children.length > 0 && (
          <div className="ml-6 mt-2 space-y-2">
            {element.children.map(child => (
              <div key={child.id} className="border-l-2 pl-3">
                <ElementRenderer element={child} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (element.type === "group") {
    return (
      <div>
        <div className="flex items-center gap-2">
          <button onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          <span className="font-medium text-sm">☰ {element.label}</span>
        </div>
        {expanded && element.children && element.children.length > 0 && (
          <div className="ml-6 mt-2 space-y-1">
            {element.children.map(child => (
              <div key={child.id} className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="text-xs">▫</span>
                {child.fieldName || child.label}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs">▫</span>
      <span className="text-sm">{element.label}</span>
      <span className="text-xs text-muted-foreground">({element.fieldType})</span>
    </div>
  );
}