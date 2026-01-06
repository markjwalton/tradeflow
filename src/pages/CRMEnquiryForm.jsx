import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useAllDropdownOptions } from '../components/crm/useDropdownOptions';

export default function CRMEnquiryForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const enquiryId = urlParams.get('id');
  const preselectedCustomerId = urlParams.get('customer_id');
  const isEditing = !!enquiryId;

  const [formData, setFormData] = useState({
    customer_id: preselectedCustomerId || '',
    inbound_channel: '',
    enquiry_date: new Date().toISOString().split('T')[0],
    project_description_summary: '',
    initial_project_types: [],
    other_project_type_description: '',
    referring_channel: '',
    status: 'New',
  });

  const { getOptions, isLoading: optionsLoading } = useAllDropdownOptions();
  const inboundChannels = getOptions('Inbound Channels');
  const projectScopeTypes = getOptions('Project Scope Types');
  const enquiryStatuses = getOptions('Enquiry Statuses');

  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ['crmCustomers'],
    queryFn: () => base44.entities.CRMCustomer.list(),
  });

  const { data: existingEnquiry } = useQuery({
    queryKey: ['crmEnquiry', enquiryId],
    queryFn: () => base44.entities.CRMEnquiry.filter({ id: enquiryId }),
    enabled: isEditing,
  });

  useEffect(() => {
    if (existingEnquiry?.[0]) {
      const enquiry = existingEnquiry[0];
      setFormData({
        customer_id: enquiry.customer_id || '',
        inbound_channel: enquiry.inbound_channel || '',
        enquiry_date: enquiry.enquiry_date?.split('T')[0] || '',
        project_description_summary: enquiry.project_description_summary || '',
        initial_project_types: enquiry.initial_project_types || [],
        other_project_type_description: enquiry.other_project_type_description || '',
        referring_channel: enquiry.referring_channel || '',
        status: enquiry.status || 'New',
      });
    }
  }, [existingEnquiry]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CRMEnquiry.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crmEnquiries'] });
      toast.success('Enquiry created successfully');
      navigate(createPageUrl('CRMEnquiries'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CRMEnquiry.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crmEnquiries'] });
      toast.success('Enquiry updated successfully');
      navigate(createPageUrl('CRMEnquiries'));
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const submitData = {
      ...formData,
      enquiry_date: new Date(formData.enquiry_date).toISOString(),
    };

    if (isEditing) {
      updateMutation.mutate({ id: enquiryId, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleProjectTypeChange = (type, checked) => {
    setFormData((prev) => ({
      ...prev,
      initial_project_types: checked
        ? [...prev.initial_project_types, type]
        : prev.initial_project_types.filter((t) => t !== type),
    }));
  };

  if (optionsLoading || customersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Button
        variant="ghost"
        onClick={() => navigate(createPageUrl('CRMEnquiries'))}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Enquiries
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {isEditing ? 'Edit Enquiry' : 'New Enquiry'}
          </CardTitle>
          <CardDescription>
            {isEditing
              ? 'Update enquiry details'
              : 'Record a new customer enquiry'}
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
                  setFormData({ ...formData, customer_id: value })
                }
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
              <p className="text-xs text-muted-foreground">
                <a
                  href={createPageUrl('CRMCustomerForm')}
                  className="text-primary hover:underline"
                >
                  Create new customer
                </a>{' '}
                if not in list
              </p>
            </div>

            {/* Enquiry Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Inbound Channel *</Label>
                <Select
                  value={formData.inbound_channel}
                  onValueChange={(value) =>
                    setFormData({ ...formData, inbound_channel: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent>
                    {inboundChannels.map((channel) => (
                      <SelectItem key={channel.value} value={channel.value}>
                        {channel.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Enquiry Date *</Label>
                <Input
                  type="date"
                  value={formData.enquiry_date}
                  onChange={(e) =>
                    setFormData({ ...formData, enquiry_date: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {/* Project Types */}
            <div className="space-y-2">
              <Label>Initial Project Types</Label>
              <div className="grid grid-cols-2 gap-2">
                {projectScopeTypes.map((type) => (
                  <div key={type.value} className="flex items-center gap-2">
                    <Checkbox
                      id={type.value}
                      checked={formData.initial_project_types.includes(type.value)}
                      onCheckedChange={(checked) =>
                        handleProjectTypeChange(type.value, checked)
                      }
                    />
                    <Label htmlFor={type.value} className="font-normal">
                      {type.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {formData.initial_project_types.includes('Other') && (
              <div className="space-y-2">
                <Label>Other Project Type Description</Label>
                <Input
                  value={formData.other_project_type_description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      other_project_type_description: e.target.value,
                    })
                  }
                  placeholder="Describe the project type"
                />
              </div>
            )}

            {/* Project Description */}
            <div className="space-y-2">
              <Label>Project Description (Optional)</Label>
              <Textarea
                value={formData.project_description_summary}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    project_description_summary: e.target.value,
                  })
                }
                placeholder="Brief description from the customer..."
                rows={3}
              />
            </div>

            {/* Referring Channel */}
            <div className="space-y-2">
              <Label>How did they hear about you?</Label>
              <Input
                value={formData.referring_channel}
                onChange={(e) =>
                  setFormData({ ...formData, referring_channel: e.target.value })
                }
                placeholder="e.g., Google, Existing Client, Facebook Ad"
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {enquiryStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(createPageUrl('CRMEnquiries'))}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? 'Update Enquiry' : 'Create Enquiry'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}