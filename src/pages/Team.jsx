import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageLoader, ButtonLoader } from "@/components/common/LoadingStates";
import { ErrorRecovery } from "@/components/common/ErrorRecovery";
import { useMutationError } from "@/components/common/MutationErrorToast";
import { Pagination } from "@/components/ui/Pagination";
import { useDebounce } from "@/components/common/useDebounce";
import { useValidatedForm } from "@/components/forms/useValidatedForm";
import { ValidatedInput } from "@/components/forms/ValidatedInput";
import { teamMemberSchema } from "@/components/forms/FormValidation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Pencil, Trash2, Mail, Phone, Calendar, ChevronDown, ChevronRight, Users } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import { PageHeader } from "@/components/sturij";

const availabilityColors = {
  available: "bg-success-50 text-success",
  busy: "bg-warning/10 text-warning",
  on_leave: "bg-info-50 text-info",
  unavailable: "bg-destructive-50 text-destructive",
};

export default function Team() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [filterAvailability, setFilterAvailability] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});
  
  const form = useValidatedForm(teamMemberSchema, {
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "",
      skills: [],
      availability: "available",
    }
  });

  const { data: teamMembers = [], isLoading, error, refetch } = useQuery({
    queryKey: ["teamMembers"],
    queryFn: () => base44.entities.TeamMember.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.TeamMember.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teamMembers"] });
      setShowForm(false);
      form.reset();
      toast.success("Team member added successfully");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TeamMember.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teamMembers"] });
      setShowForm(false);
      setEditingMember(null);
      form.reset();
      toast.success("Team member updated successfully");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.TeamMember.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teamMembers"] });
      toast.success("Team member removed successfully");
    },
  });

  useMutationError(createMutation, { customMessage: "Failed to add team member" });
  useMutationError(updateMutation, { customMessage: "Failed to update team member" });
  useMutationError(deleteMutation, { customMessage: "Failed to remove team member" });

  const handleEdit = (member) => {
    setEditingMember(member);
    form.reset({
      name: member.name || "",
      email: member.email || "",
      phone: member.phone || "",
      role: member.role || "",
      skills: member.skills || [],
      availability: member.availability || "available",
    });
    setShowForm(true);
  };

  const onSubmit = (data) => {
    if (editingMember) {
      updateMutation.mutate({ id: editingMember.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredMembers = teamMembers.filter((m) => {
    const matchesSearch = 
      m.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      m.role?.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesAvailability = filterAvailability === "all" || m.availability === filterAvailability;
    return matchesSearch && matchesAvailability;
  });

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Group members by availability
  const groupedMembers = paginatedMembers.reduce((acc, member) => {
    const groupKey = member.availability || "available";
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(member);
    return acc;
  }, {});

  if (isLoading) {
    return <PageLoader message="Loading team members..." />;
  }

  if (error) {
    return <ErrorRecovery error={error} onRetry={refetch} />;
  }

  return (
    <div className="max-w-7xl mx-auto -mt-6 min-h-screen">
      <PageHeader 
        title="Team"
        description="Manage team members and availability"
      />

      <Card className="border-border mb-4">
        <CardContent className="px-2 py-1">
          <div className="flex gap-2">
            <Button 
              variant="ghost"
              className="hover:bg-[#e9efeb] hover:text-[#273e2d]"
              onClick={() => { form.reset(); setEditingMember(null); setShowForm(true); }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Team Member
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4 sm:mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search team members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterAvailability} onValueChange={setFilterAvailability}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Availability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="busy">Busy</SelectItem>
            <SelectItem value="on_leave">On Leave</SelectItem>
            <SelectItem value="unavailable">Unavailable</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border">
        <CardContent className="p-4">
          <div className="space-y-4">
            {Object.entries(groupedMembers).map(([groupName, groupMembers]) => {
              const isExpanded = expandedGroups[groupName] === true;
              const displayName = groupName.replace("_", " ");
              return (
                <Collapsible
                  key={groupName}
                  open={isExpanded}
                  onOpenChange={() => setExpandedGroups(prev => ({ ...prev, [groupName]: !isExpanded }))}
                >
                  <Card className="border-border">
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            <h3 className="font-medium capitalize">{displayName}</h3>
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0 space-y-2">
                        {groupMembers.map((member) => {
                          const holidaysRemaining = (member.annual_holiday_days || 25) - (member.holidays_used || 0);
                          return (
                            <Card key={member.id} className="border-border hover:shadow-sm transition-shadow">
                              <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                  <Users className="h-5 w-5 text-info flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h3 className="font-medium text-base">{member.name}</h3>
                                      <Badge className={availabilityColors[member.availability]}>
                                        {member.availability?.replace("_", " ")}
                                      </Badge>
                                    </div>
                                    {member.role && (
                                      <p className="text-sm text-muted-foreground mb-2">{member.role}</p>
                                    )}
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                      {member.email && (
                                        <span className="flex items-center gap-1">
                                          <Mail className="h-3 w-3" />{member.email}
                                        </span>
                                      )}
                                      {member.phone && (
                                        <span className="flex items-center gap-1">
                                          <Phone className="h-3 w-3" />{member.phone}
                                        </span>
                                      )}
                                      <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />{holidaysRemaining} days
                                      </span>
                                    </div>
                                    {member.skills?.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {member.skills.slice(0, 3).map((skill) => (
                                          <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex gap-1 flex-shrink-0">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleEdit(member)}
                                      title="Edit"
                                    >
                                      <Pencil className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-destructive hover:text-destructive"
                                      onClick={() => deleteMutation.mutate(member.id)}
                                      title="Delete"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })}
          </div>

          {filteredMembers.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No team members found. Add your first team member to get started.
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingMember ? "Edit Team Member" : "Add Team Member"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ValidatedInput
              label="Name"
              required
              error={form.getError("name")}
              {...form.register("name")}
            />

            <div className="grid grid-cols-2 gap-4">
              <ValidatedInput
                label="Email"
                type="email"
                required
                error={form.getError("email")}
                {...form.register("email")}
              />
              <ValidatedInput
                label="Phone"
                type="tel"
                error={form.getError("phone")}
                {...form.register("phone")}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ValidatedInput
                label="Role"
                required
                placeholder="e.g., Designer, Carpenter"
                error={form.getError("role")}
                {...form.register("role")}
              />
              <div>
                <label className="text-sm font-medium">Availability</label>
                <Select {...form.register("availability")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="busy">Busy</SelectItem>
                    <SelectItem value="on_leave">On Leave</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button className="w-full" type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) && <ButtonLoader />}
              {editingMember ? "Update Member" : "Add Member"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}