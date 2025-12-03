import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle2, XCircle, Eye, Edit, Trash2, ArrowUp, Sparkles,
  BarChart3, Info, Zap, Table, PieChart, Settings
} from "lucide-react";
import { toast } from "sonner";
import WidgetRenderer from "./WidgetRenderer";
import WidgetConfigEditor from "./WidgetConfigEditor";

const widgetTypeIcons = {
  stat_card: BarChart3,
  info_card: Info,
  quick_action: Zap,
  ai_insight: Sparkles,
  chart: PieChart,
  table: Table
};

const statusColors = {
  draft: "bg-gray-100 text-gray-700",
  staging: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  published: "bg-blue-100 text-blue-700"
};

export default function WidgetStaging({ widgets = [], onEdit }) {
  const queryClient = useQueryClient();
  const [previewWidget, setPreviewWidget] = useState(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [configWidget, setConfigWidget] = useState(null);

  const stagingWidgets = widgets.filter(w => 
    ["draft", "staging", "approved"].includes(w.status)
  );

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.DashboardWidget.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboardWidgets"] });
      toast.success("Widget updated");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.DashboardWidget.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboardWidgets"] });
      toast.success("Widget deleted");
    }
  });

  const handleApprove = (widget) => {
    setSelectedWidget(widget);
    setApprovalNotes("");
    setShowApproveDialog(true);
  };

  const confirmApproval = () => {
    if (!selectedWidget) return;

    const newVersion = (selectedWidget.version || 1) + (selectedWidget.status === "approved" ? 1 : 0);
    const versionHistory = selectedWidget.version_history || [];
    
    if (selectedWidget.status === "staging") {
      // Move to approved
      updateMutation.mutate({
        id: selectedWidget.id,
        data: { status: "approved" }
      });
    } else if (selectedWidget.status === "approved") {
      // Publish with version increment
      versionHistory.push({
        version: newVersion,
        config: selectedWidget.config,
        changed_date: new Date().toISOString(),
        notes: approvalNotes || "Published"
      });

      updateMutation.mutate({
        id: selectedWidget.id,
        data: {
          status: "published",
          version: newVersion,
          version_history: versionHistory
        }
      });
    }

    setShowApproveDialog(false);
    setSelectedWidget(null);
  };

  const handleReject = (widget) => {
    updateMutation.mutate({
      id: widget.id,
      data: { status: "draft" }
    });
  };

  const handleStage = (widget) => {
    updateMutation.mutate({
      id: widget.id,
      data: { status: "staging" }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Widget Staging Area</h2>
        <Badge variant="secondary">{stagingWidgets.length} pending</Badge>
      </div>

      {stagingWidgets.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>No widgets in staging</p>
            <p className="text-sm mt-1">Create or AI-generate widgets to test here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stagingWidgets.map(widget => {
            const Icon = widgetTypeIcons[widget.widget_type] || Info;
            return (
              <Card key={widget.id} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-gray-500" />
                      <CardTitle className="text-base">{widget.name}</CardTitle>
                    </div>
                    <Badge className={statusColors[widget.status]}>
                      {widget.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">{widget.description}</p>
                  {widget.ai_generated && (
                    <div className="flex items-center gap-1 text-xs text-purple-600 mt-1">
                      <Sparkles className="h-3 w-3" />
                      AI Generated
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {/* Preview area */}
                  <div 
                    className="border rounded-lg p-2 mb-3 cursor-pointer hover:bg-gray-50"
                    onClick={() => setPreviewWidget(widget)}
                  >
                    <div className="transform scale-75 origin-top-left">
                      <WidgetRenderer widget={widget} />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {widget.status === "draft" && (
                      <Button size="sm" onClick={() => handleStage(widget)} className="flex-1">
                        <ArrowUp className="h-3 w-3 mr-1" />
                        Stage
                      </Button>
                    )}
                    {widget.status === "staging" && (
                      <>
                        <Button size="sm" onClick={() => handleApprove(widget)} className="flex-1 bg-green-600 hover:bg-green-700">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleReject(widget)}>
                          <XCircle className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                    {widget.status === "approved" && (
                      <Button size="sm" onClick={() => handleApprove(widget)} className="flex-1 bg-blue-600 hover:bg-blue-700">
                        <ArrowUp className="h-3 w-3 mr-1" />
                        Publish
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => setPreviewWidget(widget)}>
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setConfigWidget(widget)} title="Settings">
                      <Settings className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => onEdit?.(widget)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-500" onClick={() => deleteMutation.mutate(widget.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewWidget} onOpenChange={() => setPreviewWidget(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Widget Preview: {previewWidget?.name}</DialogTitle>
          </DialogHeader>
          {previewWidget && (
            <div className="p-4">
              <WidgetRenderer widget={previewWidget} />
              {previewWidget.ai_reasoning && (
                <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-800">
                    <strong>AI Reasoning:</strong> {previewWidget.ai_reasoning}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedWidget?.status === "staging" ? "Approve Widget" : "Publish Widget"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {selectedWidget?.status === "staging"
                ? "Approving will mark this widget as ready for publishing."
                : "Publishing will make this widget available in the library for all dashboards."}
            </p>
            {selectedWidget?.status === "approved" && (
              <div>
                <label className="text-sm font-medium">Version Notes</label>
                <Textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="What's new in this version?"
                  rows={2}
                />
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowApproveDialog(false)}>Cancel</Button>
              <Button onClick={confirmApproval}>
                {selectedWidget?.status === "staging" ? "Approve" : "Publish"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Config Editor Dialog */}
      <WidgetConfigEditor
        widget={configWidget}
        isOpen={!!configWidget}
        onClose={() => setConfigWidget(null)}
        onSave={(updatedWidget) => {
          updateMutation.mutate({
            id: updatedWidget.id,
            data: { config: updatedWidget.config }
          });
          setConfigWidget(null);
        }}
      />
    </div>
  );
}