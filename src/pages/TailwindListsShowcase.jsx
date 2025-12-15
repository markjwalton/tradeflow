import React, { useState } from 'react';
import { PageHeader } from '@/components/sturij/PageHeader';
import { ChevronLeft, ChevronRight, ArrowLeft, ArrowRight, ChevronDown, User, Building, Users, CreditCard, Home, Folder, Calendar as CalendarIcon, FileText, BarChart3 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';

const sampleItems = [
  { id: 1, title: 'First item', description: 'Sample content for demonstration' },
  { id: 2, title: 'Second item', description: 'Sample content for demonstration' },
  { id: 3, title: 'Third item', description: 'Sample content for demonstration' },
];

export default function TailwindListsShowcase() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="List Layouts"
        description="Tailwind UI list patterns converted to use design tokens for consistent styling."
      />

      {/* Simple Divided List */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-display mb-2">Simple Divided List</h2>
          <p className="text-sm text-muted-foreground">Basic divided list with responsive padding</p>
        </div>
        
        <ul role="list" className="divide-y divide-border">
          {sampleItems.map((item) => (
            <li key={item.id} className="px-4 py-4 sm:px-0">
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
            </li>
          ))}
        </ul>

        <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
          <p className="font-medium">Design Token Mappings:</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Divider: <code className="bg-background px-1 py-0.5 rounded">divide-border</code> (var(--border))</li>
            <li>• Padding: <code className="bg-background px-1 py-0.5 rounded">px-4 py-4 sm:px-0</code></li>
          </ul>
        </div>
      </section>

      {/* Bordered Container List */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-display mb-2">Bordered Container List</h2>
          <p className="text-sm text-muted-foreground">List within a bordered container</p>
        </div>
        
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <ul role="list" className="divide-y divide-border">
            {sampleItems.map((item) => (
              <li key={item.id} className="px-6 py-4">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
          <p className="font-medium">Design Token Mappings:</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Container BG: <code className="bg-background px-1 py-0.5 rounded">bg-card</code> (var(--card))</li>
            <li>• Border: <code className="bg-background px-1 py-0.5 rounded">border-border</code> (var(--border))</li>
            <li>• Radius: <code className="bg-background px-1 py-0.5 rounded">rounded-xl</code> (var(--radius-xl))</li>
          </ul>
        </div>
      </section>

      {/* Spaced Card Items */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-display mb-2">Spaced Card Items</h2>
          <p className="text-sm text-muted-foreground">Individual card items with spacing, responsive radius</p>
        </div>
        
        <ul role="list" className="space-y-3">
          {sampleItems.map((item) => (
            <li key={item.id} className="overflow-hidden bg-card px-4 py-4 shadow-sm sm:rounded-xl sm:px-6 border border-border">
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
            </li>
          ))}
        </ul>

        <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
          <p className="font-medium">Design Token Mappings:</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Item BG: <code className="bg-background px-1 py-0.5 rounded">bg-card</code></li>
            <li>• Shadow: <code className="bg-background px-1 py-0.5 rounded">shadow-sm</code> (var(--shadow-sm))</li>
            <li>• Radius: <code className="bg-background px-1 py-0.5 rounded">sm:rounded-xl</code></li>
            <li>• Spacing: <code className="bg-background px-1 py-0.5 rounded">space-y-3</code> (var(--spacing-3))</li>
          </ul>
        </div>
      </section>

      {/* Spaced Rounded Card Items */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-display mb-2">Spaced Rounded Items</h2>
          <p className="text-sm text-muted-foreground">Fully rounded card items with consistent spacing</p>
        </div>
        
        <ul role="list" className="space-y-3">
          {sampleItems.map((item) => (
            <li key={item.id} className="overflow-hidden rounded-xl bg-card px-6 py-4 shadow-sm border border-border">
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
            </li>
          ))}
        </ul>

        <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
          <p className="font-medium">Design Token Mappings:</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Radius: <code className="bg-background px-1 py-0.5 rounded">rounded-xl</code> on all screen sizes</li>
            <li>• Padding: <code className="bg-background px-1 py-0.5 rounded">px-6 py-4</code> consistent</li>
          </ul>
        </div>
      </section>

      {/* Contained Divided List (Responsive) */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-display mb-2">Contained List (Responsive)</h2>
          <p className="text-sm text-muted-foreground">Full-width mobile, rounded desktop container</p>
        </div>
        
        <div className="overflow-hidden bg-card shadow-sm sm:rounded-xl border border-border">
          <ul role="list" className="divide-y divide-border">
            {sampleItems.map((item) => (
              <li key={item.id} className="px-4 py-4 sm:px-6">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
          <p className="font-medium">Responsive Design:</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Mobile: Full-width, no radius</li>
            <li>• Desktop: <code className="bg-background px-1 py-0.5 rounded">sm:rounded-xl</code></li>
            <li>• Padding: <code className="bg-background px-1 py-0.5 rounded">px-4 py-4 sm:px-6</code></li>
          </ul>
        </div>
      </section>

      {/* Contained Divided List (Always Rounded) */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-display mb-2">Contained List (Always Rounded)</h2>
          <p className="text-sm text-muted-foreground">Rounded container on all screen sizes</p>
        </div>
        
        <div className="overflow-hidden rounded-xl bg-card shadow-sm border border-border">
          <ul role="list" className="divide-y divide-border">
            {sampleItems.map((item) => (
              <li key={item.id} className="px-6 py-4">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
          <p className="font-medium">Design Token Mappings:</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Radius: <code className="bg-background px-1 py-0.5 rounded">rounded-xl</code> on all sizes</li>
            <li>• Padding: <code className="bg-background px-1 py-0.5 rounded">px-6 py-4</code> consistent</li>
          </ul>
        </div>
      </section>

      {/* Simple Divided List (No Padding) */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-display mb-2">Simple Divided List (Minimal)</h2>
          <p className="text-sm text-muted-foreground">Clean divided list with vertical padding only</p>
        </div>
        
        <ul role="list" className="divide-y divide-border">
          {sampleItems.map((item) => (
            <li key={item.id} className="py-4">
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
            </li>
          ))}
        </ul>

        <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
          <p className="font-medium">Design Token Mappings:</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Divider: <code className="bg-background px-1 py-0.5 rounded">divide-border</code></li>
            <li>• Padding: <code className="bg-background px-1 py-0.5 rounded">py-4</code> (vertical only)</li>
            <li>• No horizontal padding - edge to edge</li>
          </ul>
        </div>
      </section>

      {/* Tabs Variations */}
      <section className="space-y-8 mt-12 pt-8 border-t border-border">
        <div>
          <h2 className="text-xl font-display mb-2">Tabs</h2>
          <p className="text-sm text-muted-foreground">Navigation patterns for tabbed interfaces</p>
        </div>

        {/* Underline Tabs */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Underline Style</h3>
          <div>
            <div className="grid grid-cols-1 sm:hidden">
              <Select defaultValue="team">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="account">My Account</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="team">Team Members</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="hidden sm:block">
              <div className="border-b border-border">
                <nav aria-label="Tabs" className="-mb-px flex space-x-8">
                  <a href="#" className="border-transparent text-muted-foreground hover:border-border hover:text-foreground border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap">
                    My Account
                  </a>
                  <a href="#" className="border-transparent text-muted-foreground hover:border-border hover:text-foreground border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap">
                    Company
                  </a>
                  <a href="#" aria-current="page" className="border-primary text-primary border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap">
                    Team Members
                  </a>
                  <a href="#" className="border-transparent text-muted-foreground hover:border-border hover:text-foreground border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap">
                    Billing
                  </a>
                </nav>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Active: <code className="bg-background px-1 py-0.5 rounded">border-primary text-primary</code></li>
              <li>• Inactive: <code className="bg-background px-1 py-0.5 rounded">text-muted-foreground hover:text-foreground</code></li>
              <li>• Border indicator: <code className="bg-background px-1 py-0.5 rounded">border-b-2</code></li>
            </ul>
          </div>
        </div>

        {/* Tabs with Icons */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">With Icons</h3>
          <div>
            <div className="grid grid-cols-1 sm:hidden">
              <Select defaultValue="team">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="account">My Account</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="team">Team Members</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="hidden sm:block">
              <div className="border-b border-border">
                <nav aria-label="Tabs" className="-mb-px flex space-x-8">
                  <a href="#" className="border-transparent text-muted-foreground hover:border-border hover:text-foreground group inline-flex items-center border-b-2 px-1 py-4 text-sm font-medium">
                    <User aria-hidden="true" className="text-muted-foreground group-hover:text-foreground mr-2 -ml-0.5 h-5 w-5" />
                    <span>My Account</span>
                  </a>
                  <a href="#" className="border-transparent text-muted-foreground hover:border-border hover:text-foreground group inline-flex items-center border-b-2 px-1 py-4 text-sm font-medium">
                    <Building aria-hidden="true" className="text-muted-foreground group-hover:text-foreground mr-2 -ml-0.5 h-5 w-5" />
                    <span>Company</span>
                  </a>
                  <a href="#" aria-current="page" className="border-primary text-primary group inline-flex items-center border-b-2 px-1 py-4 text-sm font-medium">
                    <Users aria-hidden="true" className="text-primary mr-2 -ml-0.5 h-5 w-5" />
                    <span>Team Members</span>
                  </a>
                  <a href="#" className="border-transparent text-muted-foreground hover:border-border hover:text-foreground group inline-flex items-center border-b-2 px-1 py-4 text-sm font-medium">
                    <CreditCard aria-hidden="true" className="text-muted-foreground group-hover:text-foreground mr-2 -ml-0.5 h-5 w-5" />
                    <span>Billing</span>
                  </a>
                </nav>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Icons: Lucide <code className="bg-background px-1 py-0.5 rounded">User</code>, <code className="bg-background px-1 py-0.5 rounded">Building</code>, <code className="bg-background px-1 py-0.5 rounded">Users</code>, <code className="bg-background px-1 py-0.5 rounded">CreditCard</code></li>
              <li>• Icon colors match text state (active/hover)</li>
            </ul>
          </div>
        </div>

        {/* Pill Tabs - Subtle */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Pill Style (Subtle)</h3>
          <div>
            <div className="grid grid-cols-1 sm:hidden">
              <Select defaultValue="team">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="account">My Account</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="team">Team Members</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="hidden sm:block">
              <nav aria-label="Tabs" className="flex space-x-4">
                <a href="#" className="text-muted-foreground hover:text-foreground rounded-md px-3 py-2 text-sm font-medium">
                  My Account
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground rounded-md px-3 py-2 text-sm font-medium">
                  Company
                </a>
                <a href="#" aria-current="page" className="bg-accent text-foreground rounded-md px-3 py-2 text-sm font-medium">
                  Team Members
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground rounded-md px-3 py-2 text-sm font-medium">
                  Billing
                </a>
              </nav>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Active: <code className="bg-background px-1 py-0.5 rounded">bg-accent text-foreground</code></li>
              <li>• Rounded pills: <code className="bg-background px-1 py-0.5 rounded">rounded-md</code></li>
            </ul>
          </div>
        </div>

        {/* Pill Tabs - Medium */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Pill Style (Medium)</h3>
          <div>
            <div className="grid grid-cols-1 sm:hidden">
              <Select defaultValue="team">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="account">My Account</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="team">Team Members</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="hidden sm:block">
              <nav aria-label="Tabs" className="flex space-x-4">
                <a href="#" className="text-muted-foreground hover:text-foreground rounded-md px-3 py-2 text-sm font-medium">
                  My Account
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground rounded-md px-3 py-2 text-sm font-medium">
                  Company
                </a>
                <a href="#" aria-current="page" className="bg-muted text-foreground rounded-md px-3 py-2 text-sm font-medium">
                  Team Members
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground rounded-md px-3 py-2 text-sm font-medium">
                  Billing
                </a>
              </nav>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Active: <code className="bg-background px-1 py-0.5 rounded">bg-muted text-foreground</code></li>
            </ul>
          </div>
        </div>

        {/* Pill Tabs - Primary */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Pill Style (Primary)</h3>
          <div>
            <div className="grid grid-cols-1 sm:hidden">
              <Select defaultValue="team">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="account">My Account</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="team">Team Members</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="hidden sm:block">
              <nav aria-label="Tabs" className="flex space-x-4">
                <a href="#" className="text-muted-foreground hover:text-foreground rounded-md px-3 py-2 text-sm font-medium">
                  My Account
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground rounded-md px-3 py-2 text-sm font-medium">
                  Company
                </a>
                <a href="#" aria-current="page" className="bg-primary-100 text-primary-700 rounded-md px-3 py-2 text-sm font-medium">
                  Team Members
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground rounded-md px-3 py-2 text-sm font-medium">
                  Billing
                </a>
              </nav>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Active: <code className="bg-background px-1 py-0.5 rounded">bg-primary-100 text-primary-700</code></li>
            </ul>
          </div>
        </div>

        {/* Full Width Tabs */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Full Width</h3>
          <div>
            <div className="grid grid-cols-1 sm:hidden">
              <Select defaultValue="team">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="account">My Account</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="team">Team Members</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="hidden sm:block">
              <div className="border-b border-border">
                <nav aria-label="Tabs" className="-mb-px flex">
                  <a href="#" className="border-transparent text-muted-foreground hover:border-border hover:text-foreground w-1/4 border-b-2 px-1 py-4 text-center text-sm font-medium">
                    My Account
                  </a>
                  <a href="#" className="border-transparent text-muted-foreground hover:border-border hover:text-foreground w-1/4 border-b-2 px-1 py-4 text-center text-sm font-medium">
                    Company
                  </a>
                  <a href="#" aria-current="page" className="border-primary text-primary w-1/4 border-b-2 px-1 py-4 text-center text-sm font-medium">
                    Team Members
                  </a>
                  <a href="#" className="border-transparent text-muted-foreground hover:border-border hover:text-foreground w-1/4 border-b-2 px-1 py-4 text-center text-sm font-medium">
                    Billing
                  </a>
                </nav>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Equal width tabs: <code className="bg-background px-1 py-0.5 rounded">w-1/4</code></li>
              <li>• Centered text: <code className="bg-background px-1 py-0.5 rounded">text-center</code></li>
            </ul>
          </div>
        </div>

        {/* Contained Tabs */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Contained with Dividers</h3>
          <div>
            <div className="grid grid-cols-1 sm:hidden">
              <Select defaultValue="team">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="account">My Account</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="team">Team Members</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="hidden sm:block">
              <nav aria-label="Tabs" className="isolate flex divide-x divide-border rounded-lg bg-card shadow-sm">
                <a href="#" className="text-muted-foreground hover:text-foreground rounded-l-lg group relative min-w-0 flex-1 overflow-hidden px-4 py-4 text-center text-sm font-medium hover:bg-accent focus:z-10">
                  <span>My Account</span>
                  <span aria-hidden="true" className="bg-transparent absolute inset-x-0 bottom-0 h-0.5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground group relative min-w-0 flex-1 overflow-hidden px-4 py-4 text-center text-sm font-medium hover:bg-accent focus:z-10">
                  <span>Company</span>
                  <span aria-hidden="true" className="bg-transparent absolute inset-x-0 bottom-0 h-0.5" />
                </a>
                <a href="#" aria-current="page" className="text-foreground group relative min-w-0 flex-1 overflow-hidden px-4 py-4 text-center text-sm font-medium hover:bg-accent focus:z-10">
                  <span>Team Members</span>
                  <span aria-hidden="true" className="bg-primary absolute inset-x-0 bottom-0 h-0.5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground rounded-r-lg group relative min-w-0 flex-1 overflow-hidden px-4 py-4 text-center text-sm font-medium hover:bg-accent focus:z-10">
                  <span>Billing</span>
                  <span aria-hidden="true" className="bg-transparent absolute inset-x-0 bottom-0 h-0.5" />
                </a>
              </nav>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Container: <code className="bg-background px-1 py-0.5 rounded">bg-card shadow-sm rounded-lg</code></li>
              <li>• Dividers: <code className="bg-background px-1 py-0.5 rounded">divide-x divide-border</code></li>
              <li>• Active indicator: <code className="bg-background px-1 py-0.5 rounded">bg-primary</code> bottom accent</li>
            </ul>
          </div>
        </div>

        {/* Simple List Style */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Simple List Style</h3>
          <div className="bg-card px-4 py-6 sm:px-6 lg:px-8 rounded-xl">
            <div className="mx-auto max-w-7xl">
              <div className="grid grid-cols-1 sm:hidden">
                <Select defaultValue="team">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="account">My Account</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
                    <SelectItem value="team">Team Members</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="hidden sm:block">
                <nav className="flex border-b border-border py-4">
                  <ul role="list" className="flex min-w-full flex-none gap-x-8 px-2 text-sm font-semibold text-muted-foreground">
                    <li><a href="#" className="hover:text-foreground">My Account</a></li>
                    <li><a href="#" className="hover:text-foreground">Company</a></li>
                    <li><a href="#" className="text-primary">Team Members</a></li>
                    <li><a href="#" className="hover:text-foreground">Billing</a></li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Minimal list style with gap spacing</li>
              <li>• Active: <code className="bg-background px-1 py-0.5 rounded">text-primary</code></li>
            </ul>
          </div>
        </div>
      </section>

      {/* Pagination Variations */}
      <section className="space-y-8 mt-12 pt-8 border-t border-border">
        <div>
          <h2 className="text-xl font-display mb-2">Pagination</h2>
          <p className="text-sm text-muted-foreground">Navigation patterns for paginated content</p>
        </div>

        {/* Numbered Pagination */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Numbered with Results Count</h3>
          <div className="flex items-center justify-between border-t border-border bg-card px-4 py-3 sm:px-6 rounded-b-xl">
            <div className="flex flex-1 justify-between sm:hidden">
              <a href="#" className="relative inline-flex items-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent">
                Previous
              </a>
              <a href="#" className="relative ml-3 inline-flex items-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent">
                Next
              </a>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-medium text-foreground">1</span> to <span className="font-medium text-foreground">10</span> of{' '}
                  <span className="font-medium text-foreground">97</span> results
                </p>
              </div>
              <div>
                <nav aria-label="Pagination" className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                  <a href="#" className="relative inline-flex items-center rounded-l-md px-2 py-2 text-muted-foreground ring-1 ring-inset ring-border hover:bg-accent focus:z-20 focus:outline-offset-0">
                    <span className="sr-only">Previous</span>
                    <ChevronLeft aria-hidden="true" className="h-5 w-5" />
                  </a>
                  <a href="#" aria-current="page" className="relative z-10 inline-flex items-center bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground focus:z-20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                    1
                  </a>
                  <a href="#" className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-foreground ring-1 ring-inset ring-border hover:bg-accent focus:z-20 focus:outline-offset-0">
                    2
                  </a>
                  <a href="#" className="relative hidden items-center px-4 py-2 text-sm font-semibold text-foreground ring-1 ring-inset ring-border hover:bg-accent focus:z-20 focus:outline-offset-0 md:inline-flex">
                    3
                  </a>
                  <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-muted-foreground ring-1 ring-inset ring-border focus:outline-offset-0">
                    ...
                  </span>
                  <a href="#" className="relative hidden items-center px-4 py-2 text-sm font-semibold text-foreground ring-1 ring-inset ring-border hover:bg-accent focus:z-20 focus:outline-offset-0 md:inline-flex">
                    8
                  </a>
                  <a href="#" className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-foreground ring-1 ring-inset ring-border hover:bg-accent focus:z-20 focus:outline-offset-0">
                    9
                  </a>
                  <a href="#" className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-foreground ring-1 ring-inset ring-border hover:bg-accent focus:z-20 focus:outline-offset-0">
                    10
                  </a>
                  <a href="#" className="relative inline-flex items-center rounded-r-md px-2 py-2 text-muted-foreground ring-1 ring-inset ring-border hover:bg-accent focus:z-20 focus:outline-offset-0">
                    <span className="sr-only">Next</span>
                    <ChevronRight aria-hidden="true" className="h-5 w-5" />
                  </a>
                </nav>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Active page: <code className="bg-background px-1 py-0.5 rounded">bg-primary text-primary-foreground</code></li>
              <li>• Default pages: <code className="bg-background px-1 py-0.5 rounded">ring-1 ring-inset ring-border hover:bg-accent</code></li>
              <li>• Icons: Lucide <code className="bg-background px-1 py-0.5 rounded">ChevronLeft</code> and <code className="bg-background px-1 py-0.5 rounded">ChevronRight</code></li>
            </ul>
          </div>
        </div>

        {/* Arrow Pagination with Top Border */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Arrow Style with Border Indicators</h3>
          <nav className="flex items-center justify-between border-t border-border px-4 sm:px-0">
            <div className="-mt-px flex w-0 flex-1">
              <a href="#" className="inline-flex items-center border-t-2 border-transparent pt-4 pr-1 text-sm font-medium text-muted-foreground hover:border-border hover:text-foreground">
                <ArrowLeft aria-hidden="true" className="mr-3 h-5 w-5 text-muted-foreground" />
                Previous
              </a>
            </div>
            <div className="hidden md:-mt-px md:flex">
              <a href="#" className="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-muted-foreground hover:border-border hover:text-foreground">
                1
              </a>
              <a href="#" aria-current="page" className="inline-flex items-center border-t-2 border-primary px-4 pt-4 text-sm font-medium text-primary">
                2
              </a>
              <a href="#" className="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-muted-foreground hover:border-border hover:text-foreground">
                3
              </a>
              <span className="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-muted-foreground">
                ...
              </span>
              <a href="#" className="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-muted-foreground hover:border-border hover:text-foreground">
                8
              </a>
              <a href="#" className="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-muted-foreground hover:border-border hover:text-foreground">
                9
              </a>
              <a href="#" className="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-muted-foreground hover:border-border hover:text-foreground">
                10
              </a>
            </div>
            <div className="-mt-px flex w-0 flex-1 justify-end">
              <a href="#" className="inline-flex items-center border-t-2 border-transparent pt-4 pl-1 text-sm font-medium text-muted-foreground hover:border-border hover:text-foreground">
                Next
                <ArrowRight aria-hidden="true" className="ml-3 h-5 w-5 text-muted-foreground" />
              </a>
            </div>
          </nav>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Active indicator: <code className="bg-background px-1 py-0.5 rounded">border-t-2 border-primary text-primary</code></li>
              <li>• Hover state: <code className="bg-background px-1 py-0.5 rounded">hover:border-border hover:text-foreground</code></li>
              <li>• Icons: Lucide <code className="bg-background px-1 py-0.5 rounded">ArrowLeft</code> and <code className="bg-background px-1 py-0.5 rounded">ArrowRight</code></li>
            </ul>
          </div>
        </div>

        {/* Simple Previous/Next */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Simple Previous/Next</h3>
          <nav aria-label="Pagination" className="flex items-center justify-between border-t border-border bg-card px-4 py-3 sm:px-6 rounded-b-xl">
            <div className="hidden sm:block">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">1</span> to <span className="font-medium text-foreground">10</span> of{' '}
                <span className="font-medium text-foreground">20</span> results
              </p>
            </div>
            <div className="flex flex-1 justify-between sm:justify-end">
              <a href="#" className="relative inline-flex items-center rounded-md bg-background px-3 py-2 text-sm font-semibold text-foreground ring-1 ring-inset ring-border hover:bg-accent">
                Previous
              </a>
              <a href="#" className="relative ml-3 inline-flex items-center rounded-md bg-background px-3 py-2 text-sm font-semibold text-foreground ring-1 ring-inset ring-border hover:bg-accent">
                Next
              </a>
            </div>
          </nav>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Buttons: <code className="bg-background px-1 py-0.5 rounded">ring-1 ring-inset ring-border hover:bg-accent</code></li>
              <li>• Text: <code className="bg-background px-1 py-0.5 rounded">text-foreground</code> with <code className="bg-background px-1 py-0.5 rounded">text-muted-foreground</code> for meta</li>
              <li>• Minimal style for simple use cases</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Sidebar Navigation */}
      <section className="space-y-8 mt-12 pt-8 border-t border-border">
        <div>
          <h2 className="text-xl font-display mb-2">Sidebar Navigation</h2>
          <p className="text-sm text-muted-foreground">Vertical navigation patterns for sidebars</p>
        </div>

        {/* Simple Text Navigation */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Simple Text Links</h3>
          <nav aria-label="Sidebar" className="flex flex-1 flex-col max-w-xs bg-card border border-border rounded-xl p-4">
            <ul role="list" className="-mx-2 space-y-1">
              <li>
                <a href="#" className="bg-accent text-primary group flex gap-x-3 rounded-md p-2 pl-3 text-sm font-semibold">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground hover:bg-accent hover:text-primary group flex gap-x-3 rounded-md p-2 pl-3 text-sm font-semibold">
                  Team
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground hover:bg-accent hover:text-primary group flex gap-x-3 rounded-md p-2 pl-3 text-sm font-semibold">
                  Projects
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground hover:bg-accent hover:text-primary group flex gap-x-3 rounded-md p-2 pl-3 text-sm font-semibold">
                  Calendar
                </a>
              </li>
            </ul>
          </nav>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Active: <code className="bg-background px-1 py-0.5 rounded">bg-accent text-primary</code></li>
              <li>• Inactive: <code className="bg-background px-1 py-0.5 rounded">text-foreground hover:bg-accent hover:text-primary</code></li>
            </ul>
          </div>
        </div>

        {/* Navigation with Badges */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">With Badge Counts</h3>
          <nav aria-label="Sidebar" className="flex flex-1 flex-col max-w-xs bg-card border border-border rounded-xl p-4">
            <ul role="list" className="-mx-2 space-y-1">
              <li>
                <a href="#" className="bg-accent text-primary group flex gap-x-3 rounded-md p-2 pl-3 text-sm font-semibold">
                  Dashboard
                  <Badge variant="secondary" className="ml-auto">5</Badge>
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground hover:bg-accent hover:text-primary group flex gap-x-3 rounded-md p-2 pl-3 text-sm font-semibold">
                  Team
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground hover:bg-accent hover:text-primary group flex gap-x-3 rounded-md p-2 pl-3 text-sm font-semibold">
                  Projects
                  <Badge variant="secondary" className="ml-auto">12</Badge>
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground hover:bg-accent hover:text-primary group flex gap-x-3 rounded-md p-2 pl-3 text-sm font-semibold">
                  Calendar
                  <Badge variant="secondary" className="ml-auto">20+</Badge>
                </a>
              </li>
            </ul>
          </nav>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Badges: <code className="bg-background px-1 py-0.5 rounded">Badge variant="secondary"</code></li>
              <li>• Auto-alignment: <code className="bg-background px-1 py-0.5 rounded">ml-auto</code></li>
            </ul>
          </div>
        </div>

        {/* Navigation with Icons */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">With Icons</h3>
          <nav aria-label="Sidebar" className="flex flex-1 flex-col max-w-xs bg-card border border-border rounded-xl p-4">
            <ul role="list" className="-mx-2 space-y-1">
              <li>
                <a href="#" className="bg-accent text-primary group flex gap-x-3 rounded-md p-2 text-sm font-semibold">
                  <Home aria-hidden="true" className="text-primary h-6 w-6 shrink-0" />
                  Dashboard
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground hover:bg-accent hover:text-primary group flex gap-x-3 rounded-md p-2 text-sm font-semibold">
                  <Users aria-hidden="true" className="text-muted-foreground group-hover:text-primary h-6 w-6 shrink-0" />
                  Team
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground hover:bg-accent hover:text-primary group flex gap-x-3 rounded-md p-2 text-sm font-semibold">
                  <Folder aria-hidden="true" className="text-muted-foreground group-hover:text-primary h-6 w-6 shrink-0" />
                  Projects
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground hover:bg-accent hover:text-primary group flex gap-x-3 rounded-md p-2 text-sm font-semibold">
                  <CalendarIcon aria-hidden="true" className="text-muted-foreground group-hover:text-primary h-6 w-6 shrink-0" />
                  Calendar
                </a>
              </li>
            </ul>
          </nav>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Icons: Lucide with <code className="bg-background px-1 py-0.5 rounded">h-6 w-6 shrink-0</code></li>
              <li>• Icon colors: <code className="bg-background px-1 py-0.5 rounded">text-primary</code> when active, <code className="bg-background px-1 py-0.5 rounded">text-muted-foreground</code> otherwise</li>
            </ul>
          </div>
        </div>

        {/* Navigation with Icons and Badges */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">With Icons and Badges</h3>
          <nav aria-label="Sidebar" className="flex flex-1 flex-col max-w-xs bg-card border border-border rounded-xl p-4">
            <ul role="list" className="-mx-2 space-y-1">
              <li>
                <a href="#" className="bg-accent text-primary group flex gap-x-3 rounded-md p-2 text-sm font-semibold">
                  <Home aria-hidden="true" className="text-primary h-6 w-6 shrink-0" />
                  Dashboard
                  <Badge variant="secondary" className="ml-auto">5</Badge>
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground hover:bg-accent hover:text-primary group flex gap-x-3 rounded-md p-2 text-sm font-semibold">
                  <Users aria-hidden="true" className="text-muted-foreground group-hover:text-primary h-6 w-6 shrink-0" />
                  Team
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground hover:bg-accent hover:text-primary group flex gap-x-3 rounded-md p-2 text-sm font-semibold">
                  <Folder aria-hidden="true" className="text-muted-foreground group-hover:text-primary h-6 w-6 shrink-0" />
                  Projects
                  <Badge variant="secondary" className="ml-auto">12</Badge>
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground hover:bg-accent hover:text-primary group flex gap-x-3 rounded-md p-2 text-sm font-semibold">
                  <CalendarIcon aria-hidden="true" className="text-muted-foreground group-hover:text-primary h-6 w-6 shrink-0" />
                  Calendar
                  <Badge variant="secondary" className="ml-auto">20+</Badge>
                </a>
              </li>
            </ul>
          </nav>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Combines icons and badges in single links</li>
              <li>• Badge positioned with <code className="bg-background px-1 py-0.5 rounded">ml-auto</code></li>
            </ul>
          </div>
        </div>

        {/* Two-Level Navigation */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Two-Level with Groups</h3>
          <nav aria-label="Sidebar" className="flex flex-1 flex-col max-w-xs bg-card border border-border rounded-xl p-4">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  <li>
                    <a href="#" className="bg-accent text-primary group flex gap-x-3 rounded-md p-2 text-sm font-semibold">
                      <Home aria-hidden="true" className="text-primary h-6 w-6 shrink-0" />
                      Dashboard
                      <Badge variant="secondary" className="ml-auto">5</Badge>
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-foreground hover:bg-accent hover:text-primary group flex gap-x-3 rounded-md p-2 text-sm font-semibold">
                      <Users aria-hidden="true" className="text-muted-foreground group-hover:text-primary h-6 w-6 shrink-0" />
                      Team
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-foreground hover:bg-accent hover:text-primary group flex gap-x-3 rounded-md p-2 text-sm font-semibold">
                      <Folder aria-hidden="true" className="text-muted-foreground group-hover:text-primary h-6 w-6 shrink-0" />
                      Projects
                      <Badge variant="secondary" className="ml-auto">12</Badge>
                    </a>
                  </li>
                </ul>
              </li>
              <li>
                <div className="text-xs font-semibold text-muted-foreground">Projects</div>
                <ul role="list" className="-mx-2 mt-2 space-y-1">
                  <li>
                    <a href="#" className="text-foreground hover:bg-accent hover:text-primary group flex gap-x-3 rounded-md p-2 text-sm font-semibold">
                      <span className="border-border text-muted-foreground group-hover:border-primary group-hover:text-primary flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border bg-background text-[0.625rem] font-medium">
                        W
                      </span>
                      <span className="truncate">Website redesign</span>
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-foreground hover:bg-accent hover:text-primary group flex gap-x-3 rounded-md p-2 text-sm font-semibold">
                      <span className="border-border text-muted-foreground group-hover:border-primary group-hover:text-primary flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border bg-background text-[0.625rem] font-medium">
                        G
                      </span>
                      <span className="truncate">GraphQL API</span>
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-foreground hover:bg-accent hover:text-primary group flex gap-x-3 rounded-md p-2 text-sm font-semibold">
                      <span className="border-border text-muted-foreground group-hover:border-primary group-hover:text-primary flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border bg-background text-[0.625rem] font-medium">
                        C
                      </span>
                      <span className="truncate">Customer guides</span>
                    </a>
                  </li>
                </ul>
              </li>
            </ul>
          </nav>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Section headers: <code className="bg-background px-1 py-0.5 rounded">text-muted-foreground text-xs font-semibold</code></li>
              <li>• Initial badges: <code className="bg-background px-1 py-0.5 rounded">border bg-background</code> with hover states</li>
              <li>• Vertical spacing: <code className="bg-background px-1 py-0.5 rounded">gap-y-7</code> between groups</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Full Sidebar Layouts */}
      <section className="space-y-8 mt-12 pt-8 border-t border-border">
        <div>
          <h2 className="text-xl font-display mb-2">Full Sidebar Layouts</h2>
          <p className="text-sm text-muted-foreground">Complete sidebar navigation with logo, user profile, and sections</p>
        </div>

        {/* Light Full Sidebar */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Light Theme with Logo & Profile</h3>
          <div className="relative flex grow flex-col gap-y-5 overflow-y-auto border-r border-border bg-card px-6 h-[600px] rounded-xl">
            <div className="relative flex h-16 shrink-0 items-center">
              <div className="h-8 w-8 rounded bg-primary" />
            </div>
            <nav className="relative flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    <li>
                      <a href="#" className="bg-accent text-primary group flex gap-x-3 rounded-md p-2 text-sm font-semibold">
                        <Home aria-hidden="true" className="text-primary h-6 w-6 shrink-0" />
                        Dashboard
                        <Badge variant="secondary" className="ml-auto">5</Badge>
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-foreground hover:bg-accent hover:text-primary group flex gap-x-3 rounded-md p-2 text-sm font-semibold">
                        <Users aria-hidden="true" className="text-muted-foreground group-hover:text-primary h-6 w-6 shrink-0" />
                        Team
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-foreground hover:bg-accent hover:text-primary group flex gap-x-3 rounded-md p-2 text-sm font-semibold">
                        <Folder aria-hidden="true" className="text-muted-foreground group-hover:text-primary h-6 w-6 shrink-0" />
                        Projects
                        <Badge variant="secondary" className="ml-auto">12</Badge>
                      </a>
                    </li>
                  </ul>
                </li>
                <li>
                  <div className="text-xs font-semibold text-muted-foreground">Your teams</div>
                  <ul role="list" className="-mx-2 mt-2 space-y-1">
                    <li>
                      <a href="#" className="text-foreground hover:bg-accent hover:text-primary group flex gap-x-3 rounded-md p-2 text-sm font-semibold">
                        <span className="border-border text-muted-foreground group-hover:border-primary group-hover:text-primary flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border bg-background text-[0.625rem] font-medium">
                          H
                        </span>
                        <span className="truncate">Heroicons</span>
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-foreground hover:bg-accent hover:text-primary group flex gap-x-3 rounded-md p-2 text-sm font-semibold">
                        <span className="border-border text-muted-foreground group-hover:border-primary group-hover:text-primary flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border bg-background text-[0.625rem] font-medium">
                          T
                        </span>
                        <span className="truncate">Tailwind Labs</span>
                      </a>
                    </li>
                  </ul>
                </li>
                <li className="-mx-6 mt-auto">
                  <a href="#" className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold text-foreground hover:bg-accent">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=256&h=256&fit=crop" />
                      <AvatarFallback>TC</AvatarFallback>
                    </Avatar>
                    <span aria-hidden="true">Tom Cook</span>
                  </a>
                </li>
              </ul>
            </nav>
          </div>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Sidebar bg: <code className="bg-background px-1 py-0.5 rounded">bg-card border-border</code></li>
              <li>• User profile footer: <code className="bg-background px-1 py-0.5 rounded">mt-auto</code> for bottom positioning</li>
              <li>• Section headers: <code className="bg-background px-1 py-0.5 rounded">text-muted-foreground text-xs</code></li>
            </ul>
          </div>
        </div>

        {/* Dark Full Sidebar */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Dark Theme</h3>
          <div className="relative flex grow flex-col gap-y-5 overflow-y-auto bg-midnight-900 px-6 h-[600px] rounded-xl">
            <div className="relative flex h-16 shrink-0 items-center">
              <div className="h-8 w-8 rounded bg-primary-400" />
            </div>
            <nav className="relative flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    <li>
                      <a href="#" className="bg-white/5 text-white group flex gap-x-3 rounded-md p-2 text-sm font-semibold">
                        <Home aria-hidden="true" className="h-6 w-6 shrink-0" />
                        Dashboard
                        <span className="ml-auto w-9 min-w-max rounded-full bg-midnight-900 px-2.5 py-0.5 text-center text-xs font-medium whitespace-nowrap text-white ring-1 ring-inset ring-white/15">
                          5
                        </span>
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-charcoal-400 hover:bg-white/5 hover:text-white group flex gap-x-3 rounded-md p-2 text-sm font-semibold">
                        <Users aria-hidden="true" className="h-6 w-6 shrink-0" />
                        Team
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-charcoal-400 hover:bg-white/5 hover:text-white group flex gap-x-3 rounded-md p-2 text-sm font-semibold">
                        <Folder aria-hidden="true" className="h-6 w-6 shrink-0" />
                        Projects
                        <span className="ml-auto w-9 min-w-max rounded-full bg-midnight-900 px-2.5 py-0.5 text-center text-xs font-medium whitespace-nowrap text-white ring-1 ring-inset ring-white/15">
                          12
                        </span>
                      </a>
                    </li>
                  </ul>
                </li>
                <li>
                  <div className="text-xs font-semibold text-charcoal-400">Your teams</div>
                  <ul role="list" className="-mx-2 mt-2 space-y-1">
                    <li>
                      <a href="#" className="text-charcoal-400 hover:bg-white/5 hover:text-white group flex gap-x-3 rounded-md p-2 text-sm font-semibold">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[0.625rem] font-medium text-charcoal-400 group-hover:border-white/20 group-hover:text-white">
                          H
                        </span>
                        <span className="truncate">Heroicons</span>
                      </a>
                    </li>
                  </ul>
                </li>
                <li className="-mx-6 mt-auto">
                  <a href="#" className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold text-white hover:bg-white/5">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=256&h=256&fit=crop" />
                      <AvatarFallback>TC</AvatarFallback>
                    </Avatar>
                    <span aria-hidden="true">Tom Cook</span>
                  </a>
                </li>
              </ul>
            </nav>
          </div>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Dark bg: <code className="bg-background px-1 py-0.5 rounded">bg-midnight-900</code></li>
              <li>• Hover: <code className="bg-background px-1 py-0.5 rounded">hover:bg-white/5</code></li>
              <li>• Text: <code className="bg-background px-1 py-0.5 rounded">text-white</code> or <code className="bg-background px-1 py-0.5 rounded">text-charcoal-400</code></li>
            </ul>
          </div>
        </div>

        {/* Collapsible Navigation */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">With Collapsible Sections</h3>
          <CollapsibleSidebarExample />

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Uses <code className="bg-background px-1 py-0.5 rounded">Collapsible</code> component from shadcn/ui</li>
              <li>• Chevron rotates: <code className="bg-background px-1 py-0.5 rounded">data-[state=open]:rotate-90</code></li>
              <li>• Nested items indented with <code className="bg-background px-1 py-0.5 rounded">pl-9</code></li>
            </ul>
          </div>
        </div>

        {/* Colored Sidebar */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Colored Theme (Primary)</h3>
          <div className="relative flex grow flex-col gap-y-5 overflow-y-auto bg-primary-600 px-6 h-[600px] rounded-xl">
            <div className="flex h-16 shrink-0 items-center">
              <div className="h-8 w-8 rounded bg-white" />
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    <li>
                      <a href="#" className="bg-primary-700 text-white group flex gap-x-3 rounded-md p-2 text-sm font-semibold">
                        <Home aria-hidden="true" className="text-white h-6 w-6 shrink-0" />
                        Dashboard
                        <span className="ml-auto w-9 min-w-max rounded-full bg-primary-600 px-2.5 py-0.5 text-center text-xs font-medium whitespace-nowrap text-white ring-1 ring-inset ring-primary-500">
                          5
                        </span>
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-primary-200 hover:bg-primary-700 hover:text-white group flex gap-x-3 rounded-md p-2 text-sm font-semibold">
                        <Users aria-hidden="true" className="text-primary-200 group-hover:text-white h-6 w-6 shrink-0" />
                        Team
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-primary-200 hover:bg-primary-700 hover:text-white group flex gap-x-3 rounded-md p-2 text-sm font-semibold">
                        <Folder aria-hidden="true" className="text-primary-200 group-hover:text-white h-6 w-6 shrink-0" />
                        Projects
                        <span className="ml-auto w-9 min-w-max rounded-full bg-primary-600 px-2.5 py-0.5 text-center text-xs font-medium whitespace-nowrap text-white ring-1 ring-inset ring-primary-500">
                          12
                        </span>
                      </a>
                    </li>
                  </ul>
                </li>
                <li>
                  <div className="text-xs font-semibold text-primary-200">Your teams</div>
                  <ul role="list" className="-mx-2 mt-2 space-y-1">
                    <li>
                      <a href="#" className="text-primary-200 hover:bg-primary-700 hover:text-white group flex gap-x-3 rounded-md p-2 text-sm font-semibold">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-primary-400 bg-primary-500 text-[0.625rem] font-medium text-white">
                          H
                        </span>
                        <span className="truncate">Heroicons</span>
                      </a>
                    </li>
                  </ul>
                </li>
                <li className="-mx-6 mt-auto">
                  <a href="#" className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=256&h=256&fit=crop" />
                      <AvatarFallback>TC</AvatarFallback>
                    </Avatar>
                    <span aria-hidden="true">Tom Cook</span>
                  </a>
                </li>
              </ul>
            </nav>
          </div>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Primary bg: <code className="bg-background px-1 py-0.5 rounded">bg-primary-600</code></li>
              <li>• Active: <code className="bg-background px-1 py-0.5 rounded">bg-primary-700 text-white</code></li>
              <li>• Text: <code className="bg-background px-1 py-0.5 rounded">text-primary-200</code> for inactive items</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Token Reference */}
      <section className="space-y-4 mt-12 pt-8 border-t border-border">
        <div>
          <h2 className="text-xl font-display mb-2">Design System Reference</h2>
          <p className="text-sm text-muted-foreground">Complete list of design tokens used in list components</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-border p-4 space-y-2">
            <h3 className="text-sm font-medium">Colors</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• <code className="bg-muted px-1 py-0.5 rounded">bg-card</code> → var(--card)</li>
              <li>• <code className="bg-muted px-1 py-0.5 rounded">border-border</code> → var(--border)</li>
              <li>• <code className="bg-muted px-1 py-0.5 rounded">divide-border</code> → var(--border)</li>
            </ul>
          </div>

          <div className="rounded-lg border border-border p-4 space-y-2">
            <h3 className="text-sm font-medium">Spacing</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• <code className="bg-muted px-1 py-0.5 rounded">space-y-3</code> → var(--spacing-3)</li>
              <li>• <code className="bg-muted px-1 py-0.5 rounded">px-4 py-4</code></li>
              <li>• <code className="bg-muted px-1 py-0.5 rounded">px-6 py-4</code></li>
            </ul>
          </div>

          <div className="rounded-lg border border-border p-4 space-y-2">
            <h3 className="text-sm font-medium">Effects</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• <code className="bg-muted px-1 py-0.5 rounded">shadow-sm</code> → var(--shadow-sm)</li>
              <li>• <code className="bg-muted px-1 py-0.5 rounded">rounded-xl</code> → var(--radius-xl)</li>
              <li>• <code className="bg-muted px-1 py-0.5 rounded">overflow-hidden</code></li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

function CollapsibleSidebarExample() {
  const [teamsOpen, setTeamsOpen] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);

  return (
    <div className="relative flex grow flex-col gap-y-5 overflow-y-auto border-r border-border bg-card px-6 h-[600px] rounded-xl">
      <div className="relative flex h-16 shrink-0 items-center">
        <div className="h-8 w-8 rounded bg-primary" />
      </div>
      <nav className="relative flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              <li>
                <a href="#" className="bg-accent group flex gap-x-3 rounded-md p-2 text-sm font-semibold text-foreground">
                  <Home aria-hidden="true" className="text-muted-foreground h-6 w-6 shrink-0" />
                  Dashboard
                </a>
              </li>
              <li>
                <Collapsible open={teamsOpen} onOpenChange={setTeamsOpen}>
                  <CollapsibleTrigger className="hover:bg-accent group flex w-full items-center gap-x-3 rounded-md p-2 text-left text-sm font-semibold text-foreground">
                    <Users aria-hidden="true" className="text-muted-foreground h-6 w-6 shrink-0" />
                    Teams
                    <ChevronRight aria-hidden="true" className="ml-auto h-5 w-5 shrink-0 text-muted-foreground data-[state=open]:rotate-90 data-[state=open]:text-foreground" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-1 px-2">
                    <ul role="list" className="space-y-1">
                      <li>
                        <a href="#" className="hover:bg-accent block rounded-md py-2 pr-2 pl-9 text-sm text-foreground">
                          Engineering
                        </a>
                      </li>
                      <li>
                        <a href="#" className="hover:bg-accent block rounded-md py-2 pr-2 pl-9 text-sm text-foreground">
                          Human Resources
                        </a>
                      </li>
                    </ul>
                  </CollapsibleContent>
                </Collapsible>
              </li>
              <li>
                <Collapsible open={projectsOpen} onOpenChange={setProjectsOpen}>
                  <CollapsibleTrigger className="hover:bg-accent group flex w-full items-center gap-x-3 rounded-md p-2 text-left text-sm font-semibold text-foreground">
                    <Folder aria-hidden="true" className="text-muted-foreground h-6 w-6 shrink-0" />
                    Projects
                    <ChevronRight aria-hidden="true" className="ml-auto h-5 w-5 shrink-0 text-muted-foreground data-[state=open]:rotate-90 data-[state=open]:text-foreground" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-1 px-2">
                    <ul role="list" className="space-y-1">
                      <li>
                        <a href="#" className="hover:bg-accent block rounded-md py-2 pr-2 pl-9 text-sm text-foreground">
                          GraphQL API
                        </a>
                      </li>
                      <li>
                        <a href="#" className="hover:bg-accent block rounded-md py-2 pr-2 pl-9 text-sm text-foreground">
                          iOS App
                        </a>
                      </li>
                    </ul>
                  </CollapsibleContent>
                </Collapsible>
              </li>
            </ul>
          </li>
          <li className="-mx-6 mt-auto">
            <a href="#" className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold text-foreground hover:bg-accent">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=256&h=256&fit=crop" />
                <AvatarFallback>TC</AvatarFallback>
              </Avatar>
              <span aria-hidden="true">Tom Cook</span>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
}