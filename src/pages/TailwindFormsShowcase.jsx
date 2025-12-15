import React from 'react';
import { PageHeader } from '@/components/sturij/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Image, UserCircle, ChevronDown, Mail, HelpCircle, AlertCircle } from 'lucide-react';

export default function TailwindFormsShowcase() {
  return (
    <div className="space-y-12">
      <PageHeader
        title="Form Layouts"
        description="Form layout patterns converted to use design tokens and components."
      />

      <SimpleStackedForm />
      <TwoColumnForm />
      <CardStyleForms />
      <LabelOnLeftForm />
      <InputVariationsSection />

      <TokenReference />
    </div>
  );
}

function SimpleStackedForm() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Simple Stacked Form</h2>
        <p className="text-sm text-muted-foreground">Basic vertical form with sections</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <form>
          <div className="space-y-12">
            <div className="border-b border-border pb-12">
              <h2 className="text-base font-display">Profile</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                This information will be displayed publicly so be careful what you share.
              </p>

              <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="sm:col-span-4">
                  <Label htmlFor="username">Username</Label>
                  <div className="mt-2">
                    <div className="flex items-center rounded-lg border border-input bg-background pl-3 focus-within:ring-2 focus-within:ring-primary">
                      <div className="shrink-0 text-base text-muted-foreground select-none sm:text-sm">workcation.com/</div>
                      <Input
                        id="username"
                        name="username"
                        type="text"
                        placeholder="janesmith"
                        className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>
                  </div>
                </div>

                <div className="col-span-full">
                  <Label htmlFor="about">About</Label>
                  <div className="mt-2">
                    <Textarea
                      id="about"
                      name="about"
                      rows={3}
                      placeholder="Write a few sentences about yourself..."
                    />
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">Write a few sentences about yourself.</p>
                </div>

                <div className="col-span-full">
                  <Label htmlFor="photo">Photo</Label>
                  <div className="mt-2 flex items-center gap-x-3">
                    <UserCircle className="h-12 w-12 text-muted-foreground" />
                    <Button type="button" variant="outline" size="sm">
                      Change
                    </Button>
                  </div>
                </div>

                <div className="col-span-full">
                  <Label htmlFor="cover-photo">Cover photo</Label>
                  <div className="mt-2 flex justify-center rounded-lg border border-dashed border-border px-6 py-10">
                    <div className="text-center">
                      <Image className="mx-auto h-12 w-12 text-muted-foreground" />
                      <div className="mt-4 flex text-sm text-muted-foreground">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer rounded-md font-semibold text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
                        >
                          <span>Upload a file</span>
                          <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-b border-border pb-12">
              <h2 className="text-base font-display">Personal Information</h2>
              <p className="mt-1 text-sm text-muted-foreground">Use a permanent address where you can receive mail.</p>

              <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <Label htmlFor="first-name">First name</Label>
                  <div className="mt-2">
                    <Input id="first-name" name="first-name" type="text" />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <Label htmlFor="last-name">Last name</Label>
                  <div className="mt-2">
                    <Input id="last-name" name="last-name" type="text" />
                  </div>
                </div>

                <div className="sm:col-span-4">
                  <Label htmlFor="email">Email address</Label>
                  <div className="mt-2">
                    <Input id="email" name="email" type="email" />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <Label htmlFor="country">Country</Label>
                  <div className="mt-2">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="ca">Canada</SelectItem>
                        <SelectItem value="mx">Mexico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="col-span-full">
                  <Label htmlFor="street-address">Street address</Label>
                  <div className="mt-2">
                    <Input id="street-address" name="street-address" type="text" />
                  </div>
                </div>

                <div className="sm:col-span-2 sm:col-start-1">
                  <Label htmlFor="city">City</Label>
                  <div className="mt-2">
                    <Input id="city" name="city" type="text" />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="region">State / Province</Label>
                  <div className="mt-2">
                    <Input id="region" name="region" type="text" />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="postal-code">ZIP / Postal code</Label>
                  <div className="mt-2">
                    <Input id="postal-code" name="postal-code" type="text" />
                  </div>
                </div>
              </div>
            </div>

            <NotificationsSection />
          </div>

          <div className="mt-6 flex items-center justify-end gap-x-6">
            <Button type="button" variant="ghost">
              Cancel
            </Button>
            <Button type="submit">
              Save
            </Button>
          </div>
        </form>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Section dividers: <code className="bg-background px-1 py-0.5 rounded">border-b border-border</code></li>
          <li>• Input prefix wrapper with focus ring</li>
          <li>• Shadcn components: Input, Textarea, Select, Button</li>
        </ul>
      </div>
    </section>
  );
}

