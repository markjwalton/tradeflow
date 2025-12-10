import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Clock, CheckCircle2 } from "lucide-react";

export default function OnboardingMetrics({ sessions }) {
  const completedSessions = sessions.filter(s => s.status === "approved");
  const avgCompletionTime = completedSessions.length > 0
    ? completedSessions.reduce((acc, s) => {
        const days = (new Date(s.updated_date) - new Date(s.created_date)) / (1000 * 60 * 60 * 24);
        return acc + days;
      }, 0) / completedSessions.length
    : 0;

  const stageDistribution = sessions.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Avg. Completion Time</span>
            </div>
            <span className="text-2xl font-bold">{Math.round(avgCompletionTime)} days</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Success Rate</span>
            </div>
            <span className="text-2xl font-bold">
              {sessions.length > 0 ? Math.round((completedSessions.length / sessions.length) * 100) : 0}%
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stage Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(stageDistribution).map(([stage, count]) => (
              <div key={stage} className="flex items-center justify-between">
                <span className="text-sm capitalize">{stage.replace('_', ' ')}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}