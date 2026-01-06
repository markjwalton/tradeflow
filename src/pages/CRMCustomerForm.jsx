import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, User } from 'lucide-react';
import { toast } from 'sonner';
import { useAllDropdownOptions } from '../components/crm/useDropdownOptions';

// Generate customer number: [R/T/C/E][MM][YY][NNN]
const generateCustomerNumber = async (customerType) => {
  const typePrefix = {
    Retail: 'R',
    Trade: 'T',
    Commercial: 'C',
    Ecommerce: 'E',
  };
  const prefix = typePrefix[customerType] || 'R';
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear()).slice(-2);

  // Get existing customers to determine sequence
  const existing = await base44.entities.CRMCustomer.filter({});
  const sameMonthCustomers = existing.filter((c) =>
    c.customer_number?.startsWith(`${prefix}${month}${year}`)
  );
  const sequence = String(sameMonthCustomers.length + 1).padStart(3, '0');

  return `${prefix}${month}${year}${sequence}`;
};

export default function CRMCustomerForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const customerId = urlParams.get('id');
  const isEditing = !!customerId;

  const [formData, setFormData] = useState({
    customer_type: 'Retail',
    first_name: '',
    surname: '',
    mobile: '',
    email_address: '',
    whatsapp_opt_in: false,
    contact_methods: [],
    marketing_opt_in: false,
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

  const { getOptions, isLoading: optionsLoading } = useAllDropdownOptions();
  const customerTypes = getOptions('Customer Types');
  const contactMethods = getOptions('Contact Methods');

  const { data: existingCustomer } = useQuery({
    queryKey: ['crmCustomer', customerId],
    queryFn: () => base44.entities.CRMCustomer.filter({ id: customerId }),
    enabled: isEditing,
  });

  const { data: existingAddress } = useQuery({
    queryKey: ['address', existingCustomer?.[0]?.primary_address_id],
    queryFn: () =>
      base44.entities.Address.filter({ id: existingCustomer[0].primary_address_id }),
    enabled: !!existingCustomer?.[0]?.primary_address_id,
  });

  useEffect(() => {
    if (existingCustomer?.[0]) {
      const customer = existingCustomer[0];
      setFormData({
        customer_type: customer.customer_type || 'Retail',
        first_name: customer.first_name || '',
        surname: customer.surname || '',
        mobile: customer.mobile || '',
        email_address: customer.email_address || '',
        whatsapp_opt_in: customer.whatsapp_opt_in || false,
        contact_methods: customer.contact_methods || [],
        marketing_opt_in: customer.marketing_opt_in || false,
      });
    }
  }, [existingCustomer]);

  useEffect(() => {
    if (existingAddress?.[0]) {
      setAddressData(existingAddress[0]);
    }
  }, [existingAddress]);

  const createAddressMutation = useMutation({
    mutationFn: (data) => base44.entities.Address.create(data),
  });

  const createCustomerMutation = useMutation({
    mutationFn: (data) => base44.entities.CRMCustomer.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crmCustomers'] });
      toast.success('Customer created successfully');
      navigate(createPageUrl('CRMCustomers'));
    },
  });

  const updateCustomerMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CRMCustomer.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crmCustomers'] });
      toast.success('Customer updated successfully');
      navigate(createPageUrl('CRMCustomers'));
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create address first
    let addressId = existingCustomer?.[0]?.primary_address_id;
    if (!addressId) {
      const address = await createAddressMutation.mutateAsync(addressData);
      addressId = address.id;
    } else {
      await base44.entities.Address.update(addressId, addressData);
    }

    if (isEditing) {
      updateCustomerMutation.mutate({
        id: customerId,
        data: { ...formData, primary_address_id: addressId },
      });
    } else {
      const customerNumber = await generateCustomerNumber(formData.customer_type);
      createCustomerMutation.mutate({
        ...formData,
        customer_number: customerNumber,
        primary_address_id: addressId,
      });
    }
  };

  const handleContactMethodChange = (method, checked) => {
    setFormData((prev) => ({
      ...prev,
      contact_methods: checked
        ? [...prev.contact_methods, method]
        : prev.contact_methods.filter((m) => m !== method),
    }));
  };

  if (optionsLoading) {
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
        onClick={() => navigate(createPageUrl('CRMCustomers'))}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Customers
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {isEditing ? 'Edit Customer' : 'New Customer'}
          </CardTitle>
          <CardDescription>
            {isEditing
              ? 'Update customer details'
              : 'Add a new customer to your database'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Type */}
            <div className="space-y-2">
              <Label>Customer Type</Label>
              <Select
                value={formData.customer_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, customer_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {customerTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Personal Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name *</Label>
                <Input
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Surname *</Label>
                <Input
                  value={formData.surname}
                  onChange={(e) =>
                    setFormData({ ...formData, surname: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mobile *</Label>
                <Input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) =>
                    setFormData({ ...formData, mobile: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Email Address *</Label>
                <Input
                  type="email"
                  value={formData.email_address}
                  onChange={(e) =>
                    setFormData({ ...formData, email_address: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div className="border-t pt-4">
              <h3 className="font-medium mb-4">Address</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>House Name/Number</Label>
                  <Input
                    value={addressData.name_number}
                    onChange={(e) =>
                      setAddressData({ ...addressData, name_number: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Street *</Label>
                  <Input
                    value={addressData.street}
                    onChange={(e) =>
                      setAddressData({ ...addressData, street: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Additional Line</Label>
                  <Input
                    value={addressData.additional_field}
                    onChange={(e) =>
                      setAddressData({ ...addressData, additional_field: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Town</Label>
                  <Input
                    value={addressData.town}
                    onChange={(e) =>
                      setAddressData({ ...addressData, town: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>City *</Label>
                  <Input
                    value={addressData.city}
                    onChange={(e) =>
                      setAddressData({ ...addressData, city: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>County</Label>
                  <Input
                    value={addressData.county}
                    onChange={(e) =>
                      setAddressData({ ...addressData, county: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Post Code *</Label>
                  <Input
                    value={addressData.post_code}
                    onChange={(e) =>
                      setAddressData({ ...addressData, post_code: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="border-t pt-4">
              <h3 className="font-medium mb-4">Contact Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>WhatsApp Opt-in</Label>
                    <p className="text-sm text-muted-foreground">
                      Customer agrees to receive WhatsApp messages
                    </p>
                  </div>
                  <Switch
                    checked={formData.whatsapp_opt_in}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, whatsapp_opt_in: checked })
                    }
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Preferred Contact Methods</Label>
                  <div className="flex flex-wrap gap-4">
                    {contactMethods.map((method) => (
                      <div key={method.value} className="flex items-center gap-2">
                        <Checkbox
                          id={method.value}
                          checked={formData.contact_methods.includes(method.value)}
                          onCheckedChange={(checked) =>
                            handleContactMethodChange(method.value, checked)
                          }
                        />
                        <Label htmlFor={method.value} className="font-normal">
                          {method.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Marketing Opt-in</Label>
                    <p className="text-sm text-muted-foreground">
                      Customer agrees to receive marketing communications
                    </p>
                  </div>
                  <Switch
                    checked={formData.marketing_opt_in}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, marketing_opt_in: checked })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(createPageUrl('CRMCustomers'))}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  createCustomerMutation.isPending || updateCustomerMutation.isPending
                }
              >
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? 'Update Customer' : 'Create Customer'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}