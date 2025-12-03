import React, { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Loader2, Mail, AlertTriangle } from "lucide-react";

/**
 * EmailValidationField - Email input with optional API validation
 * 
 * Props:
 * - apiKey: Email validation API key (optional - uses basic validation if not provided)
 * - value: current email value
 * - onChange: standard onChange handler
 * - onValidationResult: callback with validation result { valid, reason, suggestion }
 * - required: boolean
 * - disabled: boolean
 * - validateOnBlur: validate when field loses focus (default: true)
 * - showValidationIcon: show check/x icon (default: true)
 */
export default function EmailValidationField({
  apiKey,
  value = "",
  onChange,
  onValidationResult,
  required = false,
  disabled = false,
  validateOnBlur = true,
  showValidationIcon = true,
  label = "Email Address",
  placeholder = "Enter email address"
}) {
  const [validationState, setValidationState] = useState(null); // null, 'valid', 'invalid', 'warning'
  const [validationMessage, setValidationMessage] = useState("");
  const [suggestion, setSuggestion] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const debounceRef = useRef(null);

  // Basic email regex validation
  const basicEmailValidation = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Check for common typos in domain
  const checkCommonTypos = (email) => {
    const domain = email.split("@")[1]?.toLowerCase();
    const typoMap = {
      "gmial.com": "gmail.com",
      "gmal.com": "gmail.com",
      "gamil.com": "gmail.com",
      "gnail.com": "gmail.com",
      "hotmal.com": "hotmail.com",
      "hotmial.com": "hotmail.com",
      "hotmil.com": "hotmail.com",
      "outlok.com": "outlook.com",
      "outloo.com": "outlook.com",
      "yahooo.com": "yahoo.com",
      "yaho.com": "yahoo.com",
      "iclud.com": "icloud.com",
      "icould.com": "icloud.com"
    };
    
    if (typoMap[domain]) {
      return email.replace(domain, typoMap[domain]);
    }
    return null;
  };

  // Validate email (basic or API-based)
  const validateEmail = async (email) => {
    if (!email) {
      setValidationState(null);
      setValidationMessage("");
      setSuggestion(null);
      return;
    }

    // Basic format check first
    if (!basicEmailValidation(email)) {
      setValidationState("invalid");
      setValidationMessage("Invalid email format");
      setSuggestion(null);
      if (onValidationResult) onValidationResult({ valid: false, reason: "Invalid format" });
      return;
    }

    // Check for common typos
    const typoSuggestion = checkCommonTypos(email);
    if (typoSuggestion) {
      setValidationState("warning");
      setValidationMessage("Did you mean:");
      setSuggestion(typoSuggestion);
      if (onValidationResult) onValidationResult({ valid: true, warning: true, suggestion: typoSuggestion });
      return;
    }

    // If API key provided, do advanced validation
    if (apiKey) {
      setIsValidating(true);
      try {
        // This is a placeholder for email validation API integration
        // Common services: ZeroBounce, NeverBounce, Hunter.io, etc.
        // For now, we'll use basic validation
        
        // Example API call structure (uncomment and modify for your chosen service):
        // const response = await fetch(`https://api.emailvalidation.com/validate?email=${encodeURIComponent(email)}&api_key=${apiKey}`);
        // const data = await response.json();
        
        // Simulate API response for now
        await new Promise(r => setTimeout(r, 500));
        
        setValidationState("valid");
        setValidationMessage("Email looks valid");
        setSuggestion(null);
        if (onValidationResult) onValidationResult({ valid: true });
      } catch (err) {
        // Fall back to basic validation on API error
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
      setSuggestion(null);
      if (onValidationResult) onValidationResult({ valid: true });
    }
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    if (onChange) onChange(newValue);
    
    // Reset validation on change
    setValidationState(null);
    setValidationMessage("");
    setSuggestion(null);
  };

  const handleBlur = () => {
    if (validateOnBlur && value) {
      validateEmail(value);
    }
  };

  const applySuggestion = () => {
    if (suggestion && onChange) {
      onChange(suggestion);
      setValidationState("valid");
      setValidationMessage("");
      setSuggestion(null);
      if (onValidationResult) onValidationResult({ valid: true });
    }
  };

  return (
    <div className="space-y-1">
      <Label className="mb-1.5 block">
        <Mail className="h-4 w-4 inline mr-1" />
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      <div className="relative">
        <Input
          type="email"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`pr-10 ${
            validationState === "invalid" ? "border-red-300 focus:ring-red-500" :
            validationState === "warning" ? "border-amber-300 focus:ring-amber-500" :
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
            {!isValidating && validationState === "warning" && (
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            )}
          </div>
        )}
      </div>
      
      {validationMessage && (
        <p className={`text-sm ${
          validationState === "invalid" ? "text-red-500" :
          validationState === "warning" ? "text-amber-600" : "text-green-600"
        }`}>
          {validationMessage}
          {suggestion && (
            <button
              type="button"
              onClick={applySuggestion}
              className="ml-1 underline hover:no-underline font-medium"
            >
              {suggestion}
            </button>
          )}
        </p>
      )}
    </div>
  );
}