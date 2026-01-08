import React, { useState } from 'react';
import { ChevronDownIcon } from 'lucide-react';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function UnderlinedTabs({ tabs, defaultValue, onValueChange, children }) {
  const [currentTab, setCurrentTab] = useState(defaultValue || tabs[0]?.value);

  const handleTabChange = (value) => {
    setCurrentTab(value);
    if (onValueChange) onValueChange(value);
  };

  const currentTabData = tabs.find((tab) => tab.value === currentTab);

  return (
    <div>
      <div className="grid grid-cols-1 sm:hidden">
        <select
          value={currentTab}
          onChange={(e) => handleTabChange(e.target.value)}
          aria-label="Select a tab"
          className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-2 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
        >
          {tabs.map((tab) => (
            <option key={tab.value} value={tab.value}>
              {tab.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon
          aria-hidden="true"
          className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end fill-gray-500"
        />
      </div>
      <div className="hidden sm:block -mt-3">
        <div className="border-b border-gray-200">
          <nav aria-label="Tabs" className="-mb-px flex">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => handleTabChange(tab.value)}
                aria-current={tab.value === currentTab ? 'page' : undefined}
                className={classNames(
                  tab.value === currentTab
                    ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                  'w-1/4 border-b-2 px-1 pt-1 pb-4 text-center text-base font-medium transition-colors',
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
      <div className="mt-6">
        {React.Children.map(children, (child) => {
          if (child?.props?.value === currentTab) {
            return child;
          }
          return null;
        })}
      </div>
    </div>
  );
}

export function UnderlinedTabsContent({ value, children }) {
  return <div>{children}</div>;
}