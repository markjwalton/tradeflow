import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronRight } from 'lucide-react';
import { BentoCard } from '@/components/radiant/BentoCard';
import { Button } from '@/components/radiant/Button';
import { Container } from '@/components/radiant/Container';
import { Footer } from '@/components/radiant/Footer';
import { Gradient } from '@/components/radiant/Gradient';
import { LogoCloud } from '@/components/radiant/LogoCloud';
import { Navbar } from '@/components/radiant/Navbar';
import { Screenshot } from '@/components/radiant/Screenshot';
import { Heading, Subheading } from '@/components/radiant/Text';
import { useWebsiteAssets } from '@/components/cms/useWebsiteAssets';

function Hero() {
  return (
    <div className="relative">
      <Gradient className="absolute inset-2 bottom-0 rounded-[2rem] ring-1 ring-black/5 ring-inset" />
      <Container className="relative">
        <Navbar
          banner={
            <Link
              to={createPageUrl('RadiantBlog')}
              className="flex items-center gap-1 rounded-full bg-fuchsia-950/35 px-3 py-0.5 text-sm/6 font-medium text-white hover:bg-fuchsia-950/30 transition-colors"
            >
              Radiant raises $100M Series A from Tailwind Ventures
              <ChevronRight className="size-4" />
            </Link>
          }
        />
        <div className="pt-16 pb-24 sm:pt-24 sm:pb-32 md:pt-32 md:pb-48">
          <h1 className="font-display text-6xl/[0.9] font-medium tracking-tight text-balance text-gray-950 sm:text-8xl/[0.8] md:text-9xl/[0.8]">
            Close every deal.
          </h1>
          <p className="mt-8 max-w-lg text-xl/7 font-medium text-gray-950/75 sm:text-2xl/8">
            Radiant helps you sell more by revealing sensitive information about your customers.
          </p>
          <div className="mt-12 flex flex-col gap-x-6 gap-y-4 sm:flex-row">
            <Button href="#">Get started</Button>
            <Button variant="secondary" href="RadiantPricing">
              See pricing
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}

function FeatureSection() {
  const { getAssetUrl } = useWebsiteAssets('radiant');
  
  return (
    <div className="overflow-hidden">
      <Container className="pb-24">
        <Heading as="h2" className="max-w-3xl">
          A snapshot of your entire sales pipeline.
        </Heading>
        <Screenshot
          width={1216}
          height={768}
          src={getAssetUrl('/screenshots/app.png')}
          className="mt-16 h-[36rem] sm:h-auto sm:w-[76rem]"
        />
      </Container>
    </div>
  );
}

function BentoSection() {
  const { getAssetUrl } = useWebsiteAssets('radiant');
  
  return (
    <Container>
      <Subheading>Sales</Subheading>
      <Heading as="h3" className="mt-2 max-w-3xl">
        Know more about your customers than they do.
      </Heading>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-16 lg:grid-cols-6 lg:grid-rows-2">
        <BentoCard
          eyebrow="Insight"
          title="Get perfect clarity"
          description="Radiant uses social engineering to build a detailed financial picture of your leads. Know their budget, compensation package, social security number, and more."
          graphic={
            <div className="h-80 bg-no-repeat bg-[length:1000px_560px] bg-[position:left_-109px_top_-112px]" style={{ backgroundImage: `url(${getAssetUrl('/screenshots/profile.png')})` }} />
          }
          fade={['bottom']}
          className="max-lg:rounded-t-[2rem] lg:col-span-3 lg:rounded-tl-[2rem]"
        />
        <BentoCard
          eyebrow="Analysis"
          title="Undercut your competitors"
          description="With our advanced data mining, you'll know which companies your leads are talking to and exactly how much they're being charged."
          graphic={
            <div className="absolute inset-0 bg-no-repeat bg-[length:1100px_650px] bg-[position:left_-38px_top_-73px]" style={{ backgroundImage: `url(${getAssetUrl('/screenshots/competitors.png')})` }} />
          }
          fade={['bottom']}
          className="lg:col-span-3 lg:rounded-tr-[2rem]"
        />
        <BentoCard
          eyebrow="Speed"
          title="Built for power users"
          description="It's never been faster to cold email your entire contact list using our streamlined keyboard shortcuts."
          graphic={
            <div className="flex size-full pt-10 pl-10">
              <div className="text-sm text-gray-500">⌘ + Shift + D</div>
            </div>
          }
          className="lg:col-span-2 lg:rounded-bl-[2rem]"
        />
        <BentoCard
          eyebrow="Source"
          title="Get the furthest reach"
          description="Bypass those inconvenient privacy laws to source leads from the most unexpected places."
          graphic={
            <div className="flex items-center justify-center h-full">
              <div className="grid grid-cols-3 gap-4">
                <div className="size-12 rounded-full bg-gray-200" />
                <div className="size-12 rounded-full bg-gray-200" />
                <div className="size-12 rounded-full bg-gray-200" />
              </div>
            </div>
          }
          className="lg:col-span-2"
        />
        <BentoCard
          eyebrow="Limitless"
          title="Sell globally"
          description="Radiant helps you sell in locations currently under international embargo."
          graphic={
            <div className="flex items-center justify-center h-full">
              <div className="text-6xl">🌍</div>
            </div>
          }
          className="max-lg:rounded-b-[2rem] lg:col-span-2 lg:rounded-br-[2rem]"
        />
      </div>
    </Container>
  );
}

function DarkBentoSection() {
  const { getAssetUrl } = useWebsiteAssets('radiant');
  
  return (
    <div className="mx-2 mt-2 rounded-[2rem] bg-gray-900 py-32">
      <Container>
        <Subheading dark>Outreach</Subheading>
        <Heading as="h3" dark className="mt-2 max-w-3xl">
          Customer outreach has never been easier.
        </Heading>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-16 lg:grid-cols-6 lg:grid-rows-2">
          <BentoCard
            dark
            eyebrow="Networking"
            title="Sell at the speed of light"
            description="Our RadiantAI chat assistants analyze the sentiment of your conversations in real time, ensuring you're always one step ahead."
            graphic={
              <div className="h-80 bg-no-repeat bg-[length:851px_344px]" style={{ backgroundImage: `url(${getAssetUrl('/screenshots/networking.png')})` }} />
            }
            fade={['top']}
            className="max-lg:rounded-t-[2rem] lg:col-span-4 lg:rounded-tl-[2rem]"
          />
          <BentoCard
            dark
            eyebrow="Integrations"
            title="Meet leads where they are"
            description="With thousands of integrations, no one will be able to escape your cold outreach."
            graphic={
              <div className="flex items-center justify-center h-full">
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="size-10 rounded-lg bg-white/10" />
                  ))}
                </div>
              </div>
            }
            className="z-10 overflow-visible lg:col-span-2 lg:rounded-tr-[2rem]"
          />
          <BentoCard
            dark
            eyebrow="Meetings"
            title="Smart call scheduling"
            description="Automatically insert intro calls into your leads' calendars without their consent."
            graphic={
              <div className="flex items-center justify-center h-full">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="size-12 rounded-full bg-white/20 ring-2 ring-gray-900" />
                  ))}
                </div>
              </div>
            }
            className="lg:col-span-2 lg:rounded-bl-[2rem]"
          />
          <BentoCard
            dark
            eyebrow="Engagement"
            title="Become a thought leader"
            description="RadiantAI automatically writes LinkedIn posts that relate current events to B2B sales, helping you build a reputation as a thought leader."
            graphic={
              <div className="h-80 bg-no-repeat bg-[length:851px_344px]" style={{ backgroundImage: `url(${getAssetUrl('/screenshots/engagement.png')})` }} />
            }
            fade={['top']}
            className="max-lg:rounded-b-[2rem] lg:col-span-4 lg:rounded-br-[2rem]"
          />
        </div>
      </Container>
    </div>
  );
}

export default function RadiantHome() {
  return (
    <div className="overflow-hidden">
      <Hero />
      <main>
        <Container className="mt-10">
          <LogoCloud />
        </Container>
        <div className="bg-gradient-to-b from-white from-50% to-gray-100 py-32">
          <FeatureSection />
          <BentoSection />
        </div>
        <DarkBentoSection />
      </main>
      <Footer />
    </div>
  );
}