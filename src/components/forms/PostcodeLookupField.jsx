import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Loader2, MapPin } from "lucide-react";
import { base44 } from "@/api/base44Client";

/**
 * PostcodeLookupField - UK Postcode lookup using Ideal Postcodes API
 * 
 * Props:
 * - apiKey: Ideal Postcodes API key (optional - uses backend function if not provided)
 * - useBackend: boolean - if true, uses backend function with secret
 * - onAddressSelect: callback with selected address
 * - required: boolean
 * - disabled: boolean
 */
export default function PostcodeLookupField({
  apiKey,
  useBackend = true,
  onAddressSelect,
  required = false,
  disabled = false,
  label = "Postcode Lookup"
}) {
  const [postcode, setPostcode] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const lookupPostcode = async () => {
    if (!postcode.trim()) return;
    
    setIsLoading(true);
    setError("");
    setAddresses([]);
    setSelectedAddress(null);

    try {
      const cleanPostcode = postcode.replace(/\s/g, "").toUpperCase();
      let data;
      
      if (useBackend) {
        // Use backend function which has access to the secret
        const response = await base44.functions.invoke('postcodeLookup', { postcode: cleanPostcode });
        data = response.data;
      } else if (apiKey) {
        // Direct API call with provided key
        const response = await fetch(
          `https://api.ideal-postcodes.co.uk/v1/postcodes/${encodeURIComponent(cleanPostcode)}?api_key=${apiKey}`
        );
        data = await response.json();
      } else {
        setError("No API key configured");
        setIsLoading(false);
        return;
      }

      console.log("Postcode API response:", data);

      // Check for successful response with results
      if (data.result && Array.isArray(data.result) && data.result.length > 0) {
        setAddresses(data.result);
      } else if (data.code === 4040 || data.code === "4040") {
        setError("Postcode not found");
      } else if (data.code === 4010 || data.code === "4010") {
        setError("Invalid API key");
      } else if (data.code === 4020 || data.code === "4020") {
        setError("API key exhausted - no credits remaining");
      } else if (data.code === 4021 || data.code === "4021") {
        setError("Daily limit reached");
      } else if (data.code === 4022 || data.code === "4022") {
        setError("API key not active for this service");
      } else if (data.error) {
        setError(data.error);
      } else if (data.message) {
        setError(data.message);
      } else {
        setError("No addresses found for this postcode");
      }
    } catch (err) {
      console.error("Postcode lookup error:", err);
      setError("Failed to lookup postcode: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const selectAddress = (address) => {
    const formatted = {
      line_1: address.line_1,
      line_2: address.line_2,
      line_3: address.line_3,
      post_town: address.post_town,
      county: address.county,
      postcode: address.postcode,
      country: address.country,
      udprn: address.udprn,
      full_address: [address.line_1, address.line_2, address.line_3, address.post_town, address.postcode]
        .filter(Boolean)
        .join(", ")
    };
    setSelectedAddress(formatted);
    if (onAddressSelect) onAddressSelect(formatted);
  };

  return (
    <div className="space-y-3">
      <Label>
        <MapPin className="h-4 w-4 inline mr-1" />
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      <div className="flex gap-2">
        <Input
          value={postcode}
          onChange={(e) => setPostcode(e.target.value.toUpperCase())}
          placeholder="Enter postcode (e.g. SW1A 1AA)"
          disabled={disabled || isLoading}
          className="flex-1 font-mono"
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), lookupPostcode())}
        />
        <Button 
          type="button" 
          onClick={lookupPostcode} 
          disabled={disabled || isLoading || !postcode.trim()}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Find Address"}
        </Button>
      </div>

      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <XCircle className="h-4 w-4" />
          {error}
        </p>
      )}

      {addresses.length > 0 && !selectedAddress && (
        <div className="border rounded-lg max-h-60 overflow-y-auto">
          <div className="p-2 bg-gray-50 text-xs text-gray-500 border-b">
            {addresses.length} addresses found
          </div>
          {addresses.map((addr, i) => (
            <button
              key={addr.udprn || i}
              type="button"
              onClick={() => selectAddress(addr)}
              className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b last:border-b-0 text-sm"
            >
              {[addr.line_1, addr.line_2, addr.post_town].filter(Boolean).join(", ")}
            </button>
          ))}
        </div>
      )}

      {selectedAddress && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-green-800">Selected Address</p>
              <p className="text-sm text-green-700">{selectedAddress.full_address}</p>
            </div>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setSelectedAddress(null);
                setAddresses([]);
              }}
            >
              Change
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}