import React from 'react';
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
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  Edit,
  Link as LinkIcon,
  Check,
  ChevronRight,
  ChevronLeft,
  Mail,
  Phone,
  MoreVertical,
} from 'lucide-react';

const sampleProfile = {
  name: 'Ricardo Cooper',
  email: 'ricardo.cooper@example.com',
  role: 'Senior Front-End Developer',
  avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=256&h=256&fit=crop',
  cover: 'https://images.unsplash.com/photo-1444628838545-ac4016a5418a?w=1950&q=80',
};

export default function TailwindPageHeadersShowcase() {
  return (
    <div className="space-y-12">
      <PageHeader
        title="Page Headers"
        description="Page header patterns with titles, actions, breadcrumbs, and metadata converted to use design tokens."
      >
        <Link to={createPageUrl('TailwindShowcaseGallery')}>
          <Button variant="outline" size="sm">← Back to Gallery</Button>
        </Link>
      </PageHeader>

      <ShowcaseSection title="Basic Headers" defaultOpen={true}>
        <SimpleHeaderExample />
        <BreadcrumbHeaderExample />
        <MetadataHeaderExample />
      </ShowcaseSection>

      <ShowcaseSection title="Profile Headers" defaultOpen={false}>
        <ProfileCoverHeaderExample />
        <ProfileAvatarHeaderExample />
        <CardProfileExample />
      </ShowcaseSection>

      <ShowcaseSection title="Specialized Headers" defaultOpen={false}>
        <FullHeaderExample />
        <CompactHeaderExample />
      </ShowcaseSection>

      <ShowcaseSection title="Design System Reference" defaultOpen={false}>
        <TokenReference />
      </ShowcaseSection>
    </div>
  );
}

function SimpleHeaderExample() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Simple Header with Actions</h2>
        <p className="text-sm text-muted-foreground">Basic page header with title and action buttons</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold sm:text-3xl sm:tracking-tight">
              Back End Developer
            </h2>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button className="ml-3">
              Publish
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Container: <code className="bg-background px-1 py-0.5 rounded">bg-card</code> with border</li>
          <li>• Primary Button: Uses Button component default variant</li>
          <li>• Secondary Button: <code className="bg-background px-1 py-0.5 rounded">variant="outline"</code></li>
        </ul>
      </div>
    </section>
  );
}

function BreadcrumbHeaderExample() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Header with Breadcrumb</h2>
        <p className="text-sm text-muted-foreground">Page header with breadcrumb navigation</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div>
          <nav aria-label="Back" className="sm:hidden">
            <a href="#" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
              <ChevronLeft className="mr-1 -ml-1 h-5 w-5" />
              Back
            </a>
          </nav>
          <nav aria-label="Breadcrumb" className="hidden sm:flex">
            <ol role="list" className="flex items-center space-x-4">
              <li>
                <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  Jobs
                </a>
              </li>
              <li>
                <div className="flex items-center">
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  <a href="#" className="ml-4 text-sm font-medium text-muted-foreground hover:text-foreground">
                    Engineering
                  </a>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  <a href="#" aria-current="page" className="ml-4 text-sm font-medium text-muted-foreground">
                    Back End Developer
                  </a>
                </div>
              </li>
            </ol>
          </nav>
        </div>
        <div className="mt-2 md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold sm:text-3xl sm:tracking-tight">
              Back End Developer
            </h2>
          </div>
          <div className="mt-4 flex shrink-0 md:mt-0 md:ml-4">
            <Button variant="outline">Edit</Button>
            <Button className="ml-3">Publish</Button>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Breadcrumb text: <code className="bg-background px-1 py-0.5 rounded">text-muted-foreground</code></li>
          <li>• Hover: <code className="bg-background px-1 py-0.5 rounded">hover:text-foreground</code></li>
          <li>• Mobile: Shows "Back" link instead of full breadcrumb</li>
        </ul>
      </div>
    </section>
  );
}

function MetadataHeaderExample() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Header with Metadata</h2>
        <p className="text-sm text-muted-foreground">Header with icon-labeled metadata and responsive actions</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="lg:flex lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold sm:text-3xl sm:tracking-tight">
              Back End Developer
            </h2>
            <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
              <div className="mt-2 flex items-center text-sm text-muted-foreground">
                <Briefcase className="mr-1.5 h-5 w-5" />
                Full-time
              </div>
              <div className="mt-2 flex items-center text-sm text-muted-foreground">
                <MapPin className="mr-1.5 h-5 w-5" />
                Remote
              </div>
              <div className="mt-2 flex items-center text-sm text-muted-foreground">
                <DollarSign className="mr-1.5 h-5 w-5" />
                $120k – $140k
              </div>
              <div className="mt-2 flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-1.5 h-5 w-5" />
                Closing on January 9, 2020
              </div>
            </div>
          </div>
          <div className="mt-5 flex lg:mt-0 lg:ml-4">
            <Button variant="outline" className="hidden sm:inline-flex">
              <Edit className="mr-1.5 -ml-0.5 h-5 w-5" />
              Edit
            </Button>
            <Button variant="outline" className="ml-3 hidden sm:inline-flex">
              <LinkIcon className="mr-1.5 -ml-0.5 h-5 w-5" />
              View
            </Button>
            <Button className="sm:ml-3">
              <Check className="mr-1.5 -ml-0.5 h-5 w-5" />
              Publish
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-3 sm:hidden">
                  More
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem>View</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Metadata text: <code className="bg-background px-1 py-0.5 rounded">text-muted-foreground</code></li>
          <li>• Icons: Lucide React icons with consistent sizing</li>
          <li>• Mobile: Overflow actions in dropdown menu</li>
        </ul>
      </div>
    </section>
  );
}

