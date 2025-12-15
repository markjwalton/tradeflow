import { ArrowRight, CheckCircle2 } from 'lucide-react';

function Hero() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-5xl font-display font-semibold tracking-tight text-neutral-950 sm:text-7xl">
          Award-winning development studio based in Denmark.
        </h1>
        <p className="mt-6 text-xl text-neutral-600">
          We are a development studio working at the intersection of design and technology.
          It's a really busy intersection though — a lot of our staff have been involved in
          hit and runs.
        </p>
        <div className="mt-10">
          <button className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-800">
            Get in touch
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Services() {
  const services = [
    {
      title: 'Web development',
      description:
        'We specialise in crafting beautiful, high quality marketing pages. The rest of the website will be a shell that uses lorem ipsum everywhere.',
    },
    {
      title: 'Application development',
      description:
        'We have a team of skilled developers who are experts in the latest app frameworks, like Angular 1 and Google Web Toolkit.',
    },
    {
      title: 'E-commerce',
      description:
        'We are at the forefront of modern e-commerce development. Which mainly means adding your logo to the Shopify store template we have used for the past six years.',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-2xl lg:max-w-none">
        <h2 className="font-display text-4xl font-semibold text-neutral-950">
          Our services
        </h2>
        <div className="mt-10 space-y-10 border-t border-neutral-200 pt-10 sm:space-y-16 sm:pt-16">
          {services.map((service) => (
            <div key={service.title} className="group">
              <div className="border-l-4 border-neutral-950 pl-8">
                <h3 className="font-display text-2xl font-semibold text-neutral-950 group-hover:text-neutral-700">
                  {service.title}
                </h3>
                <p className="mt-4 text-lg text-neutral-600">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CaseStudies() {
  const cases = [
    {
      client: 'FamilyFund',
      title: 'Skip the bank, borrow from those you trust',
      description:
        'FamilyFund is a crowdfunding platform for friends and family. Allowing users to take personal loans from their network without a traditional financial institution.',
      year: '2023',
    },
    {
      client: 'Unseal',
      title: 'Get a hodl of your health',
      description:
        'Unseal is the first NFT platform where users can mint and own their medical history. Because data is the new oil, and healthcare is the new gold rush.',
      year: '2022',
    },
    {
      client: 'Phobia',
      title: 'Overcome your fears, find your match',
      description:
        'Find love in the face of fear — Phobia is a dating app that matches users based on their mutual phobias so they can be scared together.',
      year: '2022',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-2xl lg:max-w-none">
        <h2 className="font-display text-4xl font-semibold text-neutral-950">
          Our work
        </h2>
        <div className="mt-10 space-y-20 sm:space-y-24 lg:space-y-32">
          {cases.map((study) => (
            <div key={study.client} className="group">
              <div className="aspect-video rounded-3xl bg-neutral-100" />
              <div className="mt-8">
                <div className="flex items-center gap-3">
                  <p className="text-sm font-semibold text-neutral-950">{study.client}</p>
                  <span className="text-neutral-300">•</span>
                  <p className="text-sm text-neutral-600">{study.year}</p>
                </div>
                <h3 className="mt-4 font-display text-2xl font-semibold text-neutral-950 group-hover:text-neutral-700">
                  {study.title}
                </h3>
                <p className="mt-4 text-base text-neutral-600">{study.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Values() {
  const values = [
    {
      title: 'Meticulous',
      description:
        'The first part of any partnership is getting our designer to put your logo in our template. The second step is getting them to do the colors.',
    },
    {
      title: 'Efficient',
      description:
        'We pride ourselves on never missing a deadline which is easy because most of the work was done years ago.',
    },
    {
      title: 'Adaptable',
      description:
        'Every business has unique needs and our greatest challenge is shoe-horning those needs into something we already built.',
    },
    {
      title: 'Honest',
      description:
        'We are transparent about all of our processes, banking on the simple fact our clients never actually read anything.',
    },
    {
      title: 'Loyal',
      description:
        'We foster long-term relationships with our clients that go beyond just delivering a product, allowing us to invoice them for decades.',
    },
    {
      title: 'Innovative',
      description:
        'The technological landscape is always evolving and so are we. We are constantly on the lookout for new open source projects to clone.',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-2xl lg:max-w-none">
        <h2 className="font-display text-4xl font-semibold text-neutral-950">Our values</h2>
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((value) => (
            <div key={value.title} className="border-l-4 border-neutral-950 pl-8">
              <h3 className="font-display text-xl font-semibold text-neutral-950">
                {value.title}
              </h3>
              <p className="mt-4 text-base text-neutral-600">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function StudioHome() {
  return (
    <div className="bg-white">
      <header className="border-b border-neutral-200">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
          <span className="text-2xl font-display font-bold text-neutral-950">Studio</span>
          <div className="flex gap-x-8">
            <a href="#" className="text-sm font-semibold text-neutral-950">
              Work
            </a>
            <a href="#" className="text-sm font-semibold text-neutral-950">
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
        <Hero />
        <CaseStudies />
        <Services />
        <Values />

        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="rounded-4xl bg-neutral-950 px-6 py-20 sm:px-12 lg:px-16">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">
                Tell us about your project
              </h2>
              <p className="mt-4 text-lg text-neutral-300">
                We can't wait to hear from you.
              </p>
              <button className="mt-10 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-neutral-950 hover:bg-neutral-100">
                Say Hello
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
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