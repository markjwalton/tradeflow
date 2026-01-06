import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAllDropdownOptions } from './useDropdownOptions';
import PostcodeLookup from './PostcodeLookup';

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

  const existing = await base44.entities.CRMCustomer.filter({});
  const sameMonthCustomers = existing.filter((c) =>
    c.customer_number?.startsWith(`${prefix}${month}${year}`)
  );
  const sequence = String(sameMonthCustomers.length + 1).padStart(3, '0');

  return `${prefix}${month}${year}${sequence}`;
};

export default function QuickCustomerForm({ open, onOpenChange, onCustomerCreated }) {
  const queryClient = useQueryClient();
  const { getOptions, isLoading: optionsLoading } = useAllDropdownOptions();
  const customerTypes = getOptions('Customer Types');

  const [formData, setFormData] = useState({
    customer_type: 'Retail',
    first_name: '',
    surname: '',
    mobile: '',
    email_address: '',
    whatsapp_opt_in: false,
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddressSelect = (address) => {
    setAddressData({
      name_number: address.name_number || '',
      street: address.street || '',
      additional_field: address.additional_field || '',
      town: address.town || '',
      city: address.city || '',
      county: address.county || '',
      post_code: address.post_code || '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create address
      const address = await base44.entities.Address.create(addressData);

      // Generate customer number and create customer
      const customerNumber = await generateCustomerNumber(formData.customer_type);
      const customer = await base44.entities.CRMCustomer.create({
        ...formData,
        customer_number: customerNumber,
        primary_address_id: address.id,
        contact_methods: [],
        marketing_opt_in: false,
      });

      queryClient.invalidateQueries({ queryKey: ['crmCustomers'] });
      toast.success('Customer created successfully');
      
      // Reset form
      setFormData({
        customer_type: 'Retail',
        first_name: '',
        surname: '',
        mobile: '',
        email_address: '',
        whatsapp_opt_in: false,
      });
      setAddressData({
        name_number: '',
        street: '',
        additional_field: '',
        town: '',
        city: '',
        county: '',
        post_code: '',
      });

      onCustomerCreated(customer);
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to create customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quick Add Customer</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Type */}
          <div className="space-y-2">
            <Label>Customer Type</Label>
            <Select
              value={formData.customer_type}
              onValueChange={(value) => setFormData({ ...formData, customer_type: value })}
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

          {/* Name */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name *</Label>
              <Input
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Surname *</Label>
              <Input
                value={formData.surname}
                onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Mobile *</Label>
              <Input
                type="tel"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={formData.email_address}
                onChange={(e) => setFormData({ ...formData, email_address: e.target.value })}
                required
              />
            </div>
          </div>

          {/* WhatsApp */}
          <div className="flex items-center justify-between py-2">
            <Label>WhatsApp Opt-in</Label>
            <Switch
              checked={formData.whatsapp_opt_in}
              onCheckedChange={(checked) => setFormData({ ...formData, whatsapp_opt_in: checked })}
            />
          </div>

          {/* Address with Postcode Lookup */}
          <div className="border-t pt-4">
            <PostcodeLookup onAddressSelect={handleAddressSelect} />
            
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="space-y-1">
                <Label className="text-xs">House Name/Number</Label>
                <Input
                  value={addressData.name_number}
                  onChange={(e) => setAddressData({ ...addressData, name_number: e.target.value })}
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Street *</Label>
                <Input
                  value={addressData.street}
                  onChange={(e) => setAddressData({ ...addressData, street: e.target.value })}
                  className="h-9"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Town</Label>
                <Input
                  value={addressData.town}
                  onChange={(e) => setAddressData({ ...addressData, town: e.target.value })}
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">City *</Label>
                <Input
                  value={addressData.city}
                  onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                  className="h-9"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">County</Label>
                <Input
                  value={addressData.county}
                  onChange={(e) => setAddressData({ ...addressData, county: e.target.value })}
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Post Code *</Label>
                <Input
                  value={addressData.post_code}
                  onChange={(e) => setAddressData({ ...addressData, post_code: e.target.value })}
                  className="h-9"
                  required
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Create Customer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}