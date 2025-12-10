import React from "react";
import { CheckCircle, Circle } from "lucide-react";

const steps = [
  { key: "discovery", label: "Discovery" },
  { key: "analysis", label: "Analysis" },
  { key: "proposal", label: "Proposal" },
  { key: "review", label: "Review" },
  { key: "approved", label: "Approved" },
];

export default function SessionStepper({ currentStatus }) {
  const currentIndex = steps.findIndex(s => s.key === currentStatus);

  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, idx) => {
        const isComplete = idx < currentIndex;
        const isCurrent = idx === currentIndex;
        const isLast = idx === steps.length - 1;

        return (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isComplete
                    ? "bg-success text-success-foreground"
                    : isCurrent
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isComplete ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </div>
              <span className="text-xs mt-2">{step.label}</span>
            </div>
            {!isLast && (
              <div
                className={`flex-1 h-0.5 mx-2 ${
                  isComplete ? "bg-success" : "bg-muted"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}