import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { PageHeader } from '@/components/sturij/PageHeader';
import { Button } from '@/components/ui/button';
import { ShowcaseSection } from '@/components/showcase/ShowcaseSection';
import { Badge } from '@/components/ui/badge';
import { Paperclip, User, Calendar, CreditCard, Download } from 'lucide-react';

export default function TailwindDescriptionListsShowcase() {
  return (
    <div className="space-y-12">
      <PageHeader
        title="Description Lists"
        description="Key-value pair layouts and detail views converted to use design tokens."
      >
        <Link to={createPageUrl('TailwindShowcaseGallery')}>
          <Button variant="outline" size="sm">← Back to Gallery</Button>
        </Link>
      </PageHeader>

      <ShowcaseSection title="Basic Description Lists" defaultOpen={true}>
        <SimpleListExample />
        <TwoColumnGridExample />
        <StripedRowsExample />
      </ShowcaseSection>

      <ShowcaseSection title="Enhanced Layouts" defaultOpen={false}>
        <SummaryCardExample />
        <EditableFieldsExample />
        <CardContainerExample />
      </ShowcaseSection>

      <ShowcaseSection title="Design System Reference" defaultOpen={false}>
        <TokenReference />
      </ShowcaseSection>
    </div>
  );
}

function SummaryCardExample() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Summary Card</h2>
        <p className="text-sm text-muted-foreground">Compact summary card with status badge and metadata</p>
      </div>

      <div className="lg:col-start-3 lg:row-end-1">
        <div className="rounded-xl bg-muted/50 shadow-sm border border-border">
          <dl className="flex flex-wrap">
            <div className="flex-auto pt-6 pl-6">
              <dt className="text-sm font-semibold">Amount</dt>
              <dd className="mt-1 text-base font-semibold">$10,560.00</dd>
            </div>
            <div className="flex-none self-end px-6 pt-4">
              <dt className="sr-only">Status</dt>
              <dd>
                <Badge className="bg-primary-50 text-primary-700 border-primary-200">
                  Paid
                </Badge>
              </dd>
            </div>
            <div className="mt-6 flex w-full flex-none gap-x-4 border-t border-border px-6 pt-6">
              <dt className="flex-none">
                <span className="sr-only">Client</span>
                <User className="h-6 w-5 text-muted-foreground" />
              </dt>
              <dd className="text-sm font-medium">Alex Curren</dd>
            </div>
            <div className="mt-4 flex w-full flex-none gap-x-4 px-6">
              <dt className="flex-none">
                <span className="sr-only">Due date</span>
                <Calendar className="h-6 w-5 text-muted-foreground" />
              </dt>
              <dd className="text-sm text-muted-foreground">
                <time dateTime="2023-01-31">January 31, 2023</time>
              </dd>
            </div>
            <div className="mt-4 flex w-full flex-none gap-x-4 px-6">
              <dt className="flex-none">
                <span className="sr-only">Payment method</span>
                <CreditCard className="h-6 w-5 text-muted-foreground" />
              </dt>
              <dd className="text-sm text-muted-foreground">Paid with MasterCard</dd>
            </div>
          </dl>
          <div className="mt-6 border-t border-border px-6 py-6">
            <a href="#" className="text-sm font-semibold hover:underline">
              Download receipt <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Card BG: <code className="bg-background px-1 py-0.5 rounded">bg-muted/50</code></li>
          <li>• Badge: <code className="bg-background px-1 py-0.5 rounded">bg-primary-50 text-primary-700</code></li>
          <li>• Icons: <code className="bg-background px-1 py-0.5 rounded">text-muted-foreground</code></li>
          <li>• Dividers: <code className="bg-background px-1 py-0.5 rounded">border-border</code></li>
        </ul>
      </div>
    </section>
  );
}

