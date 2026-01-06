import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// This function returns a static list of all pages in the app
// In a real scenario, this would scan the pages folder dynamically
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Complete list of all pages in the app
    const pages = [
      // Core/Dashboard
      "Dashboard",
      "Home",
      "Setup",
      "TenantAccess",
      
      // CRM Pages
      "CRMCustomers",
      "CRMCustomerDetail",
      "CRMCustomerForm",
      "CRMDashboard",
      "CRMEnquiries",
      "CRMEnquiryDetail",
      "CRMEnquiryForm",
      "CRMInteractions",
      "CRMInteractionForm",
      "CRMProjects",
      "CRMProjectDetail",
      "CRMProjectForm",
      "CRMSettings",
      
      // Design System & UI
      "DesignSystemManager",
      "DocumentationManager",
      "StandardPageReference",
      "ComponentShowcase",
      "UILibrary",
      "Library",
      "LibraryItemBuilder",
      "LayoutBuilder",
      "ThemeBuilder",
      "ThemePreview",
      "TokenPreview",
      "DesignTokenEditor",
      "BrandIdentity",
      "FontManager",
      "LayoutPatternManager",
      "OklchColorPicker",
      "GradientTest",
      "TypographyShowcase",
      "CardsShowcase",
      "ButtonsShowcase",
      "CompactButtonShowcase",
      "DataDisplayShowcase",
      "FeedbackShowcase",
      "FormsShowcase",
      "LayoutShowcase",
      "NavigationShowcase",
      
      // Tailwind Showcases
      "TailwindAppShellDemo",
      "TailwindAppShellsShowcase",
      "TailwindBadgesShowcase",
      "TailwindCalendarShowcase",
      "TailwindCardsShowcase",
      "TailwindDescriptionListsShowcase",
      "TailwindDrawerShowcase",
      "TailwindFeedsShowcase",
      "TailwindFormsShowcase",
      "TailwindListsShowcase",
      "TailwindMenuShowcase",
      "TailwindNavigationShowcase",
      "TailwindPageHeadersShowcase",
      "TailwindPeopleListsShowcase",
      "TailwindProductShowcase",
      "TailwindSectionHeadersShowcase",
      "TailwindShowcaseGallery",
      "TailwindStatsShowcase",
      "TailwindTablesShowcase",
      
      // Settings & Admin
      "SiteSettings",
      "NavigationManager",
      "NavigationManagerTest",
      "TenantManager",
      "TenantSetup",
      
      // Development Tools
      "DevTools",
      "RoadmapManager",
      "RoadmapJournal",
      "SprintManager",
      "RuleBook",
      "DeveloperDocs",
      "TestDataManager",
      "TestingHub",
      "DebugProjectWorkspace",
      "DebugProjectEditor",
      "TailwindKnowledgeManager",
      "ComponentPatterns",
      "LearnedPatterns",
      "CSSAudit",
      "ViolationReport",
      "DesignPatternAudit",
      
      // CMS & Content
      "CMSManager",
      "AssetManager",
      "WebsiteThemeManager",
      
      // Website Templates
      "RadiantHome",
      "KeynoteHome",
      "PocketHome",
      "PocketLogin",
      "PocketRegister",
      "StudioAbout",
      "StudioHome",
      "CommitHome",
      "CompassHome",
      "CompassInterviews",
      "CompassLogin",
      "SyntaxDocs",
      "SyntaxHome",
      "TransmitHome",
      
      // Project & Task Management
      "Projects",
      "ProjectDetail",
      "ProjectDetails",
      "ProjectForm",
      "ProjectsOverview",
      "Tasks",
      "Estimates",
      "Customers",
      "Team",
      "Calendar",
      
      // Monitoring & Performance
      "PerformanceMonitor",
      "SecurityMonitor",
      "SecurityDashboard",
      "SystemHealth",
      "APIManager",
      
      // AI & Onboarding
      "AIOnboarding",
      "OnboardingDashboard",
      "OnboardingDocuments",
      "OnboardingPortalPrototype",
      "OnboardingSpecifications",
      "OnboardingWorkflow",
      "TenantOnboardingPortal",
      "ClientOnboardingPortal",
      
      // Schema & Data
      "SchemaVisualEditor",
      "JSONSchemaBuilder",
      "FormSchemaBuilder",
      "SystemSpecification",
      
      // Package & Library
      "PackageLibrary",
      "PackageDetail",
      "PackageExport",
      "SturijPackage",
      "CoreLibraryManager",
      "CommunityPublish",
      
      // Knowledge & Docs
      "KnowledgeManager",
      
      // Dashboard & Widgets
      "DashboardManager",
      
      // Playground & Generators
      "PlaygroundSummary",
      "GeneratedApps",
      "PageBuilder",
      "Components",
      "LivePreview",
      
      // Appointments
      "AppointmentConfirm",
      "AppointmentHub",
      "AppointmentManager",
      "InterestOptionsManager",
      "WebsiteEnquiryForm",
      
      // Misc
      "LookupTestForms",
      "GitHubIntegration",
      "PromptSettings",
      "StandaloneInstanceManager",
      "UXShowcase"
    ];

    return Response.json({ 
      success: true, 
      pages: pages.sort(),
      count: pages.length 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});