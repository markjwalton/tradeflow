import { useState } from 'react';
import { X, ChevronDown, ChevronRight, Settings, LogOut, Home, Folder, FolderOpen } from 'lucide-react';
import { Sheet, SheetContent } from "@/components/ui/sheet";

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
    const hasChildren = item.children && item.children.length > 0;
    const isFolder = item.isFolder || hasChildren;
    const isExpanded = expandedFolders.has(item.id || item.name);
    const Icon = item.icon || Home;

    if (isFolder && hasChildren) {
      const FolderDisplayIcon = isExpanded ? FolderOpen : Folder;
      const DisplayIcon = item.icon || FolderDisplayIcon;

      return (
        <div key={item.id || item.name}>
          <button
            onClick={(e) => toggleFolder(item.id || item.name, e)}
            className={classNames(
              'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--background-100)]',
              isChild && 'pl-8',
              'min-h-[44px]'
            )}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
            ) : (
              <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
            )}
            <DisplayIcon className="h-5 w-5 text-[var(--color-primary)]" />
            <span className={classNames('flex-1', !isChild && 'font-medium text-[var(--text-primary)]')}>
              {item.name}
            </span>
          </button>
          {isExpanded && (
            <div className="bg-[var(--background-50)]">
              {item.children.map((child) => renderNavItem(child, true))}
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        key={item.id || item.name}
        onClick={() => handleNavClick(item)}
        className={classNames(
          'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors min-h-[44px]',
          isChild && 'pl-12',
          item.current
            ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]'
            : 'text-[var(--text-secondary)] hover:bg-[var(--background-100)]'
        )}
      >
        <Icon
          className={classNames(
            'h-5 w-5',
            item.current ? 'text-[var(--color-primary-foreground)]' : 'text-[var(--color-primary)]'
          )}
        />
        <span className={classNames('truncate', item.current && 'font-medium')}>
          {item.name}
        </span>
      </button>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="w-full max-w-xs p-0 bg-[var(--color-sidebar)] border-[var(--color-border)]">
        <div className="flex grow flex-col gap-y-2 overflow-y-auto h-full">
          {/* Header with logo */}
          <div className="flex h-16 shrink-0 items-center justify-between px-4 border-b border-[var(--color-border)]">
            <img
              alt={logoAlt}
              src={logoSrc}
              className="h-8 w-auto"
            />
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            >
              <span className="sr-only">Close sidebar</span>
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* Main Navigation */}
          <nav className="flex-1 py-2">
            {navigation.map((item) => renderNavItem(item, false))}
          </nav>

          {/* Secondary Navigation */}
          {secondaryNavigation.length > 0 && (
            <>
              <div className="border-t border-[var(--color-border)]" />
              <nav className="py-2">
                {secondaryNavigation.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleNavClick(item)}
                    className={classNames(
                      'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors min-h-[44px]',
                      item.current
                        ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--background-100)]'
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
          <div className="border-t border-[var(--color-border)]" />

          {/* Settings */}
          <div className="py-2">
            <button
              onClick={() => {
                onSettings?.();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-[var(--text-secondary)] hover:bg-[var(--background-100)] transition-colors min-h-[44px]"
            >
              <Settings className="h-5 w-5 text-[var(--text-muted)]" />
              <span>Settings</span>
            </button>
          </div>

          {/* Separator */}
          <div className="border-t border-[var(--color-border)]" />

          {/* User section */}
          {user && (
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                {user.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={user.name || user.email}
                    className="h-10 w-10 rounded-full bg-[var(--background-100)]"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-[var(--primary-100)] flex items-center justify-center">
                    <span className="text-sm font-medium text-[var(--primary-600)]">{userInitials}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--text-primary)] truncate">{user.name || 'User'}</p>
                  <p className="text-xs text-[var(--text-muted)] truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  onLogout?.();
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--background-100)] hover:bg-[var(--background-200)] rounded-lg transition-colors min-h-[44px]"
              >
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}