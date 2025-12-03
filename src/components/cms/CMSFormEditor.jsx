import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, GripVertical, Loader2 } from "lucide-react";
import { toast } from "sonner";

const fieldTypes = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "tel", label: "Phone" },
  { value: "textarea", label: "Text Area" },
  { value: "select", label: "Dropdown" },
  { value: "checkbox", label: "Checkbox" },
  { value: "radio", label: "Radio" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "file", label: "File Upload" }
];

export default function CMSFormEditor({ form, tenantId, onClose }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: form?.name || "",
    slug: form?.slug || "",
    description: form?.description || "",
    fields: form?.fields || [],
    submit_button_text: form?.submit_button_text || "Submit",
    success_message: form?.success_message || "Thank you for your submission!",
    notification_email: form?.notification_email || "",
    status: form?.status || "active"
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (form) {
        return base44.entities.CMSForm.update(form.id, data);
      } else {
        return base44.entities.CMSForm.create({ ...data, tenant_id: tenantId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cmsForms"] });
      toast.success(form ? "Form updated" : "Form created");
      onClose();
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      toast.error("Name and slug are required");
      return;
    }
    mutation.mutate(formData);
  };

  const generateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    setFormData({ ...formData, slug });
  };

  const addField = () => {
    setFormData({
      ...formData,
      fields: [...formData.fields, {
        name: "",
        label: "",
        type: "text",
        required: false,
        placeholder: "",
        options: []
      }]
    });
  };

  const updateField = (index, updates) => {
    const newFields = [...formData.fields];
    newFields[index] = { ...newFields[index], ...updates };
    setFormData({ ...formData, fields: newFields });
  };

  const removeField = (index) => {
    setFormData({
      ...formData,
      fields: formData.fields.filter((_, i) => i !== index)
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{form ? "Edit Form" : "New Form"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                onBlur={() => !formData.slug && generateSlug()}
              />
            </div>
            <div>
              <Label>Slug *</Label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
            />
          </div>

          {/* Fields */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Form Fields</Label>
              <Button type="button" variant="outline" size="sm" onClick={addField}>
                <Plus className="h-4 w-4 mr-1" />
                Add Field
              </Button>
            </div>
            <div className="space-y-3">
              {formData.fields.map((field, index) => (
                <div key={index} className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg">
                  <GripVertical className="h-5 w-5 text-gray-400 mt-2 cursor-grab" />
                  <div className="flex-1 grid grid-cols-4 gap-2">
                    <Input
                      placeholder="Field name"
                      value={field.name}
                      onChange={(e) => updateField(index, { name: e.target.value })}
                    />
                    <Input
                      placeholder="Label"
                      value={field.label}
                      onChange={(e) => updateField(index, { label: e.target.value })}
                    />
                    <Select 
                      value={field.type} 
                      onValueChange={(v) => updateField(index, { type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fieldTypes.map(t => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={field.required}
                        onCheckedChange={(v) => updateField(index, { required: v })}
                      />
                      <span className="text-sm">Required</span>
                    </div>
                    {(field.type === "select" || field.type === "radio") && (
                      <div className="col-span-4">
                        <Input
                          placeholder="Options (comma-separated)"
                          value={field.options?.join(", ") || ""}
                          onChange={(e) => updateField(index, { 
                            options: e.target.value.split(",").map(s => s.trim()).filter(Boolean) 
                          })}
                        />
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-red-500"
                    onClick={() => removeField(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {formData.fields.length === 0 && (
                <p className="text-center text-gray-500 py-4">No fields yet. Click "Add Field" to start building your form.</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Submit Button Text</Label>
              <Input
                value={formData.submit_button_text}
                onChange={(e) => setFormData({ ...formData, submit_button_text: e.target.value })}
              />
            </div>
            <div>
              <Label>Notification Email</Label>
              <Input
                type="email"
                value={formData.notification_email}
                onChange={(e) => setFormData({ ...formData, notification_email: e.target.value })}
                placeholder="Email to receive submissions"
              />
            </div>
          </div>

          <div>
            <Label>Success Message</Label>
            <Textarea
              value={formData.success_message}
              onChange={(e) => setFormData({ ...formData, success_message: e.target.value })}
              rows={2}
            />
          </div>

          <div>
            <Label>Status</Label>
            <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {form ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}