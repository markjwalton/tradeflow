import React from "react";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronLeft, Home } from "lucide-react";
import { Link } from "react-router-dom";

// NavItem - Single navigation link
export function NavItem({ 
  href, 
  icon, 
  label, 
  active = false,
  badge,
  onClick,
  className, 
  ...props 
}) {
  const Component = href ? Link : "button";
  const componentProps = href ? { to: href } : { onClick };

  return (
    <Component
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
        "text-sm font-medium",
        active
          ? "bg-primary text-white"
          : "text-charcoal hover:bg-background-muted",
        className
      )}
      {...componentProps}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="flex-1">{label}</span>
      {badge && (
        <span className={cn(
          "px-2 py-0.5 rounded-full text-xs",
          active ? "bg-white/20" : "bg-secondary text-white"
        )}>
          {badge}
        </span>
      )}
    </Component>
  );
}

// NavGroup - Group of nav items with optional title
export function NavGroup({ 
  title, 
  children, 
  collapsible = false,
  defaultCollapsed = false,
  className, 
  ...props 
}) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);

  return (
    <div className={cn("mb-4", className)} {...props}>
      {title && (
        <button
          className={cn(
            "w-full flex items-center justify-between px-3 py-2 mb-1",
            "text-xs font-semibold uppercase tracking-wider text-charcoal-light",
            collapsible && "hover:text-charcoal cursor-pointer"
          )}
          onClick={() => collapsible && setCollapsed(!collapsed)}
        >
          {title}
          {collapsible && (
            <ChevronRight className={cn(
              "h-4 w-4 transition-transform",
              !collapsed && "rotate-90"
            )} />
          )}
        </button>
      )}
      {(!collapsible || !collapsed) && (
        <div className="space-y-1">{children}</div>
      )}
    </div>
  );
}

