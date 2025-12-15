import React from 'react';
import { PageHeader } from '@/components/sturij/PageHeader';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ChevronLeft, ChevronRight, ChevronDown, MoreHorizontal, MoreVertical, Calendar as CalendarIcon, MapPin, Clock } from 'lucide-react';

export default function TailwindCalendarShowcase() {
  return (
    <div className="space-y-12">
      <PageHeader
        title="Calendar Layouts"
        description="Calendar views and meeting lists converted to use design tokens and Radix UI."
      />

      {/* Meeting List with Mini Calendar */}
      <MeetingListExample />

      {/* Small Calendar with Schedule */}
      <SmallCalendarScheduleExample />

      {/* Two Panel Calendar */}
      <TwoPanelCalendarExample />

      {/* Token Reference */}
      <TokenReference />
    </div>
  );
}

function MeetingListExample() {
  const meetings = [
    {
      id: 1,
      date: 'January 10th, 2022',
      time: '5:00 PM',
      datetime: '2022-01-10T17:00',
      name: 'Leslie Alexander',
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&h=256&fit=crop',
      location: 'Starbucks',
    },
    {
      id: 2,
      date: 'January 12th, 2022',
      time: '3:00 PM',
      datetime: '2022-01-12T15:00',
      name: 'Michael Foster',
      imageUrl: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=256&h=256&fit=crop',
      location: 'Tim Hortons',
    },
    {
      id: 3,
      date: 'January 12th, 2022',
      time: '5:00 PM',
      datetime: '2022-01-12T17:00',
      name: 'Dries Vincent',
      imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=256&h=256&fit=crop',
      location: 'Costa Coffee at Braehead',
    },
  ];

  const days = Array.from({ length: 42 }, (_, i) => {
    const date = new Date(2022, 0, 1 - 5 + i);
    const isCurrentMonth = date.getMonth() === 0;
    const isToday = i === 16;
    const isSelected = i === 26;
    return { date: date.toISOString().split('T')[0], isCurrentMonth, isToday, isSelected };
  });

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Meeting List with Mini Calendar</h2>
        <p className="text-sm text-muted-foreground">Sidebar calendar with meeting list layout</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold mb-6">Upcoming meetings</h2>
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-16">
          <div className="mt-10 text-center lg:col-start-8 lg:col-end-13 lg:row-start-1 lg:mt-9 xl:col-start-9">
            <div className="flex items-center text-foreground">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                <span className="sr-only">Previous month</span>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="flex-auto text-sm font-semibold">January</div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                <span className="sr-only">Next month</span>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            <div className="mt-6 grid grid-cols-7 text-xs text-muted-foreground">
              <div>M</div>
              <div>T</div>
              <div>W</div>
              <div>T</div>
              <div>F</div>
              <div>S</div>
              <div>S</div>
            </div>
            <div className="isolate mt-2 grid grid-cols-7 gap-px rounded-lg bg-border text-sm shadow-sm">
              {days.map((day, idx) => (
                <button
                  key={day.date}
                  type="button"
                  className={`py-1.5 ${
                    !day.isCurrentMonth ? 'bg-muted/50 text-muted-foreground' : 'bg-card'
                  } ${idx === 0 ? 'rounded-tl-lg' : ''} ${idx === 6 ? 'rounded-tr-lg' : ''} ${
                    idx === 35 ? 'rounded-bl-lg' : ''
                  } ${idx === 41 ? 'rounded-br-lg' : ''} hover:bg-muted focus:z-10 ${
                    day.isCurrentMonth && !day.isSelected && !day.isToday ? 'text-foreground' : ''
                  } ${day.isSelected ? 'font-semibold text-primary-foreground' : ''} ${
                    day.isToday && !day.isSelected ? 'font-semibold text-primary' : ''
                  }`}
                >
                  <time
                    dateTime={day.date}
                    className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full ${
                      day.isSelected && !day.isToday ? 'bg-foreground' : ''
                    } ${day.isSelected && day.isToday ? 'bg-primary' : ''}`}
                  >
                    {day.date.split('-').pop().replace(/^0/, '')}
                  </time>
                </button>
              ))}
            </div>
            <Button className="mt-8 w-full">Add event</Button>
          </div>
          <ol className="mt-4 divide-y divide-border text-sm lg:col-span-7 xl:col-span-8">
            {meetings.map((meeting) => (
              <li key={meeting.id} className="relative flex gap-x-6 py-6 xl:static">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={meeting.imageUrl} alt={meeting.name} />
                </Avatar>
                <div className="flex-auto">
                  <h3 className="pr-10 font-semibold xl:pr-0">{meeting.name}</h3>
                  <dl className="mt-2 flex flex-col text-muted-foreground xl:flex-row">
                    <div className="flex items-start gap-x-3">
                      <dt className="mt-0.5">
                        <span className="sr-only">Date</span>
                        <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                      </dt>
                      <dd>
                        <time dateTime={meeting.datetime}>
                          {meeting.date} at {meeting.time}
                        </time>
                      </dd>
                    </div>
                    <div className="mt-2 flex items-start gap-x-3 xl:mt-0 xl:ml-3.5 xl:border-l xl:border-border xl:pl-3.5">
                      <dt className="mt-0.5">
                        <span className="sr-only">Location</span>
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                      </dt>
                      <dd>{meeting.location}</dd>
                    </div>
                  </dl>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="absolute top-6 right-0 xl:relative xl:top-auto xl:right-auto xl:self-center text-muted-foreground">
                      <span className="sr-only">Open options</span>
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>Cancel</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Calendar grid: <code className="bg-background px-1 py-0.5 rounded">gap-px bg-border</code></li>
          <li>• Today: <code className="bg-background px-1 py-0.5 rounded">text-primary bg-primary</code></li>
          <li>• Selected: <code className="bg-background px-1 py-0.5 rounded">bg-foreground text-primary-foreground</code></li>
          <li>• Avatar from Radix UI</li>
          <li>• DropdownMenu from Radix UI</li>
        </ul>
      </div>
    </section>
  );
}

function SmallCalendarScheduleExample() {
  const meetings = [
    {
      id: 1,
      name: 'Leslie Alexander',
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&h=256&fit=crop',
      start: '1:00 PM',
      startDatetime: '2022-01-21T13:00',
      end: '2:30 PM',
      endDatetime: '2022-01-21T14:30',
    },
    {
      id: 2,
      name: 'Michael Foster',
      imageUrl: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=256&h=256&fit=crop',
      start: '3:00 PM',
      startDatetime: '2022-01-21T15:00',
      end: '4:30 PM',
      endDatetime: '2022-01-21T16:30',
    },
  ];

  const days = Array.from({ length: 42 }, (_, i) => {
    const date = new Date(2022, 0, 1 - 5 + i);
    const isCurrentMonth = date.getMonth() === 0;
    const isToday = i === 16;
    const isSelected = i === 25;
    return { date: date.toISOString().split('T')[0], isCurrentMonth, isToday, isSelected };
  });

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Small Calendar with Schedule</h2>
        <p className="text-sm text-muted-foreground">Compact calendar and meeting list side by side</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center mb-6">
          <h2 className="flex-auto text-sm font-semibold">January 2022</h2>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
            <span className="sr-only">Previous month</span>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground ml-2">
            <span className="sr-only">Next month</span>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        <div className="grid grid-cols-7 text-center text-xs text-muted-foreground">
          <div>M</div>
          <div>T</div>
          <div>W</div>
          <div>T</div>
          <div>F</div>
          <div>S</div>
          <div>S</div>
        </div>
        <div className="mt-2 grid grid-cols-7 text-sm">
          {days.map((day, dayIdx) => (
            <div
              key={day.date}
              className={`py-2 ${dayIdx > 6 ? 'border-t border-border' : ''}`}
            >
              <button
                type="button"
                className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full ${
                  !day.isCurrentMonth && !day.isSelected && !day.isToday
                    ? 'text-muted-foreground'
                    : ''
                } ${
                  !day.isSelected && !day.isToday
                    ? 'hover:bg-muted'
                    : ''
                } ${
                  day.isCurrentMonth && !day.isSelected && !day.isToday
                    ? 'text-foreground'
                    : ''
                } ${day.isSelected ? 'font-semibold text-primary-foreground' : ''} ${
                  day.isToday && !day.isSelected ? 'font-semibold text-primary' : ''
                } ${day.isSelected && !day.isToday ? 'bg-foreground' : ''} ${
                  day.isSelected && day.isToday ? 'bg-primary' : ''
                }`}
              >
                <time dateTime={day.date}>{day.date.split('-').pop().replace(/^0/, '')}</time>
              </button>
            </div>
          ))}
        </div>
        <section className="mt-12">
          <h2 className="text-base font-semibold">
            Schedule for <time dateTime="2022-01-21">January 21, 2022</time>
          </h2>
          <ol className="mt-4 flex flex-col gap-y-1 text-sm text-muted-foreground">
            {meetings.map((meeting) => (
              <li
                key={meeting.id}
                className="group flex items-center gap-x-4 rounded-xl px-4 py-2 hover:bg-muted transition-colors"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={meeting.imageUrl} alt={meeting.name} />
                </Avatar>
                <div className="flex-auto">
                  <p className="text-foreground">{meeting.name}</p>
                  <p className="mt-0.5">
                    <time dateTime={meeting.startDatetime}>{meeting.start}</time> -{' '}
                    <time dateTime={meeting.endDatetime}>{meeting.end}</time>
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 text-muted-foreground"
                    >
                      <span className="sr-only">Open options</span>
                      <MoreVertical className="h-6 w-6" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>Cancel</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Calendar dividers: <code className="bg-background px-1 py-0.5 rounded">border-border</code></li>
          <li>• Today indicator: <code className="bg-background px-1 py-0.5 rounded">bg-primary text-primary</code></li>
          <li>• Selected day: <code className="bg-background px-1 py-0.5 rounded">bg-foreground</code></li>
          <li>• Meeting hover: <code className="bg-background px-1 py-0.5 rounded">hover:bg-muted</code></li>
        </ul>
      </div>
    </section>
  );
}

function SmallCalendarScheduleExample() {
  const meetings = [
    {
      id: 1,
      name: 'Leslie Alexander',
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&h=256&fit=crop',
      start: '1:00 PM',
      startDatetime: '2022-01-21T13:00',
      end: '2:30 PM',
      endDatetime: '2022-01-21T14:30',
    },
    {
      id: 2,
      name: 'Michael Foster',
      imageUrl: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=256&h=256&fit=crop',
      start: '3:00 PM',
      startDatetime: '2022-01-21T15:00',
      end: '4:30 PM',
      endDatetime: '2022-01-21T16:30',
    },
    {
      id: 3,
      name: 'Dries Vincent',
      imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=256&h=256&fit=crop',
      start: '5:00 PM',
      startDatetime: '2022-01-21T17:00',
      end: '6:30 PM',
      endDatetime: '2022-01-21T18:30',
    },
  ];

  const days = Array.from({ length: 42 }, (_, i) => {
    const date = new Date(2022, 0, 1 - 5 + i);
    const isCurrentMonth = date.getMonth() === 0;
    const isToday = i === 16;
    const isSelected = i === 25;
    return { date: date.toISOString().split('T')[0], isCurrentMonth, isToday, isSelected };
  });

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Compact Calendar Schedule</h2>
        <p className="text-sm text-muted-foreground">Minimal calendar with integrated event list</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center">
          <h2 className="flex-auto text-sm font-semibold">January 2022</h2>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
            <span className="sr-only">Previous month</span>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground ml-2">
            <span className="sr-only">Next month</span>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        <div className="mt-10 grid grid-cols-7 text-center text-xs text-muted-foreground">
          <div>M</div>
          <div>T</div>
          <div>W</div>
          <div>T</div>
          <div>F</div>
          <div>S</div>
          <div>S</div>
        </div>
        <div className="mt-2 grid grid-cols-7 text-sm">
          {days.map((day, dayIdx) => (
            <div key={day.date} className={`py-2 ${dayIdx > 6 ? 'border-t border-border' : ''}`}>
              <button
                type="button"
                className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full ${
                  !day.isSelected && !day.isToday && !day.isCurrentMonth ? 'text-muted-foreground' : ''
                } ${!day.isSelected ? 'hover:bg-muted' : ''} ${
                  !day.isSelected && !day.isToday && day.isCurrentMonth ? 'text-foreground' : ''
                } ${day.isSelected ? 'font-semibold text-primary-foreground' : ''} ${
                  day.isToday && !day.isSelected ? 'font-semibold text-primary' : ''
                } ${day.isSelected && !day.isToday ? 'bg-foreground' : ''} ${
                  day.isSelected && day.isToday ? 'bg-primary' : ''
                }`}
              >
                <time dateTime={day.date}>{day.date.split('-').pop().replace(/^0/, '')}</time>
              </button>
            </div>
          ))}
        </div>
        <section className="mt-12">
          <h2 className="text-base font-semibold">
            Schedule for <time dateTime="2022-01-21">January 21, 2022</time>
          </h2>
          <ol className="mt-4 flex flex-col gap-y-1 text-sm text-muted-foreground">
            {meetings.map((meeting) => (
              <li
                key={meeting.id}
                className="group flex items-center gap-x-4 rounded-xl px-4 py-2 hover:bg-muted transition-colors"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={meeting.imageUrl} alt={meeting.name} />
                </Avatar>
                <div className="flex-auto">
                  <p className="text-foreground">{meeting.name}</p>
                  <p className="mt-0.5">
                    <time dateTime={meeting.startDatetime}>{meeting.start}</time> -{' '}
                    <time dateTime={meeting.endDatetime}>{meeting.end}</time>
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 text-muted-foreground"
                    >
                      <span className="sr-only">Open options</span>
                      <MoreVertical className="h-6 w-6" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>Cancel</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Simple border grid without shadow</li>
          <li>• Hover reveals menu: <code className="bg-background px-1 py-0.5 rounded">opacity-0 group-hover:opacity-100</code></li>
          <li>• Avatar component for user images</li>
        </ul>
      </div>
    </section>
  );
}

function TwoPanelCalendarExample() {
  const meetings = [
    {
      id: 1,
      name: 'Leslie Alexander',
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&h=256&fit=crop',
      start: '1:00 PM',
      startDatetime: '2022-01-21T13:00',
      end: '2:30 PM',
      endDatetime: '2022-01-21T14:30',
    },
    {
      id: 2,
      name: 'Michael Foster',
      imageUrl: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=256&h=256&fit=crop',
      start: '3:00 PM',
      startDatetime: '2022-01-21T15:00',
      end: '4:30 PM',
      endDatetime: '2022-01-21T16:30',
    },
  ];

  const days = Array.from({ length: 42 }, (_, i) => {
    const date = new Date(2022, 0, 1 - 5 + i);
    const isCurrentMonth = date.getMonth() === 0;
    const isToday = i === 16;
    const isSelected = i === 25;
    return { date: date.toISOString().split('T')[0], isCurrentMonth, isToday, isSelected };
  });

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Two Panel Calendar</h2>
        <p className="text-sm text-muted-foreground">Split view with calendar on left, schedule on right</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="md:grid md:grid-cols-2 md:divide-x md:divide-border">
          <div className="md:pr-14">
            <div className="flex items-center">
              <h2 className="flex-auto text-sm font-semibold">January 2022</h2>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                <span className="sr-only">Previous month</span>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground ml-2">
                <span className="sr-only">Next month</span>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            <div className="mt-10 grid grid-cols-7 text-center text-xs text-muted-foreground">
              <div>M</div>
              <div>T</div>
              <div>W</div>
              <div>T</div>
              <div>F</div>
              <div>S</div>
              <div>S</div>
            </div>
            <div className="mt-2 grid grid-cols-7 text-sm">
              {days.map((day, dayIdx) => (
                <div key={day.date} className={`py-2 ${dayIdx > 6 ? 'border-t border-border' : ''}`}>
                  <button
                    type="button"
                    className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full ${
                      !day.isCurrentMonth && !day.isSelected && !day.isToday ? 'text-muted-foreground' : ''
                    } ${!day.isSelected ? 'hover:bg-muted' : ''} ${
                      day.isCurrentMonth && !day.isSelected && !day.isToday ? 'text-foreground' : ''
                    } ${day.isSelected ? 'font-semibold text-primary-foreground' : ''} ${
                      day.isToday && !day.isSelected ? 'font-semibold text-primary' : ''
                    } ${day.isSelected && !day.isToday ? 'bg-foreground' : ''} ${
                      day.isSelected && day.isToday ? 'bg-primary' : ''
                    }`}
                  >
                    <time dateTime={day.date}>{day.date.split('-').pop().replace(/^0/, '')}</time>
                  </button>
                </div>
              ))}
            </div>
          </div>
          <section className="mt-12 md:mt-0 md:pl-14">
            <h2 className="text-base font-semibold">
              Schedule for <time dateTime="2022-01-21">January 21, 2022</time>
            </h2>
            <ol className="mt-4 flex flex-col gap-y-1 text-sm text-muted-foreground">
              {meetings.map((meeting) => (
                <li
                  key={meeting.id}
                  className="group flex items-center gap-x-4 rounded-xl px-4 py-2 hover:bg-muted transition-colors"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={meeting.imageUrl} alt={meeting.name} />
                  </Avatar>
                  <div className="flex-auto">
                    <p className="text-foreground">{meeting.name}</p>
                    <p className="mt-0.5">
                      <time dateTime={meeting.startDatetime}>{meeting.start}</time> -{' '}
                      <time dateTime={meeting.endDatetime}>{meeting.end}</time>
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 text-muted-foreground"
                      >
                        <span className="sr-only">Open options</span>
                        <MoreVertical className="h-6 w-6" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Cancel</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Split panel: <code className="bg-background px-1 py-0.5 rounded">md:grid md:grid-cols-2 md:divide-x</code></li>
          <li>• Divider: <code className="bg-background px-1 py-0.5 rounded">divide-border</code></li>
          <li>• Menu opacity animation on hover</li>
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
        <p className="text-sm text-muted-foreground">Complete token reference for calendar layouts</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-border p-4 space-y-2">
          <h3 className="text-sm font-medium">Calendar States</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Today: <code className="bg-muted px-1 py-0.5 rounded">bg-primary</code></li>
            <li>• Selected: <code className="bg-muted px-1 py-0.5 rounded">bg-foreground</code></li>
            <li>• Current month: <code className="bg-muted px-1 py-0.5 rounded">text-foreground</code></li>
            <li>• Other month: <code className="bg-muted px-1 py-0.5 rounded">text-muted-foreground</code></li>
          </ul>
        </div>

        <div className="rounded-lg border border-border p-4 space-y-2">
          <h3 className="text-sm font-medium">Components Used</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Button (ghost variant for navigation)</li>
            <li>• Avatar for meeting participants</li>
            <li>• DropdownMenu for actions</li>
            <li>• Lucide icons throughout</li>
          </ul>
        </div>

        <div className="rounded-lg border border-border p-4 space-y-2">
          <h3 className="text-sm font-medium">Layout Patterns</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Grid-based calendar layout</li>
            <li>• Responsive split panels</li>
            <li>• Hover-revealed actions</li>
            <li>• Semantic time elements</li>
          </ul>
        </div>
      </div>
    </section>
  );
}