import { ChevronDownIcon } from '@heroicons/react/16/solid';
import { GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function PageSectionHeader({ 
  title, 
  tabs = [], 
  actions = [],
  onTabChange,
  dragHandleProps
}) {
  const currentTab = tabs.find(tab => tab.current);

  return (
    <div className="relative border-b border-[var(--color-border)] pt-6 pb-5 sm:pt-6 sm:pb-0">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          {dragHandleProps && (
            <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing">
              <GripVertical className="h-5 w-5 text-[var(--accent-400)]" />
            </div>
          )}
          <h3 className="page-section-title">{title}</h3>
        </div>
        {actions.length > 0 && (
          <div className="mt-3 flex gap-2 md:absolute md:top-3 md:right-0 md:mt-0">
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  type="button"
                  onClick={action.onClick}
                  variant={action.variant || (index === actions.length - 1 ? 'default' : 'outline')}
                  size={action.size || 'sm'}
                >
                  {Icon && <Icon className="h-4 w-4 mr-1.5" />}
                  {action.label}
                </Button>
              );
            })}
          </div>
        )}
      </div>
      {tabs.length > 0 && (
        <div className="mt-4">
          <div className="grid grid-cols-1 sm:hidden">
            <select
              value={currentTab?.name}
              aria-label="Select a tab"
              onChange={(e) => {
                const selectedTab = tabs.find(tab => tab.name === e.target.value);
                if (selectedTab && onTabChange) {
                  onTabChange(selectedTab);
                }
              }}
              className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-[var(--color-card)] py-2 pr-8 pl-3 text-base text-[var(--color-text-primary)] border border-[var(--color-border)]"
            >
              {tabs.map((tab) => (
                <option key={tab.name}>{tab.name}</option>
              ))}
            </select>
            <ChevronDownIcon
              aria-hidden="true"
              className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end fill-[var(--color-text-muted)]"
            />
          </div>
          <div className="hidden sm:block">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <a
                  key={tab.name}
                  href={tab.href}
                  onClick={(e) => {
                    if (onTabChange) {
                      e.preventDefault();
                      onTabChange(tab);
                    }
                  }}
                  aria-current={tab.current ? 'page' : undefined}
                  className={classNames(
                    tab.current
                      ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                      : 'border-transparent text-[var(--color-text-muted)] hover:border-[var(--color-border)] hover:text-[var(--color-text-primary)]',
                    'border-b-2 px-1 pb-4 text-sm font-medium whitespace-nowrap',
                  )}
                >
                  {tab.name}
                </a>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}