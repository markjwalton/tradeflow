import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { PageHeader } from '@/components/sturij/PageHeader';
import { Button } from '@/components/ui/button';
import { ShowcaseSection } from '@/components/showcase/ShowcaseSection';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Menu, Bell, X, Search, Home } from 'lucide-react';
import { Input } from '@/components/ui/input';

const user = {
  name: 'Tom Cook',
  email: 'tom@example.com',
  imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=256&h=256&fit=crop',
};

const navigation = [
  { name: 'Dashboard', href: '#', current: true },
  { name: 'Team', href: '#', current: false },
  { name: 'Projects', href: '#', current: false },
  { name: 'Calendar', href: '#', current: false },
];

export default function TailwindAppShellsShowcase() {
  return (
    <div className="space-y-12">
      <PageHeader
        title="Application Shells"
        description="Complete app layouts with navigation, headers, and content areas converted to use design tokens and Radix UI."
      >
        <Link to={createPageUrl('TailwindShowcaseGallery')}>
          <Button variant="outline" size="sm">← Back to Gallery</Button>
        </Link>
      </PageHeader>

      <ShowcaseSection title="Error Pages" defaultOpen={true}>
        <ErrorPageExample />
      </ShowcaseSection>

      <ShowcaseSection title="Dark Navigation" defaultOpen={false}>
        <DarkNavExample />
        <DarkNavWithHeaderExample />
      </ShowcaseSection>

      <ShowcaseSection title="Brand Navigation" defaultOpen={false}>
        <BrandNavExample />
        <BrandNavWithOverlapExample />
      </ShowcaseSection>

      <ShowcaseSection title="Light Navigation" defaultOpen={false}>
        <LightNavExample />
      </ShowcaseSection>

      <ShowcaseSection title="Design System Reference" defaultOpen={false}>
        <TokenReference />
      </ShowcaseSection>
    </div>
  );
}

function ErrorPageExample() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">404 Error Page</h2>
        <p className="text-sm text-muted-foreground">Centered error page with design tokens</p>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <main className="grid min-h-[400px] place-items-center bg-card px-6 py-24 sm:py-32">
          <div className="text-center">
            <p className="text-base font-semibold" style={{ color: 'var(--primary-600)' }}>404</p>
            <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance sm:text-7xl">
              Page not found
            </h1>
            <p className="mt-6 text-lg font-medium text-pretty text-muted-foreground sm:text-xl">
              Sorry, we couldn't find the page you're looking for.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button>
                <Home className="h-4 w-4 mr-2" />
                Go back home
              </Button>
              <Button variant="ghost">
                Contact support <span className="ml-2">→</span>
              </Button>
            </div>
          </div>
        </main>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Primary: <code className="bg-background px-1 py-0.5 rounded">var(--primary-600)</code></li>
          <li>• Background: <code className="bg-background px-1 py-0.5 rounded">bg-card</code></li>
          <li>• Text: <code className="bg-background px-1 py-0.5 rounded">text-muted-foreground</code></li>
        </ul>
      </div>
    </section>
  );
}

