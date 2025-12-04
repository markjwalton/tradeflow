import React from "react";
import { cn } from "@/lib/utils";

// DataList - Key-value list display
export function DataList({ 
  items = [], 
  columns = 1,
  className, 
  ...props 
}) {
  const columnClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  };

  return (
    <dl 
      className={cn("grid gap-4", columnClasses[columns], className)} 
      {...props}
    >
      {items.map((item, i) => (
        <div key={i} className="flex flex-col">
          <dt className="text-sm text-[#6d6d6d] mb-1">{item.label}</dt>
          <dd className="text-[#1b2a35] font-medium">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

// KeyValue - Single key-value pair
export function KeyValue({ 
  label, 
  value, 
  inline = false,
  className, 
  ...props 
}) {
  return (
    <div 
      className={cn(
        inline ? "flex items-center gap-2" : "flex flex-col",
        className
      )} 
      {...props}
    >
      <span className="text-sm text-[#6d6d6d]">{label}:</span>
      <span className="text-[#1b2a35] font-medium">{value}</span>
    </div>
  );
}

// StatusBadge - Status indicator
export function StatusBadge({ 
  status, 
  label,
  variant = "default",
  className, 
  ...props 
}) {
  const variants = {
    default: {
      success: "bg-[#5a7a5e]/10 text-[#5a7a5e] border-[#5a7a5e]/20",
      warning: "bg-[#c4a35a]/10 text-[#c4a35a] border-[#c4a35a]/20",
      error: "bg-[#8b5b5b]/10 text-[#8b5b5b] border-[#8b5b5b]/20",
      info: "bg-[#5a7a8b]/10 text-[#5a7a8b] border-[#5a7a8b]/20",
      neutral: "bg-[#eceae5] text-[#6d6d6d] border-[#d1d1d1]",
    },
    solid: {
      success: "bg-[#5a7a5e] text-white",
      warning: "bg-[#c4a35a] text-white",
      error: "bg-[#8b5b5b] text-white",
      info: "bg-[#5a7a8b] text-white",
      neutral: "bg-[#6d6d6d] text-white",
    },
  };

  return (
    <span 
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
        variants[variant][status] || variants[variant].neutral,
        className
      )} 
      {...props}
    >
      {label || status}
    </span>
  );
}

// UserAvatar - User avatar with optional status
export function UserAvatar({ 
  src, 
  name, 
  size = "md",
  status,
  className, 
  ...props 
}) {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
  };

  const statusColors = {
    online: "bg-[#5a7a5e]",
    offline: "bg-[#6d6d6d]",
    busy: "bg-[#8b5b5b]",
    away: "bg-[#c4a35a]",
  };

  const initials = name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={cn("relative inline-block", className)} {...props}>
      {src ? (
        <img 
          src={src} 
          alt={name} 
          className={cn("rounded-full object-cover", sizes[size])}
        />
      ) : (
        <div className={cn(
          "rounded-full bg-[#d9b4a7] text-white flex items-center justify-center font-medium",
          sizes[size]
        )}>
          {initials}
        </div>
      )}
      {status && (
        <span className={cn(
          "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white",
          statusColors[status]
        )} />
      )}
    </div>
  );
}