function EditableFieldsExample() {
  const fields = [
    { label: 'Full name', value: 'Margot Foster' },
    { label: 'Application for', value: 'Backend Developer' },
    { label: 'Email address', value: 'margotfoster@example.com' },
    { label: 'Salary expectation', value: '$120,000' },
    { label: 'About', value: 'Fugiat ipsum ipsum deserunt culpa aute sint do nostrud anim incididunt cillum culpa consequat. Excepteur qui ipsum aliquip consequat sint.' },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">With Editable Fields</h2>
        <p className="text-sm text-muted-foreground">Description list with inline edit buttons</p>
      </div>

      <div className="space-y-4">
        <div className="px-4 sm:px-0">
          <h3 className="text-base font-semibold">Applicant Information</h3>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Personal details and application.</p>
        </div>
        <div className="mt-6 border-t border-border">
          <dl className="divide-y divide-border">
            {fields.map((field, idx) => (
              <div key={idx} className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium">{field.label}</dt>
                <dd className="mt-1 flex text-sm sm:col-span-2 sm:mt-0">
                  <span className="grow text-muted-foreground">{field.value}</span>
                  <span className="ml-4 shrink-0">
                    <Button variant="link" className="h-auto p-0 font-medium">
                      Update
                    </Button>
                  </span>
                </dd>
              </div>
            ))}
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium">Attachments</dt>
              <dd className="mt-1 text-sm sm:col-span-2 sm:mt-0">
                <ul role="list" className="divide-y divide-border rounded-xl border border-border">
                  <li className="flex items-center justify-between py-4 pr-5 pl-4">
                    <div className="flex w-0 flex-1 items-center">
                      <Paperclip className="h-5 w-5 text-muted-foreground" />
                      <div className="ml-4 flex min-w-0 flex-1 gap-2">
                        <span className="truncate font-medium">resume_back_end_developer.pdf</span>
                        <span className="shrink-0 text-muted-foreground">2.4mb</span>
                      </div>
                    </div>
                    <div className="ml-4 flex shrink-0 space-x-4">
                      <Button variant="link" className="h-auto p-0">Update</Button>
                      <span className="text-border">|</span>
                      <Button variant="link" className="h-auto p-0 text-foreground hover:text-foreground/80">
                        Remove
                      </Button>
                    </div>
                  </li>
                </ul>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Dividers: <code className="bg-background px-1 py-0.5 rounded">divide-border</code></li>
          <li>• Edit button: <code className="bg-background px-1 py-0.5 rounded">variant="link"</code></li>
          <li>• Value text: <code className="bg-background px-1 py-0.5 rounded">text-muted-foreground</code></li>
        </ul>
      </div>
    </section>
  );
}

function TwoColumnGridExample() {
  const fields = [
    { label: 'Full name', value: 'Margot Foster' },
    { label: 'Application for', value: 'Backend Developer' },
    { label: 'Email address', value: 'margotfoster@example.com' },
    { label: 'Salary expectation', value: '$120,000' },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Two Column Grid</h2>
        <p className="text-sm text-muted-foreground">Description list in 2-column responsive grid</p>
      </div>

      <div className="space-y-4">
        <div className="px-4 sm:px-0">
          <h3 className="text-base font-semibold">Applicant Information</h3>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Personal details and application.</p>
        </div>
        <div className="mt-6">
          <dl className="grid grid-cols-1 sm:grid-cols-2">
            {fields.map((field, idx) => (
              <div key={idx} className="border-t border-border px-4 py-6 sm:col-span-1 sm:px-0">
                <dt className="text-sm font-medium">{field.label}</dt>
                <dd className="mt-1 text-sm text-muted-foreground sm:mt-2">{field.value}</dd>
              </div>
            ))}
            <div className="border-t border-border px-4 py-6 sm:col-span-2 sm:px-0">
              <dt className="text-sm font-medium">About</dt>
              <dd className="mt-1 text-sm text-muted-foreground sm:mt-2">
                Fugiat ipsum ipsum deserunt culpa aute sint do nostrud anim incididunt cillum culpa consequat.
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Grid: <code className="bg-background px-1 py-0.5 rounded">grid-cols-1 sm:grid-cols-2</code></li>
          <li>• Full width items: <code className="bg-background px-1 py-0.5 rounded">sm:col-span-2</code></li>
          <li>• Compact vertical spacing</li>
        </ul>
      </div>
    </section>
  );
}

