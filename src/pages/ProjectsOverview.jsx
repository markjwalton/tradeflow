import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FolderKanban,
  Plus,
  Search,
  MapPin,
  Calendar,
  User,
  AlertTriangle,
  Filter
} from "lucide-react";
import { format } from "date-fns";

export default function ProjectsOverview() {
  const urlParams = new URLSearchParams(window.location.search);
  const customerIdParam = urlParams.get("customer");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [customerFilter, setCustomerFilter] = useState(customerIdParam || "all");
  const [sortBy, setSortBy] = useState("created_date");

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => base44.entities.Project.list("-created_date", 100),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: () => base44.entities.Customer.list("name", 200),
  });

  const getCustomerName = (customerId) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer?.name || null;
  };

  const filteredProjects = projects.filter((project) => {
    const customerName = getCustomerName(project.customerId);
    const matchesSearch =
      project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.projectRef?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    const matchesType = typeFilter === "all" || project.projectType === typeFilter;
    const matchesCustomer = customerFilter === "all" || project.customerId === customerFilter;

    return matchesSearch && matchesStatus && matchesType && matchesCustomer;
  });

  // Sort projects
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return (a.name || "").localeCompare(b.name || "");
      case "client":
        return (a.clientName || "").localeCompare(b.clientName || "");
      case "deadline":
        if (!a.estimatedEndDate) return 1;
        if (!b.estimatedEndDate) return -1;
        return new Date(a.estimatedEndDate) - new Date(b.estimatedEndDate);
      case "budget":
        return (b.budget || 0) - (a.budget || 0);
      default:
        return new Date(b.created_date) - new Date(a.created_date);
    }
  });

  const statusColors = {
    Planning: "bg-info-50 text-info border-primary/20",
    Active: "bg-success-50 text-success border-success/20",
    "On Hold": "bg-warning/10 text-warning border-warning/20",
    Completed: "bg-muted text-muted-foreground border-border",
    Archived: "bg-muted text-muted-foreground border-border",
  };

  const typeColors = {
    "New Build": "bg-info-50 text-info",
    Extension: "bg-accent-100 text-accent",
    Renovation: "bg-accent-200 text-accent",
    Conservation: "bg-warning/10 text-warning",
    Commercial: "bg-info-50 text-info",
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground mt-1">Manage all your construction projects</p>
        </div>
        <Link to={createPageUrl("ProjectForm")}>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, client, reference, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Planning">Planning</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="New Build">New Build</SelectItem>
                  <SelectItem value="Extension">Extension</SelectItem>
                  <SelectItem value="Renovation">Renovation</SelectItem>
                  <SelectItem value="Conservation">Conservation</SelectItem>
                  <SelectItem value="Commercial">Commercial</SelectItem>
                </SelectContent>
              </Select>
              <Select value={customerFilter} onValueChange={setCustomerFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_date">Newest First</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="client">Client A-Z</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="budget">Budget (High)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-6 w-3/4 mb-3" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sortedProjects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FolderKanban className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Get started by creating your first project"}
            </p>
            <Link to={createPageUrl("ProjectForm")}>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedProjects.map((project) => (
            <Link
              key={project.id}
              to={createPageUrl(`ProjectDetails?id=${project.id}`)}
            >
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-warning">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground truncate">
                          {project.name}
                        </h3>
                        {project.isHighPriority && (
                          <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
                        )}
                      </div>
                      {project.projectRef && (
                        <p className="text-xs text-muted-foreground font-mono">
                          {project.projectRef}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className={`${statusColors[project.status]} border`}>
                      {project.status}
                    </Badge>
                    {project.projectType && (
                      <Badge className={typeColors[project.projectType]}>
                        {project.projectType}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{getCustomerName(project.customerId) || project.clientName}</span>
                    </div>
                    {project.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{project.location}</span>
                      </div>
                    )}
                    {project.estimatedEndDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          Due {format(new Date(project.estimatedEndDate), "MMM d, yyyy")}
                        </span>
                      </div>
                    )}
                  </div>

                  {project.budget && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Budget</span>
                        <span className="font-semibold text-foreground">
                          £{project.budget.toLocaleString()}
                        </span>
                      </div>
                      {project.currentSpend !== undefined && project.currentSpend !== null && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>Spent</span>
                            <span>£{project.currentSpend.toLocaleString()}</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                (project.currentSpend / project.budget) > 0.9
                                  ? "bg-destructive"
                                  : (project.currentSpend / project.budget) > 0.7
                                  ? "bg-warning"
                                  : "bg-success"
                              }`}
                              style={{
                                width: `${Math.min(100, (project.currentSpend / project.budget) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}