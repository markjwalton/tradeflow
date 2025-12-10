import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Plus } from "lucide-react";
import { toast } from "sonner";

export default function MeetingScheduler({ sessionId }) {
  const queryClient = useQueryClient();
  const [meetingData, setMeetingData] = useState({
    title: "",
    date: "",
    time: "",
    attendees: "",
    notes: ""
  });

  const scheduleMeeting = useMutation({
    mutationFn: async () => {
      return await base44.entities.OnboardingTask.create({
        onboarding_session_id: sessionId,
        task_title: meetingData.title,
        task_description: `Meeting scheduled for ${meetingData.date} at ${meetingData.time}\nAttendees: ${meetingData.attendees}\n\n${meetingData.notes}`,
        due_date: meetingData.date,
        status: "todo",
        priority: "high",
        category: "review"
      });
    },
    onSuccess: () => {
      toast.success("Meeting scheduled");
      setMeetingData({
        title: "",
        date: "",
        time: "",
        attendees: "",
        notes: ""
      });
      queryClient.invalidateQueries(["sessionTasks", sessionId]);
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Schedule Meeting
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          value={meetingData.title}
          onChange={(e) => setMeetingData({ ...meetingData, title: e.target.value })}
          placeholder="Meeting title..."
        />
        
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="date"
            value={meetingData.date}
            onChange={(e) => setMeetingData({ ...meetingData, date: e.target.value })}
          />
          <Input
            type="time"
            value={meetingData.time}
            onChange={(e) => setMeetingData({ ...meetingData, time: e.target.value })}
          />
        </div>

        <Input
          value={meetingData.attendees}
          onChange={(e) => setMeetingData({ ...meetingData, attendees: e.target.value })}
          placeholder="Attendees (comma separated)..."
        />

        <Textarea
          value={meetingData.notes}
          onChange={(e) => setMeetingData({ ...meetingData, notes: e.target.value })}
          placeholder="Meeting agenda or notes..."
          rows={3}
        />

        <Button 
          onClick={() => scheduleMeeting.mutate()}
          disabled={!meetingData.title || !meetingData.date || scheduleMeeting.isPending}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Schedule Meeting
        </Button>
      </CardContent>
    </Card>
  );
}