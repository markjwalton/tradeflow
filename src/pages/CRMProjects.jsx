import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, FolderOpen, Calendar, Plus, MapPin } from 'lucide-react';
import { useAllDropdownOptions } from '../components/crm/useDropdownOptions';

export default function CRMProjects() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['crmProjects'],
    queryFn: () => base44.entities.CRMProject.list('-created_date'),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['crmCustomers'],
    queryFn: () => base44.entities.CRMCustomer.list(),
  });

  const { data: addresses = [] } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => base44.entities.Address.list(),
  });

  const addressMap = addresses.reduce((acc, addr) => {
    acc[addr.id] = addr;
    return acc;
  }, {});

  const { getOptions, isLoading: optionsLoading } = useAllDropdownOptions();
  const projectStatuses = getOptions('Project Statuses');

  const customerMap = customers.reduce((acc, customer) => {
    acc[customer.id] = customer;
    return acc;
  }, {});

  const filteredProjects = projects.filter((project) => {
    const customer = customerMap[project.customer_id];
    const customerName = customer
      ? `${customer.first_name} ${customer.surname}`.toLowerCase()
      : '';

    const matchesSearch =
      searchTerm === '' ||
      customerName.includes(searchTerm.toLowerCase()) ||
      project.project_scope_types?.some((t) =>
        t.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeColor = (status) => {
    const colors = {
      New: 'bg-blue-100 text-blue-800',
      Discovery: 'bg-cyan-100 text-cyan-800',
      DesignInProgress: 'bg-purple-100 text-purple-800',
      Quoted: 'bg-yellow-100 text-yellow-800',
      Approved: 'bg-green-100 text-green-800',
      Manufacturing: 'bg-orange-100 text-orange-800',
      Installation: 'bg-indigo-100 text-indigo-800',
      Completed: 'bg-emerald-100 text-emerald-800',
      Cancelled: 'bg-red-100 text-red-800',
      OnHold: 'bg-amber-100 text-amber-800',
      Archived: 'bg-slate-100 text-slate-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading || optionsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <FolderOpen className="h-6 w-6" />
            Projects
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your customer projects
          </p>
        </div>
        <Link to={createPageUrl('CRMProjectForm')}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {projectStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No projects found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter'
                  : 'Projects are created by converting qualified enquiries'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Created</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead>Rooms</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => {
                  const customer = customerMap[project.customer_id];
                  const totalRooms =
                    (project.bedrooms_qty || 0) +
                    (project.kitchens_qty || 0) +
                    (project.bathrooms_qty || 0) +
                    (project.living_rooms_qty || 0);

                  return (
                    <TableRow key={project.id}>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(project.created_date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <Link
                          to={createPageUrl('CRMCustomerDetail') + `?id=${project.customer_id}`}
                          className="hover:underline text-primary"
                        >
                          {customer
                            ? `${customer.first_name} ${customer.surname}`
                            : 'Unknown'}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {addressMap[project.project_address_id] && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>
                              {addressMap[project.project_address_id].city}
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {project.project_scope_types?.slice(0, 2).map((type) => (
                            <Badge key={type} variant="secondary" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                          {project.project_scope_types?.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{project.project_scope_types.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {totalRooms > 0 ? `${totalRooms} rooms` : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(project.status)}>
                          {project.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link to={createPageUrl('CRMProjectDetail') + `?id=${project.id}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}