// Breadcrumb - Navigation breadcrumb
export function Breadcrumb({ 
  items = [], 
  separator,
  className, 
  ...props 
}) {
  return (
    <nav className={cn("flex items-center", className)} aria-label="Breadcrumb" {...props}>
      <ol className="flex items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li key={index} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link 
                  to={item.href}
                  className="text-sm text-charcoal-light hover:text-primary transition-colors"
                >
                  {item.icon || (index === 0 && <Home className="h-4 w-4" />)}
                  {item.label && <span className={item.icon ? "ml-1" : ""}>{item.label}</span>}
                </Link>
              ) : (
                <span className={cn(
                  "text-sm",
                  isLast ? "text-midnight font-medium" : "text-charcoal-light"
                )}>
                  {item.icon}
                  {item.label && <span className={item.icon ? "ml-1" : ""}>{item.label}</span>}
                </span>
              )}
              {!isLast && (
                separator || <ChevronRight className="h-4 w-4 text-border" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// TabsNav - Tab navigation
export function TabsNav({ 
  tabs = [], 
  activeTab, 
  onChange,
  variant = "underline",
  className, 
  ...props 
}) {
  const variants = {
    underline: {
      container: "border-b border-background-muted",
      tab: "px-4 py-2 -mb-px border-b-2 transition-colors",
      active: "border-primary text-primary",
      inactive: "border-transparent text-charcoal-light hover:text-charcoal",
    },
    pills: {
      container: "bg-background-muted p-1 rounded-lg",
      tab: "px-4 py-2 rounded-md transition-all",
      active: "bg-white text-midnight shadow-sm",
      inactive: "text-charcoal-light hover:text-charcoal",
    },
  };

  const style = variants[variant];

  return (
    <nav className={cn("flex", style.container, className)} {...props}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange?.(tab.value)}
          className={cn(
            "text-sm font-medium",
            style.tab,
            activeTab === tab.value ? style.active : style.inactive
          )}
        >
          {tab.icon && <span className="mr-2">{tab.icon}</span>}
          {tab.label}
          {tab.count !== undefined && (
            <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-background-muted">
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </nav>
  );
}

// Pagination
export function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange,
  showEdges = true,
  className, 
  ...props 
}) {
  const getVisiblePages = () => {
    const delta = 2;
    const pages = [];
    
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    
    return pages;
  };

  return (
    <nav className={cn("flex items-center gap-1", className)} {...props}>
      {showEdges && (
        <button
          onClick={() => onPageChange?.(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(
            "p-2 rounded-lg transition-colors",
            "hover:bg-background-muted disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      
      {getVisiblePages().map((page, i) => (
        page === "..." ? (
          <span key={i} className="px-3 py-2 text-charcoal-light">...</span>
        ) : (
          <button
            key={i}
            onClick={() => onPageChange?.(page)}
            className={cn(
              "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              currentPage === page
                ? "bg-primary text-white"
                : "hover:bg-background-muted text-charcoal"
            )}
          >
            {page}
          </button>
        )
      ))}
      
      {showEdges && (
        <button
          onClick={() => onPageChange?.(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(
            "p-2 rounded-lg transition-colors",
            "hover:bg-background-muted disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </nav>
  );
}

// Steps - Progress steps
export function Steps({ 
  steps = [], 
  currentStep, 
  orientation = "horizontal",
  className, 
  ...props 
}) {
  return (
    <div 
      className={cn(
        orientation === "horizontal" ? "flex items-center" : "flex flex-col",
        className
      )} 
      {...props}
    >
      {steps.map((step, index) => {
        const isComplete = index < currentStep;
        const isCurrent = index === currentStep;
        
        return (
          <React.Fragment key={index}>
            <div className={cn(
              "flex items-center gap-3",
              orientation === "vertical" && "pb-8 last:pb-0"
            )}>
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                isComplete && "bg-primary text-white",
                isCurrent && "bg-primary text-white ring-4 ring-primary/20",
                !isComplete && !isCurrent && "bg-background-muted text-charcoal-light"
              )}>
                {isComplete ? "✓" : index + 1}
              </div>
              <div>
                <p className={cn(
                  "text-sm font-medium",
                  isCurrent ? "text-midnight" : "text-charcoal-light"
                )}>
                  {step.label}
                </p>
                {step.description && (
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                )}
              </div>
            </div>
            
            {index < steps.length - 1 && (
              <div className={cn(
                orientation === "horizontal" 
                  ? "flex-1 h-0.5 mx-4" 
                  : "w-0.5 h-8 ml-4",
                isComplete ? "bg-primary" : "bg-background-muted"
              )} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// SideNav - Sidebar navigation
export function SideNav({ 
  children, 
  header,
  footer,
  className, 
  ...props 
}) {
  return (
    <nav 
      className={cn(
        "flex flex-col h-full bg-white border-r border-background-muted",
        className
      )} 
      {...props}
    >
      {header && <div className="p-4 border-b border-background-muted">{header}</div>}
      <div className="flex-1 overflow-y-auto p-3">{children}</div>
      {footer && <div className="p-4 border-t border-background-muted">{footer}</div>}
    </nav>
  );
}

// TopNav - Top navigation bar
export function TopNav({ 
  logo, 
  items = [], 
  actions,
  className, 
  ...props 
}) {
  return (
    <header 
      className={cn(
        "flex items-center justify-between h-16 px-4 md:px-6",
        "bg-white border-b border-background-muted",
        className
      )} 
      {...props}
    >
      {logo && <div className="flex-shrink-0">{logo}</div>}
      
      {items.length > 0 && (
        <nav className="hidden md:flex items-center gap-1">
          {items.map((item, i) => (
            <Link
              key={i}
              to={item.href}
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                item.active
                  ? "text-primary bg-primary/10"
                  : "text-charcoal hover:bg-background-muted"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
      
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}

export default {
  NavItem,
  NavGroup,
  Breadcrumb,
  TabsNav,
  Pagination,
  Steps,
  SideNav,
  TopNav,
};