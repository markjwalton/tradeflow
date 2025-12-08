import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  FileText,
  FileImage,
  File,
  Download,
  ExternalLink,
  Upload,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const typeColors = {
  "Project Spec Sheet": "bg-info-50 text-info",
  Contract: "bg-accent-100 text-accent",
  Drawing: "bg-success-50 text-success",
  Photo: "bg-warning/10 text-warning",
  Email: "bg-accent-100 text-accent",
  Report: "bg-info-50 text-info",
  Invoice: "bg-destructive-50 text-destructive",
  Quote: "bg-warning/10 text-warning",
  Other: "bg-muted text-muted-foreground",
};

const typeIcons = {
  Photo: FileImage,
  Drawing: FileImage,
  default: FileText,
};

const emptyDocument = {
  name: "",
  type: "Other",
  description: "",
  version: "",
};

export default function DocumentList({ documents = [], projectId, isLoading }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [formData, setFormData] = useState(emptyDocument);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ProjectDocument.create({ ...data, projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", projectId] });
      toast.success("Document uploaded");
      handleCloseDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ProjectDocument.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", projectId] });
      toast.success("Document updated");
      handleCloseDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ProjectDocument.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", projectId] });
      toast.success("Document deleted");
    },
  });

  const handleOpenDialog = (document = null) => {
    if (document) {
      setEditingDocument(document);
      setFormData({
        name: document.name || "",
        type: document.type || "Other",
        description: document.description || "",
        version: document.version || "",
      });
    } else {
      setEditingDocument(null);
      setFormData(emptyDocument);
    }
    setFile(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingDocument(null);
    setFormData(emptyDocument);
    setFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (editingDocument) {
      updateMutation.mutate({ id: editingDocument.id, data: formData });
    } else {
      if (!file) {
        toast.error("Please select a file to upload");
        return;
      }

      setIsUploading(true);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setIsUploading(false);

      createMutation.mutate({
        ...formData,
        fileUrl: file_url,
      });
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!formData.name) {
        setFormData({ ...formData, name: selectedFile.name });
      }
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending || isUploading;

  const filteredDocuments = typeFilter === "all"
    ? documents
    : documents.filter((d) => d.type === typeFilter);

  // Group documents by type
  const groupedDocuments = filteredDocuments.reduce((acc, doc) => {
    const type = doc.type || "Other";
    if (!acc[type]) acc[type] = [];
    acc[type].push(doc);
    return acc;
  }, {});

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Documents</CardTitle>
        <div className="flex items-center gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Project Spec Sheet">Spec Sheets</SelectItem>
              <SelectItem value="Contract">Contracts</SelectItem>
              <SelectItem value="Drawing">Drawings</SelectItem>
              <SelectItem value="Photo">Photos</SelectItem>
              <SelectItem value="Invoice">Invoices</SelectItem>
              <SelectItem value="Quote">Quotes</SelectItem>
              <SelectItem value="Report">Reports</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => handleOpenDialog()}
              >
                <Plus className="h-4 w-4 mr-1" />
                Upload
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingDocument ? "Edit Document" : "Upload Document"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!editingDocument && (
                  <div className="space-y-2">
                    <Label>File *</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        {file ? (
                          <div className="flex items-center justify-center gap-2 text-foreground">
                            <File className="h-5 w-5" />
                            <span>{file.name}</span>
                          </div>
                        ) : (
                          <div className="text-muted-foreground">
                            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                            <p>Click to select a file</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              PDF, Images, Documents
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Document Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Document name"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Project Spec Sheet">Project Spec Sheet</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                        <SelectItem value="Drawing">Drawing</SelectItem>
                        <SelectItem value="Photo">Photo</SelectItem>
                        <SelectItem value="Email">Email</SelectItem>
                        <SelectItem value="Report">Report</SelectItem>
                        <SelectItem value="Invoice">Invoice</SelectItem>
                        <SelectItem value="Quote">Quote</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Version</Label>
                    <Input
                      value={formData.version}
                      onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                      placeholder="e.g., v1.0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of this document..."
                    rows={2}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={isSubmitting}
                  >
                    {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingDocument ? "Update" : "Upload"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p>{typeFilter === "all" ? "No documents uploaded yet" : `No ${typeFilter.toLowerCase()} documents`}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedDocuments).map(([type, typeDocs]) => (
              <div key={type}>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">{type}</h4>
                <div className="space-y-2">
                  {typeDocs.map((doc) => {
                    const IconComponent = typeIcons[doc.type] || typeIcons.default;
                    return (
                      <div
                        key={doc.id}
                        className="p-4 rounded-lg border border-border bg-card hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                              <IconComponent className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                              <h4 className="font-medium text-foreground">{doc.name}</h4>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <Badge className={typeColors[doc.type]}>{doc.type}</Badge>
                                {doc.version && (
                                  <span className="text-xs text-muted-foreground">{doc.version}</span>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(doc.created_date), "MMM d, yyyy")}
                                </span>
                              </div>
                              {doc.description && (
                                <p className="text-sm text-muted-foreground mt-1">{doc.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 hover:bg-muted rounded-lg transition-colors"
                            >
                              <ExternalLink className="h-4 w-4 text-muted-foreground" />
                            </a>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleOpenDialog(doc)}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                  </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => deleteMutation.mutate(doc.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}