function TwoColumnForm() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Two-Column Layout</h2>
        <p className="text-sm text-muted-foreground">Side-by-side description and form fields</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <form>
          <div className="space-y-12">
            <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-border pb-12 md:grid-cols-3">
              <div>
                <h2 className="text-base font-display">Profile</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  This information will be displayed publicly so be careful what you share.
                </p>
              </div>

              <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">
                <div className="sm:col-span-4">
                  <Label htmlFor="username-2">Username</Label>
                  <div className="mt-2">
                    <div className="flex items-center rounded-lg border border-input bg-background pl-3 focus-within:ring-2 focus-within:ring-primary">
                      <div className="shrink-0 text-base text-muted-foreground select-none sm:text-sm">workcation.com/</div>
                      <Input
                        id="username-2"
                        name="username"
                        type="text"
                        placeholder="janesmith"
                        className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>
                  </div>
                </div>

                <div className="col-span-full">
                  <Label htmlFor="about-2">About</Label>
                  <div className="mt-2">
                    <Textarea id="about-2" name="about" rows={3} />
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">Write a few sentences about yourself.</p>
                </div>

                <div className="col-span-full">
                  <Label htmlFor="photo-2">Photo</Label>
                  <div className="mt-2 flex items-center gap-x-3">
                    <UserCircle className="h-12 w-12 text-muted-foreground" />
                    <Button type="button" variant="outline" size="sm">
                      Change
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-border pb-12 md:grid-cols-3">
              <div>
                <h2 className="text-base font-display">Personal Information</h2>
                <p className="mt-1 text-sm text-muted-foreground">Use a permanent address where you can receive mail.</p>
              </div>

              <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">
                <div className="sm:col-span-3">
                  <Label htmlFor="first-name-2">First name</Label>
                  <div className="mt-2">
                    <Input id="first-name-2" name="first-name" type="text" />
                  </div>
                </div>
                <div className="sm:col-span-3">
                  <Label htmlFor="last-name-2">Last name</Label>
                  <div className="mt-2">
                    <Input id="last-name-2" name="last-name" type="text" />
                  </div>
                </div>
                <div className="sm:col-span-4">
                  <Label htmlFor="email-2">Email address</Label>
                  <div className="mt-2">
                    <Input id="email-2" name="email" type="email" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-x-6">
            <Button type="button" variant="ghost">
              Cancel
            </Button>
            <Button type="submit">
              Save
            </Button>
          </div>
        </form>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Three-column grid for description + form columns</li>
          <li>• Responsive: stacks on mobile, side-by-side on md+</li>
        </ul>
      </div>
    </section>
  );
}

