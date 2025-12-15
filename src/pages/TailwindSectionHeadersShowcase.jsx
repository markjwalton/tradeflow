import React from 'react';
import { PageHeader } from '@/components/sturij/PageHeader';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Star, Code, Flag, Phone, Mail, Search, ArrowUpDown, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function TailwindSectionHeadersShowcase() {
  return (
    <div className="space-y-12">
      <PageHeader
        title="Section Headers"
        description="Section heading patterns for cards and content areas converted to use design tokens."
      />

      {/* Comment/Post Header */}
      <CommentHeaderExample />

      {/* Simple Section Header */}
      <SimpleSectionExample />

      {/* Section with Action Button */}
      <SectionWithActionExample />

      {/* Profile Section with Actions */}
      <ProfileSectionExample />

      {/* Compact Section with Action */}
      <CompactSectionExample />

      {/* Minimal Section Header */}
      <MinimalSectionExample />

      {/* Simple Border Bottom */}
      <SimpleBorderBottomExample />

      {/* With Description */}
      <WithDescriptionExample />

      {/* With Two Actions */}
      <WithTwoActionsExample />

      {/* With Search and Sort */}
      <WithSearchSortExample />

      {/* With Tabs */}
      <WithTabsExample />

      {/* With Subtitle */}
      <WithSubtitleExample />

      {/* With Badge and Menu */}
      <WithBadgeMenuExample />

      {/* Token Reference */}
      <TokenReference />
    </div>
  );
}

function CommentHeaderExample() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Comment/Post Header</h2>
        <p className="text-sm text-muted-foreground">User comment or post header with avatar and actions menu</p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex space-x-3">
            <div className="shrink-0">
              <Avatar className="h-10 w-10">
                <AvatarImage src="https://images.unsplash.com/photo-1550525811-e5869dd03032?w=256&h=256&fit=crop" />
                <AvatarFallback>CH</AvatarFallback>
              </Avatar>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">
                <a href="#" className="hover:underline">
                  Chelsea Hagon
                </a>
              </p>
              <p className="text-sm text-muted-foreground">
                <a href="#" className="hover:underline">
                  December 9 at 11:43 AM
                </a>
              </p>
            </div>
            <div className="flex shrink-0 self-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <span className="sr-only">Open options</span>
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem>
                    <Star className="mr-3 h-5 w-5 text-muted-foreground" />
                    <span>Add to favorites</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Code className="mr-3 h-5 w-5 text-muted-foreground" />
                    <span>Embed</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Flag className="mr-3 h-5 w-5 text-muted-foreground" />
                    <span>Report content</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Avatar: Radix UI Avatar component</li>
          <li>• Menu: <code className="bg-background px-1 py-0.5 rounded">DropdownMenu</code> with icons</li>
          <li>• Links: <code className="bg-background px-1 py-0.5 rounded">hover:underline</code></li>
          <li>• Text: <code className="bg-background px-1 py-0.5 rounded">text-muted-foreground</code></li>
        </ul>
      </div>
    </section>
  );
}

function SimpleSectionExample() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Simple Section Header</h2>
        <p className="text-sm text-muted-foreground">Basic section header with title and description</p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-4 py-5 sm:px-6">
          <h3 className="text-base font-semibold">Job Postings</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Lorem ipsum dolor sit amet consectetur adipisicing elit quam corrupti consectetur.
          </p>
        </div>
        <div className="px-4 py-5 sm:px-6">
          <p className="text-sm text-muted-foreground">Section content goes here...</p>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Border: <code className="bg-background px-1 py-0.5 rounded">border-border</code></li>
          <li>• Title: <code className="bg-background px-1 py-0.5 rounded">text-base font-semibold</code></li>
          <li>• Description: <code className="bg-background px-1 py-0.5 rounded">text-sm text-muted-foreground</code></li>
        </ul>
      </div>
    </section>
  );
}

function SectionWithActionExample() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Section with Action Button</h2>
        <p className="text-sm text-muted-foreground">Section header with title, description, and action button</p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-4 py-5 sm:px-6">
          <div className="-mt-4 -ml-4 flex flex-wrap items-center justify-between sm:flex-nowrap">
            <div className="mt-4 ml-4">
              <h3 className="text-base font-semibold">Job Postings</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Lorem ipsum dolor sit amet consectetur adipisicing elit quam corrupti consectetur.
              </p>
            </div>
            <div className="mt-4 ml-4 shrink-0">
              <Button>Create new job</Button>
            </div>
          </div>
        </div>
        <div className="px-4 py-5 sm:px-6">
          <p className="text-sm text-muted-foreground">Section content goes here...</p>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Uses negative margins for alignment: <code className="bg-background px-1 py-0.5 rounded">-mt-4 -ml-4</code></li>
          <li>• Responsive flex: <code className="bg-background px-1 py-0.5 rounded">flex-wrap sm:flex-nowrap</code></li>
          <li>• Button uses default primary styling</li>
        </ul>
      </div>
    </section>
  );
}

