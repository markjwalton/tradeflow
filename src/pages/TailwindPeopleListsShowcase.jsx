import React from 'react';
import { PageHeader } from '@/components/sturij/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronRight, MoreVertical, MessageSquare, CheckCircle } from 'lucide-react';

export default function TailwindPeopleListsShowcase() {
  return (
    <div className="space-y-12">
      <PageHeader
        title="People & Activity Lists"
        description="Team member, discussion, and activity feed layouts converted to design tokens."
      />

      {/* Simple People List */}
      <SimplePeopleListExample />

      {/* Clickable with Chevron */}
      <ClickableChevronExample />

      {/* With Action Menu */}
      <WithActionMenuExample />

      {/* Projects with Status */}
      <ProjectsWithStatusExample />

      {/* In Card Container */}
      <InCardContainerExample />

      {/* Discussion List */}
      <DiscussionListExample />

      {/* Simple Directory */}
      <SimpleDirectoryExample />

      {/* Comments Feed */}
      <CommentsFeedExample />

      {/* Activity Feed */}
      <ActivityFeedExample />

      {/* Token Reference */}
      <TokenReference />
    </div>
  );
}

function SimplePeopleListExample() {
  const people = [
    {
      name: 'Leslie Alexander',
      email: 'leslie.alexander@example.com',
      role: 'Co-Founder / CEO',
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&h=256&fit=crop',
      lastSeen: '3h ago',
      lastSeenDateTime: '2023-01-23T13:23Z',
    },
    {
      name: 'Michael Foster',
      email: 'michael.foster@example.com',
      role: 'Co-Founder / CTO',
      imageUrl: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=256&h=256&fit=crop',
      lastSeen: null,
    },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Simple People List</h2>
        <p className="text-sm text-muted-foreground">Basic team member list with status indicators</p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <ul role="list" className="divide-y divide-border">
          {people.map((person) => (
            <li key={person.email} className="flex justify-between gap-x-6 py-5 px-6">
              <div className="flex min-w-0 gap-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={person.imageUrl} alt={person.name} />
                  <AvatarFallback>{person.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-auto">
                  <p className="text-sm font-semibold">{person.name}</p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{person.email}</p>
                </div>
              </div>
              <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
                <p className="text-sm">{person.role}</p>
                {person.lastSeen ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Last seen <time dateTime={person.lastSeenDateTime}>{person.lastSeen}</time>
                  </p>
                ) : (
                  <div className="mt-1 flex items-center gap-x-1.5">
                    <div className="flex-none rounded-full bg-primary/20 p-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground">Online</p>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Online status: <code className="bg-background px-1 py-0.5 rounded">bg-primary/20</code> with <code className="bg-background px-1 py-0.5 rounded">bg-primary</code> dot</li>
          <li>• Dividers: <code className="bg-background px-1 py-0.5 rounded">divide-border</code></li>
          <li>• Avatar from Radix UI</li>
        </ul>
      </div>
    </section>
  );
}

function ClickableChevronExample() {
  const people = [
    {
      name: 'Leslie Alexander',
      email: 'leslie.alexander@example.com',
      role: 'Co-Founder / CEO',
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&h=256&fit=crop',
      href: '#',
      lastSeen: '3h ago',
    },
    {
      name: 'Michael Foster',
      email: 'michael.foster@example.com',
      role: 'Co-Founder / CTO',
      imageUrl: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=256&h=256&fit=crop',
      href: '#',
      lastSeen: null,
    },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Clickable with Chevron</h2>
        <p className="text-sm text-muted-foreground">Entire row is clickable with visual indicator</p>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <ul role="list" className="divide-y divide-border">
          {people.map((person) => (
            <li key={person.email} className="relative flex justify-between gap-x-6 py-5 px-4 hover:bg-muted transition-colors sm:px-6">
              <div className="flex min-w-0 gap-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={person.imageUrl} alt={person.name} />
                  <AvatarFallback>{person.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-auto">
                  <p className="text-sm font-semibold">
                    <a href={person.href}>
                      <span className="absolute inset-x-0 -top-px bottom-0" />
                      {person.name}
                    </a>
                  </p>
                  <p className="mt-1 flex text-xs text-muted-foreground">
                    <a href={`mailto:${person.email}`} className="relative truncate hover:underline">
                      {person.email}
                    </a>
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-x-4">
                <div className="hidden sm:flex sm:flex-col sm:items-end">
                  <p className="text-sm">{person.role}</p>
                  {person.lastSeen ? (
                    <p className="mt-1 text-xs text-muted-foreground">Last seen {person.lastSeen}</p>
                  ) : (
                    <div className="mt-1 flex items-center gap-x-1.5">
                      <div className="flex-none rounded-full bg-primary/20 p-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      </div>
                      <p className="text-xs text-muted-foreground">Online</p>
                    </div>
                  )}
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Entire row hover: <code className="bg-background px-1 py-0.5 rounded">hover:bg-muted</code></li>
          <li>• Absolute overlay link for click target</li>
          <li>• ChevronRight icon as visual indicator</li>
        </ul>
      </div>
    </section>
  );
}

function WithActionMenuExample() {
  const people = [
    {
      name: 'Leslie Alexander',
      email: 'leslie.alexander@example.com',
      role: 'Co-Founder / CEO',
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&h=256&fit=crop',
      href: '#',
      lastSeen: '3h ago',
    },
    {
      name: 'Michael Foster',
      email: 'michael.foster@example.com',
      role: 'Co-Founder / CTO',
      imageUrl: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=256&h=256&fit=crop',
      href: '#',
      lastSeen: null,
    },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">With Action Menu</h2>
        <p className="text-sm text-muted-foreground">List with dropdown menu for row actions</p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <ul role="list" className="divide-y divide-border">
          {people.map((person) => (
            <li key={person.email} className="flex justify-between gap-x-6 py-5 px-6">
              <div className="flex min-w-0 gap-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={person.imageUrl} alt={person.name} />
                  <AvatarFallback>{person.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-auto">
                  <p className="text-sm font-semibold">
                    <a href={person.href} className="hover:underline">
                      {person.name}
                    </a>
                  </p>
                  <p className="mt-1 flex text-xs text-muted-foreground">
                    <a href={`mailto:${person.email}`} className="truncate hover:underline">
                      {person.email}
                    </a>
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-x-6">
                <div className="hidden sm:flex sm:flex-col sm:items-end">
                  <p className="text-sm">{person.role}</p>
                  {person.lastSeen ? (
                    <p className="mt-1 text-xs text-muted-foreground">Last seen {person.lastSeen}</p>
                  ) : (
                    <div className="mt-1 flex items-center gap-x-1.5">
                      <div className="flex-none rounded-full bg-primary/20 p-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      </div>
                      <p className="text-xs text-muted-foreground">Online</p>
                    </div>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-muted-foreground">
                      <span className="sr-only">Open options</span>
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View profile</DropdownMenuItem>
                    <DropdownMenuItem>Message</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Menu trigger: <code className="bg-background px-1 py-0.5 rounded">variant="ghost"</code></li>
          <li>• DropdownMenu from Radix UI</li>
        </ul>
      </div>
    </section>
  );
}

function ProjectsWithStatusExample() {
  const projects = [
    {
      id: 1,
      name: 'GraphQL API',
      href: '#',
      status: 'Complete',
      createdBy: 'Leslie Alexander',
      dueDate: 'March 17, 2023',
      dueDateTime: '2023-03-17T00:00Z',
    },
    {
      id: 2,
      name: 'New benefits plan',
      href: '#',
      status: 'In progress',
      createdBy: 'Leslie Alexander',
      dueDate: 'May 5, 2023',
      dueDateTime: '2023-05-05T00:00Z',
    },
    {
      id: 3,
      name: 'Marketing site redesign',
      href: '#',
      status: 'Archived',
      createdBy: 'Courtney Henry',
      dueDate: 'June 10, 2023',
      dueDateTime: '2023-06-10T00:00Z',
    },
  ];

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Complete':
        return 'bg-primary-50 text-primary-700 border-primary-200';
      case 'In progress':
        return 'bg-muted text-muted-foreground border-border';
      case 'Archived':
        return 'bg-secondary-50 text-secondary-700 border-secondary-200';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Projects with Status Badges</h2>
        <p className="text-sm text-muted-foreground">Project list with status indicators and metadata</p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <ul role="list" className="divide-y divide-border">
          {projects.map((project) => (
            <li key={project.id} className="flex items-center justify-between gap-x-6 py-5 px-6">
              <div className="min-w-0">
                <div className="flex items-start gap-x-3">
                  <p className="text-sm font-semibold">{project.name}</p>
                  <Badge className={getStatusVariant(project.status)}>
                    {project.status}
                  </Badge>
                </div>
                <div className="mt-1 flex items-center gap-x-2 text-xs text-muted-foreground">
                  <p className="whitespace-nowrap">
                    Due on <time dateTime={project.dueDateTime}>{project.dueDate}</time>
                  </p>
                  <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 fill-current">
                    <circle r={1} cx={1} cy={1} />
                  </svg>
                  <p className="truncate">Created by {project.createdBy}</p>
                </div>
              </div>
              <div className="flex flex-none items-center gap-x-4">
                <Button variant="outline" size="sm" className="hidden sm:block">
                  View project
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-muted-foreground">
                      <span className="sr-only">Open options</span>
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>Move</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Complete: <code className="bg-background px-1 py-0.5 rounded">bg-primary-50 text-primary-700</code></li>
          <li>• In progress: <code className="bg-background px-1 py-0.5 rounded">bg-muted</code></li>
          <li>• Archived: <code className="bg-background px-1 py-0.5 rounded">bg-secondary-50 text-secondary-700</code></li>
          <li>• Dot separator between metadata items</li>
        </ul>
      </div>
    </section>
  );
}

function InCardContainerExample() {
  const people = [
    {
      name: 'Leslie Alexander',
      email: 'leslie.alexander@example.com',
      href: '#',
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&h=256&fit=crop',
    },
    {
      name: 'Michael Foster',
      email: 'michael.foster@example.com',
      href: '#',
      imageUrl: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=256&h=256&fit=crop',
    },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">In Card with Action Button</h2>
        <p className="text-sm text-muted-foreground">List wrapped in card with view button</p>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <ul role="list" className="divide-y divide-border">
          {people.map((person) => (
            <li key={person.email} className="flex items-center justify-between gap-x-6 py-5 px-6">
              <div className="flex min-w-0 gap-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={person.imageUrl} alt={person.name} />
                  <AvatarFallback>{person.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-auto">
                  <p className="text-sm font-semibold">{person.name}</p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{person.email}</p>
                </div>
              </div>
              <Button variant="outline" size="sm">View</Button>
            </li>
          ))}
        </ul>
        <div className="border-t border-border px-6 py-4">
          <Button variant="outline" className="w-full">View all</Button>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Card: <code className="bg-background px-1 py-0.5 rounded">shadow-sm border</code></li>
          <li>• Footer with "View all" button</li>
        </ul>
      </div>
    </section>
  );
}

function DiscussionListExample() {
  const discussions = [
    {
      id: 1,
      title: 'Atque perspiciatis et et aut ut porro voluptatem blanditiis?',
      href: '#',
      author: { name: 'Leslie Alexander', href: '#' },
      date: '2d ago',
      status: 'active',
      totalComments: 24,
      commenters: [
        { id: 1, name: 'Emma', imageUrl: 'https://images.unsplash.com/photo-1505840717430-882ce147ef2d?w=256&h=256&fit=crop' },
        { id: 2, name: 'Tom', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=256&h=256&fit=crop' },
      ],
    },
    {
      id: 2,
      title: 'Blanditiis perferendis fugiat optio dolor minus ut?',
      href: '#',
      author: { name: 'Dries Vincent', href: '#' },
      date: '3d ago',
      status: 'resolved',
      totalComments: 22,
      commenters: [
        { id: 3, name: 'Lawrence', imageUrl: 'https://images.unsplash.com/photo-1513910367299-bce8d8a0ebf6?w=256&h=256&fit=crop' },
      ],
    },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Discussion List</h2>
        <p className="text-sm text-muted-foreground">Forum-style discussions with avatars and status</p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <ul role="list" className="divide-y divide-border">
          {discussions.map((discussion) => (
            <li key={discussion.id} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 py-5 px-6 sm:flex-nowrap">
              <div>
                <p className="text-sm font-semibold">
                  <a href={discussion.href} className="hover:underline">
                    {discussion.title}
                  </a>
                </p>
                <div className="mt-1 flex items-center gap-x-2 text-xs text-muted-foreground">
                  <p>
                    <a href={discussion.author.href} className="hover:underline">
                      {discussion.author.name}
                    </a>
                  </p>
                  <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 fill-current">
                    <circle r={1} cx={1} cy={1} />
                  </svg>
                  <p>{discussion.date}</p>
                </div>
              </div>
              <dl className="flex w-full flex-none justify-between gap-x-8 sm:w-auto">
                <div className="flex -space-x-0.5">
                  <dt className="sr-only">Commenters</dt>
                  {discussion.commenters.map((commenter) => (
                    <dd key={commenter.id}>
                      <Avatar className="h-6 w-6 ring-2 ring-card">
                        <AvatarImage src={commenter.imageUrl} alt={commenter.name} />
                        <AvatarFallback className="text-xs">{commenter.name[0]}</AvatarFallback>
                      </Avatar>
                    </dd>
                  ))}
                </div>
                <div className="flex w-16 gap-x-2.5">
                  <dt>
                    <span className="sr-only">Total comments</span>
                    {discussion.status === 'resolved' ? (
                      <CheckCircle className="h-6 w-6 text-muted-foreground" />
                    ) : (
                      <MessageSquare className="h-6 w-6 text-muted-foreground" />
                    )}
                  </dt>
                  <dd className="text-sm">{discussion.totalComments}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Overlapping avatars: <code className="bg-background px-1 py-0.5 rounded">-space-x-0.5</code></li>
          <li>• Avatar ring: <code className="bg-background px-1 py-0.5 rounded">ring-2 ring-card</code></li>
          <li>• Status icons: CheckCircle for resolved, MessageSquare for active</li>
        </ul>
      </div>
    </section>
  );
}

function SimpleDirectoryExample() {
  const people = [
    {
      name: 'Leslie Alexander',
      email: 'leslie.alexander@example.com',
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&h=256&fit=crop',
    },
    {
      name: 'Michael Foster',
      email: 'michael.foster@example.com',
      imageUrl: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=256&h=256&fit=crop',
    },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Simple Directory</h2>
        <p className="text-sm text-muted-foreground">Minimal contact list without extra metadata</p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <ul role="list" className="divide-y divide-border">
          {people.map((person) => (
            <li key={person.email} className="flex gap-x-4 py-5 px-6">
              <Avatar className="h-12 w-12">
                <AvatarImage src={person.imageUrl} alt={person.name} />
                <AvatarFallback>{person.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{person.name}</p>
                <p className="mt-1 truncate text-xs text-muted-foreground">{person.email}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Minimal design with just name and email</li>
          <li>• Clean spacing with <code className="bg-background px-1 py-0.5 rounded">gap-x-4</code></li>
        </ul>
      </div>
    </section>
  );
}

function CommentsFeedExample() {
  const comments = [
    {
      id: 1,
      name: 'Leslie Alexander',
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&h=256&fit=crop',
      content: 'Explicabo nihil laborum. Saepe facilis consequuntur in eaque. Consequatur perspiciatis quam.',
      date: '1d ago',
      dateTime: '2023-03-04T15:54Z',
    },
    {
      id: 2,
      name: 'Michael Foster',
      imageUrl: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=256&h=256&fit=crop',
      content: 'Laudantium quidem non et saepe vel sequi accusamus consequatur et. Saepe inventore veniam.',
      date: '2d ago',
      dateTime: '2023-03-03T14:02Z',
    },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Comments Feed</h2>
        <p className="text-sm text-muted-foreground">Chronological comment list with timestamps</p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <ul role="list" className="divide-y divide-border">
          {comments.map((comment) => (
            <li key={comment.id} className="flex gap-x-4 py-5 px-6">
              <Avatar className="h-12 w-12">
                <AvatarImage src={comment.imageUrl} alt={comment.name} />
                <AvatarFallback>{comment.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="flex-auto">
                <div className="flex items-baseline justify-between gap-x-4">
                  <p className="text-sm font-semibold">{comment.name}</p>
                  <p className="flex-none text-xs text-muted-foreground">
                    <time dateTime={comment.dateTime}>{comment.date}</time>
                  </p>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{comment.content}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Content: <code className="bg-background px-1 py-0.5 rounded">line-clamp-2</code> for truncation</li>
          <li>• Timestamp aligned to top-right</li>
        </ul>
      </div>
    </section>
  );
}

function ActivityFeedExample() {
  const activityItems = [
    {
      user: {
        name: 'Michael Foster',
        imageUrl: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=256&h=256&fit=crop',
      },
      projectName: 'ios-app',
      commit: '2d89f0c8',
      branch: 'main',
      date: '1h',
      dateTime: '2023-01-23T11:00',
    },
    {
      user: {
        name: 'Lindsay Walton',
        imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=256&h=256&fit=crop',
      },
      projectName: 'mobile-api',
      commit: '249df660',
      branch: 'main',
      date: '3h',
      dateTime: '2023-01-23T09:00',
    },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Activity Feed</h2>
        <p className="text-sm text-muted-foreground">Git-style activity stream with commit info</p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <ul role="list" className="divide-y divide-border">
          {activityItems.map((item) => (
            <li key={item.commit} className="py-4 px-6">
              <div className="flex items-center gap-x-3">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={item.user.imageUrl} alt={item.user.name} />
                  <AvatarFallback className="text-xs">{item.user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <h3 className="flex-auto truncate text-sm font-semibold">{item.user.name}</h3>
                <time dateTime={item.dateTime} className="flex-none text-xs text-muted-foreground">
                  {item.date}
                </time>
              </div>
              <p className="mt-3 truncate text-sm text-muted-foreground">
                Pushed to <span className="text-foreground">{item.projectName}</span> (
                <span className="font-mono text-foreground">{item.commit}</span> on{' '}
                <span className="text-foreground">{item.branch}</span>)
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Small avatar: <code className="bg-background px-1 py-0.5 rounded">h-6 w-6</code></li>
          <li>• Highlighted text: <code className="bg-background px-1 py-0.5 rounded">text-foreground</code></li>
          <li>• Monospace for commit hash: <code className="bg-background px-1 py-0.5 rounded">font-mono</code></li>
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
        <p className="text-sm text-muted-foreground">Complete token reference for list layouts</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-border p-4 space-y-2">
          <h3 className="text-sm font-medium">Components</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Avatar with fallback initials</li>
            <li>• Badge for status indicators</li>
            <li>• DropdownMenu for actions</li>
            <li>• Button variants (outline, ghost)</li>
          </ul>
        </div>

        <div className="rounded-lg border border-border p-4 space-y-2">
          <h3 className="text-sm font-medium">Status Colors</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Online: <code className="bg-muted px-1 py-0.5 rounded">bg-primary/20</code></li>
            <li>• Complete: <code className="bg-muted px-1 py-0.5 rounded">bg-primary-50</code></li>
            <li>• Warning: <code className="bg-muted px-1 py-0.5 rounded">bg-secondary-50</code></li>
          </ul>
        </div>

        <div className="rounded-lg border border-border p-4 space-y-2">
          <h3 className="text-sm font-medium">Interaction Patterns</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Hover state reveals actions</li>
            <li>• Entire row clickable via overlay</li>
            <li>• Nested interactive elements</li>
          </ul>
        </div>
      </div>
    </section>
  );
}