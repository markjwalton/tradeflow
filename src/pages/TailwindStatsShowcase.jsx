import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { PageHeader } from '@/components/sturij/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShowcaseSection } from '@/components/showcase/ShowcaseSection';
import { ArrowUp, ArrowDown, Users, Mail, MousePointerClick } from 'lucide-react';

export default function TailwindStatsShowcase() {
  return (
    <div className="space-y-12">
      <PageHeader
        title="Stat Layouts"
        description="KPI and metric displays converted to use design tokens and semantic colors."
      >
        <Link to={createPageUrl('TailwindShowcaseGallery')}>
          <Button variant="outline" size="sm">← Back to Gallery</Button>
        </Link>
      </PageHeader>

      <ShowcaseSection title="Grid Layouts" defaultOpen={true}>
        <GridWithChangeExample />
        <SimpleGridExample />
      </ShowcaseSection>

      <ShowcaseSection title="Card Layouts" defaultOpen={false}>
        <SimpleCardsExample />
        <CardsWithIconsExample />
        <DividedCardsExample />
      </ShowcaseSection>

      <ShowcaseSection title="Design System Reference" defaultOpen={false}>
        <TokenReference />
      </ShowcaseSection>
    </div>
  );
}

function GridWithChangeExample() {
  const stats = [
    { name: 'Revenue', value: '$405,091.00', change: '+4.75%', changeType: 'positive' },
    { name: 'Overdue invoices', value: '$12,787.00', change: '+54.02%', changeType: 'negative' },
    { name: 'Outstanding invoices', value: '$245,988.00', change: '-1.39%', changeType: 'positive' },
    { name: 'Expenses', value: '$30,156.00', change: '+10.18%', changeType: 'negative' },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Grid with Change Indicators</h2>
        <p className="text-sm text-muted-foreground">Tight grid layout with positive/negative change indicators</p>
      </div>

      <dl className="grid grid-cols-1 gap-px bg-border/20 sm:grid-cols-2 lg:grid-cols-4 rounded-xl overflow-hidden">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 bg-card px-4 py-10 sm:px-6 xl:px-8"
          >
            <dt className="text-sm font-medium text-muted-foreground">{stat.name}</dt>
            <dd
              className={`text-xs font-medium ${
                stat.changeType === 'negative' ? 'text-destructive' : 'text-muted-foreground'
              }`}
            >
              {stat.change}
            </dd>
            <dd className="w-full flex-none text-3xl font-medium tracking-tight">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Negative change: <code className="bg-background px-1 py-0.5 rounded">text-destructive</code></li>
          <li>• Grid divider: <code className="bg-background px-1 py-0.5 rounded">gap-px bg-border/20</code></li>
          <li>• Large value: <code className="bg-background px-1 py-0.5 rounded">text-3xl tracking-tight</code></li>
        </ul>
      </div>
    </section>
  );
}

function SimpleGridExample() {
  const stats = [
    { name: 'Number of deploys', value: '405' },
    { name: 'Average deploy time', value: '3.65', unit: 'mins' },
    { name: 'Number of servers', value: '3' },
    { name: 'Success rate', value: '98.5%' },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Simple Grid</h2>
        <p className="text-sm text-muted-foreground">Clean grid layout with optional units</p>
      </div>

      <div className="bg-card rounded-xl border border-border">
        <div className="grid grid-cols-1 gap-px bg-border/20 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-card px-4 py-6 sm:px-6 lg:px-8">
              <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
              <p className="mt-2 flex items-baseline gap-x-2">
                <span className="text-4xl font-semibold tracking-tight">{stat.value}</span>
                {stat.unit ? <span className="text-sm text-muted-foreground">{stat.unit}</span> : null}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Label: <code className="bg-background px-1 py-0.5 rounded">text-sm text-muted-foreground</code></li>
          <li>• Value: <code className="bg-background px-1 py-0.5 rounded">text-4xl font-semibold tracking-tight</code></li>
          <li>• Unit suffix with smaller size</li>
        </ul>
      </div>
    </section>
  );
}

