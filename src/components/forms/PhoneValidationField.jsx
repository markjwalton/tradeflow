import React, { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Loader2, Phone, AlertTriangle } from "lucide-react";

/**
 * PhoneValidationField - UK Phone validation using Ideal Postcodes API
 * 
 * Props:
 * - apiKey: Ideal Postcodes API key
 * - value: current phone value
 * - onChange: standard onChange handler
 * - onValidationResult: callback with validation result
 * - required: boolean
 * - disabled: boolean
 * - validateOnBlur: validate when field loses focus (default: true)
 */
export default function PhoneValidationField({
  apiKey,
  value = "",
  onChange,
  onValidationResult,
  required = false,
  disabled = false,
  validateOnBlur = true,
  showValidationIcon = true,
  label = "Phone Number",
  placeholder = "Enter phone number"
}) {
  const [validationState, setValidationState] = useState(null);
  const [validationMessage, setValidationMessage] = useState("");
  const [formattedNumber, setFormattedNumber] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  // Basic UK phone format check
  const basicPhoneValidation = (phone) => {
    const cleaned = phone.replace(/[\s\-\(\)]/g, "");
    // UK phone: starts with 0 or +44, followed by digits
    const ukRegex = /^(\+44|0044|0)[1-9]\d{8,10}$/;
    return ukRegex.test(cleaned);
  };

  // Validate phone via Ideal Postcodes API
  const validatePhone = async (phone) => {
    if (!phone) {
      setValidationState(null);
      setValidationMessage("");
      setFormattedNumber(null);
      return;
    }

    // Basic format check first
    if (!basicPhoneValidation(phone)) {
      setValidationState("invalid");
      setValidationMessage("Invalid UK phone format");
      setFormattedNumber(null);
      if (onValidationResult) onValidationResult({ valid: false, reason: "Invalid format" });
      return;
    }

    // If API key provided, do API validation
    if (apiKey) {
      setIsValidating(true);
      try {
        const response = await fetch(
          `https://api.ideal-postcodes.co.uk/v1/phone_numbers/${encodeURIComponent(phone)}?api_key=${apiKey}`
        );
        const data = await response.json();
        
        if (data.result) {
          const result = data.result;
          if (result.valid) {
            setValidationState("valid");
            setValidationMessage(result.phone_type ? `Valid ${result.phone_type}` : "Valid phone number");
            setFormattedNumber(result.formatted_number || null);
            if (onValidationResult) onValidationResult({ 
              valid: true, 
              phoneType: result.phone_type,
              formatted: result.formatted_number 
            });
          } else {
            setValidationState("invalid");
            setValidationMessage("Invalid phone number");
            setFormattedNumber(null);
            if (onValidationResult) onValidationResult({ valid: false });
          }
        } else {
          // API error - fall back to basic validation
          setValidationState("valid");
          setValidationMessage("");
          if (onValidationResult) onValidationResult({ valid: true });
        }
      } catch (err) {
        // Fall back to basic validation on error
        setValidationState("valid");
        setValidationMessage("");
        if (onValidationResult) onValidationResult({ valid: true });
      } finally {
        setIsValidating(false);
      }
    } else {
      // No API key - basic validation passed
      setValidationState("valid");
      setValidationMessage("");
      if (onValidationResult) onValidationResult({ valid: true });
    }
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    if (onChange) onChange(newValue);
    
    // Reset validation on change
    setValidationState(null);
    setValidationMessage("");
    setFormattedNumber(null);
  };

  const handleBlur = () => {
    if (validateOnBlur && value) {
      validatePhone(value);
    }
  };

  const applyFormatted = () => {
    if (formattedNumber && onChange) {
      onChange(formattedNumber);
    }
  };

  return (
    <div className="space-y-1">
      <Label className="mb-1.5 block">
        <Phone className="h-4 w-4 inline mr-1" />
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      <div className="relative">
        <Input
          type="tel"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`pr-10 ${
            validationState === "invalid" ? "border-red-300 focus:ring-red-500" :
            validationState === "valid" ? "border-green-300 focus:ring-green-500" : ""
          }`}
        />
        
        {showValidationIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isValidating && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
            {!isValidating && validationState === "valid" && (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            )}
            {!isValidating && validationState === "invalid" && (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
        )}
      </div>
      
      {validationMessage && (
        <p className={`text-sm ${
          validationState === "invalid" ? "text-red-500" : "text-green-600"
        }`}>
          {validationMessage}
          {formattedNumber && formattedNumber !== value && (
            <button
              type="button"
              onClick={applyFormatted}
              className="ml-2 underline hover:no-underline text-blue-600"
            >
              Use: {formattedNumber}
            </button>
          )}
        </p>
      )}
    </div>
  );
}