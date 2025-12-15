import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/sturij/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Home, ChevronRight, Search, Menu as MenuIcon, X, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

// Breadcrumb Component
function BreadcrumbExample() {
  const pages = [
    { name: 'Projects', href: '#', current: false },
    { name: 'Project Nero', href: '#', current: true },
  ];

  return (
    <nav aria-label="Breadcrumb" className="flex">
      <ol role="list" className="flex items-center space-x-4">
        <li>
          <div>
            <a href="#" className="text-muted-foreground hover:text-foreground">
              <Home className="h-5 w-5 shrink-0" />
              <span className="sr-only">Home</span>
            </a>
          </div>
        </li>
        {pages.map((page) => (
          <li key={page.name}>
            <div className="flex items-center">
              <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
              <a
                href={page.href}
                aria-current={page.current ? 'page' : undefined}
                className={cn(
                  "ml-4 text-sm font-medium transition-colors",
                  page.current 
                    ? "text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {page.name}
              </a>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Light Navigation Component
function LightNavigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('Dashboard');

  const navigation = [
    { name: 'Dashboard', href: '#' },
    { name: 'Team', href: '#' },
    { name: 'Projects', href: '#' },
    { name: 'Calendar', href: '#' },
  ];

  return (
    <nav className="bg-card shadow-sm border-b border-border">
      <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex px-2 lg:px-0">
            <div className="flex shrink-0 items-center">
              <img
                alt="Your Company"
                src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                className="h-8 w-auto"
              />
            </div>
            <div className="hidden lg:ml-6 lg:flex lg:space-x-8">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => setCurrentPage(item.name)}
                  className={cn(
                    "inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium transition-colors",
                    currentPage === item.name
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                  )}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-1 items-center justify-center px-2 lg:ml-6 lg:justify-end">
            <div className="w-full max-w-lg lg:max-w-xs relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder="Search"
                className="pl-10 bg-background"
              />
            </div>
          </div>
          <div className="flex items-center lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </Button>
          </div>
          <div className="hidden lg:ml-4 lg:flex lg:items-center">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-6 w-6" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-4 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
                    <AvatarFallback>TC</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>Your profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border">
          <div className="space-y-1 pt-2 pb-3">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  setCurrentPage(item.name);
                  setMobileMenuOpen(false);
                }}
                className={cn(
                  "block border-l-4 py-2 pr-4 pl-3 text-base font-medium w-full text-left",
                  currentPage === item.name
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-transparent text-muted-foreground hover:border-border hover:bg-accent hover:text-foreground"
                )}
              >
                {item.name}
              </button>
            ))}
          </div>
          <div className="border-t border-border pt-4 pb-3">
            <div className="flex items-center px-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
                <AvatarFallback>TC</AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <div className="text-base font-medium text-foreground">Tom Cook</div>
                <div className="text-sm font-medium text-muted-foreground">tom@example.com</div>
              </div>
              <Button variant="ghost" size="icon" className="ml-auto">
                <Bell className="h-6 w-6" />
              </Button>
            </div>
            <div className="mt-3 space-y-1">
              <button className="block px-4 py-2 text-base font-medium text-muted-foreground hover:bg-accent hover:text-foreground w-full text-left">
                Your profile
              </button>
              <button className="block px-4 py-2 text-base font-medium text-muted-foreground hover:bg-accent hover:text-foreground w-full text-left">
                Settings
              </button>
              <button className="block px-4 py-2 text-base font-medium text-muted-foreground hover:bg-accent hover:text-foreground w-full text-left">
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

// Dark Navigation Component
function DarkNavigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('Dashboard');

  const navigation = [
    { name: 'Dashboard', href: '#' },
    { name: 'Team', href: '#' },
    { name: 'Projects', href: '#' },
    { name: 'Calendar', href: '#' },
  ];

  return (
    <nav className="bg-midnight-900 text-white">
      <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="flex items-center px-2 lg:px-0">
            <div className="shrink-0">
              <img
                alt="Your Company"
                src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                className="h-8 w-auto"
              />
            </div>
            <div className="hidden lg:ml-6 lg:block">
              <div className="flex space-x-4">
                {navigation.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => setCurrentPage(item.name)}
                    className={cn(
                      "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      currentPage === item.name
                        ? "bg-midnight-800 text-white"
                        : "text-charcoal-300 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-1 justify-center px-2 lg:ml-6 lg:justify-end">
            <div className="w-full max-w-lg lg:max-w-xs relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-charcoal-400 pointer-events-none" />
              <Input
                type="search"
                placeholder="Search"
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-charcoal-500 focus:border-primary"
              />
            </div>
          </div>
          <div className="flex lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-charcoal-400 hover:text-white hover:bg-white/5"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </Button>
          </div>
          <div className="hidden lg:ml-4 lg:block">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-charcoal-400 hover:text-white hover:bg-white/5"
              >
                <Bell className="h-6 w-6" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="ml-4 rounded-full">
                    <Avatar className="h-8 w-8 border border-white/10">
                      <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
                      <AvatarFallback>TC</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>Your profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem>Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="space-y-1 px-2 pt-2 pb-3">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  setCurrentPage(item.name);
                  setMobileMenuOpen(false);
                }}
                className={cn(
                  "block rounded-md px-3 py-2 text-base font-medium w-full text-left",
                  currentPage === item.name
                    ? "bg-midnight-800 text-white"
                    : "text-charcoal-300 hover:bg-white/5 hover:text-white"
                )}
              >
                {item.name}
              </button>
            ))}
          </div>
          <div className="border-t border-white/10 pt-4 pb-3">
            <div className="flex items-center px-5">
              <Avatar className="h-10 w-10 border border-white/10">
                <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
                <AvatarFallback>TC</AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <div className="text-base font-medium text-white">Tom Cook</div>
                <div className="text-sm font-medium text-charcoal-400">tom@example.com</div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="ml-auto text-charcoal-400 hover:text-white"
              >
                <Bell className="h-6 w-6" />
              </Button>
            </div>
            <div className="mt-3 space-y-1 px-2">
              <button className="block rounded-md px-3 py-2 text-base font-medium text-charcoal-400 hover:bg-white/5 hover:text-white w-full text-left">
                Your profile
              </button>
              <button className="block rounded-md px-3 py-2 text-base font-medium text-charcoal-400 hover:bg-white/5 hover:text-white w-full text-left">
                Settings
              </button>
              <button className="block rounded-md px-3 py-2 text-base font-medium text-charcoal-400 hover:bg-white/5 hover:text-white w-full text-left">
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default function TailwindNavigationShowcase() {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <div className="max-w-[1400px] mx-auto pb-6">
        <PageHeader
          title="Tailwind UI Navigation (Converted)"
          description="Breadcrumbs and navigation bars with design tokens"
        />

        <div className="mt-6 space-y-6">
          {/* Conversion Info */}
          <Card style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-2">Conversion Details</h2>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p><strong>From:</strong> Headless UI Disclosure & Menu</p>
                    <p><strong>To:</strong> React State + Radix DropdownMenu</p>
                    <p><strong>Colors:</strong> All hardcoded values replaced with design tokens</p>
                    <p><strong>Icons:</strong> Heroicons → Lucide React</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Breadcrumb */}
          <Card style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
            <CardHeader>
              <CardTitle>Breadcrumb Navigation</CardTitle>
            </CardHeader>
            <CardContent>
              <BreadcrumbExample />
            </CardContent>
          </Card>

          {/* Light Navigation */}
          <Card style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
            <CardHeader>
              <CardTitle>Light Navigation Bar</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <LightNavigation />
            </CardContent>
          </Card>

          {/* Dark Navigation */}
          <Card style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
            <CardHeader>
              <CardTitle>Dark Navigation Bar</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <DarkNavigation />
            </CardContent>
          </Card>

          {/* Color Mapping */}
          <Card style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
            <CardHeader>
              <CardTitle>Color Token Mapping</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 text-sm">
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <code className="text-xs">bg-white</code>
                  <span className="text-muted-foreground">→</span>
                  <code className="text-xs">bg-card</code>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <code className="text-xs">bg-gray-800</code>
                  <span className="text-muted-foreground">→</span>
                  <code className="text-xs">bg-midnight-900</code>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <code className="text-xs">border-indigo-600</code>
                  <span className="text-muted-foreground">→</span>
                  <code className="text-xs">border-primary</code>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <code className="text-xs">text-gray-400</code>
                  <span className="text-muted-foreground">→</span>
                  <code className="text-xs">text-muted-foreground</code>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <code className="text-xs">hover:bg-gray-50</code>
                  <span className="text-muted-foreground">→</span>
                  <code className="text-xs">hover:bg-accent</code>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}