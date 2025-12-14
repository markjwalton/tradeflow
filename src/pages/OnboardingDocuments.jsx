import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Upload, FileText, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/sturij";

const DOCUMENT_TYPES = [
  { value: "contract", label: "Contract" },
  { value: "sla", label: "SLA" },
  { value: "technical_spec", label: "Technical Spec" },
  { value: "asset", label: "Asset" },
  { value: "policy", label: "Policy" },
  { value: "support_doc", label: "Support Doc" },
  { value: "other", label: "Other" },
];

const STATUS_OPTIONS = [
  { value: "pending_review", label: "Pending review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "requires_changes", label: "Requires changes" },
];

export default function OnboardingDocuments() {
  const queryClient = useQueryClient();
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState("contract");
  const [notes, setNotes] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dragActive, setDragActive] = useState(false);

  // Get current user and session - adjust based on your app structure
  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  // For now, using a placeholder session ID - you'll need to pass this from your app context
  const sessionId = "demo-session-id";

  // Fetch documents for current session
  const {
    data: documents = [],
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["onboardingDocuments", sessionId],
    queryFn: async () => {
      const result = await base44.entities.OnboardingDocument.filter({
        onboarding_session_id: sessionId,
      });
      return result || [];
    },
  });

  // Upload file mutation
  const uploadFileMutation = useMutation({
    mutationFn: async (fileToUpload) => {
      const result = await base44.integrations.Core.UploadFile({
        file: fileToUpload,
      });
      return result.file_url;
    },
  });

  // Create document mutation
  const createDocumentMutation = useMutation({
    mutationFn: async (payload) => {
      return await base44.entities.OnboardingDocument.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["onboardingDocuments", sessionId]);
    },
  });

  // Update document mutation
  const updateDocumentMutation = useMutation({
    mutationFn: async ({ id, patch }) => {
      return await base44.entities.OnboardingDocument.update(id, patch);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["onboardingDocuments", sessionId]);
    },
  });

  function handleFileChange(e) {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) setFile(droppedFile);
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!file || !user) return;

    try {
      const fileUrl = await uploadFileMutation.mutateAsync(file);

      const payload = {
        onboarding_session_id: sessionId,
        document_name: file.name,
        document_type: docType,
        file_url: fileUrl,
        uploaded_by: user.email,
        status: "pending_review",
        notes: notes || undefined,
      };

      await createDocumentMutation.mutateAsync(payload);

      setFile(null);
      setNotes("");
      setDocType("contract");
    } catch (err) {
      console.error("Upload failed", err);
    }
  }

  async function handleStatusChange(doc, newStatus) {
    if (!doc.id) return;
    
    try {
      await updateDocumentMutation.mutateAsync({
        id: doc.id,
        patch: { status: newStatus },
      });
    } catch (err) {
      console.error("Failed to update status", err);
    }
  }

  const filteredDocuments = documents.filter((doc) => {
    if (filterType !== "all" && doc.document_type !== filterType) return false;
    if (filterStatus !== "all" && doc.status !== filterStatus) return false;
    return true;
  });

  const uploading = uploadFileMutation.isPending || createDocumentMutation.isPending;

  return (
    <div className="max-w-7xl mx-auto -mt-6 space-y-8">
      <PageHeader 
        title="Documents"
        description="Upload and manage contracts, SLAs, technical specs, policies, and other onboarding documents"
      />

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <form
          onSubmit={handleUpload}
          className="rounded-xl border border-dashed border-border bg-card p-6"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div
            className={cn(
              "flex flex-col items-center justify-center rounded-lg border border-border p-8 text-center transition-colors",
              dragActive ? "border-primary bg-accent" : "bg-muted/50"
            )}
          >
            <Upload className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-sm font-medium text-foreground">
              Drag &amp; drop documents here
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              or click to browse files from your computer
            </p>

            <div className="mt-4 w-full max-w-xs">
              <Input
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="cursor-pointer text-xs"
              />
            </div>

            {file && (
              <div className="mt-3 text-xs text-primary flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="font-medium">{file.name}</span>
              </div>
            )}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Document type</label>
              <Select value={docType} onValueChange={setDocType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Notes (optional)</label>
              <Textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add context or instructions for reviewers..."
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button type="submit" disabled={!file || uploading}>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload document"
              )}
            </Button>
          </div>
        </form>

        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Filters</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Narrow down by document type and review status.
          </p>

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium">Type</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {DOCUMENT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium">Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {(isFetching || uploading) && (
            <p className="mt-4 text-xs text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              {uploading ? "Uploading document..." : "Refreshing documents..."}
            </p>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4">
          <h2 className="text-sm font-semibold">All documents</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {isLoading
              ? "Loading documents..."
              : `${filteredDocuments.length} document(s) match your filters.`}
          </p>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Uploaded by</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!isLoading && filteredDocuments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    No documents found. Try adjusting your filters or upload a new document.
                  </TableCell>
                </TableRow>
              )}

              {filteredDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="max-w-xs">
                    <div className="flex flex-col">
                      <span className="truncate font-medium">{doc.document_name}</span>
                      {doc.notes && (
                        <span className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                          {doc.notes}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {DOCUMENT_TYPES.find((t) => t.value === doc.document_type)?.label || doc.document_type}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={doc.status} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {doc.uploaded_by || "-"}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={doc.status}
                      onValueChange={(val) => handleStatusChange(doc, val)}
                    >
                      <SelectTrigger className="w-[160px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}

function StatusBadge({ status }) {
  const config = {
    pending_review: {
      label: "Pending review",
      variant: "secondary",
    },
    approved: {
      label: "Approved",
      variant: "success",
    },
    rejected: {
      label: "Rejected",
      variant: "destructive",
    },
    requires_changes: {
      label: "Requires changes",
      variant: "outline",
    },
  };

  const cfg = config[status] || {
    label: status,
    variant: "outline",
  };

  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}