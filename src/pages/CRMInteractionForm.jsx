import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { useAllDropdownOptions } from '../components/crm/useDropdownOptions';

export default function CRMInteractionForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const interactionId = urlParams.get('id');
  const preselectedCustomerId = urlParams.get('customer_id');
  const preselectedProjectId = urlParams.get('project_id');
  const isEditing = !!interactionId;

  const [formData, setFormData] = useState({
    customer_id: preselectedCustomerId || '',
    project_id: preselectedProjectId || '',
    interaction_date: new Date().toISOString().split('T')[0],
    interaction_type: '',
    summary_notes: '',
    introduction_notes: '',
    outcome_notes: '',
    location_assessment: '',
  });

  const { getOptions, isLoading: optionsLoading } = useAllDropdownOptions();
  const interactionTypes = getOptions('Interaction Types');

  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ['crmCustomers'],
    queryFn: () => base44.entities.CRMCustomer.list(),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['crmProjectsForCustomer', formData.customer_id],
    queryFn: () => base44.entities.CRMProject.filter({ customer_id: formData.customer_id }),
    enabled: !!formData.customer_id,
  });

  const { data: existingInteraction } = useQuery({
    queryKey: ['crmInteraction', interactionId],
    queryFn: () => base44.entities.CRMInteraction.filter({ id: interactionId }),
    enabled: isEditing,
  });

  useEffect(() => {
    if (existingInteraction?.[0]) {
      const interaction = existingInteraction[0];
      setFormData({
        customer_id: interaction.customer_id || '',
        project_id: interaction.project_id || '',
        interaction_date: interaction.interaction_date?.split('T')[0] || '',
        interaction_type: interaction.interaction_type || '',
        summary_notes: interaction.summary_notes || '',
        introduction_notes: interaction.introduction_notes || '',
        outcome_notes: interaction.outcome_notes || '',
        location_assessment: interaction.location_assessment || '',
      });
    }
  }, [existingInteraction]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CRMInteraction.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crmInteractions'] });
      toast.success('Interaction logged successfully');
      navigateBack();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CRMInteraction.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crmInteractions'] });
      toast.success('Interaction updated successfully');
      navigateBack();
    },
  });

  const navigateBack = () => {
    if (preselectedProjectId) {
      navigate(createPageUrl('CRMProjectDetail') + `?id=${preselectedProjectId}`);
    } else if (preselectedCustomerId) {
      navigate(createPageUrl('CRMCustomerDetail') + `?id=${preselectedCustomerId}`);
    } else {
      navigate(createPageUrl('CRMCustomers'));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const submitData = {
      ...formData,
      interaction_date: new Date(formData.interaction_date).toISOString(),
    };

    if (isEditing) {
      updateMutation.mutate({ id: interactionId, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  if (optionsLoading || customersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isDesignVisit = formData.interaction_type === 'Design Visit';

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Button variant="ghost" onClick={navigateBack} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {isEditing ? 'Edit Interaction' : 'Log Interaction'}
          </CardTitle>
          <CardDescription>
            Record a customer interaction
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Selection */}
            <div className="space-y-2">
              <Label>Customer *</Label>
              <Select
                value={formData.customer_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, customer_id: value, project_id: '' })
                }
                disabled={!!preselectedCustomerId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.first_name} {customer.surname} ({customer.customer_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Project Selection (optional) */}
            {formData.customer_id && projects.length > 0 && (
              <div className="space-y-2">
                <Label>Related Project (Optional)</Label>
                <Select
                  value={formData.project_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, project_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>No specific project</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.project_scope_types?.join(', ') || 'Project'} - {project.status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Interaction Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Interaction Type *</Label>
                <Select
                  value={formData.interaction_type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, interaction_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {interactionTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date *</Label>
                <input
                  type="date"
                  value={formData.interaction_date}
                  onChange={(e) =>
                    setFormData({ ...formData, interaction_date: e.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                />
              </div>
            </div>

            {/* Summary Notes */}
            <div className="space-y-2">
              <Label>Summary Notes *</Label>
              <Textarea
                value={formData.summary_notes}
                onChange={(e) =>
                  setFormData({ ...formData, summary_notes: e.target.value })
                }
                placeholder="General summary of the interaction..."
                rows={4}
                required
              />
            </div>

            {/* Introduction Notes */}
            <div className="space-y-2">
              <Label>Introduction / Presentation Notes</Label>
              <Textarea
                value={formData.introduction_notes}
                onChange={(e) =>
                  setFormData({ ...formData, introduction_notes: e.target.value })
                }
                placeholder="Notes on introduction or presentation..."
                rows={3}
              />
            </div>

            {/* Outcome Notes */}
            <div className="space-y-2">
              <Label>Outcome & Follow-up</Label>
              <Textarea
                value={formData.outcome_notes}
                onChange={(e) =>
                  setFormData({ ...formData, outcome_notes: e.target.value })
                }
                placeholder="Outcome, chase dates, booked engagements..."
                rows={3}
              />
            </div>

            {/* Location Assessment (for Design Visits) */}
            {isDesignVisit && (
              <div className="space-y-2">
                <Label>Location Assessment</Label>
                <Textarea
                  value={formData.location_assessment}
                  onChange={(e) =>
                    setFormData({ ...formData, location_assessment: e.target.value })
                  }
                  placeholder="Notes on the site/location assessment..."
                  rows={3}
                />
              </div>
            )}

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={navigateBack}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? 'Update Interaction' : 'Log Interaction'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}