function SimpleCardsExample() {
  const stats = [
    { name: 'Total Subscribers', stat: '71,897' },
    { name: 'Avg. Open Rate', stat: '58.16%' },
    { name: 'Avg. Click Rate', stat: '24.57%' },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Simple Cards</h2>
        <p className="text-sm text-muted-foreground">Individual stat cards with shadow</p>
      </div>

      <div>
        <h3 className="text-base font-semibold mb-5">Last 30 days</h3>
        <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {stats.map((item) => (
            <div key={item.name} className="overflow-hidden rounded-xl bg-card px-4 py-5 shadow-sm border border-border sm:p-6">
              <dt className="truncate text-sm font-medium text-muted-foreground">{item.name}</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight">{item.stat}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Card: <code className="bg-background px-1 py-0.5 rounded">bg-card shadow-sm border</code></li>
          <li>• Gap: <code className="bg-background px-1 py-0.5 rounded">gap-5</code> for visual separation</li>
          <li>• Responsive: <code className="bg-background px-1 py-0.5 rounded">sm:grid-cols-3</code></li>
        </ul>
      </div>
    </section>
  );
}

function CardsWithIconsExample() {
  const stats = [
    { id: 1, name: 'Total Subscribers', stat: '71,897', icon: Users, change: '122', changeType: 'increase' },
    { id: 2, name: 'Avg. Open Rate', stat: '58.16%', icon: Mail, change: '5.4%', changeType: 'increase' },
    { id: 3, name: 'Avg. Click Rate', stat: '24.57%', icon: MousePointerClick, change: '3.2%', changeType: 'decrease' },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Cards with Icons and Change</h2>
        <p className="text-sm text-muted-foreground">Feature cards with colored icons and trend indicators</p>
      </div>

      <div>
        <h3 className="text-base font-semibold mb-5">Last 30 days</h3>

        <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="relative overflow-hidden rounded-xl bg-card px-4 pt-5 pb-12 shadow-sm border border-border sm:px-6 sm:pt-6"
              >
                <dt>
                  <div className="absolute rounded-lg bg-primary p-3">
                    <Icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <p className="ml-16 truncate text-sm font-medium text-muted-foreground">{item.name}</p>
                </dt>
                <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                  <p className="text-2xl font-semibold">{item.stat}</p>
                  <p
                    className={`ml-2 flex items-baseline text-sm font-semibold ${
                      item.changeType === 'increase' ? 'text-primary-600' : 'text-destructive'
                    }`}
                  >
                    {item.changeType === 'increase' ? (
                      <ArrowUp className="h-5 w-5 shrink-0 self-center text-primary-600" />
                    ) : (
                      <ArrowDown className="h-5 w-5 shrink-0 self-center text-destructive" />
                    )}
                    <span className="sr-only"> {item.changeType === 'increase' ? 'Increased' : 'Decreased'} by </span>
                    {item.change}
                  </p>
                  <div className="absolute inset-x-0 bottom-0 bg-muted/50 px-4 py-4 sm:px-6">
                    <div className="text-sm">
                      <a href="#" className="font-medium text-primary hover:underline">
                        View all<span className="sr-only"> {item.name} stats</span>
                      </a>
                    </div>
                  </div>
                </dd>
              </div>
            );
          })}
        </dl>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Icon background: <code className="bg-background px-1 py-0.5 rounded">bg-primary</code></li>
          <li>• Increase: <code className="bg-background px-1 py-0.5 rounded">text-primary-600</code></li>
          <li>• Decrease: <code className="bg-background px-1 py-0.5 rounded">text-destructive</code></li>
          <li>• Footer: <code className="bg-background px-1 py-0.5 rounded">bg-muted/50</code></li>
        </ul>
      </div>
    </section>
  );
}

