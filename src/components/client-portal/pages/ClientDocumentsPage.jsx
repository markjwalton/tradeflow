import React, { useState } from "react";
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
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

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

export function ClientDocumentsPage({ sessionId, currentUser }) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState("contract");
  const [notes, setNotes] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dragActive, setDragActive] = useState(false);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["clientDocuments", sessionId],
    queryFn: () => base44.entities.OnboardingDocument.filter({ onboarding_session_id: sessionId }),
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.OnboardingDocument.create({
        onboarding_session_id: sessionId,
        document_name: file.name,
        document_type: docType,
        file_url,
        uploaded_by: currentUser?.email || "Guest",
        status: "pending_review",
        notes: notes || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["clientDocuments"]);
      setFile(null);
      setNotes("");
      toast.success("Document uploaded");
    },
  });

  function handleFileChange(e) {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  }

  function handleDragOver(e) {
    e.preventDefault();
    setDragActive(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setDragActive(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragActive(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) setFile(dropped);
  }

  function handleUpload(e) {
    e.preventDefault();
    if (file) uploadMutation.mutate();
  }

  const filteredDocuments = documents.filter((doc) => {
    if (filterType !== "all" && doc.document_type !== filterType) return false;
    if (filterStatus !== "all" && doc.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-base font-semibold text-slate-50">Documents</h1>
        <p className="mt-1 text-xs text-slate-400">
          Upload and manage contracts, SLAs, technical specs, and policies.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <form
          onSubmit={handleUpload}
          className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 p-6"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div
            className={cn(
              "flex flex-col items-center justify-center rounded-lg border border-slate-800 p-6 text-center transition",
              dragActive ? "border-emerald-500 bg-slate-900/70" : "bg-slate-950/60"
            )}
          >
            <p className="text-xs font-medium text-slate-200">Drag & drop documents here</p>
            <p className="mt-1 text-[11px] text-slate-500">or click to browse</p>
            <div className="mt-4">
              <Input
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="cursor-pointer text-xs"
              />
            </div>
            {file && (
              <div className="mt-3 text-[11px] text-emerald-300">
                Ready: <span className="font-medium">{file.name}</span>
              </div>
            )}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 text-xs">
              <label className="text-slate-200">Document type</label>
              <Select value={docType} onValueChange={setDocType}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value} className="text-xs">
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 text-xs sm:col-span-2">
              <label className="text-slate-200">Notes (optional)</label>
              <Textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add context..."
                className="text-xs"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button type="submit" size="sm" disabled={!file || uploadMutation.isPending}>
              {uploadMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Upload
            </Button>
          </div>
        </form>

        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 text-xs">
          <h2 className="text-xs font-semibold text-slate-100">Filters</h2>
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <div className="text-[11px] text-slate-300">Type</div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All types</SelectItem>
                  {DOCUMENT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value} className="text-xs">{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="text-[11px] text-slate-300">Status</div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All statuses</SelectItem>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value} className="text-xs">{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
        <h2 className="mb-3 text-sm font-semibold text-slate-100">All documents</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs text-slate-400">Name</TableHead>
              <TableHead className="text-xs text-slate-400">Type</TableHead>
              <TableHead className="text-xs text-slate-400">Status</TableHead>
              <TableHead className="text-xs text-slate-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocuments.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-6 text-center text-xs text-slate-500">
                  No documents found
                </TableCell>
              </TableRow>
            )}
            {filteredDocuments.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="text-xs text-slate-100">{doc.document_name}</TableCell>
                <TableCell className="text-xs text-slate-300">
                  {DOCUMENT_TYPES.find((t) => t.value === doc.document_type)?.label}
                </TableCell>
                <TableCell className="text-xs">
                  <Badge variant="outline" className="text-xs">{doc.status}</Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}