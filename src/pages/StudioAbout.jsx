import { CheckCircle2 } from 'lucide-react';

function Culture() {
  const values = [
    {
      title: 'Loyalty',
      description:
        'Our team has been with us since the beginning because none of them are allowed to have LinkedIn profiles.',
    },
    {
      title: 'Trust',
      description:
        'We don't care when our team works just as long as they are working every waking second.',
    },
    {
      title: 'Compassion',
      description:
        'You never know what someone is going through at home and we make sure to never find out.',
    },
  ];

  return (
    <div className="rounded-4xl bg-neutral-950 py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <p className="text-sm font-semibold text-white">Our culture</p>
          <h2 className="mt-2 font-display text-4xl font-semibold text-white">
            Balance your passion with your passion for life.
          </h2>
          <p className="mt-6 text-lg text-neutral-300">
            We are a group of like-minded people who share the same core values.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((value) => (
            <div key={value.title}>
              <h3 className="font-display text-xl font-semibold text-white">
                {value.title}
              </h3>
              <p className="mt-4 text-base text-neutral-300">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Team() {
  const teamMembers = [
    { name: 'Leslie Alexander', role: 'Co-Founder / CEO' },
    { name: 'Michael Foster', role: 'Co-Founder / CTO' },
    { name: 'Dries Vincent', role: 'Partner & Business Relations' },
    { name: 'Chelsea Hagon', role: 'Senior Developer' },
    { name: 'Emma Dorsey', role: 'Senior Designer' },
    { name: 'Leonard Krasner', role: 'VP, User Experience' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
      <h2 className="font-display text-4xl font-semibold text-neutral-950">Our team</h2>
      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {teamMembers.map((member) => (
          <div key={member.name} className="group">
            <div className="aspect-square overflow-hidden rounded-3xl bg-neutral-100">
              <div className="h-full w-full bg-gradient-to-br from-neutral-200 to-neutral-300" />
            </div>
            <p className="mt-6 font-display text-base font-semibold text-neutral-950">
              {member.name}
            </p>
            <p className="mt-2 text-sm text-neutral-600">{member.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StudioAbout() {
  return (
    <div className="bg-white">
      <header className="border-b border-neutral-200">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
          <span className="text-2xl font-display font-bold text-neutral-950">Studio</span>
          <div className="flex gap-x-8">
            <a href="#" className="text-sm font-semibold text-neutral-950">
              Work
            </a>
            <a href="#" className="text-sm font-semibold text-neutral-600 hover:text-neutral-950">
              About
            </a>
            <a href="#" className="text-sm font-semibold text-neutral-950">
              Services
            </a>
            <a href="#" className="text-sm font-semibold text-neutral-950">
              Contact
            </a>
          </div>
        </nav>
      </header>

      <main>
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <p className="text-sm font-semibold text-neutral-950">About us</p>
            <h1 className="mt-2 font-display text-5xl font-semibold tracking-tight text-neutral-950 sm:text-6xl">
              Our strength is collaboration
            </h1>
            <p className="mt-6 text-xl text-neutral-600">
              We believe that our strength lies in our collaborative approach, which puts our
              clients at the center of everything we do.
            </p>
          </div>

          <div className="mt-24 border-t border-neutral-200 pt-24">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
              <div>
                <h2 className="font-display text-3xl font-semibold text-neutral-950">
                  Our approach
                </h2>
                <p className="mt-6 text-base text-neutral-600">
                  We believe in efficiency and maximizing our resources to provide the best
                  value to our clients. The primary way we do that is by re-using the same
                  projects we have been using for the past decade.
                </p>
              </div>
              <div className="space-y-6">
                <div className="aspect-video rounded-3xl bg-neutral-100" />
              </div>
            </div>
          </div>
        </div>

        <Culture />
        <Team />
      </main>

      <footer className="border-t border-neutral-200 bg-neutral-50 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="text-center text-sm text-neutral-600">
            © Studio. 2024. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}