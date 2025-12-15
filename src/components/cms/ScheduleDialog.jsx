import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Clock, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export function ScheduleDialog({ contentType, contentId, triggerButton }) {
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState('publish');
  const [scheduledDate, setScheduledDate] = useState(null);
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [notes, setNotes] = useState('');
  const queryClient = useQueryClient();

  const scheduleMutation = useMutation({
    mutationFn: (data) => base44.entities.ContentSchedule.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-schedules'] });
      toast.success('Content scheduled successfully');
      setOpen(false);
      resetForm();
    },
  });

  const resetForm = () => {
    setAction('publish');
    setScheduledDate(null);
    setScheduledTime('09:00');
    setNotes('');
  };

  const handleSubmit = () => {
    if (!scheduledDate) {
      toast.error('Please select a date');
      return;
    }

    const [hours, minutes] = scheduledTime.split(':');
    const scheduleDateTime = new Date(scheduledDate);
    scheduleDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    scheduleMutation.mutate({
      content_type: contentType,
      content_id: contentId,
      action,
      scheduled_date: scheduleDateTime.toISOString(),
      notes,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="outline">
            <Clock className="h-4 w-4 mr-2" />
            Schedule
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Content</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Action</Label>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="publish">Publish</SelectItem>
                <SelectItem value="unpublish">Unpublish</SelectItem>
                <SelectItem value="archive">Archive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {scheduledDate ? format(scheduledDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={scheduledDate}
                  onSelect={setScheduledDate}
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label>Time</Label>
            <Input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
            />
          </div>

          <div>
            <Label>Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this schedule..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={scheduleMutation.isPending}
            >
              {scheduleMutation.isPending ? 'Scheduling...' : 'Schedule'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}