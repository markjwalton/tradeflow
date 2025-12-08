import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Database,
  Layout,
  Zap,
  Workflow,
  FileText,
  CheckSquare,
  Users,
  Building2,
  GitBranch,
  Calendar,
  Mail,
  Shield,
  Package,
  Navigation,
  Settings,
  ChevronRight,
  Clock,
  Sparkles,
} from "lucide-react";

const SPEC_VERSION = "1.0.0";
const LAST_UPDATED = "2025-11-30";

const specSections = [
  {
    id: "overview",
    title: "System Overview",
    icon: Package,
    content: {
      description: "A comprehensive business application generator platform that enables the creation of custom applications through mind mapping, template libraries, and workflow automation.",
      keyCapabilities: [
        "Visual mind map-based application design",
        "Reusable template libraries (Entities, Pages, Features)",
        "Workflow and process automation",
        "Multi-tenant architecture with role-based access",
        "AI-assisted generation for workflows, forms, and checklists",
        "Appointment booking system with email verification",
      ],
    },
  },
  {
    id: "entities",
    title: "Entity Library",
    icon: Database,
    content: {
      description: "Central repository of reusable data models that can be added to custom projects.",
      features: [
        "Create, edit, duplicate, and delete entity templates",
        "JSON schema-based field definitions",
        "Category organization (Core, CRM, Finance, Operations, HR, Inventory, Communication)",
        "Relationship mapping between entities",
        "Tag-based filtering and search",
        "AI-powered entity generation from natural language descriptions",
        "Add to Custom Project with related pages/features selection",
      ],
      entities: [
        { name: "EntityTemplate", purpose: "Stores reusable entity definitions" },
        { name: "EntityDependency", purpose: "Maps entity relationships to pages/features" },
      ],
    },
  },
  {
    id: "pages",
    title: "Page Library",
    icon: Layout,
    content: {
      description: "Collection of reusable page templates for different UI patterns.",
      features: [
        "Page categories: Dashboard, List, Detail, Form, Report, Settings, Custom",
        "Layout options: full-width, centered, sidebar, split",
        "Entity usage tracking",
        "Feature integration mapping",
        "Component definitions",
        "Action specifications",
        "AI-powered page generation",
      ],
      entities: [
        { name: "PageTemplate", purpose: "Stores page template definitions" },
      ],
    },
  },
  {
    id: "features",
    title: "Feature Library",
    icon: Zap,
    content: {
      description: "Reusable feature templates for common functionality patterns.",
      features: [
        "Feature categories: Communication, Automation, Integration, Reporting, Security, Workflow, UI/UX",
        "Complexity ratings (simple, medium, complex)",
        "Entity dependencies tracking",
        "Trigger definitions",
        "Integration requirements",
        "User story mapping",
      ],
      entities: [
        { name: "FeatureTemplate", purpose: "Stores feature template definitions" },
      ],
    },
  },
  {
    id: "workflows",
    title: "Workflow System",
    icon: Workflow,
    content: {
      description: "Visual workflow designer for creating automated business processes.",
      features: [
        "Drag-and-drop workflow canvas",
        "Step types: Task, Milestone, Decision, Approval, Form, Checklist, Integration, Notification, Wait",
        "Step reordering via drag-and-drop",
        "Assignee configuration (user, role, team, auto, requester)",
        "Form and checklist integration at step level",
        "Decision branching with multiple options",
        "Trigger configuration (on_create, on_update, on_status_change, manual)",
        "AI-powered workflow generation",
        "Estimated duration tracking",
      ],
      entities: [
        { name: "Workflow", purpose: "Workflow definitions" },
        { name: "WorkflowStep", purpose: "Individual steps within workflows" },
        { name: "WorkflowInstance", purpose: "Running instances of workflows" },
        { name: "WorkflowTask", purpose: "Tasks generated from workflow steps" },
      ],
    },
  },
  {
    id: "forms",
    title: "Form Builder",
    icon: FileText,
    content: {
      description: "Dynamic form builder for creating data capture forms.",
      features: [
        "Field types: Text, Textarea, Number, Email, Phone, URL, Date, Time, DateTime, Select, Multi-select, Checkbox, Radio, File Upload, Signature, Rating, Slider",
        "Drag-and-drop field ordering",
        "Field validation (required, min/max, pattern)",
        "Conditional logic support",
        "Section grouping",
        "AI-powered form generation",
        "Form preview mode",
        "Linked entity for data storage",
      ],
      entities: [
        { name: "FormTemplate", purpose: "Stores form definitions" },
      ],
    },
  },
  {
    id: "checklists",
    title: "Checklist Builder",
    icon: CheckSquare,
    content: {
      description: "Checklist template builder for quality control and verification processes.",
      features: [
        "Categories: Quality, Safety, Compliance, Preparation, Verification, Custom",
        "Item ordering with drag-and-drop",
        "Required items configuration",
        "AI-powered checklist generation",
        "Active/inactive status",
      ],
      entities: [
        { name: "ChecklistTemplate", purpose: "Stores checklist definitions" },
      ],
    },
  },
  {
    id: "mindmap",
    title: "Mind Map Editor",
    icon: GitBranch,
    content: {
      description: "Visual mind mapping tool for designing application architecture.",
      features: [
        "Interactive canvas with zoom and pan",
        "Node types: Central, Main Branch, Sub Branch, Feature, Entity, Page, Note",
        "Visual connections between nodes",
        "Color-coded functional areas",
        "Template-based generation from business templates",
        "Entity relationship diagram view",
        "Specification generation",
        "Version history and forking",
        "Tenant-specific forks",
      ],
      entities: [
        { name: "MindMap", purpose: "Mind map definitions" },
        { name: "MindMapNode", purpose: "Individual nodes" },
        { name: "MindMapConnection", purpose: "Connections between nodes" },
        { name: "NodeTemplate", purpose: "Reusable node templates" },
      ],
    },
  },
  {
    id: "appointments",
    title: "Appointment Booking",
    icon: Calendar,
    content: {
      description: "Complete appointment booking system with public forms and admin management.",
      features: [
        "Website enquiry form with interest options",
        "Email verification for online bookings",
        "Callback request option",
        "Appointment slot management by location/date/time",
        "Coverage area configuration",
        "Booking confirmation with tokens",
        "Change/cancel functionality",
        "Reminder email system",
        "Admin appointment manager",
        "Interest options manager for dropdown configuration",
      ],
      entities: [
        { name: "Enquiry", purpose: "Customer enquiries" },
        { name: "InterestOption", purpose: "Configurable dropdown options" },
        { name: "AppointmentBlock", purpose: "Available time slots" },
        { name: "Appointment", purpose: "Booked appointments" },
        { name: "EmailVerificationToken", purpose: "Email verification tokens" },
      ],
      pages: [
        "WebsiteEnquiryForm - Public enquiry submission",
        "AppointmentHub - Slot selection after verification",
        "AppointmentConfirm - Booking confirmation/management",
        "AppointmentManager - Admin appointment management",
        "InterestOptionsManager - Admin options configuration",
      ],
    },
  },
  {
    id: "tenants",
    title: "Multi-Tenant System",
    icon: Building2,
    content: {
      description: "Multi-tenant architecture with role-based access control.",
      features: [
        "Tenant creation and management",
        "User role assignment per tenant",
        "Role definitions (admin, user, custom)",
        "Access request workflow",
        "Global admin vs tenant admin distinction",
        "Tenant-specific navigation configuration",
      ],
      entities: [
        { name: "Tenant", purpose: "Tenant organizations" },
        { name: "TenantRole", purpose: "Role definitions" },
        { name: "TenantUserRole", purpose: "User-role-tenant mappings" },
        { name: "AccessRequest", purpose: "Pending access requests" },
      ],
    },
  },
  {
    id: "navigation",
    title: "Navigation Manager",
    icon: Navigation,
    content: {
      description: "Dynamic navigation configuration for generated applications.",
      features: [
        "Hierarchical menu structure",
        "Icon selection",
        "Role-based visibility",
        "Ordering and nesting",
        "Tenant-specific navigation",
      ],
      entities: [
        { name: "NavigationConfig", purpose: "Navigation configuration" },
        { name: "NavigationItem", purpose: "Individual menu items" },
      ],
    },
  },
  {
    id: "templates",
    title: "Business Templates",
    icon: Package,
    content: {
      description: "Pre-built business application templates combining entities, pages, and features.",
      features: [
        "Complete business type definitions",
        "Entity bundles with relationships",
        "Page bundles",
        "Feature bundles",
        "Workflow definitions",
        "AI-enhanced summaries",
        "Starred templates for quick access",
        "Category filtering",
      ],
      entities: [
        { name: "BusinessTemplate", purpose: "Complete business app templates" },
      ],
    },
  },
  {
    id: "projects",
    title: "Custom Projects",
    icon: Package,
    content: {
      description: "Custom project containers for organizing selected entities, pages, and features.",
      features: [
        "Project creation and management",
        "Add entities with related pages/features",
        "Starred projects for business template dropdown",
        "Project-scoped template filtering",
      ],
      entities: [
        { name: "CustomProject", purpose: "Custom project containers" },
      ],
    },
  },
  {
    id: "ai",
    title: "AI Capabilities",
    icon: Zap,
    content: {
      description: "AI-powered generation and assistance throughout the platform.",
      features: [
        "Entity generation from descriptions",
        "Page generation from requirements",
        "Feature generation from use cases",
        "Workflow generation from process descriptions",
        "Form generation from field descriptions",
        "Checklist generation from requirements",
        "Mind map generation from business templates",
        "Specification document generation",
        "Dependency analysis for business templates",
        ],
        },
        },
        {
        id: "dependency-analyzer",
        title: "AI Dependency Analyzer",
        icon: Sparkles,
        content: {
        description: "Intelligent analysis of selected entities, pages, and features to identify gaps and suggest missing components.",
        features: [
        "Analyzes entity relationships to find missing referenced entities",
        "Suggests essential pages for each entity (list, detail, form)",
        "Recommends features based on entity types",
        "Identifies workflow dependencies (forms, checklists)",
        "Highlights logical gaps in application design",
        "Severity ratings (critical, recommended, optional)",
        "One-click application of selected suggestions",
        ],
        },
        },
        ];

