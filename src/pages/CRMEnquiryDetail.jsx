import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { ArrowLeft, Edit, FileText, User, Calendar, ArrowRight, FolderPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useAllDropdownOptions } from '../components/crm/useDropdownOptions';
import { CRMAppShell } from '../components/crm/CRMAppShell';

export default function CRMEnquiryDetail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const enquiryId = urlParams.get('id');

  const [showConvertDialog, setShowConvertDialog] = useState(false);

  const { data: enquiries = [], isLoading } = useQuery({
    queryKey: ['crmEnquiry', enquiryId],
    queryFn: () => base44.entities.CRMEnquiry.filter({ id: enquiryId }),
    enabled: !!enquiryId,
  });

  const enquiry = enquiries[0];

  const { data: customers = [] } = useQuery({
    queryKey: ['crmCustomer', enquiry?.customer_id],
    queryFn: () => base44.entities.CRMCustomer.filter({ id: enquiry.customer_id }),
    enabled: !!enquiry?.customer_id,
  });

  const customer = customers[0];

  const { data: customerAddress } = useQuery({
    queryKey: ['address', customer?.primary_address_id],
    queryFn: () => base44.entities.Address.filter({ id: customer.primary_address_id }),
    enabled: !!customer?.primary_address_id,
  });

  const { getOptions } = useAllDropdownOptions();
  const enquiryStatuses = getOptions('Enquiry Statuses');

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) =>
      base44.entities.CRMEnquiry.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crmEnquiry', enquiryId] });
      toast.success('Status updated');
    },
  });

  const convertToProjectMutation = useMutation({
    mutationFn: async () => {
      // Create project address (copy from customer address)
      const address = customerAddress?.[0];
      let projectAddressId = customer?.primary_address_id;

      if (address) {
        const newAddress = await base44.entities.Address.create({
          name_number: address.name_number,
          street: address.street,
          additional_field: address.additional_field,
          town: address.town,
          city: address.city,
          county: address.county,
          post_code: address.post_code,
        });
        projectAddressId = newAddress.id;
      }

      // Create project
      const project = await base44.entities.CRMProject.create({
        customer_id: enquiry.customer_id,
        enquiry_id: enquiry.id,
        project_address_id: projectAddressId,
        project_scope_types: enquiry.initial_project_types || [],
        other_project_scope_description: enquiry.other_project_type_description || '',
        status: 'New',
      });

      // Update enquiry status
      await base44.entities.CRMEnquiry.update(enquiry.id, {
        status: 'ConvertedToProject',
        project_id: project.id,
      });

      return project;
    },
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['crmEnquiry'] });
      queryClient.invalidateQueries({ queryKey: ['crmProjects'] });
      toast.success('Enquiry converted to project');
      setShowConvertDialog(false);
      navigate(createPageUrl('CRMProjectDetail') + `?id=${project.id}`);
    },
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!enquiry) {
    return (
      <div className="p-6">
        <p>Enquiry not found</p>
      </div>
    );
  }

  const canConvert =
    enquiry.status !== 'ConvertedToProject' &&
    enquiry.status !== 'Unqualified' &&
    enquiry.status !== 'Archived';

  return (
    <CRMAppShell currentPage="CRMEnquiries" breadcrumbs={[{ label: 'Enquiries', href: createPageUrl('CRMEnquiries') }, { label: 'Enquiry Detail' }]}>
      <Button
        variant="ghost"
        onClick={() => navigate(createPageUrl('CRMEnquiries'))}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Enquiries
      </Button>

      {/* Header Card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-semibold">Enquiry</h1>
                  <Badge className={getStatusBadgeColor(enquiry.status)}>
                    {enquiry.status}
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  {enquiry.inbound_channel} •{' '}
                  {new Date(enquiry.enquiry_date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link to={createPageUrl('CRMEnquiryForm') + `?id=${enquiry.id}`}>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
              {canConvert && (
                <Button onClick={() => setShowConvertDialog(true)}>
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Convert to Project
                </Button>
              )}
            </div>
          </div>

          {/* Status Update */}
          <div className="mt-6 flex items-center gap-4">
            <span className="text-sm font-medium">Update Status:</span>
            <Select
              value={enquiry.status}
              onValueChange={(value) =>
                updateStatusMutation.mutate({ id: enquiry.id, status: value })
              }
            >
              <SelectTrigger className="w-[200px]">
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
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer
            </CardTitle>
          </CardHeader>
          <CardContent>
            {customer ? (
              <div className="space-y-2">
                <p className="font-medium">
                  {customer.first_name} {customer.surname}
                </p>
                <p className="text-sm text-muted-foreground">
                  {customer.customer_number}
                </p>
                <p className="text-sm">{customer.email_address}</p>
                <p className="text-sm">{customer.mobile}</p>
                <Link
                  to={createPageUrl('CRMCustomerDetail') + `?id=${customer.id}`}
                  className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                >
                  View Customer <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ) : (
              <p className="text-muted-foreground">Customer not found</p>
            )}
          </CardContent>
        </Card>

        {/* Enquiry Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Enquiry Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Inbound Channel</p>
              <p className="font-medium">{enquiry.inbound_channel}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Referring Channel</p>
              <p className="font-medium">{enquiry.referring_channel || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Project Types</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {enquiry.initial_project_types?.map((type) => (
                  <Badge key={type} variant="secondary">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
            {enquiry.project_description_summary && (
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p>{enquiry.project_description_summary}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Project Link if converted */}
      {enquiry.project_id && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">This enquiry has been converted to a project</p>
                <p className="text-sm text-muted-foreground">
                  View the project for full details
                </p>
              </div>
              <Link to={createPageUrl('CRMProjectDetail') + `?id=${enquiry.project_id}`}>
                <Button>
                  View Project <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Convert Dialog */}
      <Dialog open={showConvertDialog} onOpenChange={setShowConvertDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convert to Project</DialogTitle>
            <DialogDescription>
              This will create a new project from this enquiry. The project address will
              be copied from the customer's primary address (you can change it later).
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Project types to be copied:
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {enquiry.initial_project_types?.map((type) => (
                <Badge key={type} variant="secondary">
                  {type}
                </Badge>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConvertDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => convertToProjectMutation.mutate()}
              disabled={convertToProjectMutation.isPending}
            >
              {convertToProjectMutation.isPending ? 'Converting...' : 'Convert to Project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CRMAppShell>
  );
}