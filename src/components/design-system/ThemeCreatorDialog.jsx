import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Loader2, Building2, Users, Mail, Package, 
  GitBranch, Palette, Check, AlertCircle, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import ThemeTokenEditor, { STURIJ_TOKENS } from "./ThemeTokenEditor";

export default function ThemeCreatorDialog({ 
  open, 
  onOpenChange,
  parentPackages = []
}) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    // Package info
    package_name: "",
    package_code: "",
    package_type: "customer_theme",
    version: "1.0.0",
    description: "",
    
    // Deployment type
    is_multi_tenant: false,
    
    // Customer info
    customer_name: "",
    customer_email: "",
    customer_company: "",
    
    // Parent package
    parent_package_id: null,
    parent_version: null,
    
    // Design tokens (will be populated from editor)
    design_tokens: {
      colors: {},
      typography: {},
      spacing: {},
      effects: {}
    }
  });

  const { data: corePackages = [] } = useQuery({
    queryKey: ["designSystemPackages", "core"],
    queryFn: async () => {
      const all = await base44.entities.DesignSystemPackage.filter({ package_type: "core" });
      return all;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      return base44.entities.DesignSystemPackage.create({
        ...data,
        tailwind_version: "3.4.0",
        base44_compatible: true,
        status: "draft",
        changelog: [{
          version: data.version,
          date: new Date().toISOString(),
          changes: ["Initial theme creation"],
          breaking_changes: false
        }],
        last_sync_check: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["designSystemPackages"] });
      toast.success("Custom theme package created successfully");
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to create package: " + error.message);
    }
  });

  const resetForm = () => {
    setStep(1);
    setFormData({
      package_name: "",
      package_code: "",
      package_type: "customer_theme",
      version: "1.0.0",
      description: "",
      is_multi_tenant: false,
      customer_name: "",
      customer_email: "",
      customer_company: "",
      parent_package_id: null,
      parent_version: null,
      design_tokens: { colors: {}, typography: {}, spacing: {}, effects: {} }
    });
  };

  const handleNext = () => {
    // Validation for each step
    if (step === 1) {
      if (!formData.package_name.trim()) {
        toast.error("Package name is required");
        return;
      }
      if (!formData.package_code.trim()) {
        toast.error("Package code is required");
        return;
      }
    }
    if (step === 2) {
      if (!formData.customer_company.trim()) {
        toast.error("Customer company is required");
        return;
      }
      if (!formData.customer_email.trim()) {
        toast.error("Customer email is required");
        return;
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleCreate = () => {
    createMutation.mutate(formData);
  };

  const handleTokensSave = (tokens) => {
    setFormData(prev => ({
      ...prev,
      design_tokens: tokens
    }));
    toast.success("Token customizations saved");
  };

  const generateThemeFromAI = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a custom design theme based on: "${aiPrompt}".
        
Generate a complete theme package with:
1. Package name and description
2. Customer company name (if mentioned)
3. Suggested color customizations (primary, secondary, accent)
4. Font suggestions (heading and body)

Return JSON with: package_name, description, customer_company, design_tokens (with colors object containing primary, secondary, accent in OKLCH format)`,
        response_json_schema: {
          type: "object",
          properties: {
            package_name: { type: "string" },
            description: { type: "string" },
            customer_company: { type: "string" },
            design_tokens: { 
              type: "object",
              properties: {
                colors: { type: "object" }
              }
            }
          }
        }
      });

      setFormData(prev => ({
        ...prev,
        package_name: result.package_name || aiPrompt,
        package_code: generatePackageCode(result.package_name || aiPrompt),
        description: result.description || "",
        customer_company: result.customer_company || "",
        design_tokens: result.design_tokens || prev.design_tokens
      }));

      toast.success("AI theme generated - review and customize");
      setStep(2);
    } catch (e) {
      toast.error("Failed to generate theme");
      console.error(e);
    }
    setIsGenerating(false);
  };

  const generatePackageCode = (name) => {
    return name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[var(--color-midnight)] flex items-center gap-2">
            <Palette className="h-5 w-5 text-[var(--color-primary)]" />
            Create Custom Theme Package
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 py-4">
          {[1, 2, 3, 4].map((s) => (
            <React.Fragment key={s}>
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  s < step ? "bg-[var(--color-success)] text-white" :
                  s === step ? "bg-[var(--color-primary)] text-white" :
                  "bg-[var(--color-background-muted)] text-[var(--color-charcoal)]"
                }`}
              >
                {s < step ? <Check className="h-4 w-4" /> : s}
              </div>
              {s < 4 && (
                <div className={`w-12 h-0.5 ${s < step ? "bg-[var(--color-success)]" : "bg-[var(--color-background-muted)]"}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="text-center text-sm text-[var(--color-charcoal)] mb-4">
          {step === 1 && "Package Configuration"}
          {step === 2 && "Customer Information"}
          {step === 3 && "Base Theme Selection"}
          {step === 4 && "Customize Design Tokens"}
        </div>

        {/* Step 1: Package Configuration */}
        {step === 1 && (
          <div className="space-y-4">
            {/* AI Theme Generator */}
            <Card className="border-2 border-[var(--color-primary)]/20">
              <CardContent className="pt-4 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-[var(--color-secondary)]" />
                  <h4 className="font-heading font-medium text-[var(--color-midnight)]">
                    AI Theme Generator
                  </h4>
                </div>
                <div className="space-y-2">
                  <Label>Describe your theme</Label>
                  <Textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g., Modern tech startup for Acme Corp with bold blue colors and clean typography"
                    rows={3}
                  />
                </div>
                <Button 
                  onClick={generateThemeFromAI} 
                  disabled={isGenerating || !aiPrompt.trim()} 
                  className="w-full bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Theme with AI
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Package Name *</Label>
                <Input
                  value={formData.package_name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData({ 
                      ...formData, 
                      package_name: name,
                      package_code: generatePackageCode(name)
                    });
                  }}
                  placeholder="e.g., Acme Corp Theme"
                />
              </div>
              <div className="space-y-2">
                <Label>Package Code *</Label>
                <Input
                  value={formData.package_code}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    package_code: generatePackageCode(e.target.value) 
                  })}
                  placeholder="e.g., acme-corp-theme"
                />
                <p className="text-xs text-[var(--color-charcoal)]">
                  Auto-generated from name, lowercase with hyphens
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Version</Label>
              <Select 
                value={formData.version} 
                onValueChange={(v) => setFormData({ ...formData, version: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1.0.0">1.0.0 (Initial Release)</SelectItem>
                  <SelectItem value="0.1.0">0.1.0 (Alpha)</SelectItem>
                  <SelectItem value="0.5.0">0.5.0 (Beta)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe this theme package..."
                rows={3}
              />
            </div>

            {/* Deployment Type */}
            <Card className="border-[var(--color-background-muted)]">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-[var(--color-primary)]" />
                      <Label className="font-medium">Multi-Tenant Deployment</Label>
                    </div>
                    <p className="text-sm text-[var(--color-charcoal)]">
                      Enable if this theme will be used across multiple tenant instances
                    </p>
                  </div>
                  <Switch
                    checked={formData.is_multi_tenant}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_multi_tenant: checked })}
                  />
                </div>
                
                <div className="mt-4 p-3 bg-[var(--color-background)] rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-[var(--color-info)] mt-0.5" />
                    <div className="text-sm">
                      {formData.is_multi_tenant ? (
                        <span className="text-[var(--color-midnight)]">
                          <strong>Multi-tenant mode:</strong> Theme will support tenant-specific overrides and shared base styling across all instances.
                        </span>
                      ) : (
                        <span className="text-[var(--color-midnight)]">
                          <strong>Single-tenant mode:</strong> Theme will be deployed to a single application instance.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Customer Information */}
        {step === 2 && (
          <div className="space-y-4">
            <Card className="border-[var(--color-background-muted)]">
              <CardContent className="pt-4 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-5 w-5 text-[var(--color-secondary)]" />
                  <h4 className="font-heading font-medium text-[var(--color-midnight)]">
                    Customer Details
                  </h4>
                </div>
                
                <div className="space-y-2">
                  <Label>Company Name *</Label>
                  <Input
                    value={formData.customer_company}
                    onChange={(e) => setFormData({ ...formData, customer_company: e.target.value })}
                    placeholder="e.g., Acme Corporation"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Contact Name</Label>
                  <Input
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    placeholder="e.g., John Smith"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Contact Email *</Label>
                  <Input
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                    placeholder="e.g., john@acmecorp.com"
                  />
                  <p className="text-xs text-[var(--color-charcoal)]">
                    Used for update notifications when Sturij core library changes
                  </p>
                </div>
              </CardContent>
            </Card>

            {formData.is_multi_tenant && (
              <Card className="border-[var(--color-info)] bg-[var(--color-info)]/5">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-2">
                    <Users className="h-5 w-5 text-[var(--color-info)] mt-0.5" />
                    <div>
                      <h5 className="font-medium text-[var(--color-midnight)]">Multi-Tenant Configuration</h5>
                      <p className="text-sm text-[var(--color-charcoal)] mt-1">
                        This theme will include tenant override capabilities. Each tenant can customize 
                        specific tokens while inheriting from the base theme.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Step 3: Base Theme Selection */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Base Theme (Parent Package) *</Label>
              <p className="text-sm text-[var(--color-charcoal)] mb-3">
                Select the Sturij core package to base this theme on. Updates to the core package 
                can be applied to this theme.
              </p>
              
              <Select 
                value={formData.parent_package_id || ""} 
                onValueChange={(v) => {
                  const parent = corePackages.find(p => p.id === v);
                  setFormData({ 
                    ...formData, 
                    parent_package_id: v,
                    parent_version: parent?.version
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a core package..." />
                </SelectTrigger>
                <SelectContent>
                  {corePackages.map(pkg => (
                    <SelectItem key={pkg.id} value={pkg.id}>
                      <span className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        {pkg.package_name} v{pkg.version}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.parent_package_id && (
              <Card className="border-[var(--color-success)] bg-[var(--color-success)]/5">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <GitBranch className="h-5 w-5 text-[var(--color-success)] mt-0.5" />
                    <div>
                      <h5 className="font-medium text-[var(--color-midnight)]">
                        Based on {corePackages.find(p => p.id === formData.parent_package_id)?.package_name}
                      </h5>
                      <p className="text-sm text-[var(--color-charcoal)] mt-1">
                        Version {formData.parent_version} • All design tokens from this core package 
                        will be loaded as defaults. You can customize any token in the next step.
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Badge className="bg-[var(--color-primary)]/20 text-[var(--color-primary)]">
                          Colors
                        </Badge>
                        <Badge className="bg-[var(--color-primary)]/20 text-[var(--color-primary)]">
                          Typography
                        </Badge>
                        <Badge className="bg-[var(--color-primary)]/20 text-[var(--color-primary)]">
                          Spacing
                        </Badge>
                        <Badge className="bg-[var(--color-primary)]/20 text-[var(--color-primary)]">
                          Effects
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {corePackages.length === 0 && (
              <Card className="border-[var(--color-warning)] bg-[var(--color-warning)]/5">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-[var(--color-warning)]" />
                    <div>
                      <h5 className="font-medium text-[var(--color-midnight)]">No Core Packages Found</h5>
                      <p className="text-sm text-[var(--color-charcoal)]">
                        Create a Sturij Core package first to use as a base for custom themes.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Step 4: Token Customization */}
        {step === 4 && (
          <ThemeTokenEditor
            packageData={{ design_tokens: formData.design_tokens }}
            onSave={handleTokensSave}
            isSaving={false}
          />
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t border-[var(--color-background-muted)]">
          <Button 
            variant="outline" 
            onClick={step === 1 ? () => onOpenChange(false) : handleBack}
          >
            {step === 1 ? "Cancel" : "Back"}
          </Button>
          
          <div className="flex gap-2">
            {step < 4 ? (
              <Button 
                onClick={handleNext}
                className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white"
                disabled={step === 3 && !formData.parent_package_id && corePackages.length > 0}
              >
                Next Step
              </Button>
            ) : (
              <Button 
                onClick={handleCreate}
                disabled={createMutation.isPending}
                className="bg-[var(--color-success)] hover:bg-[var(--color-success-dark)] text-white"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Create Theme Package
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}