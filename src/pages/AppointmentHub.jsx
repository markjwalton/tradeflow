import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, MapPin, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AppointmentHub() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");
  const appointmentToken = urlParams.get("appointment");
  const actionType = urlParams.get("action"); // 'change' or 'cancel'

  const [verifiedData, setVerifiedData] = useState(null);
  const [existingAppointment, setExistingAppointment] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verify token on load
  useEffect(() => {
    const verifyToken = async () => {
      if (appointmentToken) {
        // Managing existing appointment
        const appointments = await base44.entities.Appointment.filter({ confirmationToken: appointmentToken });
        if (appointments.length > 0) {
          setExistingAppointment(appointments[0]);
          setVerifiedData({
            firstName: appointments[0].customerFirstName,
            lastName: appointments[0].customerLastName,
            email: appointments[0].customerEmail,
            mobile: appointments[0].customerMobile,
            address: appointments[0].customerAddress,
          });
        } else {
          setError("Invalid or expired link");
        }
      } else if (token) {
        // New booking - verify email token
        const tokens = await base44.entities.EmailVerificationToken.filter({ token, used: false });
        if (tokens.length > 0 && new Date(tokens[0].expiresAt) > new Date()) {
          setVerifiedData(tokens[0].enquiryData);
          // Mark token as used
          await base44.entities.EmailVerificationToken.update(tokens[0].id, { used: true });
        } else {
          setError("Invalid or expired verification link");
        }
      } else {
        setError("No valid token provided");
      }
      setLoading(false);
    };
    verifyToken();
  }, [token, appointmentToken]);

  // Fetch available appointment blocks
  const { data: availableBlocks = [] } = useQuery({
    queryKey: ["availableBlocks"],
    queryFn: async () => {
      const blocks = await base44.entities.AppointmentBlock.filter({ isAvailable: true });
      const today = new Date().toISOString().split("T")[0];
      return blocks
        .filter(b => b.date >= today && b.currentBookings < (b.maxBookings || 1))
        .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
    },
    enabled: !!verifiedData,
  });

  // Group blocks by location
  const blocksByLocation = availableBlocks.reduce((acc, block) => {
    if (!acc[block.location]) acc[block.location] = [];
    acc[block.location].push(block);
    return acc;
  }, {});

  const handleCancelAppointment = async () => {
    if (!existingAppointment) return;
    setIsSubmitting(true);
    
    // Update appointment status
    await base44.entities.Appointment.update(existingAppointment.id, {
      status: "cancelled",
      cancelledAt: new Date().toISOString(),
    });

    // Release the block
    const blocks = await base44.entities.AppointmentBlock.filter({ id: existingAppointment.appointmentBlockId });
    if (blocks.length > 0) {
      await base44.entities.AppointmentBlock.update(blocks[0].id, {
        currentBookings: Math.max(0, (blocks[0].currentBookings || 1) - 1),
      });
    }

    // Send cancellation email
    await base44.integrations.Core.SendEmail({
      to: existingAppointment.customerEmail,
      subject: "Appointment Cancelled",
      body: `
        <h2>Appointment Cancelled</h2>
        <p>Dear ${existingAppointment.customerFirstName},</p>
        <p>Your appointment on ${format(new Date(existingAppointment.appointmentDate), "EEEE, d MMMM yyyy")} at ${existingAppointment.appointmentTime} has been cancelled.</p>
        <p>If you'd like to book a new appointment, please visit our website.</p>
        <br>
        <p>Best regards,<br>The Team</p>
      `,
    });

    toast.success("Appointment cancelled");
    setBookingComplete(true);
    setIsSubmitting(false);
  };

  const handleBookAppointment = async () => {
    if (!selectedBlock || !verifiedData) return;
    setIsSubmitting(true);

    const confirmationToken = Math.random().toString(36).substring(2) + Date.now().toString(36);

    // If changing existing appointment, cancel the old one first
    if (existingAppointment) {
      await base44.entities.Appointment.update(existingAppointment.id, {
        status: "rescheduled",
      });
      // Release old block
      const oldBlocks = await base44.entities.AppointmentBlock.filter({ id: existingAppointment.appointmentBlockId });
      if (oldBlocks.length > 0) {
        await base44.entities.AppointmentBlock.update(oldBlocks[0].id, {
          currentBookings: Math.max(0, (oldBlocks[0].currentBookings || 1) - 1),
        });
      }
    }

    // Create new appointment
    const appointment = await base44.entities.Appointment.create({
      appointmentBlockId: selectedBlock.id,
      customerFirstName: verifiedData.firstName,
      customerLastName: verifiedData.lastName,
      customerEmail: verifiedData.email,
      customerMobile: verifiedData.mobile,
      customerAddress: verifiedData.address,
      appointmentDate: selectedBlock.date,
      appointmentTime: selectedBlock.startTime,
      location: selectedBlock.location,
      customerComments: comments,
      status: "pending_confirmation",
      bookingSource: "online",
      confirmationToken,
    });

    // Update block booking count
    await base44.entities.AppointmentBlock.update(selectedBlock.id, {
      currentBookings: (selectedBlock.currentBookings || 0) + 1,
    });

    // Create enquiry if new booking
    if (!existingAppointment) {
      await base44.entities.Enquiry.create({
        firstName: verifiedData.firstName,
        lastName: verifiedData.lastName,
        mobile: verifiedData.mobile,
        email: verifiedData.email,
        address: verifiedData.address,
        initialRequirements: verifiedData.interestedIn || "",
        source: "website",
        status: "qualified",
        notes: `Design visit booked: ${format(new Date(selectedBlock.date), "d MMM yyyy")} at ${selectedBlock.startTime}`,
      });
    }

    // Send confirmation request email
    const confirmLink = `${window.location.origin}/AppointmentConfirm?token=${confirmationToken}`;
    await base44.integrations.Core.SendEmail({
      to: verifiedData.email,
      subject: "Please Confirm Your Design Visit Appointment",
      body: `
        <h2>Hello ${verifiedData.firstName},</h2>
        <p>Thank you for booking a design visit with us!</p>
        <h3>Appointment Details:</h3>
        <ul>
          <li><strong>Date:</strong> ${format(new Date(selectedBlock.date), "EEEE, d MMMM yyyy")}</li>
          <li><strong>Time:</strong> ${selectedBlock.startTime}</li>
          <li><strong>Location Area:</strong> ${selectedBlock.location}</li>
        </ul>
        <p>Please confirm your appointment by clicking the button below:</p>
        <p><a href="${confirmLink}" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Confirm Appointment</a></p>
        <p style="margin-top: 20px;">Need to make changes?</p>
        <p>
          <a href="${window.location.origin}/AppointmentHub?appointment=${confirmationToken}&action=change">Change Appointment</a> | 
          <a href="${window.location.origin}/AppointmentHub?appointment=${confirmationToken}&action=cancel">Cancel Appointment</a>
        </p>
        <br>
        <p>Best regards,<br>The Team</p>
      `,
    });

    toast.success("Appointment booked! Please check your email to confirm.");
    setBookingComplete(true);
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-charcoal)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-[var(--color-background-muted)] bg-[var(--color-background-paper)]">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-destructive)]/10 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-[var(--color-destructive)]" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-[var(--color-midnight)]">Link Invalid</h2>
            <p className="text-[var(--color-charcoal)]">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-[var(--color-background-muted)] bg-[var(--color-background-paper)]">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-success)]/10 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-[var(--color-success)]" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-[var(--color-midnight)]">
              {actionType === "cancel" ? "Appointment Cancelled" : "Appointment Booked!"}
            </h2>
            <p className="text-[var(--color-charcoal)]">
              {actionType === "cancel"
                ? "Your appointment has been cancelled."
                : "Please check your email and click the confirmation link to confirm your appointment."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show cancellation confirmation
  if (actionType === "cancel" && existingAppointment) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-[var(--color-background-muted)] bg-[var(--color-background-paper)]">
          <CardHeader>
            <CardTitle className="text-center text-[var(--color-midnight)]">Cancel Appointment?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-[var(--color-background)] rounded-lg p-4">
              <p className="font-medium text-[var(--color-midnight)]">{format(new Date(existingAppointment.appointmentDate), "EEEE, d MMMM yyyy")}</p>
              <p className="text-[var(--color-charcoal)]">{existingAppointment.appointmentTime} - {existingAppointment.location}</p>
            </div>
            <p className="text-[var(--color-charcoal)] text-center">Are you sure you want to cancel this appointment?</p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => window.history.back()}
              >
                Keep Appointment
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleCancelAppointment}
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Cancel Appointment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6 border-[var(--color-background-muted)] bg-[var(--color-background-paper)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[var(--color-midnight)]">
              <Calendar className="h-6 w-6" />
              {existingAppointment ? "Change Your Appointment" : "Book Your Design Visit"}
            </CardTitle>
            <p className="text-[var(--color-charcoal)]">
              Hello {verifiedData?.firstName}, select an available time slot below
            </p>
          </CardHeader>
        </Card>

        {Object.keys(blocksByLocation).length === 0 ? (
          <Card className="border-[var(--color-background-muted)] bg-[var(--color-background-paper)]">
            <CardContent className="py-8 text-center text-[var(--color-charcoal)]">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No available appointment slots at the moment.</p>
              <p className="text-sm">Please check back later or request a callback.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {Object.entries(blocksByLocation).map(([location, blocks]) => (
              <Card key={location} className="mb-4 border-[var(--color-background-muted)] bg-[var(--color-background-paper)]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2 text-[var(--color-midnight)]">
                    <MapPin className="h-5 w-5" />
                    {location}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {blocks.map((block) => (
                      <button
                        key={block.id}
                        onClick={() => setSelectedBlock(block)}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          selectedBlock?.id === block.id
                            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                            : "border-[var(--color-background-muted)] hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-background)]"
                        }`}
                      >
                        <div className="font-medium text-[var(--color-midnight)]">
                          {format(new Date(block.date), "EEE, d MMM")}
                        </div>
                        <div className="flex items-center gap-1 text-[var(--color-charcoal)] mt-1">
                          <Clock className="h-4 w-4" />
                          {block.startTime}
                          {block.endTime && ` - ${block.endTime}`}
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {selectedBlock && (
              <Card className="mt-6 border-[var(--color-background-muted)] bg-[var(--color-background-paper)]">
                <CardHeader>
                  <CardTitle className="text-lg text-[var(--color-midnight)]">Complete Your Booking</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-[var(--color-primary)]/10 rounded-lg p-4">
                    <p className="font-medium text-[var(--color-midnight)]">Selected Appointment:</p>
                    <p className="text-[var(--color-midnight)]">{format(new Date(selectedBlock.date), "EEEE, d MMMM yyyy")} at {selectedBlock.startTime}</p>
                    <p className="text-[var(--color-charcoal)]">{selectedBlock.location}</p>
                  </div>

                  <div>
                    <Label>Additional Comments (optional)</Label>
                    <Textarea
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="Any specific requirements or notes for your visit..."
                      rows={3}
                    />
                  </div>

                  <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 text-sm">
                    <p className="font-medium text-warning-foreground">Important:</p>
                    <p className="text-warning-foreground">
                      After booking, you will receive an email asking you to confirm your appointment. 
                      Please click the confirmation link to secure your slot.
                    </p>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleBookAppointment}
                    disabled={isSubmitting}
                  >
                    {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {existingAppointment ? "Change to This Appointment" : "Book This Appointment"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}