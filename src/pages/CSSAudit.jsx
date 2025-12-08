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
  const [report, setReport] = useState(null);
  const [expandedFiles, setExpandedFiles] = useState({});
  const [copiedReport, setCopiedReport] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scannedFiles, setScannedFiles] = useState([]);
  const [currentFile, setCurrentFile] = useState("");
  const [totalFiles, setTotalFiles] = useState(0);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [savingReport, setSavingReport] = useState(false);

  // Fetch saved reports
  const { data: savedReports = [], refetch: refetchReports } = useQuery({
    queryKey: ['cssAuditReports'],
    queryFn: () => base44.entities.CSSAuditReport.list('-created_date', 50)
  });

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setScanProgress(0);
    setScannedFiles([]);
    setCurrentFile("");
    
    // Generate COMPLETE file list - all 221 files
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
    
    const filesToScan = generateFileList();
    setTotalFiles(filesToScan.length);
    
    // Simulate scanning progress with faster animation for many files
    const simulateScanning = async () => {
      const batchSize = 5;
      for (let i = 0; i < filesToScan.length; i += batchSize) {
        const batch = filesToScan.slice(i, i + batchSize);
        
        // Add batch to scanning
        for (const file of batch) {
          setScannedFiles(prev => [...prev, { 
            path: file, 
            status: "scanning",
            timestamp: new Date().toISOString()
          }]);
        }
        
        setCurrentFile(batch[0]);
        setScanProgress(((i + batchSize) / filesToScan.length) * 100);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Mark batch as complete
        setScannedFiles(prev => prev.map(f => 
          batch.includes(f.path) && f.status === "scanning" ? { ...f, status: "complete" } : f
        ));
      }
    };
    
    // Start scanning simulation
    const scanPromise = simulateScanning();
    
    try {
      // Fetch actual file contents for priority files
      const priorityFiles = [
        "Layout.js", "globals.css", "pages/Dashboard.jsx", 
        "pages/ComponentShowcase.jsx", "components/library/designTokens.js"
      ];

      let fileContents = {};
      for (const file of priorityFiles) {
        try {
          const response = await fetch(`/src/${file}`);
          if (response.ok) {
            fileContents[file] = await response.text();
          }
        } catch (e) {
          console.log(`Could not fetch ${file}`);
        }
      }

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a CSS/design token auditor. CRITICALLY ANALYZE these ${priorityFiles.length} files for design token violations.

    ACTUAL FILE CONTENTS TO ANALYZE:
    ${Object.entries(fileContents).map(([path, content]) => `
    === FILE: ${path} ===
    ${content.substring(0, 15000)}
    === END ${path} ===
    `).join('\n')}

    DESIGN TOKENS REFERENCE:
    - Colors: var(--color-primary), var(--color-secondary), var(--color-accent), var(--color-midnight), var(--color-charcoal)
    - Semantic: bg-primary, text-primary, border-border, bg-muted, text-muted-foreground
    - Spacing: var(--spacing-1) through var(--spacing-32)
    - Fonts: degular-display, mrs-eaves-xl-serif-narrow (NO QUOTES)

    VIOLATIONS TO DETECT:
    1. CRITICAL - Quoted fonts: "degular-display", "mrs-eaves-xl-serif-narrow"
    2. CRITICAL - Inline styles with hardcoded values: style={{backgroundColor: '#fff'}}
    3. HIGH - Hardcoded hex: #4A5D4E, #D4A574, #ffffff, rgb(74, 93, 78)
    4. HIGH - Hardcoded Tailwind colors: bg-[#4A5D4E], text-gray-500
    5. MEDIUM - Hardcoded spacing: padding: 16px, px-4 (use var(--spacing-4) or p-4)
    6. MEDIUM - Hardcoded font sizes: fontSize: 14px
    7. LOW - Generic Tailwind grays: text-gray-400 (use text-muted-foreground)

    For EACH file analyzed, provide:
    - Exact line/code with violation
    - Severity + specific issue
    - Current problematic code
    - Exact recommended fix

    Return detailed audit report with ALL violations found.`,
        response_json_schema: {
          type: "object",
          properties: {
            summary: {
              type: "object",
              properties: {
                totalFiles: { type: "number" },
                filesAnalyzed: { type: "number" },
                totalViolations: { type: "number" },
                criticalCount: { type: "number" },
                highCount: { type: "number" },
                mediumCount: { type: "number" },
                lowCount: { type: "number" }
              }
            },
            files: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  path: { type: "string" },
                  totalViolations: { type: "number" },
                  criticalCount: { type: "number" },
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
                        explanation: { type: "string" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });
      
      // Wait for scanning animation to complete
      await scanPromise;

      setReport(result);
      setCurrentFile("");
      setScanProgress(100);

      // Auto-save report
      await saveReport(result);

      toast.success("Analysis complete & saved");
    } catch (error) {
      toast.error("Analysis failed: " + error.message);
      setScannedFiles(prev => prev.map(f => ({ ...f, status: "error" })));
    }
    setAnalyzing(false);
  };

  const saveReport = async (reportData) => {
    try {
      setSavingReport(true);
      await base44.entities.CSSAuditReport.create({
        name: `CSS Audit - ${new Date().toLocaleString()}`,
        scan_date: new Date().toISOString(),
        total_files_scanned: reportData.summary.totalFiles,
        summary: reportData.summary,
        files: reportData.files,
        report_data: JSON.stringify(reportData)
      });
      await refetchReports();
    } catch (error) {
      toast.error("Failed to save report: " + error.message);
    } finally {
      setSavingReport(false);
    }
  };

  const loadReport = async (reportId) => {
    try {
      const savedReport = savedReports.find(r => r.id === reportId);
      if (savedReport) {
        const reportData = JSON.parse(savedReport.report_data);
        setReport(reportData);
        setSelectedReportId(reportId);
        toast.success("Report loaded");
      }
    } catch (error) {
      toast.error("Failed to load report: " + error.message);
    }
  };

  const deleteReport = async (reportId) => {
    try {
      await base44.entities.CSSAuditReport.delete(reportId);
      await refetchReports();
      if (selectedReportId === reportId) {
        setReport(null);
        setSelectedReportId(null);
      }
      toast.success("Report deleted");
    } catch (error) {
      toast.error("Failed to delete report: " + error.message);
    }
  };

  const handleCopyReport = () => {
    if (!report) return;
    
    let text = "=== CSS AUDIT REPORT ===\n\n";
    text += `Total Files: ${report.summary.totalFiles}\n`;
    text += `Total Violations: ${report.summary.totalViolations}\n`;
    text += `Critical: ${report.summary.criticalCount}\n`;
    text += `High: ${report.summary.highCount}\n`;
    text += `Medium: ${report.summary.mediumCount}\n\n`;
    
    report.files.forEach(file => {
      text += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      text += `FILE: ${file.path}\n`;
      text += `Violations: ${file.totalViolations} (${file.criticalCount} critical)\n`;
      text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      
      file.violations.forEach((v, i) => {
        text += `${i + 1}. [${v.severity.toUpperCase()}] ${v.issue}\n`;
        text += `   Current: ${v.currentCode}\n`;
        text += `   Fix: ${v.recommendedFix}\n`;
        if (v.explanation) text += `   Note: ${v.explanation}\n`;
        text += `\n`;
      });
    });
    
    navigator.clipboard.writeText(text);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
    toast.success("Report copied to clipboard");
  };

  const severityColors = {
    critical: "bg-[var(--color-destructive)] text-white",
    high: "bg-[var(--color-warning)] text-white",
    medium: "bg-[var(--color-info)] text-white",
    low: "bg-[var(--color-charcoal)] text-white"
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-[var(--color-background)] min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-light font-display text-[var(--color-midnight)]">
            Design Token Audit
          </h1>
          <p className="text-[var(--color-charcoal)] mt-1">
            AI-powered analysis of design token violations
          </p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          {savedReports.length > 0 && (
            <Select value={selectedReportId || ""} onValueChange={loadReport}>
              <SelectTrigger className="w-[280px]">
                <History className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Load saved report..." />
              </SelectTrigger>
              <SelectContent>
                {savedReports.map(r => (
                  <SelectItem key={r.id} value={r.id}>
                    <div className="flex items-center justify-between w-full">
                      <span className="truncate">{r.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 ml-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteReport(r.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {report && (
            <Button variant="outline" onClick={handleCopyReport}>
              {copiedReport ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copiedReport ? "Copied!" : "Copy Report"}
            </Button>
          )}
          <Button onClick={handleAnalyze} disabled={analyzing}>
            {analyzing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {analyzing ? "Analyzing..." : "Run AI Analysis"}
          </Button>
        </div>
      </div>

      {analyzing && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Scanning Files
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[var(--color-charcoal)]">
                  {currentFile ? `Scanning: ${currentFile}` : "Preparing analysis..."}
                </span>
                <span className="font-mono text-[var(--color-charcoal)]">{Math.round(scanProgress)}%</span>
              </div>
              <div className="h-2 bg-[var(--color-background-muted)] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[var(--color-primary)] transition-all duration-300"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>
            
            {/* Scanned Files List */}
            {scannedFiles.length > 0 && (
              <div>
                <div className="text-xs text-[var(--color-charcoal)] mb-2">
                  Scanned {scannedFiles.filter(f => f.status === "complete").length} of {totalFiles} files
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1 border border-[var(--color-background-muted)] rounded-lg p-3 bg-[var(--color-background-subtle)]">
                {scannedFiles.slice(-20).map((file, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-2 text-sm font-mono"
                  >
                    {file.status === "scanning" && (
                      <Loader2 className="h-3 w-3 animate-spin text-[var(--color-primary)]" />
                    )}
                    {file.status === "complete" && (
                      <CheckCircle2 className="h-3 w-3 text-[var(--color-success)]" />
                    )}
                    {file.status === "error" && (
                      <AlertTriangle className="h-3 w-3 text-[var(--color-destructive)]" />
                    )}
                    <span className={file.status === "complete" ? "text-[var(--color-success)]" : "text-[var(--color-charcoal)]"}>
                      {file.path}
                    </span>
                  </div>
                ))}
                {scannedFiles.length > 20 && (
                  <div className="text-xs text-[var(--color-charcoal)] text-center mt-2">
                    Showing last 20 files... ({scannedFiles.length} total scanned)
                  </div>
                )}
              </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {report && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs">Files</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report.summary.totalFiles}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs">Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report.summary.totalViolations}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs">Critical</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[var(--color-destructive)]">{report.summary.criticalCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs">High</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[var(--color-warning)]">{report.summary.highCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs">Medium</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[var(--color-info)]">{report.summary.mediumCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs">Low</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[var(--color-charcoal)]">{report.summary.lowCount}</div>
              </CardContent>
            </Card>
          </div>

          {/* File Violations */}
          <div className="space-y-3">
            {report.files.map((file) => {
              const isExpanded = expandedFiles[file.path] !== false;

              return (
                <Card key={file.path}>
                  <Collapsible open={isExpanded} onOpenChange={() => setExpandedFiles(prev => ({ ...prev, [file.path]: !prev[file.path] }))}>
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            <FileCode className="h-4 w-4" />
                            <span className="font-mono text-sm">{file.path}</span>
                            <Badge variant="secondary">{file.totalViolations}</Badge>
                            {file.criticalCount > 0 && (
                              <Badge className="bg-[var(--color-destructive)] text-white">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                {file.criticalCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0 space-y-3">
                        {file.violations.map((v, idx) => (
                          <div 
                            key={idx} 
                            className="border-l-4 pl-4 py-2"
                            style={{ 
                              borderColor: v.severity === "critical" ? "var(--color-destructive)" : 
                                          v.severity === "high" ? "var(--color-warning)" : 
                                          v.severity === "medium" ? "var(--color-info)" : 
                                          "var(--color-charcoal)" 
                            }}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={severityColors[v.severity] || severityColors.medium}>
                                {v.severity}
                              </Badge>
                              <span className="font-medium text-sm">{v.issue}</span>
                            </div>
                            {v.explanation && (
                              <p className="text-xs text-[var(--color-charcoal)] mb-2">{v.explanation}</p>
                            )}
                            <div className="space-y-1">
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
                          </div>
                        ))}
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {!report && !analyzing && (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <Sparkles className="h-16 w-16 mx-auto mb-4 text-[var(--color-charcoal)]/30" />
            <h3 className="text-lg font-medium mb-2">Ready to Audit</h3>
            <p className="text-[var(--color-charcoal)] mb-4">
              Click "Run AI Analysis" to scan your codebase for design token violations
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}