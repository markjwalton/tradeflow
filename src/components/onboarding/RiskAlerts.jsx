import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, FileText } from "lucide-react";

export default function RiskAlerts({ sessions, tasks }) {
  const risks = [];

  // Check for overdue tasks
  const overdueTasks = tasks.filter(t => 
    t.status !== "completed" && t.due_date && new Date(t.due_date) < new Date()
  );
  
  if (overdueTasks.length > 0) {
    risks.push({
      type: "overdue_tasks",
      severity: "high",
      title: `${overdueTasks.length} Overdue Tasks`,
      description: "Multiple tasks are past their due date and require immediate attention"
    });
  }

  // Check for stalled sessions
  const stalledSessions = sessions.filter(s => {
    const daysSinceUpdate = (new Date() - new Date(s.updated_date)) / (1000 * 60 * 60 * 24);
    return daysSinceUpdate > 7 && !["approved", "implementation"].includes(s.status);
  });

  if (stalledSessions.length > 0) {
    risks.push({
      type: "stalled_sessions",
      severity: "medium",
      title: `${stalledSessions.length} Stalled Sessions`,
      description: "Sessions with no activity for over 7 days"
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Risk Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {risks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No risks detected</p>
          </div>
        ) : (
          <div className="space-y-3">
            {risks.map((risk, idx) => (
              <div key={idx} className="p-4 border rounded-lg bg-destructive/5">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-medium">{risk.title}</p>
                  <Badge variant="destructive">{risk.severity}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{risk.description}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}