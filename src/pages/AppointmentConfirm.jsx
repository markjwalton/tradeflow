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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Confirmation Failed</h2>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">
            {alreadyConfirmed ? "Already Confirmed" : "Appointment Confirmed!"}
          </h2>
          <p className="text-gray-600 mb-4">
            {alreadyConfirmed
              ? "This appointment was already confirmed."
              : "Thank you for confirming your design visit."}
          </p>
          
          {appointment && (
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                <span className="font-medium">Appointment Details</span>
              </div>
              <p className="text-gray-600">
                {format(new Date(appointment.appointmentDate), "EEEE, d MMMM yyyy")}
              </p>
              <p className="text-gray-600">{appointment.appointmentTime}</p>
              <p className="text-gray-600">{appointment.location}</p>
            </div>
          )}

          <p className="text-sm text-gray-500 mt-4">
            A confirmation email has been sent to you.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}