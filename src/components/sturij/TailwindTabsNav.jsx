import { ChevronDownIcon } from '@heroicons/react/16/solid';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function TailwindTabsNav({ tabs = [], onTabChange }) {
  const currentTab = tabs.find((tab) => tab.current);

  const handleSelectChange = (e) => {
    const selectedTab = tabs.find(t => t.name === e.target.value);
    onTabChange?.(selectedTab);
  };

  const handleTabClick = (tab) => {
    onTabChange?.(tab);
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:hidden">
        <select
          value={currentTab?.name}
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
          {tabs.map((tab, tabIdx) => (
            <a
              key={tab.name}
              href={tab.href || '#'}
              onClick={(e) => {
                e.preventDefault();
                handleTabClick(tab);
              }}
              aria-current={tab.current ? 'page' : undefined}
              className={classNames(
                tab.current ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]',
                tabIdx === 0 ? 'rounded-l-lg' : '',
                tabIdx === tabs.length - 1 ? 'rounded-r-lg' : '',
                'group relative min-w-0 flex-1 overflow-hidden px-4 py-4 text-center text-sm font-medium hover:bg-[var(--background-50)] focus:z-10',
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
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}