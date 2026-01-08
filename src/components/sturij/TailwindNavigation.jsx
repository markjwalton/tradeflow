import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function TailwindNavigation({ 
  navigation = [], 
  navigationMode = 'expanded', // 'expanded', 'icons', 'hidden'
  logoSrc,
  logoAlt = 'Company Logo',
  onNavigate,
  onEditorToggle
}) {
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const isIconsOnly = navigationMode === 'icons';

  if (navigationMode === 'hidden') {
    return null;
  }

  const toggleFolder = (itemName, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(itemName)) next.delete(itemName);
      else next.add(itemName);
      return next;
    });
  };

  const renderNavItem = (item, isChild = false) => {
    const hasChildren = item.children && item.children.length > 0;
    const isFolder = item.isFolder || hasChildren;
    const isExpanded = expandedFolders.has(item.id || item.name);
    const Icon = item.icon;

    if (isFolder && hasChildren) {
      const folderButton = (
        <button
          onClick={(e) => toggleFolder(item.id || item.name, e)}
          className={classNames(
            item.current ? 'bg-[var(--primary-100)]' : 'hover:bg-[var(--primary-100)]',
            'group flex w-full items-center gap-x-3 rounded-[var(--radius-md)] p-2 text-left text-[var(--text-sm)] font-normal text-[var(--primary-700)]',
            isIconsOnly && 'justify-center'
          )}
        >
          <Icon aria-hidden="true" className="size-6 shrink-0 text-[var(--text-muted)]" />
          {!isIconsOnly && (
            <>
              {item.name}
              {isExpanded ? (
                <ChevronDown aria-hidden="true" className="ml-auto h-5 w-5 shrink-0 text-[var(--primary-600)]" strokeWidth={1} />
              ) : (
                <ChevronRight aria-hidden="true" className="ml-auto h-5 w-5 shrink-0 text-[var(--primary-600)]" strokeWidth={1} />
              )}
            </>
          )}
        </button>
      );

      return (
        <li key={item.id || item.name}>
          {isIconsOnly ? (
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className={classNames(
                    item.current ? 'bg-[var(--primary-100)]' : 'hover:bg-[var(--primary-100)]',
                    'group flex w-full items-center gap-x-3 rounded-[var(--radius-md)] p-2 text-left text-[var(--text-sm)] font-normal text-[var(--primary-700)] justify-center'
                  )}
                >
                  <Icon aria-hidden="true" className="size-6 shrink-0 text-[var(--primary-600)]" strokeWidth={1} />
                </button>
              </PopoverTrigger>
              <PopoverContent side="right" align="start" className="w-48 p-2 bg-[var(--color-card)] border-[var(--color-border)]">
                <div className="font-semibold text-[var(--text-sm)] text-[var(--text-primary)] mb-2 px-2">{item.name}</div>
                <ul className="space-y-1">
                  {item.children.map((subItem) => (
                    <li key={subItem.name}>
                      <a
                        href={subItem.href || '#'}
                        onClick={(e) => {
                          if (onNavigate) {
                            e.preventDefault();
                            onNavigate(subItem);
                          }
                        }}
                        className="block rounded-[var(--radius-md)] py-2 px-2 text-[var(--text-sm)] text-[var(--charcoal-800)] hover:bg-[var(--primary-100)]"
                      >
                        {subItem.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </PopoverContent>
            </Popover>
          ) : (
            folderButton
          )}
          {isExpanded && !isIconsOnly && (
            <ul className="mt-1 px-2">
              {item.children.map((subItem) => renderNavItem(subItem, true))}
            </ul>
          )}
        </li>
      );
    }

    const linkContent = (
      <a
        href={item.href || '#'}
        onClick={(e) => {
          if (onNavigate) {
            e.preventDefault();
            onNavigate(item);
          }
        }}
        className={classNames(
          item.current ? 'bg-[var(--primary-100)]' : 'hover:bg-[var(--primary-100)]',
          isChild ? 'block rounded-[var(--radius-md)] py-2 pr-2 pl-9 text-[var(--text-sm)] text-[var(--charcoal-800)]' : 'group flex gap-x-3 rounded-[var(--radius-md)] p-2 text-[var(--text-sm)] font-normal text-[var(--primary-700)]',
          isIconsOnly && !isChild && 'justify-center'
        )}
      >
        {!isChild && <Icon aria-hidden="true" className="size-6 shrink-0 text-[var(--primary-600)]" strokeWidth={1} />}
        {(!isIconsOnly || isChild) && item.name}
      </a>
    );

    if (isIconsOnly && !isChild) {
      return (
        <li key={item.id || item.name}>
          <Tooltip>
            <TooltipTrigger asChild>
              {linkContent}
            </TooltipTrigger>
            <TooltipContent side="right">
              {item.name}
            </TooltipContent>
          </Tooltip>
        </li>
      );
    }

    return <li key={item.id || item.name}>{linkContent}</li>;
  };

  return (
    <div className={classNames(
      "hidden md:flex flex-col gap-y-5 overflow-y-auto border-r border-[var(--color-border)] bg-[var(--primary-50)] z-0 shrink-0",
      isIconsOnly ? "w-16 px-2 pt-6" : "w-64 px-6 pt-6"
    )} style={{ minHeight: '100%' }}>
      <TooltipProvider delayDuration={300}>
        <nav className="relative flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className={classNames(isIconsOnly ? "space-y-1" : "-mx-2 space-y-1")}>
                {navigation.map((item) => renderNavItem(item, false))}
              </ul>
            </li>
          </ul>
        </nav>
      </TooltipProvider>

      {/* Editor Toggle Button */}
      {onEditorToggle && (
        <TooltipProvider delayDuration={300}>
          <div className="border-t border-[var(--color-border)] pt-3">
            {isIconsOnly ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={onEditorToggle}
                    className="group flex gap-x-3 rounded-[var(--radius-md)] p-2 text-[var(--text-sm)] font-semibold text-[var(--text-secondary)] hover:bg-[var(--background-100)] w-full justify-center"
                  >
                    <svg className="size-6 shrink-0 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  Toggle Editor
                </TooltipContent>
              </Tooltip>
            ) : (
              <button
                onClick={onEditorToggle}
                className="group flex gap-x-3 rounded-[var(--radius-md)] p-2 text-[var(--text-sm)] font-semibold text-[var(--text-secondary)] hover:bg-[var(--background-100)] w-full"
              >
                <svg className="size-6 shrink-0 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                Toggle Editor
              </button>
            )}
          </div>
        </TooltipProvider>
      )}
    </div>
  );
}