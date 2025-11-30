import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Type,
  AlignLeft,
  Hash,
  Calendar,
  Clock,
  List,
  CheckSquare,
  Circle,
  Upload,
  Image,
  PenTool,
  MapPin,
  Star,
  Minus,
  FileText,
} from "lucide-react";

const fieldTypes = [
  { type: "text", label: "Text Input", icon: Type, description: "Single line text" },
  { type: "textarea", label: "Text Area", icon: AlignLeft, description: "Multi-line text" },
  { type: "number", label: "Number", icon: Hash, description: "Numeric input" },
  { type: "date", label: "Date", icon: Calendar, description: "Date picker" },
  { type: "datetime", label: "Date & Time", icon: Clock, description: "Date and time" },
  { type: "select", label: "Dropdown", icon: List, description: "Single selection" },
  { type: "multiselect", label: "Multi-Select", icon: CheckSquare, description: "Multiple selections" },
  { type: "checkbox", label: "Checkbox", icon: CheckSquare, description: "Yes/No toggle" },
  { type: "radio", label: "Radio Buttons", icon: Circle, description: "Single choice" },
  { type: "file", label: "File Upload", icon: Upload, description: "Upload files" },
  { type: "image", label: "Image Upload", icon: Image, description: "Upload images" },
  { type: "signature", label: "Signature", icon: PenTool, description: "Capture signature" },
  { type: "location", label: "Location", icon: MapPin, description: "GPS coordinates" },
  { type: "rating", label: "Rating", icon: Star, description: "Star rating" },
  { type: "section", label: "Section Header", icon: Minus, description: "Group fields" },
  { type: "instructions", label: "Instructions", icon: FileText, description: "Display text" },
];

export default function FormFieldPalette({ onAddField }) {
  return (
    <div className="w-64 bg-white border-r flex flex-col">
      <div className="p-3 border-b">
        <h3 className="font-semibold text-sm">Add Field</h3>
        <p className="text-xs text-gray-500">Click to add to form</p>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {fieldTypes.map((field) => {
            const Icon = field.icon;
            return (
              <button
                key={field.type}
                onClick={() => onAddField(field.type)}
                className="w-full p-3 rounded-lg border text-left transition-all hover:shadow-md hover:border-blue-300 bg-white"
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-gray-600" />
                  <span className="font-medium text-sm">{field.label}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{field.description}</p>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}