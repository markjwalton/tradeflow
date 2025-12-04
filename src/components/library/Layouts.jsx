import React from "react";
import { cn } from "@/lib/utils";
import { Inbox } from "lucide-react";

// Gap/spacing helper
const gapSizes = {
  none: "gap-0",
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
  "2xl": "gap-12",
};

// Container - Centered max-width container
export function Container({ 
  children, 
  size = "lg", 
  className, 
  ...props 
}) {
  const sizes = {
    sm: "max-w-2xl",
    md: "max-w-4xl",
    lg: "max-w-6xl",
    xl: "max-w-7xl",
    full: "max-w-full",
  };

  return (
    <div 
      className={cn("mx-auto px-4 sm:px-6 lg:px-8", sizes[size], className)} 
      {...props}
    >
      {children}
    </div>
  );
}

// Section - Vertical section with padding
export function Section({ 
  children, 
  size = "md", 
  background,
  className, 
  ...props 
}) {
  const paddingSizes = {
    sm: "py-8",
    md: "py-12 md:py-16",
    lg: "py-16 md:py-24",
    xl: "py-24 md:py-32",
  };

  const backgrounds = {
    default: "bg-[#f5f3ef]",
    white: "bg-white",
    primary: "bg-[#4A5D4E]",
    secondary: "bg-[#D4A574]",
    accent: "bg-[#d9b4a7]",
    midnight: "bg-[#1b2a35]",
  };

  return (
    <section 
      className={cn(
        paddingSizes[size],
        background && backgrounds[background],
        className
      )} 
      {...props}
    >
      {children}
    </section>
  );
}

// Grid - CSS Grid layout
export function Grid({ 
  children, 
  columns = 3, 
  gap = "md",
  className, 
  ...props 
}) {
  const columnClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
    6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
  };

  return (
    <div 
      className={cn("grid", columnClasses[columns], gapSizes[gap], className)} 
      {...props}
    >
      {children}
    </div>
  );
}

// Stack - Vertical flex layout
export function Stack({ 
  children, 
  spacing = "md", 
  align = "stretch",
  className, 
  ...props 
}) {
  const alignClasses = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
  };

  return (
    <div 
      className={cn("flex flex-col", gapSizes[spacing], alignClasses[align], className)} 
      {...props}
    >
      {children}
    </div>
  );
}

// Row - Horizontal flex layout
export function Row({ 
  children, 
  spacing = "md", 
  align = "center",
  justify = "start",
  wrap = false,
  className, 
  ...props 
}) {
  const alignClasses = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
  };

  const justifyClasses = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around",
  };

  return (
    <div 
      className={cn(
        "flex", 
        gapSizes[spacing], 
        alignClasses[align], 
        justifyClasses[justify],
        wrap && "flex-wrap",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
}

// Column - Flex item with optional width
export function Column({ 
  children, 
  span = 1,
  className, 
  ...props 
}) {
  const spanClasses = {
    1: "flex-1",
    2: "flex-[2]",
    3: "flex-[3]",
    4: "flex-[4]",
    auto: "flex-none",
  };

  return (
    <div className={cn(spanClasses[span], className)} {...props}>
      {children}
    </div>
  );
}

// Two Column Layout
export function TwoColumn({ 
  left, 
  right, 
  ratio = "equal",
  gap = "lg",
  reverseOnMobile = false,
  className, 
  ...props 
}) {
  const ratioClasses = {
    equal: "md:grid-cols-2",
    "2:1": "md:grid-cols-[2fr_1fr]",
    "1:2": "md:grid-cols-[1fr_2fr]",
    "3:1": "md:grid-cols-[3fr_1fr]",
    "1:3": "md:grid-cols-[1fr_3fr]",
  };

  return (
    <div 
      className={cn(
        "grid grid-cols-1", 
        ratioClasses[ratio], 
        gapSizes[gap],
        className
      )} 
      {...props}
    >
      <div className={cn(reverseOnMobile && "order-2 md:order-1")}>{left}</div>
      <div className={cn(reverseOnMobile && "order-1 md:order-2")}>{right}</div>
    </div>
  );
}

// Three Column Layout
export function ThreeColumn({ 
  left, 
  center, 
  right, 
  gap = "lg",
  className, 
  ...props 
}) {
  return (
    <div 
      className={cn("grid grid-cols-1 md:grid-cols-3", gapSizes[gap], className)} 
      {...props}
    >
      <div>{left}</div>
      <div>{center}</div>
      <div>{right}</div>
    </div>
  );
}

// Sidebar Layout
export function SidebarLayout({ 
  sidebar, 
  content, 
  sidebarPosition = "left",
  sidebarWidth = "w-64",
  gap = "lg",
  className, 
  ...props 
}) {
  return (
    <div className={cn("flex flex-col md:flex-row", gapSizes[gap], className)} {...props}>
      {sidebarPosition === "left" && (
        <aside className={cn("flex-shrink-0", sidebarWidth)}>{sidebar}</aside>
      )}
      <main className="flex-1 min-w-0">{content}</main>
      {sidebarPosition === "right" && (
        <aside className={cn("flex-shrink-0", sidebarWidth)}>{sidebar}</aside>
      )}
    </div>
  );
}

// Page Header
export function PageHeader({ 
  title, 
  subtitle, 
  actions,
  breadcrumb,
  className, 
  ...props 
}) {
  return (
    <header className={cn("mb-6 md:mb-8", className)} {...props}>
      {breadcrumb && <div className="mb-4">{breadcrumb}</div>}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 
            className="text-2xl md:text-3xl font-light text-[#1b2a35]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="text-[#6d6d6d] mt-1" style={{ fontFamily: 'var(--font-body)' }}>
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}

// Page Footer
export function PageFooter({ 
  children, 
  className, 
  ...props 
}) {
  return (
    <footer 
      className={cn(
        "mt-auto pt-8 pb-6 border-t border-[#eceae5]",
        "text-center text-sm text-[#6d6d6d]",
        className
      )} 
      {...props}
    >
      {children}
    </footer>
  );
}

// Empty State
export function EmptyState({ 
  icon,
  title, 
  description, 
  action,
  className, 
  ...props 
}) {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )} 
      {...props}
    >
      <div className="w-16 h-16 rounded-full bg-[#eceae5] flex items-center justify-center mb-4">
        {icon || <Inbox className="h-8 w-8 text-[#6d6d6d]" />}
      </div>
      <h3 
        className="text-lg font-medium text-[#1b2a35] mb-2"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        {title}
      </h3>
      {description && (
        <p className="text-[#6d6d6d] max-w-sm mb-4" style={{ fontFamily: 'var(--font-body)' }}>
          {description}
        </p>
      )}
      {action}
    </div>
  );
}

export default {
  Container,
  Section,
  Grid,
  Stack,
  Row,
  Column,
  TwoColumn,
  ThreeColumn,
  SidebarLayout,
  PageHeader,
  PageFooter,
  EmptyState,
};