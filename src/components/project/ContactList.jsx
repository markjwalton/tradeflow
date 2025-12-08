import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  Mail,
  Phone,
  Building2,
  Star,
  User,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

const roleColors = {
  Client: "bg-warning/10 text-warning",
  Architect: "bg-info-50 text-info",
  "Structural Engineer": "bg-accent-100 text-accent",
  Supplier: "bg-success-50 text-success",
  Subcontractor: "bg-info-50 text-info",
  Other: "bg-muted text-muted-foreground",
};

const emptyContact = {
  fullName: "",
  email: "",
  phone: "",
  role: "Client",
  organization: "",
  isPrimary: false,
  notes: "",
};

export default function ContactList({ contacts = [], projectId, isLoading }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState(emptyContact);

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ClientContact.create({ ...data, projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts", projectId] });
      toast.success("Contact added");
      handleCloseDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ClientContact.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts", projectId] });
      toast.success("Contact updated");
      handleCloseDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ClientContact.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts", projectId] });
      toast.success("Contact deleted");
    },
  });

  const handleOpenDialog = (contact = null) => {
    if (contact) {
      setEditingContact(contact);
      setFormData({
        fullName: contact.fullName || "",
        email: contact.email || "",
        phone: contact.phone || "",
        role: contact.role || "Client",
        organization: contact.organization || "",
        isPrimary: contact.isPrimary || false,
        notes: contact.notes || "",
      });
    } else {
      setEditingContact(null);
      setFormData(emptyContact);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingContact(null);
    setFormData(emptyContact);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingContact) {
      updateMutation.mutate({ id: editingContact.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Group contacts by role
  const groupedContacts = contacts.reduce((acc, contact) => {
    const role = contact.role || "Other";
    if (!acc[role]) acc[role] = [];
    acc[role].push(contact);
    return acc;
  }, {});

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Contacts</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => handleOpenDialog()}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingContact ? "Edit Contact" : "Add New Contact"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Contact's full name"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+44 7XXX XXX XXX"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Role *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Client">Client</SelectItem>
                      <SelectItem value="Architect">Architect</SelectItem>
                      <SelectItem value="Structural Engineer">Structural Engineer</SelectItem>
                      <SelectItem value="Supplier">Supplier</SelectItem>
                      <SelectItem value="Subcontractor">Subcontractor</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Organization</Label>
                  <Input
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="Company name"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Switch
                  id="isPrimary"
                  checked={formData.isPrimary}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPrimary: checked })}
                />
                <Label htmlFor="isPrimary">Primary Contact</Label>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes about this contact..."
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
                  {editingContact ? "Update" : "Add"}
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
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <User className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p>No contacts added yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedContacts).map(([role, roleContacts]) => (
              <div key={role}>
                <h4 className="text-sm font-medium text-stone-500 mb-2">{role}s</h4>
                <div className="space-y-2">
                  {roleContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="p-4 rounded-lg border border-stone-200 bg-white hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-primary font-medium">
                              {contact.fullName?.charAt(0)?.toUpperCase() || "?"}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-foreground">{contact.fullName}</h4>
                              {contact.isPrimary && (
                                <Star className="h-4 w-4 text-warning fill-warning" />
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <Badge className={roleColors[contact.role]}>{contact.role}</Badge>
                              {contact.organization && (
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Building2 className="h-3 w-3" />
                                  {contact.organization}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-3 mt-2 text-sm">
                              {contact.email && (
                                <a
                                  href={`mailto:${contact.email}`}
                                  className="text-blue-600 hover:underline flex items-center gap-1"
                                >
                                  <Mail className="h-3 w-3" />
                                  {contact.email}
                                </a>
                              )}
                              {contact.phone && (
                                <a
                                  href={`tel:${contact.phone}`}
                                  className="text-stone-600 hover:underline flex items-center gap-1"
                                >
                                  <Phone className="h-3 w-3" />
                                  {contact.phone}
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenDialog(contact)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => deleteMutation.mutate(contact.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}