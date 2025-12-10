import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Trash2, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function DocumentManager({ sessionId }) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    document_name: "",
    document_type: "asset",
    notes: "",
    file: null
  });

  const { data: documents = [] } = useQuery({
    queryKey: ["onboardingDocuments", sessionId],
    queryFn: () => base44.entities.OnboardingDocument.filter({ onboarding_session_id: sessionId }),
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, file, document_name: formData.document_name || file.name });
    }
  };

  const uploadMutation = useMutation({
    mutationFn: async () => {
      setUploading(true);
      const { file_url } = await base44.integrations.Core.UploadFile({ file: formData.file });
      
      const user = await base44.auth.me();
      await base44.entities.OnboardingDocument.create({
        onboarding_session_id: sessionId,
        document_name: formData.document_name,
        document_type: formData.document_type,
        file_url,
        uploaded_by: user.email,
        notes: formData.notes,
        status: "pending_review"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["onboardingDocuments"] });
      setFormData({ document_name: "", document_type: "asset", notes: "", file: null });
      setUploading(false);
      toast.success("Document uploaded successfully");
    },
    onError: () => {
      setUploading(false);
      toast.error("Upload failed");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.OnboardingDocument.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["onboardingDocuments"] });
      toast.success("Document deleted");
    }
  });

  const getStatusColor = (status) => {
    switch(status) {
      case "approved": return "bg-success";
      case "rejected": return "bg-destructive";
      case "requires_changes": return "bg-warning";
      default: return "bg-secondary";
    }
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Documents
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Document Name</Label>
            <Input
              value={formData.document_name}
              onChange={(e) => setFormData({ ...formData, document_name: e.target.value })}
              placeholder="Enter document name..."
            />
          </div>
          <div>
            <Label>Document Type</Label>
            <Select value={formData.document_type} onValueChange={(v) => setFormData({ ...formData, document_type: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asset">Asset/Design File</SelectItem>
                <SelectItem value="technical_spec">Technical Specification</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="policy">Policy Document</SelectItem>
                <SelectItem value="support_doc">Support Documentation</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Notes (Optional)</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any notes about this document..."
              rows={3}
            />
          </div>
          <div>
            <Label>Choose File</Label>
            <Input type="file" onChange={handleFileChange} />
          </div>
          <Button
            onClick={() => uploadMutation.mutate()}
            disabled={!formData.file || !formData.document_name || uploading}
            className="w-full"
          >
            {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
            Upload Document
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle>Uploaded Documents ({documents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No documents uploaded yet</p>
          ) : (
            <div className="space-y-3">
              {documents.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition">
                  <div className="flex items-center gap-3 flex-1">
                    <FileText className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <div className="font-semibold">{doc.document_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {doc.document_type.replace('_', ' ')} • Uploaded by {doc.uploaded_by}
                      </div>
                      {doc.notes && <p className="text-sm text-muted-foreground mt-1">{doc.notes}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(doc.status)}>
                      {doc.status.replace('_', ' ')}
                    </Badge>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => deleteMutation.mutate(doc.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}