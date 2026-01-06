import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MessageSquare, Plus } from 'lucide-react';
import { useAllDropdownOptions } from '../components/crm/useDropdownOptions';
import InteractionCard from '../components/crm/InteractionCard';

export default function CRMInteractions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const { data: interactions = [], isLoading } = useQuery({
    queryKey: ['crmInteractions'],
    queryFn: () => base44.entities.CRMInteraction.list('-interaction_date'),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['crmCustomers'],
    queryFn: () => base44.entities.CRMCustomer.list(),
  });

  const { getOptions, isLoading: optionsLoading } = useAllDropdownOptions();
  const interactionTypes = getOptions('Interaction Types');

  const customerMap = customers.reduce((acc, c) => {
    acc[c.id] = c;
    return acc;
  }, {});

  const filteredInteractions = interactions.filter((interaction) => {
    const customer = customerMap[interaction.customer_id];
    const customerName = customer
      ? `${customer.first_name} ${customer.surname}`.toLowerCase()
      : '';

    const matchesSearch =
      searchTerm === '' ||
      customerName.includes(searchTerm.toLowerCase()) ||
      interaction.summary_notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interaction.interaction_type?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || interaction.interaction_type === typeFilter;

    return matchesSearch && matchesType;
  });

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
            <MessageSquare className="h-6 w-6" />
            Interactions
          </h1>
          <p className="text-muted-foreground mt-1">
            All customer interactions
          </p>
        </div>
        <Link to={createPageUrl('CRMInteractionForm')}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Log Interaction
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search interactions..."
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
                {interactionTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredInteractions.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No interactions found</h3>
              <p className="text-muted-foreground">
                {searchTerm || typeFilter !== 'all'
                  ? 'Try adjusting your search or filter'
                  : 'Start logging customer interactions'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredInteractions.map((interaction) => {
                const customer = customerMap[interaction.customer_id];
                return (
                  <InteractionCard
                    key={interaction.id}
                    interaction={interaction}
                    showCustomer={true}
                    customerName={customer ? `${customer.first_name} ${customer.surname}` : 'Unknown'}
                    expanded={expandedId === interaction.id}
                    onToggle={() => setExpandedId(expandedId === interaction.id ? null : interaction.id)}
                  />
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}