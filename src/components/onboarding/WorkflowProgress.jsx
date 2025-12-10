import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

const stages = [
  { key: "discovery", label: "Discovery" },
  { key: "analysis", label: "Analysis" },
  { key: "proposal", label: "Proposal" },
  { key: "review", label: "Review" },
  { key: "approved", label: "Approved" },
  { key: "implementation", label: "Implementation" }
];

export default function WorkflowProgress({ status }) {
  const currentIndex = stages.findIndex(s => s.key === status);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          {stages.map((stage, idx) => (
            <div key={stage.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                  idx <= currentIndex ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground text-muted-foreground"
                )}>
                  {idx < currentIndex ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </div>
                <span className="text-xs mt-2 text-center">{stage.label}</span>
              </div>
              {idx < stages.length - 1 && (
                <div className={cn(
                  "flex-1 h-0.5 mx-2 transition-colors",
                  idx < currentIndex ? "bg-primary" : "bg-muted"
                )} />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}