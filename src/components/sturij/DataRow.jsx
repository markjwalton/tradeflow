/**
 * Sturij DataRow - Key-value display row with optional actions
 * Based on Sturij Design System patterns
 */

import React from "react";

export function DataRow({
  icon,
  label,
  value,
  sublabel,
  actions,
  variant = "default", // default, compact, bordered
  className = ""
}) {
  const variantClasses = {
    default: "py-3",
    compact: "py-2",
    bordered: "py-3 border-b border-background-100 last:border-b-0"
  };

  return (
    <div className={`flex items-center justify-between ${variantClasses[variant]} ${className}`}>
      <div className="flex items-center gap-3 min-w-0">
        {icon && (
          <span className="text-charcoal-400 flex-shrink-0">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <span className="text-sm text-charcoal-500">{label}</span>
          {sublabel && (
            <p className="text-xs text-charcoal-400">{sublabel}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-sm font-medium text-midnight-900">
          {value}
        </span>
        {actions}
      </div>
    </div>
  );
}

export function DataRowGroup({ children, title, className = "" }) {
  return (
    <div className={className}>
      {title && (
        <h4 className="text-xs font-medium text-charcoal-400 uppercase tracking-wide mb-2">
          {title}
        </h4>
      )}
      <div className="divide-y divide-background-100">
        {children}
      </div>
    </div>
  );
}

export default DataRow;