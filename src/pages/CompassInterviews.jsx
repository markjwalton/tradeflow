import { Play } from 'lucide-react';

function VideoCard({ title, subtitle, duration, thumbnail }) {
  return (
    <div className="group relative">
      <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-100">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm transition group-hover:scale-110">
            <Play className="h-6 w-6 text-indigo-600" fill="currentColor" />
          </div>
        </div>
        {duration && (
          <div className="absolute bottom-2 right-2 rounded bg-black/75 px-2 py-1 text-xs text-white">
            {duration}
          </div>
        )}
      </div>
      <h3 className="mt-4 text-base font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
    </div>
  );
}

export default function CompassInterviews() {
  const interviews = [
    {
      id: 1,
      title: 'Building a Sustainable Career in Tech',
      subtitle: 'Sarah Chen, Engineering Manager at Stripe',
      duration: '42:15',
    },
    {
      id: 2,
      title: 'Transitioning from Corporate to Startup',
      subtitle: 'Marcus Williams, Founder of TechVentures',
      duration: '38:22',
    },
    {
      id: 3,
      title: 'The Art of Product Leadership',
      subtitle: 'Emily Rodriguez, VP Product at Notion',
      duration: '51:08',
    },
    {
      id: 4,
      title: 'Navigating Career Pivots',
      subtitle: 'David Park, Career Coach',
      duration: '35:45',
    },
    {
      id: 5,
      title: 'Design Thinking in Practice',
      subtitle: 'Jessica Taylor, Design Director at Airbnb',
      duration: '44:30',
    },
    {
      id: 6,
      title: 'Leadership in Remote Teams',
      subtitle: 'Alex Johnson, CTO at GitLab',
      duration: '48:12',
    },
  ];

  return (
    <div className="bg-white">
      <header className="border-b border-gray-200">
        <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
          <a href="#" className="text-2xl font-bold text-indigo-600">
            Compass
          </a>
          <div className="flex gap-x-12">
            <a href="#" className="text-sm font-semibold text-gray-900">
              Resources
            </a>
            <a href="#" className="text-sm font-semibold text-indigo-600">
              Interviews
            </a>
            <a href="#" className="text-sm font-semibold text-gray-900">
              About
            </a>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <nav className="flex mb-10" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <a href="#" className="text-gray-500 hover:text-gray-700">
                Home
              </a>
            </li>
            <li>
              <span className="text-gray-400">/</span>
            </li>
            <li className="text-gray-900">Interviews</li>
          </ol>
        </nav>

        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Interviews
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-gray-600">
          Explore interviews with industry experts and thought leaders who share their 
          experiences, insights, and advice for navigating your career.
        </p>

        <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {interviews.map((interview) => (
            <VideoCard key={interview.id} {...interview} />
          ))}
        </div>
      </main>
    </div>
  );
}