function ProfileSectionExample() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Profile Section with Actions</h2>
        <p className="text-sm text-muted-foreground">User profile header with avatar and action buttons</p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-4 py-5 sm:px-6">
          <div className="-mt-4 -ml-4 flex flex-wrap items-center justify-between sm:flex-nowrap">
            <div className="mt-4 ml-4">
              <div className="flex items-center">
                <div className="shrink-0">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=256&h=256&fit=crop" />
                    <AvatarFallback>TC</AvatarFallback>
                  </Avatar>
                </div>
                <div className="ml-4">
                  <h3 className="text-base font-semibold">Tom Cook</h3>
                  <p className="text-sm text-muted-foreground">
                    <a href="#" className="hover:underline">@tom_cook</a>
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 ml-4 flex shrink-0 gap-3">
              <Button variant="outline">
                <Phone className="mr-1.5 -ml-0.5 h-5 w-5" />
                <span>Phone</span>
              </Button>
              <Button variant="outline">
                <Mail className="mr-1.5 -ml-0.5 h-5 w-5" />
                <span>Email</span>
              </Button>
            </div>
          </div>
        </div>
        <div className="px-4 py-5 sm:px-6">
          <p className="text-sm text-muted-foreground">Profile content goes here...</p>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Avatar: <code className="bg-background px-1 py-0.5 rounded">h-12 w-12</code> size</li>
          <li>• Buttons: <code className="bg-background px-1 py-0.5 rounded">variant="outline"</code> with icons</li>
          <li>• Username link with hover effect</li>
        </ul>
      </div>
    </section>
  );
}

function CompactSectionExample() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Compact Section with Action</h2>
        <p className="text-sm text-muted-foreground">Compact header with title and single action button</p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-4 py-5 sm:px-6">
          <div className="-mt-2 -ml-4 flex flex-wrap items-center justify-between sm:flex-nowrap">
            <div className="mt-2 ml-4">
              <h3 className="text-base font-semibold">Job Postings</h3>
            </div>
            <div className="mt-2 ml-4 shrink-0">
              <Button>Create new job</Button>
            </div>
          </div>
        </div>
        <div className="px-4 py-5 sm:px-6">
          <p className="text-sm text-muted-foreground">Section content goes here...</p>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Reduced negative margins: <code className="bg-background px-1 py-0.5 rounded">-mt-2 -ml-4</code></li>
          <li>• No description - more compact vertical space</li>
          <li>• Single action button aligned right</li>
        </ul>
      </div>
    </section>
  );
}

function MinimalSectionExample() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Minimal Section Header</h2>
        <p className="text-sm text-muted-foreground">Simplest header with just a title</p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-4 py-5 sm:px-6">
          <h3 className="text-base font-semibold">Job Postings</h3>
        </div>
        <div className="px-4 py-5 sm:px-6">
          <p className="text-sm text-muted-foreground">Section content goes here...</p>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Minimal design with just title</li>
          <li>• Standard padding: <code className="bg-background px-1 py-0.5 rounded">px-4 py-5 sm:px-6</code></li>
          <li>• Bottom border separator</li>
        </ul>
      </div>
    </section>
  );
}

function SimpleBorderBottomExample() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Simple Border Bottom</h2>
        <p className="text-sm text-muted-foreground">Minimalist section divider with just a title</p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border pb-5 px-4 pt-5 sm:px-6">
          <h3 className="text-base font-semibold">Job Postings</h3>
        </div>
        <div className="px-4 py-5 sm:px-6">
          <p className="text-sm text-muted-foreground">Section content goes here...</p>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Simple bottom border: <code className="bg-background px-1 py-0.5 rounded">border-b border-border</code></li>
          <li>• Bottom padding only: <code className="bg-background px-1 py-0.5 rounded">pb-5</code></li>
        </ul>
      </div>
    </section>
  );
}