function CardStyleForms() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Card-Style Forms</h2>
        <p className="text-sm text-muted-foreground">Forms in elevated card containers</p>
      </div>

      <div className="rounded-xl border border-border bg-background p-6">
        <div className="divide-y divide-border">
          <div className="grid grid-cols-1 gap-x-8 gap-y-8 py-10 md:grid-cols-3">
            <div className="px-4 sm:px-0">
              <h2 className="text-base font-display">Profile</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                This information will be displayed publicly so be careful what you share.
              </p>
            </div>

            <form className="bg-card shadow-sm rounded-xl border border-border md:col-span-2">
              <div className="px-4 py-6 sm:p-8">
                <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                  <div className="sm:col-span-4">
                    <Label htmlFor="username-3">Username</Label>
                    <div className="mt-2">
                      <div className="flex items-center rounded-lg border border-input bg-background pl-3 focus-within:ring-2 focus-within:ring-primary">
                        <div className="shrink-0 text-base text-muted-foreground select-none sm:text-sm">workcation.com/</div>
                        <Input
                          id="username-3"
                          name="username"
                          type="text"
                          placeholder="janesmith"
                          className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-span-full">
                    <Label htmlFor="about-3">About</Label>
                    <div className="mt-2">
                      <Textarea id="about-3" name="about" rows={3} />
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">Write a few sentences about yourself.</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-x-6 border-t border-border px-4 py-4 sm:px-8">
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
                <Button type="submit">
                  Save
                </Button>
              </div>
            </form>
          </div>

          <div className="grid grid-cols-1 gap-x-8 gap-y-8 py-10 md:grid-cols-3">
            <div className="px-4 sm:px-0">
              <h2 className="text-base font-display">Personal Information</h2>
              <p className="mt-1 text-sm text-muted-foreground">Use a permanent address where you can receive mail.</p>
            </div>

            <form className="bg-card shadow-sm rounded-xl border border-border md:col-span-2">
              <div className="px-4 py-6 sm:p-8">
                <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <Label htmlFor="first-name-3">First name</Label>
                    <div className="mt-2">
                      <Input id="first-name-3" name="first-name" type="text" />
                    </div>
                  </div>
                  <div className="sm:col-span-3">
                    <Label htmlFor="last-name-3">Last name</Label>
                    <div className="mt-2">
                      <Input id="last-name-3" name="last-name" type="text" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-x-6 border-t border-border px-4 py-4 sm:px-8">
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
                <Button type="submit">
                  Save
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Cards with <code className="bg-background px-1 py-0.5 rounded">shadow-sm rounded-xl border</code></li>
          <li>• Form actions in bordered footer</li>
          <li>• Sections divided by <code className="bg-background px-1 py-0.5 rounded">divide-y divide-border</code></li>
        </ul>
      </div>
    </section>
  );
}

function LabelOnLeftForm() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-display mb-2">Label on Left Form</h2>
        <p className="text-sm text-muted-foreground">Horizontal form with labels aligned left</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <form>
          <div className="space-y-12 sm:space-y-16">
            <div>
              <h2 className="text-base font-display">Profile</h2>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                This information will be displayed publicly so be careful what you share.
              </p>

              <div className="mt-10 space-y-8 border-b border-border pb-12 sm:space-y-0 sm:divide-y sm:divide-border sm:border-t sm:pb-0">
                <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                  <Label htmlFor="username-4" className="block text-sm font-medium sm:pt-1.5">
                    Username
                  </Label>
                  <div className="mt-2 sm:col-span-2 sm:mt-0">
                    <div className="flex items-center rounded-lg border border-input bg-background pl-3 focus-within:ring-2 focus-within:ring-primary sm:max-w-md">
                      <div className="shrink-0 text-base text-muted-foreground select-none sm:text-sm">workcation.com/</div>
                      <Input
                        id="username-4"
                        name="username"
                        type="text"
                        placeholder="janesmith"
                        className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>
                  </div>
                </div>

                <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                  <Label htmlFor="about-4" className="block text-sm font-medium sm:pt-1.5">
                    About
                  </Label>
                  <div className="mt-2 sm:col-span-2 sm:mt-0">
                    <Textarea id="about-4" name="about" rows={3} className="sm:max-w-2xl" />
                    <p className="mt-3 text-sm text-muted-foreground">Write a few sentences about yourself.</p>
                  </div>
                </div>

                <div className="sm:grid sm:grid-cols-3 sm:items-center sm:gap-4 sm:py-6">
                  <Label htmlFor="photo-4" className="block text-sm font-medium">
                    Photo
                  </Label>
                  <div className="mt-2 sm:col-span-2 sm:mt-0">
                    <div className="flex items-center gap-x-3">
                      <UserCircle className="h-12 w-12 text-muted-foreground" />
                      <Button type="button" variant="outline" size="sm">
                        Change
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-base font-display">Personal Information</h2>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Use a permanent address where you can receive mail.</p>

              <div className="mt-10 space-y-8 border-b border-border pb-12 sm:space-y-0 sm:divide-y sm:divide-border sm:border-t sm:pb-0">
                <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                  <Label htmlFor="first-name-4" className="block text-sm font-medium sm:pt-1.5">
                    First name
                  </Label>
                  <div className="mt-2 sm:col-span-2 sm:mt-0">
                    <Input id="first-name-4" name="first-name" type="text" className="sm:max-w-xs" />
                  </div>
                </div>

                <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                  <Label htmlFor="last-name-4" className="block text-sm font-medium sm:pt-1.5">
                    Last name
                  </Label>
                  <div className="mt-2 sm:col-span-2 sm:mt-0">
                    <Input id="last-name-4" name="last-name" type="text" className="sm:max-w-xs" />
                  </div>
                </div>

                <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                  <Label htmlFor="email-4" className="block text-sm font-medium sm:pt-1.5">
                    Email address
                  </Label>
                  <div className="mt-2 sm:col-span-2 sm:mt-0">
                    <Input id="email-4" name="email" type="email" className="sm:max-w-md" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-x-6">
            <Button type="button" variant="ghost">
              Cancel
            </Button>
            <Button type="submit">
              Save
            </Button>
          </div>
        </form>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Three-column grid: label spans 1, input spans 2</li>
          <li>• Dividers between fields with <code className="bg-background px-1 py-0.5 rounded">divide-y</code></li>
          <li>• Max-width constraints on inputs for better UX</li>
        </ul>
      </div>
    </section>
  );
}

