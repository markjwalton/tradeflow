import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  ScrollArea
} from "@/components/ui/scroll-area";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Code,
  Save,
  History,
  GitCompare,
  Copy,
  FileCode,
  Palette,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import AppShellPreview from "@/components/page-builder/AppShellPreview";

export default function PageBuilder() {
  const queryClient = useQueryClient();
  const [selectedPage, setSelectedPage] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [compareVersions, setCompareVersions] = useState([null, null]);
  const [showTokens, setShowTokens] = useState(false);
  const [interactiveMode, setInteractiveMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [showTokenPicker, setShowTokenPicker] = useState(false);

  const TOKEN_LIBRARY = {
    colors: [
      { name: "Primary", value: "text-[var(--color-primary)]", bg: "bg-[var(--color-primary)]" },
      { name: "Secondary", value: "text-[var(--color-secondary)]", bg: "bg-[var(--color-secondary)]" },
      { name: "Accent", value: "text-[var(--color-accent)]", bg: "bg-[var(--color-accent)]" },
      { name: "Midnight", value: "text-[var(--color-midnight)]", bg: "bg-[var(--color-midnight)]" },
      { name: "Charcoal", value: "text-[var(--color-charcoal)]", bg: "bg-[var(--color-charcoal)]" },
      { name: "Background", value: "text-[var(--color-background)]", bg: "bg-[var(--color-background)]" },
    ],
    spacing: [
      { name: "1 (0.25rem)", value: "p-[var(--spacing-1)]", m: "m-[var(--spacing-1)]" },
      { name: "2 (0.5rem)", value: "p-[var(--spacing-2)]", m: "m-[var(--spacing-2)]" },
      { name: "3 (0.75rem)", value: "p-[var(--spacing-3)]", m: "m-[var(--spacing-3)]" },
      { name: "4 (1rem)", value: "p-[var(--spacing-4)]", m: "m-[var(--spacing-4)]" },
      { name: "6 (1.5rem)", value: "p-[var(--spacing-6)]", m: "m-[var(--spacing-6)]" },
      { name: "8 (2rem)", value: "p-[var(--spacing-8)]", m: "m-[var(--spacing-8)]" },
    ],
    radius: [
      { name: "Small", value: "rounded-[var(--radius-sm)]" },
      { name: "Medium", value: "rounded-[var(--radius-md)]" },
      { name: "Large", value: "rounded-[var(--radius-lg)]" },
      { name: "XL", value: "rounded-[var(--radius-xl)]" },
      { name: "Full", value: "rounded-[var(--radius-full)]" },
    ],
    shadows: [
      { name: "Small", value: "shadow-[var(--shadow-sm)]" },
      { name: "Medium", value: "shadow-[var(--shadow-md)]" },
      { name: "Large", value: "shadow-[var(--shadow-lg)]" },
      { name: "XL", value: "shadow-[var(--shadow-xl)]" },
    ],
    fonts: [
      { name: "Heading", value: "font-[var(--font-heading)]" },
      { name: "Body", value: "font-[var(--font-body)]" },
      { name: "Mono", value: "font-[var(--font-mono)]" },
    ],
    fontSizes: [
      { name: "XS (0.75rem)", value: "text-[var(--font-size-xs)]" },
      { name: "SM (0.875rem)", value: "text-[var(--font-size-sm)]" },
      { name: "Base (1rem)", value: "text-[var(--font-size-base)]" },
      { name: "LG (1.125rem)", value: "text-[var(--font-size-lg)]" },
      { name: "XL (1.25rem)", value: "text-[var(--font-size-xl)]" },
      { name: "2XL (1.5rem)", value: "text-[var(--font-size-2xl)]" },
      { name: "3XL (1.875rem)", value: "text-[var(--font-size-3xl)]" },
      { name: "4XL (2.25rem)", value: "text-[var(--font-size-4xl)]" },
    ],
    fontWeights: [
      { name: "Light (300)", value: "font-light" },
      { name: "Normal (400)", value: "font-normal" },
      { name: "Medium (500)", value: "font-medium" },
      { name: "Semibold (600)", value: "font-semibold" },
      { name: "Bold (700)", value: "font-bold" },
    ],
    borders: [
      { name: "Primary", value: "border-[var(--color-primary)]" },
      { name: "Secondary", value: "border-[var(--color-secondary)]" },
      { name: "Accent", value: "border-[var(--color-accent)]" },
      { name: "Midnight", value: "border-[var(--color-midnight)]" },
      { name: "Muted", value: "border-[var(--color-background-muted)]" },
    ],
    transitions: [
      { name: "Fast (150ms)", value: "transition-[var(--transition-fast)]" },
      { name: "Normal (200ms)", value: "transition-[var(--transition-normal)]" },
      { name: "Slow (300ms)", value: "transition-[var(--transition-slow)]" },
      { name: "All", value: "transition-all duration-200" },
    ],
    buttons: [
      { name: "Primary", value: "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] px-4 py-2 rounded-[var(--radius-lg)]" },
      { name: "Secondary", value: "bg-[var(--color-secondary)] text-white hover:bg-[var(--color-secondary-dark)] px-4 py-2 rounded-[var(--radius-lg)]" },
      { name: "Outline", value: "border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 px-4 py-2 rounded-[var(--radius-lg)]" },
      { name: "Ghost", value: "text-[var(--color-charcoal)] hover:bg-[var(--color-background-muted)] px-4 py-2 rounded-[var(--radius-lg)]" },
    ],
  };

  const [formData, setFormData] = useState({
    page_name: "",
    description: "",
    current_content_jsx: "",
    includes_app_shell: true,
    category: "Custom",
    tags: [],
  });

  // Fetch all UI pages
  const { data: pages = [], isLoading } = useQuery({
    queryKey: ["uiPages"],
    queryFn: () => base44.entities.UIPage.list("-updated_date"),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.UIPage.create({
      ...data,
      versions: [{
        version_number: 1,
        saved_date: new Date().toISOString(),
        content_jsx: data.current_content_jsx,
        change_summary: "Initial version",
      }],
      current_version_number: 1,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uiPages"] });
      toast.success("Page created");
      closeEditor();
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.UIPage.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uiPages"] });
      toast.success("Page updated");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.UIPage.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uiPages"] });
      toast.success("Page deleted");
    },
  });

  const openEditor = (page = null) => {
    if (page) {
      setFormData({
        page_name: page.page_name,
        description: page.description || "",
        current_content_jsx: page.current_content_jsx,
        includes_app_shell: page.includes_app_shell,
        category: page.category || "Custom",
        tags: page.tags || [],
      });
      setSelectedPage(page);
    } else {
      setFormData({
        page_name: "",
        description: "",
        current_content_jsx: "",
        includes_app_shell: true,
        category: "Custom",
        tags: [],
      });
      setSelectedPage(null);
    }
    setShowEditor(true);
  };

  const closeEditor = () => {
    setShowEditor(false);
    setSelectedPage(null);
    setFormData({
      page_name: "",
      description: "",
      current_content_jsx: "",
      includes_app_shell: true,
      category: "Custom",
      tags: [],
    });
  };

  const handleSave = () => {
    if (!formData.page_name || !formData.current_content_jsx) {
      toast.error("Page name and content are required");
      return;
    }

    if (selectedPage) {
      // Save new version
      const newVersion = {
        version_number: (selectedPage.current_version_number || 0) + 1,
        saved_date: new Date().toISOString(),
        content_jsx: formData.current_content_jsx,
        change_summary: `Update ${new Date().toLocaleString()}`,
      };

      updateMutation.mutate({
        id: selectedPage.id,
        data: {
          ...formData,
          versions: [...(selectedPage.versions || []), newVersion],
          current_version_number: newVersion.version_number,
        },
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleRevertToVersion = (version) => {
    if (!selectedPage) return;

    updateMutation.mutate({
      id: selectedPage.id,
      data: {
        ...selectedPage,
        current_content_jsx: version.content_jsx,
        current_version_number: version.version_number,
      },
    });
    toast.success(`Reverted to version ${version.version_number}`);
  };

  const handleDuplicate = (page) => {
    createMutation.mutate({
      ...page,
      page_name: `${page.page_name} (Copy)`,
      versions: [{
        version_number: 1,
        saved_date: new Date().toISOString(),
        content_jsx: page.current_content_jsx,
        change_summary: "Duplicated from " + page.page_name,
      }],
      current_version_number: 1,
    });
  };

  const handleElementClick = (e) => {
    if (!interactiveMode) return;
    e.stopPropagation();
    e.preventDefault();
    
    const element = e.target;
    const currentClasses = element.className || '';
    const tagName = element.tagName.toLowerCase();
    const textContent = element.textContent?.substring(0, 50) || '';
    
    setSelectedElement({
      currentClasses,
      tagName,
      textContent,
      originalElement: element
    });
    setShowTokenPicker(true);
  };

  // Apply highlight to selected element
  React.useEffect(() => {
    if (selectedElement?.originalElement) {
      selectedElement.originalElement.style.outline = '2px solid var(--color-primary)';
      selectedElement.originalElement.style.outlineOffset = '2px';
    }
  }, [selectedElement]);

  const getElementPath = (element) => {
    const path = [];
    let current = element;
    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();
      if (current.id) selector += `#${current.id}`;
      if (current.className) selector += `.${current.className.split(' ').join('.')}`;
      path.unshift(selector);
      current = current.parentElement;
    }
    return path.join(' > ');
  };

  const escapeRegex = (str) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const applyTokenToElement = (tokenClass, tokenType) => {
    if (!selectedElement) {
      toast.error("No element selected");
      return;
    }

    try {
      const { currentClasses, originalElement } = selectedElement;

      // Split classes into array for precise filtering
      let classArray = currentClasses.split(/\s+/).filter(Boolean);

      // Remove conflicting classes based on token type
      if (tokenType === 'color-text') {
        classArray = classArray.filter(c => !c.match(/^text-\[var\(--color-/) && !c.match(/^text-(white|black|gray-|slate-|zinc-|neutral-|stone-|red-|orange-|amber-|yellow-|lime-|green-|emerald-|teal-|cyan-|sky-|blue-|indigo-|violet-|purple-|fuchsia-|pink-|rose-)/));
      } else if (tokenType === 'color-bg') {
        classArray = classArray.filter(c => !c.match(/^bg-\[var\(--color-/) && !c.match(/^bg-(white|black|transparent|gray-|slate-|zinc-|neutral-|stone-|red-|orange-|amber-|yellow-|lime-|green-|emerald-|teal-|cyan-|sky-|blue-|indigo-|violet-|purple-|fuchsia-|pink-|rose-)/));
      } else if (tokenType === 'spacing-p') {
        classArray = classArray.filter(c => !c.match(/^p-\[var\(--spacing-/) && !c.match(/^p[xytblr]?-/));
      } else if (tokenType === 'spacing-m') {
        classArray = classArray.filter(c => !c.match(/^m-\[var\(--spacing-/) && !c.match(/^m[xytblr]?-/));
      } else if (tokenType === 'radius') {
        classArray = classArray.filter(c => !c.match(/^rounded-\[var\(--radius-/) && !c.match(/^rounded/));
      } else if (tokenType === 'shadow') {
        classArray = classArray.filter(c => !c.match(/^shadow-\[var\(--shadow-/) && !c.match(/^shadow/));
      } else if (tokenType === 'font-family') {
        classArray = classArray.filter(c => !c.match(/^font-\[var\(--font-/) && !c.match(/^font-(sans|serif|mono|heading|body)$/));
      } else if (tokenType === 'font-size') {
        classArray = classArray.filter(c => !c.match(/^text-\[var\(--font-size-/) && !c.match(/^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)$/));
      } else if (tokenType === 'font-weight') {
        classArray = classArray.filter(c => !c.match(/^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/));
      } else if (tokenType === 'border') {
        classArray = classArray.filter(c => !c.match(/^border-\[var\(--color-/) && !c.match(/^border-(white|black|gray-|slate-|zinc-|neutral-|stone-|red-|orange-|amber-|yellow-|lime-|green-|emerald-|teal-|cyan-|sky-|blue-|indigo-|violet-|purple-|fuchsia-|pink-|rose-)/));
      } else if (tokenType === 'transition') {
        classArray = classArray.filter(c => !c.match(/^transition/));
      } else if (tokenType === 'button') {
        classArray = [];
      }

      // Add new token class
      classArray.push(tokenClass);
      const newClasses = classArray.join(' ');

      // Update JSX content FIRST - try to find and replace the class attribute
      let updatedContent = formData.current_content_jsx;
      const escapedClasses = escapeRegex(currentClasses.trim());

      // Try multiple patterns to find and replace
      const patterns = [
        { regex: new RegExp(`className\\s*=\\s*"${escapedClasses}"`, 'g'), replacement: `className="${newClasses}"` },
        { regex: new RegExp(`className\\s*=\\s*'${escapedClasses}'`, 'g'), replacement: `className="${newClasses}"` },
        { regex: new RegExp(`class\\s*=\\s*"${escapedClasses}"`, 'g'), replacement: `class="${newClasses}"` },
        { regex: new RegExp(`class\\s*=\\s*'${escapedClasses}'`, 'g'), replacement: `class="${newClasses}"` },
      ];

      let replaced = false;
      for (const { regex, replacement } of patterns) {
        if (regex.test(updatedContent)) {
          updatedContent = updatedContent.replace(regex, replacement);
          replaced = true;
          break;
        }
      }

      if (!replaced) {
        console.warn('Could not find class in JSX. Current classes:', currentClasses);
        toast.warning("Style applied visually, but couldn't update code");
      } else {
        toast.success("Token applied!");
      }

      // Update form data
      setFormData({ ...formData, current_content_jsx: updatedContent });

      // Apply to DOM element for immediate visual feedback
      if (originalElement) {
        originalElement.className = newClasses;
      }

      // Update selected element state with new classes so next click works
      setSelectedElement({
        ...selectedElement,
        currentClasses: newClasses
      });

      // Keep element selected with outline
      if (originalElement) {
        originalElement.style.outline = '2px solid var(--color-primary)';
        originalElement.style.outlineOffset = '2px';
      }
    } catch (error) {
      console.error('Error applying token:', error);
      toast.error("Failed to apply token: " + error.message);
    }
  };

  const renderPreview = (content, includeShell) => {
    try {
      const previewContent = (
        <div 
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );

      const wrappedContent = includeShell ? <AppShellPreview>{previewContent}</AppShellPreview> : previewContent;

      return (
        <div
          onClick={handleElementClick}
          style={{ cursor: interactiveMode ? 'pointer' : 'default' }}
        >
          {wrappedContent}
        </div>
      );
    } catch (e) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-medium">Preview Error</p>
          <p className="text-sm text-red-600">{e.message}</p>
        </div>
      );
    }
  };

  const renderVersionComparison = (v1, v2) => {
    const lines1 = v1?.content_jsx?.split("\n") || [];
    const lines2 = v2?.content_jsx?.split("\n") || [];
    const maxLines = Math.max(lines1.length, lines2.length);

    return (
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium mb-2">Version {v1?.version_number}</h4>
          <div className="bg-muted/50 rounded-lg p-4 font-mono text-xs space-y-1 max-h-96 overflow-auto">
            {lines1.map((line, i) => (
              <div key={i} className={lines2[i] !== line ? "bg-red-100" : ""}>
                {line || " "}
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-medium mb-2">Version {v2?.version_number}</h4>
          <div className="bg-muted/50 rounded-lg p-4 font-mono text-xs space-y-1 max-h-96 overflow-auto">
            {lines2.map((line, i) => (
              <div key={i} className={lines1[i] !== line ? "bg-green-100" : ""}>
                {line || " "}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading text-[var(--color-midnight)]">Page Design Builder</h1>
          <p className="text-[var(--color-charcoal)]">Create and manage UI page designs with version control</p>
        </div>
        <Button onClick={() => openEditor()} className="bg-[var(--color-primary)]">
          <Plus className="h-4 w-4 mr-2" />
          New Page
        </Button>
      </div>

      {/* Pages Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-[var(--color-charcoal)]">Loading...</div>
      ) : pages.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileCode className="h-12 w-12 mx-auto mb-4 text-[var(--color-charcoal)]" />
            <h3 className="text-lg font-medium mb-2">No pages yet</h3>
            <p className="text-[var(--color-charcoal)] mb-4">Create your first UI page to get started</p>
            <Button onClick={() => openEditor()} className="bg-[var(--color-primary)]">
              <Plus className="h-4 w-4 mr-2" />
              Create Page
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pages.map((page) => (
            <Card key={page.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">{page.page_name}</CardTitle>
                    <p className="text-sm text-[var(--color-charcoal)] mt-1">{page.description || "No description"}</p>
                  </div>
                  <Badge variant="outline">{page.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Badge className={page.includes_app_shell ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {page.includes_app_shell ? "With Shell" : "Content Only"}
                    </Badge>
                    <span className="text-[var(--color-charcoal)]">
                      v{page.current_version_number || 1} • {page.versions?.length || 1} versions
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedPage(page);
                        setShowPreview(true);
                      }}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Preview
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openEditor(page)}>
                      <Pencil className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedPage(page);
                        setShowVersionHistory(true);
                      }}
                    >
                      <History className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDuplicate(page)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[var(--color-destructive)]"
                      onClick={() => {
                        if (confirm("Delete this page?")) {
                          deleteMutation.mutate(page.id);
                        }
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={closeEditor}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPage ? "Edit Page" : "New Page"}</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="edit" className="mt-4">
            <TabsList>
              <TabsTrigger value="edit">
                <Code className="h-4 w-4 mr-2" />
                Edit
              </TabsTrigger>
              <TabsTrigger value="preview">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="tokens">
                <Palette className="h-4 w-4 mr-2" />
                Design Tokens
              </TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Page Name *</Label>
                  <Input
                    value={formData.page_name}
                    onChange={(e) => setFormData({ ...formData, page_name: e.target.value })}
                    placeholder="e.g., Project Dashboard"
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dashboard">Dashboard</SelectItem>
                      <SelectItem value="Form">Form</SelectItem>
                      <SelectItem value="Detail">Detail</SelectItem>
                      <SelectItem value="List">List</SelectItem>
                      <SelectItem value="Custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this page..."
                  rows={2}
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.includes_app_shell}
                  onCheckedChange={(v) => setFormData({ ...formData, includes_app_shell: v })}
                />
                <Label>Include App Shell (Header, Sidebar, Footer)</Label>
              </div>

              <div>
                <Label>JSX/HTML Content *</Label>
                <Textarea
                  value={formData.current_content_jsx}
                  onChange={(e) => setFormData({ ...formData, current_content_jsx: e.target.value })}
                  placeholder="Paste your JSX or HTML code here..."
                  rows={20}
                  className="font-mono text-sm"
                />
              </div>
            </TabsContent>

            <TabsContent value="preview" className="mt-4">
              <div className="mb-3 flex items-center gap-2">
                <Switch
                  checked={interactiveMode}
                  onCheckedChange={setInteractiveMode}
                  id="interactive"
                />
                <Label htmlFor="interactive" className="cursor-pointer">
                  Interactive Mode (click elements to apply tokens)
                </Label>
              </div>
              <div className={`border rounded-lg overflow-hidden bg-white ${interactiveMode ? 'ring-2 ring-[var(--color-primary)]/30' : ''}`}>
                {renderPreview(formData.current_content_jsx, formData.includes_app_shell)}
              </div>
            </TabsContent>

            <TabsContent value="tokens" className="mt-4">
              <ScrollArea className="h-96 border rounded-lg p-4">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-3">Colors</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-[var(--color-primary)]" />
                        <code className="text-xs">var(--color-primary)</code>
                        <Button variant="ghost" size="sm" onClick={() => {
                          navigator.clipboard.writeText("var(--color-primary)");
                          toast.success("Copied!");
                        }}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-[var(--color-secondary)]" />
                        <code className="text-xs">var(--color-secondary)</code>
                        <Button variant="ghost" size="sm" onClick={() => {
                          navigator.clipboard.writeText("var(--color-secondary)");
                          toast.success("Copied!");
                        }}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-[var(--color-accent)]" />
                        <code className="text-xs">var(--color-accent)</code>
                        <Button variant="ghost" size="sm" onClick={() => {
                          navigator.clipboard.writeText("var(--color-accent)");
                          toast.success("Copied!");
                        }}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-[var(--color-midnight)]" />
                        <code className="text-xs">var(--color-midnight)</code>
                        <Button variant="ghost" size="sm" onClick={() => {
                          navigator.clipboard.writeText("var(--color-midnight)");
                          toast.success("Copied!");
                        }}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-[var(--color-charcoal)]" />
                        <code className="text-xs">var(--color-charcoal)</code>
                        <Button variant="ghost" size="sm" onClick={() => {
                          navigator.clipboard.writeText("var(--color-charcoal)");
                          toast.success("Copied!");
                        }}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-[var(--color-background)]" />
                        <code className="text-xs">var(--color-background)</code>
                        <Button variant="ghost" size="sm" onClick={() => {
                          navigator.clipboard.writeText("var(--color-background)");
                          toast.success("Copied!");
                        }}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3">Typography</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <code className="text-xs">var(--font-heading)</code>
                        <Button variant="ghost" size="sm" onClick={() => {
                          navigator.clipboard.writeText("var(--font-heading)");
                          toast.success("Copied!");
                        }}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <code className="text-xs">var(--font-body)</code>
                        <Button variant="ghost" size="sm" onClick={() => {
                          navigator.clipboard.writeText("var(--font-body)");
                          toast.success("Copied!");
                        }}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3">Spacing</h3>
                    <div className="space-y-2 text-sm">
                      {[1, 2, 3, 4, 6, 8, 12, 16].map(n => (
                        <div key={n} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <code className="text-xs">var(--spacing-{n})</code>
                          <Button variant="ghost" size="sm" onClick={() => {
                            navigator.clipboard.writeText(`var(--spacing-${n})`);
                            toast.success("Copied!");
                          }}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3">Shadows</h3>
                    <div className="space-y-2 text-sm">
                      {['sm', 'md', 'lg', 'xl'].map(size => (
                        <div key={size} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <code className="text-xs">var(--shadow-{size})</code>
                          <Button variant="ghost" size="sm" onClick={() => {
                            navigator.clipboard.writeText(`var(--shadow-${size})`);
                            toast.success("Copied!");
                          }}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3">Border Radius</h3>
                    <div className="space-y-2 text-sm">
                      {['sm', 'md', 'lg', 'xl', 'full'].map(size => (
                        <div key={size} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <code className="text-xs">var(--radius-{size})</code>
                          <Button variant="ghost" size="sm" onClick={() => {
                            navigator.clipboard.writeText(`var(--radius-${size})`);
                            toast.success("Copied!");
                          }}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={closeEditor}>Cancel</Button>
            <Button onClick={handleSave} className="bg-[var(--color-primary)]">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0">
          <div className="h-[90vh] overflow-y-auto">
            {selectedPage && renderPreview(selectedPage.current_content_jsx, selectedPage.includes_app_shell)}
          </div>
        </DialogContent>
      </Dialog>

      {/* Version History Dialog */}
      <Dialog open={showVersionHistory} onOpenChange={setShowVersionHistory}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Version History: {selectedPage?.page_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {selectedPage?.versions?.sort((a, b) => b.version_number - a.version_number).map((version) => (
              <div
                key={version.version_number}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge>v{version.version_number}</Badge>
                    {version.version_number === selectedPage.current_version_number && (
                      <Badge className="bg-green-100 text-green-800">Current</Badge>
                    )}
                  </div>
                  <p className="text-sm text-[var(--color-charcoal)] mt-1">{version.change_summary}</p>
                  <p className="text-xs text-[var(--color-charcoal)]">
                    {formatDistanceToNow(new Date(version.saved_date), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowPreview(true);
                      setSelectedPage({
                        ...selectedPage,
                        current_content_jsx: version.content_jsx,
                      });
                      setShowVersionHistory(false);
                    }}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  {version.version_number !== selectedPage.current_version_number && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRevertToVersion(version)}
                    >
                      Revert
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCompareVersions([version, selectedPage.versions.find(v => v.version_number === selectedPage.current_version_number)]);
                      setShowCompare(true);
                      setShowVersionHistory(false);
                    }}
                  >
                    <GitCompare className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Compare Dialog */}
      <Dialog open={showCompare} onOpenChange={setShowCompare}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Compare Versions</DialogTitle>
          </DialogHeader>
          {renderVersionComparison(compareVersions[0], compareVersions[1])}
        </DialogContent>
      </Dialog>

      {/* Token Picker Dialog */}
      <Dialog open={showTokenPicker} onOpenChange={(open) => {
        if (!open && selectedElement?.originalElement) {
          selectedElement.originalElement.style.outline = '';
          selectedElement.originalElement.style.outlineOffset = '';
        }
        setShowTokenPicker(open);
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Apply Design Token</DialogTitle>
            {selectedElement && (
              <div className="text-sm text-[var(--color-charcoal)]">
                <p>Selected: <code className="text-xs bg-muted px-1 py-0.5 rounded">{selectedElement.tagName}</code></p>
                <p className="text-xs mt-1 truncate">Current: {selectedElement.currentClasses || 'no classes'}</p>
              </div>
            )}
          </DialogHeader>
          
          <Tabs defaultValue="colors">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="colors">Colors</TabsTrigger>
              <TabsTrigger value="typography">Typography</TabsTrigger>
              <TabsTrigger value="spacing">Spacing</TabsTrigger>
              <TabsTrigger value="effects">Effects</TabsTrigger>
            </TabsList>

            <TabsContent value="colors" className="space-y-4">
              <div>
                <Label className="mb-2 block">Text Color</Label>
                <div className="grid grid-cols-3 gap-2">
                  {TOKEN_LIBRARY.colors.map((token) => (
                    <Button
                      key={token.value}
                      variant="outline"
                      className="justify-start gap-2"
                      onClick={() => applyTokenToElement(token.value, 'color-text')}
                    >
                      <div className={`w-4 h-4 rounded ${token.bg}`} />
                      {token.name}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Background Color</Label>
                <div className="grid grid-cols-3 gap-2">
                  {TOKEN_LIBRARY.colors.map((token) => (
                    <Button
                      key={token.bg}
                      variant="outline"
                      className="justify-start gap-2"
                      onClick={() => applyTokenToElement(token.bg, 'color-bg')}
                    >
                      <div className={`w-4 h-4 rounded ${token.bg}`} />
                      {token.name}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Border Color</Label>
                <div className="grid grid-cols-3 gap-2">
                  {TOKEN_LIBRARY.borders.map((token) => (
                    <Button
                      key={token.value}
                      variant="outline"
                      className="justify-start"
                      onClick={() => applyTokenToElement(token.value, 'border')}
                    >
                      {token.name}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="typography" className="space-y-4">
              <div>
                <Label className="mb-2 block">Font Family</Label>
                <div className="grid grid-cols-3 gap-2">
                  {TOKEN_LIBRARY.fonts.map((token) => (
                    <Button
                      key={token.value}
                      variant="outline"
                      className="justify-start"
                      onClick={() => applyTokenToElement(token.value, 'font-family')}
                    >
                      {token.name}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Font Size</Label>
                <div className="grid grid-cols-2 gap-2">
                  {TOKEN_LIBRARY.fontSizes.map((token) => (
                    <Button
                      key={token.value}
                      variant="outline"
                      className="justify-start"
                      onClick={() => applyTokenToElement(token.value, 'font-size')}
                    >
                      {token.name}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Font Weight</Label>
                <div className="grid grid-cols-3 gap-2">
                  {TOKEN_LIBRARY.fontWeights.map((token) => (
                    <Button
                      key={token.value}
                      variant="outline"
                      className="justify-start"
                      onClick={() => applyTokenToElement(token.value, 'font-weight')}
                    >
                      {token.name}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="spacing" className="space-y-4">
              <div>
                <Label className="mb-2 block">Padding</Label>
                <div className="grid grid-cols-2 gap-2">
                  {TOKEN_LIBRARY.spacing.map((token) => (
                    <Button
                      key={token.value}
                      variant="outline"
                      className="justify-start"
                      onClick={() => applyTokenToElement(token.value, 'spacing-p')}
                    >
                      {token.name}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Margin</Label>
                <div className="grid grid-cols-2 gap-2">
                  {TOKEN_LIBRARY.spacing.map((token) => (
                    <Button
                      key={token.m}
                      variant="outline"
                      className="justify-start"
                      onClick={() => applyTokenToElement(token.m, 'spacing-m')}
                    >
                      {token.name}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="effects" className="space-y-4">
              <div>
                <Label className="mb-2 block">Border Radius</Label>
                <div className="grid grid-cols-2 gap-2">
                  {TOKEN_LIBRARY.radius.map((token) => (
                    <Button
                      key={token.value}
                      variant="outline"
                      className="justify-start"
                      onClick={() => applyTokenToElement(token.value, 'radius')}
                    >
                      {token.name}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Shadow</Label>
                <div className="grid grid-cols-2 gap-2">
                  {TOKEN_LIBRARY.shadows.map((token) => (
                    <Button
                      key={token.value}
                      variant="outline"
                      className="justify-start"
                      onClick={() => applyTokenToElement(token.value, 'shadow')}
                    >
                      {token.name}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Transitions</Label>
                <div className="grid grid-cols-2 gap-2">
                  {TOKEN_LIBRARY.transitions.map((token) => (
                    <Button
                      key={token.value}
                      variant="outline"
                      className="justify-start"
                      onClick={() => applyTokenToElement(token.value, 'transition')}
                    >
                      {token.name}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Button Styles</Label>
                <div className="grid grid-cols-2 gap-2">
                  {TOKEN_LIBRARY.buttons.map((token) => (
                    <Button
                      key={token.value}
                      variant="outline"
                      className="justify-start"
                      onClick={() => applyTokenToElement(token.value, 'button')}
                    >
                      {token.name}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}