import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, Calendar, MessageSquare, MapPin, Mail, Video, Pencil, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';

const interactionIcons = {
  'Phone Call': Phone,
  'Email': Mail,
  'Design Visit': MapPin,
  'Video Call': Video,
  'Meeting': Calendar,
};

export default function InteractionCard({ interaction, showCustomer, customerName, expanded, onToggle }) {
  const IconComponent = interactionIcons[interaction.interaction_type] || MessageSquare;
  const hasDetails = interaction.introduction_notes || interaction.outcome_notes || interaction.location_assessment;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <IconComponent className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline">{interaction.interaction_type}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(interaction.interaction_date), 'MMM d, yyyy')}
                  </span>
                </div>
                {showCustomer && customerName && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Customer: {customerName}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Link to={createPageUrl('CRMInteractionForm') + `?id=${interaction.id}`}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </Link>
                {hasDetails && (
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggle}>
                    {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                )}
              </div>
            </div>
            
            <p className="text-sm mt-2">{interaction.summary_notes}</p>

            {expanded && hasDetails && (
              <div className="mt-3 pt-3 border-t space-y-3">
                {interaction.introduction_notes && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                      Introduction Notes
                    </p>
                    <p className="text-sm">{interaction.introduction_notes}</p>
                  </div>
                )}
                {interaction.outcome_notes && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                      Outcome & Follow-up
                    </p>
                    <p className="text-sm">{interaction.outcome_notes}</p>
                  </div>
                )}
                {interaction.location_assessment && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                      Location Assessment
                    </p>
                    <p className="text-sm">{interaction.location_assessment}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}