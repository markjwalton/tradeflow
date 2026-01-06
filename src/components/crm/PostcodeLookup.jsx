import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Loader2, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export default function PostcodeLookup({ onAddressSelect }) {
  const [postcode, setPostcode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [showManual, setShowManual] = useState(false);

  const handleSearch = async () => {
    if (!postcode.trim()) {
      toast.error('Please enter a postcode');
      return;
    }

    setIsSearching(true);
    setAddresses([]);

    try {
      const response = await base44.functions.invoke('postcodeLookup', {
        postcode: postcode.trim().toUpperCase(),
      });

      if (response.data?.addresses && response.data.addresses.length > 0) {
        setAddresses(response.data.addresses);
      } else {
        toast.info('No addresses found. Please enter manually.');
        setShowManual(true);
      }
    } catch (error) {
      console.error('Postcode lookup error:', error);
      toast.error('Postcode lookup failed. Please enter manually.');
      setShowManual(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddressChange = (value) => {
    const selected = addresses.find((addr) => addr.formatted === value);
    if (selected) {
      onAddressSelect({
        name_number: selected.building_number || selected.building_name || '',
        street: selected.thoroughfare || selected.line_1 || '',
        additional_field: selected.line_2 || '',
        town: selected.town_or_city || '',
        city: selected.town_or_city || selected.county || '',
        county: selected.county || '',
        post_code: selected.postcode || postcode.toUpperCase(),
      });
      setAddresses([]);
      setPostcode('');
    }
  };

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2">
        <MapPin className="h-4 w-4" />
        Address Lookup
      </Label>
      
      <div className="flex gap-2">
        <Input
          placeholder="Enter postcode (e.g., SW1A 1AA)"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleSearch}
          disabled={isSearching}
        >
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>

      {addresses.length > 0 && (
        <Select onValueChange={handleAddressChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select an address..." />
          </SelectTrigger>
          <SelectContent>
            {addresses.map((addr, index) => (
              <SelectItem key={index} value={addr.formatted}>
                {addr.formatted}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {!showManual && addresses.length === 0 && (
        <button
          type="button"
          onClick={() => setShowManual(true)}
          className="text-sm text-primary hover:underline"
        >
          Enter address manually
        </button>
      )}
    </div>
  );
}