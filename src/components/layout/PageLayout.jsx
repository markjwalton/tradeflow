/**
 * PageLayout - Standardized page layout component
 * 
 * Provides consistent page structure with header, info cards, and content areas.
 * Used across admin pages for visual consistency.
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

/**
 * PageLayout
 * 
 * Props:
 * - title: string - Page title
 * - description: string - Page description
 * - icon: ReactNode - Icon for the header
 * - headerActions: ReactNode - Action buttons for header
 * - stats: array - Stat cards [{label, value, icon, color, trend}]
 * - isLoading: boolean - Show loading state
 * - children: ReactNode - Main content
 * - sidebar: ReactNode - Optional sidebar content
 * - sidebarPosition: "left" | "right" - Sidebar position
 * - sidebarWidth: string - Sidebar width class
 * - className: string - Additional container classes
 * - contentClassName: string - Content area classes
 * - variant: "default" | "compact" | "wide" - Layout variant
 */
export function PageLayout({
  title,
  description,
  icon,
  headerActions,
  stats = [],
  isLoading = false,
  children,
  sidebar,
  sidebarPosition = "right",
  sidebarWidth = "w-80",
  className = "",
  contentClassName = "",
  variant = "default"
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const containerClass = variant === "compact" ? "p-4 space-y-4" : "p-6 space-y-6";
  const gridGap = variant === "compact" ? "gap-3" : "gap-4";

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 ${containerClass} ${className}`}>
      {/* Header */}
      {(title || headerActions) && (
        <PageHeader
          title={title}
          description={description}
          icon={icon}
          actions={headerActions}
        />
      )}

      {/* Stats Row */}
      {stats.length > 0 && (
        <div className={`grid grid-cols-2 md:grid-cols-4 lg:grid-cols-${Math.min(stats.length, 6)} ${gridGap}`}>
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} compact={variant === "compact"} />
          ))}
        </div>
      )}

      {/* Main Content */}
      {sidebar ? (
        <div className={`flex gap-6 ${sidebarPosition === "left" ? "flex-row-reverse" : ""}`}>
          <div className={`flex-1 ${contentClassName}`}>{children}</div>
          <aside className={`${sidebarWidth} flex-shrink-0`}>{sidebar}</aside>
        </div>
      ) : (
        <div className={contentClassName}>{children}</div>
      )}
    </div>
  );
}

/**
 * PageHeader - Consistent page header
 */
export function PageHeader({ title, description, icon, actions, className = "" }) {
  return (
    <div className={`flex items-start justify-between ${className}`}>
      <div className="flex items-start gap-3">
        {icon && (
          <div className="p-2.5 bg-white rounded-xl shadow-sm border">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          {description && <p className="text-slate-500 mt-1">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

/**
 * StatCard - Info/stat card for metrics
 */
export function StatCard({ 
  label, 
  value, 
  icon, 
  color = "blue", 
  trend,
  trendLabel,
  compact = false,
  onClick,
  className = ""
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-green-50 text-green-600 border-green-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    red: "bg-red-50 text-red-600 border-red-100",
    slate: "bg-slate-50 text-slate-600 border-slate-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    pink: "bg-pink-50 text-pink-600 border-pink-100",
  };

  const iconBgClasses = {
    blue: "bg-blue-100",
    green: "bg-green-100",
    amber: "bg-amber-100",
    purple: "bg-purple-100",
    red: "bg-red-100",
    slate: "bg-slate-100",
    indigo: "bg-indigo-100",
    pink: "bg-pink-100",
  };

  const Component = onClick ? "button" : "div";

  return (
    <Component
      onClick={onClick}
      className={`bg-white rounded-xl border shadow-sm ${compact ? "p-3" : "p-4"} ${onClick ? "hover:shadow-md transition-shadow cursor-pointer" : ""} ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`text-slate-500 ${compact ? "text-xs" : "text-sm"}`}>{label}</p>
          <p className={`font-bold text-slate-900 ${compact ? "text-xl mt-0.5" : "text-2xl mt-1"}`}>{value}</p>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-1 ${compact ? "text-xs" : "text-sm"}`}>
              <span className={trend >= 0 ? "text-green-600" : "text-red-600"}>
                {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
              </span>
              {trendLabel && <span className="text-slate-400">{trendLabel}</span>}
            </div>
          )}
        </div>
        {icon && (
          <div className={`${iconBgClasses[color]} ${compact ? "p-1.5" : "p-2"} rounded-lg`}>
            {React.cloneElement(icon, { className: `${compact ? "h-4 w-4" : "h-5 w-5"} ${colorClasses[color].split(" ")[1]}` })}
          </div>
        )}
      </div>
    </Component>
  );
}

/**
 * ContentCard - Standard content card
 */
export function ContentCard({ 
  title, 
  description, 
  icon,
  actions, 
  children, 
  className = "",
  noPadding = false 
}) {
  return (
    <Card className={className}>
      {(title || actions) && (
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            {icon}
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
          </div>
          {actions}
        </CardHeader>
      )}
      <CardContent className={noPadding ? "p-0" : ""}>{children}</CardContent>
    </Card>
  );
}

/**
 * InfoRow - Key-value display row
 */
export function InfoRow({ label, value, icon, className = "" }) {
  return (
    <div className={`flex items-center justify-between py-2 ${className}`}>
      <div className="flex items-center gap-2 text-sm text-slate-500">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}

/**
 * QuickActions - Grid of action buttons
 */
export function QuickActions({ actions = [], columns = 2 }) {
  return (
    <div className={`grid grid-cols-${columns} gap-2`}>
      {actions.map((action, i) => (
        <Button
          key={i}
          variant={action.variant || "outline"}
          size="sm"
          onClick={action.onClick}
          disabled={action.disabled}
          className={`justify-start ${action.className || ""}`}
        >
          {action.icon}
          <span className="ml-2">{action.label}</span>
        </Button>
      ))}
    </div>
  );
}

/**
 * SectionDivider - Visual section separator
 */
export function SectionDivider({ label }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex-1 h-px bg-slate-200" />
      {label && <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</span>}
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}

export default PageLayout;