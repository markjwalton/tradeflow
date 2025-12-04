/**
 * Sturij PageHeader - Consistent page header component
 * Based on Sturij Design System patterns
 */

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function PageHeader({
  icon,
  title,
  description,
  badge,
  badgeVariant = "secondary",
  actions,
  className = ""
}) {
  return (
    <div className={`flex items-start justify-between gap-4 ${className}`}>
      <div className="flex items-start gap-4">
        {icon && (
          <div className="p-3 bg-primary-50 border border-primary-100 rounded-xl text-primary-600">
            {icon}
          </div>
        )}
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-light tracking-tight text-midnight-900 font-display">
              {title}
            </h1>
            {badge && (
              <Badge variant={badgeVariant} className="text-xs">
                {badge}
              </Badge>
            )}
          </div>
          {description && (
            <p className="text-charcoal-500 text-sm max-w-2xl">
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}

export default PageHeader;