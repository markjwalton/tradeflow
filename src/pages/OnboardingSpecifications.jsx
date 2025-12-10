import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database, Layout, FileCode, CheckCircle, Copy, Sparkles, Loader2, Zap } from "lucide-react";
import { toast } from "sonner";

const jsonSchemas = {
  OnboardingSession: {
    properties: {
      tenant_id: { type: "string", required: true },
      status: { 
        type: "string", 
        enum: ["discovery", "analysis", "proposal", "review", "approved", "implementation"],
        default: "discovery"
      },
      conversation_history: { type: "array", items: { type: "object" } },
      high_level_summary: { type: "string" },
      single_source_of_truth: { type: "string" },
      proposed_architecture: { type: "object" },
      development_plan: { type: "string" },
      technical_recommendations: { type: "string" },
      feedback_notes: { type: "string" }
    }
  },
  BusinessProfile: {
    properties: {
      onboarding_session_id: { type: "string", required: true },
      industry: { type: "string", required: true },
      business_size: { 
        type: "string",
        enum: ["solo", "small_2_10", "medium_11_100", "large_100_plus"]
      },
      market_type: { type: "string", enum: ["B2B", "B2C", "B2G", "mixed"] },
      annual_revenue_range: { type: "string" },
      primary_problem: { type: "string" },
      current_tools: { type: "array", items: { type: "string" } },
      growth_goals: { type: "string" },
      compliance_requirements: { type: "array", items: { type: "string" } }
    }
  },
  OperationalProcess: {
    properties: {
      onboarding_session_id: { type: "string", required: true },
      process_name: { type: "string", required: true },
      process_type: {
        type: "string",
        enum: ["sales_crm", "manufacturing", "inventory_supply_chain", "project_management", 
               "hr_team_management", "finance_accounting", "procurement", "shipping_logistics",
               "marketing", "customer_support", "quality_control", "innovation_rd"]
      },
      priority: { type: "number", min: 1, max: 10 },
      current_workflow: { type: "string" },
      pain_points: { type: "array", items: { type: "string" } },
      desired_outcomes: { type: "array", items: { type: "string" } },
      monthly_volume: { type: "number" },
      automation_opportunities: { type: "string" },
      integration_needs: { type: "array", items: { type: "string" } }
    }
  },
  Stakeholder: {
    properties: {
      onboarding_session_id: { type: "string", required: true },
      name: { type: "string", required: true },
      role: { type: "string", required: true },
      responsibilities: { type: "array", items: { type: "string" } },
      processes_involved: { type: "array", items: { type: "string" } },
      app_access_needs: { type: "string" },
      mobile_access_required: { type: "boolean", default: false }
    }
  },
  Requirement: {
    properties: {
      onboarding_session_id: { type: "string", required: true },
      requirement_type: {
        type: "string",
        enum: ["functional", "non_functional", "integration", "data", "security", "performance"],
        required: true
      },
      title: { type: "string", required: true },
      description: { type: "string" },
      priority: {
        type: "string",
        enum: ["must_have", "should_have", "nice_to_have"],
        default: "should_have"
      },
      related_process_id: { type: "string" },
      user_story: { type: "string" },
      acceptance_criteria: { type: "array", items: { type: "string" } },
      technical_notes: { type: "string" }
    }
  },
  OnboardingDocument: {
    properties: {
      onboarding_session_id: { type: "string", required: true },
      document_name: { type: "string", required: true },
      document_type: {
        type: "string",
        enum: ["contract", "sla", "technical_spec", "asset", "policy", "support_doc", "other"],
        required: true
      },
      file_url: { type: "string" },
      uploaded_by: { type: "string" },
      status: {
        type: "string",
        enum: ["pending_review", "approved", "rejected", "requires_changes"],
        default: "pending_review"
      },
      notes: { type: "string" }
    }
  },
  OnboardingTask: {
    properties: {
      onboarding_session_id: { type: "string", required: true },
      task_title: { type: "string", required: true },
      task_description: { type: "string" },
      assigned_to: { type: "string" },
      due_date: { type: "string", format: "date" },
      status: {
        type: "string",
        enum: ["todo", "in_progress", "completed", "blocked"],
        default: "todo",
        required: true
      },
      priority: {
        type: "string",
        enum: ["low", "medium", "high", "critical"],
        default: "medium"
      },
      category: {
        type: "string",
        enum: ["documentation", "development", "review", "approval", "deployment", "training"]
      }
    }
  },
  KnowledgeEntry: {
    properties: {
      onboarding_session_id: { type: "string", required: true },
      question: { type: "string", required: true },
      answer: { type: "string", required: true },
      source: { type: "string", enum: ["ai", "human", "document"] },
      is_important: { type: "boolean", default: false },
      tags: { type: "array", items: { type: "string" } }
    }
  },
  ContractApproval: {
    properties: {
      onboarding_session_id: { type: "string", required: true },
      contract_type: {
        type: "string",
        enum: ["master_agreement", "sla", "dr_policy", "support_terms", "privacy_policy", "data_processing"],
        required: true
      },
      contract_content: { type: "string" },
      approved_by: { type: "string" },
      approved_date: { type: "string", format: "date-time" },
      signature: { type: "string" },
      status: {
        type: "string",
        enum: ["draft", "pending_review", "approved", "rejected"],
        default: "draft"
      }
    }
  }
};