function ProfileCoverHeaderExample() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Profile Header with Cover</h2>
        <p className="text-sm text-muted-foreground">Profile header with cover image and overlapping avatar</p>
      </div>

      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <img src={sampleProfile.cover} alt="" className="h-32 w-full object-cover lg:h-48" />
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="-mt-12 sm:-mt-16 sm:flex sm:items-end sm:space-x-5">
            <div className="flex">
              <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-card">
                <AvatarImage src={sampleProfile.avatar} />
                <AvatarFallback>RC</AvatarFallback>
              </Avatar>
            </div>
            <div className="mt-6 sm:flex sm:min-w-0 sm:flex-1 sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
              <div className="mt-6 min-w-0 flex-1 sm:hidden md:block">
                <h1 className="text-2xl font-bold truncate">{sampleProfile.name}</h1>
              </div>
              <div className="mt-6 flex flex-col justify-stretch space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
                <Button variant="outline">
                  <Mail className="mr-1.5 -ml-0.5 h-5 w-5" />
                  Message
                </Button>
                <Button variant="outline">
                  <Phone className="mr-1.5 -ml-0.5 h-5 w-5" />
                  Call
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-6 hidden min-w-0 flex-1 sm:block md:hidden">
            <h1 className="text-2xl font-bold truncate">{sampleProfile.name}</h1>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Avatar border: <code className="bg-background px-1 py-0.5 rounded">border-card</code></li>
          <li>• Negative margin for overlap effect</li>
          <li>• Responsive layout with hidden/visible controls</li>
        </ul>
      </div>
    </section>
  );
}

function ProfileAvatarHeaderExample() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Profile Header with Avatar</h2>
        <p className="text-sm text-muted-foreground">Horizontal layout with avatar and inline information</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="md:flex md:items-center md:justify-between md:space-x-5">
          <div className="flex items-start space-x-5">
            <div className="shrink-0">
              <Avatar className="h-16 w-16">
                <AvatarImage src={sampleProfile.avatar} />
                <AvatarFallback>RC</AvatarFallback>
              </Avatar>
            </div>
            <div className="pt-1.5">
              <h1 className="text-2xl font-bold">{sampleProfile.name}</h1>
              <p className="text-sm font-medium text-muted-foreground">
                Applied for{' '}
                <a href="#" className="text-foreground hover:underline">
                  Front End Developer
                </a>{' '}
                on <time dateTime="2020-08-25">August 25, 2020</time>
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-col-reverse justify-stretch space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-y-0 sm:space-x-3 sm:space-x-reverse md:mt-0 md:flex-row md:space-x-3">
            <Button variant="outline">Disqualify</Button>
            <Button>Advance to offer</Button>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Uses Avatar component from Radix UI</li>
          <li>• Inline links: <code className="bg-background px-1 py-0.5 rounded">text-foreground hover:underline</code></li>
          <li>• Responsive button layout with space utilities</li>
        </ul>
      </div>
    </section>
  );
}

