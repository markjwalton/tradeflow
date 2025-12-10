import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Building2, Mail, Phone, MapPin, Users, Palette, Type, 
  Target, TrendingUp, Key, Sparkles, Save, CheckCircle2, Upload
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function TenantSetup() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get("session");
  const tenantId = urlParams.get("tenant");

  const [profile, setProfile] = useState({
    tenant_id: tenantId || "",
    company_name: "",
    company_number: "",
    vat_number: "",
    website: "",
    email: "",
    phone: "",
    whatsapp: "",
    address: { line1: "", line2: "", city: "", postcode: "", country: "" },
    accountant_name: "",
    accountant_contact: "",
    legal_advisor_name: "",
    legal_advisor_contact: "",
    email_provider: "gmail",
    brand_colors: { primary: "#4a5d4e", secondary: "#d4a574", accent: "#d9b4a7" },
    brand_fonts: { display: "", body: "" },
    logo_url: "",
    brand_assets: [],
    business_summary: "",
    app_goals: [""],
    kpis: [{ name: "", target: "", metric: "" }],
    integration_secrets: {},
    setup_completed: false
  });

  const { data: existingProfile } = useQuery({
    queryKey: ["tenantProfile", tenantId],
    queryFn: () => base44.entities.TenantProfile.filter({ tenant_id: tenantId }).then(r => r[0]),
    enabled: !!tenantId,
    onSuccess: (data) => {
      if (data) setProfile(data);
    }
  });

  const saveProfileMutation = useMutation({
    mutationFn: async (data) => {
      if (existingProfile?.id) {
        return await base44.entities.TenantProfile.update(existingProfile.id, data);
      }
      return await base44.entities.TenantProfile.create(data);
    },
    onSuccess: () => {
      toast.success("Profile saved successfully");
      queryClient.invalidateQueries(["tenantProfile"]);
    },
  });

  const enhanceWithAI = async () => {
    const prompt = `Based on this business information, create a compelling business summary:
Company: ${profile.company_name}
Industry context: ${profile.business_summary || "Not provided"}
Goals: ${profile.app_goals.filter(g => g).join(", ")}

Generate a 2-3 paragraph professional business summary.`;

    const result = await base44.integrations.Core.InvokeLLM({ prompt });
    setProfile({ ...profile, business_summary: result });
    toast.success("AI summary generated");
  };

  const uploadLogo = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setProfile({ ...profile, logo_url: file_url });
    toast.success("Logo uploaded");
  };

  const handleSaveAndContinue = async () => {
    await saveProfileMutation.mutateAsync({ ...profile, setup_completed: true });
    if (sessionId) {
      navigate(createPageUrl("OnboardingWorkflow") + `?session=${sessionId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <Card className="rounded-xl border-primary/20 bg-gradient-to-br from-primary/10 to-secondary/10">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-display font-bold text-primary mb-2">Tenant Setup</h1>
                <p className="text-muted-foreground">Complete your company profile, branding, and integration setup</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="company" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="company">
              <Building2 className="h-4 w-4 mr-2" />
              Company
            </TabsTrigger>
            <TabsTrigger value="branding">
              <Palette className="h-4 w-4 mr-2" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="business">
              <Target className="h-4 w-4 mr-2" />
              Business
            </TabsTrigger>
            <TabsTrigger value="advisors">
              <Users className="h-4 w-4 mr-2" />
              Advisors
            </TabsTrigger>
            <TabsTrigger value="integrations">
              <Key className="h-4 w-4 mr-2" />
              Integrations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="company">
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle>Company Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Company Name *</Label>
                    <Input
                      value={profile.company_name}
                      onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                      placeholder="Acme Ltd"
                    />
                  </div>
                  <div>
                    <Label>Company Number</Label>
                    <Input
                      value={profile.company_number}
                      onChange={(e) => setProfile({ ...profile, company_number: e.target.value })}
                      placeholder="12345678"
                    />
                  </div>
                  <div>
                    <Label>VAT Number</Label>
                    <Input
                      value={profile.vat_number}
                      onChange={(e) => setProfile({ ...profile, vat_number: e.target.value })}
                      placeholder="GB123456789"
                    />
                  </div>
                  <div>
                    <Label>Website</Label>
                    <Input
                      value={profile.website}
                      onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      placeholder="contact@company.com"
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      placeholder="+44 20 1234 5678"
                    />
                  </div>
                  <div>
                    <Label>WhatsApp</Label>
                    <Input
                      value={profile.whatsapp}
                      onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })}
                      placeholder="+44 7700 900000"
                    />
                  </div>
                  <div>
                    <Label>Email Provider</Label>
                    <Select value={profile.email_provider} onValueChange={(v) => setProfile({ ...profile, email_provider: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gmail">Gmail / Google Workspace</SelectItem>
                        <SelectItem value="outlook">Outlook / Microsoft 365</SelectItem>
                        <SelectItem value="custom">Custom Domain</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Business Address
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <Label>Address Line 1</Label>
                      <Input
                        value={profile.address.line1}
                        onChange={(e) => setProfile({ ...profile, address: { ...profile.address, line1: e.target.value } })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Address Line 2</Label>
                      <Input
                        value={profile.address.line2}
                        onChange={(e) => setProfile({ ...profile, address: { ...profile.address, line2: e.target.value } })}
                      />
                    </div>
                    <div>
                      <Label>City</Label>
                      <Input
                        value={profile.address.city}
                        onChange={(e) => setProfile({ ...profile, address: { ...profile.address, city: e.target.value } })}
                      />
                    </div>
                    <div>
                      <Label>Postcode</Label>
                      <Input
                        value={profile.address.postcode}
                        onChange={(e) => setProfile({ ...profile, address: { ...profile.address, postcode: e.target.value } })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Country</Label>
                      <Input
                        value={profile.address.country}
                        onChange={(e) => setProfile({ ...profile, address: { ...profile.address, country: e.target.value } })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="branding">
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle>Brand Identity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Company Logo</Label>
                  <div className="mt-2 flex items-center gap-4">
                    {profile.logo_url && (
                      <img src={profile.logo_url} alt="Logo" className="h-16 w-16 object-contain border rounded" />
                    )}
                    <Input type="file" accept="image/*" onChange={uploadLogo} />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-medium flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Brand Colors
                  </h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <Label>Primary Color</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          type="color"
                          value={profile.brand_colors.primary}
                          onChange={(e) => setProfile({ ...profile, brand_colors: { ...profile.brand_colors, primary: e.target.value } })}
                          className="w-16 h-10"
                        />
                        <Input
                          value={profile.brand_colors.primary}
                          onChange={(e) => setProfile({ ...profile, brand_colors: { ...profile.brand_colors, primary: e.target.value } })}
                          placeholder="#4a5d4e"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Secondary Color</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          type="color"
                          value={profile.brand_colors.secondary}
                          onChange={(e) => setProfile({ ...profile, brand_colors: { ...profile.brand_colors, secondary: e.target.value } })}
                          className="w-16 h-10"
                        />
                        <Input
                          value={profile.brand_colors.secondary}
                          onChange={(e) => setProfile({ ...profile, brand_colors: { ...profile.brand_colors, secondary: e.target.value } })}
                          placeholder="#d4a574"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Accent Color</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          type="color"
                          value={profile.brand_colors.accent}
                          onChange={(e) => setProfile({ ...profile, brand_colors: { ...profile.brand_colors, accent: e.target.value } })}
                          className="w-16 h-10"
                        />
                        <Input
                          value={profile.brand_colors.accent}
                          onChange={(e) => setProfile({ ...profile, brand_colors: { ...profile.brand_colors, accent: e.target.value } })}
                          placeholder="#d9b4a7"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-medium flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    Brand Typography
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Display Font</Label>
                      <Input
                        value={profile.brand_fonts.display}
                        onChange={(e) => setProfile({ ...profile, brand_fonts: { ...profile.brand_fonts, display: e.target.value } })}
                        placeholder="Inter, Helvetica, Arial"
                      />
                    </div>
                    <div>
                      <Label>Body Font</Label>
                      <Input
                        value={profile.brand_fonts.body}
                        onChange={(e) => setProfile({ ...profile, brand_fonts: { ...profile.brand_fonts, body: e.target.value } })}
                        placeholder="Georgia, serif"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="business">
            <Card className="rounded-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Business Overview</CardTitle>
                  <Button variant="outline" size="sm" onClick={enhanceWithAI}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Enhance with AI
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Business Summary</Label>
                  <Textarea
                    value={profile.business_summary}
                    onChange={(e) => setProfile({ ...profile, business_summary: e.target.value })}
                    rows={6}
                    placeholder="Describe your business, what you do, and your market position..."
                  />
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-medium flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    App Goals & Objectives
                  </h3>
                  {profile.app_goals.map((goal, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        value={goal}
                        onChange={(e) => {
                          const newGoals = [...profile.app_goals];
                          newGoals[idx] = e.target.value;
                          setProfile({ ...profile, app_goals: newGoals });
                        }}
                        placeholder="e.g., Streamline customer onboarding process"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newGoals = profile.app_goals.filter((_, i) => i !== idx);
                          setProfile({ ...profile, app_goals: newGoals });
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setProfile({ ...profile, app_goals: [...profile.app_goals, ""] })}
                  >
                    Add Goal
                  </Button>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Key Performance Indicators
                  </h3>
                  {profile.kpis.map((kpi, idx) => (
                    <div key={idx} className="grid gap-2 md:grid-cols-4 items-end">
                      <div>
                        <Label className="text-xs">KPI Name</Label>
                        <Input
                          value={kpi.name}
                          onChange={(e) => {
                            const newKpis = [...profile.kpis];
                            newKpis[idx].name = e.target.value;
                            setProfile({ ...profile, kpis: newKpis });
                          }}
                          placeholder="Monthly signups"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Target</Label>
                        <Input
                          value={kpi.target}
                          onChange={(e) => {
                            const newKpis = [...profile.kpis];
                            newKpis[idx].target = e.target.value;
                            setProfile({ ...profile, kpis: newKpis });
                          }}
                          placeholder="100"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Metric</Label>
                        <Input
                          value={kpi.metric}
                          onChange={(e) => {
                            const newKpis = [...profile.kpis];
                            newKpis[idx].metric = e.target.value;
                            setProfile({ ...profile, kpis: newKpis });
                          }}
                          placeholder="users/month"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newKpis = profile.kpis.filter((_, i) => i !== idx);
                          setProfile({ ...profile, kpis: newKpis });
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setProfile({ ...profile, kpis: [...profile.kpis, { name: "", target: "", metric: "" }] })}
                  >
                    Add KPI
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advisors">
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle>Professional Advisors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Accountant / Accounting Firm</Label>
                    <Input
                      value={profile.accountant_name}
                      onChange={(e) => setProfile({ ...profile, accountant_name: e.target.value })}
                      placeholder="Smith & Co Accountants"
                    />
                  </div>
                  <div>
                    <Label>Accountant Contact</Label>
                    <Input
                      value={profile.accountant_contact}
                      onChange={(e) => setProfile({ ...profile, accountant_contact: e.target.value })}
                      placeholder="john@smithaccountants.com"
                    />
                  </div>
                  <div>
                    <Label>Legal Advisor / Law Firm</Label>
                    <Input
                      value={profile.legal_advisor_name}
                      onChange={(e) => setProfile({ ...profile, legal_advisor_name: e.target.value })}
                      placeholder="Jones Legal LLP"
                    />
                  </div>
                  <div>
                    <Label>Legal Advisor Contact</Label>
                    <Input
                      value={profile.legal_advisor_contact}
                      onChange={(e) => setProfile({ ...profile, legal_advisor_contact: e.target.value })}
                      placeholder="sarah@joneslegal.com"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations">
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle>Integration Secrets</CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  API keys and credentials for third-party services (securely encrypted)
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-4">Integration secrets will be configured during the onboarding process</p>
                  <p className="text-sm">Common integrations: Payment gateways, Email services, CRM systems, Analytics</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="rounded-xl border-primary/20">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {profile.setup_completed ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    Setup completed
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save your progress anytime
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => saveProfileMutation.mutate(profile)}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Draft
                </Button>
                <Button onClick={handleSaveAndContinue}>
                  Complete Setup & Continue
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}