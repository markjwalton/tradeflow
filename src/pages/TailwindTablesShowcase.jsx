import React, { useState, useRef, useLayoutEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { PageHeader } from '@/components/sturij/PageHeader';
import { Button } from '@/components/ui/button';
import { ShowcaseSection } from '@/components/showcase/ShowcaseSection';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, MoreVertical, Mail, Phone, ArrowUpCircle, ArrowDownCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TailwindTablesShowcase() {
  return (
    <div className="space-y-12">
      <PageHeader
        title="Table Layouts"
        description="Data table patterns converted to use design tokens and Radix UI components."
      >
        <Link to={createPageUrl('TailwindShowcaseGallery')}>
          <Button variant="outline" size="sm">← Back to Gallery</Button>
        </Link>
      </PageHeader>

      <ShowcaseSection title="Basic Tables" defaultOpen={true}>
        <SimpleTableExample />
        <CardTableExample />
        <StripedTableExample />
      </ShowcaseSection>

      <ShowcaseSection title="Advanced Tables" defaultOpen={false}>
        <StackedTableExample />
        <SortableTableExample />
        <GroupedTableExample />
        <InvoiceTableExample />
        <StickyHeaderTableExample />
      </ShowcaseSection>

      <ShowcaseSection title="Grid Alternatives" defaultOpen={false}>
        <GridCardsExample />
        <ContactCardsExample />
        <ActionTilesExample />
      </ShowcaseSection>

      <ShowcaseSection title="Design System Reference" defaultOpen={false}>
        <TokenReference />
      </ShowcaseSection>
    </div>
  );
}

function SimpleTableExample() {
  const people = [
    { name: 'Lindsay Walton', title: 'Front-end Developer', email: 'lindsay.walton@example.com', role: 'Member' },
    { name: 'Courtney Henry', title: 'Designer', email: 'courtney.henry@example.com', role: 'Admin' },
    { name: 'Tom Cook', title: 'Director of Product', email: 'tom.cook@example.com', role: 'Member' },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Simple Table</h2>
        <p className="text-sm text-muted-foreground">Basic data table with minimal styling</p>
      </div>

      <div>
        <div className="sm:flex sm:items-center mb-6">
          <div className="sm:flex-auto">
            <h3 className="text-base font-semibold">Users</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              A list of all users including their name, title, email and role.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Button>Add user</Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr>
                <th className="py-3.5 pr-3 text-left text-sm font-semibold">Name</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold">Title</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold">Email</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold">Role</th>
                <th className="py-3.5 pl-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {people.map((person) => (
                <tr key={person.email}>
                  <td className="py-4 pr-3 text-sm font-medium whitespace-nowrap">{person.name}</td>
                  <td className="px-3 py-4 text-sm whitespace-nowrap text-muted-foreground">{person.title}</td>
                  <td className="px-3 py-4 text-sm whitespace-nowrap text-muted-foreground">{person.email}</td>
                  <td className="px-3 py-4 text-sm whitespace-nowrap text-muted-foreground">{person.role}</td>
                  <td className="py-4 pl-3 text-right text-sm font-medium whitespace-nowrap">
                    <a href="#" className="text-primary hover:text-primary-600">
                      Edit<span className="sr-only">, {person.name}</span>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Dividers: <code className="bg-background px-1 py-0.5 rounded">divide-border</code></li>
          <li>• Background: <code className="bg-background px-1 py-0.5 rounded">bg-card</code></li>
          <li>• Links: <code className="bg-background px-1 py-0.5 rounded">text-primary hover:text-primary-600</code></li>
        </ul>
      </div>
    </section>
  );
}

function CardTableExample() {
  const people = [
    { name: 'Lindsay Walton', title: 'Front-end Developer', email: 'lindsay.walton@example.com', role: 'Member' },
    { name: 'Courtney Henry', title: 'Designer', email: 'courtney.henry@example.com', role: 'Admin' },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Table in Card</h2>
        <p className="text-sm text-muted-foreground">Table wrapped with shadow and border</p>
      </div>

      <div>
        <div className="sm:flex sm:items-center mb-6">
          <div className="sm:flex-auto">
            <h3 className="text-base font-semibold">Users</h3>
            <p className="mt-2 text-sm text-muted-foreground">User directory with card styling</p>
          </div>
          <Button>Add user</Button>
        </div>
        <div className="rounded-xl border border-border shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="py-3.5 pr-3 pl-6 text-left text-sm font-semibold">Name</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold">Title</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold">Email</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold">Role</th>
                <th className="py-3.5 pl-3 pr-6">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {people.map((person) => (
                <tr key={person.email}>
                  <td className="py-4 pr-3 pl-6 text-sm font-medium whitespace-nowrap">{person.name}</td>
                  <td className="px-3 py-4 text-sm whitespace-nowrap text-muted-foreground">{person.title}</td>
                  <td className="px-3 py-4 text-sm whitespace-nowrap text-muted-foreground">{person.email}</td>
                  <td className="px-3 py-4 text-sm whitespace-nowrap text-muted-foreground">{person.role}</td>
                  <td className="py-4 pl-3 pr-6 text-right text-sm font-medium whitespace-nowrap">
                    <a href="#" className="text-primary hover:text-primary-600">Edit</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Card wrapper: <code className="bg-background px-1 py-0.5 rounded">rounded-xl border shadow-sm</code></li>
          <li>• Header: <code className="bg-background px-1 py-0.5 rounded">bg-muted/50</code></li>
        </ul>
      </div>
    </section>
  );
}

function StripedTableExample() {
  const people = [
    { name: 'Lindsay Walton', title: 'Front-end Developer', email: 'lindsay.walton@example.com', role: 'Member' },
    { name: 'Courtney Henry', title: 'Designer', email: 'courtney.henry@example.com', role: 'Admin' },
    { name: 'Tom Cook', title: 'Director of Product', email: 'tom.cook@example.com', role: 'Member' },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Striped Rows</h2>
        <p className="text-sm text-muted-foreground">Alternating row backgrounds for easier scanning</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead>
            <tr>
              <th className="py-3.5 pr-3 text-left text-sm font-semibold">Name</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold">Title</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold">Email</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold">Role</th>
              <th className="py-3.5 pl-3">
                <span className="sr-only">Edit</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-card">
            {people.map((person, idx) => (
              <tr key={person.email} className={idx % 2 === 0 ? '' : 'bg-muted/30'}>
                <td className="py-4 pr-3 text-sm font-medium whitespace-nowrap">{person.name}</td>
                <td className="px-3 py-4 text-sm whitespace-nowrap text-muted-foreground">{person.title}</td>
                <td className="px-3 py-4 text-sm whitespace-nowrap text-muted-foreground">{person.email}</td>
                <td className="px-3 py-4 text-sm whitespace-nowrap text-muted-foreground">{person.role}</td>
                <td className="py-4 pl-3 text-right text-sm font-medium whitespace-nowrap">
                  <a href="#" className="text-primary hover:text-primary-600">Edit</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Stripe: <code className="bg-background px-1 py-0.5 rounded">bg-muted/30</code> on even rows</li>
        </ul>
      </div>
    </section>
  );
}

function StackedTableExample() {
  const people = [
    { name: 'Lindsay Walton', title: 'Front-end Developer', email: 'lindsay.walton@example.com', role: 'Member' },
    { name: 'Courtney Henry', title: 'Designer', email: 'courtney.henry@example.com', role: 'Admin' },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Stacked on Mobile</h2>
        <p className="text-sm text-muted-foreground">Columns collapse into rows on small screens</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead>
            <tr>
              <th className="py-3.5 pr-3 text-left text-sm font-semibold">Name</th>
              <th className="hidden px-3 py-3.5 text-left text-sm font-semibold sm:table-cell">Title</th>
              <th className="hidden px-3 py-3.5 text-left text-sm font-semibold lg:table-cell">Email</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold">Role</th>
              <th className="py-3.5 pl-3">
                <span className="sr-only">Edit</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {people.map((person) => (
              <tr key={person.email}>
                <td className="w-full max-w-0 py-4 pr-3 text-sm font-medium sm:w-auto sm:max-w-none">
                  {person.name}
                  <dl className="font-normal lg:hidden">
                    <dt className="sr-only">Title</dt>
                    <dd className="mt-1 truncate text-muted-foreground">{person.title}</dd>
                    <dt className="sr-only sm:hidden">Email</dt>
                    <dd className="mt-1 truncate text-muted-foreground sm:hidden">{person.email}</dd>
                  </dl>
                </td>
                <td className="hidden px-3 py-4 text-sm whitespace-nowrap text-muted-foreground sm:table-cell">
                  {person.title}
                </td>
                <td className="hidden px-3 py-4 text-sm whitespace-nowrap text-muted-foreground lg:table-cell">
                  {person.email}
                </td>
                <td className="px-3 py-4 text-sm whitespace-nowrap text-muted-foreground">{person.role}</td>
                <td className="py-4 pl-3 text-right text-sm font-medium whitespace-nowrap">
                  <a href="#" className="text-primary hover:text-primary-600">Edit</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Hidden columns: <code className="bg-background px-1 py-0.5 rounded">hidden sm:table-cell</code></li>
          <li>• Mobile stack with <code className="bg-background px-1 py-0.5 rounded">dl</code> element</li>
        </ul>
      </div>
    </section>
  );
}

function SortableTableExample() {
  const people = [
    { name: 'Lindsay Walton', title: 'Front-end Developer', email: 'lindsay.walton@example.com', role: 'Member' },
    { name: 'Courtney Henry', title: 'Designer', email: 'courtney.henry@example.com', role: 'Admin' },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Sortable Columns</h2>
        <p className="text-sm text-muted-foreground">Column headers with sort indicators</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead>
            <tr>
              <th className="py-3.5 pr-3 text-left text-sm font-semibold">
                <a href="#" className="group inline-flex items-center">
                  Name
                  <span className="invisible ml-2 text-muted-foreground group-hover:visible">
                    <ChevronDown className="h-5 w-5" />
                  </span>
                </a>
              </th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold">
                <a href="#" className="group inline-flex items-center">
                  Title
                  <span className="ml-2 rounded-sm bg-muted text-foreground">
                    <ChevronDown className="h-5 w-5" />
                  </span>
                </a>
              </th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold">Email</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {people.map((person) => (
              <tr key={person.email}>
                <td className="py-4 pr-3 text-sm font-medium whitespace-nowrap">{person.name}</td>
                <td className="px-3 py-4 text-sm whitespace-nowrap text-muted-foreground">{person.title}</td>
                <td className="px-3 py-4 text-sm whitespace-nowrap text-muted-foreground">{person.email}</td>
                <td className="px-3 py-4 text-sm whitespace-nowrap text-muted-foreground">{person.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Active sort: <code className="bg-background px-1 py-0.5 rounded">bg-muted</code> background on indicator</li>
          <li>• Hover reveal: <code className="bg-background px-1 py-0.5 rounded">invisible group-hover:visible</code></li>
        </ul>
      </div>
    </section>
  );
}

function GroupedTableExample() {
  const locations = [
    {
      name: 'Edinburgh',
      people: [
        { name: 'Lindsay Walton', title: 'Front-end Developer', email: 'lindsay.walton@example.com', role: 'Member' },
        { name: 'Courtney Henry', title: 'Designer', email: 'courtney.henry@example.com', role: 'Admin' },
      ],
    },
    {
      name: 'London',
      people: [
        { name: 'Tom Cook', title: 'Director of Product', email: 'tom.cook@example.com', role: 'Member' },
      ],
    },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Grouped Rows</h2>
        <p className="text-sm text-muted-foreground">Table with category headers</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-card">
            <tr>
              <th className="py-3.5 pr-3 pl-6 text-left text-sm font-semibold">Name</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold">Title</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold">Email</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold">Role</th>
              <th className="py-3.5 pl-3 pr-6">
                <span className="sr-only">Edit</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-card">
            {locations.map((location) => (
              <Fragment key={location.name}>
                <tr className="border-t border-border">
                  <th
                    scope="colgroup"
                    colSpan={5}
                    className="bg-muted/50 py-2 pr-3 pl-6 text-left text-sm font-semibold"
                  >
                    {location.name}
                  </th>
                </tr>
                {location.people.map((person, personIdx) => (
                  <tr
                    key={person.email}
                    className={cn(personIdx === 0 ? 'border-t border-border' : 'border-t border-border/50')}
                  >
                    <td className="py-4 pr-3 pl-6 text-sm font-medium whitespace-nowrap">{person.name}</td>
                    <td className="px-3 py-4 text-sm whitespace-nowrap text-muted-foreground">{person.title}</td>
                    <td className="px-3 py-4 text-sm whitespace-nowrap text-muted-foreground">{person.email}</td>
                    <td className="px-3 py-4 text-sm whitespace-nowrap text-muted-foreground">{person.role}</td>
                    <td className="py-4 pl-3 pr-6 text-right text-sm font-medium whitespace-nowrap">
                      <a href="#" className="text-primary hover:text-primary-600">Edit</a>
                    </td>
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Group header: <code className="bg-background px-1 py-0.5 rounded">bg-muted/50</code></li>
          <li>• First row in group: <code className="bg-background px-1 py-0.5 rounded">border-border</code></li>
          <li>• Other rows: <code className="bg-background px-1 py-0.5 rounded">border-border/50</code></li>
        </ul>
      </div>
    </section>
  );
}

function InvoiceTableExample() {
  const projects = [
    { id: 1, name: 'Logo redesign', description: 'New logo and digital asset playbook.', hours: '20.0', rate: '$100.00', price: '$2,000.00' },
    { id: 2, name: 'Website redesign', description: 'Design and program new website.', hours: '52.0', rate: '$100.00', price: '$5,200.00' },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Invoice Table</h2>
        <p className="text-sm text-muted-foreground">Table with totals footer</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b border-border">
            <tr>
              <th className="py-3.5 pr-3 text-left text-sm font-semibold">Project</th>
              <th className="hidden px-3 py-3.5 text-right text-sm font-semibold sm:table-cell">Hours</th>
              <th className="hidden px-3 py-3.5 text-right text-sm font-semibold sm:table-cell">Rate</th>
              <th className="py-3.5 pl-3 text-right text-sm font-semibold">Price</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="border-b border-border/50">
                <td className="max-w-0 py-5 pr-3 text-sm">
                  <div className="font-medium">{project.name}</div>
                  <div className="mt-1 truncate text-muted-foreground">{project.description}</div>
                </td>
                <td className="hidden px-3 py-5 text-right text-sm text-muted-foreground sm:table-cell">{project.hours}</td>
                <td className="hidden px-3 py-5 text-right text-sm text-muted-foreground sm:table-cell">{project.rate}</td>
                <td className="py-5 pl-3 text-right text-sm text-muted-foreground">{project.price}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row" colSpan={3} className="hidden pt-6 pr-3 text-right text-sm font-normal text-muted-foreground sm:table-cell">
                Subtotal
              </th>
              <th scope="row" className="pt-6 pr-3 text-left text-sm font-normal text-muted-foreground sm:hidden">
                Subtotal
              </th>
              <td className="pt-6 pl-3 text-right text-sm text-muted-foreground">$7,200.00</td>
            </tr>
            <tr>
              <th scope="row" colSpan={3} className="hidden pt-4 pr-3 text-right text-sm font-semibold sm:table-cell">
                Total
              </th>
              <th scope="row" className="pt-4 pr-3 text-left text-sm font-semibold sm:hidden">
                Total
              </th>
              <td className="pt-4 pl-3 text-right text-sm font-semibold">$7,200.00</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Footer totals with proper semantic HTML</li>
          <li>• Two-line cell with description</li>
        </ul>
      </div>
    </section>
  );
}

function StickyHeaderTableExample() {
  const people = Array.from({ length: 8 }, (_, i) => ({
    name: `Person ${i + 1}`,
    title: 'Developer',
    email: `person${i + 1}@example.com`,
    role: i % 2 === 0 ? 'Member' : 'Admin',
  }));

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Sticky Header</h2>
        <p className="text-sm text-muted-foreground">Table header stays visible on scroll</p>
      </div>

      <div className="max-h-96 overflow-auto rounded-xl border border-border">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur py-3.5 pr-3 pl-6 text-left text-sm font-semibold">
                Name
              </th>
              <th className="sticky top-0 z-10 hidden border-b border-border bg-card/95 backdrop-blur px-3 py-3.5 text-left text-sm font-semibold sm:table-cell">
                Title
              </th>
              <th className="sticky top-0 z-10 hidden border-b border-border bg-card/95 backdrop-blur px-3 py-3.5 text-left text-sm font-semibold lg:table-cell">
                Email
              </th>
              <th className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur px-3 py-3.5 text-left text-sm font-semibold">
                Role
              </th>
            </tr>
          </thead>
          <tbody>
            {people.map((person, personIdx) => (
              <tr key={person.email}>
                <td className={cn(
                  personIdx !== people.length - 1 ? 'border-b border-border/50' : '',
                  'py-4 pr-3 pl-6 text-sm font-medium whitespace-nowrap'
                )}>
                  {person.name}
                </td>
                <td className={cn(
                  personIdx !== people.length - 1 ? 'border-b border-border/50' : '',
                  'hidden px-3 py-4 text-sm whitespace-nowrap text-muted-foreground sm:table-cell'
                )}>
                  {person.title}
                </td>
                <td className={cn(
                  personIdx !== people.length - 1 ? 'border-b border-border/50' : '',
                  'hidden px-3 py-4 text-sm whitespace-nowrap text-muted-foreground lg:table-cell'
                )}>
                  {person.email}
                </td>
                <td className={cn(
                  personIdx !== people.length - 1 ? 'border-b border-border/50' : '',
                  'px-3 py-4 text-sm whitespace-nowrap text-muted-foreground'
                )}>
                  {person.role}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Sticky: <code className="bg-background px-1 py-0.5 rounded">sticky top-0 z-10</code></li>
          <li>• Backdrop blur: <code className="bg-background px-1 py-0.5 rounded">bg-card/95 backdrop-blur</code></li>
        </ul>
      </div>
    </section>
  );
}

function GridCardsExample() {
  const people = [
    {
      name: 'Jane Cooper',
      title: 'Regional Paradigm Technician',
      role: 'Admin',
      email: 'janecooper@example.com',
      telephone: '+1-202-555-0170',
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&h=256&fit=crop',
    },
    {
      name: 'Cody Fisher',
      title: 'Product Directives Officer',
      role: 'Admin',
      email: 'codyfisher@example.com',
      telephone: '+1-202-555-0114',
      imageUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=256&h=256&fit=crop',
    },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Contact Cards Grid</h2>
        <p className="text-sm text-muted-foreground">Grid layout with contact actions</p>
      </div>

      <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {people.map((person) => (
          <li key={person.email} className="col-span-1 divide-y divide-border rounded-xl border border-border bg-card shadow-sm">
            <div className="flex w-full items-center justify-between space-x-6 p-6">
              <div className="flex-1 truncate">
                <div className="flex items-center space-x-3">
                  <h3 className="truncate text-sm font-medium">{person.name}</h3>
                  <Badge variant="success" className="shrink-0">
                    {person.role}
                  </Badge>
                </div>
                <p className="mt-1 truncate text-sm text-muted-foreground">{person.title}</p>
              </div>
              <Avatar className="h-10 w-10">
                <AvatarImage src={person.imageUrl} alt={person.name} />
                <AvatarFallback>{person.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
            </div>
            <div>
              <div className="-mt-px flex divide-x divide-border">
                <div className="flex w-0 flex-1">
                  <a
                    href={`mailto:${person.email}`}
                    className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-xl py-4 text-sm font-semibold border-t-0"
                  >
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    Email
                  </a>
                </div>
                <div className="-ml-px flex w-0 flex-1">
                  <a
                    href={`tel:${person.telephone}`}
                    className="relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-xl py-4 text-sm font-semibold border-t-0"
                  >
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    Call
                  </a>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Card: <code className="bg-background px-1 py-0.5 rounded">rounded-xl border shadow-sm</code></li>
          <li>• Split actions with <code className="bg-background px-1 py-0.5 rounded">divide-x</code></li>
          <li>• Badge variant for role indicator</li>
        </ul>
      </div>
    </section>
  );
}

function ContactCardsExample() {
  const people = [
    {
      name: 'Leslie Alexander',
      email: 'leslie.alexander@example.com',
      role: 'Co-Founder / CEO',
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&h=256&fit=crop',
    },
    {
      name: 'Michael Foster',
      email: 'michael.foster@example.com',
      role: 'Co-Founder / CTO',
      imageUrl: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=256&h=256&fit=crop',
    },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Simple Contact Cards</h2>
        <p className="text-sm text-muted-foreground">Clickable card grid with hover effects</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {people.map((person) => (
          <div
            key={person.email}
            className="relative flex items-center space-x-3 rounded-xl border border-border bg-card px-6 py-5 shadow-sm hover:border-border/60 transition-colors"
          >
            <div className="shrink-0">
              <Avatar className="h-10 w-10">
                <AvatarImage src={person.imageUrl} alt={person.name} />
                <AvatarFallback>{person.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
            </div>
            <div className="min-w-0 flex-1">
              <a href="#" className="focus:outline-hidden">
                <span className="absolute inset-0" />
                <p className="text-sm font-medium">{person.name}</p>
                <p className="truncate text-sm text-muted-foreground">{person.role}</p>
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Hover: <code className="bg-background px-1 py-0.5 rounded">hover:border-border/60</code></li>
          <li>• Absolute overlay for full card clickability</li>
        </ul>
      </div>
    </section>
  );
}

function ActionTilesExample() {
  const actions = [
    {
      title: 'Request time off',
      icon: '🗓️',
      description: 'Doloribus dolores nostrum quia qui natus officia quod et dolorem.',
    },
    {
      title: 'Benefits',
      icon: '✓',
      description: 'Sit repellendus qui ut at blanditiis et quo et molestiae.',
    },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Action Tiles</h2>
        <p className="text-sm text-muted-foreground">Clickable action cards in grid</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {actions.map((action, idx) => (
          <div
            key={action.title}
            className="group relative rounded-xl border border-border bg-card p-6 hover:border-border/60 transition-colors"
          >
            <div>
              <span className="inline-flex rounded-lg bg-primary-50 p-3 text-2xl">
                {action.icon}
              </span>
            </div>
            <div className="mt-8">
              <h3 className="text-base font-semibold">
                <a href="#" className="focus:outline-hidden">
                  <span className="absolute inset-0" />
                  {action.title}
                </a>
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{action.description}</p>
            </div>
            <span className="pointer-events-none absolute top-6 right-6 text-border group-hover:text-muted-foreground transition-colors">
              <svg fill="currentColor" viewBox="0 0 24 24" className="h-6 w-6">
                <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
              </svg>
            </span>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Icon bg: <code className="bg-background px-1 py-0.5 rounded">bg-primary-50</code></li>
          <li>• Arrow decoration changes on hover</li>
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
        <p className="text-sm text-muted-foreground">Complete token reference for table layouts</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-border p-4 space-y-2">
          <h3 className="text-sm font-medium">Table Structure</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Dividers: <code className="bg-muted px-1 py-0.5 rounded">divide-border</code></li>
            <li>• Header background: <code className="bg-muted px-1 py-0.5 rounded">bg-muted/50</code></li>
            <li>• Striped: <code className="bg-muted px-1 py-0.5 rounded">bg-muted/30</code></li>
          </ul>
        </div>

        <div className="rounded-lg border border-border p-4 space-y-2">
          <h3 className="text-sm font-medium">Responsive Patterns</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Hide columns: <code className="bg-muted px-1 py-0.5 rounded">hidden sm:table-cell</code></li>
            <li>• Stack on mobile with definition lists</li>
            <li>• Sticky headers for long tables</li>
          </ul>
        </div>

        <div className="rounded-lg border border-border p-4 space-y-2">
          <h3 className="text-sm font-medium">Grid Alternatives</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Cards for richer content display</li>
            <li>• Action tiles for navigation</li>
            <li>• Contact cards with split actions</li>
          </ul>
        </div>
      </div>
    </section>
  );
}