const surveyDataSpec = {
  name: "SurveyData",
  purpose: "Site survey information for projects",
  fields: [
    "Site details (address, access, parking)",
    "Building information (type, floor, lift)",
    "Room dimensions and conditions",
    "Customer requirements and preferences",
    "Budget and timeline",
    "Photos and documents",
  ],
};

export default function SystemSpecification() {
  const [activeSection, setActiveSection] = useState("overview");

  const currentSection = specSections.find((s) => s.id === activeSection);

  return (
    <div className="h-full flex bg-[var(--color-background)]">
      {/* Sidebar */}
      <div className="w-64 border-r border-background-muted bg-card">
        <div className="p-4 border-b border-background-muted">
          <h2 className="font-semibold text-[var(--color-midnight)]">System Specification</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">v{SPEC_VERSION}</Badge>
            <span className="text-xs text-muted-foreground">{LAST_UPDATED}</span>
          </div>
        </div>
        <ScrollArea className="h-[calc(100vh-180px)]">
          <div className="p-2">
            {specSections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                    isActive
                      ? "bg-info-50 text-info-foreground font-medium"
                      : "hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {section.title}
                  {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <ScrollArea className="h-full">
          <div className="p-6 max-w-4xl">
            {currentSection && (
              <>
                <div className="flex items-center gap-3 mb-6">
                  {React.createElement(currentSection.icon, {
                    className: "h-8 w-8 text-info-foreground",
                  })}
                  <div>
                    <h1 className="text-2xl font-bold">{currentSection.title}</h1>
                    <p className="text-muted-foreground">
                      {currentSection.content.description}
                    </p>
                  </div>
                </div>

                {/* Key Capabilities (Overview only) */}
                {currentSection.content.keyCapabilities && (
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="text-lg">Key Capabilities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {currentSection.content.keyCapabilities.map((cap, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <ChevronRight className="h-4 w-4 mt-0.5 text-info-foreground" />
                            <span>{cap}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Features */}
                {currentSection.content.features && (
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="text-lg">Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {currentSection.content.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckSquare className="h-4 w-4 mt-0.5 text-success-foreground flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Entities */}
                {currentSection.content.entities && (
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="text-lg">Data Entities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {currentSection.content.entities.map((entity, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                          >
                            <Database className="h-5 w-5 text-info-foreground" />
                            <div>
                              <div className="font-medium">{entity.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {entity.purpose}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Pages (for appointments) */}
                {currentSection.content.pages && (
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="text-lg">Pages</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {currentSection.content.pages.map((page, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Layout className="h-4 w-4 mt-0.5 text-accent-400" />
                            <span className="text-sm">{page}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Version History */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Version History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-2 border-info-foreground pl-4">
                    <div className="flex items-center gap-2">
                      <Badge>v1.0.0</Badge>
                      <span className="text-sm text-muted-foreground">2025-11-30</span>
                    </div>
                    <p className="text-sm mt-1">
                      Initial specification document covering all core platform
                      functionality.
                    </p>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                      <li>• Entity, Page, Feature libraries with AI generation</li>
                      <li>• Workflow designer with drag-and-drop canvas</li>
                      <li>• Form and Checklist builders</li>
                      <li>• Mind Map editor with template generation</li>
                      <li>• Appointment booking system</li>
                      <li>• Multi-tenant architecture</li>
                      <li>• Custom projects with related items selection</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}