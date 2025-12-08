import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle, AlertCircle, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function AppointmentConfirm() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState(null);
  const [error, setError] = useState(null);
  const [alreadyConfirmed, setAlreadyConfirmed] = useState(false);

  useEffect(() => {
    const confirmAppointment = async () => {
      if (!token) {
        setError("No confirmation token provided");
        setLoading(false);
        return;
      }

      const appointments = await base44.entities.Appointment.filter({ confirmationToken: token });
      
      if (appointments.length === 0) {
        setError("Invalid confirmation link");
        setLoading(false);
        return;
      }

      const apt = appointments[0];
      
      if (apt.status === "confirmed") {
        setAppointment(apt);
        setAlreadyConfirmed(true);
        setLoading(false);
        return;
      }

      if (apt.status === "cancelled" || apt.status === "rescheduled") {
        setError("This appointment has been cancelled or rescheduled");
        setLoading(false);
        return;
      }

      // Confirm the appointment
      await base44.entities.Appointment.update(apt.id, {
        status: "confirmed",
        confirmedAt: new Date().toISOString(),
      });

      // Send final confirmation email
      await base44.integrations.Core.SendEmail({
        to: apt.customerEmail,
        subject: "Appointment Confirmed - Design Visit",
        body: `
          <h2>Your Appointment is Confirmed!</h2>
          <p>Dear ${apt.customerFirstName},</p>
          <p>Thank you for confirming your design visit appointment.</p>
          <h3>Appointment Details:</h3>
          <ul>
            <li><strong>Date:</strong> ${format(new Date(apt.appointmentDate), "EEEE, d MMMM yyyy")}</li>
            <li><strong>Time:</strong> ${apt.appointmentTime}</li>
            <li><strong>Location Area:</strong> ${apt.location}</li>
            <li><strong>Address:</strong> ${apt.customerAddress}</li>
          </ul>
          <p>We look forward to meeting you!</p>
          <p style="margin-top: 20px;">Need to make changes?</p>
          <p>
            <a href="${window.location.origin}/AppointmentHub?appointment=${token}&action=change">Change Appointment</a> | 
            <a href="${window.location.origin}/AppointmentHub?appointment=${token}&action=cancel">Cancel Appointment</a>
          </p>
          <br>
          <p>Best regards,<br>The Team</p>
        `,
      });

      setAppointment({ ...apt, status: "confirmed" });
      setLoading(false);
    };

    confirmAppointment();
  }, [token]);

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
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive-50 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-destructive-700" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-[var(--color-midnight)]">Confirmation Failed</h2>
            <p className="text-[var(--color-charcoal)]">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-[var(--color-background-muted)] bg-[var(--color-background-paper)]">
        <CardContent className="pt-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success-50 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-success-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2 text-[var(--color-midnight)]">
            {alreadyConfirmed ? "Already Confirmed" : "Appointment Confirmed!"}
          </h2>
          <p className="text-[var(--color-charcoal)] mb-4">
            {alreadyConfirmed
              ? "This appointment was already confirmed."
              : "Thank you for confirming your design visit."}
          </p>
          
          {appointment && (
            <div className="bg-[var(--color-background)] rounded-lg p-4 text-left">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-[var(--color-charcoal)]" />
                <span className="font-medium text-[var(--color-midnight)]">Appointment Details</span>
              </div>
              <p className="text-[var(--color-charcoal)]">
                {format(new Date(appointment.appointmentDate), "EEEE, d MMMM yyyy")}
              </p>
              <p className="text-[var(--color-charcoal)]">{appointment.appointmentTime}</p>
              <p className="text-[var(--color-charcoal)]">{appointment.location}</p>
            </div>
          )}

          <p className="text-sm text-[var(--color-charcoal)] mt-4">
            A confirmation email has been sent to you.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}