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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Plus,
  Pencil,
  Trash2,
  MapPin,
  Calendar,
  User,
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  Wind,
  CheckCircle2,
  AlertCircle,
  Upload,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const weatherIcons = {
  Clear: Sun,
  Cloudy: Cloud,
  Rain: CloudRain,
  Snow: CloudSnow,
  Windy: Wind,
};

const emptyReport = {
  visitDate: format(new Date(), "yyyy-MM-dd"),
  visitedBy: "",
  weather: "Clear",
  notes: "",
  progressSummary: "",
  issuesIdentified: "",
  attendees: [],
  actionItems: [],
  photos: [],
};

export default function SiteVisitList({ reports = [], projectId, isLoading }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [formData, setFormData] = useState(emptyReport);
  const [attendeeInput, setAttendeeInput] = useState("");
  const [actionInput, setActionInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.SiteVisitReport.create({ ...data, projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["siteVisits", projectId] });
      toast.success("Site visit report created");
      handleCloseDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SiteVisitReport.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["siteVisits", projectId] });
      toast.success("Report updated");
      handleCloseDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SiteVisitReport.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["siteVisits", projectId] });
      toast.success("Report deleted");
    },
  });

  const handleOpenDialog = (report = null) => {
    if (report) {
      setEditingReport(report);
      setFormData({
        visitDate: report.visitDate || format(new Date(), "yyyy-MM-dd"),
        visitedBy: report.visitedBy || "",
        weather: report.weather || "Clear",
        notes: report.notes || "",
        progressSummary: report.progressSummary || "",
        issuesIdentified: report.issuesIdentified || "",
        attendees: report.attendees || [],
        actionItems: report.actionItems || [],
        photos: report.photos || [],
      });
    } else {
      setEditingReport(null);
      setFormData(emptyReport);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingReport(null);
    setFormData(emptyReport);
    setAttendeeInput("");
    setActionInput("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingReport) {
      updateMutation.mutate({ id: editingReport.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleAddAttendee = () => {
    if (attendeeInput.trim()) {
      setFormData({
        ...formData,
        attendees: [...formData.attendees, attendeeInput.trim()],
      });
      setAttendeeInput("");
    }
  };

  const handleRemoveAttendee = (index) => {
    setFormData({
      ...formData,
      attendees: formData.attendees.filter((_, i) => i !== index),
    });
  };

  const handleAddAction = () => {
    if (actionInput.trim()) {
      setFormData({
        ...formData,
        actionItems: [...formData.actionItems, actionInput.trim()],
      });
      setActionInput("");
    }
  };

  const handleRemoveAction = (index) => {
    setFormData({
      ...formData,
      actionItems: formData.actionItems.filter((_, i) => i !== index),
    });
  };

  const handlePhotoUpload = async (e) => {
    const files = e.target.files;
    if (files.length === 0) return;

    setIsUploading(true);
    const uploadedUrls = [];

    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      uploadedUrls.push(file_url);
    }

    setFormData({
      ...formData,
      photos: [...formData.photos, ...uploadedUrls],
    });
    setIsUploading(false);
  };

  const handleRemovePhoto = (index) => {
    setFormData({
      ...formData,
      photos: formData.photos.filter((_, i) => i !== index),
    });
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Sort reports by date (newest first)
  const sortedReports = [...reports].sort(
    (a, b) => new Date(b.visitDate) - new Date(a.visitDate)
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Site Visit Reports</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => handleOpenDialog()}
            >
              <Plus className="h-4 w-4 mr-1" />
              New Report
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingReport ? "Edit Site Visit Report" : "New Site Visit Report"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Visit Date *</Label>
                  <Input
                    type="date"
                    value={formData.visitDate}
                    onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Visited By *</Label>
                  <Input
                    value={formData.visitedBy}
                    onChange={(e) => setFormData({ ...formData, visitedBy: e.target.value })}
                    placeholder="Your name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Weather Conditions</Label>
                <Select
                  value={formData.weather}
                  onValueChange={(value) => setFormData({ ...formData, weather: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Clear">Clear</SelectItem>
                    <SelectItem value="Cloudy">Cloudy</SelectItem>
                    <SelectItem value="Rain">Rain</SelectItem>
                    <SelectItem value="Snow">Snow</SelectItem>
                    <SelectItem value="Windy">Windy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Attendees */}
              <div className="space-y-2">
                <Label>Attendees</Label>
                <div className="flex gap-2">
                  <Input
                    value={attendeeInput}
                    onChange={(e) => setAttendeeInput(e.target.value)}
                    placeholder="Add attendee name"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddAttendee())}
                  />
                  <Button type="button" variant="outline" onClick={handleAddAttendee}>
                    Add
                  </Button>
                </div>
                {formData.attendees.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.attendees.map((attendee, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => handleRemoveAttendee(index)}
                      >
                        {attendee} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Progress Summary</Label>
                <Textarea
                  value={formData.progressSummary}
                  onChange={(e) => setFormData({ ...formData, progressSummary: e.target.value })}
                  placeholder="Summarize overall project progress observed..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Notes & Observations</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Detailed observations, discussions, decisions..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Issues Identified</Label>
                <Textarea
                  value={formData.issuesIdentified}
                  onChange={(e) => setFormData({ ...formData, issuesIdentified: e.target.value })}
                  placeholder="Any issues or concerns identified..."
                  rows={2}
                />
              </div>

              {/* Action Items */}
              <div className="space-y-2">
                <Label>Action Items</Label>
                <div className="flex gap-2">
                  <Input
                    value={actionInput}
                    onChange={(e) => setActionInput(e.target.value)}
                    placeholder="Add action item"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddAction())}
                  />
                  <Button type="button" variant="outline" onClick={handleAddAction}>
                    Add
                  </Button>
                </div>
                {formData.actionItems.length > 0 && (
                  <div className="space-y-1 mt-2">
                    {formData.actionItems.map((action, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-muted/50 rounded"
                      >
                        <span className="text-sm">{action}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAction(index)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Photos */}
              <div className="space-y-2">
                <Label>Photos</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-4">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="cursor-pointer flex flex-col items-center text-muted-foreground"
                  >
                    {isUploading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <>
                        <Upload className="h-6 w-6 mb-1" />
                        <span className="text-sm">Click to upload photos</span>
                      </>
                    )}
                  </label>
                </div>
                {formData.photos.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {formData.photos.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Photo ${index + 1}`}
                          className="h-20 w-full object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(index)}
                          className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
                  {editingReport ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : sortedReports.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MapPin className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p>No site visit reports yet</p>
          </div>
        ) : (
          <Accordion type="single" collapsible className="space-y-2">
            {sortedReports.map((report) => {
              const WeatherIcon = weatherIcons[report.weather] || Sun;
              return (
                <AccordionItem
                  key={report.id}
                  value={report.id}
                  className="border border-border rounded-lg px-4"
                >
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-4 text-left">
                      <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {format(new Date(report.visitDate), "MMMM d, yyyy")}
                          </span>
                          <WeatherIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>{report.visitedBy}</span>
                          {report.attendees?.length > 0 && (
                            <span>+ {report.attendees.length} attendees</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="space-y-4">
                      {report.progressSummary && (
                        <div>
                          <h5 className="text-sm font-medium text-secondary mb-1">Progress Summary</h5>
                          <p className="text-sm text-muted-foreground">{report.progressSummary}</p>
                        </div>
                      )}

                      {report.notes && (
                        <div>
                          <h5 className="text-sm font-medium text-secondary mb-1">Notes</h5>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.notes}</p>
                        </div>
                      )}

                      {report.issuesIdentified && (
                        <div>
                          <h5 className="text-sm font-medium text-destructive-700 mb-1 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            Issues Identified
                          </h5>
                          <p className="text-sm text-muted-foreground">{report.issuesIdentified}</p>
                        </div>
                      )}

                      {report.actionItems?.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-secondary mb-2">Action Items</h5>
                          <ul className="space-y-1">
                            {report.actionItems.map((action, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <span>{action}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {report.photos?.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-secondary mb-2">Photos</h5>
                          <div className="grid grid-cols-4 gap-2">
                            {report.photos.map((url, index) => (
                              <a
                                key={index}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <img
                                  src={url}
                                  alt={`Photo ${index + 1}`}
                                  className="h-20 w-full object-cover rounded hover:opacity-80 transition-opacity"
                                />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end gap-2 pt-2 border-t border-border">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(report)}
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive/90"
                          onClick={() => deleteMutation.mutate(report.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}