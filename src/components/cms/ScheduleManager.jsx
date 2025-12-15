import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export function ScheduleManager() {
  const [activeTab, setActiveTab] = useState('pending');
  const queryClient = useQueryClient();

  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ['content-schedules'],
    queryFn: () => base44.entities.ContentSchedule.list('-scheduled_date'),
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => base44.entities.ContentSchedule.update(id, { status: 'cancelled' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-schedules'] });
      toast.success('Schedule cancelled');
    },
  });

  const executeNowMutation = useMutation({
    mutationFn: () => base44.functions.invoke('executeScheduledContent', {}),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['content-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['cms'] });
      toast.success(response.data.message);
    },
  });

  const pendingSchedules = schedules.filter(s => s.status === 'pending');
  const executedSchedules = schedules.filter(s => s.status === 'executed');
  const failedSchedules = schedules.filter(s => s.status === 'failed');

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button 
          onClick={() => executeNowMutation.mutate()}
          disabled={executeNowMutation.isPending}
        >
          {executeNowMutation.isPending ? 'Executing...' : 'Execute Pending Now'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingSchedules.length})
          </TabsTrigger>
          <TabsTrigger value="executed">
            Executed ({executedSchedules.length})
          </TabsTrigger>
          <TabsTrigger value="failed">
            Failed ({failedSchedules.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <ScheduleList 
            schedules={pendingSchedules}
            onCancel={(id) => cancelMutation.mutate(id)}
          />
        </TabsContent>

        <TabsContent value="executed">
          <ScheduleList schedules={executedSchedules} />
        </TabsContent>

        <TabsContent value="failed">
          <ScheduleList schedules={failedSchedules} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ScheduleList({ schedules, onCancel }) {
  if (schedules.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No schedules in this category
      </div>
    );
  }

  return (
    <div className="space-y-3 mt-4">
      {schedules.map((schedule) => (
        <Card key={schedule.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={
                    schedule.status === 'pending' ? 'default' :
                    schedule.status === 'executed' ? 'success' :
                    'destructive'
                  }>
                    {schedule.status}
                  </Badge>
                  <Badge variant="outline">{schedule.action}</Badge>
                  <Badge variant="secondary">{schedule.content_type}</Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(schedule.scheduled_date), 'PPP')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(schedule.scheduled_date), 'HH:mm')}
                  </span>
                </div>

                {schedule.notes && (
                  <p className="text-sm text-muted-foreground">
                    {schedule.notes}
                  </p>
                )}

                {schedule.status === 'executed' && schedule.executed_date && (
                  <div className="flex items-center gap-1 text-xs text-green-600 mt-2">
                    <CheckCircle className="h-3 w-3" />
                    Executed {format(new Date(schedule.executed_date), 'PPP HH:mm')}
                  </div>
                )}

                {schedule.status === 'failed' && (
                  <div className="flex items-center gap-1 text-xs text-red-600 mt-2">
                    <AlertCircle className="h-3 w-3" />
                    Failed: {schedule.notes || 'Unknown error'}
                  </div>
                )}
              </div>

              {schedule.status === 'pending' && onCancel && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (confirm('Cancel this scheduled action?')) {
                      onCancel(schedule.id);
                    }
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}