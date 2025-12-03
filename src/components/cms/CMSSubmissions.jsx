import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
} from "@/components/ui/dialog";
import { Inbox, Eye, Trash2, Loader2, Mail, Check } from "lucide-react";
import { toast } from "sonner";

export default function CMSSubmissions({ tenantId }) {
  const queryClient = useQueryClient();
  const [filterForm, setFilterForm] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ["cmsSubmissions", tenantId],
    queryFn: () => base44.entities.CMSFormSubmission.filter(
      tenantId ? { tenant_id: tenantId } : {},
      "-created_date"
    )
  });

  const { data: forms = [] } = useQuery({
    queryKey: ["cmsForms", tenantId],
    queryFn: () => base44.entities.CMSForm.filter(tenantId ? { tenant_id: tenantId } : {})
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.CMSFormSubmission.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cmsSubmissions"] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CMSFormSubmission.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cmsSubmissions"] });
      toast.success("Submission deleted");
      setSelectedSubmission(null);
    }
  });

  const filteredSubmissions = submissions.filter(sub => {
    if (filterForm !== "all" && sub.form_id !== filterForm) return false;
    if (filterStatus !== "all" && sub.status !== filterStatus) return false;
    return true;
  });

  const statusColors = {
    new: "bg-blue-100 text-blue-700",
    read: "bg-gray-100 text-gray-700",
    archived: "bg-yellow-100 text-yellow-700"
  };

  const handleView = (submission) => {
    setSelectedSubmission(submission);
    if (submission.status === "new") {
      updateMutation.mutate({ id: submission.id, status: "read" });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Inbox className="h-5 w-5" />
          Form Submissions
        </CardTitle>
        <div className="flex gap-2">
          <Select value={filterForm} onValueChange={setFilterForm}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Forms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Forms</SelectItem>
              {forms.map(f => (
                <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="read">Read</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Inbox className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No submissions yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredSubmissions.map(sub => (
              <div 
                key={sub.id} 
                className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-gray-50 ${
                  sub.status === "new" ? "bg-blue-50 border-blue-200" : "bg-white"
                }`}
                onClick={() => handleView(sub)}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{sub.form_name || "Unknown Form"}</h3>
                    <Badge className={statusColors[sub.status]}>{sub.status}</Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(sub.created_date).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                    {Object.entries(sub.data || {}).slice(0, 2).map(([k, v]) => `${k}: ${v}`).join(", ")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* View Dialog */}
      <Dialog open={!!selectedSubmission} onOpenChange={(o) => !o && setSelectedSubmission(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Form</p>
                  <p className="font-medium">{selectedSubmission.form_name}</p>
                </div>
                <Badge className={statusColors[selectedSubmission.status]}>
                  {selectedSubmission.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Submitted</p>
                <p>{new Date(selectedSubmission.created_date).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Data</p>
                <div className="space-y-2 bg-gray-50 p-3 rounded-lg">
                  {Object.entries(selectedSubmission.data || {}).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="font-medium text-gray-700">{key}:</span>
                      <span className="text-gray-600">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between pt-4">
                <div className="flex gap-2">
                  {selectedSubmission.status !== "archived" && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => updateMutation.mutate({ id: selectedSubmission.id, status: "archived" })}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Archive
                    </Button>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-red-500"
                  onClick={() => {
                    if (confirm("Delete this submission?")) {
                      deleteMutation.mutate(selectedSubmission.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}