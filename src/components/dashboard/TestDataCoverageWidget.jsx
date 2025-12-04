import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { AlertTriangle, CheckCircle2, ArrowRight, Loader2, Flag } from "lucide-react";
import { cn } from "@/lib/utils";

// Sturij-styled card wrapper
function WidgetCard({ children, className, critical = false }) {
  return (
    <div className={cn(
      "h-full bg-[var(--color-background-paper)] rounded-[var(--radius-xl)]",
      "border border-[var(--color-background-muted)] shadow-[var(--shadow-md)]",
      "overflow-hidden",
      critical && "ring-2 ring-[var(--color-destructive)]/30",
      className
    )}>
      {children}
    </div>
  );
}

// Status indicator bar at top
function StatusBar({ critical }) {
  return (
    <div className={cn(
      "h-1.5",
      critical 
        ? "bg-gradient-to-r from-[var(--color-destructive)] to-[var(--color-warning)]" 
        : "bg-gradient-to-r from-[var(--color-success)] to-[var(--color-primary)]"
    )} />
  );
}

// Badge component using design tokens
function StatusBadge({ children, variant = "critical" }) {
  const variants = {
    critical: "bg-[var(--color-destructive)]/10 text-[var(--color-destructive)]",
    success: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
  };
  return (
    <span className={cn(
      "px-2 py-0.5 rounded-[var(--radius-sm)] text-xs font-medium flex items-center gap-1",
      variants[variant]
    )}>
      {children}
    </span>
  );
}

// Icon container
function IconBox({ children, variant = "success" }) {
  const variants = {
    critical: "bg-[var(--color-destructive)]/10 text-[var(--color-destructive)]",
    success: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
  };
  return (
    <div className={cn("p-2 rounded-[var(--radius-lg)]", variants[variant])}>
      {children}
    </div>
  );
}

// Button using design tokens
function ActionButton({ children, variant = "primary", className, ...props }) {
  const variants = {
    primary: "bg-[var(--color-destructive)] hover:bg-[var(--color-destructive-dark)] text-white",
    outline: "border border-[var(--color-background-muted)] bg-transparent hover:bg-[var(--color-background-muted)] text-[var(--color-midnight)]",
  };
  return (
    <button className={cn(
      "w-full px-4 py-2 rounded-[var(--radius-lg)] text-sm font-medium",
      "flex items-center justify-center gap-2",
      "transition-colors",
      variants[variant],
      className
    )} {...props}>
      {children}
    </button>
  );
}

export default function TestDataCoverageWidget() {
  const { data: playgroundItems = [], isLoading: loadingItems } = useQuery({
    queryKey: ["playgroundItems-widget"],
    queryFn: () => base44.entities.PlaygroundItem.list(),
  });

  const { data: testDataSets = [], isLoading: loadingTestData } = useQuery({
    queryKey: ["testData-widget"],
    queryFn: () => base44.entities.TestData.list(),
  });

  const isLoading = loadingItems || loadingTestData;

  // Calculate coverage
  const previewableItems = playgroundItems.filter(p => 
    p.source_type === "page" || p.source_type === "feature"
  );
  
  const itemsWithData = previewableItems.filter(item => 
    testDataSets.some(td => td.playground_item_id === item.id)
  );

  const missingCount = previewableItems.length - itemsWithData.length;
  const coveragePercent = previewableItems.length > 0 
    ? Math.round((itemsWithData.length / previewableItems.length) * 100) 
    : 100;

  const isCritical = missingCount > 0;

  if (isLoading) {
    return (
      <WidgetCard>
        <div className="p-5 flex items-center justify-center h-full">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--color-charcoal)]" />
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard critical={isCritical}>
      <StatusBar critical={isCritical} />
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p 
                className="text-sm font-medium text-[var(--color-charcoal)] uppercase tracking-wide"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Test Data Coverage
              </p>
              {isCritical && (
                <StatusBadge variant="critical">
                  <Flag className="h-3 w-3" />
                  Action Needed
                </StatusBadge>
              )}
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <p 
                className="text-3xl font-light text-[var(--color-midnight)]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {coveragePercent}%
              </p>
              <span className="text-sm text-[var(--color-charcoal)]">covered</span>
            </div>
          </div>
          <IconBox variant={isCritical ? "critical" : "success"}>
            {isCritical ? (
              <AlertTriangle className="h-6 w-6" />
            ) : (
              <CheckCircle2 className="h-6 w-6" />
            )}
          </IconBox>
        </div>

        {/* Stats */}
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-charcoal)]">Pages/Features</span>
            <span className="font-medium text-[var(--color-midnight)]">{previewableItems.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-charcoal)]">With Test Data</span>
            <span className="font-medium text-[var(--color-success)]">{itemsWithData.length}</span>
          </div>
          {missingCount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-destructive)] font-medium">Missing Data</span>
              <span className="font-bold text-[var(--color-destructive)]">{missingCount}</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <Link to={createPageUrl("TestDataManager")} className="block mt-4">
          <ActionButton variant={isCritical ? "primary" : "outline"}>
            {isCritical ? "Fix Now" : "View Details"}
            <ArrowRight className="h-4 w-4" />
          </ActionButton>
        </Link>
      </div>
    </WidgetCard>
  );
}