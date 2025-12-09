import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Phone, Calendar, CheckCircle, Mail } from "lucide-react";
import { toast } from "sonner";

export default function WebsiteEnquiryForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    email: "",
    address: "",
    interestedIn: "",
  });
  const [action, setAction] = useState(null); // 'callback' or 'book'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionType, setSubmissionType] = useState(null);

  const { data: interestOptions = [] } = useQuery({
    queryKey: ["interestOptions"],
    queryFn: async () => {
      const options = await base44.entities.InterestOption.filter({ isActive: true });
      return options.sort((a, b) => (a.order || 0) - (b.order || 0));
    },
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.mobile || !formData.address) {
      toast.error("Please fill in all required fields");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    return true;
  };

  const handleRequestCallback = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    
    // Create enquiry directly
    await base44.entities.Enquiry.create({
      firstName: formData.firstName,
      lastName: formData.lastName,
      mobile: formData.mobile,
      email: formData.email,
      address: formData.address,
      initialRequirements: formData.interestedIn,
      source: "website",
      status: "new",
      notes: "Requested callback",
    });

    setIsSubmitting(false);
    setSubmitted(true);
    setSubmissionType("callback");
    toast.success("Thank you! We'll call you back soon.");
  };

  const handleBookDesignVisit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);

    // Generate verification token
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // Store token with enquiry data
    await base44.entities.EmailVerificationToken.create({
      email: formData.email,
      token,
      enquiryData: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        mobile: formData.mobile,
        email: formData.email,
        address: formData.address,
        interestedIn: formData.interestedIn,
      },
      expiresAt,
      used: false,
    });

    // Send verification email
    const verificationLink = `${window.location.origin}/AppointmentHub?token=${token}`;
    await base44.integrations.Core.SendEmail({
      to: formData.email,
      subject: "Verify Your Email - Book Your Design Visit",
      body: `
        <h2>Hello ${formData.firstName},</h2>
        <p>Thank you for your interest in booking a design visit with us!</p>
        <p>Please click the link below to verify your email and access our appointment booking system:</p>
        <p><a href="${verificationLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Book Your Design Visit</a></p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <br>
        <p>Best regards,<br>The Team</p>
      `,
    });

    setIsSubmitting(false);
    setSubmitted(true);
    setSubmissionType("book");
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-border bg-card">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success-50 flex items-center justify-center">
              {submissionType === "callback" ? (
                <Phone className="h-8 w-8 text-success" />
              ) : (
                <Mail className="h-8 w-8 text-success" />
              )}
            </div>
            <h2 className="text-xl font-semibold mb-2 text-foreground">
              {submissionType === "callback" ? "Callback Requested!" : "Check Your Email!"}
            </h2>
            <p className="text-muted-foreground">
              {submissionType === "callback"
                ? "Thank you for your enquiry. One of our team will call you back shortly."
                : `We've sent a verification email to ${formData.email}. Please click the link to book your design visit.`}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-lg w-full border-border bg-card">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-foreground">Get Started</CardTitle>
          <p className="text-center text-muted-foreground">Tell us about your project</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>First Name *</Label>
              <Input
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                placeholder="John"
              />
            </div>
            <div>
              <Label>Surname *</Label>
              <Input
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                placeholder="Smith"
              />
            </div>
          </div>

          <div>
            <Label>Mobile *</Label>
            <Input
              value={formData.mobile}
              onChange={(e) => handleChange("mobile", e.target.value)}
              placeholder="07123 456789"
              type="tel"
            />
          </div>

          <div>
            <Label>Email Address *</Label>
            <Input
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="john@example.com"
              type="email"
            />
          </div>

          <div>
            <Label>Home Address *</Label>
            <Textarea
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="Enter your full address"
              rows={2}
            />
          </div>

          <div>
            <Label>What are you interested in?</Label>
            <Select
              value={formData.interestedIn}
              onValueChange={(v) => handleChange("interestedIn", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an option..." />
              </SelectTrigger>
              <SelectContent>
                {interestOptions.map((opt) => (
                  <SelectItem key={opt.id} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4 space-y-3">
            <Button
              className="w-full"
              variant="outline"
              size="lg"
              onClick={handleRequestCallback}
              disabled={isSubmitting}
            >
              {isSubmitting && action === "callback" && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              <Phone className="h-4 w-4 mr-2" />
              Request a Callback
            </Button>

            <Button
              className="w-full"
              size="lg"
              onClick={handleBookDesignVisit}
              disabled={isSubmitting}
            >
              {isSubmitting && action === "book" && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              <Calendar className="h-4 w-4 mr-2" />
              Book Design Visit Online
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}