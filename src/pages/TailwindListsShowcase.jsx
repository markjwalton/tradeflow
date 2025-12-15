import React, { useState } from 'react';
import { PageHeader } from '@/components/sturij/PageHeader';
import { ChevronLeft, ChevronRight, ArrowLeft, ArrowRight, ChevronDown, User, Building, Users, CreditCard, Home, Folder, Calendar as CalendarIcon, FileText, BarChart3, Check, CheckCircle2, Search, FolderPlus, Hash, Tag, Globe, Frown, AlertTriangle, LifeBuoy, PenSquare, Code, Image, Video, Table, X, MoreVertical, Heart, Plus, Link2, HelpCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

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

      {/* Step Indicators / Progress */}
      <section className="space-y-8 mt-12 pt-8 border-t border-border">
        <div>
          <h2 className="text-xl font-display mb-2">Step Indicators / Progress</h2>
          <p className="text-sm text-muted-foreground">Multi-step progress indicators for forms and processes</p>
        </div>

        {/* Simple Bar Steps */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Simple Bar with Labels</h3>
          <nav aria-label="Progress" className="max-w-2xl">
            <ol role="list" className="space-y-4 md:flex md:space-y-0 md:space-x-8">
              <li className="md:flex-1">
                <a href="#" className="group flex flex-col border-l-4 border-primary py-2 pl-4 hover:border-primary-700 md:border-t-4 md:border-l-0 md:pt-4 md:pb-0 md:pl-0">
                  <span className="text-sm font-medium text-primary group-hover:text-primary-700">Step 1</span>
                  <span className="text-sm font-medium text-foreground">Job details</span>
                </a>
              </li>
              <li className="md:flex-1">
                <a href="#" aria-current="step" className="flex flex-col border-l-4 border-primary py-2 pl-4 md:border-t-4 md:border-l-0 md:pt-4 md:pb-0 md:pl-0">
                  <span className="text-sm font-medium text-primary">Step 2</span>
                  <span className="text-sm font-medium text-foreground">Application form</span>
                </a>
              </li>
              <li className="md:flex-1">
                <a href="#" className="group flex flex-col border-l-4 border-border py-2 pl-4 hover:border-muted-foreground md:border-t-4 md:border-l-0 md:pt-4 md:pb-0 md:pl-0">
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">Step 3</span>
                  <span className="text-sm font-medium text-foreground">Preview</span>
                </a>
              </li>
            </ol>
          </nav>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Complete/current: <code className="bg-background px-1 py-0.5 rounded">border-primary</code></li>
              <li>• Upcoming: <code className="bg-background px-1 py-0.5 rounded">border-border hover:border-muted-foreground</code></li>
              <li>• Responsive: <code className="bg-background px-1 py-0.5 rounded">border-l-4 md:border-t-4 md:border-l-0</code></li>
            </ul>
          </div>
        </div>

        {/* Panels with Arrows */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Panels with Arrows</h3>
          <nav aria-label="Progress">
            <ol role="list" className="divide-y divide-border rounded-md border border-border md:flex md:divide-y-0">
              <li className="relative md:flex md:flex-1">
                <a href="#" className="group flex w-full items-center">
                  <span className="flex items-center px-6 py-4 text-sm font-medium">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary group-hover:bg-primary-700">
                      <Check aria-hidden="true" className="h-6 w-6 text-white" />
                    </span>
                    <span className="ml-4 text-sm font-medium text-foreground">Job details</span>
                  </span>
                </a>
                <div aria-hidden="true" className="absolute top-0 right-0 hidden h-full w-5 md:block">
                  <svg fill="none" viewBox="0 0 22 80" preserveAspectRatio="none" className="h-full w-full text-border">
                    <path d="M0 -2L20 40L0 82" stroke="currentcolor" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
                  </svg>
                </div>
              </li>
              <li className="relative md:flex md:flex-1">
                <a href="#" aria-current="step" className="flex items-center px-6 py-4 text-sm font-medium">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-primary">
                    <span className="text-primary">02</span>
                  </span>
                  <span className="ml-4 text-sm font-medium text-primary">Application form</span>
                </a>
                <div aria-hidden="true" className="absolute top-0 right-0 hidden h-full w-5 md:block">
                  <svg fill="none" viewBox="0 0 22 80" preserveAspectRatio="none" className="h-full w-full text-border">
                    <path d="M0 -2L20 40L0 82" stroke="currentcolor" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
                  </svg>
                </div>
              </li>
              <li className="relative md:flex md:flex-1">
                <a href="#" className="group flex items-center">
                  <span className="flex items-center px-6 py-4 text-sm font-medium">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-border group-hover:border-muted-foreground">
                      <span className="text-muted-foreground group-hover:text-foreground">03</span>
                    </span>
                    <span className="ml-4 text-sm font-medium text-muted-foreground group-hover:text-foreground">Preview</span>
                  </span>
                </a>
              </li>
            </ol>
          </nav>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Step circles: <code className="bg-background px-1 py-0.5 rounded">h-10 w-10 rounded-full</code></li>
              <li>• SVG arrows: <code className="bg-background px-1 py-0.5 rounded">absolute right-0 h-full w-5</code></li>
            </ul>
          </div>
        </div>

        {/* Dots with Counter */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Dots with Counter</h3>
          <nav aria-label="Progress" className="flex items-center justify-center">
            <p className="text-sm font-medium text-foreground">Step 2 of 4</p>
            <ol role="list" className="ml-8 flex items-center space-x-5">
              <li>
                <a href="#" className="block h-2.5 w-2.5 rounded-full bg-primary hover:bg-primary-700">
                  <span className="sr-only">Step 1</span>
                </a>
              </li>
              <li>
                <a href="#" aria-current="step" className="relative flex items-center justify-center">
                  <span aria-hidden="true" className="absolute flex h-5 w-5 p-px">
                    <span className="h-full w-full rounded-full bg-primary-100" />
                  </span>
                  <span aria-hidden="true" className="relative block h-2.5 w-2.5 rounded-full bg-primary" />
                  <span className="sr-only">Step 2</span>
                </a>
              </li>
              <li>
                <a href="#" className="block h-2.5 w-2.5 rounded-full bg-border hover:bg-muted-foreground">
                  <span className="sr-only">Step 3</span>
                </a>
              </li>
              <li>
                <a href="#" className="block h-2.5 w-2.5 rounded-full bg-border hover:bg-muted-foreground">
                  <span className="sr-only">Step 4</span>
                </a>
              </li>
            </ol>
          </nav>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Minimal dot style: <code className="bg-background px-1 py-0.5 rounded">h-2.5 w-2.5 rounded-full</code></li>
              <li>• Current with pulse: <code className="bg-background px-1 py-0.5 rounded">absolute h-5 w-5 bg-primary-100</code></li>
            </ul>
          </div>
        </div>

        {/* Circles with Lines (Horizontal) */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Circles with Connecting Lines</h3>
          <nav aria-label="Progress">
            <ol role="list" className="flex items-center">
              <li className="relative pr-8 sm:pr-20">
                <div aria-hidden="true" className="absolute inset-0 flex items-center">
                  <div className="h-0.5 w-full bg-primary" />
                </div>
                <a href="#" className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary hover:bg-primary-700">
                  <Check aria-hidden="true" className="h-5 w-5 text-white" />
                  <span className="sr-only">Step 1</span>
                </a>
              </li>
              <li className="relative pr-8 sm:pr-20">
                <div aria-hidden="true" className="absolute inset-0 flex items-center">
                  <div className="h-0.5 w-full bg-primary" />
                </div>
                <a href="#" className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary hover:bg-primary-700">
                  <Check aria-hidden="true" className="h-5 w-5 text-white" />
                  <span className="sr-only">Step 2</span>
                </a>
              </li>
              <li className="relative pr-8 sm:pr-20">
                <div aria-hidden="true" className="absolute inset-0 flex items-center">
                  <div className="h-0.5 w-full bg-border" />
                </div>
                <a href="#" aria-current="step" className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-background">
                  <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-primary" />
                  <span className="sr-only">Step 3</span>
                </a>
              </li>
              <li className="relative pr-8 sm:pr-20">
                <div aria-hidden="true" className="absolute inset-0 flex items-center">
                  <div className="h-0.5 w-full bg-border" />
                </div>
                <a href="#" className="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-border bg-background hover:border-muted-foreground">
                  <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-transparent group-hover:bg-muted-foreground" />
                  <span className="sr-only">Step 4</span>
                </a>
              </li>
              <li className="relative">
                <div aria-hidden="true" className="absolute inset-0 flex items-center">
                  <div className="h-0.5 w-full bg-border" />
                </div>
                <a href="#" className="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-border bg-background hover:border-muted-foreground">
                  <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-transparent group-hover:bg-muted-foreground" />
                  <span className="sr-only">Step 5</span>
                </a>
              </li>
            </ol>
          </nav>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Connecting lines: <code className="bg-background px-1 py-0.5 rounded">absolute inset-0 h-0.5 bg-primary</code></li>
              <li>• Complete: <code className="bg-background px-1 py-0.5 rounded">bg-primary</code> circles with check icons</li>
            </ul>
          </div>
        </div>

        {/* Simple Vertical */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Simple Vertical with Check Circles</h3>
          <div className="px-4 py-12">
            <nav aria-label="Progress" className="flex justify-center">
              <ol role="list" className="space-y-6">
                <li>
                  <a href="#" className="group">
                    <span className="flex items-start">
                      <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                        <CheckCircle2 aria-hidden="true" className="h-full w-full text-primary group-hover:text-primary-700" />
                      </span>
                      <span className="ml-3 text-sm font-medium text-muted-foreground group-hover:text-foreground">
                        Create account
                      </span>
                    </span>
                  </a>
                </li>
                <li>
                  <a href="#" aria-current="step" className="flex items-start">
                    <span aria-hidden="true" className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                      <span className="absolute h-4 w-4 rounded-full bg-primary-100" />
                      <span className="relative block h-2 w-2 rounded-full bg-primary" />
                    </span>
                    <span className="ml-3 text-sm font-medium text-primary">Profile information</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="group">
                    <div className="flex items-start">
                      <div aria-hidden="true" className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-border group-hover:bg-muted-foreground" />
                      </div>
                      <p className="ml-3 text-sm font-medium text-muted-foreground group-hover:text-foreground">Theme</p>
                    </div>
                  </a>
                </li>
                <li>
                  <a href="#" className="group">
                    <div className="flex items-start">
                      <div aria-hidden="true" className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-border group-hover:bg-muted-foreground" />
                      </div>
                      <p className="ml-3 text-sm font-medium text-muted-foreground group-hover:text-foreground">Preview</p>
                    </div>
                  </a>
                </li>
              </ol>
            </nav>
          </div>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• CheckCircle2 icon from Lucide for completed steps</li>
              <li>• Pulse effect on current: <code className="bg-background px-1 py-0.5 rounded">absolute h-4 w-4 bg-primary-100</code></li>
            </ul>
          </div>
        </div>

        {/* Vertical with Descriptions */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Vertical with Descriptions</h3>
          <nav aria-label="Progress">
            <ol role="list" className="overflow-hidden">
              <li className="relative pb-10">
                <div aria-hidden="true" className="absolute top-4 left-4 mt-0.5 -ml-px h-full w-0.5 bg-primary" />
                <a href="#" className="group relative flex items-start">
                  <span className="flex h-9 items-center">
                    <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-primary group-hover:bg-primary-700">
                      <Check aria-hidden="true" className="h-5 w-5 text-white" />
                    </span>
                  </span>
                  <span className="ml-4 flex min-w-0 flex-col">
                    <span className="text-sm font-medium text-foreground">Create account</span>
                    <span className="text-sm text-muted-foreground">Vitae sed mi luctus laoreet.</span>
                  </span>
                </a>
              </li>
              <li className="relative pb-10">
                <div aria-hidden="true" className="absolute top-4 left-4 mt-0.5 -ml-px h-full w-0.5 bg-border" />
                <a href="#" aria-current="step" className="group relative flex items-start">
                  <span aria-hidden="true" className="flex h-9 items-center">
                    <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-background">
                      <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                    </span>
                  </span>
                  <span className="ml-4 flex min-w-0 flex-col">
                    <span className="text-sm font-medium text-primary">Profile information</span>
                    <span className="text-sm text-muted-foreground">Cursus semper viverra facilisis.</span>
                  </span>
                </a>
              </li>
              <li className="relative pb-10">
                <div aria-hidden="true" className="absolute top-4 left-4 mt-0.5 -ml-px h-full w-0.5 bg-border" />
                <a href="#" className="group relative flex items-start">
                  <span aria-hidden="true" className="flex h-9 items-center">
                    <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-border bg-background group-hover:border-muted-foreground">
                      <span className="h-2.5 w-2.5 rounded-full bg-transparent group-hover:bg-muted-foreground" />
                    </span>
                  </span>
                  <span className="ml-4 flex min-w-0 flex-col">
                    <span className="text-sm font-medium text-muted-foreground">Business information</span>
                    <span className="text-sm text-muted-foreground">Penatibus eu quis ante.</span>
                  </span>
                </a>
              </li>
              <li className="relative">
                <a href="#" className="group relative flex items-start">
                  <span aria-hidden="true" className="flex h-9 items-center">
                    <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-border bg-background group-hover:border-muted-foreground">
                      <span className="h-2.5 w-2.5 rounded-full bg-transparent group-hover:bg-muted-foreground" />
                    </span>
                  </span>
                  <span className="ml-4 flex min-w-0 flex-col">
                    <span className="text-sm font-medium text-muted-foreground">Preview</span>
                    <span className="text-sm text-muted-foreground">Iusto et officia maiores.</span>
                  </span>
                </a>
              </li>
            </ol>
          </nav>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Connecting lines: <code className="bg-background px-1 py-0.5 rounded">absolute w-0.5 h-full bg-primary</code></li>
              <li>• Two-line layout with <code className="bg-background px-1 py-0.5 rounded">flex-col</code> for name and description</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Command Palettes / Search Modals */}
      <section className="space-y-8 mt-12 pt-8 border-t border-border">
        <div>
          <h2 className="text-xl font-display mb-2">Command Palettes / Search Modals</h2>
          <p className="text-sm text-muted-foreground">Modal search interfaces for quick navigation and actions</p>
        </div>

        {/* Simple Search Modal */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Simple Search Modal</h3>
          <div className="max-w-xl mx-auto transform divide-y divide-border overflow-hidden rounded-xl bg-card shadow-2xl border border-border">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search..." className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-foreground placeholder:text-muted-foreground focus-visible:ring-0" />
            </div>
            <div className="max-h-72 overflow-y-auto py-2 text-sm">
              <div className="cursor-default px-4 py-2 hover:bg-primary hover:text-primary-foreground">Leslie Alexander</div>
              <div className="cursor-default px-4 py-2 hover:bg-primary hover:text-primary-foreground">Michael Foster</div>
              <div className="cursor-default px-4 py-2 hover:bg-primary hover:text-primary-foreground">Dries Vincent</div>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Modal: <code className="bg-background px-1 py-0.5 rounded">bg-card border shadow-2xl rounded-xl</code></li>
              <li>• Results hover: <code className="bg-background px-1 py-0.5 rounded">hover:bg-primary hover:text-primary-foreground</code></li>
            </ul>
          </div>
        </div>

        {/* Rounded Input Style */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Rounded Input with Empty State</h3>
          <div className="max-w-xl mx-auto transform rounded-xl bg-card p-2 shadow-2xl border border-border">
            <Input placeholder="Search..." className="w-full rounded-md bg-muted px-4 py-2.5 border-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-0" />
            <div className="px-4 py-14 text-center sm:px-14">
              <Users className="mx-auto h-6 w-6 text-muted-foreground" />
              <p className="mt-4 text-sm text-foreground">No people found using that search term.</p>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Rounded input: <code className="bg-background px-1 py-0.5 rounded">bg-muted rounded-md</code></li>
              <li>• Empty state icon: <code className="bg-background px-1 py-0.5 rounded">text-muted-foreground h-6 w-6</code></li>
            </ul>
          </div>
        </div>

        {/* With Icon Items */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">With Colored Icon Items</h3>
          <div className="max-w-xl mx-auto transform divide-y divide-border overflow-hidden rounded-xl bg-card shadow-2xl border border-border">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search..." className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-foreground placeholder:text-muted-foreground focus-visible:ring-0" />
            </div>
            <div className="max-h-96 overflow-y-auto p-3">
              <div className="group flex cursor-default rounded-xl p-3 hover:bg-accent">
                <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-primary">
                  <PenSquare className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4 flex-auto">
                  <p className="text-sm font-medium text-foreground group-hover:text-foreground">Text</p>
                  <p className="text-sm text-muted-foreground group-hover:text-foreground">Add freeform text with basic formatting.</p>
                </div>
              </div>
              <div className="group flex cursor-default rounded-xl p-3 hover:bg-accent">
                <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-secondary">
                  <Image className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4 flex-auto">
                  <p className="text-sm font-medium text-foreground group-hover:text-foreground">Image</p>
                  <p className="text-sm text-muted-foreground group-hover:text-foreground">Embed an image from your computer.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Icon containers: <code className="bg-background px-1 py-0.5 rounded">h-10 w-10 rounded-lg bg-primary</code></li>
              <li>• Item hover: <code className="bg-background px-1 py-0.5 rounded">hover:bg-accent rounded-xl</code></li>
            </ul>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">With Quick Actions & Shortcuts</h3>
          <div className="max-w-2xl mx-auto transform divide-y divide-border overflow-hidden rounded-xl bg-card shadow-2xl border border-border">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search..." className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-foreground placeholder:text-muted-foreground focus-visible:ring-0" />
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-border">
              <div className="p-2">
                <h2 className="mt-4 mb-2 px-3 text-xs font-semibold text-muted-foreground">Recent searches</h2>
                <div className="text-sm">
                  <div className="group flex cursor-default items-center rounded-md px-3 py-2 hover:bg-primary hover:text-primary-foreground">
                    <Folder className="h-6 w-6 flex-none text-muted-foreground group-hover:text-primary-foreground" />
                    <span className="ml-3 flex-auto truncate">Workflow Inc. / Website Redesign</span>
                  </div>
                </div>
              </div>
              <div className="p-2">
                <h2 className="sr-only">Quick actions</h2>
                <div className="text-sm">
                  <div className="group flex cursor-default items-center rounded-md px-3 py-2 hover:bg-primary hover:text-primary-foreground">
                    <FolderPlus className="h-6 w-6 flex-none text-muted-foreground group-hover:text-primary-foreground" />
                    <span className="ml-3 flex-auto truncate">Add new folder...</span>
                    <span className="ml-3 flex-none text-xs font-semibold text-muted-foreground group-hover:text-primary-foreground/80">
                      <kbd className="font-sans">⌘</kbd>
                      <kbd className="font-sans">F</kbd>
                    </span>
                  </div>
                  <div className="group flex cursor-default items-center rounded-md px-3 py-2 hover:bg-primary hover:text-primary-foreground">
                    <Hash className="h-6 w-6 flex-none text-muted-foreground group-hover:text-primary-foreground" />
                    <span className="ml-3 flex-auto truncate">Add hashtag...</span>
                    <span className="ml-3 flex-none text-xs font-semibold text-muted-foreground group-hover:text-primary-foreground/80">
                      <kbd className="font-sans">⌘</kbd>
                      <kbd className="font-sans">H</kbd>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Section headers: <code className="bg-background px-1 py-0.5 rounded">text-xs font-semibold text-muted-foreground</code></li>
              <li>• Keyboard shortcuts: <code className="bg-background px-1 py-0.5 rounded">kbd font-sans text-xs</code></li>
            </ul>
          </div>
        </div>

        {/* Backdrop Blur */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">With Backdrop Blur</h3>
          <div className="max-w-2xl mx-auto transform divide-y divide-border/50 overflow-hidden rounded-xl bg-card/80 backdrop-blur-sm shadow-2xl border border-border">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-foreground/40" />
              <Input placeholder="Search..." className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-foreground placeholder:text-muted-foreground focus-visible:ring-0" />
            </div>
            <div className="p-2">
              <h2 className="mt-4 mb-2 px-3 text-xs font-semibold text-foreground">Recent searches</h2>
              <div className="text-sm">
                <div className="group flex cursor-default items-center rounded-md px-3 py-2 hover:bg-foreground/5">
                  <Folder className="h-6 w-6 flex-none text-foreground/40 group-hover:text-foreground" />
                  <span className="ml-3 flex-auto truncate">Workflow Inc. / Website Redesign</span>
                  <span className="ml-3 hidden flex-none text-muted-foreground group-hover:inline">Jump to...</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Backdrop: <code className="bg-background px-1 py-0.5 rounded">bg-card/80 backdrop-blur-sm</code></li>
              <li>• Subtle hover: <code className="bg-background px-1 py-0.5 rounded">hover:bg-foreground/5</code></li>
            </ul>
          </div>
        </div>

        {/* Empty State Message */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">With Initial Empty State</h3>
          <div className="max-w-xl mx-auto transform overflow-hidden rounded-xl bg-card shadow-2xl border border-border">
            <div className="relative border-b border-border">
              <Search className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search..." className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-foreground placeholder:text-muted-foreground focus-visible:ring-0" />
            </div>
            <div className="px-6 py-14 text-center text-sm">
              <Globe className="mx-auto h-6 w-6 text-muted-foreground" />
              <p className="mt-4 font-semibold text-foreground">Search for clients and projects</p>
              <p className="mt-2 text-muted-foreground">Quickly access clients and projects by running a global search.</p>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Empty state: <code className="bg-background px-1 py-0.5 rounded">py-14 text-center</code></li>
              <li>• Icon: <code className="bg-background px-1 py-0.5 rounded">h-6 w-6 text-muted-foreground</code></li>
            </ul>
          </div>
        </div>

        {/* Grouped Results */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">With Grouped Results</h3>
          <div className="max-w-xl mx-auto transform overflow-hidden rounded-xl bg-card shadow-2xl border border-border">
            <div className="relative border-b border-border">
              <Search className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search..." className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-foreground placeholder:text-muted-foreground focus-visible:ring-0" />
            </div>
            <div className="max-h-80 overflow-y-auto space-y-2 pb-2">
              <div>
                <h2 className="bg-muted px-4 py-2.5 text-xs font-semibold text-foreground">Clients</h2>
                <div className="mt-2 text-sm">
                  <div className="cursor-default px-4 py-2 hover:bg-primary hover:text-primary-foreground">Workflow Inc.</div>
                  <div className="cursor-default px-4 py-2 hover:bg-primary hover:text-primary-foreground">Acme Corp.</div>
                </div>
              </div>
              <div>
                <h2 className="bg-muted px-4 py-2.5 text-xs font-semibold text-foreground">Projects</h2>
                <div className="mt-2 text-sm">
                  <div className="cursor-default px-4 py-2 hover:bg-primary hover:text-primary-foreground">Website Redesign</div>
                  <div className="cursor-default px-4 py-2 hover:bg-primary hover:text-primary-foreground">Mobile App</div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Group headers: <code className="bg-background px-1 py-0.5 rounded">bg-muted text-xs font-semibold</code></li>
              <li>• Spacing: <code className="bg-background px-1 py-0.5 rounded">space-y-2</code> between groups</li>
            </ul>
          </div>
        </div>

        {/* Search Modifiers */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">With Search Modifiers</h3>
          <div className="max-w-xl mx-auto transform divide-y divide-border overflow-hidden rounded-xl bg-card shadow-2xl border border-border">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search..." className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-foreground placeholder:text-muted-foreground focus-visible:ring-0" />
            </div>
            <div className="max-h-80 overflow-y-auto space-y-4 p-4 pb-2">
              <div>
                <h2 className="text-xs font-semibold text-foreground">Projects</h2>
                <div className="-mx-4 mt-2 text-sm">
                  <div className="group flex cursor-default items-center px-4 py-2 hover:bg-primary hover:text-primary-foreground">
                    <Folder className="h-6 w-6 flex-none text-muted-foreground group-hover:text-primary-foreground" />
                    <span className="ml-3 flex-auto truncate">Website Redesign</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center bg-muted px-4 py-2.5 text-xs text-foreground">
              Type <kbd className="mx-1 flex h-5 w-5 items-center justify-center rounded-sm border border-border bg-background font-semibold sm:mx-2">#</kbd> for projects,
              <kbd className="mx-1 flex h-5 w-5 items-center justify-center rounded-sm border border-border bg-background font-semibold sm:mx-2">&gt;</kbd> for users, and
              <kbd className="mx-1 flex h-5 w-5 items-center justify-center rounded-sm border border-border bg-background font-semibold sm:mx-2">?</kbd> for help.
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Footer: <code className="bg-background px-1 py-0.5 rounded">bg-muted px-4 py-2.5 text-xs</code></li>
              <li>• Kbd keys: <code className="bg-background px-1 py-0.5 rounded">h-5 w-5 rounded-sm border bg-background</code></li>
            </ul>
          </div>
        </div>
      </section>

      {/* Modals / Dialogs */}
      <section className="space-y-8 mt-12 pt-8 border-t border-border">
        <div>
          <h2 className="text-xl font-display mb-2">Modals / Dialogs</h2>
          <p className="text-sm text-muted-foreground">Modal dialog patterns for confirmations and actions</p>
        </div>

        {/* Success Modal - Single Button */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Success Modal - Centered Icon</h3>
          <div className="max-w-sm mx-auto transform overflow-hidden rounded-lg bg-card px-4 pt-5 pb-4 text-left shadow-xl border border-border sm:p-6">
            <div>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success-50">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <div className="mt-3 text-center sm:mt-5">
                <h3 className="text-base font-semibold text-foreground">Payment successful</h3>
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-6">
              <Button className="w-full">Go back to dashboard</Button>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Icon bg: <code className="bg-background px-1 py-0.5 rounded">bg-success-50</code></li>
              <li>• Icon: <code className="bg-background px-1 py-0.5 rounded">text-success h-6 w-6</code></li>
            </ul>
          </div>
        </div>

        {/* Success Modal - Two Buttons */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Success Modal - Two Buttons</h3>
          <div className="max-w-lg mx-auto transform overflow-hidden rounded-lg bg-card px-4 pt-5 pb-4 text-left shadow-xl border border-border sm:p-6">
            <div>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success-50">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <div className="mt-3 text-center sm:mt-5">
                <h3 className="text-base font-semibold text-foreground">Payment successful</h3>
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eius aliquam laudantium explicabo pariatur.</p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
              <Button className="w-full sm:col-start-2">Deactivate</Button>
              <Button variant="outline" className="w-full mt-3 sm:col-start-1 sm:mt-0">Cancel</Button>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Button grid: <code className="bg-background px-1 py-0.5 rounded">sm:grid sm:grid-cols-2 sm:gap-3</code></li>
              <li>• Flow: <code className="bg-background px-1 py-0.5 rounded">sm:grid-flow-row-dense</code> for reverse order</li>
            </ul>
          </div>
        </div>

        {/* Warning Modal - Icon Left */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Warning Modal - Icon Left Aligned</h3>
          <div className="max-w-lg mx-auto transform overflow-hidden rounded-lg bg-card px-4 pt-5 pb-4 text-left shadow-xl border border-border sm:p-6">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-destructive-50 sm:mx-0 sm:h-10 sm:w-10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-base font-semibold text-foreground">Deactivate account</h3>
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">Are you sure you want to deactivate your account? All of your data will be permanently removed from our servers forever.</p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <Button variant="destructive" className="w-full sm:ml-3 sm:w-auto">Deactivate</Button>
              <Button variant="outline" className="w-full mt-3 sm:mt-0 sm:w-auto">Cancel</Button>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Warning bg: <code className="bg-background px-1 py-0.5 rounded">bg-destructive-50</code></li>
              <li>• Warning icon: <code className="bg-background px-1 py-0.5 rounded">text-destructive</code></li>
              <li>• Layout: <code className="bg-background px-1 py-0.5 rounded">sm:flex sm:items-start</code></li>
            </ul>
          </div>
        </div>

        {/* Modal with Close Button */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">With Close Button</h3>
          <div className="max-w-lg mx-auto relative transform overflow-hidden rounded-lg bg-card px-4 pt-5 pb-4 text-left shadow-xl border border-border sm:p-6">
            <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
              <button type="button" className="rounded-md bg-card text-muted-foreground hover:text-foreground">
                <span className="sr-only">Close</span>
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-destructive-50 sm:mx-0 sm:h-10 sm:w-10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-base font-semibold text-foreground">Deactivate account</h3>
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">Are you sure you want to deactivate your account? All of your data will be permanently removed.</p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <Button variant="destructive" className="w-full sm:ml-3 sm:w-auto">Deactivate</Button>
              <Button variant="outline" className="w-full mt-3 sm:mt-0 sm:w-auto">Cancel</Button>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Close button: <code className="bg-background px-1 py-0.5 rounded">absolute top-0 right-0 pt-4 pr-4</code></li>
              <li>• Hidden on mobile: <code className="bg-background px-1 py-0.5 rounded">hidden sm:block</code></li>
            </ul>
          </div>
        </div>

        {/* Modal with Gray Footer */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">With Colored Footer</h3>
          <div className="max-w-lg mx-auto transform overflow-hidden rounded-lg bg-card text-left shadow-xl border border-border">
            <div className="bg-card px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-destructive-50 sm:mx-0 sm:h-10 sm:w-10">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-base font-semibold text-foreground">Deactivate account</h3>
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground">Are you sure you want to deactivate your account? All of your data will be permanently removed.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-muted px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <Button variant="destructive" className="w-full sm:ml-3 sm:w-auto">Deactivate</Button>
              <Button variant="outline" className="w-full mt-3 sm:mt-0 sm:w-auto">Cancel</Button>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Footer bg: <code className="bg-background px-1 py-0.5 rounded">bg-muted</code></li>
              <li>• Separate content/footer sections with different backgrounds</li>
            </ul>
          </div>
        </div>

        {/* Modal with Indented Buttons */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">With Indented Buttons</h3>
          <div className="max-w-lg mx-auto transform overflow-hidden rounded-lg bg-card px-4 pt-5 pb-4 text-left shadow-xl border border-border sm:p-6">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-destructive-50 sm:mx-0 sm:h-10 sm:w-10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-base font-semibold text-foreground">Deactivate account</h3>
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">Are you sure you want to deactivate your account? All of your data will be permanently removed from our servers forever.</p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:ml-10 sm:flex sm:pl-4">
              <Button variant="destructive" className="w-full sm:w-auto">Deactivate</Button>
              <Button variant="outline" className="w-full mt-3 sm:mt-0 sm:ml-3 sm:w-auto">Cancel</Button>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Button alignment: <code className="bg-background px-1 py-0.5 rounded">sm:ml-10 sm:pl-4</code> to align with text</li>
              <li>• Creates visual hierarchy with indented action buttons</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Slide-over Panels / Drawers */}
      <section className="space-y-8 mt-12 pt-8 border-t border-border">
        <div>
          <h2 className="text-xl font-display mb-2">Slide-over Panels / Drawers</h2>
          <p className="text-sm text-muted-foreground">Side panels for detailed views and forms</p>
        </div>

        {/* Simple Narrow Panel */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Simple Narrow Panel</h3>
          <div className="h-96 border border-border rounded-lg bg-muted/30 relative overflow-hidden">
            <div className="absolute inset-y-0 right-0 w-96 bg-card shadow-xl border-l border-border">
              <div className="relative flex h-full flex-col overflow-y-auto py-6">
                <div className="px-4 sm:px-6">
                  <div className="flex items-start justify-between">
                    <h2 className="text-base font-semibold text-foreground">Panel title</h2>
                    <button className="ml-3 rounded-md text-muted-foreground hover:text-foreground">
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>
                <div className="relative mt-6 flex-1 px-4 sm:px-6">
                  <p className="text-sm text-muted-foreground">Content goes here...</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Uses shadcn/ui <code className="bg-background px-1 py-0.5 rounded">Sheet</code> component</li>
              <li>• Max width: <code className="bg-background px-1 py-0.5 rounded">max-w-md</code> (28rem)</li>
            </ul>
          </div>
        </div>

        {/* Wide Panel */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Wide Panel (2xl)</h3>
          <div className="h-96 border border-border rounded-lg bg-muted/30 relative overflow-hidden">
            <div className="absolute inset-y-0 right-0 max-w-2xl w-full bg-card shadow-xl border-l border-border">
              <div className="relative flex h-full flex-col overflow-y-auto py-6">
                <div className="px-4 sm:px-6">
                  <div className="flex items-start justify-between">
                    <h2 className="text-base font-semibold text-foreground">Panel title</h2>
                    <button className="ml-3 rounded-md text-muted-foreground hover:text-foreground">
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>
                <div className="relative mt-6 flex-1 px-4 sm:px-6">
                  <p className="text-sm text-muted-foreground">Wide panel for detailed content...</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Max width: <code className="bg-background px-1 py-0.5 rounded">max-w-2xl</code> (42rem)</li>
            </ul>
          </div>
        </div>

        {/* With Colored Header */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">With Colored Header</h3>
          <div className="h-96 border border-border rounded-lg bg-muted/30 relative overflow-hidden">
            <div className="absolute inset-y-0 right-0 w-96 bg-card shadow-xl">
              <div className="relative flex h-full flex-col overflow-y-auto">
                <div className="bg-primary px-4 py-6 sm:px-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-primary-foreground">Panel title</h2>
                    <button className="ml-3 rounded-md text-primary-foreground/70 hover:text-primary-foreground">
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-primary-foreground/80">Description text here</p>
                </div>
                <div className="relative flex-1 px-4 py-6 sm:px-6">
                  <p className="text-sm text-muted-foreground">Content...</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Header: <code className="bg-background px-1 py-0.5 rounded">bg-primary text-primary-foreground</code></li>
              <li>• Description: <code className="bg-background px-1 py-0.5 rounded">text-primary-foreground/80</code></li>
            </ul>
          </div>
        </div>

        {/* With Footer Actions */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">With Sticky Footer</h3>
          <div className="h-96 border border-border rounded-lg bg-muted/30 relative overflow-hidden">
            <div className="absolute inset-y-0 right-0 w-96 bg-card shadow-xl">
              <div className="relative flex h-full flex-col divide-y divide-border">
                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto py-6">
                  <div className="px-4 sm:px-6">
                    <div className="flex items-start justify-between">
                      <h2 className="text-base font-semibold text-foreground">Panel title</h2>
                      <button className="ml-3 rounded-md text-muted-foreground hover:text-foreground">
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                  </div>
                  <div className="relative mt-6 flex-1 px-4 sm:px-6">
                    <p className="text-sm text-muted-foreground">Content with scrollable area...</p>
                  </div>
                </div>
                <div className="flex shrink-0 justify-end px-4 py-4 gap-3">
                  <Button variant="outline">Cancel</Button>
                  <Button>Save</Button>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Layout: <code className="bg-background px-1 py-0.5 rounded">flex flex-col divide-y</code></li>
              <li>• Footer: <code className="bg-background px-1 py-0.5 rounded">shrink-0 px-4 py-4</code></li>
            </ul>
          </div>
        </div>

        {/* Form in Panel */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Form with Gray Header</h3>
          <div className="h-[600px] border border-border rounded-lg bg-muted/30 relative overflow-hidden">
            <div className="absolute inset-y-0 right-0 max-w-2xl w-full bg-card shadow-xl">
              <form className="relative flex h-full flex-col overflow-y-auto">
                <div className="flex-1">
                  <div className="bg-muted px-4 py-6 sm:px-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h2 className="text-base font-semibold text-foreground">New project</h2>
                        <p className="text-sm text-muted-foreground">Get started by filling in the information below.</p>
                      </div>
                      <button type="button" className="ml-3 rounded-md text-muted-foreground hover:text-foreground">
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6 py-6 sm:space-y-0 sm:divide-y sm:divide-border sm:py-0">
                    <div className="space-y-2 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                      <Label className="sm:mt-1.5">Project name</Label>
                      <div className="sm:col-span-2">
                        <Input />
                      </div>
                    </div>
                    <div className="space-y-2 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                      <Label className="sm:mt-1.5">Description</Label>
                      <div className="sm:col-span-2">
                        <Textarea rows={3} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 border-t border-border px-4 py-5 sm:px-6">
                  <div className="flex justify-end gap-3">
                    <Button variant="outline">Cancel</Button>
                    <Button type="submit">Create</Button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Header: <code className="bg-background px-1 py-0.5 rounded">bg-muted</code> for subtle background</li>
              <li>• Form grid: <code className="bg-background px-1 py-0.5 rounded">sm:grid sm:grid-cols-3</code></li>
            </ul>
          </div>
        </div>

        {/* Profile Panel */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Profile with Cover Image</h3>
          <div className="h-[600px] border border-border rounded-lg bg-muted/30 relative overflow-hidden">
            <div className="absolute inset-y-0 right-0 w-96 bg-card shadow-xl">
              <div className="relative flex h-full flex-col overflow-y-auto">
                <div className="px-4 py-6 sm:px-6">
                  <div className="flex items-start justify-between">
                    <h2 className="text-base font-semibold text-foreground">Profile</h2>
                    <button className="ml-3 rounded-md text-muted-foreground hover:text-foreground">
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>
                <div>
                  <div className="pb-1 sm:pb-6">
                    <div className="relative h-40 sm:h-56 bg-gradient-primary" />
                    <div className="mt-6 px-4 sm:mt-8 sm:flex sm:items-end sm:px-6">
                      <div className="sm:flex-1">
                        <div className="flex items-center">
                          <h3 className="text-xl font-bold text-foreground sm:text-2xl">Ashley Porter</h3>
                          <span className="ml-2.5 inline-block h-2 w-2 shrink-0 rounded-full bg-success" />
                        </div>
                        <p className="text-sm text-muted-foreground">@ashleyporter</p>
                        <div className="mt-5 flex gap-3">
                          <Button className="flex-1">Message</Button>
                          <Button variant="outline" className="flex-1">Call</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 pt-5 pb-5 sm:px-6">
                    <dl className="space-y-8 sm:space-y-6">
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Bio</dt>
                        <dd className="mt-1 text-sm text-foreground">Enim feugiat ut ipsum, neque ut.</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Location</dt>
                        <dd className="mt-1 text-sm text-foreground">New York, NY, USA</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Cover: <code className="bg-background px-1 py-0.5 rounded">h-40 sm:h-56 bg-gradient-primary</code></li>
              <li>• Online indicator: <code className="bg-background px-1 py-0.5 rounded">h-2 w-2 rounded-full bg-success</code></li>
            </ul>
          </div>
        </div>

        {/* Team List Panel */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Team List with Tabs</h3>
          <div className="h-[600px] border border-border rounded-lg bg-muted/30 relative overflow-hidden">
            <div className="absolute inset-y-0 right-0 w-96 bg-card shadow-xl">
              <div className="relative flex h-full flex-col overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <h2 className="text-base font-semibold text-foreground">Team</h2>
                    <button className="ml-3 rounded-md text-muted-foreground hover:text-foreground">
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>
                <div className="border-b border-border">
                  <div className="px-6">
                    <nav className="-mb-px flex gap-6">
                      <a href="#" className="border-b-2 border-primary px-1 pb-4 text-sm font-medium text-primary">All</a>
                      <a href="#" className="border-b-2 border-transparent px-1 pb-4 text-sm font-medium text-muted-foreground hover:border-border hover:text-foreground">Online</a>
                    </nav>
                  </div>
                </div>
                <ul className="flex-1 divide-y divide-border overflow-y-auto">
                  <li className="group relative flex items-center px-5 py-6 hover:bg-accent">
                    <div className="flex min-w-0 flex-1 items-center">
                      <span className="relative inline-block shrink-0">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&h=256&fit=crop" />
                          <AvatarFallback>LA</AvatarFallback>
                        </Avatar>
                        <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-success ring-2 ring-card" />
                      </span>
                      <div className="ml-4 truncate">
                        <p className="truncate text-sm font-medium text-foreground">Leslie Alexander</p>
                        <p className="truncate text-sm text-muted-foreground">@lesliealexander</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="ml-2 h-8 w-8">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View profile</DropdownMenuItem>
                        <DropdownMenuItem>Send message</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Tabs: <code className="bg-background px-1 py-0.5 rounded">border-b-2 border-primary</code></li>
              <li>• Status ring: <code className="bg-background px-1 py-0.5 rounded">ring-2 ring-card</code></li>
            </ul>
          </div>
        </div>

        {/* Image Detail Panel */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Image Detail Panel</h3>
          <div className="h-[600px] border border-border rounded-lg bg-muted/30 relative overflow-hidden">
            <div className="absolute inset-y-0 right-0 w-96 bg-card shadow-xl">
              <div className="relative h-full overflow-y-auto p-8">
                <div className="space-y-6">
                  <div>
                    <img src="https://images.unsplash.com/photo-1582053433976-25c00369fc93?w=512&h=360&fit=crop" className="block w-full rounded-lg object-cover aspect-[10/7]" />
                    <div className="mt-4 flex items-start justify-between">
                      <div>
                        <h2 className="text-base font-semibold text-foreground">IMG_4985.HEIC</h2>
                        <p className="text-sm font-medium text-muted-foreground">3.9 MB</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Heart className="h-6 w-6" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Information</h3>
                    <dl className="mt-2 divide-y divide-border border-t border-b border-border">
                      <div className="flex justify-between py-3 text-sm font-medium">
                        <dt className="text-muted-foreground">Uploaded by</dt>
                        <dd className="text-foreground">Marie Culver</dd>
                      </div>
                      <div className="flex justify-between py-3 text-sm font-medium">
                        <dt className="text-muted-foreground">Created</dt>
                        <dd className="text-foreground">June 8, 2020</dd>
                      </div>
                    </dl>
                  </div>
                  <div className="flex gap-3">
                    <Button className="flex-1">Download</Button>
                    <Button variant="outline" className="flex-1">Delete</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Definition list: <code className="bg-background px-1 py-0.5 rounded">divide-y border-t border-b</code></li>
              <li>• Action buttons: <code className="bg-background px-1 py-0.5 rounded">flex-1</code> for equal width</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Notifications / Toasts */}
      <section className="space-y-8 mt-12 pt-8 border-t border-border">
        <div>
          <h2 className="text-xl font-display mb-2">Notifications / Toasts</h2>
          <p className="text-sm text-muted-foreground">Toast notification patterns for user feedback</p>
        </div>

        {/* Success Notification */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Success with Icon</h3>
          <div className="max-w-sm rounded-lg bg-card shadow-lg border border-border p-4">
            <div className="flex items-start">
              <div className="shrink-0">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <div className="ml-3 w-0 flex-1 pt-0.5">
                <p className="text-sm font-medium text-foreground">Successfully saved!</p>
                <p className="mt-1 text-sm text-muted-foreground">Anyone with a link can now view this file.</p>
              </div>
              <div className="ml-4 flex shrink-0">
                <button className="inline-flex rounded-md text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Icon: <code className="bg-background px-1 py-0.5 rounded">CheckCircle2 text-success</code></li>
              <li>• Container: <code className="bg-background px-1 py-0.5 rounded">bg-card shadow-lg border</code></li>
            </ul>
          </div>
        </div>

        {/* Simple with Undo */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">With Undo Action</h3>
          <div className="max-w-sm rounded-lg bg-card shadow-lg border border-border p-4">
            <div className="flex items-center">
              <div className="flex w-0 flex-1 justify-between">
                <p className="w-0 flex-1 text-sm font-medium text-foreground">Discussion archived</p>
                <Button variant="link" size="sm" className="ml-3 shrink-0 h-auto p-0">Undo</Button>
              </div>
              <div className="ml-4 flex shrink-0">
                <button className="inline-flex rounded-md text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Action: <code className="bg-background px-1 py-0.5 rounded">Button variant="link"</code></li>
              <li>• Layout: <code className="bg-background px-1 py-0.5 rounded">flex justify-between</code></li>
            </ul>
          </div>
        </div>

        {/* With Multiple Actions */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">With Multiple Actions</h3>
          <div className="max-w-sm rounded-lg bg-card shadow-lg border border-border p-4">
            <div className="flex items-start">
              <div className="shrink-0">
                <LifeBuoy className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="ml-3 w-0 flex-1 pt-0.5">
                <p className="text-sm font-medium text-foreground">Discussion moved</p>
                <p className="mt-1 text-sm text-muted-foreground">Lorem ipsum dolor sit amet consectetur adipisicing.</p>
                <div className="mt-3 flex gap-7">
                  <Button variant="link" size="sm" className="h-auto p-0">Undo</Button>
                  <Button variant="link" size="sm" className="h-auto p-0 text-muted-foreground">Dismiss</Button>
                </div>
              </div>
              <div className="ml-4 flex shrink-0">
                <button className="inline-flex rounded-md text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Actions: <code className="bg-background px-1 py-0.5 rounded">flex gap-7</code> for spacing</li>
              <li>• Secondary action: <code className="bg-background px-1 py-0.5 rounded">text-muted-foreground</code></li>
            </ul>
          </div>
        </div>

        {/* Message with Avatar */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Message with Avatar</h3>
          <div className="max-w-md flex rounded-lg bg-card shadow-lg border border-border">
            <div className="w-0 flex-1 p-4">
              <div className="flex items-start">
                <div className="shrink-0 pt-0.5">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&h=160&fit=crop" />
                    <AvatarFallback>EG</AvatarFallback>
                  </Avatar>
                </div>
                <div className="ml-3 w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">Emilia Gates</p>
                  <p className="mt-1 text-sm text-muted-foreground">Sure! 8:30pm works great!</p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-border">
              <button className="flex w-full items-center justify-center rounded-none rounded-r-lg p-4 text-sm font-medium text-primary hover:text-primary/80">
                Reply
              </button>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Split layout: <code className="bg-background px-1 py-0.5 rounded">flex with border-l</code></li>
              <li>• Action button: <code className="bg-background px-1 py-0.5 rounded">text-primary</code></li>
            </ul>
          </div>
        </div>

        {/* Stacked Actions */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">With Stacked Actions</h3>
          <div className="max-w-md flex rounded-lg bg-card shadow-lg border border-border divide-x divide-border">
            <div className="flex w-0 flex-1 items-center p-4">
              <div className="w-full">
                <p className="text-sm font-medium text-foreground">Receive notifications</p>
                <p className="mt-1 text-sm text-muted-foreground">Notifications may include alerts, sounds, and badges.</p>
              </div>
            </div>
            <div className="flex">
              <div className="flex flex-col divide-y divide-border">
                <button className="flex flex-1 items-center justify-center rounded-none rounded-tr-lg px-4 py-3 text-sm font-medium text-primary hover:text-primary/80">
                  Allow
                </button>
                <button className="flex flex-1 items-center justify-center rounded-none rounded-br-lg px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground">
                  Don't allow
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Dividers: <code className="bg-background px-1 py-0.5 rounded">divide-x divide-y divide-border</code></li>
              <li>• Vertical stack: <code className="bg-background px-1 py-0.5 rounded">flex flex-col</code></li>
            </ul>
          </div>
        </div>

        {/* With Action Buttons */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">With Action Buttons</h3>
          <div className="max-w-sm rounded-lg bg-card shadow-lg border border-border p-4">
            <div className="flex items-start">
              <div className="shrink-0 pt-0.5">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&h=160&fit=crop" />
                  <AvatarFallback>EG</AvatarFallback>
                </Avatar>
              </div>
              <div className="ml-3 w-0 flex-1">
                <p className="text-sm font-medium text-foreground">Emilia Gates</p>
                <p className="mt-1 text-sm text-muted-foreground">Sent you an invite to connect.</p>
                <div className="mt-4 flex gap-3">
                  <Button size="sm">Accept</Button>
                  <Button size="sm" variant="outline">Decline</Button>
                </div>
              </div>
              <div className="ml-4 flex shrink-0">
                <button className="inline-flex rounded-md text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
            <p className="font-medium">Design Token Mappings:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Buttons: <code className="bg-background px-1 py-0.5 rounded">Button size="sm"</code></li>
              <li>• Button spacing: <code className="bg-background px-1 py-0.5 rounded">flex gap-3</code></li>
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