function StripedRowsExample() {
  const fields = [
    { label: 'Full name', value: 'Margot Foster', stripe: true },
    { label: 'Application for', value: 'Backend Developer', stripe: false },
    { label: 'Email address', value: 'margotfoster@example.com', stripe: true },
    { label: 'Salary expectation', value: '$120,000', stripe: false },
    { label: 'About', value: 'Fugiat ipsum ipsum deserunt culpa aute sint do nostrud anim incididunt cillum culpa consequat.', stripe: true },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Striped Rows</h2>
        <p className="text-sm text-muted-foreground">Alternating background colors for visual separation</p>
      </div>

      <div className="space-y-4">
        <div className="px-4 sm:px-0">
          <h3 className="text-base font-semibold">Applicant Information</h3>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Personal details and application.</p>
        </div>
        <div className="mt-6 border-t border-border">
          <dl className="divide-y divide-border">
            {fields.map((field, idx) => (
              <div
                key={idx}
                className={`px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3 ${
                  field.stripe ? 'bg-muted/50' : 'bg-card'
                }`}
              >
                <dt className="text-sm font-medium">{field.label}</dt>
                <dd className="mt-1 text-sm text-muted-foreground sm:col-span-2 sm:mt-0">{field.value}</dd>
              </div>
            ))}
            <div className="bg-card px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
              <dt className="text-sm font-medium">Attachments</dt>
              <dd className="mt-2 text-sm sm:col-span-2 sm:mt-0">
                <ul role="list" className="divide-y divide-border rounded-xl border border-border">
                  <li className="flex items-center justify-between py-4 pr-5 pl-4">
                    <div className="flex w-0 flex-1 items-center">
                      <Paperclip className="h-5 w-5 text-muted-foreground" />
                      <div className="ml-4 flex min-w-0 flex-1 gap-2">
                        <span className="truncate font-medium">resume_back_end_developer.pdf</span>
                        <span className="shrink-0 text-muted-foreground">2.4mb</span>
                      </div>
                    </div>
                    <div className="ml-4 shrink-0">
                      <Button variant="link" className="h-auto p-0">
                        Download
                      </Button>
                    </div>
                  </li>
                </ul>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Stripe BG: <code className="bg-background px-1 py-0.5 rounded">bg-muted/50</code></li>
          <li>• Default BG: <code className="bg-background px-1 py-0.5 rounded">bg-card</code></li>
          <li>• Alternating pattern for visual hierarchy</li>
        </ul>
      </div>
    </section>
  );
}

