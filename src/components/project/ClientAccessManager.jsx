import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
  Copy,
  Trash2,
  ExternalLink,
  Loader2,
  Users
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const generateToken = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

export default function ClientAccessManager({ projectId }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    clientEmail: "",
    clientName: "",
    canViewTasks: true,
    canViewDocuments: true,
    canViewSiteVisits: true,
    canViewBudget: false,
    expiresAt: "",
  });

  const queryClient = useQueryClient();

  const { data: accessList = [], isLoading } = useQuery({
    queryKey: ["clientAccess", projectId],
    queryFn: () => base44.entities.ClientAccess.filter({ projectId }),
    enabled: !!projectId,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ClientAccess.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientAccess", projectId] });
      toast.success("Client access created");
      handleCloseDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ClientAccess.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientAccess", projectId] });
      toast.success("Access revoked");
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }) => base44.entities.ClientAccess.update(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientAccess", projectId] });
      toast.success("Access updated");
    },
  });

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormData({
      clientEmail: "",
      clientName: "",
      canViewTasks: true,
      canViewDocuments: true,
      canViewSiteVisits: true,
      canViewBudget: false,
      expiresAt: "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      projectId,
      accessToken: generateToken(),
      isActive: true,
    });
  };

  const copyPortalLink = (token) => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/ClientPortal?token=${token}`;
    navigator.clipboard.writeText(link);
    toast.success("Portal link copied to clipboard");
  };

  const isSubmitting = createMutation.isPending;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Client Portal Access</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Grant Access
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Grant Client Portal Access</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Client Name *</Label>
                <Input
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  placeholder="John Smith"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Client Email *</Label>
                <Input
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                  placeholder="client@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Access Expires</Label>
                <Input
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                />
              </div>
              <div className="space-y-3">
                <Label>Permissions</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">View Tasks</span>
                    <Switch
                      checked={formData.canViewTasks}
                      onCheckedChange={(checked) => setFormData({ ...formData, canViewTasks: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">View Documents</span>
                    <Switch
                      checked={formData.canViewDocuments}
                      onCheckedChange={(checked) => setFormData({ ...formData, canViewDocuments: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">View Site Visits</span>
                    <Switch
                      checked={formData.canViewSiteVisits}
                      onCheckedChange={(checked) => setFormData({ ...formData, canViewSiteVisits: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">View Budget</span>
                    <Switch
                      checked={formData.canViewBudget}
                      onCheckedChange={(checked) => setFormData({ ...formData, canViewBudget: checked })}
                    />
                  </div>
                </div>
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
                  Create Access
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">Loading...</div>
        ) : accessList.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No client access granted yet</p>
            <p className="text-sm text-muted-foreground">Grant access to allow clients to view project progress</p>
          </div>
        ) : (
          <div className="space-y-3">
            {accessList.map((access) => (
              <div
                key={access.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{access.clientName}</span>
                    <Badge variant={access.isActive ? "default" : "secondary"}>
                      {access.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{access.clientEmail}</p>
                  {access.expiresAt && (
                    <p className="text-xs text-muted-foreground">
                      Expires {format(new Date(access.expiresAt), "MMM d, yyyy")}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyPortalLink(access.accessToken)}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy Link
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          const baseUrl = window.location.origin;
                          window.open(`${baseUrl}/ClientPortal?token=${access.accessToken}`, "_blank");
                        }}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open Portal
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => toggleActiveMutation.mutate({ id: access.id, isActive: !access.isActive })}
                      >
                        {access.isActive ? "Deactivate" : "Activate"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => deleteMutation.mutate(access.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Revoke Access
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}