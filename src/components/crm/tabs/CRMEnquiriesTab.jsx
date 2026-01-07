import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, FileText, Calendar } from 'lucide-react';
import { useAllDropdownOptions } from '../useDropdownOptions';
import CRMPagination, { usePagination } from '../CRMPagination';
import { CRMCard, CRMCardContent, CRMCardHeader } from '../CRMUI';

export default function CRMEnquiriesTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');

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
  const inboundChannels = getOptions('Inbound Channels');

  const customerMap = customers.reduce((acc, customer) => {
    acc[customer.id] = customer;
    return acc;
  }, {});

  // Create customer-enquiry rows (all customers, with or without enquiries)
  const customerEnquiryRows = customers.map(customer => {
    const customerEnquiries = enquiries.filter(e => e.customer_id === customer.id);
    
    if (customerEnquiries.length > 0) {
      // Return enquiries for this customer
      return customerEnquiries.map(enquiry => ({
        ...enquiry,
        customer,
        hasEnquiry: true
      }));
    } else {
      // Return customer without enquiry
      return [{
        id: `customer-${customer.id}`,
        customer_id: customer.id,
        customer,
        hasEnquiry: false,
        enquiry_date: customer.created_date,
        status: 'NoEnquiry'
      }];
    }
  }).flat();

  const filteredEnquiries = customerEnquiryRows.filter((row) => {
    const customerName = `${row.customer.first_name} ${row.customer.surname}`.toLowerCase();

    const matchesSearch =
      searchTerm === '' ||
      customerName.includes(searchTerm.toLowerCase()) ||
      row.inbound_channel?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || row.status === statusFilter;
    const matchesChannel = channelFilter === 'all' || row.inbound_channel === channelFilter;

    return matchesSearch && matchesStatus && matchesChannel;
  });

  const sortedEnquiries = [...filteredEnquiries].sort((a, b) => {
    // Customers without enquiries go last
    if (!a.hasEnquiry && b.hasEnquiry) return 1;
    if (a.hasEnquiry && !b.hasEnquiry) return -1;
    
    if (a.status === 'New' && b.status !== 'New') return -1;
    if (a.status !== 'New' && b.status === 'New') return 1;
    return new Date(b.enquiry_date || b.customer.created_date) - new Date(a.enquiry_date || a.customer.created_date);
  });

  const pagination = usePagination(sortedEnquiries, 25);

  const stats = {
    total: enquiries.length,
    new: enquiries.filter((e) => e.status === 'New').length,
    qualified: enquiries.filter((e) => e.status === 'Qualified').length,
    converted: enquiries.filter((e) => e.status === 'ConvertedToProject').length,
  };

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
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <CRMCard>
          <CRMCardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total Enquiries</p>
          </CRMCardContent>
        </CRMCard>
        <CRMCard className="border border-[var(--primary-200)] bg-[var(--primary-50)]">
          <CRMCardContent className="pt-4">
            <div className="text-2xl font-bold text-[var(--primary-700)]">{stats.new}</div>
            <p className="text-sm text-[var(--primary-600)]">New</p>
          </CRMCardContent>
        </CRMCard>
        <CRMCard className="border border-[var(--secondary-200)] bg-[var(--secondary-50)]">
          <CRMCardContent className="pt-4">
            <div className="text-2xl font-bold text-[var(--secondary-700)]">{stats.qualified}</div>
            <p className="text-sm text-[var(--secondary-600)]">Qualified</p>
          </CRMCardContent>
        </CRMCard>
        <CRMCard className="border border-[var(--accent-200)] bg-[var(--accent-50)]">
          <CRMCardContent className="pt-4">
            <div className="text-2xl font-bold text-[var(--accent-700)]">{stats.converted}</div>
            <p className="text-sm text-[var(--accent-600)]">Converted</p>
          </CRMCardContent>
        </CRMCard>
      </div>

      <CRMCard>
        <CRMCardHeader className="pb-4 flex flex-row items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search enquiries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Channels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                {inboundChannels.map((channel) => (
                  <SelectItem key={channel.value} value={channel.value}>
                    {channel.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
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
          <Link to={createPageUrl('CRMEnquiryForm')}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Enquiry
            </Button>
          </Link>
        </CRMCardHeader>
        <CRMCardContent>
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
            <>
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
                  {pagination.paginatedItems.map((enquiry) => {
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
                          <Link
                            to={createPageUrl('CRMCustomerDetail') + `?id=${enquiry.customer_id}`}
                            className="hover:underline text-primary"
                          >
                            {customer
                              ? `${customer.first_name} ${customer.surname}`
                              : 'Unknown'}
                          </Link>
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
              {sortedEnquiries.length > 10 && (
                <CRMPagination {...pagination} />
              )}
            </>
          )}
        </CRMCardContent>
      </CRMCard>
    </div>
  );
}