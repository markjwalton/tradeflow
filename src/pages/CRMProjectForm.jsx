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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Loader2, Home, Bed, Bath, Sofa, ChefHat } from 'lucide-react';
import { toast } from 'sonner';
import { useAllDropdownOptions } from '../components/crm/useDropdownOptions';
import PostcodeLookup from '../components/crm/PostcodeLookup';

export default function CRMProjectForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');
  const customerId = urlParams.get('customerId');
  const enquiryId = urlParams.get('enquiryId');
  const isEditing = !!projectId;

  const [activeTab, setActiveTab] = useState('basics');
  const [formData, setFormData] = useState({
    customer_id: customerId || '',
    enquiry_id: enquiryId || '',
    project_address_id: '',
    project_scope_types: [],
    other_project_scope_description: '',
    bedrooms_qty: 0,
    kitchens_qty: 0,
    bathrooms_qty: 0,
    living_rooms_qty: 0,
    other_rooms_description: '',
    product_specification: '',
    project_needs_objectives: '',
    functional_requirements: '',
    style_materials_finish_colour: '',
    special_requests: '',
    technical_data: '',
    rams_details: '',
    dependencies: '',
    next_steps_summary: '',
    status: 'New',
  });

  const [addressData, setAddressData] = useState({
    name_number: '',
    street: '',
    additional_field: '',
    town: '',
    city: '',
    county: '',
    post_code: '',
  });
  const [useCustomerAddress, setUseCustomerAddress] = useState(true);

  const { getOptions, isLoading: optionsLoading } = useAllDropdownOptions();
  const projectStatuses = getOptions('Project Statuses');
  const projectScopeTypes = getOptions('Project Scope Types');

  const { data: customers = [] } = useQuery({
    queryKey: ['crmCustomers'],
    queryFn: () => base44.entities.CRMCustomer.list(),
  });

  const { data: existingProject } = useQuery({
    queryKey: ['crmProject', projectId],
    queryFn: () => base44.entities.CRMProject.filter({ id: projectId }),
    enabled: isEditing,
  });

  const { data: customerData } = useQuery({
    queryKey: ['customer', formData.customer_id],
    queryFn: () => base44.entities.CRMCustomer.filter({ id: formData.customer_id }),
    enabled: !!formData.customer_id,
  });

  const { data: customerAddress } = useQuery({
    queryKey: ['customerAddress', customerData?.[0]?.primary_address_id],
    queryFn: () => base44.entities.Address.filter({ id: customerData[0].primary_address_id }),
    enabled: !!customerData?.[0]?.primary_address_id,
  });

  const { data: projectAddress } = useQuery({
    queryKey: ['projectAddress', formData.project_address_id],
    queryFn: () => base44.entities.Address.filter({ id: formData.project_address_id }),
    enabled: isEditing && !!formData.project_address_id,
  });

  useEffect(() => {
    if (existingProject?.[0]) {
      const project = existingProject[0];
      setFormData({
        customer_id: project.customer_id || '',
        enquiry_id: project.enquiry_id || '',
        project_address_id: project.project_address_id || '',
        project_scope_types: project.project_scope_types || [],
        other_project_scope_description: project.other_project_scope_description || '',
        bedrooms_qty: project.bedrooms_qty || 0,
        kitchens_qty: project.kitchens_qty || 0,
        bathrooms_qty: project.bathrooms_qty || 0,
        living_rooms_qty: project.living_rooms_qty || 0,
        other_rooms_description: project.other_rooms_description || '',
        product_specification: project.product_specification || '',
        project_needs_objectives: project.project_needs_objectives || '',
        functional_requirements: project.functional_requirements || '',
        style_materials_finish_colour: project.style_materials_finish_colour || '',
        special_requests: project.special_requests || '',
        technical_data: project.technical_data || '',
        rams_details: project.rams_details || '',
        dependencies: project.dependencies || '',
        next_steps_summary: project.next_steps_summary || '',
        status: project.status || 'New',
      });
      setUseCustomerAddress(false);
    }
  }, [existingProject]);

  useEffect(() => {
    if (projectAddress?.[0] && isEditing) {
      setAddressData(projectAddress[0]);
    }
  }, [projectAddress, isEditing]);

  useEffect(() => {
    if (useCustomerAddress && customerAddress?.[0]) {
      setAddressData(customerAddress[0]);
    }
  }, [useCustomerAddress, customerAddress]);

  const createMutation = useMutation({
    mutationFn: async (data) => {
      // Create address first
      const address = await base44.entities.Address.create(addressData);
      return base44.entities.CRMProject.create({ ...data, project_address_id: address.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crmProjects'] });
      toast.success('Project created successfully');
      navigate(createPageUrl('CRMProjects'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      // Update address
      if (formData.project_address_id) {
        await base44.entities.Address.update(formData.project_address_id, addressData);
      }
      return base44.entities.CRMProject.update(projectId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crmProjects'] });
      queryClient.invalidateQueries({ queryKey: ['crmProject', projectId] });
      toast.success('Project updated successfully');
      navigate(createPageUrl('CRMProjectDetail') + `?id=${projectId}`);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...formData };
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleScopeTypeChange = (value, checked) => {
    setFormData((prev) => ({
      ...prev,
      project_scope_types: checked
        ? [...prev.project_scope_types, value]
        : prev.project_scope_types.filter((t) => t !== value),
    }));
  };

  const handleAddressSelect = (addr) => {
    setAddressData({
      name_number: addr.building_number || addr.building_name || '',
      street: addr.thoroughfare || addr.line_1 || '',
      additional_field: addr.line_2 || '',
      town: '',
      city: addr.town_or_city || '',
      county: addr.county || '',
      post_code: addr.postcode || '',
    });
    setUseCustomerAddress(false);
  };

  const isMutating = createMutation.isPending || updateMutation.isPending;

  if (optionsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="max-w-4xl mx-auto">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Project' : 'New Project'}</CardTitle>
          <CardDescription>
            {isEditing ? 'Update project details and specifications' : 'Create a new project from an enquiry'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="basics">Basics</TabsTrigger>
                <TabsTrigger value="rooms">Rooms</TabsTrigger>
                <TabsTrigger value="specs">Specifications</TabsTrigger>
                <TabsTrigger value="planning">Planning</TabsTrigger>
              </TabsList>

              <TabsContent value="basics" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Customer *</Label>
                    <Select
                      value={formData.customer_id}
                      onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.first_name} {customer.surname}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
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
                </div>

                <div className="space-y-4">
                  <Label>Project Scope Types</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {projectScopeTypes.map((type) => (
                      <div key={type.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={type.value}
                          checked={formData.project_scope_types.includes(type.value)}
                          onCheckedChange={(checked) => handleScopeTypeChange(type.value, checked)}
                        />
                        <label htmlFor={type.value} className="text-sm cursor-pointer">
                          {type.label}
                        </label>
                      </div>
                    ))}
                  </div>
                  {formData.project_scope_types.includes('Other') && (
                    <div className="space-y-2">
                      <Label>Other Description</Label>
                      <Input
                        value={formData.other_project_scope_description}
                        onChange={(e) => setFormData({ ...formData, other_project_scope_description: e.target.value })}
                        placeholder="Describe the other project type"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Project Address</Label>
                    {customerAddress?.[0] && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="useCustomerAddress"
                          checked={useCustomerAddress}
                          onCheckedChange={setUseCustomerAddress}
                        />
                        <label htmlFor="useCustomerAddress" className="text-sm cursor-pointer">
                          Same as customer address
                        </label>
                      </div>
                    )}
                  </div>

                  {!useCustomerAddress && (
                    <PostcodeLookup onAddressSelect={handleAddressSelect} />
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>House Name/Number</Label>
                      <Input
                        value={addressData.name_number}
                        onChange={(e) => setAddressData({ ...addressData, name_number: e.target.value })}
                        disabled={useCustomerAddress}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Street *</Label>
                      <Input
                        value={addressData.street}
                        onChange={(e) => setAddressData({ ...addressData, street: e.target.value })}
                        disabled={useCustomerAddress}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>City *</Label>
                      <Input
                        value={addressData.city}
                        onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                        disabled={useCustomerAddress}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Post Code *</Label>
                      <Input
                        value={addressData.post_code}
                        onChange={(e) => setAddressData({ ...addressData, post_code: e.target.value })}
                        disabled={useCustomerAddress}
                        required
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="rooms" className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Bed className="h-5 w-5 text-muted-foreground" />
                      <Label>Bedrooms</Label>
                    </div>
                    <Input
                      type="number"
                      min="0"
                      value={formData.bedrooms_qty}
                      onChange={(e) => setFormData({ ...formData, bedrooms_qty: parseInt(e.target.value) || 0 })}
                    />
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ChefHat className="h-5 w-5 text-muted-foreground" />
                      <Label>Kitchens</Label>
                    </div>
                    <Input
                      type="number"
                      min="0"
                      value={formData.kitchens_qty}
                      onChange={(e) => setFormData({ ...formData, kitchens_qty: parseInt(e.target.value) || 0 })}
                    />
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Bath className="h-5 w-5 text-muted-foreground" />
                      <Label>Bathrooms</Label>
                    </div>
                    <Input
                      type="number"
                      min="0"
                      value={formData.bathrooms_qty}
                      onChange={(e) => setFormData({ ...formData, bathrooms_qty: parseInt(e.target.value) || 0 })}
                    />
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sofa className="h-5 w-5 text-muted-foreground" />
                      <Label>Living Rooms</Label>
                    </div>
                    <Input
                      type="number"
                      min="0"
                      value={formData.living_rooms_qty}
                      onChange={(e) => setFormData({ ...formData, living_rooms_qty: parseInt(e.target.value) || 0 })}
                    />
                  </Card>
                </div>

                <div className="space-y-2">
                  <Label>Other Rooms</Label>
                  <Textarea
                    value={formData.other_rooms_description}
                    onChange={(e) => setFormData({ ...formData, other_rooms_description: e.target.value })}
                    placeholder="Describe any other room types (e.g., home office, utility room)"
                    rows={3}
                  />
                </div>
              </TabsContent>

              <TabsContent value="specs" className="space-y-6">
                <div className="space-y-2">
                  <Label>Project Needs & Objectives</Label>
                  <Textarea
                    value={formData.project_needs_objectives}
                    onChange={(e) => setFormData({ ...formData, project_needs_objectives: e.target.value })}
                    placeholder="What does the customer want to achieve?"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Functional Requirements</Label>
                  <Textarea
                    value={formData.functional_requirements}
                    onChange={(e) => setFormData({ ...formData, functional_requirements: e.target.value })}
                    placeholder="Specific requirements (drawers, hanging space, etc.)"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Style, Materials, Finish & Colour</Label>
                  <Textarea
                    value={formData.style_materials_finish_colour}
                    onChange={(e) => setFormData({ ...formData, style_materials_finish_colour: e.target.value })}
                    placeholder="Design preferences and material choices"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Special Requests</Label>
                  <Textarea
                    value={formData.special_requests}
                    onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
                    placeholder="Lighting, shoe racks, accessories, etc."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Product Specification</Label>
                  <Textarea
                    value={formData.product_specification}
                    onChange={(e) => setFormData({ ...formData, product_specification: e.target.value })}
                    placeholder="Product details, suppliers, warranties"
                    rows={3}
                  />
                </div>
              </TabsContent>

              <TabsContent value="planning" className="space-y-6">
                <div className="space-y-2">
                  <Label>Technical Data</Label>
                  <Textarea
                    value={formData.technical_data}
                    onChange={(e) => setFormData({ ...formData, technical_data: e.target.value })}
                    placeholder="Measurements, site-specific technical information"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>RAMS Details</Label>
                  <Textarea
                    value={formData.rams_details}
                    onChange={(e) => setFormData({ ...formData, rams_details: e.target.value })}
                    placeholder="Risk assessments and method statements"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Dependencies</Label>
                  <Textarea
                    value={formData.dependencies}
                    onChange={(e) => setFormData({ ...formData, dependencies: e.target.value })}
                    placeholder="External dependencies (electrician, waste removal, etc.)"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Next Steps Summary</Label>
                  <Textarea
                    value={formData.next_steps_summary}
                    onChange={(e) => setFormData({ ...formData, next_steps_summary: e.target.value })}
                    placeholder="Timeline expectations and next actions"
                    rows={3}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isMutating}>
                {isMutating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? 'Save Changes' : 'Create Project'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}