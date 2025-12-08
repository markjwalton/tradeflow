import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, AlertTriangle, CheckCircle2, ChevronDown, ChevronRight, FileCode, Sparkles, Copy, Check, Save, History, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function CSSAudit() {
  const [analyzing, setAnalyzing] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileReport, setFileReport] = useState(null);
  const [verifiedFiles, setVerifiedFiles] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  // Load verification status from localStorage
  React.useEffect(() => {
    const stored = localStorage.getItem('cssAudit_verifiedFiles');
    if (stored) {
      setVerifiedFiles(JSON.parse(stored));
    }
  }, []);

  // Generate file list on mount
  React.useEffect(() => {
    const files = generateFileList();
    setFileList(files);
  }, []);

  const generateFileList = () => {
      const files = [];
      
      // Core files
      files.push("Layout.js", "globals.css");
      
      // ALL pages from snapshot
      const pages = [
        "CSSAudit", "Dashboard", "Home", "ComponentShowcase", "DesignTokens",
        "TenantAccess", "TenantManager", "NavigationManager", "Setup",
        "Projects", "Tasks", "Customers", "Team", "Estimates", "Calendar",
        "ProjectDetail", "MindMapEditor", "RuleBook", "PackageLibrary",
        "TemplateLibrary", "BusinessTemplates", "GeneratedApps",
        "EntityLibrary", "PageLibrary", "FeatureLibrary",
        "WorkflowDesigner", "WorkflowLibrary", "FormBuilder", "FormTemplates",
        "ChecklistBuilder", "ChecklistTemplates", "WebsiteEnquiryForm",
        "AppointmentHub", "AppointmentConfirm", "AppointmentManager",
        "InterestOptionsManager", "SystemSpecification", "ERDEditor",
        "ProjectDetails", "ProjectForm", "ProjectsOverview", "PromptSettings",
        "RoadmapManager", "RoadmapJournal", "SprintManager",
        "PlaygroundSummary", "PlaygroundEntity", "PlaygroundPage", "PlaygroundFeature",
        "ConceptWorkbench", "LivePreview", "TestDataManager",
        "CMSManager", "APIManager", "PerformanceMonitor", "SecurityMonitor",
        "LookupTestForms", "CommunityLibrary", "CommunityPublish",
        "DashboardManager", "SturijPackage", "DesignSystemManager",
        "StandaloneAPIStrategy", "StandaloneInstanceManager",
        "TypographyShowcase", "ButtonsShowcase", "CardsShowcase", "FormsShowcase",
        "LayoutShowcase", "NavigationShowcase", "DataDisplayShowcase", "FeedbackShowcase",
        "PackageDetail", "PackageExport", "TokenPreview",
        "TailwindKnowledgeManager", "LayoutBuilder", "TestingHub",
        "DebugProjectWorkspace", "DebugProjectEditor", "KnowledgeManager", "PageBuilder"
      ];
      pages.forEach(p => files.push(`pages/${p}.jsx`));
      
      // ALL UI components (shadcn/ui)
      const uiComponents = [
        "accordion", "alert-dialog", "alert", "aspect-ratio", "avatar", "badge",
        "breadcrumb", "button", "calendar", "card", "carousel", "chart",
        "checkbox", "collapsible", "command", "context-menu", "dialog",
        "drawer", "dropdown-menu", "form", "hover-card", "input", "input-otp",
        "label", "menubar", "navigation-menu", "pagination", "popover",
        "progress", "radio-group", "resizable", "scroll-area", "select",
        "separator", "sheet", "skeleton", "slider", "sonner", "switch",
        "table", "tabs", "textarea", "toast", "toaster", "toggle-group",
        "toggle", "tooltip"
      ];
      uiComponents.forEach(c => files.push(`components/ui/${c}.jsx`));
      
      // ALL library components
      files.push(
        "components/library/designTokens.js",
        "components/library/Typography.jsx",
        "components/library/Buttons.jsx",
        "components/library/Cards.jsx",
        "components/library/Forms.jsx",
        "components/library/Layouts.jsx",
        "components/library/Navigation.jsx",
        "components/library/DataDisplay.jsx",
        "components/library/Feedback.jsx",
        "components/library/EntityBuilder.jsx",
        "components/library/PageBuilder.jsx",
        "components/library/FeatureBuilder.jsx",
        "components/library/CustomProjectSelector.jsx",
        "components/library/SaveToLibraryButton.jsx",
        "components/library/AddGroupToProjectDialog.jsx",
        "components/library/PagePreview.jsx",
        "components/library/index.js"
      );
      
      // Navigation components
      files.push(
        "components/navigation/NavigationBreadcrumb.jsx",
        "components/navigation/GenericNavEditor.jsx",
        "components/navigation/NavigationItemForm.jsx",
        "components/navigation/NavigationItemRow.jsx",
        "components/navigation/NavIconMap.jsx",
        "components/navigation/NavTypes.jsx",
        "components/navigation/NavUtils.jsx",
        "components/navigation/NavigationDataProvider.jsx",
        "components/navigation/NavigationRenderer.jsx",
        "components/navigation/StandaloneNavigation.jsx",
        "components/navigation/TenantSelector.jsx",
        "components/navigation/UnallocationConfirmDialog.jsx"
      );
      
      // Dashboard components
      files.push(
        "components/dashboard/DashboardSettings.jsx",
        "components/dashboard/DashboardWidgetCard.jsx",
        "components/dashboard/WidgetRenderer.jsx",
        "components/dashboard/TechNewsWidget.jsx",
        "components/dashboard/DashboardGrid.jsx",
        "components/dashboard/WidgetLibrarySidebar.jsx",
        "components/dashboard/WidgetStaging.jsx",
        "components/dashboard/AIWidgetGenerator.jsx",
        "components/dashboard/WidgetConfigEditor.jsx",
        "components/dashboard/useDashboardSettings.jsx",
        "components/dashboard/TestDataCoverageWidget.jsx"
      );
      
      // Tenant components
      files.push(
        "components/tenants/TenantForm.jsx",
        "components/tenants/TenantRoleManager.jsx",
        "components/tenants/TenantUserManager.jsx",
        "components/tenants/TenantAccessRequests.jsx"
      );
      
      // MindMap components
      files.push(
        "components/mindmap/MindMapCanvas.jsx",
        "components/mindmap/MindMapNode.jsx",
        "components/mindmap/MindMapConnection.jsx",
        "components/mindmap/MindMapToolbar.jsx",
        "components/mindmap/GeneratedSpecDialog.jsx",
        "components/mindmap/VersionHistoryPanel.jsx",
        "components/mindmap/ForkVersionDialog.jsx",
        "components/mindmap/PublishVersionDialog.jsx",
        "components/mindmap/EntityDetailDialog.jsx",
        "components/mindmap/EntityRelationshipDiagram.jsx",
        "components/mindmap/WorkflowDialog.jsx",
        "components/mindmap/TenantForkDialog.jsx",
        "components/mindmap/AddNodeDialog.jsx",
        "components/mindmap/NodeDetailPanel.jsx",
        "components/mindmap/NewMindMapDialog.jsx",
        "components/mindmap/layoutMindMapNodes.js"
      );
      
      // Template components
      files.push(
        "components/templates/BusinessTemplateBuilder.jsx",
        "components/templates/TemplateEntityEditor.jsx",
        "components/templates/TemplatePageEditor.jsx",
        "components/templates/TemplateFeatureEditor.jsx"
      );
      
      // Generated app components
      files.push(
        "components/generated-app/AppNavigationManager.jsx",
        "components/generated-app/DependencyResolver.jsx",
        "components/generated-app/SystemFunctionManager.jsx",
        "components/generated-app/AIDependencyAnalyzer.jsx"
      );
      
      // Workflow components
      files.push(
        "components/workflow/WorkflowStepPalette.jsx",
        "components/workflow/WorkflowCanvas.jsx",
        "components/workflow/WorkflowStepEditor.jsx",
        "components/workflow/WorkflowSettings.jsx",
        "components/workflow/TriggerEditor.jsx",
        "components/workflow/AIWorkflowGenerator.jsx"
      );
      
      // Form components
      files.push(
        "components/forms/FormFieldPalette.jsx",
        "components/forms/FormFieldEditor.jsx",
        "components/forms/DynamicFormRenderer.jsx",
        "components/forms/FormSettings.jsx",
        "components/forms/AIFormGenerator.jsx",
        "components/forms/AddressFinderField.jsx",
        "components/forms/EmailValidationField.jsx",
        "components/forms/PhoneValidationField.jsx",
        "components/forms/PostcodeLookupField.jsx"
      );
      
      // Checklist components
      files.push("components/checklists/AIChecklistGenerator.jsx");
      
      // ERD components
      files.push(
        "components/erd/ERDCanvas.jsx",
        "components/erd/ERDEntityBox.jsx",
        "components/erd/ERDRelationshipLine.jsx",
        "components/erd/ERDEntityEditor.jsx",
        "components/erd/ERDRelationshipEditor.jsx",
        "components/erd/AddFromLibraryDialog.jsx"
      );
      
      // Project components
      files.push(
        "components/project/TaskList.jsx",
        "components/project/ContactList.jsx",
        "components/project/DocumentList.jsx",
        "components/project/SiteVisitList.jsx",
        "components/project/ProjectTeam.jsx",
        "components/project/ClientAccessManager.jsx",
        "components/project/GanttChart.jsx",
        "components/project/DesignPhaseList.jsx",
        "components/project/ManufactureStepList.jsx"
      );
      
      // AI Assistant components
      files.push(
        "components/ai-assistant/GlobalAIAssistant.jsx",
        "components/ai-assistant/AIInputAssistant.jsx",
        "components/ai-assistant/AIInputTrigger.jsx",
        "components/ai-assistant/ChatHighlightCapture.jsx",
        "components/ai-assistant/QuickCapture.jsx"
      );
      
      // Roadmap components
      files.push(
        "components/roadmap/RoadmapItemCard.jsx",
        "components/roadmap/JournalDialog.jsx",
        "components/roadmap/DevelopmentPromptDialog.jsx",
        "components/roadmap/RoadmapSettingsDialog.jsx"
      );
      
      // Playground components
      files.push(
        "components/playground/PlaygroundEditor.jsx",
        "components/playground/VersionHistory.jsx",
        "components/playground/PlaygroundJournalPanel.jsx",
        "components/playground/PromoteToLibraryDialog.jsx",
        "components/playground/LivePageRenderer.jsx"
      );
      
      // CMS components
      files.push(
        "components/cms/CMSPageEditor.jsx",
        "components/cms/CMSProductEditor.jsx",
        "components/cms/CMSBlogEditor.jsx",
        "components/cms/CMSFormEditor.jsx",
        "components/cms/CMSApiKeyManager.jsx",
        "components/cms/CMSSubmissions.jsx",
        "components/cms/CMSNavigationEditor.jsx",
        "components/cms/CMSAssetManager.jsx",
        "components/cms/CMSTemplateManager.jsx",
        "components/cms/CMSTenantSelector.jsx"
      );
      
      // Monitoring components
      files.push(
        "components/monitoring/AuditLogCard.jsx",
        "components/monitoring/PerformanceAuditCard.jsx"
      );
      
      // Test data components
      files.push(
        "components/test-data/AIQualityReport.jsx",
        "components/test-data/EntitySchemaValidator.jsx",
        "components/test-data/TestDataSettingsDialog.jsx"
      );
      
      // Testing components
      files.push(
        "components/testing/TestDataProvider.jsx",
        "components/testing/TestDataDisplay.jsx",
        "components/testing/StandaloneTestData.jsx",
        "components/testing/LivePreviewNavigation.jsx",
        "components/testing/TestingDataService.jsx"
      );
      
      // Layout components
      files.push(
        "components/layout/PageLayout.jsx"
      );
      
      // Sturij components
      files.push(
        "components/sturij/PageHeader.jsx",
        "components/sturij/ContentSection.jsx",
        "components/sturij/FeatureCard.jsx",
        "components/sturij/StatCard.jsx",
        "components/sturij/StatusBadge.jsx",
        "components/sturij/DataRow.jsx",
        "components/sturij/index.jsx"
      );
      
      // Design system components
      files.push(
        "components/design-system/ThemeTokenEditor.jsx",
        "components/design-system/ThemeCreatorDialog.jsx"
      );
      
      // Knowledge components
      files.push(
        "components/knowledge/ShadcnReference.jsx",
        "components/knowledge/TailwindReference.jsx",
        "components/knowledge/ReactReference.jsx",
        "components/knowledge/LucideReference.jsx",
        "components/knowledge/Base44Reference.jsx",
        "components/knowledge/NewsFeed.jsx"
      );
      
      // Page builder components
      files.push(
        "components/page-builder/AppShellPreview.jsx"
      );
      
      // Common components
      files.push(
        "components/common/PageSettingsDialog.jsx"
      );
      
      return files;
    };

  const handleScanFile = async (filePath) => {
    if (!filePath) return;
    
    setAnalyzing(true);
    setSelectedFile(filePath);
    setFileReport(null);
    
    try {
      // Read the actual file content using backend function
      let fileContent;
      try {
        const response = await base44.functions.invoke('readFileContent', { filePath });
        fileContent = response.data?.content;
      } catch (err) {
        console.error('Backend read error:', err);
        toast.error(`Failed to read file: ${err.message}`);
        setAnalyzing(false);
        return;
      }
      
      if (!fileContent) {
        toast.error(`File is empty or could not be read: ${filePath}`);
        setAnalyzing(false);
        return;
      }
      
      console.log(`Successfully read ${filePath}, ${fileContent.length} characters`);

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a CSS/design token auditor. Analyze this SINGLE FILE comprehensively for ALL design token violations.

FILE: ${filePath}
CONTENT:
${fileContent}

DESIGN TOKENS REFERENCE:
- Colors: var(--color-primary), var(--color-secondary), var(--color-accent), var(--color-midnight), var(--color-charcoal)
- Semantic: bg-primary, text-primary, border-border, bg-muted, text-muted-foreground
- Spacing: var(--spacing-1) through var(--spacing-32), p-4, gap-4, etc.
- Fonts: degular-display, mrs-eaves-xl-serif-narrow (NO QUOTES)

VIOLATIONS TO DETECT (find ALL instances):
1. CRITICAL - Quoted fonts: "degular-display", "mrs-eaves-xl-serif-narrow"
2. CRITICAL - Inline styles with hardcoded values: style={{backgroundColor: '#fff'}}
3. HIGH - Hardcoded hex: #4A5D4E, #D4A574, #ffffff, rgb(74, 93, 78)
4. HIGH - Hardcoded Tailwind colors: bg-[#4A5D4E], text-gray-500, text-gray-400
5. MEDIUM - Hardcoded spacing: padding: 16px, margin: 8px
6. MEDIUM - Hardcoded font sizes: fontSize: 14px, text-[14px]
7. LOW - Generic Tailwind grays: text-gray-400, bg-gray-100 (use semantic colors)

CRITICAL: Find EVERY violation in the file, not just examples. Be exhaustive.

For each violation provide:
- Exact code snippet
- Severity level
- Specific issue description
- Recommended fix with exact replacement code`,
        response_json_schema: {
          type: "object",
          properties: {
            filePath: { type: "string" },
            totalViolations: { type: "number" },
            criticalCount: { type: "number" },
            highCount: { type: "number" },
            mediumCount: { type: "number" },
            lowCount: { type: "number" },
            violations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  severity: { type: "string" },
                  category: { type: "string" },
                  issue: { type: "string" },
                  currentCode: { type: "string" },
                  recommendedFix: { type: "string" },
                  lineNumber: { type: "string" }
                }
              }
            }
          }
        }
      });

      setFileReport(result);
      toast.success(`Found ${result.totalViolations} violations in ${filePath}`);
    } catch (error) {
      toast.error("Analysis failed: " + error.message);
    }
    setAnalyzing(false);
  };

  const markFileVerified = (filePath) => {
    const updated = { ...verifiedFiles, [filePath]: true };
    setVerifiedFiles(updated);
    localStorage.setItem('cssAudit_verifiedFiles', JSON.stringify(updated));
    toast.success("File marked as verified");
  };

  const clearVerification = (filePath) => {
    const updated = { ...verifiedFiles };
    delete updated[filePath];
    setVerifiedFiles(updated);
    localStorage.setItem('cssAudit_verifiedFiles', JSON.stringify(updated));
  };

  const generateAIPrompt = () => {
    if (!fileReport || fileReport.violations.length === 0) return;

    let prompt = `Please fix the following CSS/design token violations in ${fileReport.filePath}:\n\n`;
    
    fileReport.violations.forEach((v, idx) => {
      prompt += `${idx + 1}. [${v.severity.toUpperCase()}] ${v.issue}\n`;
      prompt += `   Current: ${v.currentCode}\n`;
      prompt += `   Fix: ${v.recommendedFix}\n\n`;
    });

    prompt += `\nPlease apply all ${fileReport.violations.length} fixes to the file.`;

    navigator.clipboard.writeText(prompt);
    toast.success("AI prompt copied to clipboard!");
  };

  const filteredFiles = fileList.filter(f => 
    f.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const verifiedCount = Object.keys(verifiedFiles).length;
  const needsWorkCount = filteredFiles.length - verifiedCount;

  return (
    <div className="p-6 max-w-7xl mx-auto bg-[var(--color-background)] min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-light font-display text-[var(--color-midnight)]">
            File-by-File CSS Audit
          </h1>
          <p className="text-[var(--color-charcoal)] mt-1">
            Scan files individually for comprehensive violation detection
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="gap-2">
            <CheckCircle2 className="h-3 w-3 text-[var(--color-success)]" />
            {verifiedCount} Verified
          </Badge>
          <Badge variant="outline" className="gap-2">
            <AlertTriangle className="h-3 w-3 text-[var(--color-warning)]" />
            {needsWorkCount} Need Work
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-[300px_1fr] gap-6">
        {/* File List Sidebar */}
        <Card className="h-[calc(100vh-200px)] flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Files ({fileList.length})</CardTitle>
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mt-2 px-3 py-1.5 text-sm border rounded-lg w-full"
            />
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-1 p-3">
            {filteredFiles.map(file => (
              <button
                key={file}
                onClick={() => handleScanFile(file)}
                disabled={analyzing}
                className={`w-full text-left px-2 py-1.5 rounded text-xs font-mono hover:bg-[var(--color-background-subtle)] transition-colors flex items-center gap-2 ${
                  selectedFile === file ? 'bg-[var(--color-primary)]/10 border border-[var(--color-primary)]' : ''
                } ${verifiedFiles[file] ? 'opacity-50' : ''}`}
              >
                {verifiedFiles[file] ? (
                  <CheckCircle2 className="h-3 w-3 text-[var(--color-success)] flex-shrink-0" />
                ) : (
                  <FileCode className="h-3 w-3 text-[var(--color-charcoal)] flex-shrink-0" />
                )}
                <span className="truncate">{file}</span>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Results Panel */}
        <div className="space-y-4">{analyzing && (
          <Card>
            <CardContent className="py-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-[var(--color-primary)]" />
              <p className="text-sm text-[var(--color-charcoal)]">Analyzing {selectedFile}...</p>
            </CardContent>
          </Card>
        )}

          {fileReport && (
            <>
              {/* File Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-mono">{fileReport.filePath}</CardTitle>
                      <div className="flex gap-2 mt-2">
                        <Badge variant={fileReport.totalViolations === 0 ? "default" : "destructive"}>
                          {fileReport.totalViolations} violations
                        </Badge>
                        {fileReport.criticalCount > 0 && (
                          <Badge className="bg-[var(--color-destructive)] text-white">
                            {fileReport.criticalCount} critical
                          </Badge>
                        )}
                        {fileReport.highCount > 0 && (
                          <Badge className="bg-[var(--color-warning)] text-white">
                            {fileReport.highCount} high
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {fileReport.totalViolations > 0 && (
                        <Button onClick={generateAIPrompt} variant="default" className="gap-2">
                          <Sparkles className="h-4 w-4" />
                          Copy AI Prompt
                        </Button>
                      )}
                      {fileReport.totalViolations === 0 && !verifiedFiles[selectedFile] && (
                        <Button onClick={() => markFileVerified(selectedFile)} className="gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          Mark as Verified
                        </Button>
                      )}
                      {verifiedFiles[selectedFile] && (
                        <Button variant="outline" onClick={() => clearVerification(selectedFile)} className="gap-2">
                          Clear Verification
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Violations List */}
              {fileReport.violations.length > 0 ? (
                <div className="space-y-3">
                  {fileReport.violations.map((v, idx) => (
                    <Card key={idx} className="border-l-4" style={{
                      borderLeftColor: v.severity === "critical" ? "var(--color-destructive)" : 
                                      v.severity === "high" ? "var(--color-warning)" : 
                                      v.severity === "medium" ? "var(--color-info)" : 
                                      "var(--color-charcoal)"
                    }}>
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-2 mb-2">
                          <Badge className={
                            v.severity === "critical" ? "bg-[var(--color-destructive)] text-white" :
                            v.severity === "high" ? "bg-[var(--color-warning)] text-white" :
                            v.severity === "medium" ? "bg-[var(--color-info)] text-white" :
                            "bg-[var(--color-charcoal)] text-white"
                          }>
                            {v.severity}
                          </Badge>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{v.issue}</p>
                            {v.lineNumber && (
                              <p className="text-xs text-[var(--color-charcoal)] mt-1">
                                Line {v.lineNumber}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2 mt-3">
                          <div>
                            <span className="text-xs font-mono text-[var(--color-destructive)]">Current:</span>
                            <code className="block text-xs bg-[var(--color-muted)] p-2 rounded mt-1 font-mono">
                              {v.currentCode}
                            </code>
                          </div>
                          <div>
                            <span className="text-xs font-mono text-[var(--color-success)]">Fix:</span>
                            <code className="block text-xs bg-[var(--color-success)]/10 p-2 rounded mt-1 font-mono">
                              {v.recommendedFix}
                            </code>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-dashed border-2 border-[var(--color-success)]">
                  <CardContent className="py-12 text-center">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-[var(--color-success)]" />
                    <h3 className="text-lg font-medium text-[var(--color-success)] mb-2">
                      No Violations Found!
                    </h3>
                    <p className="text-[var(--color-charcoal)]">
                      This file follows all design token guidelines
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {!fileReport && !analyzing && (
            <Card className="border-dashed h-[400px] flex items-center justify-center">
              <CardContent className="text-center">
                <FileCode className="h-12 w-12 mx-auto mb-3 text-[var(--color-charcoal)]/30" />
                <h3 className="text-base font-medium mb-2">Select a file to audit</h3>
                <p className="text-sm text-[var(--color-charcoal)]">
                  Click any file from the list to scan for violations
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}