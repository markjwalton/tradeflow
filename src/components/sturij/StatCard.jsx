/**
 * Sturij StatCard - Statistics display card
 * Based on Sturij Design System patterns
 */

import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

export function StatCard({
  icon,
  label,
  value,
  sublabel,
  trend,
  trendLabel,
  color = "primary", // primary, secondary, accent, success, warning, error
  size = "default", // default, compact, large
  className = ""
}) {
  const colorClasses = {
    primary: {
      bg: "bg-primary-50",
      icon: "text-primary-600",
      border: "border-primary-100"
    },
    secondary: {
      bg: "bg-secondary-50",
      icon: "text-secondary-600",
      border: "border-secondary-100"
    },
    accent: {
      bg: "bg-accent-50",
      icon: "text-accent-600",
      border: "border-accent-100"
    },
    success: {
      bg: "bg-green-50",
      icon: "text-green-600",
      border: "border-green-100"
    },
    warning: {
      bg: "bg-amber-50",
      icon: "text-amber-600",
      border: "border-amber-100"
    },
    error: {
      bg: "bg-red-50",
      icon: "text-red-600",
      border: "border-red-100"
    },
    neutral: {
      bg: "bg-charcoal-50",
      icon: "text-charcoal-600",
      border: "border-charcoal-100"
    }
  };

  const sizeClasses = {
    compact: "p-3",
    default: "p-4",
    large: "p-6"
  };

  const valueSizes = {
    compact: "text-xl",
    default: "text-2xl",
    large: "text-3xl"
  };

  const colors = colorClasses[color] || colorClasses.primary;

  return (
    <div className={`bg-white rounded-xl border border-background-200 ${sizeClasses[size]} ${className}`}>
      <div className="flex items-start gap-3">
        {icon && (
          <div className={`p-2 ${colors.bg} ${colors.border} border rounded-lg flex-shrink-0`}>
            {React.cloneElement(icon, { className: `h-5 w-5 ${colors.icon}` })}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className={`${valueSizes[size]} font-bold text-midnight-900`}>
            {value}
          </p>
          <p className="text-sm text-charcoal-500 truncate">{label}</p>
          {sublabel && (
            <p className="text-xs text-charcoal-400 mt-0.5">{sublabel}</p>
          )}
        </div>
      </div>
      {trend !== undefined && (
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-background-100">
          {trend >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          <span className={`text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
          {trendLabel && (
            <span className="text-xs text-charcoal-400">{trendLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}

export default StatCard;