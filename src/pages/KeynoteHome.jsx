import { Calendar, MapPin, Users, Star } from 'lucide-react';

function Hero() {
  return (
    <div className="relative isolate overflow-hidden bg-gradient-to-b from-indigo-100/20 pt-14">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            DeceptiConf 2024
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            A community-driven design conference exploring the latest patterns and techniques
            in user experience design. Join us for two days of inspiring talks and workshops.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <button className="rounded-2xl bg-blue-600 px-6 py-3 text-base font-semibold text-white hover:bg-blue-500">
              Get your tickets
            </button>
            <button className="text-base font-semibold leading-7 text-gray-900">
              Learn more <span aria-hidden="true">→</span>
            </button>
          </div>
          <div className="mt-12 flex items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="text-gray-600">April 4-6, 2024</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <span className="text-gray-600">San Francisco, CA</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SpeakerCard({ name, role, company, image }) {
  return (
    <div className="group relative">
      <div className="aspect-square overflow-hidden rounded-2xl bg-gray-100">
        <div className="h-full w-full bg-gradient-to-br from-blue-400 to-purple-500" />
      </div>
      <h3 className="mt-6 text-lg font-semibold leading-8 text-gray-900">{name}</h3>
      <p className="text-base leading-7 text-gray-600">{role}</p>
      <p className="text-sm leading-6 text-gray-500">{company}</p>
    </div>
  );
}

function Speakers() {
  const speakers = [
    { name: 'Sarah Chen', role: 'Design Director', company: 'Stripe' },
    { name: 'Marcus Williams', role: 'VP of Design', company: 'Airbnb' },
    { name: 'Emily Rodriguez', role: 'Lead Designer', company: 'Notion' },
    { name: 'David Park', role: 'Design Systems Lead', company: 'GitHub' },
  ];

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Featured speakers
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Learn from industry leaders and innovators shaping the future of design.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-4">
          {speakers.map((speaker) => (
            <SpeakerCard key={speaker.name} {...speaker} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Schedule() {
  const schedule = [
    { time: '9:00 AM', title: 'Registration & Breakfast', type: 'Break' },
    { time: '10:00 AM', title: 'Opening Keynote', speaker: 'Sarah Chen', type: 'Talk' },
    { time: '11:00 AM', title: 'Design Systems at Scale', speaker: 'Marcus Williams', type: 'Talk' },
    { time: '12:00 PM', title: 'Lunch', type: 'Break' },
    { time: '1:30 PM', title: 'Accessibility Workshop', speaker: 'Emily Rodriguez', type: 'Workshop' },
    { time: '3:30 PM', title: 'Break', type: 'Break' },
    { time: '4:00 PM', title: 'Future of Design Tools', speaker: 'David Park', type: 'Talk' },
  ];

  return (
    <div className="bg-gray-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Schedule</h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Two packed days of talks, workshops, and networking opportunities.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl">
          <div className="space-y-4">
            {schedule.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-6 rounded-2xl bg-white p-6 shadow-sm"
              >
                <div className="flex-shrink-0">
                  <p className="text-sm font-semibold text-blue-600">{item.time}</p>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900">{item.title}</h3>
                  {item.speaker && (
                    <p className="mt-1 text-sm text-gray-600">{item.speaker}</p>
                  )}
                  <span className="mt-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                    {item.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function KeynoteHome() {
  return (
    <div className="bg-white">
      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="flex items-center justify-between p-6 lg:px-8">
          <div className="flex lg:flex-1">
            <span className="text-2xl font-bold text-gray-900">DeceptiConf</span>
          </div>
          <div className="flex gap-x-12">
            <a href="#" className="text-sm font-semibold leading-6 text-gray-900">
              Speakers
            </a>
            <a href="#" className="text-sm font-semibold leading-6 text-gray-900">
              Schedule
            </a>
            <a href="#" className="text-sm font-semibold leading-6 text-gray-900">
              Venue
            </a>
          </div>
          <div className="flex flex-1 justify-end">
            <button className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">
              Get tickets
            </button>
          </div>
        </nav>
      </header>

      <main>
        <Hero />
        <Speakers />
        <Schedule />
      </main>

      <footer className="bg-gray-900">
        <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <p className="text-center text-xs leading-5 text-gray-400">
            &copy; 2024 DeceptiConf. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}