const uiSchema = {
  pages: [
    {
      name: "TenantOnboardingPortal",
      route: "/onboarding-portal",
      description: "Main customer-facing portal",
      sections: [
        {
          name: "Header",
          components: ["Progress Bar", "Status Badge", "User Greeting"],
          sticky: true
        },
        {
          name: "Navigation Tabs",
          tabs: ["Overview", "Documents", "Tech Docs", "AI Assistant", "Tasks", "Contracts"]
        }
      ]
    },
    {
      name: "Overview Tab",
      components: [
        { type: "MilestoneTracker", dataSource: "session.status" },
        { type: "BusinessSummary", dataSource: "session.high_level_summary" }
      ]
    },
    {
      name: "Documents Tab",
      components: [
        { type: "FileUpload", accepts: ["pdf", "doc", "docx", "xls", "xlsx", "png", "jpg"] },
        { type: "DocumentList", dataSource: "OnboardingDocument", filters: ["type", "status"] }
      ]
    },
    {
      name: "Tech Docs Tab",
      components: [
        { type: "ArchitectureDiagram", dataSource: "session.proposed_architecture" },
        { type: "DevelopmentRoadmap", dataSource: "session.development_plan" },
        { type: "TechnicalRecommendations", dataSource: "session.technical_recommendations" }
      ]
    },
    {
      name: "AI Assistant Tab",
      components: [
        { type: "ChatInterface", scrollable: true, height: "400px" },
        { type: "KnowledgeBase", dataSource: "KnowledgeEntry", filter: "is_important:true" },
        { type: "AutoTaskGeneration", triggers: ["question_answered"] }
      ]
    },
    {
      name: "Tasks Tab",
      layout: "two-column",
      components: [
        { type: "TaskList", dataSource: "OnboardingTask", filter: "assigned_to:current_user", title: "My Tasks" },
        { type: "TaskList", dataSource: "OnboardingTask", title: "All Tasks" }
      ]
    },
    {
      name: "Contracts Tab",
      components: [
        { type: "ContractList", dataSource: "ContractApproval" },
        { type: "DigitalSignature", saveOn: "approve" },
        { type: "CompletionBanner", showWhen: "all_required_approved" }
      ]
    }
  ]
};

