import { Calendar, MapPin, Users, Ticket } from 'lucide-react';

function Hero() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-5xl font-bold tracking-tight text-blue-900 sm:text-6xl">
            DeceptiConf 2024
          </h1>
          <p className="mt-6 text-lg leading-8 text-blue-600">
            A community-driven design conference
          </p>
          <p className="mt-4 text-base text-gray-600">
            April 4-6, 2024 • Austin, Texas
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <button className="rounded-2xl bg-blue-600 px-6 py-4 text-base font-semibold text-white hover:bg-blue-500">
              Get your tickets
            </button>
            <button className="text-base font-semibold leading-6 text-blue-900">
              Learn more <span aria-hidden="true">→</span>
            </button>
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
      <h3 className="mt-6 text-lg font-semibold text-gray-900">{name}</h3>
      <p className="text-sm text-blue-600">{role}</p>
      <p className="text-sm text-gray-500">{company}</p>
    </div>
  );
}

function Speakers() {
  const speakers = [
    { name: 'Sarah Chen', role: 'VP of Design', company: 'Stripe' },
    { name: 'Marcus Williams', role: 'Lead Designer', company: 'Figma' },
    { name: 'Emily Rodriguez', role: 'Design Director', company: 'Airbnb' },
    { name: 'David Park', role: 'Principal Designer', company: 'Netflix' },
  ];

  return (
    <div className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-blue-900 sm:text-4xl">
            Featured speakers
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Learn from industry leaders and innovators
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:max-w-none lg:grid-cols-4">
          {speakers.map((speaker) => (
            <SpeakerCard key={speaker.name} {...speaker} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Schedule() {
  const days = [
    {
      date: 'April 4',
      sessions: [
        { time: '9:00 AM', title: 'Opening Keynote', speaker: 'Sarah Chen' },
        { time: '10:30 AM', title: 'Design Systems at Scale', speaker: 'Marcus Williams' },
        { time: '2:00 PM', title: 'User Research Best Practices', speaker: 'Emily Rodriguez' },
      ],
    },
    {
      date: 'April 5',
      sessions: [
        { time: '9:00 AM', title: 'Accessibility in Design', speaker: 'David Park' },
        { time: '11:00 AM', title: 'Workshop: Figma Advanced Techniques', speaker: 'Sarah Chen' },
        { time: '3:00 PM', title: 'Panel: The Future of Design', speaker: 'All Speakers' },
      ],
    },
  ];

  return (
    <div className="bg-blue-50 py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-blue-900 sm:text-4xl">
            Schedule
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Two days packed with talks, workshops, and networking
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-4xl gap-8 lg:grid-cols-2">
          {days.map((day) => (
            <div key={day.date} className="rounded-2xl bg-white p-8">
              <h3 className="text-xl font-bold text-blue-900">{day.date}</h3>
              <div className="mt-6 space-y-6">
                {day.sessions.map((session) => (
                  <div key={session.time} className="border-l-2 border-blue-600 pl-4">
                    <p className="text-sm font-semibold text-blue-600">{session.time}</p>
                    <p className="mt-1 font-semibold text-gray-900">{session.title}</p>
                    <p className="text-sm text-gray-600">{session.speaker}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Sponsors() {
  return (
    <div className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-blue-900 sm:text-4xl">
            Our sponsors
          </h2>
        </div>
        <div className="mx-auto mt-16 grid max-w-lg grid-cols-3 gap-8 lg:max-w-4xl">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center justify-center">
              <div className="h-12 w-32 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function KeynoteHome() {
  return (
    <div className="bg-white">
      <header className="border-b border-gray-200">
        <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
          <span className="text-2xl font-bold text-blue-900">DeceptiConf</span>
          <div className="flex gap-x-8">
            <a href="#" className="text-sm font-semibold text-gray-900">
              Speakers
            </a>
            <a href="#" className="text-sm font-semibold text-gray-900">
              Schedule
            </a>
            <a href="#" className="text-sm font-semibold text-gray-900">
              Sponsors
            </a>
          </div>
          <button className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">
            Get tickets
          </button>
        </nav>
      </header>

      <main>
        <Hero />
        <Speakers />
        <Schedule />
        <Sponsors />

        <div className="bg-blue-600 py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white">
                Join us in Austin
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-blue-100">
                Get your tickets now for the premier design conference of 2024
              </p>
              <button className="mt-8 rounded-2xl bg-white px-6 py-4 text-base font-semibold text-blue-600 hover:bg-blue-50">
                Register now
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="text-center text-sm text-gray-400">
            © 2024 DeceptiConf. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}