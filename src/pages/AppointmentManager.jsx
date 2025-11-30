import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  Plus,
  Trash2,
  Loader2,
  MapPin,
  Clock,
  Users,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
} from "lucide-react";
import { toast } from "sonner";
import { format, addDays } from "date-fns";

const statusColors = {
  pending_confirmation: "bg-amber-100 text-amber-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-blue-100 text-blue-700",
  rescheduled: "bg-purple-100 text-purple-700",
};

export default function AppointmentManager() {
  const queryClient = useQueryClient();
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [blockForm, setBlockForm] = useState({
    date: "",
    startTime: "09:00",
    endTime: "10:00",
    location: "",
    maxBookings: 1,
  });

  // Fetch data
  const { data: appointments = [], isLoading: loadingAppointments } = useQuery({
    queryKey: ["appointments"],
    queryFn: () => base44.entities.Appointment.list("-created_date", 100),
  });

  const { data: blocks = [], isLoading: loadingBlocks } = useQuery({
    queryKey: ["appointmentBlocks"],
    queryFn: () => base44.entities.AppointmentBlock.list("-date", 100),
  });

  const { data: enquiries = [] } = useQuery({
    queryKey: ["callbackEnquiries"],
    queryFn: async () => {
      const all = await base44.entities.Enquiry.filter({ status: "new" });
      return all.filter(e => e.notes?.includes("callback"));
    },
  });

  // Mutations
  const createBlockMutation = useMutation({
    mutationFn: (data) => base44.entities.AppointmentBlock.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointmentBlocks"] });
      setShowBlockDialog(false);
      setBlockForm({ date: "", startTime: "09:00", endTime: "10:00", location: "", maxBookings: 1 });
      toast.success("Appointment slot created");
    },
  });

  const deleteBlockMutation = useMutation({
    mutationFn: (id) => base44.entities.AppointmentBlock.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointmentBlocks"] });
      toast.success("Slot deleted");
    },
  });

  const bookForCustomerMutation = useMutation({
    mutationFn: async ({ enquiry, block }) => {
      const confirmationToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
      
      // Create appointment
      const apt = await base44.entities.Appointment.create({
        enquiryId: enquiry.id,
        appointmentBlockId: block.id,
        customerFirstName: enquiry.firstName,
        customerLastName: enquiry.lastName,
        customerEmail: enquiry.email,
        customerMobile: enquiry.mobile,
        customerAddress: enquiry.address,
        appointmentDate: block.date,
        appointmentTime: block.startTime,
        location: block.location,
        status: "confirmed", // Auto-confirmed for callback bookings
        bookingSource: "callback",
        confirmationToken,
      });

      // Update block
      await base44.entities.AppointmentBlock.update(block.id, {
        currentBookings: (block.currentBookings || 0) + 1,
      });

      // Update enquiry status
      await base44.entities.Enquiry.update(enquiry.id, {
        status: "qualified",
        notes: `${enquiry.notes || ""}\nDesign visit booked: ${format(new Date(block.date), "d MMM yyyy")} at ${block.startTime}`,
      });

      // Send confirmation email (no verification needed)
      await base44.integrations.Core.SendEmail({
        to: enquiry.email,
        subject: "Your Design Visit is Booked",
        body: `
          <h2>Hello ${enquiry.firstName},</h2>
          <p>Following our conversation, we've booked your design visit appointment.</p>
          <h3>Appointment Details:</h3>
          <ul>
            <li><strong>Date:</strong> ${format(new Date(block.date), "EEEE, d MMMM yyyy")}</li>
            <li><strong>Time:</strong> ${block.startTime}</li>
            <li><strong>Location Area:</strong> ${block.location}</li>
          </ul>
          <p>We look forward to meeting you!</p>
          <p style="margin-top: 20px;">Need to make changes?</p>
          <p>
            <a href="${window.location.origin}/AppointmentHub?appointment=${confirmationToken}&action=change">Change Appointment</a> | 
            <a href="${window.location.origin}/AppointmentHub?appointment=${confirmationToken}&action=cancel">Cancel Appointment</a>
          </p>
          <br>
          <p>Best regards,<br>The Team</p>
        `,
      });

      return apt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointmentBlocks"] });
      queryClient.invalidateQueries({ queryKey: ["callbackEnquiries"] });
      setShowBookingDialog(false);
      setSelectedEnquiry(null);
      toast.success("Appointment booked and customer notified");
    },
  });

  const handleCreateBlock = () => {
    if (!blockForm.date || !blockForm.location) {
      toast.error("Date and location are required");
      return;
    }
    createBlockMutation.mutate({
      ...blockForm,
      isAvailable: true,
      currentBookings: 0,
    });
  };

  const availableBlocks = blocks.filter(b => 
    b.date >= new Date().toISOString().split("T")[0] && 
    b.currentBookings < (b.maxBookings || 1)
  );

  const upcomingAppointments = appointments.filter(a => 
    a.appointmentDate >= new Date().toISOString().split("T")[0] &&
    (a.status === "confirmed" || a.status === "pending_confirmation")
  ).sort((a, b) => a.appointmentDate.localeCompare(b.appointmentDate));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Appointment Manager</h1>
          <p className="text-gray-600">Manage appointment slots and bookings</p>
        </div>
      </div>

      <Tabs defaultValue="diary" className="space-y-4">
        <TabsList>
          <TabsTrigger value="diary">Diary</TabsTrigger>
          <TabsTrigger value="slots">Manage Slots</TabsTrigger>
          <TabsTrigger value="callbacks">
            Callbacks
            {enquiries.length > 0 && (
              <Badge className="ml-2 bg-red-500">{enquiries.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Diary Tab */}
        <TabsContent value="diary">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingAppointments ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : upcomingAppointments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No upcoming appointments
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Source</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcomingAppointments.map((apt) => (
                      <TableRow key={apt.id}>
                        <TableCell>
                          <div className="font-medium">
                            {format(new Date(apt.appointmentDate), "EEE, d MMM yyyy")}
                          </div>
                          <div className="text-sm text-gray-500">{apt.appointmentTime}</div>
                        </TableCell>
                        <TableCell>
                          <div>{apt.customerFirstName} {apt.customerLastName}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {apt.customerMobile}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            {apt.location}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[apt.status]}>
                            {apt.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {apt.bookingSource === "callback" ? "Callback" : "Online"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manage Slots Tab */}
        <TabsContent value="slots">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Appointment Slots</CardTitle>
              <Button onClick={() => setShowBlockDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Slot
              </Button>
            </CardHeader>
            <CardContent>
              {loadingBlocks ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : blocks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No appointment slots configured
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Availability</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blocks.sort((a, b) => a.date.localeCompare(b.date)).map((block) => (
                      <TableRow key={block.id}>
                        <TableCell>
                          {format(new Date(block.date), "EEE, d MMM yyyy")}
                        </TableCell>
                        <TableCell>
                          {block.startTime} - {block.endTime || ""}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            {block.location}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{block.currentBookings || 0} / {block.maxBookings || 1}</span>
                            {(block.currentBookings || 0) >= (block.maxBookings || 1) ? (
                              <Badge variant="secondary">Full</Badge>
                            ) : (
                              <Badge className="bg-green-100 text-green-700">Available</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500"
                            onClick={() => deleteBlockMutation.mutate(block.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Callbacks Tab */}
        <TabsContent value="callbacks">
          <Card>
            <CardHeader>
              <CardTitle>Callback Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {enquiries.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No pending callback requests
                </div>
              ) : (
                <div className="space-y-4">
                  {enquiries.map((enquiry) => (
                    <Card key={enquiry.id} className="border">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium">
                              {enquiry.firstName} {enquiry.lastName}
                            </h3>
                            <div className="text-sm text-gray-500 space-y-1 mt-1">
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                {enquiry.mobile}
                              </div>
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                {enquiry.email}
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {enquiry.address}
                              </div>
                            </div>
                            {enquiry.initialRequirements && (
                              <p className="text-sm mt-2">
                                <span className="font-medium">Interested in:</span> {enquiry.initialRequirements}
                              </p>
                            )}
                          </div>
                          <Button
                            onClick={() => {
                              setSelectedEnquiry(enquiry);
                              setShowBookingDialog(true);
                            }}
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            Book Appointment
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Slot Dialog */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Appointment Slot</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={blockForm.date}
                onChange={(e) => setBlockForm({ ...blockForm, date: e.target.value })}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={blockForm.startTime}
                  onChange={(e) => setBlockForm({ ...blockForm, startTime: e.target.value })}
                />
              </div>
              <div>
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={blockForm.endTime}
                  onChange={(e) => setBlockForm({ ...blockForm, endTime: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Location / Area</Label>
              <Input
                value={blockForm.location}
                onChange={(e) => setBlockForm({ ...blockForm, location: e.target.value })}
                placeholder="e.g., Leeds, York, Huddersfield"
              />
            </div>
            <div>
              <Label>Max Bookings</Label>
              <Input
                type="number"
                min="1"
                value={blockForm.maxBookings}
                onChange={(e) => setBlockForm({ ...blockForm, maxBookings: parseInt(e.target.value) || 1 })}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleCreateBlock}
              disabled={createBlockMutation.isPending}
            >
              {createBlockMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Slot
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Book for Customer Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Book Appointment for {selectedEnquiry?.firstName}</DialogTitle>
          </DialogHeader>
          {availableBlocks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p>No available slots</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setShowBookingDialog(false);
                  setShowBlockDialog(true);
                }}
              >
                Create New Slot
              </Button>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-auto">
              {availableBlocks.map((block) => (
                <button
                  key={block.id}
                  onClick={() => bookForCustomerMutation.mutate({ enquiry: selectedEnquiry, block })}
                  disabled={bookForCustomerMutation.isPending}
                  className="w-full p-4 border rounded-lg text-left hover:border-blue-500 hover:bg-blue-50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        {format(new Date(block.date), "EEEE, d MMMM yyyy")}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {block.startTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {block.location}
                        </span>
                      </div>
                    </div>
                    {bookForCustomerMutation.isPending && (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}