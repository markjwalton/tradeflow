import { TrendingUp, Shield, Zap, CheckCircle, Star } from 'lucide-react';

function Hero() {
  return (
    <div className="relative isolate overflow-hidden bg-white">
      <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8">
          <div className="mt-24 sm:mt-32 lg:mt-16">
            <span className="rounded-full bg-cyan-600/10 px-3 py-1 text-sm font-semibold leading-6 text-cyan-600 ring-1 ring-inset ring-cyan-600/10">
              What's new
            </span>
          </div>
          <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Invest at the perfect time.
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            By leveraging insights from our network of industry insiders, you'll know exactly 
            when to buy to maximize profit, and exactly when to sell to avoid painful losses.
          </p>
          <div className="mt-10 flex items-center gap-x-6">
            <button className="rounded-full bg-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-cyan-500">
              Get started
            </button>
            <button className="text-sm font-semibold leading-6 text-gray-900">
              Watch video <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
        <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
          <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
            <div className="rounded-3xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-3xl lg:p-4">
              <div className="aspect-[16/9] rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-2xl" />
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
        <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-600">
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
      icon: TrendingUp,
      title: 'Market insights',
      description: 'Get real-time data and analysis from industry experts and AI-powered predictions.',
    },
    {
      icon: Shield,
      title: 'Secure investing',
      description: 'Bank-level security and encryption to keep your investments safe and protected.',
    },
    {
      icon: Zap,
      title: 'Instant execution',
      description: 'Execute trades instantly with our lightning-fast platform and get the best prices.',
    },
  ];

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-cyan-600">Invest smarter</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to grow your wealth
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Our platform provides all the tools and insights you need to make informed 
            investment decisions and maximize your returns.
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
      features: ['Basic market data', 'Mobile app access', 'Email support', '5 watchlists'],
    },
    {
      name: 'Professional',
      price: '$29',
      description: 'For serious investors',
      features: [
        'Advanced analytics',
        'Priority support',
        'Unlimited watchlists',
        'Real-time alerts',
        'API access',
      ],
      featured: true,
    },
    {
      name: 'Enterprise',
      price: '$99',
      description: 'For institutional investors',
      features: [
        'Custom integrations',
        'Dedicated account manager',
        'Advanced security',
        'White-label solution',
      ],
    },
  ];

  return (
    <div className="bg-gray-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Choose the plan that's right for you and start investing today.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`flex flex-col justify-between rounded-3xl p-8 ring-1 ${
                tier.featured
                  ? 'bg-cyan-600 ring-cyan-600'
                  : 'bg-white ring-gray-200'
              }`}
            >
              <div>
                <h3
                  className={`text-lg font-semibold leading-8 ${
                    tier.featured ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {tier.name}
                </h3>
                <p
                  className={`mt-4 text-sm leading-6 ${
                    tier.featured ? 'text-cyan-100' : 'text-gray-600'
                  }`}
                >
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
                  <span
                    className={`text-sm font-semibold leading-6 ${
                      tier.featured ? 'text-cyan-100' : 'text-gray-600'
                    }`}
                  >
                    /month
                  </span>
                </p>
                <ul
                  className={`mt-8 space-y-3 text-sm leading-6 ${
                    tier.featured ? 'text-cyan-100' : 'text-gray-600'
                  }`}
                >
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <CheckCircle
                        className={`h-6 w-5 flex-none ${
                          tier.featured ? 'text-white' : 'text-cyan-600'
                        }`}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                className={`mt-8 block rounded-full px-4 py-2.5 text-center text-sm font-semibold ${
                  tier.featured
                    ? 'bg-white text-cyan-600 hover:bg-gray-50'
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
    <div className="bg-white">
      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="flex items-center justify-between p-6 lg:px-8">
          <div className="flex lg:flex-1">
            <span className="text-2xl font-bold text-cyan-600">Pocket</span>
          </div>
          <div className="flex gap-x-12">
            <a href="#" className="text-sm font-semibold leading-6 text-gray-900">
              Features
            </a>
            <a href="#" className="text-sm font-semibold leading-6 text-gray-900">
              Pricing
            </a>
            <a href="#" className="text-sm font-semibold leading-6 text-gray-900">
              About
            </a>
          </div>
          <div className="flex flex-1 justify-end gap-x-6">
            <a href="#" className="text-sm font-semibold leading-6 text-gray-900">
              Log in
            </a>
            <button className="rounded-full bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500">
              Sign up
            </button>
          </div>
        </nav>
      </header>

      <main>
        <Hero />
        <Features />
        <Pricing />
      </main>

      <footer className="bg-gray-900">
        <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <p className="text-center text-xs leading-5 text-gray-400">
            &copy; 2024 Pocket. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}