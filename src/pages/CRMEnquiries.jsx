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
import { Plus, Search, FileText, Calendar } from 'lucide-react';
import { useAllDropdownOptions } from '../components/crm/useDropdownOptions';

export default function CRMEnquiries() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: enquiries = [], isLoading } = useQuery({
    queryKey: ['crmEnquiries'],
    queryFn: () => base44.entities.CRMEnquiry.list('-created_date'),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['crmCustomers'],
    queryFn: () => base44.entities.CRMCustomer.list(),
  });

  const { getOptions, isLoading: optionsLoading } = useAllDropdownOptions();
  const enquiryStatuses = getOptions('Enquiry Statuses');

  const customerMap = customers.reduce((acc, customer) => {
    acc[customer.id] = customer;
    return acc;
  }, {});

  const filteredEnquiries = enquiries.filter((enquiry) => {
    const customer = customerMap[enquiry.customer_id];
    const customerName = customer
      ? `${customer.first_name} ${customer.surname}`.toLowerCase()
      : '';

    const matchesSearch =
      searchTerm === '' ||
      customerName.includes(searchTerm.toLowerCase()) ||
      enquiry.inbound_channel?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || enquiry.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeColor = (status) => {
    const colors = {
      New: 'bg-blue-100 text-blue-800',
      Acknowledged: 'bg-yellow-100 text-yellow-800',
      Assigned: 'bg-purple-100 text-purple-800',
      Qualified: 'bg-green-100 text-green-800',
      Unqualified: 'bg-gray-100 text-gray-800',
      ConvertedToProject: 'bg-emerald-100 text-emerald-800',
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
            <FileText className="h-6 w-6" />
            Enquiries
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage incoming customer enquiries
          </p>
        </div>
        <Link to={createPageUrl('CRMEnquiryForm')}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Enquiry
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search enquiries..."
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
                {enquiryStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredEnquiries.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No enquiries found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter'
                  : 'Get started by creating your first enquiry'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Project Types</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEnquiries.map((enquiry) => {
                  const customer = customerMap[enquiry.customer_id];
                  return (
                    <TableRow key={enquiry.id}>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(enquiry.enquiry_date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {customer
                          ? `${customer.first_name} ${customer.surname}`
                          : 'Unknown'}
                      </TableCell>
                      <TableCell>{enquiry.inbound_channel}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {enquiry.initial_project_types?.slice(0, 2).map((type) => (
                            <Badge key={type} variant="secondary" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                          {enquiry.initial_project_types?.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{enquiry.initial_project_types.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(enquiry.status)}>
                          {enquiry.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link to={createPageUrl('CRMEnquiryDetail') + `?id=${enquiry.id}`}>
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