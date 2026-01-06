import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Edit, FolderOpen, User, MapPin, MessageSquare, Save, Home, Pencil, Plus } from 'lucide-react';
import InteractionTimeline from '../components/crm/InteractionTimeline';
import { toast } from 'sonner';
import { useAllDropdownOptions } from '../components/crm/useDropdownOptions';

export default function CRMProjectDetail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');

  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editedDetails, setEditedDetails] = useState({});

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['crmProject', projectId],
    queryFn: () => base44.entities.CRMProject.filter({ id: projectId }),
    enabled: !!projectId,
  });

  const project = projects[0];

  const { data: customers = [] } = useQuery({
    queryKey: ['crmCustomer', project?.customer_id],
    queryFn: () => base44.entities.CRMCustomer.filter({ id: project.customer_id }),
    enabled: !!project?.customer_id,
  });

  const customer = customers[0];

  const { data: projectAddress } = useQuery({
    queryKey: ['address', project?.project_address_id],
    queryFn: () => base44.entities.Address.filter({ id: project.project_address_id }),
    enabled: !!project?.project_address_id,
  });

  const { data: interactions = [] } = useQuery({
    queryKey: ['crmInteractions', projectId],
    queryFn: () => base44.entities.CRMInteraction.filter({ project_id: projectId }),
    enabled: !!projectId,
  });

  const { getOptions } = useAllDropdownOptions();
  const projectStatuses = getOptions('Project Statuses');

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) =>
      base44.entities.CRMProject.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crmProject', projectId] });
      toast.success('Status updated');
    },
  });

  const updateDetailsMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CRMProject.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crmProject', projectId] });
      toast.success('Project details updated');
      setIsEditingDetails(false);
    },
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

  const handleStartEditing = () => {
    setEditedDetails({
      product_specification: project.product_specification || '',
      project_needs_objectives: project.project_needs_objectives || '',
      functional_requirements: project.functional_requirements || '',
      style_materials_finish_colour: project.style_materials_finish_colour || '',
      special_requests: project.special_requests || '',
      technical_data: project.technical_data || '',
      rams_details: project.rams_details || '',
      dependencies: project.dependencies || '',
      next_steps_summary: project.next_steps_summary || '',
      bedrooms_qty: project.bedrooms_qty || 0,
      kitchens_qty: project.kitchens_qty || 0,
      bathrooms_qty: project.bathrooms_qty || 0,
      living_rooms_qty: project.living_rooms_qty || 0,
      other_rooms_description: project.other_rooms_description || '',
    });
    setIsEditingDetails(true);
  };

  const handleSaveDetails = () => {
    updateDetailsMutation.mutate({ id: project.id, data: editedDetails });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6">
        <p>Project not found</p>
      </div>
    );
  }

  const address = projectAddress?.[0];

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate(createPageUrl('CRMProjects'))}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Projects
      </Button>

      {/* Header Card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <FolderOpen className="h-8 w-8 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-semibold">
                    {customer?.first_name} {customer?.surname} Project
                  </h1>
                  <Badge className={getStatusBadgeColor(project.status)}>
                    {project.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {project.project_scope_types?.map((type) => (
                    <Badge key={type} variant="secondary">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <Link to={createPageUrl('CRMProjectForm') + `?id=${project.id}`}>
              <Button variant="outline">
                <Pencil className="h-4 w-4 mr-2" />
                Edit Project
              </Button>
            </Link>
          </div>

          {/* Status Update */}
          <div className="mt-6 flex items-center gap-4">
            <span className="text-sm font-medium">Update Status:</span>
            <Select
              value={project.status}
              onValueChange={(value) =>
                updateStatusMutation.mutate({ id: project.id, status: value })
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {projectStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer
            </CardTitle>
          </CardHeader>
          <CardContent>
            {customer && (
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
                  className="text-sm text-primary hover:underline"
                >
                  View Customer →
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Project Address */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Project Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            {address ? (
              <div className="space-y-1 text-sm">
                {address.name_number && <p>{address.name_number}</p>}
                <p>{address.street}</p>
                {address.additional_field && <p>{address.additional_field}</p>}
                {address.town && <p>{address.town}</p>}
                <p>{address.city}</p>
                {address.county && <p>{address.county}</p>}
                <p className="font-medium">{address.post_code}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">No address set</p>
            )}
          </CardContent>
        </Card>

        {/* Room Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Home className="h-5 w-5" />
              Room Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Bedrooms:</div>
              <div className="font-medium">{project.bedrooms_qty || 0}</div>
              <div>Kitchens:</div>
              <div className="font-medium">{project.kitchens_qty || 0}</div>
              <div>Bathrooms:</div>
              <div className="font-medium">{project.bathrooms_qty || 0}</div>
              <div>Living Rooms:</div>
              <div className="font-medium">{project.living_rooms_qty || 0}</div>
            </div>
            {project.other_rooms_description && (
              <p className="text-sm mt-2 text-muted-foreground">
                Other: {project.other_rooms_description}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Details and Interactions */}
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Project Details</TabsTrigger>
          <TabsTrigger value="interactions" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Interactions ({interactions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Specifications & Requirements</CardTitle>
              {!isEditingDetails ? (
                <Button variant="outline" onClick={handleStartEditing}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Details
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsEditingDetails(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveDetails} disabled={updateDetailsMutation.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {isEditingDetails ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Bedrooms</Label>
                      <Input
                        type="number"
                        value={editedDetails.bedrooms_qty}
                        onChange={(e) =>
                          setEditedDetails({ ...editedDetails, bedrooms_qty: parseInt(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Kitchens</Label>
                      <Input
                        type="number"
                        value={editedDetails.kitchens_qty}
                        onChange={(e) =>
                          setEditedDetails({ ...editedDetails, kitchens_qty: parseInt(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Bathrooms</Label>
                      <Input
                        type="number"
                        value={editedDetails.bathrooms_qty}
                        onChange={(e) =>
                          setEditedDetails({ ...editedDetails, bathrooms_qty: parseInt(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Living Rooms</Label>
                      <Input
                        type="number"
                        value={editedDetails.living_rooms_qty}
                        onChange={(e) =>
                          setEditedDetails({ ...editedDetails, living_rooms_qty: parseInt(e.target.value) || 0 })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Other Rooms</Label>
                    <Input
                      value={editedDetails.other_rooms_description}
                      onChange={(e) =>
                        setEditedDetails({ ...editedDetails, other_rooms_description: e.target.value })
                      }
                      placeholder="Describe other rooms..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Product Specification</Label>
                    <Textarea
                      value={editedDetails.product_specification}
                      onChange={(e) =>
                        setEditedDetails({ ...editedDetails, product_specification: e.target.value })
                      }
                      placeholder="Materials, suppliers, warranties..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Project Needs & Objectives</Label>
                    <Textarea
                      value={editedDetails.project_needs_objectives}
                      onChange={(e) =>
                        setEditedDetails({ ...editedDetails, project_needs_objectives: e.target.value })
                      }
                      placeholder="Customer's needs and goals..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Functional Requirements</Label>
                    <Textarea
                      value={editedDetails.functional_requirements}
                      onChange={(e) =>
                        setEditedDetails({ ...editedDetails, functional_requirements: e.target.value })
                      }
                      placeholder="Drawers, hanging, hidden TV space..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Style, Materials, Finish & Colour</Label>
                    <Textarea
                      value={editedDetails.style_materials_finish_colour}
                      onChange={(e) =>
                        setEditedDetails({ ...editedDetails, style_materials_finish_colour: e.target.value })
                      }
                      placeholder="Style preferences, materials, colors..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Special Requests</Label>
                    <Textarea
                      value={editedDetails.special_requests}
                      onChange={(e) =>
                        setEditedDetails({ ...editedDetails, special_requests: e.target.value })
                      }
                      placeholder="Lighting, shoe racks, accessories..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Technical Data</Label>
                    <Textarea
                      value={editedDetails.technical_data}
                      onChange={(e) =>
                        setEditedDetails({ ...editedDetails, technical_data: e.target.value })
                      }
                      placeholder="Measurements, site-specific info..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>RAMS Details</Label>
                    <Textarea
                      value={editedDetails.rams_details}
                      onChange={(e) =>
                        setEditedDetails({ ...editedDetails, rams_details: e.target.value })
                      }
                      placeholder="Health & safety considerations..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Dependencies</Label>
                    <Textarea
                      value={editedDetails.dependencies}
                      onChange={(e) =>
                        setEditedDetails({ ...editedDetails, dependencies: e.target.value })
                      }
                      placeholder="Electrician, waste removal..."
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Next Steps Summary</Label>
                    <Textarea
                      value={editedDetails.next_steps_summary}
                      onChange={(e) =>
                        setEditedDetails({ ...editedDetails, next_steps_summary: e.target.value })
                      }
                      placeholder="Expectations, timescales..."
                      rows={2}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {[
                    { label: 'Product Specification', value: project.product_specification },
                    { label: 'Project Needs & Objectives', value: project.project_needs_objectives },
                    { label: 'Functional Requirements', value: project.functional_requirements },
                    { label: 'Style, Materials, Finish & Colour', value: project.style_materials_finish_colour },
                    { label: 'Special Requests', value: project.special_requests },
                    { label: 'Technical Data', value: project.technical_data },
                    { label: 'RAMS Details', value: project.rams_details },
                    { label: 'Dependencies', value: project.dependencies },
                    { label: 'Next Steps Summary', value: project.next_steps_summary },
                  ].map((field) => (
                    <div key={field.label}>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        {field.label}
                      </p>
                      <p className={field.value ? '' : 'text-muted-foreground italic'}>
                        {field.value || 'Not specified'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interactions" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <InteractionTimeline
                interactions={interactions}
                customerId={project.customer_id}
                projectId={project.id}
                emptyMessage="No interactions logged for this project"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}