function DarkNavExample() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Dark Navigation</h2>
        <p className="text-sm text-muted-foreground">Dark navbar with dropdown menu and mobile navigation</p>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <div className="min-h-[400px] bg-background">
          <nav className="bg-midnight-800 border-b border-midnight-700">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                <div className="flex items-center gap-10">
                  <div className="h-8 w-8 rounded-lg bg-primary-500 flex items-center justify-center text-white font-bold">
                    YC
                  </div>
                  <div className="hidden md:flex items-baseline space-x-4">
                    {navigation.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          item.current
                            ? 'bg-midnight-900 text-white'
                            : 'text-charcoal-300 hover:bg-midnight-700 hover:text-white'
                        }`}
                      >
                        {item.name}
                      </a>
                    ))}
                  </div>
                </div>

                <div className="hidden md:flex items-center gap-3">
                  <Button variant="ghost" size="icon" className="text-charcoal-400 hover:text-white">
                    <Bell className="h-5 w-5" />
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.imageUrl} />
                          <AvatarFallback>TC</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Your profile</DropdownMenuItem>
                      <DropdownMenuItem>Settings</DropdownMenuItem>
                      <DropdownMenuItem>Sign out</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="md:hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileOpen(true)}
                    className="text-charcoal-400 hover:text-white"
                  >
                    <Menu className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            </div>
          </nav>

          <header className="bg-card border-b border-border">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            </div>
          </header>

          <main>
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              <div className="rounded-lg border border-border bg-card p-6">
                <p className="text-sm text-muted-foreground">Content area</p>
              </div>
            </div>
          </main>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetContent side="left" className="w-screen sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-1">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`block rounded-lg px-3 py-2 text-base font-medium ${
                      item.current ? 'bg-primary-50 text-primary-700' : 'hover:bg-muted'
                    }`}
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Navbar BG: <code className="bg-background px-1 py-0.5 rounded">bg-midnight-800</code></li>
          <li>• Active: <code className="bg-background px-1 py-0.5 rounded">bg-midnight-900</code></li>
          <li>• Hover: <code className="bg-background px-1 py-0.5 rounded">hover:bg-midnight-700</code></li>
          <li>• Text: <code className="bg-background px-1 py-0.5 rounded">text-charcoal-300</code></li>
        </ul>
      </div>
    </section>
  );
}

function DarkNavWithHeaderExample() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Dark Nav with Overlap</h2>
        <p className="text-sm text-muted-foreground">Dark branded navigation with overlapping content card</p>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <div className="min-h-[500px]" style={{ background: 'var(--background-100)' }}>
          <div style={{ background: 'var(--midnight-800)' }} className="pb-32">
            <nav className="border-b" style={{ borderColor: 'var(--midnight-700)' }}>
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                  <div className="flex items-center gap-10">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold"
                      style={{ background: 'var(--primary-400)' }}>
                      YC
                    </div>
                    <div className="hidden md:flex space-x-4">
                      {navigation.map((item) => (
                        <a
                          key={item.name}
                          href={item.href}
                          className="rounded-lg px-3 py-2 text-sm font-medium text-white transition-colors"
                          style={{
                            backgroundColor: item.current ? 'var(--midnight-700)' : 'transparent',
                          }}
                        >
                          {item.name}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </nav>

            <header className="py-10">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
              </div>
            </header>
          </div>

          <main className="-mt-32">
            <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
              <div className="rounded-xl bg-card border border-border px-5 py-6 shadow-lg">
                <p className="text-sm text-muted-foreground">Overlapping content card</p>
              </div>
            </div>
          </main>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Header BG: <code className="bg-background px-1 py-0.5 rounded">bg-midnight-800</code></li>
          <li>• Card: <code className="bg-background px-1 py-0.5 rounded">bg-card</code> with shadow-lg</li>
          <li>• Uses negative margin: <code className="bg-background px-1 py-0.5 rounded">-mt-32</code></li>
        </ul>
      </div>
    </section>
  );
}

function BrandNavExample() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Brand Colored Navigation</h2>
        <p className="text-sm text-muted-foreground">Branded primary color navigation bar</p>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <div className="min-h-[400px] bg-background">
          <nav style={{ background: 'var(--primary-600)' }}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                <div className="flex items-center gap-10">
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center font-bold"
                    style={{ background: 'var(--primary-400)', color: 'white' }}>
                    YC
                  </div>
                  <div className="hidden md:flex space-x-4">
                    {navigation.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className="rounded-lg px-3 py-2 text-sm font-medium text-white transition-colors"
                        style={{
                          backgroundColor: item.current ? 'var(--primary-700)' : 'transparent',
                        }}
                      >
                        {item.name}
                      </a>
                    ))}
                  </div>
                </div>

                <div className="hidden md:flex items-center gap-3">
                  <Button variant="ghost" size="icon" className="text-primary-200 hover:text-white">
                    <Bell className="h-5 w-5" />
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.imageUrl} />
                          <AvatarFallback>TC</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Your profile</DropdownMenuItem>
                      <DropdownMenuItem>Settings</DropdownMenuItem>
                      <DropdownMenuItem>Sign out</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </nav>

          <header className="bg-card border-b border-border">
            <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
              <h1 className="text-lg font-semibold">Dashboard</h1>
            </div>
          </header>

          <main>
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              <div className="rounded-lg border border-border bg-card p-6">
                <p className="text-sm text-muted-foreground">Content area</p>
              </div>
            </div>
          </main>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Navbar: <code className="bg-background px-1 py-0.5 rounded">var(--primary-600)</code></li>
          <li>• Active: <code className="bg-background px-1 py-0.5 rounded">var(--primary-700)</code></li>
          <li>• Icon: <code className="bg-background px-1 py-0.5 rounded">text-primary-200</code></li>
        </ul>
      </div>
    </section>
  );
}

function BrandNavWithOverlapExample() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Brand Nav with Search & Overlap</h2>
        <p className="text-sm text-muted-foreground">Full-featured branded navigation with search and overlapping content</p>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <div className="min-h-[550px]" style={{ background: 'var(--background-100)' }}>
          <div style={{ background: 'var(--primary-600)' }} className="pb-32">
            <nav className="border-b" style={{ borderColor: 'var(--primary-500)' }}>
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                  <div className="flex items-center gap-10">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center font-bold"
                      style={{ background: 'var(--primary-400)', color: 'white' }}>
                      YC
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="text-primary-200 hover:text-white">
                      <Bell className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </nav>

            <div className="border-t border-white/20 py-5">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-3 items-center gap-8">
                  <div className="col-span-2">
                    <nav className="flex space-x-4">
                      {navigation.map((item) => (
                        <a
                          key={item.name}
                          href={item.href}
                          className="rounded-lg px-3 py-2 text-sm font-medium text-white transition-colors"
                          style={{
                            backgroundColor: item.current ? 'var(--primary-500)' : 'transparent',
                          }}
                        >
                          {item.name}
                        </a>
                      ))}
                    </nav>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/75" />
                    <Input
                      placeholder="Search"
                      className="pl-10 bg-primary-500/75 border-white/10 text-white placeholder:text-white/75"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <main className="-mt-24">
            <div className="mx-auto max-w-3xl px-4 pb-12 sm:px-6 lg:max-w-7xl lg:px-8">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-8">
                <div className="lg:col-span-2">
                  <div className="rounded-xl bg-card border border-border p-6 shadow-lg">
                    <p className="text-sm text-muted-foreground">Main content - 2/3 width</p>
                  </div>
                </div>
                <div>
                  <div className="rounded-xl bg-card border border-border p-6 shadow-lg">
                    <p className="text-sm text-muted-foreground">Sidebar - 1/3 width</p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Features:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Integrated search bar in navigation</li>
          <li>• 3-column grid layout (2/3 + 1/3 split)</li>
          <li>• Overlapping cards with shadow-lg</li>
          <li>• Primary brand colors throughout</li>
        </ul>
      </div>
    </section>
  );
}

function LightNavExample() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Light Navigation with Border</h2>
        <p className="text-sm text-muted-foreground">Clean light navigation with bottom border indicators</p>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <div className="min-h-[400px] bg-background">
          <nav className="bg-card border-b border-border">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 justify-between">
                <div className="flex items-center gap-10">
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center font-bold"
                    style={{ background: 'var(--primary-600)', color: 'white' }}>
                    YC
                  </div>
                  <div className="hidden sm:flex sm:space-x-8">
                    {navigation.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium transition-colors ${
                          item.current
                            ? 'border-primary-600 text-foreground'
                            : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                        }`}
                      >
                        {item.name}
                      </a>
                    ))}
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-3">
                  <Button variant="ghost" size="icon">
                    <Bell className="h-5 w-5" />
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.imageUrl} />
                          <AvatarFallback>TC</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Your profile</DropdownMenuItem>
                      <DropdownMenuItem>Settings</DropdownMenuItem>
                      <DropdownMenuItem>Sign out</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </nav>

          <div className="py-10">
            <header>
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              </div>
            </header>
            <main>
              <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="rounded-lg border border-border bg-card p-6">
                  <p className="text-sm text-muted-foreground">Content area</p>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Navbar: <code className="bg-background px-1 py-0.5 rounded">bg-card</code></li>
          <li>• Active indicator: <code className="bg-background px-1 py-0.5 rounded">border-primary-600</code></li>
          <li>• Hover: <code className="bg-background px-1 py-0.5 rounded">hover:border-border</code></li>
        </ul>
      </div>
    </section>
  );
}

