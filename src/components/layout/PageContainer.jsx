import React from "react";
import { cn } from "@/lib/utils";

export function PageContainer({ children, className, maxWidth = "full", padding = "default" }) {
  const paddingClasses = {
    none: "",
    tight: "p-4",
    default: "p-6",
    comfortable: "p-8",
  };

  const maxWidthClasses = {
    full: "max-w-full",
    narrow: "max-w-4xl mx-auto",
    standard: "max-w-6xl mx-auto",
    wide: "max-w-7xl mx-auto",
  };

  return (
    <div className={cn(
      "w-full rounded-xl",
      paddingClasses[padding],
      maxWidthClasses[maxWidth],
      className
    )}>
      {children}
    </div>
  );
}

export function PageHeader({ title, description, actions, className }) {
  return (
    <div className={cn("mb-6 space-y-2", className)}>
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-h1 text-foreground">{title}</h1>
          {description && (
            <p className="text-body text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

export function PageSection({ title, description, children, className, headerActions }) {
  return (
    <section className={cn("space-y-4 rounded-lg", className)}>
      {(title || headerActions) && (
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            {title && <h2 className="text-h2 text-foreground">{title}</h2>}
            {description && <p className="text-body-small text-muted-foreground">{description}</p>}
          </div>
          {headerActions && (
            <div className="flex items-center gap-2">
              {headerActions}
            </div>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

export function PageGrid({ children, columns = 3, gap = "default", className }) {
  const columnClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  const gapClasses = {
    tight: "gap-3",
    default: "gap-4",
    comfortable: "gap-6",
  };

  return (
    <div className={cn(
      "grid",
      columnClasses[columns],
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
}