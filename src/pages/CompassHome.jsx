import { ArrowRight, BookOpen, Video, Users } from 'lucide-react';

function Hero() {
  return (
    <div className="relative isolate overflow-hidden bg-gradient-to-b from-indigo-100/20">
      <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8">
          <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Navigate your career with confidence
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Compass helps you make career decisions aligned with your values and goals. 
            Explore resources, connect with mentors, and chart your path forward.
          </p>
          <div className="mt-10 flex items-center gap-x-6">
            <a
              href="#"
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              Get started
            </a>
            <a href="#" className="text-sm font-semibold leading-6 text-gray-900">
              Learn more <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
        <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
          <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
            <div className="rounded-2xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
              <div className="aspect-[16/9] rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="relative pl-16">
      <dt className="text-base font-semibold leading-7 text-gray-900">
        <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
          <Icon className="h-6 w-6 text-white" />
        </div>
        {title}
      </dt>
      <dd className="mt-2 text-base leading-7 text-gray-600">{description}</dd>
    </div>
  );
}

function Features() {
  const features = [
    {
      icon: BookOpen,
      title: 'Curated Resources',
      description: 'Access a library of books, articles, and guides to help you navigate career transitions and personal growth.',
    },
    {
      icon: Video,
      title: 'Expert Interviews',
      description: 'Learn from industry leaders and thought leaders through in-depth video interviews and conversations.',
    },
    {
      icon: Users,
      title: 'Community Support',
      description: 'Connect with peers, mentors, and coaches who can provide guidance and support on your journey.',
    },
  ];

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">Everything you need</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Tools for your career journey
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Whether you're just starting out or making a major career change, Compass provides 
            the resources and support you need.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

function CTA() {
  return (
    <div className="bg-indigo-600">
      <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to take control of your career?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-indigo-200">
            Join thousands of professionals who are using Compass to navigate their career paths 
            with clarity and confidence.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="#"
              className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-50"
            >
              Get started
            </a>
            <a href="#" className="text-sm font-semibold leading-6 text-white">
              Learn more <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CompassHome() {
  return (
    <div className="bg-white">
      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <a href="#" className="-m-1.5 p-1.5">
              <span className="text-2xl font-bold text-indigo-600">Compass</span>
            </a>
          </div>
          <div className="flex gap-x-12">
            <a href="#" className="text-sm font-semibold leading-6 text-gray-900">
              Resources
            </a>
            <a href="#" className="text-sm font-semibold leading-6 text-gray-900">
              Interviews
            </a>
            <a href="#" className="text-sm font-semibold leading-6 text-gray-900">
              About
            </a>
          </div>
          <div className="flex flex-1 justify-end gap-x-6">
            <a href="#" className="text-sm font-semibold leading-6 text-gray-900">
              Log in
            </a>
            <a
              href="#"
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              Sign up
            </a>
          </div>
        </nav>
      </header>

      <main>
        <Hero />
        <Features />
        <CTA />
      </main>

      <footer className="bg-gray-900">
        <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <a href="#" className="text-gray-400 hover:text-gray-300">
              Twitter
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-300">
              GitHub
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-300">
              LinkedIn
            </a>
          </div>
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-xs leading-5 text-gray-400">
              &copy; 2024 Compass. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}