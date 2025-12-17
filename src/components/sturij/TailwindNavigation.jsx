import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { ChevronRightIcon } from '@heroicons/react/20/solid';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function TailwindNavigation({ 
  navigation = [], 
  navigationMode = 'expanded', // 'expanded', 'icons', 'hidden'
  logoSrc,
  logoAlt = 'Company Logo',
  onNavigate 
}) {
  if (navigationMode === 'hidden') {
    return null;
  }

  const isIconsOnly = navigationMode === 'icons';

  return (
    <div className={classNames(
      "relative flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white",
      isIconsOnly ? "px-2" : "px-6"
    )}>
      {logoSrc && (
        <div className="relative flex h-16 shrink-0 items-center">
          <img
            alt={logoAlt}
            src={logoSrc}
            className={classNames(
              "w-auto",
              isIconsOnly ? "h-6 mx-auto" : "h-8"
            )}
          />
        </div>
      )}
      <nav className="relative flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className={classNames(isIconsOnly ? "space-y-1" : "-mx-2 space-y-1")}>
              {navigation.map((item) => (
                <li key={item.name}>
                  {!item.children ? (
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
                        'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-700',
                        isIconsOnly && 'justify-center'
                      )}
                      title={isIconsOnly ? item.name : undefined}
                    >
                      <item.icon aria-hidden="true" className="size-6 shrink-0 text-gray-400" />
                      {!isIconsOnly && item.name}
                    </a>
                  ) : (
                    <Disclosure as="div">
                      <DisclosureButton
                        className={classNames(
                          item.current ? 'bg-gray-50' : 'hover:bg-gray-50',
                          'group flex w-full items-center gap-x-3 rounded-md p-2 text-left text-sm/6 font-semibold text-gray-700',
                          isIconsOnly && 'justify-center'
                        )}
                        title={isIconsOnly ? item.name : undefined}
                      >
                        <item.icon aria-hidden="true" className="size-6 shrink-0 text-gray-400" />
                        {!isIconsOnly && (
                          <>
                            {item.name}
                            <ChevronRightIcon
                              aria-hidden="true"
                              className="ml-auto size-5 shrink-0 text-gray-400 group-data-open:rotate-90 group-data-open:text-gray-500"
                            />
                          </>
                        )}
                      </DisclosureButton>
                      {!isIconsOnly && (
                        <DisclosurePanel as="ul" className="mt-1 px-2">
                          {item.children.map((subItem) => (
                            <li key={subItem.name}>
                              <DisclosureButton
                                as="a"
                                href={subItem.href || '#'}
                                onClick={(e) => {
                                  if (onNavigate) {
                                    e.preventDefault();
                                    onNavigate(subItem);
                                  }
                                }}
                                className={classNames(
                                  subItem.current ? 'bg-gray-50' : 'hover:bg-gray-50',
                                  'block rounded-md py-2 pr-2 pl-9 text-sm/6 text-gray-700'
                                )}
                              >
                                {subItem.name}
                              </DisclosureButton>
                            </li>
                          ))}
                        </DisclosurePanel>
                      )}
                    </Disclosure>
                  )}
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  );
}