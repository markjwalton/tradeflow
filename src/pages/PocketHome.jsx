import { TrendingUp, Shield, Zap, ChevronRight } from 'lucide-react';

function Hero() {
  return (
    <div className="relative overflow-hidden bg-gray-50 py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Invest at the perfect time.
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            By leveraging insights from our network of industry insiders, you'll know 
            exactly when to buy to maximize profit, and exactly when to sell to avoid 
            painful losses.
          </p>
          <div className="mt-10 flex items-center gap-x-6">
            <button className="rounded-full bg-cyan-600 px-6 py-3 text-base font-semibold text-white hover:bg-cyan-500">
              Get started
            </button>
            <a href="#" className="text-base font-semibold leading-6 text-gray-900">
              Watch demo <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
        <div className="mx-auto mt-16 max-w-2xl lg:ml-auto lg:mr-0 lg:mt-0 lg:max-w-none lg:w-1/2">
          <div className="aspect-video rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-2xl" />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="relative pl-16">
      <dt className="text-base font-semibold leading-7 text-gray-900">
        <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-600">
          <Icon className="h-6 w-6 text-white" />
        </div>
        {title}
      </dt>
      <dd className="mt-2 text-base leading-7 text-gray-600">{description}</dd>
    </div>
  );
}

function PrimaryFeatures() {
  const features = [
    {
      icon: TrendingUp,
      title: 'Insider insights',
      description: 'Access real-time trading signals from our network of industry professionals.',
    },
    {
      icon: Shield,
      title: 'Secure platform',
      description: 'Bank-level security keeps your investments and data protected.',
    },
    {
      icon: Zap,
      title: 'Lightning fast',
      description: 'Execute trades instantly when opportunities arise.',
    },
  ];

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-cyan-600">Invest smarter</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to succeed
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

function Pricing() {
  const tiers = [
    {
      name: 'Starter',
      price: '$9',
      description: 'Perfect for beginners',
      features: ['Up to 5 trades/month', 'Basic insights', 'Email support'],
    },
    {
      name: 'Professional',
      price: '$29',
      description: 'For serious investors',
      features: ['Unlimited trades', 'Advanced insights', 'Priority support', 'API access'],
      featured: true,
    },
    {
      name: 'Enterprise',
      price: '$99',
      description: 'For organizations',
      features: ['Unlimited trades', 'Premium insights', '24/7 phone support', 'Dedicated manager'],
    },
  ];

  return (
    <div className="bg-gray-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Simple, transparent pricing
          </h2>
        </div>
        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-3xl p-8 ${
                tier.featured
                  ? 'bg-cyan-600 ring-2 ring-cyan-600'
                  : 'bg-white ring-1 ring-gray-200'
              }`}
            >
              <h3
                className={`text-lg font-semibold leading-8 ${
                  tier.featured ? 'text-white' : 'text-gray-900'
                }`}
              >
                {tier.name}
              </h3>
              <p className={`mt-4 text-sm ${tier.featured ? 'text-cyan-100' : 'text-gray-600'}`}>
                {tier.description}
              </p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span
                  className={`text-4xl font-bold tracking-tight ${
                    tier.featured ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {tier.price}
                </span>
                <span className={`text-sm ${tier.featured ? 'text-cyan-100' : 'text-gray-600'}`}>
                  /month
                </span>
              </p>
              <ul
                className={`mt-8 space-y-3 text-sm ${
                  tier.featured ? 'text-cyan-100' : 'text-gray-600'
                }`}
              >
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <ChevronRight
                      className={`h-6 w-5 flex-none ${
                        tier.featured ? 'text-white' : 'text-cyan-600'
                      }`}
                    />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                className={`mt-8 w-full rounded-full px-6 py-3 text-center text-sm font-semibold ${
                  tier.featured
                    ? 'bg-white text-cyan-600 hover:bg-cyan-50'
                    : 'bg-cyan-600 text-white hover:bg-cyan-500'
                }`}
              >
                Get started
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PocketHome() {
  return (
    <div className="bg-gray-50">
      <header className="bg-white">
        <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
          <span className="text-2xl font-bold text-gray-900">Pocket</span>
          <div className="flex gap-x-8">
            <a href="#" className="text-sm font-semibold text-gray-900">
              Features
            </a>
            <a href="#" className="text-sm font-semibold text-gray-900">
              Pricing
            </a>
            <a href="#" className="text-sm font-semibold text-gray-900">
              About
            </a>
          </div>
          <div className="flex gap-x-4">
            <a href="#" className="text-sm font-semibold text-gray-900">
              Sign in
            </a>
            <button className="rounded-full bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500">
              Sign up
            </button>
          </div>
        </nav>
      </header>

      <main>
        <Hero />
        <PrimaryFeatures />
        <Pricing />
      </main>

      <footer className="bg-gray-900 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="text-center text-sm text-gray-400">
            © 2024 Pocket. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}