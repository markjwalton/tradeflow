import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Users, Phone, Mail, MapPin } from 'lucide-react';
import { useAllDropdownOptions } from '../components/crm/useDropdownOptions';
import CRMPagination, { usePagination } from '../components/crm/CRMPagination';

export default function CRMCustomers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['crmCustomers'],
    queryFn: () => base44.entities.CRMCustomer.list('-created_date'),
  });

  const { getOptions, isLoading: optionsLoading } = useAllDropdownOptions();
  const customerTypes = getOptions('Customer Types');

  const { data: addresses = [] } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => base44.entities.Address.list(),
  });

  const addressMap = addresses.reduce((acc, addr) => {
    acc[addr.id] = addr;
    return acc;
  }, {});

  const filteredCustomers = customers.filter((customer) => {
    const address = addressMap[customer.primary_address_id];
    const addressString = address
      ? `${address.street} ${address.city} ${address.post_code}`.toLowerCase()
      : '';

    const matchesSearch =
      searchTerm === '' ||
      customer.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.surname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.customer_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.mobile?.includes(searchTerm) ||
      addressString.includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || customer.customer_type === typeFilter;

    return matchesSearch && matchesType;
  });

  const pagination = usePagination(filteredCustomers, 25);

  const getTypeBadgeColor = (type) => {
    const colors = {
      Retail: 'bg-blue-100 text-blue-800',
      Trade: 'bg-green-100 text-green-800',
      Commercial: 'bg-purple-100 text-purple-800',
      Ecommerce: 'bg-orange-100 text-orange-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
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
            <Users className="h-6 w-6" />
            Customers
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your customer database
          </p>
        </div>
        <Link to={createPageUrl('CRMCustomerForm')}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Customer
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {customerTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No customers found</h3>
              <p className="text-muted-foreground">
                {searchTerm || typeFilter !== 'all'
                  ? 'Try adjusting your search or filter'
                  : 'Get started by adding your first customer'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer #</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagination.paginatedItems.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-mono text-sm">
                      {customer.customer_number}
                    </TableCell>
                    <TableCell className="font-medium">
                      {customer.first_name} {customer.surname}
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeBadgeColor(customer.customer_type)}>
                        {customer.customer_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-sm">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {customer.email_address}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {customer.mobile}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {addressMap[customer.primary_address_id] && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>
                            {addressMap[customer.primary_address_id].city},{' '}
                            {addressMap[customer.primary_address_id].post_code}
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={createPageUrl('CRMCustomerDetail') + `?id=${customer.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredCustomers.length > 10 && (
              <CRMPagination {...pagination} />
            )}
          )}
        </CardContent>
      </Card>
    </div>
  );
}