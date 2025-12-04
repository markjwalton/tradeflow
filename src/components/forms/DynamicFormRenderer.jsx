import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Upload, Star, Loader2, X } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function DynamicFormRenderer({
  formTemplate,
  onSubmit,
  initialData = {},
  isPreview = false,
  isLoading = false,
}) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState({});

  const handleChange = (fieldId, value) => {
    setFormData({ ...formData, [fieldId]: value });
    if (errors[fieldId]) {
      setErrors({ ...errors, [fieldId]: null });
    }
  };

  const handleFileUpload = async (fieldId, files) => {
    if (!files || files.length === 0) return;
    
    setUploading({ ...uploading, [fieldId]: true });
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploadedUrls.push(file_url);
      }
      const existing = formData[fieldId] || [];
      handleChange(fieldId, [...existing, ...uploadedUrls]);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading({ ...uploading, [fieldId]: false });
    }
  };

  const removeFile = (fieldId, index) => {
    const files = [...(formData[fieldId] || [])];
    files.splice(index, 1);
    handleChange(fieldId, files);
  };

  const validate = () => {
    const newErrors = {};
    formTemplate.fields?.forEach((field) => {
      if (field.required && !formData[field.fieldId]) {
        newErrors[field.fieldId] = `${field.label} is required`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const renderField = (field) => {
    const value = formData[field.fieldId];
    const error = errors[field.fieldId];

    switch (field.type) {
      case "text":
        return (
          <Input
            value={value || ""}
            onChange={(e) => handleChange(field.fieldId, e.target.value)}
            placeholder={field.placeholder}
            className={error ? "border-[var(--color-destructive)]" : ""}
          />
        );

      case "textarea":
        return (
          <Textarea
            value={value || ""}
            onChange={(e) => handleChange(field.fieldId, e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            className={error ? "border-[var(--color-destructive)]" : ""}
          />
        );

      case "number":
        return (
          <Input
            type="number"
            value={value || ""}
            onChange={(e) => handleChange(field.fieldId, e.target.value)}
            placeholder={field.placeholder}
            min={field.validation?.min}
            max={field.validation?.max}
            className={error ? "border-[var(--color-destructive)]" : ""}
          />
        );

      case "date":
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !value && "text-muted-foreground",
                  error && "border-[var(--color-destructive)]"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value), "PPP") : field.placeholder || "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => handleChange(field.fieldId, date?.toISOString())}
              />
            </PopoverContent>
          </Popover>
        );

      case "datetime":
        return (
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "flex-1 justify-start text-left font-normal",
                    !value && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {value ? format(new Date(value), "PPP") : "Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={value ? new Date(value) : undefined}
                  onSelect={(date) => handleChange(field.fieldId, date?.toISOString())}
                />
              </PopoverContent>
            </Popover>
            <Input
              type="time"
              value={value ? format(new Date(value), "HH:mm") : ""}
              onChange={(e) => {
                const date = value ? new Date(value) : new Date();
                const [hours, minutes] = e.target.value.split(":");
                date.setHours(parseInt(hours), parseInt(minutes));
                handleChange(field.fieldId, date.toISOString());
              }}
              className="w-32"
            />
          </div>
        );

      case "select":
        return (
          <Select value={value || ""} onValueChange={(v) => handleChange(field.fieldId, v)}>
            <SelectTrigger className={error ? "border-red-500" : ""}>
              <SelectValue placeholder={field.placeholder || "Select..."} />
            </SelectTrigger>
            <SelectContent>
              {(field.options || []).map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "multiselect":
        const selectedValues = value || [];
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1">
              {selectedValues.map((v) => (
                <Badge key={v} variant="secondary" className="gap-1">
                  {v}
                  <button
                    onClick={() =>
                      handleChange(
                        field.fieldId,
                        selectedValues.filter((x) => x !== v)
                      )
                    }
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <Select
              value=""
              onValueChange={(v) => {
                if (!selectedValues.includes(v)) {
                  handleChange(field.fieldId, [...selectedValues, v]);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Add..." />
              </SelectTrigger>
              <SelectContent>
                {(field.options || [])
                  .filter((opt) => !selectedValues.includes(opt))
                  .map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "checkbox":
        return (
          <div className="flex items-center gap-2">
            <Checkbox
              id={field.fieldId}
              checked={value === true}
              onCheckedChange={(v) => handleChange(field.fieldId, v)}
            />
            <label htmlFor={field.fieldId} className="text-sm">
              {field.placeholder || "Yes"}
            </label>
          </div>
        );

      case "radio":
        return (
          <RadioGroup value={value || ""} onValueChange={(v) => handleChange(field.fieldId, v)}>
            {(field.options || []).map((opt) => (
              <div key={opt} className="flex items-center gap-2">
                <RadioGroupItem value={opt} id={`${field.fieldId}_${opt}`} />
                <label htmlFor={`${field.fieldId}_${opt}`} className="text-sm">
                  {opt}
                </label>
              </div>
            ))}
          </RadioGroup>
        );

      case "file":
      case "image":
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept={field.type === "image" ? "image/*" : undefined}
                multiple
                onChange={(e) => handleFileUpload(field.fieldId, Array.from(e.target.files))}
                className="flex-1"
              />
              {uploading[field.fieldId] && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
            {(value || []).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {value.map((url, i) => (
                  <div key={i} className="relative group">
                    {field.type === "image" ? (
                      <img src={url} alt="" className="h-16 w-16 object-cover rounded" />
                    ) : (
                      <Badge variant="outline">{url.split("/").pop()}</Badge>
                    )}
                    <button
                      onClick={() => removeFile(field.fieldId, i)}
                      className="absolute -top-1 -right-1 bg-[var(--color-destructive)] text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "rating":
        const maxRating = field.validation?.maxRating || 5;
        return (
          <div className="flex gap-1">
            {Array.from({ length: maxRating }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleChange(field.fieldId, i + 1)}
                className="focus:outline-none"
              >
                <Star
                  className={cn(
                    "h-6 w-6",
                    i < (value || 0) ? "fill-[var(--color-secondary)] text-[var(--color-secondary)]" : "text-[var(--color-charcoal)]/30"
                  )}
                />
              </button>
            ))}
          </div>
        );

      case "section":
        return (
          <div className="border-t border-[var(--color-background-muted)] pt-4 mt-4">
            <h3 className="text-lg font-semibold text-[var(--color-midnight)]">{field.label}</h3>
          </div>
        );

      case "instructions":
        return (
          <div className="bg-[var(--color-info)]/10 border border-[var(--color-info)]/30 rounded-lg p-3 text-sm text-[var(--color-info-dark)]">
            {field.placeholder}
          </div>
        );

      default:
        return (
          <Input
            value={value || ""}
            onChange={(e) => handleChange(field.fieldId, e.target.value)}
            placeholder={field.placeholder}
          />
        );
    }
  };

  if (!formTemplate?.fields?.length) {
    return (
      <div className="text-center text-[var(--color-charcoal)] py-8">
        No fields configured for this form
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formTemplate.fields.map((field) => (
        <div key={field.fieldId}>
          {field.type !== "section" && field.type !== "instructions" && (
            <Label className="mb-1.5 block">
              {field.label}
              {field.required && <span className="text-[var(--color-destructive)] ml-1">*</span>}
            </Label>
          )}
          {renderField(field)}
          {field.helpText && field.type !== "section" && field.type !== "instructions" && (
            <p className="text-xs text-[var(--color-charcoal)] mt-1">{field.helpText}</p>
          )}
          {errors[field.fieldId] && (
            <p className="text-xs text-[var(--color-destructive)] mt-1">{errors[field.fieldId]}</p>
          )}
        </div>
      ))}

      <Button type="submit" className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white" disabled={isLoading}>
        {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        {formTemplate.submitButtonText || "Submit"}
      </Button>
    </form>
  );
}