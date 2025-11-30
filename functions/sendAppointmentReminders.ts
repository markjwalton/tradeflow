import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// This function should be called daily (e.g., via cron/scheduled task)
// It sends reminder emails for appointments happening tomorrow

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Calculate tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    // Get all confirmed appointments for tomorrow that haven't had reminders sent
    const appointments = await base44.asServiceRole.entities.Appointment.filter({
      appointmentDate: tomorrowStr,
      status: 'confirmed',
      reminderSent: false,
    });
    
    const results = [];
    
    for (const apt of appointments) {
      // Format the date nicely
      const dateObj = new Date(apt.appointmentDate);
      const formattedDate = dateObj.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      
      // Send reminder email
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: apt.customerEmail,
        subject: 'Reminder: Your Design Visit is Tomorrow',
        body: `
          <h2>Hello ${apt.customerFirstName},</h2>
          <p>This is a friendly reminder that your design visit appointment is <strong>tomorrow</strong>.</p>
          <h3>Appointment Details:</h3>
          <ul>
            <li><strong>Date:</strong> ${formattedDate}</li>
            <li><strong>Time:</strong> ${apt.appointmentTime}</li>
            <li><strong>Location Area:</strong> ${apt.location}</li>
            <li><strong>Your Address:</strong> ${apt.customerAddress}</li>
          </ul>
          <p>We look forward to meeting you!</p>
          <p style="margin-top: 20px;">Need to make changes?</p>
          <p>
            <a href="${Deno.env.get('APP_URL') || 'https://yourapp.base44.app'}/AppointmentHub?appointment=${apt.confirmationToken}&action=change">Change Appointment</a> | 
            <a href="${Deno.env.get('APP_URL') || 'https://yourapp.base44.app'}/AppointmentHub?appointment=${apt.confirmationToken}&action=cancel">Cancel Appointment</a>
          </p>
          <br>
          <p>Best regards,<br>The Team</p>
        `,
      });
      
      // Mark reminder as sent
      await base44.asServiceRole.entities.Appointment.update(apt.id, {
        reminderSent: true,
      });
      
      results.push({
        appointmentId: apt.id,
        email: apt.customerEmail,
        status: 'sent',
      });
    }
    
    return Response.json({
      success: true,
      date: tomorrowStr,
      remindersSent: results.length,
      results,
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});