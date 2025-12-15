import React, { useState, Fragment } from 'react';
import { PageHeader } from '@/components/sturij/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { User, ThumbsUp, Check, CheckCircle, MessageSquare, Tag, Paperclip, Smile, Flame, Heart, Frown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TailwindFeedsShowcase() {
  return (
    <div className="space-y-12">
      <PageHeader
        title="Activity Feeds & Timelines"
        description="Timeline and activity feed patterns converted to use design tokens."
      />

      <SimpleTimelineExample />
      <RichActivityFeedExample />

      <TokenReference />
    </div>
  );
}

function SimpleTimelineExample() {
  const timeline = [
    {
      id: 1,
      content: 'Applied to',
      target: 'Front End Developer',
      href: '#',
      date: 'Sep 20',
      datetime: '2020-09-20',
      icon: User,
      iconBackground: 'bg-charcoal-400',
    },
    {
      id: 2,
      content: 'Advanced to phone screening by',
      target: 'Bethany Blake',
      href: '#',
      date: 'Sep 22',
      datetime: '2020-09-22',
      icon: ThumbsUp,
      iconBackground: 'bg-midnight-500',
    },
    {
      id: 3,
      content: 'Completed phone screening with',
      target: 'Martha Gardner',
      href: '#',
      date: 'Sep 28',
      datetime: '2020-09-28',
      icon: Check,
      iconBackground: 'bg-primary-500',
    },
    {
      id: 4,
      content: 'Advanced to interview by',
      target: 'Bethany Blake',
      href: '#',
      date: 'Sep 30',
      datetime: '2020-09-30',
      icon: ThumbsUp,
      iconBackground: 'bg-midnight-500',
    },
    {
      id: 5,
      content: 'Completed interview with',
      target: 'Katherine Snyder',
      href: '#',
      date: 'Oct 4',
      datetime: '2020-10-04',
      icon: Check,
      iconBackground: 'bg-primary-500',
    },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Simple Timeline</h2>
        <p className="text-sm text-muted-foreground">Vertical timeline with icons and connecting line</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flow-root">
          <ul role="list" className="-mb-8">
            {timeline.map((event, eventIdx) => (
              <li key={event.id}>
                <div className="relative pb-8">
                  {eventIdx !== timeline.length - 1 ? (
                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-border" />
                  ) : null}
                  <div className="relative flex space-x-3">
                    <div>
                      <span
                        className={cn(
                          event.iconBackground,
                          'flex h-8 w-8 items-center justify-center rounded-full ring-8 ring-card'
                        )}
                      >
                        <event.icon className="h-5 w-5 text-white" />
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {event.content}{' '}
                          <a href={event.href} className="font-medium text-foreground">
                            {event.target}
                          </a>
                        </p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-muted-foreground">
                        <time dateTime={event.datetime}>{event.date}</time>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Connecting line: <code className="bg-background px-1 py-0.5 rounded">bg-border</code></li>
          <li>• Icon backgrounds: <code className="bg-background px-1 py-0.5 rounded">bg-primary-500</code>, <code className="bg-background px-1 py-0.5 rounded">bg-midnight-500</code></li>
          <li>• Ring around icon: <code className="bg-background px-1 py-0.5 rounded">ring-8 ring-card</code></li>
        </ul>
      </div>
    </section>
  );
}

function ActivityFeedExample() {
  const [selectedMood, setSelectedMood] = useState('none');

  const activity = [
    { id: 1, type: 'created', person: { name: 'Chelsea Hagon' }, date: '7d ago', dateTime: '2023-01-23T10:32' },
    { id: 2, type: 'edited', person: { name: 'Chelsea Hagon' }, date: '6d ago', dateTime: '2023-01-23T11:03' },
    { id: 3, type: 'sent', person: { name: 'Chelsea Hagon' }, date: '6d ago', dateTime: '2023-01-23T11:24' },
    {
      id: 4,
      type: 'commented',
      person: {
        name: 'Chelsea Hagon',
        imageUrl: 'https://images.unsplash.com/photo-1550525811-e5869dd03032?w=256&h=256&fit=crop',
      },
      comment: 'Called client, they reassured me the invoice would be paid by the 25th.',
      date: '3d ago',
      dateTime: '2023-01-23T15:56',
    },
    { id: 5, type: 'viewed', person: { name: 'Alex Curren' }, date: '2d ago', dateTime: '2023-01-24T09:12' },
    { id: 6, type: 'paid', person: { name: 'Alex Curren' }, date: '1d ago', dateTime: '2023-01-24T09:20' },
  ];

  const moods = [
    { name: 'None', value: 'none', icon: Smile },
    { name: 'Excited', value: 'excited', icon: Flame },
    { name: 'Loved', value: 'loved', icon: Heart },
    { name: 'Happy', value: 'happy', icon: Smile },
    { name: 'Sad', value: 'sad', icon: Frown },
    { name: 'Thumbsy', value: 'thumbsy', icon: ThumbsUp },
  ];

  const currentMood = moods.find(m => m.value === selectedMood) || moods[0];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Activity Feed with Comments</h2>
        <p className="text-sm text-muted-foreground">Rich activity feed with inline comment form</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <ul role="list" className="space-y-6">
          {activity.map((activityItem, activityItemIdx) => (
            <li key={activityItem.id} className="relative flex gap-x-4">
              <div
                className={cn(
                  activityItemIdx === activity.length - 1 ? 'h-6' : '-bottom-6',
                  'absolute top-0 left-0 flex w-6 justify-center'
                )}
              >
                <div className="w-px bg-border" />
              </div>
              {activityItem.type === 'commented' ? (
                <>
                  <Avatar className="relative mt-3 h-6 w-6 flex-none">
                    <AvatarImage src={activityItem.person.imageUrl} alt={activityItem.person.name} />
                    <AvatarFallback className="text-xs">{activityItem.person.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-auto rounded-lg p-3 ring-1 ring-border">
                    <div className="flex justify-between gap-x-4">
                      <div className="py-0.5 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{activityItem.person.name}</span> commented
                      </div>
                      <time dateTime={activityItem.dateTime} className="flex-none py-0.5 text-xs text-muted-foreground">
                        {activityItem.date}
                      </time>
                    </div>
                    <p className="text-sm text-muted-foreground">{activityItem.comment}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="relative flex h-6 w-6 flex-none items-center justify-center bg-card">
                    {activityItem.type === 'paid' ? (
                      <CheckCircle className="h-6 w-6 text-primary" />
                    ) : (
                      <div className="h-1.5 w-1.5 rounded-full bg-muted ring ring-border" />
                    )}
                  </div>
                  <p className="flex-auto py-0.5 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{activityItem.person.name}</span> {activityItem.type} the invoice.
                  </p>
                  <time dateTime={activityItem.dateTime} className="flex-none py-0.5 text-xs text-muted-foreground">
                    {activityItem.date}
                  </time>
                </>
              )}
            </li>
          ))}
        </ul>

        {/* New comment form */}
        <div className="mt-6 flex gap-x-3">
          <Avatar className="h-6 w-6 flex-none">
            <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=256&h=256&fit=crop" />
            <AvatarFallback>TC</AvatarFallback>
          </Avatar>
          <form className="relative flex-auto">
            <div className="overflow-hidden rounded-lg pb-12 ring-1 ring-border focus-within:ring-2 focus-within:ring-primary">
              <label htmlFor="comment" className="sr-only">
                Add your comment
              </label>
              <Textarea
                id="comment"
                name="comment"
                rows={2}
                placeholder="Add your comment..."
                className="block w-full resize-none border-0 bg-transparent px-3 py-1.5 text-sm placeholder:text-muted-foreground focus-visible:ring-0"
              />
            </div>

            <div className="absolute inset-x-0 bottom-0 flex justify-between py-2 pr-2 pl-3">
              <div className="flex items-center space-x-5">
                <Button type="button" variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground">
                  <Paperclip className="h-5 w-5" />
                  <span className="sr-only">Attach a file</span>
                </Button>
                
                <Select value={selectedMood} onValueChange={setSelectedMood}>
                  <SelectTrigger className="w-10 h-10 p-0 border-0 text-muted-foreground hover:text-foreground">
                    <SelectValue>
                      {currentMood.value === 'none' ? (
                        <Smile className="h-5 w-5" />
                      ) : (
                        <currentMood.icon className="h-5 w-5" />
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {moods.map((mood) => (
                      <SelectItem key={mood.value} value={mood.value}>
                        <div className="flex items-center gap-x-3">
                          <mood.icon className="h-5 w-5 text-muted-foreground" />
                          <span>{mood.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" variant="outline" size="sm">
                Comment
              </Button>
            </div>
          </form>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Timeline connector: <code className="bg-background px-1 py-0.5 rounded">w-px bg-border</code></li>
          <li>• Comment box: <code className="bg-background px-1 py-0.5 rounded">ring-1 ring-border focus-within:ring-primary</code></li>
          <li>• Paid status: <code className="bg-background px-1 py-0.5 rounded">text-primary</code></li>
          <li>• Select component from Radix UI for mood picker</li>
        </ul>
      </div>
    </section>
  );
}

function RichActivityFeedExample() {
  const activity = [
    {
      id: 1,
      type: 'comment',
      person: { name: 'Eduardo Benz', href: '#' },
      imageUrl: 'https://images.unsplash.com/photo-1520785643438-5bf77931f493?w=256&h=256&fit=crop',
      comment: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tincidunt nunc ipsum tempor purus vitae id.',
      date: '6d ago',
    },
    {
      id: 2,
      type: 'assignment',
      person: { name: 'Hilary Mahy', href: '#' },
      assigned: { name: 'Kristin Watson', href: '#' },
      date: '2d ago',
    },
    {
      id: 3,
      type: 'tags',
      person: { name: 'Hilary Mahy', href: '#' },
      tags: [
        { name: 'Bug', href: '#', color: 'destructive' },
        { name: 'Accessibility', href: '#', color: 'info' },
      ],
      date: '6h ago',
    },
    {
      id: 4,
      type: 'comment',
      person: { name: 'Jason Meyers', href: '#' },
      imageUrl: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=256&h=256&fit=crop',
      comment: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nisl ultrices eu venenatis diam.',
      date: '2h ago',
    },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Rich Activity Feed</h2>
        <p className="text-sm text-muted-foreground">Activity stream with multiple event types</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flow-root">
          <ul role="list" className="-mb-8">
            {activity.map((activityItem, activityItemIdx) => (
              <li key={activityItem.id}>
                <div className="relative pb-8">
                  {activityItemIdx !== activity.length - 1 ? (
                    <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-border" />
                  ) : null}
                  <div className="relative flex items-start space-x-3">
                    {activityItem.type === 'comment' ? (
                      <>
                        <div className="relative">
                          <Avatar className="h-10 w-10 ring-8 ring-card">
                            <AvatarImage src={activityItem.imageUrl} alt={activityItem.person.name} />
                            <AvatarFallback>{activityItem.person.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <span className="absolute -right-1 -bottom-0.5 rounded-tl bg-card px-0.5 py-px">
                            <MessageSquare className="h-5 w-5 text-muted-foreground" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div>
                            <div className="text-sm">
                              <a href={activityItem.person.href} className="font-medium">
                                {activityItem.person.name}
                              </a>
                            </div>
                            <p className="mt-0.5 text-sm text-muted-foreground">Commented {activityItem.date}</p>
                          </div>
                          <div className="mt-2 text-sm text-muted-foreground">
                            <p>{activityItem.comment}</p>
                          </div>
                        </div>
                      </>
                    ) : activityItem.type === 'assignment' ? (
                      <>
                        <div>
                          <div className="relative px-1">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted ring-8 ring-card">
                              <User className="h-5 w-5 text-muted-foreground" />
                            </div>
                          </div>
                        </div>
                        <div className="min-w-0 flex-1 py-1.5">
                          <div className="text-sm text-muted-foreground">
                            <a href={activityItem.person.href} className="font-medium text-foreground">
                              {activityItem.person.name}
                            </a>{' '}
                            assigned{' '}
                            <a href={activityItem.assigned.href} className="font-medium text-foreground">
                              {activityItem.assigned.name}
                            </a>{' '}
                            <span className="whitespace-nowrap">{activityItem.date}</span>
                          </div>
                        </div>
                      </>
                    ) : activityItem.type === 'tags' ? (
                      <>
                        <div>
                          <div className="relative px-1">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted ring-8 ring-card">
                              <Tag className="h-5 w-5 text-muted-foreground" />
                            </div>
                          </div>
                        </div>
                        <div className="min-w-0 flex-1 py-0">
                          <div className="text-sm text-muted-foreground">
                            <span className="mr-0.5">
                              <a href={activityItem.person.href} className="font-medium text-foreground">
                                {activityItem.person.name}
                              </a>{' '}
                              added tags
                            </span>{' '}
                            <span className="mr-0.5">
                              {activityItem.tags.map((tag) => (
                                <Fragment key={tag.name}>
                                  <Badge variant={tag.color} className="mr-1">
                                    {tag.name}
                                  </Badge>
                                </Fragment>
                              ))}
                            </span>
                            <span className="whitespace-nowrap">{activityItem.date}</span>
                          </div>
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Comment avatar with badge overlay</li>
          <li>• Generic events: <code className="bg-background px-1 py-0.5 rounded">bg-muted</code> icon background</li>
          <li>• Important events: <code className="bg-background px-1 py-0.5 rounded">text-primary</code> CheckCircle</li>
          <li>• Tag badges using variant prop</li>
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
        <p className="text-sm text-muted-foreground">Complete token reference for activity feeds</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-border p-4 space-y-2">
          <h3 className="text-sm font-medium">Timeline Elements</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Connector: <code className="bg-muted px-1 py-0.5 rounded">w-px bg-border</code></li>
            <li>• Icon ring: <code className="bg-muted px-1 py-0.5 rounded">ring-8 ring-card</code></li>
            <li>• Event icons with colored backgrounds</li>
          </ul>
        </div>

        <div className="rounded-lg border border-border p-4 space-y-2">
          <h3 className="text-sm font-medium">Event Types</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Comments with avatar and message box</li>
            <li>• Assignments with user icon</li>
            <li>• Tags with badge components</li>
            <li>• Status changes with CheckCircle</li>
          </ul>
        </div>

        <div className="rounded-lg border border-border p-4 space-y-2">
          <h3 className="text-sm font-medium">Components Used</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Avatar for user images</li>
            <li>• Badge for tags and status</li>
            <li>• Select for mood picker</li>
            <li>• Textarea for comment input</li>
          </ul>
        </div>
      </div>
    </section>
  );
}