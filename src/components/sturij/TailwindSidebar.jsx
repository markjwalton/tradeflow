import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { ChevronRightIcon } from '@heroicons/react/20/solid'
import {
  CalendarIcon,
  ChartPieIcon,
  DocumentDuplicateIcon,
  FolderIcon,
  HomeIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import { base44 } from '@/api/base44Client'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function TailwindSidebar({ navigation = [] }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  return (
    <div className="relative flex grow flex-col gap-y-5 overflow-y-auto border-r border-[var(--color-border)] bg-[var(--primary-50)] px-6">
      <div className="relative flex h-16 shrink-0 items-center">
        <img
          alt="Your Company"
          src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
          className="h-8 w-auto"
        />
      </div>
      <nav className="relative flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  {!item.children ? (
                    <a
                      href={item.href}
                      className={classNames(
                        item.current ? 'bg-[var(--primary-100)]' : 'hover:bg-[var(--primary-100)]',
                        'group flex gap-x-3 rounded-md p-2 text-sm/6 font-normal text-[var(--primary-700)]',
                      )}
                    >
                      {item.icon && <item.icon aria-hidden="true" className="size-6 shrink-0 text-gray-400" />}
                      {item.name}
                    </a>
                  ) : (
                    <Disclosure as="div">
                      <DisclosureButton
                        className={classNames(
                          item.current ? 'bg-[var(--primary-100)]' : 'hover:bg-[var(--primary-100)]',
                          'group flex w-full items-center gap-x-3 rounded-md p-2 text-left text-sm/6 font-normal text-[var(--primary-700)]',
                        )}
                      >
                        {item.icon && <item.icon aria-hidden="true" className="size-6 shrink-0 text-[var(--primary-600)]" strokeWidth={1} />}
                        {item.name}
                        <ChevronRightIcon
                          aria-hidden="true"
                          className="ml-auto size-5 shrink-0 text-[var(--primary-600)] group-data-open:rotate-90 group-data-open:text-[var(--primary-700)]"
                          strokeWidth={1}
                        />
                      </DisclosureButton>
                      <DisclosurePanel as="ul" className="mt-1 px-2">
                        {item.children.map((subItem) => (
                          <li key={subItem.name}>
                            <DisclosureButton
                              as="a"
                              href={subItem.href}
                              className={classNames(
                                subItem.current ? 'bg-[var(--primary-100)]' : 'hover:bg-[var(--primary-100)]',
                                'block rounded-md py-2 pr-2 pl-9 text-sm/6 text-[var(--charcoal-800)]',
                              )}
                            >
                              {subItem.name}
                            </DisclosureButton>
                          </li>
                        ))}
                      </DisclosurePanel>
                    </Disclosure>
                  )}
                </li>
              ))}
            </ul>
          </li>
          <li className="-mx-6 mt-auto">
            <a
              href="#"
              className="flex items-center gap-x-4 px-6 py-3 text-sm/6 font-normal text-[var(--charcoal-800)] hover:bg-[var(--primary-100)]"
            >
              <img
                alt=""
                src={user?.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'User')}`}
                className="size-8 rounded-full bg-gray-50 outline -outline-offset-1 outline-black/5"
              />
              <span className="sr-only">Your profile</span>
              <span aria-hidden="true">{user?.full_name || 'User'}</span>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  )
}