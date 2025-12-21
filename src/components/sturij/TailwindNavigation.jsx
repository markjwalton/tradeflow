import { useState } from 'react';
import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/20/solid';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  if (navigationMode === 'hidden') {
    return null;
  }

  const isIconsOnly = navigationMode === 'icons';
  const [expandedFolders, setExpandedFolders] = useState(new Set());

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
    const isExpanded = expandedFolders.has(item.name);
    const Icon = item.icon;

    if (hasChildren) {
      const folderButton = (
        <button
          onClick={(e) => toggleFolder(item.name, e)}
          className={classNames(
            item.current ? 'bg-gray-50' : 'hover:bg-gray-50',
            'group flex w-full items-center gap-x-3 rounded-md p-2 text-left text-sm/6 font-semibold text-gray-700',
            isIconsOnly && 'justify-center'
          )}
        >
          <Icon aria-hidden="true" className="size-6 shrink-0 text-gray-400" />
          {!isIconsOnly && (
            <>
              {item.name}
              {isExpanded ? (
                <ChevronDownIcon aria-hidden="true" className="ml-auto size-5 shrink-0 text-gray-400" />
              ) : (
                <ChevronRightIcon aria-hidden="true" className="ml-auto size-5 shrink-0 text-gray-400" />
              )}
            </>
          )}
        </button>
      );

      return (
        <li key={item.name}>
          {isIconsOnly ? (
            <Tooltip>
              <TooltipTrigger asChild>
                {folderButton}
              </TooltipTrigger>
              <TooltipContent side="right">
                {item.name}
              </TooltipContent>
            </Tooltip>
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
          item.current ? 'bg-gray-50' : 'hover:bg-gray-50',
          isChild ? 'block rounded-md py-2 pr-2 pl-9 text-sm/6 text-gray-700' : 'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-700',
          isIconsOnly && !isChild && 'justify-center'
        )}
      >
        {!isChild && <Icon aria-hidden="true" className="size-6 shrink-0 text-gray-400" />}
        {(!isIconsOnly || isChild) && item.name}
      </a>
    );

    if (isIconsOnly && !isChild) {
      return (
        <li key={item.name}>
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

    return <li key={item.name}>{linkContent}</li>;
  };

  return (
    <div className={classNames(
      "relative flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white z-0",
      isIconsOnly ? "px-2 pt-6" : "px-6 pt-6"
    )}>
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
          <div className="border-t border-gray-200 pt-3">
            {isIconsOnly ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={onEditorToggle}
                    className="group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-700 hover:bg-gray-50 w-full justify-center"
                  >
                    <svg className="size-6 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                className="group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-700 hover:bg-gray-50 w-full"
              >
                <svg className="size-6 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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