import { Play, Pause, SkipForward, SkipBack, Volume2, User } from 'lucide-react';

function AudioPlayer() {
  return (
    <div className="border-t border-slate-800 bg-slate-900 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center gap-6">
          <div className="flex-shrink-0">
            <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-white">
              Episode 127: The Future of Web Development
            </h3>
            <p className="text-sm text-slate-400">Eric Gordon, Wes Mantooth</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="rounded-full p-2 text-slate-400 hover:text-white">
              <SkipBack className="h-5 w-5" />
            </button>
            <button className="rounded-full bg-white p-3 text-slate-900 hover:bg-slate-100">
              <Play className="h-6 w-6" fill="currentColor" />
            </button>
            <button className="rounded-full p-2 text-slate-400 hover:text-white">
              <SkipForward className="h-5 w-5" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-slate-400" />
            <div className="w-24 h-1 bg-slate-700 rounded-full">
              <div className="w-2/3 h-full bg-white rounded-full" />
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-4">
          <span className="text-xs text-slate-400">12:34</span>
          <div className="flex-1 h-1 bg-slate-700 rounded-full">
            <div className="w-1/3 h-full bg-white rounded-full" />
          </div>
          <span className="text-xs text-slate-400">45:21</span>
        </div>
      </div>
    </div>
  );
}

function EpisodeCard({ number, title, date, duration, guests }) {
  return (
    <div className="group relative rounded-2xl bg-slate-800 p-6 hover:bg-slate-750 transition-colors">
      <div className="flex items-start gap-6">
        <div className="flex-shrink-0">
          <div className="h-20 w-20 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Play className="h-8 w-8 text-white" fill="currentColor" />
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-mono text-slate-500">Episode {number}</span>
            <span className="text-sm text-slate-500">•</span>
            <span className="text-sm text-slate-500">{date}</span>
            <span className="text-sm text-slate-500">•</span>
            <span className="text-sm text-slate-500">{duration}</span>
          </div>
          <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">
            {title}
          </h3>
          <div className="mt-3 flex items-center gap-2">
            {guests.map((guest) => (
              <div key={guest} className="flex items-center gap-2 text-sm text-slate-400">
                <User className="h-4 w-4" />
                <span>{guest}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TransmitHome() {
  const episodes = [
    {
      number: 127,
      title: 'The Future of Web Development',
      date: 'Dec 15, 2024',
      duration: '45:21',
      guests: ['Sarah Chen', 'Marcus Williams'],
    },
    {
      number: 126,
      title: 'Building Accessible Interfaces',
      date: 'Dec 8, 2024',
      duration: '52:14',
      guests: ['Emily Rodriguez'],
    },
    {
      number: 125,
      title: 'State Management in 2024',
      date: 'Dec 1, 2024',
      duration: '48:33',
      guests: ['David Park', 'Jessica Taylor'],
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
              <span className="text-2xl font-bold text-white">Transmit</span>
            </div>
            <nav className="flex gap-6">
              <a href="#" className="text-sm font-medium text-white">
                Episodes
              </a>
              <a href="#" className="text-sm font-medium text-slate-400 hover:text-white">
                About
              </a>
              <a href="#" className="text-sm font-medium text-slate-400 hover:text-white">
                Subscribe
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500" />
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Transmit</h1>
                <p className="text-slate-400">
                  Weekly conversations about technology, design, and the web
                </p>
              </div>
            </div>
            <div className="mt-8 flex items-center gap-4">
              <button className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100">
                Listen to latest episode
              </button>
              <button className="rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-white hover:border-slate-600">
                Subscribe
              </button>
            </div>
          </div>

          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Recent episodes</h2>
            <a href="#" className="text-sm font-medium text-purple-400 hover:text-purple-300">
              View all episodes →
            </a>
          </div>

          <div className="space-y-4">
            {episodes.map((episode) => (
              <EpisodeCard key={episode.number} {...episode} />
            ))}
          </div>

          <div className="mt-16 rounded-2xl bg-slate-800 p-8">
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">About the show</h2>
                <p className="text-slate-400 leading-relaxed">
                  Transmit is a weekly podcast where we discuss the latest in web development, 
                  design trends, and technology. Hosted by Eric Gordon and Wes Mantooth, we bring 
                  you in-depth conversations with industry experts and thought leaders.
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Subscribe</h2>
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center gap-2 rounded-lg bg-slate-700 px-4 py-3 text-sm font-medium text-white hover:bg-slate-600">
                    Apple Podcasts
                  </button>
                  <button className="flex items-center justify-center gap-2 rounded-lg bg-slate-700 px-4 py-3 text-sm font-medium text-white hover:bg-slate-600">
                    Spotify
                  </button>
                  <button className="flex items-center justify-center gap-2 rounded-lg bg-slate-700 px-4 py-3 text-sm font-medium text-white hover:bg-slate-600">
                    Overcast
                  </button>
                  <button className="flex items-center justify-center gap-2 rounded-lg bg-slate-700 px-4 py-3 text-sm font-medium text-white hover:bg-slate-600">
                    RSS Feed
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <AudioPlayer />
    </div>
  );
}