function CardContainerExample() {
  const fields = [
    { label: 'Full name', value: 'Margot Foster' },
    { label: 'Application for', value: 'Backend Developer' },
    { label: 'Email address', value: 'margotfoster@example.com' },
    { label: 'Salary expectation', value: '$120,000' },
    { label: 'About', value: 'Fugiat ipsum ipsum deserunt culpa aute sint do nostrud anim incididunt cillum culpa consequat.' },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">In Card Container</h2>
        <p className="text-sm text-muted-foreground">Description list wrapped in rounded card with shadow</p>
      </div>

      <div className="overflow-hidden bg-card shadow-sm rounded-xl border border-border">
        <div className="px-4 py-6 sm:px-6">
          <h3 className="text-base font-semibold">Applicant Information</h3>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Personal details and application.</p>
        </div>
        <div className="border-t border-border">
          <dl className="divide-y divide-border">
            {fields.map((field, idx) => (
              <div key={idx} className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium">{field.label}</dt>
                <dd className="mt-1 text-sm text-muted-foreground sm:col-span-2 sm:mt-0">{field.value}</dd>
              </div>
            ))}
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium">Attachments</dt>
              <dd className="mt-2 text-sm sm:col-span-2 sm:mt-0">
                <ul role="list" className="divide-y divide-border rounded-xl border border-border">
                  <li className="flex items-center justify-between py-4 pr-5 pl-4">
                    <div className="flex w-0 flex-1 items-center">
                      <Paperclip className="h-5 w-5 text-muted-foreground" />
                      <div className="ml-4 flex min-w-0 flex-1 gap-2">
                        <span className="truncate font-medium">resume_back_end_developer.pdf</span>
                        <span className="shrink-0 text-muted-foreground">2.4mb</span>
                      </div>
                    </div>
                    <div className="ml-4 shrink-0">
                      <Button variant="link" className="h-auto p-0">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </li>
                  <li className="flex items-center justify-between py-4 pr-5 pl-4">
                    <div className="flex w-0 flex-1 items-center">
                      <Paperclip className="h-5 w-5 text-muted-foreground" />
                      <div className="ml-4 flex min-w-0 flex-1 gap-2">
                        <span className="truncate font-medium">coverletter_back_end_developer.pdf</span>
                        <span className="shrink-0 text-muted-foreground">4.5mb</span>
                      </div>
                    </div>
                    <div className="ml-4 shrink-0">
                      <Button variant="link" className="h-auto p-0">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </li>
                </ul>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Container: <code className="bg-background px-1 py-0.5 rounded">bg-card shadow-sm</code></li>
          <li>• Radius: <code className="bg-background px-1 py-0.5 rounded">rounded-xl</code></li>
          <li>• File list with nested borders and dividers</li>
        </ul>
      </div>
    </section>
  );
}

function SimpleListExample() {
  const fields = [
    { label: 'Full name', value: 'Margot Foster' },
    { label: 'Application for', value: 'Backend Developer' },
    { label: 'Email address', value: 'margotfoster@example.com' },
    { label: 'Salary expectation', value: '$120,000' },
    { label: 'About', value: 'Fugiat ipsum ipsum deserunt culpa aute sint do nostrud anim incididunt cillum culpa consequat.' },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Simple Description List</h2>
        <p className="text-sm text-muted-foreground">Clean layout without container styling</p>
      </div>

      <div className="space-y-4">
        <div className="px-4 sm:px-0">
          <h3 className="text-base font-semibold">Applicant Information</h3>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Personal details and application.</p>
        </div>
        <div className="mt-6 border-t border-border">
          <dl className="divide-y divide-border">
            {fields.map((field, idx) => (
              <div key={idx} className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium">{field.label}</dt>
                <dd className="mt-1 text-sm text-muted-foreground sm:col-span-2 sm:mt-0">{field.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• No container - minimal styling</li>
          <li>• Grid layout: <code className="bg-background px-1 py-0.5 rounded">sm:grid sm:grid-cols-3</code></li>
          <li>• Label: 1/3 width, Value: 2/3 width</li>
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
        <p className="text-sm text-muted-foreground">Complete token reference for description lists</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-border p-4 space-y-2">
          <h3 className="text-sm font-medium">Layout</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• <code className="bg-muted px-1 py-0.5 rounded">sm:grid sm:grid-cols-3</code></li>
            <li>• <code className="bg-muted px-1 py-0.5 rounded">sm:col-span-2</code> for values</li>
            <li>• <code className="bg-muted px-1 py-0.5 rounded">divide-y divide-border</code></li>
          </ul>
        </div>

        <div className="rounded-lg border border-border p-4 space-y-2">
          <h3 className="text-sm font-medium">Typography</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Label: <code className="bg-muted px-1 py-0.5 rounded">text-sm font-medium</code></li>
            <li>• Value: <code className="bg-muted px-1 py-0.5 rounded">text-sm text-muted-foreground</code></li>
            <li>• Title: <code className="bg-muted px-1 py-0.5 rounded">text-base font-semibold</code></li>
          </ul>
        </div>

        <div className="rounded-lg border border-border p-4 space-y-2">
          <h3 className="text-sm font-medium">Components</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Button (link variant for inline actions)</li>
            <li>• Badge for status indicators</li>
            <li>• Lucide icons throughout</li>
          </ul>
        </div>
      </div>
    </section>
  );
}