// ProgressBar - Progress indicator
export function ProgressBar({ 
  value = 0, 
  max = 100,
  label,
  showValue = false,
  size = "md",
  color = "primary",
  className, 
  ...props 
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const sizes = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  const colors = {
    primary: "bg-[#4A5D4E]",
    secondary: "bg-[#D4A574]",
    success: "bg-[#5a7a5e]",
    warning: "bg-[#c4a35a]",
    error: "bg-[#8b5b5b]",
  };

  return (
    <div className={className} {...props}>
      {(label || showValue) && (
        <div className="flex justify-between mb-1.5 text-sm">
          {label && <span className="text-[#6d6d6d]">{label}</span>}
          {showValue && <span className="text-[#1b2a35] font-medium">{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className={cn("w-full bg-[#eceae5] rounded-full overflow-hidden", sizes[size])}>
        <div 
          className={cn("h-full rounded-full transition-all duration-300", colors[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// SimpleTable - Basic table display
export function SimpleTable({ 
  columns = [], 
  data = [],
  striped = false,
  hoverable = true,
  className, 
  ...props 
}) {
  return (
    <div className={cn("overflow-x-auto", className)} {...props}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#eceae5]">
            {columns.map((col, i) => (
              <th 
                key={i}
                className={cn(
                  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#6d6d6d]",
                  col.align === "right" && "text-right",
                  col.align === "center" && "text-center"
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr 
              key={rowIndex}
              className={cn(
                "border-b border-[#eceae5] last:border-0",
                striped && rowIndex % 2 === 1 && "bg-[#faf9f7]",
                hoverable && "hover:bg-[#f5f3ef] transition-colors"
              )}
            >
              {columns.map((col, colIndex) => (
                <td 
                  key={colIndex}
                  className={cn(
                    "px-4 py-3 text-sm text-[#3b3b3b]",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center"
                  )}
                >
                  {col.render ? col.render(row) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// TagList - List of tags/chips
export function TagList({ 
  tags = [], 
  onRemove,
  size = "md",
  className, 
  ...props 
}) {
  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };

  return (
    <div className={cn("flex flex-wrap gap-2", className)} {...props}>
      {tags.map((tag, i) => (
        <span 
          key={i}
          className={cn(
            "inline-flex items-center rounded-full bg-[#eceae5] text-[#3b3b3b]",
            sizes[size]
          )}
        >
          {typeof tag === "string" ? tag : tag.label}
          {onRemove && (
            <button 
              onClick={() => onRemove(tag)}
              className="ml-1.5 hover:text-[#8b5b5b]"
            >
              ×
            </button>
          )}
        </span>
      ))}
    </div>
  );
}

// TimelineItem - Timeline entry
export function TimelineItem({ 
  title, 
  description, 
  date,
  icon,
  isLast = false,
  className, 
  ...props 
}) {
  return (
    <div className={cn("flex gap-4", className)} {...props}>
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-[#4A5D4E]/10 text-[#4A5D4E] flex items-center justify-center">
          {icon || <span className="w-3 h-3 rounded-full bg-[#4A5D4E]" />}
        </div>
        {!isLast && <div className="w-0.5 flex-1 bg-[#eceae5] mt-2" />}
      </div>
      <div className={cn("flex-1 pb-8", isLast && "pb-0")}>
        <div className="flex items-start justify-between mb-1">
          <h4 className="font-medium text-[#1b2a35]">{title}</h4>
          {date && <span className="text-xs text-[#6d6d6d]">{date}</span>}
        </div>
        {description && (
          <p className="text-sm text-[#6d6d6d]" style={{ fontFamily: 'var(--font-body)' }}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

// Metric - Large metric display
export function Metric({ 
  label, 
  value, 
  prefix,
  suffix,
  trend,
  trendValue,
  size = "md",
  className, 
  ...props 
}) {
  const sizes = {
    sm: "text-2xl",
    md: "text-4xl",
    lg: "text-5xl",
  };

  return (
    <div className={className} {...props}>
      {label && <p className="text-sm text-[#6d6d6d] mb-1">{label}</p>}
      <div className="flex items-baseline gap-1">
        {prefix && <span className="text-[#6d6d6d]">{prefix}</span>}
        <span 
          className={cn("font-light text-[#1b2a35]", sizes[size])}
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {value}
        </span>
        {suffix && <span className="text-[#6d6d6d]">{suffix}</span>}
      </div>
      {trend && (
        <div className={cn(
          "flex items-center gap-1 mt-1 text-sm",
          trend === "up" && "text-[#5a7a5e]",
          trend === "down" && "text-[#8b5b5b]"
        )}>
          <span>{trend === "up" ? "↑" : "↓"}</span>
          <span>{trendValue}</span>
        </div>
      )}
    </div>
  );
}

export default {
  DataList,
  KeyValue,
  StatusBadge,
  UserAvatar,
  ProgressBar,
  SimpleTable,
  TagList,
  TimelineItem,
  Metric,
};