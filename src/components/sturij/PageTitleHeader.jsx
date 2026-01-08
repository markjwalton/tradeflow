import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Page Title Header with metadata and actions
 * Based on Tailwind UI pattern for page headings
 */
export function PageTitleHeader({ 
  title, 
  metadata = [],
  actions = [],
  className 
}) {
  const primaryAction = actions.find(a => a.primary);
  const secondaryActions = actions.filter(a => !a.primary);

  return (
    <div className={cn("lg:flex lg:items-center lg:justify-between", className)}>
      <div className="min-w-0 flex-1">
        <h2 className="text-2xl/7 font-bold sm:truncate sm:text-3xl sm:tracking-tight">
          {title}
        </h2>
        {metadata.length > 0 && (
          <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
            {metadata.map((item, idx) => (
              <div key={idx} className="mt-2 flex items-center text-sm text-muted-foreground">
                {item.icon && <item.icon className="mr-1.5 size-5 shrink-0 text-muted-foreground/60" />}
                {item.label}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {actions.length > 0 && (
        <div className="mt-5 flex lg:mt-0 lg:ml-4">
          {/* Desktop secondary actions */}
          {secondaryActions.map((action, idx) => (
            <span key={idx} className={cn("hidden sm:block", idx > 0 && "ml-3")}>
              <Button
                variant={action.variant || 'outline'}
                size={action.size || 'default'}
                onClick={action.onClick}
              >
                {action.icon && <action.icon className="mr-1.5 -ml-0.5 size-5" />}
                {action.label}
              </Button>
            </span>
          ))}

          {/* Primary action */}
          {primaryAction && (
            <span className="sm:ml-3">
              <Button
                variant={primaryAction.variant || 'default'}
                size={primaryAction.size || 'default'}
                onClick={primaryAction.onClick}
              >
                {primaryAction.icon && <primaryAction.icon className="mr-1.5 -ml-0.5 size-5" />}
                {primaryAction.label}
              </Button>
            </span>
          )}

          {/* Mobile dropdown for secondary actions */}
          {secondaryActions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-3 sm:hidden">
                  More
                  <ChevronDown className="-mr-1 ml-1.5 size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {secondaryActions.map((action, idx) => (
                  <DropdownMenuItem key={idx} onClick={action.onClick}>
                    {action.icon && <action.icon className="mr-2 size-4" />}
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}
    </div>
  );
}