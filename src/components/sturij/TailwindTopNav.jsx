import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline';

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
  onNotificationClick,
  onMobileMenuClick,
  onSidebarToggle,
}) {
  return (
    <header className="relative z-10 bg-white shadow-sm">
      <div className="mx-auto max-w-full px-2 sm:px-4 md:divide-y md:divide-gray-200 lg:px-8">
        <div className="relative flex h-16 justify-between">
          <div className="relative z-10 flex items-center px-2 lg:px-0">
            {/* Sidebar toggle - visible on tablet (md) and desktop (lg) */}
            {onSidebarToggle && (
              <button
                type="button"
                onClick={onSidebarToggle}
                className="hidden md:inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-2 focus:-outline-offset-1 focus:outline-indigo-600 mr-2"
              >
                <span className="sr-only">Toggle sidebar</span>
                <Bars3Icon aria-hidden="true" className="h-6 w-6" />
              </button>
            )}
            <div className="flex shrink-0 items-center">
              <img alt={logoAlt} src={logoSrc} className="h-12 w-auto" />
            </div>
          </div>
          <div className="relative z-0 flex flex-1 items-center justify-center px-2 sm:absolute sm:inset-0">
            <div className="grid w-full grid-cols-1 sm:max-w-xs">
              <input
                name="search"
                placeholder="Search"
                onChange={(e) => onSearch?.(e.target.value)}
                className="col-start-1 row-start-1 block w-full rounded-md bg-white py-1.5 pr-3 pl-10 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
              />
              <MagnifyingGlassIcon
                aria-hidden="true"
                className="pointer-events-none col-start-1 row-start-1 ml-3 size-5 self-center text-gray-400"
              />
            </div>
          </div>
          <div className="relative z-10 flex items-center md:hidden">
            <button
              type="button"
              onClick={onMobileMenuClick}
              className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-2 focus:-outline-offset-1 focus:outline-indigo-600"
            >
              <span className="absolute -inset-0.5" />
              <span className="sr-only">Open menu</span>
              <Bars3Icon aria-hidden="true" className="size-6" />
            </button>
          </div>
          <div className="hidden md:relative md:z-10 md:ml-4 md:flex md:items-center">
            <button
              type="button"
              onClick={onNotificationClick}
              className="relative shrink-0 rounded-full p-1 text-gray-400 hover:text-gray-500 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-600"
            >
              <span className="absolute -inset-1.5" />
              <span className="sr-only">View notifications</span>
              <BellIcon aria-hidden="true" className="size-6" />
            </button>

            {user && (
              <Menu as="div" className="relative ml-4 shrink-0">
                <MenuButton className="relative flex rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                  <span className="absolute -inset-1.5" />
                  <span className="sr-only">Open user menu</span>
                  <img
                    alt=""
                    src={user.imageUrl}
                    className="size-8 rounded-full bg-gray-100 outline -outline-offset-1 outline-black/5"
                  />
                </MenuButton>

                <MenuItems
                  transition
                  className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg outline-1 outline-black/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                >
                  {userNavigation.map((item) => (
                    <MenuItem key={item.name}>
                      <a
                        href={item.href}
                        onClick={item.onClick}
                        className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden"
                      >
                        {item.name}
                      </a>
                    </MenuItem>
                  ))}
                </MenuItems>
              </Menu>
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
                item.current ? 'bg-gray-100 text-gray-900' : 'text-gray-900 hover:bg-gray-50',
                'inline-flex items-center rounded-md px-3 py-2 text-sm font-medium',
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