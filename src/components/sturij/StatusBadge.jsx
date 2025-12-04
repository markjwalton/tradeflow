/**
 * Sturij StatusBadge - Semantic status indicators
 * Based on Sturij Design System patterns
 */

import React from "react";
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  XCircle, 
  Loader2,
  Circle 
} from "lucide-react";

const statusConfig = {
  // Success states
  success: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    icon: CheckCircle2
  },
  passed: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    icon: CheckCircle2
  },
  active: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    icon: Circle
  },
  verified: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    icon: CheckCircle2
  },
  online: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    icon: Circle
  },
  healthy: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    icon: CheckCircle2
  },

  // Warning states
  warning: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: AlertCircle
  },
  pending: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: Clock
  },
  degraded: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: AlertCircle
  },

  // Error states
  error: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    icon: XCircle
  },
  failed: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    icon: XCircle
  },
  offline: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    icon: XCircle
  },

  // Info/Neutral states
  info: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    icon: AlertCircle
  },
  synced: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    icon: CheckCircle2
  },

  // Loading
  loading: {
    bg: "bg-charcoal-50",
    text: "text-charcoal-600",
    border: "border-charcoal-200",
    icon: Loader2
  },

  // Default/Neutral
  default: {
    bg: "bg-charcoal-50",
    text: "text-charcoal-600",
    border: "border-charcoal-200",
    icon: Circle
  },
  draft: {
    bg: "bg-charcoal-50",
    text: "text-charcoal-600",
    border: "border-charcoal-200",
    icon: Circle
  },
  skipped: {
    bg: "bg-charcoal-50",
    text: "text-charcoal-600",
    border: "border-charcoal-200",
    icon: Circle
  }
};

export function StatusBadge({
  status = "default",
  label,
  showIcon = true,
  size = "default", // small, default, large
  className = ""
}) {
  const config = statusConfig[status?.toLowerCase()] || statusConfig.default;
  const Icon = config.icon;
  const displayLabel = label || status;

  const sizeClasses = {
    small: "px-1.5 py-0.5 text-xs gap-1",
    default: "px-2 py-1 text-xs gap-1.5",
    large: "px-3 py-1.5 text-sm gap-2"
  };

  const iconSizes = {
    small: "h-3 w-3",
    default: "h-3.5 w-3.5",
    large: "h-4 w-4"
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium border
        ${config.bg} ${config.text} ${config.border}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {showIcon && (
        <Icon className={`${iconSizes[size]} ${status === 'loading' ? 'animate-spin' : ''}`} />
      )}
      <span className="capitalize">{displayLabel}</span>
    </span>
  );
}

export default StatusBadge;