function CardProfileExample() {
  const stats = [
    { label: 'Vacation days left', value: 12 },
    { label: 'Sick days left', value: 4 },
    { label: 'Personal days left', value: 2 },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Card Profile Overview</h2>
        <p className="text-sm text-muted-foreground">Profile card with stats grid at bottom</p>
      </div>

      <div className="rounded-xl border border-border overflow-hidden bg-card shadow-sm">
        <div className="p-6">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="sm:flex sm:space-x-5">
              <div className="shrink-0">
                <Avatar className="h-20 w-20 mx-auto">
                  <AvatarImage src={sampleProfile.avatar} />
                  <AvatarFallback>RN</AvatarFallback>
                </Avatar>
              </div>
              <div className="mt-4 text-center sm:mt-0 sm:pt-1 sm:text-left">
                <p className="text-sm font-medium text-muted-foreground">Welcome back,</p>
                <p className="text-xl font-bold sm:text-2xl">Rebecca Nicholas</p>
                <p className="text-sm font-medium text-muted-foreground">Product Designer</p>
              </div>
            </div>
            <div className="mt-5 flex justify-center sm:mt-0">
              <Button variant="outline">View profile</Button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 divide-y divide-border border-t border-border bg-muted/50 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {stats.map((stat) => (
            <div key={stat.label} className="px-6 py-5 text-center text-sm font-medium">
              <span className="text-foreground">{stat.value}</span>{' '}
              <span className="text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Stats BG: <code className="bg-background px-1 py-0.5 rounded">bg-muted/50</code></li>
          <li>• Dividers: <code className="bg-background px-1 py-0.5 rounded">divide-border</code></li>
          <li>• Grid layout with responsive columns</li>
        </ul>
      </div>
    </section>
  );
}

function FullHeaderExample() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Full Header with Everything</h2>
        <p className="text-sm text-muted-foreground">Complete header with breadcrumb, metadata, and actions</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="lg:flex lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <nav aria-label="Breadcrumb" className="flex">
              <ol role="list" className="flex items-center space-x-4">
                <li>
                  <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                    Jobs
                  </a>
                </li>
                <li>
                  <div className="flex items-center">
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    <a href="#" className="ml-4 text-sm font-medium text-muted-foreground hover:text-foreground">
                      Engineering
                    </a>
                  </div>
                </li>
              </ol>
            </nav>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl sm:tracking-tight">
              Back End Developer
            </h2>
            <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
              <div className="mt-2 flex items-center text-sm text-muted-foreground">
                <Briefcase className="mr-1.5 h-5 w-5" />
                Full-time
              </div>
              <div className="mt-2 flex items-center text-sm text-muted-foreground">
                <MapPin className="mr-1.5 h-5 w-5" />
                Remote
              </div>
              <div className="mt-2 flex items-center text-sm text-muted-foreground">
                <DollarSign className="mr-1.5 h-5 w-5" />
                $120k – $140k
              </div>
              <div className="mt-2 flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-1.5 h-5 w-5" />
                Closing on January 9, 2020
              </div>
            </div>
          </div>
          <div className="mt-5 flex lg:mt-0 lg:ml-4">
            <Button variant="outline" className="hidden sm:inline-flex">
              <Edit className="mr-1.5 -ml-0.5 h-5 w-5" />
              Edit
            </Button>
            <Button variant="outline" className="ml-3 hidden sm:inline-flex">
              <LinkIcon className="mr-1.5 -ml-0.5 h-5 w-5" />
              View
            </Button>
            <Button className="sm:ml-3">
              <Check className="mr-1.5 -ml-0.5 h-5 w-5" />
              Publish
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Combines multiple patterns:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Breadcrumb navigation at top</li>
          <li>• Large title with metadata icons</li>
          <li>• Multiple action buttons with responsive visibility</li>
        </ul>
      </div>
    </section>
  );
}

function CompactHeaderExample() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Compact Header with Logo</h2>
        <p className="text-sm text-muted-foreground">Compact invoice-style header with image and actions</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mx-auto flex items-center justify-between gap-x-8">
          <div className="flex items-center gap-x-6">
            <div className="h-16 w-16 rounded-full border border-border flex items-center justify-center bg-primary-100 text-primary-700 font-bold text-xl">
              T
            </div>
            <div>
              <div className="text-sm text-muted-foreground">
                Invoice <span className="text-foreground">#00011</span>
              </div>
              <div className="mt-1 text-base font-semibold">Tuple, Inc</div>
            </div>
          </div>
          <div className="flex items-center gap-x-4 sm:gap-x-6">
            <button type="button" className="hidden text-sm font-semibold sm:block hover:underline">
              Copy URL
            </button>
            <a href="#" className="hidden text-sm font-semibold sm:block hover:underline">
              Edit
            </a>
            <Button>Send</Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="sm:hidden">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Copy URL</DropdownMenuItem>
                <DropdownMenuItem>Edit</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Logo placeholder: <code className="bg-background px-1 py-0.5 rounded">bg-primary-100 text-primary-700</code></li>
          <li>• Text links with hover:underline</li>
          <li>• Mobile: Actions in dropdown menu</li>
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
        <p className="text-sm text-muted-foreground">Complete token reference for page headers</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-border p-4 space-y-2">
          <h3 className="text-sm font-medium">Typography</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Title: <code className="bg-muted px-1 py-0.5 rounded">text-2xl font-bold</code></li>
            <li>• Metadata: <code className="bg-muted px-1 py-0.5 rounded">text-sm text-muted-foreground</code></li>
            <li>• Links: <code className="bg-muted px-1 py-0.5 rounded">hover:text-foreground</code></li>
          </ul>
        </div>

        <div className="rounded-lg border border-border p-4 space-y-2">
          <h3 className="text-sm font-medium">Components</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Button variants (default, outline, ghost)</li>
            <li>• Avatar from Radix UI</li>
            <li>• DropdownMenu for mobile overflow</li>
            <li>• Lucide icons throughout</li>
          </ul>
        </div>

        <div className="rounded-lg border border-border p-4 space-y-2">
          <h3 className="text-sm font-medium">Layout</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Responsive flex layouts</li>
            <li>• Hidden/visible at breakpoints</li>
            <li>• Space utilities for consistent gaps</li>
            <li>• Grid for stats sections</li>
          </ul>
        </div>
      </div>
    </section>
  );
}