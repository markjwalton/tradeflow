import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MapPin, Mail, Phone, CheckCircle2, Search, AlertTriangle } from "lucide-react";

import PostcodeLookupField from "@/components/forms/PostcodeLookupField";
import AddressFinderField from "@/components/forms/AddressFinderField";
import EmailValidationField from "@/components/forms/EmailValidationField";
import PhoneValidationField from "@/components/forms/PhoneValidationField";

// API Keys - set these in Base44 secrets
const API_KEYS = {
  postcode: "ak_m5gn84f4gKvyFVmZHPWH3xYlod6vR", // IDEAL_POSTCODES_API_KEY - Active
  address: "", // IDEAL_POSTCODES_ADDRESS_KEY - Pending
  email: "", // IDEAL_POSTCODES_EMAIL_KEY - Pending
  phone: "", // IDEAL_POSTCODES_PHONE_KEY - Pending
};

export default function LookupTestForms() {
  const [postcodeResult, setPostcodeResult] = useState(null);
  const [addressValue, setAddressValue] = useState({});
  const [emailValue, setEmailValue] = useState("");
  const [phoneValue, setPhoneValue] = useState("");
  const [results, setResults] = useState({ address: null, email: null, phone: null });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
          Lookup API Test Forms
        </h1>
        <p className="text-gray-500">Test Address Finder, Email Validation, and Phone Validation APIs</p>
      </div>

      <Tabs defaultValue="postcode" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="postcode" className="gap-2">
            <Search className="h-4 w-4" />
            Postcode Lookup
          </TabsTrigger>
          <TabsTrigger value="address" className="gap-2">
            <MapPin className="h-4 w-4" />
            Address Finder
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-2">
            <Mail className="h-4 w-4" />
            Email Validation
          </TabsTrigger>
          <TabsTrigger value="phone" className="gap-2">
            <Phone className="h-4 w-4" />
            Phone Validation
          </TabsTrigger>
        </TabsList>

        {/* Postcode Lookup Test */}
        <TabsContent value="postcode">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-green-600" />
                UK Postcode Lookup
                <Badge className="bg-green-100 text-green-700">Active</Badge>
              </CardTitle>
              <p className="text-sm text-gray-500">
                Enter a UK postcode to find all addresses at that location.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <PostcodeLookupField
                apiKey={API_KEYS.postcode}
                onAddressSelect={(addr) => setPostcodeResult(addr)}
                required
              />

              {postcodeResult && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Selected Address
                  </h4>
                  <pre className="text-xs bg-white p-3 rounded overflow-auto">
                    {JSON.stringify(postcodeResult, null, 2)}
                  </pre>
                </div>
              )}

              <div className="text-sm text-gray-500 space-y-1">
                <p><strong>Test postcodes:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li><code>SW1A 1AA</code> - Buckingham Palace</li>
                  <li><code>EC1A 1BB</code> - London</li>
                  <li><code>M1 1AE</code> - Manchester</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Address Finder Test */}
        <TabsContent value="address">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                UK Address Finder
                {!API_KEYS.address && <Badge className="bg-amber-100 text-amber-700">API Key Pending</Badge>}
              </CardTitle>
              <p className="text-sm text-gray-500">
                Start typing an address or postcode to search. Uses Ideal Postcodes API.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {!API_KEYS.address && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">API Key Required</p>
                    <p className="text-sm text-amber-700">Set IDEAL_POSTCODES_ADDRESS_KEY in Base44 secrets to enable this feature.</p>
                  </div>
                </div>
              )}
              <AddressFinderField
                apiKey={API_KEYS.address}
                value={addressValue}
                onChange={setAddressValue}
                onAddressSelect={(addr) => {
                  setAddressValue(addr);
                  setResults({ ...results, address: addr });
                }}
                required
                showManualEntry
                disabled={!API_KEYS.address}
              />

              {results.address && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Selected Address
                  </h4>
                  <pre className="text-xs bg-white p-3 rounded overflow-auto">
                    {JSON.stringify(results.address, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Validation Test */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-purple-600" />
                Email Validation
                {!API_KEYS.email && <Badge className="bg-amber-100 text-amber-700">API Key Pending</Badge>}
              </CardTitle>
              <p className="text-sm text-gray-500">
                Enter an email address to validate. Includes typo detection and API verification.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {!API_KEYS.email && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">API Key Required</p>
                    <p className="text-sm text-amber-700">Set IDEAL_POSTCODES_EMAIL_KEY in Base44 secrets. Basic validation still works without API.</p>
                  </div>
                </div>
              )}
              <EmailValidationField
                apiKey={API_KEYS.email}
                value={emailValue}
                onChange={setEmailValue}
                onValidationResult={(result) => setResults({ ...results, email: result })}
                required
                validateOnBlur
              />

              {results.email && (
                <div className={`mt-4 p-4 rounded-lg border ${
                  results.email.valid ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                }`}>
                  <h4 className={`font-medium mb-2 flex items-center gap-2 ${
                    results.email.valid ? "text-green-800" : "text-red-800"
                  }`}>
                    <CheckCircle2 className="h-4 w-4" />
                    Validation Result
                  </h4>
                  <pre className="text-xs bg-white p-3 rounded overflow-auto">
                    {JSON.stringify(results.email, null, 2)}
                  </pre>
                </div>
              )}

              <div className="text-sm text-gray-500 space-y-1">
                <p><strong>Test emails:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li><code>test@gmial.com</code> - Typo detection</li>
                  <li><code>valid@example.com</code> - Valid format</li>
                  <li><code>invalid</code> - Invalid format</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Phone Validation Test */}
        <TabsContent value="phone">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-amber-600" />
                UK Phone Validation
                {!API_KEYS.phone && <Badge className="bg-amber-100 text-amber-700">API Key Pending</Badge>}
              </CardTitle>
              <p className="text-sm text-gray-500">
                Enter a UK phone number to validate. Supports mobile and landline formats.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {!API_KEYS.phone && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">API Key Required</p>
                    <p className="text-sm text-amber-700">Set IDEAL_POSTCODES_PHONE_KEY in Base44 secrets. Basic format validation still works.</p>
                  </div>
                </div>
              )}
              <PhoneValidationField
                apiKey={API_KEYS.phone}
                value={phoneValue}
                onChange={setPhoneValue}
                onValidationResult={(result) => setResults({ ...results, phone: result })}
                required
                validateOnBlur
              />

              {results.phone && (
                <div className={`mt-4 p-4 rounded-lg border ${
                  results.phone.valid ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                }`}>
                  <h4 className={`font-medium mb-2 flex items-center gap-2 ${
                    results.phone.valid ? "text-green-800" : "text-red-800"
                  }`}>
                    <CheckCircle2 className="h-4 w-4" />
                    Validation Result
                  </h4>
                  <pre className="text-xs bg-white p-3 rounded overflow-auto">
                    {JSON.stringify(results.phone, null, 2)}
                  </pre>
                </div>
              )}

              <div className="text-sm text-gray-500 space-y-1">
                <p><strong>Test phone numbers:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li><code>07700900123</code> - UK Mobile</li>
                  <li><code>02071234567</code> - UK Landline</li>
                  <li><code>+44 7700 900 123</code> - International format</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* API Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">API Keys Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <Badge className="bg-green-100 text-green-700 mb-2">Postcode</Badge>
              <p className="text-xs text-gray-600 mb-1">IDEAL_POSTCODES_API_KEY</p>
              <Badge className="bg-green-500 text-white text-xs">Active</Badge>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <Badge className="bg-amber-100 text-amber-700 mb-2">Address</Badge>
              <p className="text-xs text-gray-600 mb-1">IDEAL_POSTCODES_ADDRESS_KEY</p>
              <Badge className="bg-amber-500 text-white text-xs">Pending</Badge>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <Badge className="bg-amber-100 text-amber-700 mb-2">Email</Badge>
              <p className="text-xs text-gray-600 mb-1">IDEAL_POSTCODES_EMAIL_KEY</p>
              <Badge className="bg-amber-500 text-white text-xs">Pending</Badge>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <Badge className="bg-amber-100 text-amber-700 mb-2">Phone</Badge>
              <p className="text-xs text-gray-600 mb-1">IDEAL_POSTCODES_PHONE_KEY</p>
              <Badge className="bg-amber-500 text-white text-xs">Pending</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}