function NotificationsSection() {
  return (
    <div className="border-b border-border pb-12">
      <h2 className="text-base font-display">Notifications</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        We'll always let you know about important changes, but you pick what else you want to hear about.
      </p>

      <div className="mt-10 space-y-10">
        <fieldset>
          <legend className="text-sm font-display">By email</legend>
          <div className="mt-6 space-y-6">
            <div className="flex items-start gap-3">
              <div className="flex items-center h-5">
                <Checkbox id="comments" defaultChecked />
              </div>
              <div className="text-sm">
                <Label htmlFor="comments" className="font-medium">
                  Comments
                </Label>
                <p className="text-muted-foreground">Get notified when someones posts a comment on a posting.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center h-5">
                <Checkbox id="candidates" />
              </div>
              <div className="text-sm">
                <Label htmlFor="candidates" className="font-medium">
                  Candidates
                </Label>
                <p className="text-muted-foreground">Get notified when a candidate applies for a job.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center h-5">
                <Checkbox id="offers" />
              </div>
              <div className="text-sm">
                <Label htmlFor="offers" className="font-medium">
                  Offers
                </Label>
                <p className="text-muted-foreground">Get notified when a candidate accepts or rejects an offer.</p>
              </div>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-display">Push notifications</legend>
          <p className="mt-1 text-sm text-muted-foreground">These are delivered via SMS to your mobile phone.</p>
          <div className="mt-6">
            <RadioGroup defaultValue="everything">
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="everything" id="push-everything" />
                <Label htmlFor="push-everything" className="font-medium">
                  Everything
                </Label>
              </div>
              <div className="flex items-center space-x-3 mt-4">
                <RadioGroupItem value="email" id="push-email" />
                <Label htmlFor="push-email" className="font-medium">
                  Same as email
                </Label>
              </div>
              <div className="flex items-center space-x-3 mt-4">
                <RadioGroupItem value="nothing" id="push-nothing" />
                <Label htmlFor="push-nothing" className="font-medium">
                  No push notifications
                </Label>
              </div>
            </RadioGroup>
          </div>
        </fieldset>
      </div>
    </div>
  );
}

