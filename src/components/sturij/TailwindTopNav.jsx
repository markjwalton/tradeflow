import { Bars3Icon, InboxIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { 
  ChevronDownIcon,
  Cog8ToothIcon,
  UserIcon,
  ArrowRightStartOnRectangleIcon,
} from '@heroicons/react/16/solid';
import { Navbar, NavbarDivider, NavbarItem, NavbarLabel, NavbarSection, NavbarSpacer } from '@/components/ui/navbar';
import { Dropdown, DropdownButton, DropdownDivider, DropdownItem, DropdownLabel, DropdownMenu } from '@/components/ui/dropdown';
import { Avatar } from '@/components/ui/avatar';

export default function TailwindTopNav({
  user,
  userNavigation = [],
  searchQuery = '',
  searchResults = [],
  onSearch,
  onMobileMenuClick,
  onSidebarToggle,
  onNotificationClick,
  topNavItems = [], // Items from NavigationManager for top nav
  logoDropdownItems = [] // Items for logo dropdown menu
}) {
  return (
    <Navbar className="sticky top-0 z-40">
      {/* Logo Dropdown */}
      <Dropdown>
        <DropdownButton as={NavbarItem} className="gap-2">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69274b9c077e61d7cfe78ec7/c94580ddf_sturij-logo.png" 
            alt="Logo"
            className="h-8 w-8 object-contain"
          />
          <ChevronDownIcon className="h-4 w-4 max-lg:hidden" />
        </DropdownButton>
        <DropdownMenu className="min-w-64" anchor="bottom start">
          {logoDropdownItems.length > 0 ? (
            logoDropdownItems.map((item, index) => (
              <React.Fragment key={item.id || index}>
                {item.divider ? (
                  <DropdownDivider />
                ) : (
                  <DropdownItem href={item.href}>
                    {item.icon && <item.icon className="h-4 w-4" />}
                    <DropdownLabel>{item.name}</DropdownLabel>
                  </DropdownItem>
                )}
              </React.Fragment>
            ))
          ) : (
            <>
              <DropdownItem href="/?page=Dashboard">
                <DropdownLabel>Dashboard</DropdownLabel>
              </DropdownItem>
              <DropdownItem href="/?page=Projects">
                <DropdownLabel>Projects</DropdownLabel>
              </DropdownItem>
              <DropdownItem href="/?page=SiteSettings">
                <Cog8ToothIcon className="h-4 w-4" />
                <DropdownLabel>Settings</DropdownLabel>
              </DropdownItem>
            </>
          )}
        </DropdownMenu>
      </Dropdown>

      <NavbarDivider className="max-lg:hidden" />

      {/* Top Navigation Items from Nav Manager */}
      <NavbarSection className="max-lg:hidden">
        {topNavItems.map((item) => (
          <NavbarItem 
            key={item.id} 
            href={item.href} 
            current={item.current}
          >
            {item.name}
          </NavbarItem>
        ))}
      </NavbarSection>

      <NavbarSpacer />

      {/* Right Section */}
      <NavbarSection>
        {/* Sidebar Toggle (Desktop/Tablet) */}
        {onSidebarToggle && (
          <button
            type="button"
            onClick={onSidebarToggle}
            className="hidden md:inline-flex p-2 rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-muted)] lg:hidden"
          >
            <Bars3Icon className="h-5 w-5" />
          </button>
        )}

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="md:hidden p-2 rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-muted)]"
          onClick={onMobileMenuClick}
        >
          <Bars3Icon className="h-6 w-6" />
        </button>

        {/* Search */}
        <NavbarItem href="/search" aria-label="Search" className="max-md:hidden">
          <MagnifyingGlassIcon className="h-5 w-5" />
        </NavbarItem>

        {/* Inbox/Notifications */}
        <NavbarItem href="/inbox" aria-label="Inbox" className="max-md:hidden">
          <InboxIcon className="h-5 w-5" />
        </NavbarItem>

        {/* User Dropdown */}
        {user && (
          <Dropdown>
            <DropdownButton as={NavbarItem}>
              <Avatar 
                src={user?.imageUrl} 
                initials={user?.name?.substring(0, 2).toUpperCase() || user?.email?.substring(0, 2).toUpperCase()}
                square 
              />
            </DropdownButton>
            <DropdownMenu className="min-w-64" anchor="bottom end">
              <div className="px-4 py-2 border-b border-[var(--color-border)]">
                <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{user.name}</p>
                <p className="text-xs text-[var(--color-text-muted)] truncate">{user.email}</p>
              </div>
              <DropdownItem href="/profile">
                <UserIcon className="h-4 w-4" />
                <DropdownLabel>My profile</DropdownLabel>
              </DropdownItem>
              <DropdownItem href="/settings">
                <Cog8ToothIcon className="h-4 w-4" />
                <DropdownLabel>Settings</DropdownLabel>
              </DropdownItem>
              <DropdownDivider />
              <DropdownItem 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  userNavigation.find(item => item.name === 'Sign out')?.onClick?.();
                }}
              >
                <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
                <DropdownLabel>Sign out</DropdownLabel>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        )}
      </NavbarSection>
    </Navbar>
  );
}