import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { PageHeader } from '@/components/sturij/PageHeader';
import { 
  List, FileText, Table, Calendar, Layout, MessageSquare, 
  Users, CreditCard, Tag, Menu, Navigation, FileCode, 
  BarChart3, FileStack, AppWindow, Code
} from 'lucide-react';

const showcasePages = [
  {
    category: 'Layout & Navigation',
    items: [
      { name: 'Lists & Tabs', slug: 'TailwindListsShowcase', icon: List, description: 'List layouts, tabs, pagination, sidebar navigation' },
      { name: 'Navigation', slug: 'TailwindNavigationShowcase', icon: Navigation, description: 'Navigation menus and patterns' },
      { name: 'Menus & Dropdowns', slug: 'TailwindMenuShowcase', icon: Menu, description: 'Dropdown menus and action patterns' },
      { name: 'Page Headers', slug: 'TailwindPageHeadersShowcase', icon: FileCode, description: 'Page header layouts and actions' },
      { name: 'Section Headers', slug: 'TailwindSectionHeadersShowcase', icon: FileStack, description: 'Section headers with tabs and filters' },
      { name: 'App Shells', slug: 'TailwindAppShellsShowcase', icon: AppWindow, description: 'Complete application layouts' },
    ]
  },
  {
    category: 'Forms & Inputs',
    items: [
      { name: 'Forms', slug: 'TailwindFormsShowcase', icon: FileText, description: 'Form layouts, inputs, selects, textareas' },
    ]
  },
  {
    category: 'Data Display',
    items: [
      { name: 'Tables', slug: 'TailwindTablesShowcase', icon: Table, description: 'Table layouts and grid cards' },
      { name: 'People Lists', slug: 'TailwindPeopleListsShowcase', icon: Users, description: 'People and project list patterns' },
      { name: 'Description Lists', slug: 'TailwindDescriptionListsShowcase', icon: FileStack, description: 'Key-value data displays' },
      { name: 'Stats', slug: 'TailwindStatsShowcase', icon: BarChart3, description: 'Statistics and metrics displays' },
      { name: 'Feeds', slug: 'TailwindFeedsShowcase', icon: MessageSquare, description: 'Activity feeds and timelines' },
      { name: 'Calendar', slug: 'TailwindCalendarShowcase', icon: Calendar, description: 'Calendar and scheduling layouts' },
    ]
  },
  {
    category: 'Components',
    items: [
      { name: 'Cards', slug: 'TailwindCardsShowcase', icon: CreditCard, description: 'Card component variations' },
      { name: 'Badges', slug: 'TailwindBadgesShowcase', icon: Tag, description: 'Badge and label patterns' },
      { name: 'Drawers', slug: 'TailwindDrawerShowcase', icon: Layout, description: 'Slide-over panels and drawers' },
    ]
  }
];

export default function TailwindShowcaseGallery() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Tailwind UI Pattern Library"
        description="Browse our complete collection of Tailwind CSS UI patterns and components"
      />

      {showcasePages.map((category) => (
        <section key={category.category} className="space-y-4">
          <h2 className="text-xl font-display text-primary-600">{category.category}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {category.items.map((page) => {
              const Icon = page.icon;
              return (
                <Link
                  key={page.slug}
                  to={createPageUrl(page.slug)}
                  className="group relative rounded-xl border border-border bg-card p-6 hover:shadow-md transition-all hover:-translate-y-0.5"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600 group-hover:bg-primary-100">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-sm font-semibold text-foreground group-hover:text-primary-600 transition-colors">
                        {page.name}
                      </h2>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {page.description}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}