const technicalRequirements = {
  workflow: {
    stages: [
      {
        stage: "discovery",
        description: "Initial consultation via AI chat",
        features: ["Voice/text input", "Conversation persistence", "Session creation"],
        userActions: ["Answer questions", "Provide business context"],
        systemActions: ["Store conversation", "Extract initial requirements"]
      },
      {
        stage: "analysis",
        description: "AI analyzes requirements and generates proposal",
        features: ["AI-powered analysis", "Architecture generation", "Development planning"],
        userActions: ["Review generated analysis", "Provide feedback"],
        systemActions: ["Generate summary", "Propose architecture", "Create roadmap", "Extract structured data"]
      },
      {
        stage: "proposal",
        description: "Customer reviews and approves/requests changes",
        features: ["Proposal presentation", "Feedback collection", "Iteration support"],
        userActions: ["Review proposal", "Request changes", "Ask questions"],
        systemActions: ["Store feedback", "Support revisions"]
      },
      {
        stage: "review",
        description: "Contract and SLA review",
        features: ["Document management", "Contract presentation", "Digital signatures"],
        userActions: ["Upload documents", "Review contracts", "Sign agreements"],
        systemActions: ["Store documents", "Track approvals"]
      },
      {
        stage: "approved",
        description: "Final approval and deployment preparation",
        features: ["Completion confirmation", "Access to technical docs", "Support setup"],
        userActions: ["Final approval", "Access documentation"],
        systemActions: ["Trigger deployment process", "Set up support access"]
      }
    ]
  },
  features: {
    aiChat: {
      capabilities: [
        "Answer questions from knowledge base",
        "Store Q&A as knowledge entries",
        "Auto-generate tasks from conversations",
        "Context-aware responses using conversation history",
        "Flag important knowledge for quick reference"
      ],
      integrations: ["Core.InvokeLLM"],
      dataStorage: "KnowledgeEntry entity"
    },
    documentManagement: {
      capabilities: [
        "Upload multiple file types",
        "Categorize by document type",
        "Track approval status",
        "Add notes to documents",
        "Download uploaded files"
      ],
      fileTypes: ["pdf", "doc", "docx", "xls", "xlsx", "png", "jpg", "jpeg"],
      storage: "Base44 file storage",
      dataStorage: "OnboardingDocument entity"
    },
    taskManagement: {
      capabilities: [
        "View assigned tasks",
        "Update task status",
        "Filter by priority/category",
        "Auto-creation from AI chat",
        "Track progress"
      ],
      categories: ["documentation", "development", "review", "approval", "deployment", "training"],
      dataStorage: "OnboardingTask entity"
    },
    contractApproval: {
      capabilities: [
        "Display contract content",
        "Digital signature capture",
        "Track approval status",
        "Require all mandatory contracts",
        "Completion confirmation"
      ],
      contractTypes: [
        { key: "master_agreement", label: "Master Service Agreement", required: true },
        { key: "sla", label: "Service Level Agreement", required: true },
        { key: "dr_policy", label: "Disaster Recovery Policy", required: true },
        { key: "support_terms", label: "Support Terms", required: true },
        { key: "privacy_policy", label: "Privacy Policy", required: true },
        { key: "data_processing", label: "Data Processing Agreement", required: false }
      ],
      dataStorage: "ContractApproval entity"
    }
  },
  uxGuidelines: {
    navigation: {
      pattern: "Tabs with icons",
      persistent: "Progress bar in header",
      breadcrumbs: false
    },
    visualization: {
      progressTracking: "Linear progress bar + milestone cards",
      statusIndicators: "Color-coded badges (success/warning/info)",
      dataPresentation: "Cards with clear hierarchy"
    },
    interactions: {
      formSubmission: "Inline validation, optimistic updates",
      fileUpload: "Drag-and-drop + file picker",
      chat: "Real-time message append, auto-scroll",
      signatures: "Type-to-sign with confirmation checkbox"
    },
    responsiveness: {
      breakpoints: ["mobile: <640px", "tablet: 640-1024px", "desktop: >1024px"],
      mobileAdaptations: ["Stack columns", "Bottom navigation", "Simplified task views"]
    },
    accessibility: {
      contrast: "WCAG AA minimum",
      keyboard: "Full keyboard navigation",
      screenReader: "Semantic HTML, ARIA labels",
      focusIndicators: "Visible focus states"
    }
  },
  integrations: {
    required: [
      { name: "Core.InvokeLLM", purpose: "AI chat and analysis" },
      { name: "Core.UploadFile", purpose: "Document storage" }
    ],
    optional: [
      { name: "Core.SendEmail", purpose: "Notifications" },
      { name: "Core.GenerateImage", purpose: "Custom assets" }
    ]
  }
};

