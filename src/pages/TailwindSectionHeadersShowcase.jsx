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
import { MoreVertical, Star, Code, Flag, Phone, Mail } from 'lucide-react';

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