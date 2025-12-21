import { Fragment, useState } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, TransitionChild } from '@headlessui/react';
import { XMarkIcon, ChevronDownIcon, ChevronRightIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { HomeIcon, FolderIcon as FolderIconOutline, FolderOpenIcon } from '@heroicons/react/24/outline';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function TailwindMobileDrawer({
  open,
  onClose,
  navigation = [],
  secondaryNavigation = [],
  user = null,
  logoSrc = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69274b9c077e61d7cfe78ec7/c94580ddf_sturij-logo.png',
  logoAlt = 'Sturij',
  onNavigate,
  onSettings,
  onLogout,
}) {
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

  const handleNavClick = (item) => {
    if (onNavigate) {
      onNavigate(item);
    }
    onClose();
  };

  const userInitials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() || 'U';

  const renderNavItem = (item, isChild = false) => {
    const isFolder = item.children && item.children.length > 0;
    const isExpanded = expandedFolders.has(item.name);
    const Icon = item.icon || HomeIcon;

    if (isFolder) {
      const FolderDisplayIcon = isExpanded ? FolderOpenIcon : FolderIconOutline;
      const DisplayIcon = item.icon || FolderDisplayIcon;

      return (
        <div key={item.name}>
          <button
            onClick={(e) => toggleFolder(item.name, e)}
            className={classNames(
              'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-100',
              isChild && 'pl-8',
              'min-h-[44px]'
            )}
          >
            {isExpanded ? (
              <ChevronDownIcon className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronRightIcon className="h-4 w-4 text-gray-400" />
            )}
            <DisplayIcon className="h-5 w-5 text-indigo-500" />
            <span className={classNames('flex-1', !isChild && 'font-medium text-gray-900')}>
              {item.name}
            </span>
          </button>
          {isExpanded && (
            <div className="bg-gray-50">
              {item.children.map((child) => renderNavItem(child, true))}
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        key={item.name}
        onClick={() => handleNavClick(item)}
        className={classNames(
          'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors min-h-[44px]',
          isChild && 'pl-12',
          item.current
            ? 'bg-indigo-600 text-white'
            : 'text-gray-700 hover:bg-gray-100'
        )}
      >
        <Icon
          className={classNames(
            'h-5 w-5',
            item.current ? 'text-white' : 'text-indigo-500'
          )}
        />
        <span className={classNames('truncate', item.current && 'font-medium')}>
          {item.name}
        </span>
      </button>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50 lg:hidden">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/50 transition-opacity duration-300 ease-linear data-closed:opacity-0"
      />

      <div className="fixed inset-0 flex">
        <DialogPanel
          transition
          className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-closed:-translate-x-full"
        >
          <TransitionChild>
            <div className="absolute top-0 left-full flex w-16 justify-center pt-5 duration-300 ease-in-out data-closed:opacity-0">
              <button
                type="button"
                onClick={onClose}
                className="-m-2.5 p-2.5"
              >
                <span className="sr-only">Close sidebar</span>
                <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>
          </TransitionChild>

          <div className="flex grow flex-col gap-y-2 overflow-y-auto bg-white">
            {/* Header with logo */}
            <div className="flex h-16 shrink-0 items-center px-4 border-b border-gray-200">
              <img
                alt={logoAlt}
                src={logoSrc}
                className="h-8 w-auto"
              />
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 py-2">
              {navigation.map((item) => renderNavItem(item, false))}
            </nav>

            {/* Secondary Navigation */}
            {secondaryNavigation.length > 0 && (
              <>
                <div className="border-t border-gray-200" />
                <nav className="py-2">
                  {secondaryNavigation.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => handleNavClick(item)}
                      className={classNames(
                        'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors min-h-[44px]',
                        item.current
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      )}
                    >
                      <span className={classNames('truncate', item.current && 'font-medium')}>
                        {item.name}
                      </span>
                    </button>
                  ))}
                </nav>
              </>
            )}

            {/* Separator */}
            <div className="border-t border-gray-200" />

            {/* Settings */}
            <div className="py-2">
              <button
                onClick={() => {
                  onSettings?.();
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors min-h-[44px]"
              >
                <Cog6ToothIcon className="h-5 w-5 text-gray-400" />
                <span>Settings</span>
              </button>
            </div>

            {/* Separator */}
            <div className="border-t border-gray-200" />

            {/* User section */}
            {user && (
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  {user.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt={user.name || user.email}
                      className="h-10 w-10 rounded-full bg-gray-100"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-indigo-600">{userInitials}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{user.name || 'User'}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onLogout?.();
                    onClose();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors min-h-[44px]"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}