export default function OnboardingSpecifications() {
  const queryClient = useQueryClient();
  const [copiedSchema, setCopiedSchema] = useState(null);
  const [generatingFor, setGeneratingFor] = useState(null);
  
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get("session");

  // Fetch generated schemas for this session
  const { data: entitySchemas = [] } = useQuery({
    queryKey: ["entitySchemas", sessionId],
    queryFn: () => sessionId ? base44.entities.EntitySchema.filter({ onboarding_session_id: sessionId }) : [],
    enabled: !!sessionId
  });

  const { data: pageSchemas = [] } = useQuery({
    queryKey: ["pageSchemas", sessionId],
    queryFn: () => sessionId ? base44.entities.PageSchema.filter({ onboarding_session_id: sessionId }) : [],
    enabled: !!sessionId
  });

  const { data: featureSchemas = [] } = useQuery({
    queryKey: ["featureSchemas", sessionId],
    queryFn: () => sessionId ? base44.entities.FeatureSchema.filter({ onboarding_session_id: sessionId }) : [],
    enabled: !!sessionId
  });

  const { data: integrationSchemas = [] } = useQuery({
    queryKey: ["integrationSchemas", sessionId],
    queryFn: () => sessionId ? base44.entities.IntegrationSchema.filter({ onboarding_session_id: sessionId }) : [],
    enabled: !!sessionId
  });

  const { data: session } = useQuery({
    queryKey: ["onboardingSession", sessionId],
    queryFn: () => sessionId ? base44.entities.OnboardingSession.filter({ id: sessionId }).then(r => r[0]) : null,
    enabled: !!sessionId
  });

  const { data: tenantProfile } = useQuery({
    queryKey: ["tenantProfile", session?.tenant_id],
    queryFn: () => session?.tenant_id ? base44.entities.TenantProfile.filter({ tenant_id: session.tenant_id }).then(r => r[0]) : null,
    enabled: !!session?.tenant_id
  });

  const { data: businessProfile } = useQuery({
    queryKey: ["businessProfile", sessionId],
    queryFn: () => sessionId ? base44.entities.BusinessProfile.filter({ onboarding_session_id: sessionId }).then(r => r[0]) : null,
    enabled: !!sessionId
  });

  const { data: processes = [] } = useQuery({
    queryKey: ["processes", sessionId],
    queryFn: () => sessionId ? base44.entities.OperationalProcess.filter({ onboarding_session_id: sessionId }) : [],
    enabled: !!sessionId
  });

  const { data: requirements = [] } = useQuery({
    queryKey: ["requirements", sessionId],
    queryFn: () => sessionId ? base44.entities.Requirement.filter({ onboarding_session_id: sessionId }) : [],
    enabled: !!sessionId
  });

  // AI Generation
  const generateSchemas = async () => {
    if (!sessionId || !session) {
      toast.error("No session selected");
      return;
    }

    setGeneratingFor("all");
    try {
      // Gather comprehensive context
      const contextData = {
        session: {
          summary: session.high_level_summary,
          requirements: session.single_source_of_truth,
          status: session.status
        },
        tenantProfile: tenantProfile ? {
          companyName: tenantProfile.company_name,
          industry: businessProfile?.industry,
          businessSize: businessProfile?.business_size,
          goals: tenantProfile.app_goals,
          kpis: tenantProfile.kpis
        } : null,
        processes: processes.map(p => ({
          name: p.process_name,
          type: p.process_type,
          priority: p.priority,
          painPoints: p.pain_points,
          desiredOutcomes: p.desired_outcomes,
          monthlyVolume: p.monthly_volume
        })),
        requirements: requirements.map(r => ({
          type: r.requirement_type,
          title: r.title,
          description: r.description,
          priority: r.priority,
          userStory: r.user_story
        }))
      };

      const prompt = `You are a system architect. Based on the following comprehensive business context, generate a complete system architecture.

BUSINESS CONTEXT:
${JSON.stringify(contextData, null, 2)}

Generate a complete system architecture including:

1. ENTITY SCHEMAS: Define all data models needed. For each entity:
   - entity_name: string (e.g., "Customer", "Order")
   - description: string
   - fields: array of {name, type, required, description, enum?, default?}
   - relationships: array of {target_entity, relationship_type, foreign_key}
   - priority: number (1-10, where 1 is highest)

2. PAGE SCHEMAS: Define all pages/screens. For each page:
   - page_name: string (e.g., "CustomerList", "OrderDetails")
   - page_type: "list" | "detail" | "form" | "dashboard" | "custom"
   - description: string
   - primary_entity: string
   - data_sources: array of {entity, filters?, sort?}
   - actions: array of {name, type, target}
   - permissions: array of role strings
   - priority: number

3. FEATURE SCHEMAS: Define all features and workflows. For each feature:
   - feature_name: string
   - description: string
   - user_stories: array of {role, want, so_that}
   - workflow: array of {step: NUMBER (1,2,3...), action: string, trigger: string, result: string}
   - entities_involved: array of entity names
   - pages_involved: array of page names
   - business_rules: array of rule strings
   - priority: "must_have" | "should_have" | "nice_to_have"
   
   IMPORTANT: step must be a NUMBER (1, 2, 3, etc.), not a string!

4. INTEGRATION SCHEMAS: Define external services needed. For each integration:
   - integration_name: string
   - integration_type: "api" | "webhook" | "oauth" | "database" | "email" | "sms" | "other"
   - description: string
   - provider: string
   - endpoints: array of {name, method, path, purpose}
   - authentication: {type, credentials_needed}
   - triggers: array of {event, action}
   - priority: number

IMPORTANT: Base everything on the provided context. Generate realistic, practical schemas that directly address the business processes and requirements described.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            entities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  entity_name: { type: "string" },
                  description: { type: "string" },
                  fields: { 
                    type: "array",
                    items: { type: "object" }
                  },
                  relationships: { 
                    type: "array",
                    items: { type: "object" }
                  },
                  priority: { type: "number" }
                }
              }
            },
            pages: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  page_name: { type: "string" },
                  page_type: { type: "string" },
                  description: { type: "string" },
                  primary_entity: { type: "string" },
                  data_sources: { 
                    type: "array",
                    items: { type: "object" }
                  },
                  actions: { 
                    type: "array",
                    items: { type: "object" }
                  },
                  priority: { type: "number" }
                }
              }
            },
            features: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  feature_name: { type: "string" },
                  description: { type: "string" },
                  user_stories: { 
                    type: "array",
                    items: { type: "object" }
                  },
                  workflow: { 
                    type: "array",
                    items: { type: "object" }
                  },
                  entities_involved: { 
                    type: "array",
                    items: { type: "string" }
                  },
                  pages_involved: { 
                    type: "array",
                    items: { type: "string" }
                  },
                  business_rules: { 
                    type: "array",
                    items: { type: "string" }
                  },
                  priority: { type: "string" }
                }
              }
            },
            integrations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  integration_name: { type: "string" },
                  integration_type: { type: "string" },
                  description: { type: "string" },
                  provider: { type: "string" },
                  endpoints: { 
                    type: "array",
                    items: { type: "object" }
                  },
                  authentication: { type: "object" },
                  priority: { type: "number" }
                }
              }
            }
          }
        }
      });

      // Save generated schemas
      for (const entity of result.entities || []) {
        await base44.entities.EntitySchema.create({ ...entity, onboarding_session_id: sessionId });
      }
      for (const page of result.pages || []) {
        await base44.entities.PageSchema.create({ ...page, onboarding_session_id: sessionId });
      }
      for (const feature of result.features || []) {
        await base44.entities.FeatureSchema.create({ ...feature, onboarding_session_id: sessionId });
      }
      for (const integration of result.integrations || []) {
        await base44.entities.IntegrationSchema.create({ ...integration, onboarding_session_id: sessionId });
      }

      queryClient.invalidateQueries(["entitySchemas"]);
      queryClient.invalidateQueries(["pageSchemas"]);
      queryClient.invalidateQueries(["featureSchemas"]);
      queryClient.invalidateQueries(["integrationSchemas"]);
      
      toast.success("System architecture generated");
    } catch (error) {
      toast.error("Failed to generate schemas");
      console.error(error);
    }
    setGeneratingFor(null);
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(JSON.stringify(text, null, 2));
    setCopiedSchema(label);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopiedSchema(null), 2000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-display text-primary mb-2">System Architecture Specifications</h1>
          <p className="text-muted-foreground">AI-generated schemas for entities, pages, features, and integrations</p>
        </div>
        {sessionId && (
          <Button onClick={generateSchemas} disabled={generatingFor === "all"} size="lg">
            {generatingFor === "all" ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generate Architecture
              </>
            )}
          </Button>
        )}
      </div>

      <Tabs defaultValue="entities" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="entities">
            <Database className="h-4 w-4 mr-2" />
            Entities ({entitySchemas.length})
          </TabsTrigger>
          <TabsTrigger value="pages">
            <Layout className="h-4 w-4 mr-2" />
            Pages ({pageSchemas.length})
          </TabsTrigger>
          <TabsTrigger value="features">
            <Zap className="h-4 w-4 mr-2" />
            Features ({featureSchemas.length})
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <FileCode className="h-4 w-4 mr-2" />
            Integrations ({integrationSchemas.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="entities" className="space-y-4">
          {entitySchemas.length === 0 ? (
            <Card className="rounded-xl">
              <CardContent className="py-12 text-center">
                <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-4">No entity schemas generated yet</p>
                {sessionId && (
                  <Button onClick={generateSchemas} disabled={generatingFor === "all"}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Architecture
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            entitySchemas.map((entity) => (
              <Card key={entity.id} className="rounded-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      {entity.entity_name}
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(entity, entity.entity_name)}
                    >
                      {copiedSchema === entity.entity_name ? (
                        <CheckCircle className="h-4 w-4 mr-2 text-success" />
                      ) : (
                        <Copy className="h-4 w-4 mr-2" />
                      )}
                      Copy Schema
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{entity.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-2">Fields:</h4>
                      <div className="space-y-1">
                        {entity.fields?.map((field, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <Badge variant="outline">{field.name}</Badge>
                            <span className="text-muted-foreground">{field.type}</span>
                            {field.required && <Badge className="bg-destructive/10 text-destructive">required</Badge>}
                          </div>
                        ))}
                      </div>
                    </div>
                    {entity.relationships?.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Relationships:</h4>
                        <div className="space-y-1">
                          {entity.relationships.map((rel, idx) => (
                            <div key={idx} className="text-sm text-muted-foreground">
                              {rel.relationship_type} with {rel.target_entity}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="pages" className="space-y-4">
          {pageSchemas.length === 0 ? (
            <Card className="rounded-xl">
              <CardContent className="py-12 text-center">
                <Layout className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No page schemas generated yet</p>
              </CardContent>
            </Card>
          ) : (
            pageSchemas.map((page) => (
              <Card key={page.id} className="rounded-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Layout className="h-5 w-5" />
                      {page.page_name}
                    </CardTitle>
                    <Badge>{page.page_type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{page.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {page.primary_entity && (
                      <div className="text-sm">
                        <span className="font-medium">Primary Entity:</span> {page.primary_entity}
                      </div>
                    )}
                    {page.data_sources?.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 text-sm">Data Sources:</h4>
                        <div className="flex flex-wrap gap-2">
                          {page.data_sources.map((ds, idx) => (
                            <Badge key={idx} variant="outline">{ds.entity}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          {featureSchemas.length === 0 ? (
            <Card className="rounded-xl">
              <CardContent className="py-12 text-center">
                <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No feature schemas generated yet</p>
              </CardContent>
            </Card>
          ) : (
            featureSchemas.map((feature) => (
              <Card key={feature.id} className="rounded-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      {feature.feature_name}
                    </CardTitle>
                    <Badge>{feature.priority || "should_have"}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{feature.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {feature.user_stories?.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 text-sm">User Stories:</h4>
                        <div className="space-y-2">
                          {feature.user_stories.map((story, idx) => (
                            <div key={idx} className="text-sm text-muted-foreground p-2 bg-muted rounded">
                              As a <strong>{story.role}</strong>, I want <strong>{story.want}</strong> so that <strong>{story.so_that}</strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {feature.entities_involved?.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 text-sm">Entities:</h4>
                        <div className="flex flex-wrap gap-2">
                          {feature.entities_involved.map((entity, idx) => (
                            <Badge key={idx} variant="outline">{entity}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          {integrationSchemas.length === 0 ? (
            <Card className="rounded-xl">
              <CardContent className="py-12 text-center">
                <FileCode className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No integration schemas generated yet</p>
              </CardContent>
            </Card>
          ) : (
            integrationSchemas.map((integration) => (
              <Card key={integration.id} className="rounded-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileCode className="h-5 w-5" />
                      {integration.integration_name}
                    </CardTitle>
                    <Badge>{integration.integration_type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{integration.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {integration.provider && (
                      <div className="text-sm">
                        <span className="font-medium">Provider:</span> {integration.provider}
                      </div>
                    )}
                    {integration.endpoints?.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 text-sm">Endpoints:</h4>
                        <div className="space-y-1">
                          {integration.endpoints.map((endpoint, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <Badge variant="outline">{endpoint.method}</Badge>
                              <span className="text-muted-foreground">{endpoint.path}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="ui" className="space-y-4">
          <Card className="rounded-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>UI Component Specifications</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(uiSchema, "UI Schema")}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Schema
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                {JSON.stringify(uiSchema, null, 2)}
              </pre>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle>Page Structure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {uiSchema.pages.map((page, idx) => (
                <div key={idx} className="p-4 border rounded-lg">
                  <div className="font-semibold mb-2">{page.name}</div>
                  {page.description && <p className="text-sm text-muted-foreground mb-3">{page.description}</p>}
                  {page.sections && (
                    <div className="space-y-2">
                      {page.sections.map((section, sIdx) => (
                        <div key={sIdx} className="text-sm">
                          <Badge variant="outline">{section.name}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                  {page.components && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {page.components.map((comp, cIdx) => (
                        <Badge key={cIdx} className="bg-primary/10">
                          {comp.type || comp}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requirements" className="space-y-4">
          <Card className="rounded-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Technical Requirements</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(technicalRequirements, "Requirements")}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                {JSON.stringify(technicalRequirements, null, 2)}
              </pre>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle>Workflow Stages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {technicalRequirements.workflow.stages.map((stage, idx) => (
                <div key={idx} className="p-4 border-l-4 border-l-primary rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge>{stage.stage}</Badge>
                    <h3 className="font-semibold">{stage.description}</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                    <div>
                      <div className="font-medium mb-1">Features:</div>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {stage.features.map((f, fIdx) => <li key={fIdx}>{f}</li>)}
                      </ul>
                    </div>
                    <div>
                      <div className="font-medium mb-1">User Actions:</div>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {stage.userActions.map((a, aIdx) => <li key={aIdx}>{a}</li>)}
                      </ul>
                    </div>
                    <div>
                      <div className="font-medium mb-1">System Actions:</div>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {stage.systemActions.map((s, sIdx) => <li key={sIdx}>{s}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle>UX Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold mb-2">Navigation</h4>
                  <p className="text-sm text-muted-foreground">Pattern: {technicalRequirements.uxGuidelines.navigation.pattern}</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold mb-2">Responsiveness</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {technicalRequirements.uxGuidelines.responsiveness.breakpoints.map((bp, idx) => (
                      <div key={idx}>{bp}</div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}