import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Page Section Header with tabs and action buttons
 * Based on Tailwind UI pattern for section headings with navigation
 */
export function PageSectionHeader({ 
  title, 
  tabs = [], 
  currentTab, 
  onTabChange,
  actions = [],
  className 
}) {
  const activeTab = tabs.find(tab => tab.value === currentTab) || tabs[0];

  return (
    <div className={cn("relative border-b pb-5 sm:pb-0", className)}>
      <div className="md:flex md:items-center md:justify-between">
        <h3 className="text-base font-semibold">{title}</h3>
        {actions.length > 0 && (
          <div className="mt-3 flex gap-3 md:absolute md:top-3 md:right-0 md:mt-0">
            {actions.map((action, idx) => (
              <Button
                key={idx}
                variant={action.variant || 'default'}
                size={action.size || 'default'}
                onClick={action.onClick}
                className={action.className}
              >
                {action.icon && <action.icon className="h-4 w-4 mr-2" />}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
      
      {tabs.length > 0 && (
        <div className="mt-4">
          {/* Mobile select dropdown */}
          <div className="grid grid-cols-1 sm:hidden">
            <select
              value={currentTab}
              onChange={(e) => onTabChange?.(e.target.value)}
              aria-label="Select a tab"
              className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-card py-2 pr-8 pl-3 text-base outline-1 -outline-offset-1 outline-border focus:outline-2 focus:-outline-offset-2 focus:outline-primary"
            >
              {tabs.map((tab) => (
                <option key={tab.value} value={tab.value}>
                  {tab.label}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-muted-foreground"
            />
          </div>
          
          {/* Desktop tabs */}
          <div className="hidden sm:block">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => onTabChange?.(tab.value)}
                  aria-current={tab.value === currentTab ? 'page' : undefined}
                  className={cn(
                    'border-b-2 px-1 pb-4 text-sm font-medium whitespace-nowrap transition-colors',
                    tab.value === currentTab
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                  )}
                >
                  {tab.icon && <tab.icon className="inline-block h-4 w-4 mr-2" />}
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="ml-2 py-0.5 px-2 rounded-full bg-muted text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}