function DividedCardsExample() {
  const stats = [
    { name: 'Total Subscribers', stat: '71,897', previousStat: '70,946', change: '12%', changeType: 'increase' },
    { name: 'Avg. Open Rate', stat: '58.16%', previousStat: '56.14%', change: '2.02%', changeType: 'increase' },
    { name: 'Avg. Click Rate', stat: '24.57%', previousStat: '28.62%', change: '4.05%', changeType: 'decrease' },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Divided Cards with Previous Comparison</h2>
        <p className="text-sm text-muted-foreground">Connected cards showing previous stat and percentage change</p>
      </div>

      <div>
        <h3 className="text-base font-semibold mb-5">Last 30 days</h3>
        <dl className="grid grid-cols-1 divide-border overflow-hidden rounded-xl bg-card shadow-sm border border-border md:grid-cols-3 md:divide-x md:divide-y-0">
          {stats.map((item) => (
            <div key={item.name} className="px-4 py-5 sm:p-6">
              <dt className="text-base font-normal">{item.name}</dt>
              <dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
                <div className="flex items-baseline text-2xl font-semibold text-primary">
                  {item.stat}
                  <span className="ml-2 text-sm font-medium text-muted-foreground">from {item.previousStat}</span>
                </div>

                <Badge
                  className={`inline-flex items-baseline px-2.5 py-0.5 md:mt-2 lg:mt-0 ${
                    item.changeType === 'increase'
                      ? 'bg-primary-50 text-primary-700 border-primary-200'
                      : 'bg-destructive-50 text-destructive-700 border-destructive-200'
                  }`}
                >
                  {item.changeType === 'increase' ? (
                    <ArrowUp className="mr-0.5 -ml-1 h-5 w-5 shrink-0 self-center text-primary-600" />
                  ) : (
                    <ArrowDown className="mr-0.5 -ml-1 h-5 w-5 shrink-0 self-center text-destructive-600" />
                  )}
                  <span className="sr-only"> {item.changeType === 'increase' ? 'Increased' : 'Decreased'} by </span>
                  {item.change}
                </Badge>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Dividers: <code className="bg-background px-1 py-0.5 rounded">md:divide-x divide-border</code></li>
          <li>• Current stat: <code className="bg-background px-1 py-0.5 rounded">text-primary</code></li>
          <li>• Increase badge: <code className="bg-background px-1 py-0.5 rounded">bg-primary-50 text-primary-700</code></li>
          <li>• Decrease badge: <code className="bg-background px-1 py-0.5 rounded">bg-destructive-50 text-destructive-700</code></li>
        </ul>
      </div>
    </section>
  );
}

function TokenReference() {
  return (
    <section className="space-y-4 mt-12 pt-8 border-t border-border">
      <div>
        <h2 className="text-xl font-display mb-2">Design System Reference</h2>
        <p className="text-sm text-muted-foreground">Complete token reference for stat displays</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-border p-4 space-y-2">
          <h3 className="text-sm font-medium">Typography Scale</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Label: <code className="bg-muted px-1 py-0.5 rounded">text-sm</code></li>
            <li>• Large stat: <code className="bg-muted px-1 py-0.5 rounded">text-3xl/text-4xl</code></li>
            <li>• Tracking: <code className="bg-muted px-1 py-0.5 rounded">tracking-tight</code></li>
          </ul>
        </div>

        <div className="rounded-lg border border-border p-4 space-y-2">
          <h3 className="text-sm font-medium">Semantic Colors</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Primary: Success/positive trends</li>
            <li>• Destructive: Negative/decrease</li>
            <li>• Muted: Labels and context</li>
          </ul>
        </div>

        <div className="rounded-lg border border-border p-4 space-y-2">
          <h3 className="text-sm font-medium">Layout Patterns</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Grid with gap-px for dividers</li>
            <li>• Individual cards with gap-5</li>
            <li>• Divided cards with border dividers</li>
          </ul>
        </div>
      </div>
    </section>
  );
}