/**
 * Sturij ContentSection - Reusable content section with icon header
 * Based on Sturij Design System patterns
 */

import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

export function ContentSection({
  icon,
  title,
  description,
  children,
  collapsible = false,
  defaultExpanded = true,
  actions,
  className = ""
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const headerContent = (
    <div className="flex items-start gap-3">
      {icon && (
        <div className="p-2 bg-background-100 border border-background-200 rounded-lg text-primary-500 flex-shrink-0">
          {icon}
        </div>
      )}
      <div className="flex-1 border-l border-background-200 pl-4">
        <h3 className="text-base font-medium text-midnight-900 font-display">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-charcoal-500 mt-0.5">
            {description}
          </p>
        )}
      </div>
      {actions && !collapsible && (
        <div className="flex-shrink-0">{actions}</div>
      )}
    </div>
  );

  if (collapsible) {
    return (
      <div className={`bg-white rounded-xl border border-background-200 overflow-hidden ${className}`}>
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full p-4 flex items-center justify-between hover:bg-background-50 transition-colors"
        >
          <div className="flex items-center gap-3 flex-1">
            {expanded ? (
              <ChevronDown className="h-5 w-5 text-charcoal-400" />
            ) : (
              <ChevronRight className="h-5 w-5 text-charcoal-400" />
            )}
            {headerContent}
          </div>
          {actions && <div className="ml-4">{actions}</div>}
        </button>
        {expanded && (
          <div className="px-4 pb-4 pt-0">
            {children}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-background-200 p-4 ${className}`}>
      {headerContent}
      {children && (
        <div className="mt-4 ml-11">
          {children}
        </div>
      )}
    </div>
  );
}

export default ContentSection;