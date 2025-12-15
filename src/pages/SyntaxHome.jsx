import { Search, BookOpen, Code2, Zap } from 'lucide-react';

function SearchBar() {
  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        placeholder="Search documentation..."
        className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-12 pr-4 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
    </div>
  );
}

function QuickLinkCard({ icon: Icon, title, description, href }) {
  return (
    <a
      href={href}
      className="group relative rounded-2xl border border-gray-200 bg-white p-6 hover:border-indigo-500 hover:shadow-lg transition-all"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600">
            {title}
          </h3>
          <p className="mt-1 text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </a>
  );
}

export default function SyntaxHome() {
  const quickLinks = [
    {
      icon: Zap,
      title: 'Quick Start',
      description: 'Get up and running in minutes',
      href: '#',
    },
    {
      icon: BookOpen,
      title: 'API Reference',
      description: 'Complete API documentation',
      href: '#',
    },
    {
      icon: Code2,
      title: 'Code Examples',
      description: 'Learn from real-world examples',
      href: '#',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <span className="text-2xl font-bold text-gray-900">Syntax</span>
              <nav className="hidden md:flex gap-6">
                <a href="#" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                  Documentation
                </a>
                <a href="#" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                  Guides
                </a>
                <a href="#" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                  API Reference
                </a>
                <a href="#" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                  Community
                </a>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-sm font-medium text-gray-700 hover:text-gray-900">
                Sign in
              </button>
              <button className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
                Get started
              </button>
            </div>
          </div>
        </div>
      </header>

      <main>
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32">
          <div className="text-center">
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Developer documentation
              <br />
              <span className="text-indigo-600">made simple</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
              Everything you need to build amazing applications. Comprehensive guides, 
              detailed API references, and real-world examples.
            </p>
            <div className="mt-10 max-w-2xl mx-auto">
              <SearchBar />
            </div>
          </div>

          <div className="mt-24">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {quickLinks.map((link) => (
                <QuickLinkCard key={link.title} {...link} />
              ))}
            </div>
          </div>

          <div className="mt-24 rounded-3xl border border-gray-200 bg-white p-8 sm:p-12">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                  Popular topics
                </h2>
                <ul className="mt-8 space-y-4">
                  {[
                    'Getting started',
                    'Authentication',
                    'API basics',
                    'Error handling',
                    'Rate limiting',
                    'Webhooks',
                  ].map((topic) => (
                    <li key={topic}>
                      <a
                        href="#"
                        className="flex items-center gap-3 text-gray-700 hover:text-indigo-600"
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                        <span className="text-base font-medium">{topic}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                  Latest updates
                </h2>
                <div className="mt-8 space-y-6">
                  {[
                    {
                      title: 'API v2.0 Released',
                      date: 'December 10, 2024',
                      description: 'New endpoints, improved performance, and better error handling.',
                    },
                    {
                      title: 'GraphQL Support',
                      date: 'November 28, 2024',
                      description: 'Query your data with GraphQL for more flexible integrations.',
                    },
                  ].map((update) => (
                    <div key={update.title} className="border-l-2 border-indigo-500 pl-4">
                      <h3 className="font-semibold text-gray-900">{update.title}</h3>
                      <p className="mt-1 text-sm text-gray-600">{update.date}</p>
                      <p className="mt-2 text-sm text-gray-700">{update.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">© 2024 Syntax. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
                GitHub
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
                Twitter
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
                Discord
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}