import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

export default function TailwindDropdownMenu({ 
  buttonLabel, 
  menuSections = [], 
  buttonClassName = '',
  align = 'right' 
}) {
  const alignmentClasses = {
    left: 'left-0',
    right: 'right-0',
  };

  return (
    <Menu as="div" className="relative inline-block">
      <MenuButton className={buttonClassName || "inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring-1 inset-ring-gray-300 hover:bg-gray-50"}>
        {buttonLabel}
        <ChevronDownIcon aria-hidden="true" className="-mr-1 size-5 text-gray-400" />
      </MenuButton>

      <MenuItems
        transition
        className={`absolute ${alignmentClasses[align]} z-10 mt-2 w-56 origin-top-${align} divide-y divide-gray-100 rounded-md bg-white shadow-lg outline-1 outline-black/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in`}
      >
        {menuSections.map((section, sectionIdx) => (
          <div key={sectionIdx} className="py-1">
            {section.items.map((item, itemIdx) => (
              <MenuItem key={itemIdx}>
                <a
                  href={item.href || '#'}
                  onClick={(e) => {
                    if (item.onClick) {
                      e.preventDefault();
                      item.onClick();
                    }
                  }}
                  className="group flex items-center px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
                >
                  {item.icon && (
                    <item.icon
                      aria-hidden="true"
                      className="mr-3 size-5 text-gray-400 group-data-focus:text-gray-500"
                    />
                  )}
                  {item.label}
                </a>
              </MenuItem>
            ))}
          </div>
        ))}
      </MenuItems>
    </Menu>
  );
}