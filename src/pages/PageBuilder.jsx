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

  const renderPreview = (content, includeShell) => {
    try {
      if (includeShell) {
        return (
          <AppShellPreview>
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </AppShellPreview>
        );
      } else {
        return <div dangerouslySetInnerHTML={{ __html: content }} />;
      }
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
              <div className="border rounded-lg overflow-hidden bg-white">
                {renderPreview(formData.current_content_jsx, formData.includes_app_shell)}
              </div>
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
    </div>
  );
}