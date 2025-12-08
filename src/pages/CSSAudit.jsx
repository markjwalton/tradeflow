import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileSearch,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Sparkles,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Code,
  Calendar
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function CSSAudit() {
  const queryClient = useQueryClient();
  const [scanning, setScanning] = useState(false);
  const [findings, setFindings] = useState([]);
  const [progress, setProgress] = useState({ current: 0, total: 0, file: "" });
  const [selectedFindings, setSelectedFindings] = useState([]);
  const [expandedFiles, setExpandedFiles] = useState(new Set());
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [creatingRoadmap, setCreatingRoadmap] = useState(false);
  const [defaultPriority, setDefaultPriority] = useState("medium");

  const hardcodedPatterns = [
    // Font weights - should use semantic tokens
    { pattern: /font-(light|normal|medium|semibold|bold|black|thin|extralight|extrabold)/g, type: "font-weight", replacement: "Use semantic text-* classes instead" },
    
    // Font sizes - should use semantic tokens
    { pattern: /text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)/g, type: "font-size", replacement: "Use text-h1 through text-h6, text-body-large, text-body-base, text-body-small, text-body-muted, text-caption" },
    
    // Hardcoded font families in className
    { pattern: /className="[^"]*font-heading[^"]*"/g, type: "font-family-hardcoded", replacement: "Remove hardcoded font-heading, use semantic text-h* tokens" },
    { pattern: /className="[^"]*font-body[^"]*"/g, type: "font-family-hardcoded", replacement: "Remove hardcoded font-body, use semantic text-* tokens" },
    
    // Letter spacing - should use CSS variables
    { pattern: /tracking-(tighter|tight|normal|airy|wide|wider|widest)/g, type: "letter-spacing", replacement: "Use CSS variables --tracking-*" },
    
    // Line height - should use CSS variables
    { pattern: /leading-(none|tight|snug|normal|relaxed|loose|[0-9]+)/g, type: "line-height", replacement: "Use CSS variables --leading-*" },
    
    // Color classes - check for hardcoded colors
    { pattern: /text-(gray|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900)/g, type: "text-color", replacement: "Use design system color tokens: text-[var(--color-*)]" },
    { pattern: /bg-(gray|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900)/g, type: "bg-color", replacement: "Use design system color tokens: bg-[var(--color-*)]" },
    
    // Spacing - should use semantic spacing tokens
    { pattern: /\b(p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|space-[xy])-(0|px|0\.5|1|1\.5|2|2\.5|3|3\.5|4|5|6|7|8|9|10|11|12|14|16|20|24|28|32|36|40|44|48|52|56|60|64|72|80|96)\b/g, type: "spacing", replacement: "Consider using CSS variables --spacing-* for consistency" },
  ];

  const scanProject = async () => {
    setScanning(true);
    setFindings([]);
    setSelectedFindings([]);
    setProgress({ current: 0, total: 0, file: "" });

    try {
      // Get comprehensive list of all pages and components
      const allPages = [
        "Dashboard", "NavigationManager", "DashboardManager", "ComponentShowcase", "DesignTokens", 
        "TypographyShowcase", "ButtonsShowcase", "CardsShowcase", "FormsShowcase", "LayoutShowcase",
        "NavigationShowcase", "DataDisplayShowcase", "FeedbackShowcase", "DesignSystemManager", 
        "KnowledgeManager", "EntityLibrary", "PageLibrary", "FeatureLibrary", "RoadmapManager",
        "RoadmapJournal", "SprintManager", "RuleBook", "TestDataManager", "PlaygroundSummary",
        "PlaygroundEntity", "PlaygroundPage", "PlaygroundFeature", "ConceptWorkbench", "LivePreview",
        "TestingHub", "TenantManager", "CMSManager", "APIManager", "SecurityMonitor", "PerformanceMonitor",
        "TailwindKnowledgeManager", "LookupTestForms", "TemplateLibrary", "BusinessTemplates",
        "FormTemplates", "FormBuilder", "ChecklistTemplates", "ChecklistBuilder", "WorkflowLibrary",
        "WorkflowDesigner", "PackageLibrary", "GeneratedApps", "StandaloneInstanceManager", "SturijPackage",
        "StandaloneAPIStrategy", "ERDEditor", "MindMapEditor", "PromptSettings", "CommunityLibrary",
        "CommunityPublish", "DebugProjectWorkspace", "DebugProjectEditor", "CSSAudit", "TenantAccess",
        "Setup", "Home", "Projects", "ProjectDetails", "ProjectForm", "Tasks", "Customers", "Team",
        "Estimates", "Calendar", "TokenPreview", "LayoutBuilder", "PageBuilder", "ProjectsOverview",
        "ProjectDetail", "AppointmentHub", "AppointmentManager", "AppointmentConfirm", "InterestOptionsManager",
        "WebsiteEnquiryForm", "SystemSpecification"
      ];

      const allComponents = [
        "dashboard/DashboardWidgetCard", "dashboard/WidgetConfigEditor", "dashboard/useDashboardSettings",
        "dashboard/TechNewsWidget", "dashboard/DashboardSettings", "dashboard/DashboardGrid",
        "dashboard/AIWidgetGenerator", "dashboard/WidgetLibrarySidebar", "dashboard/WidgetStaging",
        "dashboard/WidgetRenderer", "dashboard/TestDataCoverageWidget",
        "navigation/GenericNavEditor", "navigation/TenantSelector", "navigation/NavigationBreadcrumb",
        "navigation/NavigationItemRow", "navigation/NavigationItemForm", "navigation/NavigationRenderer",
        "navigation/UnallocationConfirmDialog", "navigation/StandaloneNavigation", "navigation/NavigationDataProvider",
        "design-system/ThemeCreatorDialog", "design-system/ThemeTokenEditor",
        "knowledge/Base44Reference", "knowledge/NewsFeed", "knowledge/ShadcnReference",
        "knowledge/TailwindReference", "knowledge/ReactReference", "knowledge/LucideReference",
        "library/Typography", "library/Cards", "library/Buttons", "library/Forms", "library/Layouts",
        "library/Navigation", "library/DataDisplay", "library/Feedback", "library/designTokens",
        "library/PagePreview", "library/PageBuilder", "library/FeatureBuilder", "library/EntityBuilder",
        "sturij/PageHeader", "sturij/ContentSection", "sturij/StatCard", "sturij/StatusBadge",
        "sturij/FeatureCard", "sturij/DataRow",
        "common/PageSettingsDialog",
        "ai-assistant/GlobalAIAssistant", "ai-assistant/QuickCapture", "ai-assistant/ChatHighlightCapture",
        "ai-assistant/AIInputAssistant",
        "roadmap/RoadmapItemCard", "roadmap/RoadmapSettingsDialog", "roadmap/JournalDialog",
        "roadmap/DevelopmentPromptDialog",
        "playground/PlaygroundJournalPanel", "playground/PlaygroundEditor", "playground/VersionHistory",
        "playground/PromoteToLibraryDialog", "playground/LivePageRenderer",
        "forms/FormSettings", "forms/AIFormGenerator", "forms/FormFieldPalette", "forms/FormFieldEditor",
        "forms/DynamicFormRenderer", "forms/PostcodeLookupField", "forms/EmailValidationField",
        "forms/PhoneValidationField", "forms/AddressFinderField",
        "checklists/AIChecklistGenerator",
        "workflow/AIWorkflowGenerator", "workflow/WorkflowStepPalette", "workflow/WorkflowCanvas",
        "workflow/WorkflowStepEditor", "workflow/WorkflowSettings", "workflow/TriggerEditor",
        "cms/CMSPageEditor", "cms/CMSProductEditor", "cms/CMSBlogEditor", "cms/CMSFormEditor",
        "cms/CMSApiKeyManager", "cms/CMSSubmissions", "cms/CMSNavigationEditor", "cms/CMSAssetManager",
        "cms/CMSTemplateManager", "cms/CMSTenantSelector",
        "tenants/TenantForm", "tenants/TenantRoleManager", "tenants/TenantUserManager",
        "tenants/TenantAccessRequests",
        "templates/BusinessTemplateBuilder", "templates/TemplateEntityEditor", "templates/TemplatePageEditor",
        "templates/TemplateFeatureEditor",
        "generated-app/AIDependencyAnalyzer", "generated-app/DependencyResolver", "generated-app/AppNavigationManager",
        "generated-app/SystemFunctionManager",
        "project/ContactList", "project/DocumentList", "project/SiteVisitList", "project/ProjectTeam",
        "project/ClientAccessManager", "project/GanttChart", "project/TaskList", "project/DesignPhaseList",
        "project/ManufactureStepList",
        "monitoring/PerformanceAuditCard", "monitoring/AuditLogCard",
        "testing/LivePreviewNavigation", "testing/StandaloneTestData", "testing/TestDataProvider",
        "testing/TestDataDisplay", "testing/TestingDataService",
        "test-data/AIQualityReport", "test-data/EntitySchemaValidator", "test-data/TestDataSettingsDialog",
        "mindmap/MindMapCanvas", "mindmap/MindMapToolbar", "mindmap/MindMapNode", "mindmap/MindMapConnection",
        "mindmap/NewMindMapDialog", "mindmap/GeneratedSpecDialog", "mindmap/AddNodeDialog",
        "mindmap/VersionHistoryPanel", "mindmap/ForkVersionDialog", "mindmap/PublishVersionDialog",
        "mindmap/EntityDetailDialog", "mindmap/EntityRelationshipDiagram", "mindmap/WorkflowDialog",
        "mindmap/TenantForkDialog", "mindmap/NodeDetailPanel",
        "erd/ERDCanvas", "erd/ERDEntityEditor", "erd/ERDRelationshipEditor", "erd/AddFromLibraryDialog",
        "erd/ERDEntityBox", "erd/ERDRelationshipLine",
        "page-builder/AppShellPreview",
        "layout/PageLayout"
      ];

      const files = [
        ...allPages.map(p => `pages/${p}`),
        ...allComponents.map(c => `components/${c}`)
      ];
      setProgress({ current: 0, total: files.length, file: "" });

      const allFindings = [];
      
      // Process files in batches of 5
      for (let i = 0; i < files.length; i += 5) {
        const batch = files.slice(i, i + 5);
        
        for (const filePath of batch) {
          setProgress({ current: i + 1, total: files.length, file: filePath });

          try {
            // Read file content via AI function
            const fileAnalysis = await base44.integrations.Core.InvokeLLM({
              prompt: `Analyze this file path: ${filePath}

Scan for hardcoded typography/font classes that should use semantic tokens instead:
- Font weights: font-light, font-medium, font-semibold, font-bold
- Font sizes: text-xs, text-sm, text-lg, text-xl, text-2xl, text-3xl, etc.
- Font families: hardcoded font-heading, font-body in className strings
- Letter spacing: tracking-tight, tracking-wide, etc.
- Line height: leading-tight, leading-normal, etc.

For each issue found, provide:
1. Line number (approximate)
2. Current className string
3. Element type (h1, p, div, etc.)
4. Severity (high=headings with wrong classes, medium=body text, low=utility)
5. Suggested replacement using text-h1 through text-h6, text-body-*, text-caption

Return empty array if file doesn't exist or has no issues.`,
              response_json_schema: {
                type: "object",
                properties: {
                  issues: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        line: { type: "number" },
                        current_class: { type: "string" },
                        element: { type: "string" },
                        severity: { type: "string" },
                        replacement: { type: "string" },
                        context: { type: "string" }
                      }
                    }
                  }
                }
              }
            });

            if (fileAnalysis.issues && fileAnalysis.issues.length > 0) {
              allFindings.push({
                file: filePath,
                issues: fileAnalysis.issues,
                totalIssues: fileAnalysis.issues.length,
                highSeverity: fileAnalysis.issues.filter(i => i.severity === "high").length,
                mediumSeverity: fileAnalysis.issues.filter(i => i.severity === "medium").length,
              });
            }
          } catch (error) {
            console.error(`Error scanning ${filePath}:`, error);
          }
        }
      }

      setFindings(allFindings);
      setProgress({ current: files.length, total: files.length, file: "Complete" });
      toast.success(`Scan complete: ${allFindings.length} files with issues`);
    } catch (error) {
      toast.error("Scan failed: " + error.message);
    } finally {
      setScanning(false);
    }
  };

  const toggleFile = (file) => {
    setExpandedFiles(prev => {
      const next = new Set(prev);
      if (next.has(file)) next.delete(file);
      else next.add(file);
      return next;
    });
  };

  const toggleFinding = (file) => {
    if (selectedFindings.includes(file)) {
      setSelectedFindings(prev => prev.filter(f => f !== file));
    } else {
      setSelectedFindings(prev => [...prev, file]);
    }
  };

  const selectAll = () => {
    if (selectedFindings.length === filteredFindings.length) {
      setSelectedFindings([]);
    } else {
      setSelectedFindings(filteredFindings.map(f => f.file));
    }
  };

  const createRoadmapItems = async () => {
    setCreatingRoadmap(true);
    try {
      const selected = findings.filter(f => selectedFindings.includes(f.file));
      
      for (const finding of selected) {
        const issuesList = finding.issues.map((issue, idx) => 
          `${idx + 1}. Line ${issue.line}: ${issue.element} - "${issue.current_class}"\n   → ${issue.replacement}`
        ).join("\n");

        await base44.entities.RoadmapItem.create({
          title: `Fix hardcoded CSS in ${finding.file.split('/').pop()}`,
          description: `Replace hardcoded typography classes with semantic tokens in ${finding.file}

**Issues Found (${finding.totalIssues}):**
${issuesList}

**Priority Breakdown:**
- High: ${finding.highSeverity}
- Medium: ${finding.mediumSeverity}`,
          category: "improvement",
          priority: defaultPriority,
          status: "backlog",
          source: "ai_assistant",
          tags: ["css-audit", "design-tokens", "refactoring"]
        });
      }

      queryClient.invalidateQueries({ queryKey: ["roadmapItems"] });
      toast.success(`Created ${selected.length} roadmap items`);
      setSelectedFindings([]);
    } catch (error) {
      toast.error("Failed: " + error.message);
    } finally {
      setCreatingRoadmap(false);
    }
  };

  const filteredFindings = findings.filter(f => {
    if (filterSeverity === "all") return true;
    return f.issues.some(i => i.severity === filterSeverity);
  });

  const totalIssues = findings.reduce((sum, f) => sum + f.totalIssues, 0);
  const highSeverityCount = findings.reduce((sum, f) => sum + f.highSeverity, 0);

  return (
    <div className="p-6 bg-[var(--color-background)] min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-h2 flex items-center gap-2">
              <FileSearch className="h-6 w-6 text-[var(--color-primary)]" />
              CSS Audit Tool
            </h1>
            <p className="text-body-base text-[var(--color-charcoal)]">
              Project-wide scan for hardcoded typography classes
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={scanProject}
              disabled={scanning}
              className="bg-[var(--color-primary)]"
            >
              {scanning ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileSearch className="h-4 w-4 mr-2" />
              )}
              {scanning ? "Scanning..." : "Scan Project"}
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        {scanning && progress.total > 0 && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-[var(--color-primary)]" />
                  <span className="text-body-small">{progress.file}</span>
                </div>
                <span className="text-body-small text-[var(--color-charcoal)]">
                  {progress.current} / {progress.total}
                </span>
              </div>
              <Progress value={(progress.current / progress.total) * 100} className="h-2" />
            </CardContent>
          </Card>
        )}

        {/* Summary Stats */}
        {findings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-caption text-[var(--color-charcoal)] mb-1">Files with Issues</div>
                <div className="text-h3">{findings.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-caption text-[var(--color-charcoal)] mb-1">Total Issues</div>
                <div className="text-h3">{totalIssues}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-caption text-[var(--color-charcoal)] mb-1">High Severity</div>
                <div className="text-h3 text-[var(--color-destructive)]">{highSeverityCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-caption text-[var(--color-charcoal)] mb-1">Selected</div>
                <div className="text-h3 text-[var(--color-primary)]">{selectedFindings.length}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Actions Bar */}
        {findings.length > 0 && (
          <Card className="mb-6">
            <CardContent className="py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAll}
                  >
                    {selectedFindings.length === filteredFindings.length ? "Deselect All" : "Select All"}
                  </Button>
                  <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severity</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={defaultPriority} onValueChange={setDefaultPriority}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={createRoadmapItems}
                    disabled={selectedFindings.length === 0 || creatingRoadmap}
                    className="bg-[var(--color-primary)]"
                  >
                    {creatingRoadmap ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Calendar className="h-4 w-4 mr-2" />
                    )}
                    Add {selectedFindings.length} to Roadmap
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Findings List */}
        {findings.length === 0 && !scanning ? (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <FileSearch className="h-16 w-16 mx-auto mb-4 text-[var(--color-charcoal)] opacity-50" />
              <h3 className="text-h4 mb-2">No Audit Results</h3>
              <p className="text-body-base text-[var(--color-charcoal)]">
                Click "Scan Project" to analyze all pages and components
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredFindings.map((finding) => {
              const isExpanded = expandedFiles.has(finding.file);
              const isSelected = selectedFindings.includes(finding.file);

              return (
                <Card key={finding.file} className={isSelected ? "ring-2 ring-[var(--color-primary)]" : ""}>
                  <CardHeader className="py-4">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleFinding(finding.file)}
                      />
                      <button
                        onClick={() => toggleFile(finding.file)}
                        className="flex-1 flex items-center gap-2 text-left"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-[var(--color-charcoal)]" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-[var(--color-charcoal)]" />
                        )}
                        <Code className="h-4 w-4 text-[var(--color-primary)]" />
                        <span className="text-body-base font-mono">{finding.file}</span>
                        <Badge variant="secondary">{finding.totalIssues} issues</Badge>
                        {finding.highSeverity > 0 && (
                          <Badge className="bg-red-100 text-red-800">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {finding.highSeverity} high
                          </Badge>
                        )}
                      </button>
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="pt-0">
                      <ScrollArea className="max-h-96">
                        <div className="space-y-3">
                          {finding.issues.map((issue, idx) => (
                            <div
                              key={idx}
                              className="p-3 bg-[var(--color-background)] rounded-lg border border-[var(--color-background-muted)]"
                            >
                              <div className="flex items-start justify-between gap-4 mb-2">
                                <div className="flex items-center gap-2">
                                  <Badge
                                    className={
                                      issue.severity === "high" ? "bg-red-100 text-red-800" :
                                      issue.severity === "medium" ? "bg-yellow-100 text-yellow-800" :
                                      "bg-blue-100 text-blue-800"
                                    }
                                  >
                                    {issue.severity}
                                  </Badge>
                                  <span className="text-caption text-[var(--color-charcoal)]">
                                    Line {issue.line}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {issue.element}
                                  </Badge>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div>
                                  <p className="text-caption text-[var(--color-charcoal)] mb-1">Current:</p>
                                  <code className="block text-xs bg-red-50 text-red-900 p-2 rounded font-mono">
                                    {issue.current_class}
                                  </code>
                                </div>
                                <div>
                                  <p className="text-caption text-[var(--color-charcoal)] mb-1">Suggested:</p>
                                  <code className="block text-xs bg-green-50 text-green-900 p-2 rounded font-mono">
                                    {issue.replacement}
                                  </code>
                                </div>
                                {issue.context && (
                                  <p className="text-caption text-[var(--color-charcoal)] italic">
                                    {issue.context}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* Help Card */}
        <Card className="mt-6 bg-[var(--color-accent)]/5 border-[var(--color-accent)]/20">
          <CardHeader>
            <CardTitle className="text-h5 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[var(--color-accent)]" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-body-small text-[var(--color-charcoal)]">
            <p>1. Click "Scan Project" to analyze all pages and components</p>
            <p>2. Review findings - expand files to see specific issues</p>
            <p>3. Select files to fix and set roadmap priority</p>
            <p>4. Click "Add to Roadmap" to create tasks for your sprints</p>
            <div className="mt-4 p-3 bg-white rounded-lg">
              <p className="text-caption mb-2">Semantic Token Classes:</p>
              <code className="text-xs">text-h1, text-h2, text-h3, text-h4, text-h5, text-h6</code><br/>
              <code className="text-xs">text-body-large, text-body-base, text-body-small, text-body-muted</code><br/>
              <code className="text-xs">text-caption</code>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}