/**
 * Sturij FeatureCard - Interactive feature card with icon and action
 * Based on Sturij Design System patterns
 */

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function FeatureCard({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  badge,
  badgeColor = "default",
  variant = "default", // default, hover, interactive
  className = ""
}) {
  const badgeColors = {
    default: "bg-background-100 text-charcoal-600",
    primary: "bg-primary-100 text-primary-700",
    secondary: "bg-secondary-100 text-secondary-700",
    accent: "bg-accent-100 text-accent-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-amber-100 text-amber-700",
    error: "bg-red-100 text-red-700",
  };

  const cardClasses = {
    default: "bg-white border-background-200",
    hover: "bg-white border-background-200 hover:border-primary-200 hover:shadow-md transition-all cursor-pointer",
    interactive: "bg-white border-background-200 hover:bg-primary-50 hover:border-primary-200 transition-all cursor-pointer",
  };

  return (
    <div className={`rounded-xl border p-4 ${cardClasses[variant]} ${className}`}>
      <div className="flex items-start gap-3">
        {icon && (
          <div className="p-2 bg-primary-50 rounded-lg text-primary-600 flex-shrink-0">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-midnight-900 truncate">{title}</h4>
            {badge && (
              <Badge className={`text-xs ${badgeColors[badgeColor]}`}>
                {badge}
              </Badge>
            )}
          </div>
          {description && (
            <p className="text-sm text-charcoal-500 mt-1 line-clamp-2">
              {description}
            </p>
          )}
        </div>
      </div>
      {actionLabel && onAction && (
        <Button
          variant="outline"
          size="sm"
          onClick={onAction}
          className="w-full mt-4 border-background-300 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default FeatureCard;