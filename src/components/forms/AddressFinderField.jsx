import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Search, X } from "lucide-react";

/**
 * AddressFinderField - UK Address autocomplete using Ideal Postcodes API
 * 
 * Props:
 * - apiKey: Ideal Postcodes API key
 * - onAddressSelect: callback with { line_1, line_2, line_3, post_town, postcode, county, country }
 * - value: current address value object
 * - onChange: standard onChange for controlled component
 * - required: boolean
 * - disabled: boolean
 * - showManualEntry: allow manual address entry toggle
 */
export default function AddressFinderField({
  apiKey,
  onAddressSelect,
  value = {},
  onChange,
  required = false,
  disabled = false,
  showManualEntry = true,
  labels = {}
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);
  const [error, setError] = useState(null);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

  const fieldLabels = {
    search: "Start typing address or postcode...",
    line_1: "Address Line 1",
    line_2: "Address Line 2",
    line_3: "Address Line 3",
    post_town: "City / Town",
    postcode: "Postcode",
    county: "County",
    ...labels
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced address search
  const searchAddresses = async (query) => {
    if (!query || query.length < 3 || !apiKey) return;
    
    setIsSearching(true);
    setError(null);
    
    try {
      // Use Ideal Postcodes Autocomplete API
      const response = await fetch(
        `https://api.ideal-postcodes.co.uk/v1/autocomplete/addresses?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=10`
      );
      const data = await response.json();
      
      if (data.result && data.result.hits) {
        setSuggestions(data.result.hits);
        setShowSuggestions(true);
      } else if (data.code) {
        setError(data.message || "Address lookup failed");
        setSuggestions([]);
      }
    } catch (err) {
      setError("Failed to search addresses");
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Debounce search
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchAddresses(query), 300);
  };

  // Get full address details when user selects from autocomplete
  const selectAddress = async (suggestion) => {
    setIsSearching(true);
    
    try {
      // Use the UDPRN to get full address details
      const response = await fetch(
        `https://api.ideal-postcodes.co.uk/v1/udprn/${suggestion.udprn}?api_key=${apiKey}`
      );
      const data = await response.json();
      
      if (data.result) {
        const addr = data.result;
        const addressData = {
          line_1: addr.line_1 || "",
          line_2: addr.line_2 || "",
          line_3: addr.line_3 || "",
          post_town: addr.post_town || "",
          postcode: addr.postcode || "",
          county: addr.county || "",
          country: addr.country || "United Kingdom"
        };
        
        if (onAddressSelect) onAddressSelect(addressData);
        if (onChange) onChange(addressData);
        
        setSearchQuery("");
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (err) {
      setError("Failed to get address details");
    } finally {
      setIsSearching(false);
    }
  };

  // Postcode lookup (alternative method)
  const lookupPostcode = async (postcode) => {
    if (!postcode || !apiKey) return;
    
    setIsSearching(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://api.ideal-postcodes.co.uk/v1/postcodes/${encodeURIComponent(postcode)}?api_key=${apiKey}`
      );
      const data = await response.json();
      
      if (data.result && data.result.length > 0) {
        setSuggestions(data.result.map(addr => ({
          suggestion: `${addr.line_1}, ${addr.post_town}, ${addr.postcode}`,
          ...addr
        })));
        setShowSuggestions(true);
      } else {
        setError("No addresses found for this postcode");
      }
    } catch (err) {
      setError("Failed to lookup postcode");
    } finally {
      setIsSearching(false);
    }
  };

  const handleFieldChange = (field, val) => {
    const newValue = { ...value, [field]: val };
    if (onChange) onChange(newValue);
    if (onAddressSelect) onAddressSelect(newValue);
  };

  const clearAddress = () => {
    const emptyAddress = {
      line_1: "",
      line_2: "",
      line_3: "",
      post_town: "",
      postcode: "",
      county: "",
      country: ""
    };
    if (onChange) onChange(emptyAddress);
    if (onAddressSelect) onAddressSelect(emptyAddress);
  };

  const hasAddress = value?.line_1 || value?.postcode;

  return (
    <div ref={wrapperRef} className="space-y-3">
      {/* Search Input */}
      {!isManualMode && (
        <div className="relative">
          <Label className="mb-1.5 block">
            <MapPin className="h-4 w-4 inline mr-1" />
            Address Finder
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={fieldLabels.search}
              disabled={disabled}
              className="pl-10 pr-10"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
            )}
          </div>
          
          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 border-b last:border-b-0"
                  onClick={() => selectAddress(suggestion)}
                >
                  {suggestion.suggestion || `${suggestion.line_1}, ${suggestion.post_town}, ${suggestion.postcode}`}
                </button>
              ))}
            </div>
          )}
          
          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>
      )}

      {/* Selected Address Display / Manual Entry Fields */}
      {(hasAddress || isManualMode) && (
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              {isManualMode ? "Enter Address Manually" : "Selected Address"}
            </span>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={clearAddress}
              className="text-gray-400 hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid gap-3">
            <div>
              <Label className="text-xs">{fieldLabels.line_1}</Label>
              <Input
                value={value?.line_1 || ""}
                onChange={(e) => handleFieldChange("line_1", e.target.value)}
                disabled={disabled}
                required={required}
              />
            </div>
            <div>
              <Label className="text-xs">{fieldLabels.line_2}</Label>
              <Input
                value={value?.line_2 || ""}
                onChange={(e) => handleFieldChange("line_2", e.target.value)}
                disabled={disabled}
              />
            </div>
            <div>
              <Label className="text-xs">{fieldLabels.line_3}</Label>
              <Input
                value={value?.line_3 || ""}
                onChange={(e) => handleFieldChange("line_3", e.target.value)}
                disabled={disabled}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">{fieldLabels.post_town}</Label>
                <Input
                  value={value?.post_town || ""}
                  onChange={(e) => handleFieldChange("post_town", e.target.value)}
                  disabled={disabled}
                  required={required}
                />
              </div>
              <div>
                <Label className="text-xs">{fieldLabels.postcode}</Label>
                <Input
                  value={value?.postcode || ""}
                  onChange={(e) => handleFieldChange("postcode", e.target.value)}
                  disabled={disabled}
                  required={required}
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">{fieldLabels.county}</Label>
              <Input
                value={value?.county || ""}
                onChange={(e) => handleFieldChange("county", e.target.value)}
                disabled={disabled}
              />
            </div>
          </div>
        </div>
      )}

      {/* Manual Entry Toggle */}
      {showManualEntry && !hasAddress && !isManualMode && (
        <Button
          type="button"
          variant="link"
          size="sm"
          className="text-xs text-gray-500"
          onClick={() => setIsManualMode(true)}
        >
          Enter address manually
        </Button>
      )}
      
      {isManualMode && (
        <Button
          type="button"
          variant="link"
          size="sm"
          className="text-xs text-gray-500"
          onClick={() => setIsManualMode(false)}
        >
          Use address finder
        </Button>
      )}
    </div>
  );
}