function WithDescriptionExample() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">With Description</h2>
        <p className="text-sm text-muted-foreground">Section header with supporting description text</p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border pb-5 px-4 pt-5 sm:px-6">
          <h3 className="text-base font-semibold">Job Postings</h3>
          <p className="mt-2 max-w-4xl text-sm text-muted-foreground">
            Workcation is a property rental website. Etiam ullamcorper massa viverra consequat, consectetur id nulla tempus.
            Fringilla egestas justo massa purus sagittis malesuada.
          </p>
        </div>
        <div className="px-4 py-5 sm:px-6">
          <p className="text-sm text-muted-foreground">Section content goes here...</p>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Description: <code className="bg-background px-1 py-0.5 rounded">text-sm text-muted-foreground</code></li>
          <li>• Max width constraint for readability</li>
        </ul>
      </div>
    </section>
  );
}

function WithTwoActionsExample() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">With Two Action Buttons</h2>
        <p className="text-sm text-muted-foreground">Section header with primary and secondary actions</p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border pb-5 px-4 pt-5 sm:px-6">
          <div className="sm:flex sm:items-center sm:justify-between">
            <h3 className="text-base font-semibold">Job Postings</h3>
            <div className="mt-3 flex gap-3 sm:mt-0 sm:ml-4">
              <Button variant="outline">Share</Button>
              <Button>Create</Button>
            </div>
          </div>
        </div>
        <div className="px-4 py-5 sm:px-6">
          <p className="text-sm text-muted-foreground">Section content goes here...</p>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Button gap: <code className="bg-background px-1 py-0.5 rounded">gap-3</code></li>
          <li>• Primary + outline button variants</li>
          <li>• Responsive alignment with <code className="bg-background px-1 py-0.5 rounded">sm:flex</code></li>
        </ul>
      </div>
    </section>
  );
}

function WithSearchSortExample() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">With Search and Sort</h2>
        <p className="text-sm text-muted-foreground">Section header with integrated search input and sort button</p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border pb-5 px-4 pt-5 sm:px-6">
          <div className="sm:flex sm:items-center sm:justify-between">
            <h3 className="text-base font-semibold">Job Postings</h3>
            <div className="mt-3 flex sm:mt-0 sm:ml-4">
              <div className="relative flex-grow sm:flex-grow-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search candidates"
                  className="pl-9 rounded-r-none border-r-0 w-full sm:w-64"
                />
              </div>
              <Button variant="outline" className="rounded-l-none">
                <ArrowUpDown className="h-4 w-4 mr-1.5" />
                Sort
              </Button>
            </div>
          </div>
        </div>
        <div className="px-4 py-5 sm:px-6">
          <p className="text-sm text-muted-foreground">Section content goes here...</p>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Combined input + button with shared border</li>
          <li>• <code className="bg-background px-1 py-0.5 rounded">rounded-r-none</code> and <code className="bg-background px-1 py-0.5 rounded">rounded-l-none</code></li>
          <li>• Icon inside input with absolute positioning</li>
        </ul>
      </div>
    </section>
  );
}

