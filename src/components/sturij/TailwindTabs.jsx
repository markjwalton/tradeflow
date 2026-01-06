import { ChevronDownIcon } from '@heroicons/react/16/solid'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function TailwindTabs({ tabs = [], activeTab, onTabChange }) {
  const tabsWithCurrent = tabs.map(tab => ({
    ...tab,
    current: tab.value === activeTab
  }));

  const handleSelectChange = (e) => {
    const selectedTab = tabs.find(tab => tab.name === e.target.value);
    if (selectedTab && onTabChange) {
      onTabChange(selectedTab.value);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:hidden">
        <select
          value={tabsWithCurrent.find((tab) => tab.current)?.name}
          onChange={handleSelectChange}
          aria-label="Select a tab"
          className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-[var(--color-card)] py-2 pr-8 pl-3 text-base text-[var(--text-primary)] outline-1 -outline-offset-1 outline-[var(--color-border)] focus:outline-2 focus:-outline-offset-2 focus:outline-[var(--color-primary)]"
        >
          {tabs.map((tab) => (
            <option key={tab.name}>{tab.name}</option>
          ))}
        </select>
        <ChevronDownIcon
          aria-hidden="true"
          className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end fill-[var(--text-muted)]"
        />
      </div>
      <div className="hidden sm:block">
        <nav aria-label="Tabs" className="isolate flex divide-x divide-[var(--color-border)] rounded-lg bg-[var(--color-card)] shadow-sm border border-[var(--color-border)]">
          {tabsWithCurrent.map((tab, tabIdx) => (
            <button
              key={tab.name}
              onClick={() => onTabChange && onTabChange(tab.value)}
              aria-current={tab.current ? 'page' : undefined}
              className={classNames(
                tab.current ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]',
                tabIdx === 0 ? 'rounded-l-lg' : '',
                tabIdx === tabs.length - 1 ? 'rounded-r-lg' : '',
                'group relative min-w-0 flex-1 overflow-hidden px-4 py-4 text-center text-sm font-medium hover:bg-[var(--background-100)] focus:z-10',
              )}
            >
              <span>{tab.name}</span>
              <span
                aria-hidden="true"
                className={classNames(
                  tab.current ? 'bg-[var(--color-primary)]' : 'bg-transparent',
                  'absolute inset-x-0 bottom-0 h-0.5',
                )}
              />
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}