import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

// Mock customers for dropdown
const mockCustomers = [
  { id: "cust-1", name: "Jane Smith", company: "Smith & Co", email: "jane@example.com", phone: "01234 567890" },
  { id: "cust-2", name: "John Brown", company: "Brown Builders", email: "john@builders.co.uk", phone: "07700 900456" },
  { id: "cust-3", name: "Sarah Wilson", company: null, email: "sarah@wilson.org", phone: "01onal 112233" },
];

// Mock prefilled project for edit mode
const mockProject = {
  name: "Garden Room – Oak Frame",
  description: "Bespoke oak-framed garden room with glazed gables and slate roof.",
  projectRef: "PRJ-2025-DEBUG",
  status: "Active",
  projectType: "New Build",
  isHighPriority: true,
  customerId: "cust-1",
  clientName: "Jane Smith",
  clientEmail: "jane@example.com",
  clientPhone: "01234 567890",
  location: "12 Oak Lane, Greenfield, GL5 4AB",
  startDate: "2025-01-15",
  estimatedEndDate: "2025-06-30",
  budget: "38000",
  notes: "Planning permission submitted. Client excited about the project!",
};

export default function DebugProjectEditor() {
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get("mode") || "edit"; // "edit" or "create"
  const isEditing = mode === "edit";

  const [formData, setFormData] = useState(
    isEditing
      ? mockProject
      : {
          name: "",
          description: "",
          customerId: "",
          clientName: "",
          clientEmail: "",
          clientPhone: "",
          status: "Planning",
          startDate: "",
          estimatedEndDate: "",
          projectRef: "",
          location: "",
          budget: "",
          projectType: "",
          notes: "",
          isHighPriority: false,
        }
  );

  const handleCustomerChange = (customerId) => {
    const customer = mockCustomers.find((c) => c.id === customerId);
    if (customer) {
      setFormData((prev) => ({
        ...prev,
        customerId,
        clientName: customer.name,
        clientEmail: customer.email || prev.clientEmail,
        clientPhone: customer.phone || prev.clientPhone,
      }));
    } else {
      setFormData((prev) => ({ ...prev, customerId: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Just show toast - no actual save in debug mode
    toast.success(
      `DEBUG: Form submitted!\n\nData: ${JSON.stringify(formData, null, 2)}`,
      { duration: 5000 }
    );
    console.log("Form data submitted:", formData);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Debug Banner */}
      <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-amber-600" />
        <span className="text-amber-800 font-medium">DEBUG MODE</span>
        <span className="text-amber-700 text-sm">
          – {isEditing ? "Edit mode with mock data" : "Create mode (empty form)"}
        </span>
        <div className="ml-auto flex gap-2">
          <Link to={createPageUrl("DebugProjectEditor?mode=create")}>
            <Button variant="outline" size="sm">Create Mode</Button>
          </Link>
          <Link to={createPageUrl("DebugProjectEditor?mode=edit")}>
            <Button variant="outline" size="sm">Edit Mode</Button>
          </Link>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to={createPageUrl("DebugProjectWorkspace")}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-stone-900">
            {isEditing ? "Edit Project" : "Create New Project"}
          </h1>
          <p className="text-stone-500 mt-1">
            {isEditing ? "Update project details" : "Set up a new construction project"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g., Oakwood Manor Build"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectRef">Project Reference</Label>
                <Input
                  id="projectRef"
                  value={formData.projectRef}
                  onChange={(e) => handleChange("projectRef", e.target.value)}
                  placeholder="e.g., PO-2024-001"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Detailed overview of the project..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projectType">Project Type</Label>
                <Select
                  value={formData.projectType}
                  onValueChange={(value) => handleChange("projectType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New Build">New Build</SelectItem>
                    <SelectItem value="Extension">Extension</SelectItem>
                    <SelectItem value="Renovation">Renovation</SelectItem>
                    <SelectItem value="Conservation">Conservation</SelectItem>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Planning">Planning</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                placeholder="Project site address"
              />
            </div>

            <div className="flex items-center space-x-3">
              <Switch
                id="isHighPriority"
                checked={formData.isHighPriority}
                onCheckedChange={(checked) => handleChange("isHighPriority", checked)}
              />
              <Label htmlFor="isHighPriority">High Priority Project</Label>
            </div>
          </CardContent>
        </Card>

        {/* Customer Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Customer</Label>
              <Select value={formData.customerId} onValueChange={handleCustomerChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a customer..." />
                </SelectTrigger>
                <SelectContent>
                  {mockCustomers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} {customer.company && `(${customer.company})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-stone-500">
                Or enter client details manually below
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) => handleChange("clientName", e.target.value)}
                placeholder="Client's full name"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientEmail">Client Email</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => handleChange("clientEmail", e.target.value)}
                  placeholder="client@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientPhone">Client Phone</Label>
                <Input
                  id="clientPhone"
                  value={formData.clientPhone}
                  onChange={(e) => handleChange("clientPhone", e.target.value)}
                  placeholder="+44 7XXX XXX XXX"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dates & Budget */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Timeline & Budget</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedEndDate">Estimated End Date</Label>
                <Input
                  id="estimatedEndDate"
                  type="date"
                  value={formData.estimatedEndDate}
                  onChange={(e) => handleChange("estimatedEndDate", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">Budget (£)</Label>
              <Input
                id="budget"
                type="number"
                value={formData.budget}
                onChange={(e) => handleChange("budget", e.target.value)}
                placeholder="e.g., 250000"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Any additional notes or internal communications..."
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link to={createPageUrl("DebugProjectWorkspace")}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" className="bg-amber-700 hover:bg-amber-800">
            <Save className="h-4 w-4 mr-2" />
            {isEditing ? "Update Project" : "Create Project"}
          </Button>
        </div>
      </form>

      {/* Live Form Data Preview */}
      <Card className="mt-8 border-dashed border-amber-300 bg-amber-50/50">
        <CardHeader>
          <CardTitle className="text-amber-800">Live Form Data (Debug)</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs overflow-auto bg-white p-3 rounded border max-h-64">
            {JSON.stringify(formData, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}