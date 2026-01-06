import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import InteractionCard from './InteractionCard';

export default function InteractionTimeline({ 
  interactions, 
  customerId, 
  projectId, 
  customerMap = {},
  showCustomer = false,
  title = 'Interactions',
  emptyMessage = 'No interactions logged'
}) {
  const [expandedId, setExpandedId] = useState(null);

  const sortedInteractions = [...interactions].sort(
    (a, b) => new Date(b.interaction_date) - new Date(a.interaction_date)
  );

  const addUrl = createPageUrl('CRMInteractionForm') + 
    (projectId ? `?customer_id=${customerId}&project_id=${projectId}` : 
     customerId ? `?customer_id=${customerId}` : '');

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title} ({interactions.length})</h3>
        {customerId && (
          <Link to={addUrl}>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Log Interaction
            </Button>
          </Link>
        )}
      </div>

      {sortedInteractions.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">{emptyMessage}</p>
      ) : (
        <div className="space-y-3">
          {sortedInteractions.map((interaction) => {
            const customer = customerMap[interaction.customer_id];
            return (
              <InteractionCard
                key={interaction.id}
                interaction={interaction}
                showCustomer={showCustomer}
                customerName={customer ? `${customer.first_name} ${customer.surname}` : null}
                expanded={expandedId === interaction.id}
                onToggle={() => setExpandedId(expandedId === interaction.id ? null : interaction.id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}