import {
  BriefcaseIcon,
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  CurrencyDollarIcon,
  LinkIcon,
  MapPinIcon,
  PencilIcon,
} from '@heroicons/react/20/solid';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';

/**
 * TailwindPageHeader - Page header with title, meta info, and action buttons
 * @param {string} title - Main page title
 * @param {Array} metaItems - Array of meta info items: { icon: IconComponent, text: string }
 * @param {Array} actions - Array of action buttons: { label: string, icon: IconComponent, onClick: function, variant: 'primary'|'secondary', hideOnMobile: boolean }
 */
export default function TailwindPageHeader({ 
  title, 
  metaItems = [], 
  actions = [] 
}) {
  const primaryActions = actions.filter(a => !a.hideOnMobile);
  const secondaryActions = actions.filter(a => a.hideOnMobile);
  const mobileMenuActions = actions.filter(a => a.hideOnMobile);

  return (
    <div className="lg:flex lg:items-center lg:justify-between">
      <div className="min-w-0 flex-1">
        <h2 className="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          {title}
        </h2>
        {metaItems.length > 0 && (
          <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
            {metaItems.map((item, index) => (
              <div key={index} className="mt-2 flex items-center text-sm text-gray-500">
                {item.icon && (
                  <item.icon aria-hidden="true" className="mr-1.5 size-5 shrink-0 text-gray-400" />
                )}
                {item.text}
              </div>
            ))}
          </div>
        )}
      </div>

      {actions.length > 0 && (
        <div className="mt-5 flex lg:mt-0 lg:ml-4">
          {secondaryActions.map((action, index) => (
            <span key={index} className={index > 0 ? 'ml-3 hidden sm:block' : 'hidden sm:block'}>
              <button
                type="button"
                onClick={action.onClick}
                className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50"
              >
                {action.icon && (
                  <action.icon aria-hidden="true" className="mr-1.5 -ml-0.5 size-5 text-gray-400" />
                )}
                {action.label}
              </button>
            </span>
          ))}

          {primaryActions.map((action, index) => (
            <span key={index} className={secondaryActions.length > 0 ? 'sm:ml-3' : ''}>
              <button
                type="button"
                onClick={action.onClick}
                className={
                  action.variant === 'primary'
                    ? 'inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                    : 'inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50'
                }
              >
                {action.icon && (
                  <action.icon aria-hidden="true" className="mr-1.5 -ml-0.5 size-5" />
                )}
                {action.label}
              </button>
            </span>
          ))}

          {mobileMenuActions.length > 0 && (
            <Menu as="div" className="relative ml-3 sm:hidden">
              <MenuButton className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50">
                More
                <ChevronDownIcon aria-hidden="true" className="-mr-1 ml-1.5 size-5 text-gray-400" />
              </MenuButton>

              <MenuItems
                transition
                className="absolute left-0 z-10 mt-2 -mr-1 w-24 origin-top-right rounded-md bg-white py-1 shadow-lg outline outline-black/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
              >
                {mobileMenuActions.map((action, index) => (
                  <MenuItem key={index}>
                    <button
                      onClick={action.onClick}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden"
                    >
                      {action.label}
                    </button>
                  </MenuItem>
                ))}
              </MenuItems>
            </Menu>
          )}
        </div>
      )}
    </div>
  );
}