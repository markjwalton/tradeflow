import { useState, useRef, useEffect } from 'react';
import { Search, Menu as MenuIcon, Bell, X } from 'lucide-react';
import { createPageUrl } from '@/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function TailwindTopNav({
  logoSrc = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69274b9c077e61d7cfe78ec7/c94580ddf_sturij-logo.png',
  logoAlt = 'Sturij',
  navigation = [],
  userNavigation = [],
  user = null,
  onSearch,
  searchResults = [],
  searchQuery = '',
  onNotificationClick,
  onMobileMenuClick,
  onSidebarToggle,
}) {
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <header className="relative z-10 bg-[var(--color-card)] shadow-[var(--shadow-sm)]">
      <div className="mx-auto max-w-full px-2 sm:px-4 md:divide-y md:divide-[var(--color-border)] lg:px-8">
        <div className="relative flex h-16 justify-between">
          <div className="relative z-10 flex items-center px-2 lg:px-0">
            {/* Sidebar toggle - visible on tablet (md) and desktop (lg) */}
            {onSidebarToggle && (
              <button
                type="button"
                onClick={onSidebarToggle}
                className="hidden md:inline-flex items-center justify-center rounded-md p-2 text-[var(--text-muted)] hover:bg-[var(--background-100)] hover:text-[var(--text-secondary)] focus:outline-2 focus:-outline-offset-1 focus:outline-[var(--color-primary)] mr-2"
              >
                <span className="sr-only">Toggle sidebar</span>
                <MenuIcon aria-hidden="true" className="h-6 w-6" />
              </button>
            )}
            <div className="flex shrink-0 items-center">
              <img alt={logoAlt} src={logoSrc} className="h-12 w-auto" />
            </div>
          </div>
          <div className="relative z-0 flex flex-1 items-center justify-center px-2 sm:absolute sm:inset-0" ref={searchRef}>
            <div className="relative w-full sm:max-w-xs">
              <div className="grid w-full grid-cols-1">
                <input
                  name="search"
                  placeholder="Search pages..."
                  value={searchQuery}
                  onChange={(e) => {
                    onSearch?.(e.target.value);
                    setShowResults(true);
                  }}
                  onFocus={() => setShowResults(true)}
                  className="col-start-1 row-start-1 block w-full rounded-[var(--radius-md)] bg-[var(--color-card)] py-1.5 pr-3 pl-10 text-[var(--text-base)] text-[var(--text-primary)] outline-1 -outline-offset-1 outline-[var(--color-border)] placeholder:text-[var(--text-muted)] focus:outline-2 focus:-outline-offset-2 focus:outline-[var(--color-primary)] sm:text-[var(--text-sm)]"
                />
                <Search
                  aria-hidden="true"
                  className="pointer-events-none col-start-1 row-start-1 ml-3 h-5 w-5 self-center text-[var(--text-muted)]"
                />
              </div>
              {/* Search Results Dropdown */}
              {showResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--color-card)] rounded-[var(--radius-md)] shadow-[var(--shadow-lg)] border border-[var(--color-border)] max-h-64 overflow-y-auto z-50">
                  {searchResults.map((result) => (
                    <a
                      key={result.id || result.slug}
                      href={result.slug ? createPageUrl(result.slug) : '#'}
                      className="block px-4 py-2 text-[var(--text-sm)] text-[var(--text-secondary)] hover:bg-[var(--background-100)]"
                      onClick={() => setShowResults(false)}
                    >
                      <div className="font-medium">{result.name}</div>
                      {result.slug && (
                        <div className="text-[var(--text-xs)] text-[var(--text-muted)]">{result.slug}</div>
                      )}
                    </a>
                  ))}
                </div>
              )}
              {showResults && searchQuery && searchResults.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--color-card)] rounded-[var(--radius-md)] shadow-[var(--shadow-lg)] border border-[var(--color-border)] z-50">
                  <div className="px-4 py-3 text-[var(--text-sm)] text-[var(--text-muted)]">No pages found</div>
                </div>
              )}
            </div>
          </div>
          <div className="relative z-10 flex items-center md:hidden">
            <button
              type="button"
              onClick={onMobileMenuClick}
              className="relative inline-flex items-center justify-center rounded-md p-2 text-[var(--text-muted)] hover:bg-[var(--background-100)] hover:text-[var(--text-secondary)] focus:outline-2 focus:-outline-offset-1 focus:outline-[var(--color-primary)]"
            >
              <span className="absolute -inset-0.5" />
              <span className="sr-only">Open menu</span>
              <MenuIcon aria-hidden="true" className="h-6 w-6" />
            </button>
          </div>
          <div className="hidden md:relative md:z-10 md:ml-4 md:flex md:items-center">
            <button
              type="button"
              onClick={onNotificationClick}
              className="relative shrink-0 rounded-full p-1 text-[var(--text-muted)] hover:text-[var(--text-secondary)] focus:outline-2 focus:outline-offset-2 focus:outline-[var(--color-primary)]"
            >
              <span className="absolute -inset-1.5" />
              <span className="sr-only">View notifications</span>
              <Bell aria-hidden="true" className="h-6 w-6" />
            </button>

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger className="relative ml-4 flex rounded-[var(--radius-full)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]">
                  <span className="absolute -inset-1.5" />
                  <span className="sr-only">Open user menu</span>
                  {user.imageUrl ? (
                    <img
                      alt=""
                      src={user.imageUrl}
                      className="h-8 w-8 rounded-[var(--radius-full)] bg-[var(--background-100)] outline -outline-offset-1 outline-black/5"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-[var(--radius-full)] bg-[var(--primary-100)] flex items-center justify-center text-[var(--primary-600)] font-medium text-[var(--text-sm)]">
                      {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48 bg-[var(--color-card)] border-[var(--color-border)]">
                  <div className="px-4 py-2 border-b border-[var(--color-border)]">
                    <p className="text-[var(--text-sm)] font-medium text-[var(--text-primary)] truncate">{user.name}</p>
                    <p className="text-[var(--text-xs)] text-[var(--text-muted)] truncate">{user.email}</p>
                  </div>
                  {userNavigation.map((item) => (
                    <DropdownMenuItem key={item.name} asChild>
                      <a
                        href={item.href}
                        onClick={(e) => {
                          if (item.onClick) {
                            e.preventDefault();
                            item.onClick();
                          }
                        }}
                        className="block px-4 py-2 text-[var(--text-sm)] text-[var(--text-secondary)]"
                      >
                        {item.name}
                      </a>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        <nav aria-label="Global" className="hidden md:flex md:space-x-8 md:py-2">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              onClick={item.onClick}
              aria-current={item.current ? 'page' : undefined}
              className={classNames(
                item.current ? 'bg-[var(--background-100)] text-[var(--text-primary)]' : 'text-[var(--text-primary)] hover:bg-[var(--background-50)]',
                'inline-flex items-center rounded-[var(--radius-md)] px-3 py-2 text-[var(--text-sm)] font-medium',
              )}
            >
              {item.name}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}