function TokenReference() {
  return (
    <section className="space-y-4 mt-12 pt-8 border-t border-border">
      <div>
        <h2 className="text-xl font-display mb-2">Design System Reference</h2>
        <p className="text-sm text-muted-foreground">Complete token reference for app shells</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-border p-4 space-y-2">
          <h3 className="text-sm font-medium">Dark Themes</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• <code className="bg-muted px-1 py-0.5 rounded">bg-midnight-800</code></li>
            <li>• <code className="bg-muted px-1 py-0.5 rounded">bg-midnight-900</code></li>
            <li>• <code className="bg-muted px-1 py-0.5 rounded">text-charcoal-300</code></li>
            <li>• <code className="bg-muted px-1 py-0.5 rounded">border-midnight-700</code></li>
          </ul>
        </div>

        <div className="rounded-lg border border-border p-4 space-y-2">
          <h3 className="text-sm font-medium">Brand Colors</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• <code className="bg-muted px-1 py-0.5 rounded">var(--primary-600)</code></li>
            <li>• <code className="bg-muted px-1 py-0.5 rounded">var(--primary-700)</code></li>
            <li>• <code className="bg-muted px-1 py-0.5 rounded">text-primary-200</code></li>
          </ul>
        </div>

        <div className="rounded-lg border border-border p-4 space-y-2">
          <h3 className="text-sm font-medium">Components</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Radix <code className="bg-muted px-1 py-0.5 rounded">DropdownMenu</code></li>
            <li>• Radix <code className="bg-muted px-1 py-0.5 rounded">Sheet</code></li>
            <li>• Radix <code className="bg-muted px-1 py-0.5 rounded">Avatar</code></li>
            <li>• Lucide <code className="bg-muted px-1 py-0.5 rounded">icons</code></li>
          </ul>
        </div>
      </div>
    </section>
  );
}