function WithTabsExample() {
  const tabs = [
    { name: 'Applied', value: 'applied', current: false },
    { name: 'Phone Screening', value: 'phone', current: false },
    { name: 'Interview', value: 'interview', current: true },
    { name: 'Offer', value: 'offer', current: false },
    { name: 'Hired', value: 'hired', current: false },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">With Tabs Navigation</h2>
        <p className="text-sm text-muted-foreground">Section header with tabs (mobile select, desktop tabs)</p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-4 pt-5 pb-0 sm:px-6">
          <h3 className="text-base font-semibold mb-3">Candidates</h3>
          
          {/* Mobile select */}
          <div className="sm:hidden mb-5">
            <Select defaultValue="interview">
              <SelectTrigger>
                <SelectValue placeholder="Select a tab" />
              </SelectTrigger>
              <SelectContent>
                {tabs.map((tab) => (
                  <SelectItem key={tab.value} value={tab.value}>
                    {tab.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Desktop tabs */}
          <div className="hidden sm:block">
            <Tabs defaultValue="interview" className="-mb-px">
              <TabsList className="h-auto p-0 bg-transparent border-0 space-x-8">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary-500 data-[state=active]:text-primary-600 px-1 pb-4 bg-transparent"
                  >
                    {tab.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
        <div className="px-4 py-5 sm:px-6">
          <p className="text-sm text-muted-foreground">Tab content goes here...</p>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Mobile: Uses Select component</li>
          <li>• Desktop: Uses Tabs with bottom border indicator</li>
          <li>• Active tab: <code className="bg-background px-1 py-0.5 rounded">border-primary-500 text-primary-600</code></li>
        </ul>
      </div>
    </section>
  );
}

function WithSubtitleExample() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">With Subtitle/Context</h2>
        <p className="text-sm text-muted-foreground">Section header with inline subtitle or context</p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border pb-5 px-4 pt-5 sm:px-6">
          <div className="-mt-2 -ml-2 flex flex-wrap items-baseline">
            <h3 className="mt-2 ml-2 text-base font-semibold">Job Postings</h3>
            <p className="mt-1 ml-2 truncate text-sm text-muted-foreground">in Engineering</p>
          </div>
        </div>
        <div className="px-4 py-5 sm:px-6">
          <p className="text-sm text-muted-foreground">Section content goes here...</p>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Inline layout with <code className="bg-background px-1 py-0.5 rounded">flex-wrap items-baseline</code></li>
          <li>• Negative margins for alignment: <code className="bg-background px-1 py-0.5 rounded">-mt-2 -ml-2</code></li>
          <li>• Subtitle: <code className="bg-background px-1 py-0.5 rounded">text-sm text-muted-foreground</code></li>
        </ul>
      </div>
    </section>
  );
}

function WithBadgeMenuExample() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">With Status Badge and Menu</h2>
        <p className="text-sm text-muted-foreground">Section header with status badge and action menu</p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border pb-5 px-4 pt-5 sm:px-6">
          <div className="sm:flex sm:items-baseline sm:justify-between">
            <div className="sm:w-0 sm:flex-1">
              <h3 className="text-base font-semibold">Full-Stack Developer</h3>
              <p className="mt-1 truncate text-sm text-muted-foreground">Checkout and Payments Team</p>
            </div>

            <div className="mt-4 flex items-center justify-between sm:mt-0 sm:ml-6 sm:shrink-0 sm:justify-start">
              <Badge variant="success" className="bg-primary-50 text-primary-700 border-primary-200">
                Open
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="ml-3 text-muted-foreground">
                    <span className="sr-only">Open options</span>
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuItem>Duplicate</DropdownMenuItem>
                  <DropdownMenuItem>Archive</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        <div className="px-4 py-5 sm:px-6">
          <p className="text-sm text-muted-foreground">Section content goes here...</p>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Badge: <code className="bg-background px-1 py-0.5 rounded">bg-primary-50 text-primary-700</code></li>
          <li>• Menu trigger: <code className="bg-background px-1 py-0.5 rounded">variant="ghost"</code></li>
          <li>• Flex layout with width constraints</li>
        </ul>
      </div>
    </section>
  );
}

function WithTabsInlineExample() {
  const tabs = [
    { name: 'Open', value: 'open', current: true },
    { name: 'Closed', value: 'closed', current: false },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">With Inline Tabs</h2>
        <p className="text-sm text-muted-foreground">Title and tabs on same baseline</p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-4 pt-5 sm:px-6">
          <div className="sm:flex sm:items-baseline">
            <h3 className="text-base font-semibold">Issues</h3>
            <div className="mt-4 sm:mt-0 sm:ml-10">
              <Tabs defaultValue="open" className="-mb-px">
                <TabsList className="h-auto p-0 bg-transparent border-0 space-x-8">
                  {tabs.map((tab) => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary-500 data-[state=active]:text-primary-600 px-1 pb-4 bg-transparent"
                    >
                      {tab.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>
        <div className="px-4 py-5 sm:px-6">
          <p className="text-sm text-muted-foreground">Tab content goes here...</p>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Title and tabs on same baseline</li>
          <li>• Tabs use bottom border indicator</li>
          <li>• Active: <code className="bg-background px-1 py-0.5 rounded">border-primary-500 text-primary-600</code></li>
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
        <p className="text-sm text-muted-foreground">Complete token reference for section headers</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-border p-4 space-y-2">
          <h3 className="text-sm font-medium">Layout</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Negative margins for alignment</li>
            <li>• <code className="bg-muted px-1 py-0.5 rounded">flex-wrap sm:flex-nowrap</code></li>
            <li>• <code className="bg-muted px-1 py-0.5 rounded">shrink-0</code> for buttons</li>
          </ul>
        </div>

        <div className="rounded-lg border border-border p-4 space-y-2">
          <h3 className="text-sm font-medium">Components</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Button (default & outline variants)</li>
            <li>• Avatar from Radix UI</li>
            <li>• DropdownMenu for actions</li>
            <li>• Lucide icons</li>
          </ul>
        </div>

        <div className="rounded-lg border border-border p-4 space-y-2">
          <h3 className="text-sm font-medium">Typography</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Title: <code className="bg-muted px-1 py-0.5 rounded">text-base font-semibold</code></li>
            <li>• Description: <code className="bg-muted px-1 py-0.5 rounded">text-sm text-muted-foreground</code></li>
            <li>• Links: <code className="bg-muted px-1 py-0.5 rounded">hover:underline</code></li>
          </ul>
        </div>
      </div>
    </section>
  );
}