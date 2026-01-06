import { Check, Sparkles } from 'lucide-react';
import { Container } from '@/components/radiant/Container';
import { Footer } from '@/components/radiant/Footer';

function SparkleIcon() {
  return <Sparkles className="inline-block h-4 w-4 text-cyan-400" />;
}

function ChangelogEntry({ date, title, image, children }) {
  return (
    <article className="border-t border-gray-800 pt-16 first:border-0 first:pt-0">
      <div className="relative max-w-3xl">
        <time className="text-sm/6 text-gray-500">{date}</time>
        <h2 className="mt-2 text-2xl/8 font-medium tracking-tight text-white">
          {title}
        </h2>
        {image && (
          <img 
            src={image} 
            alt={title}
            className="mt-8 rounded-2xl border border-gray-800"
          />
        )}
        <div className="mt-8 text-base/7 text-gray-400">
          {children}
        </div>
      </div>
    </article>
  );
}

export default function CommitHome() {
  return (
    <div className="min-h-screen bg-gray-950">
      <header className="border-b border-gray-800">
        <Container className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500" />
              <span className="text-xl font-semibold text-white">Commit</span>
            </div>
            <nav className="flex gap-6">
              <a href="#" className="text-sm text-gray-400 hover:text-white">Download</a>
              <a href="#" className="text-sm text-gray-400 hover:text-white">Documentation</a>
              <a href="#" className="text-sm text-gray-400 hover:text-white">GitHub</a>
            </nav>
          </div>
        </Container>
      </header>

      <main>
        <div className="relative overflow-hidden py-24">
          <svg
            aria-hidden="true"
            className="absolute top-[-10vh] left-1/2 -z-10 h-[120vh] w-[120vw] min-w-[240rem] -translate-x-1/2"
          >
            <defs>
              <radialGradient id="gradient" cy="0%">
                <stop offset="0%" stopColor="rgba(56, 189, 248, 0.3)" />
                <stop offset="53.95%" stopColor="rgba(0, 71, 255, 0.09)" />
                <stop offset="100%" stopColor="rgba(10, 14, 23, 0)" />
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#gradient)" />
          </svg>

          <Container>
            <div className="max-w-3xl">
              <h1 className="text-5xl/tight font-light tracking-tight text-white sm:text-7xl/tight">
                Open-source Git client for macOS minimalists
              </h1>
              <p className="mt-6 text-xl/8 text-gray-400">
                Commit is a lightweight Git client you can open from anywhere any time you're ready 
                to commit your work with a single keyboard shortcut.
              </p>
              <div className="mt-8 flex gap-4">
                <button className="rounded-full bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-cyan-400">
                  Download for macOS
                </button>
                <button className="rounded-full border border-gray-700 px-6 py-2.5 text-sm font-semibold text-white hover:border-gray-600">
                  View on GitHub
                </button>
              </div>
            </div>
          </Container>
        </div>

        <Container className="py-24">
          <div className="space-y-24">
            <ChangelogEntry
              date="April 6, 2023"
              title="Commit message suggestions"
              image="https://base44.app/api/apps/69274b9c077e61d7cfe78ec7/files/public/69274b9c077e61d7cfe78ec7/a23729edd_commit-suggestions.png"
            >
              <p>
                In the latest release, I've added support for commit message and description 
                suggestions via an integration with OpenAI. Commit looks at all of your changes, 
                and feeds that into the machine with a bit of prompt-tuning to get back a commit 
                message that does a surprisingly good job at describing the intent of your changes.
              </p>
              <h3 className="mt-8 flex items-center gap-2 text-lg font-medium text-white">
                <SparkleIcon /> Improvements
              </h3>
              <ul className="mt-4 space-y-2 text-gray-400">
                <li className="flex gap-3">
                  <Check className="h-5 w-5 flex-shrink-0 text-cyan-400" />
                  <span>Added commit message and description suggestions powered by OpenAI</span>
                </li>
                <li className="flex gap-3">
                  <Check className="h-5 w-5 flex-shrink-0 text-cyan-400" />
                  <span>Fixed race condition that could sometimes leave you in a broken rebase state</span>
                </li>
                <li className="flex gap-3">
                  <Check className="h-5 w-5 flex-shrink-0 text-cyan-400" />
                  <span>Improved active project detection to ignore system-triggered file changes</span>
                </li>
              </ul>
            </ChangelogEntry>

            <ChangelogEntry
              date="March 17, 2023"
              title="Project configuration files"
              image="https://base44.app/api/apps/69274b9c077e61d7cfe78ec7/files/public/69274b9c077e61d7cfe78ec7/857c4bf78_configuration-files.png"
            >
              <p>
                I've added support for creating per-project <code className="rounded bg-gray-800 px-1.5 py-0.5 text-sm text-cyan-400">.commitrc</code> files 
                that override your global settings for that particular project.
              </p>
              <h3 className="mt-8 flex items-center gap-2 text-lg font-medium text-white">
                <SparkleIcon /> Improvements
              </h3>
              <ul className="mt-4 space-y-2 text-gray-400">
                <li className="flex gap-3">
                  <Check className="h-5 w-5 flex-shrink-0 text-cyan-400" />
                  <span>Added per-project .commitrc configuration files</span>
                </li>
                <li className="flex gap-3">
                  <Check className="h-5 w-5 flex-shrink-0 text-cyan-400" />
                  <span>Improved performance when working with projects with large binary files</span>
                </li>
              </ul>
            </ChangelogEntry>

            <ChangelogEntry
              date="February 24, 2023"
              title="Automatic repository detection"
            >
              <p>
                Commit now automatically detects when you're working in a Git repository and 
                switches to that project when you open the app. No more manually selecting 
                the right project from a dropdown.
              </p>
              <h3 className="mt-8 flex items-center gap-2 text-lg font-medium text-white">
                <SparkleIcon /> Improvements
              </h3>
              <ul className="mt-4 space-y-2 text-gray-400">
                <li className="flex gap-3">
                  <Check className="h-5 w-5 flex-shrink-0 text-cyan-400" />
                  <span>Automatic repository detection based on your active window</span>
                </li>
                <li className="flex gap-3">
                  <Check className="h-5 w-5 flex-shrink-0 text-cyan-400" />
                  <span>Added support for detecting repositories in tmux sessions</span>
                </li>
              </ul>
            </ChangelogEntry>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}