function InputVariationsSection() {
  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-xl font-display mb-2">Input Variations</h2>
        <p className="text-sm text-muted-foreground">Different input states, addons, and configurations</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Basic Input */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-medium">Basic Input</h3>
          <div>
            <Label htmlFor="email-basic">Email</Label>
            <div className="mt-2">
              <Input
                id="email-basic"
                name="email"
                type="email"
                placeholder="you@example.com"
              />
            </div>
          </div>
        </div>

        {/* Input with Help Text */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-medium">With Help Text</h3>
          <div>
            <Label htmlFor="email-help">Email</Label>
            <div className="mt-2">
              <Input
                id="email-help"
                name="email"
                type="email"
                placeholder="you@example.com"
                aria-describedby="email-description"
              />
            </div>
            <p id="email-description" className="mt-2 text-sm text-muted-foreground">
              We'll only use this for spam.
            </p>
          </div>
        </div>

        {/* Input with Error */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-medium">Error State</h3>
          <div>
            <Label htmlFor="email-error">Email</Label>
            <div className="mt-2 relative">
              <Input
                defaultValue="adamwathan"
                id="email-error"
                name="email"
                type="email"
                placeholder="you@example.com"
                aria-invalid="true"
                aria-describedby="email-error-msg"
                className="border-destructive text-destructive-foreground placeholder:text-destructive-300 focus-visible:ring-destructive pr-10"
              />
              <AlertCircle
                className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive"
              />
            </div>
            <p id="email-error-msg" className="mt-2 text-sm text-destructive">
              Not a valid email address.
            </p>
          </div>
        </div>

        {/* Disabled Input */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-medium">Disabled State</h3>
          <div>
            <Label htmlFor="email-disabled">Email</Label>
            <div className="mt-2">
              <Input
                defaultValue="you@example.com"
                id="email-disabled"
                name="email"
                type="email"
                disabled
                placeholder="you@example.com"
              />
            </div>
          </div>
        </div>

        {/* Input without Label */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-medium">Without Visible Label</h3>
          <div>
            <Input
              id="email-no-label"
              name="email"
              type="email"
              placeholder="you@example.com"
              aria-label="Email"
            />
          </div>
        </div>

        {/* Optional Field */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-medium">Optional Field</h3>
          <div>
            <div className="flex justify-between">
              <Label htmlFor="email-optional">Email</Label>
              <span className="text-sm text-muted-foreground">Optional</span>
            </div>
            <div className="mt-2">
              <Input
                id="email-optional"
                name="email"
                type="email"
                placeholder="you@example.com"
              />
            </div>
          </div>
        </div>

        {/* Input with Leading Icon */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-medium">Leading Icon</h3>
          <div>
            <Label htmlFor="email-icon">Email</Label>
            <div className="mt-2 relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email-icon"
                name="email"
                type="email"
                placeholder="you@example.com"
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Input with Trailing Icon */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-medium">Trailing Icon</h3>
          <div>
            <Label htmlFor="account-number">Account number</Label>
            <div className="mt-2 relative">
              <Input
                id="account-number"
                name="account-number"
                type="text"
                placeholder="000-00-0000"
                className="pr-10"
              />
              <HelpCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Input with Inline Leading Addon */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-medium">Inline Leading Addon</h3>
          <div>
            <Label htmlFor="website">Company website</Label>
            <div className="mt-2">
              <div className="flex items-center rounded-lg border border-input bg-background pl-3 focus-within:ring-2 focus-within:ring-primary">
                <div className="shrink-0 text-base text-muted-foreground select-none sm:text-sm">https://</div>
                <Input
                  id="website"
                  name="website"
                  type="text"
                  placeholder="www.example.com"
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Input with Inline Leading & Trailing Addons */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-medium">Leading & Trailing Addons</h3>
          <div>
            <Label htmlFor="price">Price</Label>
            <div className="mt-2">
              <div className="flex items-center rounded-lg border border-input bg-background px-3 focus-within:ring-2 focus-within:ring-primary">
                <div className="shrink-0 text-base text-muted-foreground select-none sm:text-sm">$</div>
                <Input
                  id="price"
                  name="price"
                  type="text"
                  placeholder="0.00"
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <div className="shrink-0 text-base text-muted-foreground select-none sm:text-sm">USD</div>
              </div>
            </div>
          </div>
        </div>

        {/* Input with Select Addon */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-medium">With Trailing Select</h3>
          <div>
            <Label htmlFor="price-select">Price</Label>
            <div className="mt-2">
              <div className="flex items-center rounded-lg border border-input bg-background pl-3 focus-within:ring-2 focus-within:ring-primary">
                <div className="shrink-0 text-base text-muted-foreground select-none sm:text-sm">$</div>
                <Input
                  id="price-select"
                  name="price"
                  type="text"
                  placeholder="0.00"
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 rounded-r-none"
                />
                <Select defaultValue="usd">
                  <SelectTrigger className="w-24 border-0 border-l focus:ring-0 focus:ring-offset-0 rounded-l-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">USD</SelectItem>
                    <SelectItem value="cad">CAD</SelectItem>
                    <SelectItem value="eur">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Rounded Pill Input */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-medium">Rounded Pill</h3>
          <div>
            <Label htmlFor="name-pill" className="ml-px pl-4">Name</Label>
            <div className="mt-2">
              <Input
                id="name-pill"
                name="name"
                type="text"
                placeholder="Jane Smith"
                className="rounded-full px-4"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stacked Inputs */}
      <div className="space-y-4 mt-8">
        <h3 className="text-lg font-display">Stacked Inputs</h3>
        
        <div className="rounded-lg border border-border bg-card p-6 space-y-6">
          <div>
            <h4 className="text-sm font-medium mb-4">Card Details (Stacked)</h4>
            <fieldset>
              <legend className="sr-only">Card details</legend>
              <div className="-space-y-px rounded-lg">
                <div className="rounded-t-lg border border-input bg-background px-3 pt-2.5 pb-1.5 focus-within:relative focus-within:z-10 focus-within:ring-2 focus-within:ring-primary">
                  <Label htmlFor="card-number" className="block text-xs">
                    Card number
                  </Label>
                  <input
                    id="card-number"
                    name="card-number"
                    type="text"
                    placeholder="Card number"
                    className="block w-full border-0 p-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 sm:text-sm"
                  />
                </div>
                <div className="grid grid-cols-2">
                  <div className="rounded-bl-lg border border-input bg-background px-3 pt-2.5 pb-1.5 focus-within:relative focus-within:z-10 focus-within:ring-2 focus-within:ring-primary">
                    <Label htmlFor="expiry" className="block text-xs">
                      Expiration date
                    </Label>
                    <input
                      id="expiry"
                      name="expiry"
                      type="text"
                      placeholder="MM / YY"
                      className="block w-full border-0 p-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 sm:text-sm"
                    />
                  </div>
                  <div className="rounded-br-lg border border-input bg-background px-3 pt-2.5 pb-1.5 focus-within:relative focus-within:z-10 focus-within:ring-2 focus-within:ring-primary">
                    <Label htmlFor="cvc" className="block text-xs">
                      CVC
                    </Label>
                    <input
                      id="cvc"
                      name="cvc"
                      type="text"
                      placeholder="CVC"
                      className="block w-full border-0 p-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </fieldset>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-4">Floating Label</h4>
            <div className="relative">
              <Label
                htmlFor="name-float"
                className="absolute -top-2 left-2 inline-block bg-card px-1 text-xs font-medium"
              >
                Name
              </Label>
              <Input
                id="name-float"
                name="name"
                type="text"
                placeholder="Jane Smith"
              />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-4">Underline Style</h4>
            <div>
              <Label htmlFor="name-underline">Name</Label>
              <div className="relative mt-2">
                <input
                  id="name-underline"
                  name="name"
                  type="text"
                  placeholder="Jane Smith"
                  className="peer block w-full border-0 border-b border-border bg-muted/50 px-3 py-1.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-0 sm:text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-4">With Keyboard Shortcut</h4>
            <div>
              <Label htmlFor="search-kbd">Quick search</Label>
              <div className="mt-2">
                <div className="flex items-center rounded-lg border border-input bg-background focus-within:ring-2 focus-within:ring-primary">
                  <Input
                    id="search-kbd"
                    name="search"
                    type="text"
                    placeholder="Search..."
                    className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <div className="flex py-1.5 pr-1.5">
                    <kbd className="inline-flex items-center rounded border border-border bg-muted px-1 font-mono text-xs text-muted-foreground">
                      ⌘K
                    </kbd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Error state: <code className="bg-background px-1 py-0.5 rounded">border-destructive text-destructive</code></li>
          <li>• Disabled: built-in Input component styles</li>
          <li>• Icons: absolute positioning with Lucide icons</li>
          <li>• Stacked inputs: <code className="bg-background px-1 py-0.5 rounded">-space-y-px</code> for connected borders</li>
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
        <p className="text-sm text-muted-foreground">Complete token reference for form layouts</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-border p-4 space-y-2">
          <h3 className="text-sm font-medium">Layout Patterns</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Simple stacked: vertical sections</li>
            <li>• Two-column: description + fields</li>
            <li>• Card-style: elevated containers</li>
            <li>• Label-on-left: horizontal layout</li>
          </ul>
        </div>

        <div className="rounded-lg border border-border p-4 space-y-2">
          <h3 className="text-sm font-medium">Components</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Input with prefix integration</li>
            <li>• Textarea for long-form text</li>
            <li>• Select dropdown with tokens</li>
            <li>• Checkbox and RadioGroup</li>
          </ul>
        </div>

        <div className="rounded-lg border border-border p-4 space-y-2">
          <h3 className="text-sm font-medium">Spacing & Dividers</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Section spacing with pb-12</li>
            <li>• Border dividers: <code className="bg-muted px-1 py-0.5 rounded">border-border</code></li>
            <li>• Card shadows and elevation</li>
          </ul>
        </div>
      </div>
    </section>
  );
}