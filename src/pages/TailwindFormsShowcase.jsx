import React from 'react';
import { PageHeader } from '@/components/sturij/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Image, UserCircle, ChevronDown, Mail, HelpCircle, AlertCircle, Check, ChevronsUpDown } from 'lucide-react';

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
      <SelectVariationsSection />
      <SignInFormsSection />

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

function SelectVariationsSection() {
  const [selectedPerson, setSelectedPerson] = React.useState('tom');
  const [selectedStatus, setSelectedStatus] = React.useState('wade');
  const [publishStatus, setPublishStatus] = React.useState('published');

  const people = [
    { value: 'wade', name: 'Wade Cooper' },
    { value: 'arlene', name: 'Arlene Mccoy' },
    { value: 'devon', name: 'Devon Webb' },
    { value: 'tom', name: 'Tom Cook' },
    { value: 'tanya', name: 'Tanya Fox' },
  ];

  const peopleWithStatus = [
    { value: 'wade', name: 'Wade Cooper', online: true },
    { value: 'arlene', name: 'Arlene Mccoy', online: false },
    { value: 'devon', name: 'Devon Webb', online: false },
    { value: 'tom', name: 'Tom Cook', online: true },
    { value: 'tanya', name: 'Tanya Fox', online: false },
  ];

  const peopleWithAvatars = [
    { value: 'wade', name: 'Wade Cooper', avatar: 'https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?w=256&h=256&fit=crop' },
    { value: 'arlene', name: 'Arlene Mccoy', avatar: 'https://images.unsplash.com/photo-1550525811-e5869dd03032?w=256&h=256&fit=crop' },
    { value: 'devon', name: 'Devon Webb', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&h=256&fit=crop' },
    { value: 'tom', name: 'Tom Cook', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=256&h=256&fit=crop' },
  ];

  const publishingOptions = [
    { value: 'published', title: 'Published', description: 'This job posting can be viewed by anyone who has the link.' },
    { value: 'draft', title: 'Draft', description: 'This job posting will no longer be publicly accessible.' },
  ];

  const currentPerson = people.find(p => p.value === selectedPerson);
  const currentStatus = peopleWithStatus.find(p => p.value === selectedStatus);
  const currentPublish = publishingOptions.find(o => o.value === publishStatus);

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-xl font-display mb-2">Select & Dropdown Variations</h2>
        <p className="text-sm text-muted-foreground">Different select dropdown configurations and styles</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Native Select */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-medium">Native Select</h3>
          <div>
            <Label htmlFor="location">Location</Label>
            <div className="mt-2">
              <Select defaultValue="canada">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us">United States</SelectItem>
                  <SelectItem value="canada">Canada</SelectItem>
                  <SelectItem value="mexico">Mexico</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Custom Select (Listbox) */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-medium">Custom Select</h3>
          <div>
            <Label htmlFor="assigned">Assigned to</Label>
            <div className="mt-2">
              <Select value={selectedPerson} onValueChange={setSelectedPerson}>
                <SelectTrigger>
                  <SelectValue>{currentPerson?.name}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {people.map((person) => (
                    <SelectItem key={person.value} value={person.value}>
                      {person.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Select with Check on Left */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-medium">With Leading Check</h3>
          <div>
            <Label>Assigned to</Label>
            <div className="mt-2">
              <Select value={selectedPerson} onValueChange={setSelectedPerson}>
                <SelectTrigger>
                  <SelectValue>{currentPerson?.name}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {people.map((person) => (
                    <SelectItem key={person.value} value={person.value}>
                      <div className="flex items-center">
                        {selectedPerson === person.value && <Check className="mr-2 h-4 w-4" />}
                        <span className={selectedPerson === person.value ? 'font-semibold' : ''}>{person.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Select with Status Indicator */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-medium">With Status Indicator</h3>
          <div>
            <Label>Assigned to</Label>
            <div className="mt-2">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue>
                    {currentStatus && (
                      <div className="flex items-center gap-2">
                        <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${currentStatus.online ? 'bg-primary' : 'bg-charcoal-200'}`} />
                        <span>{currentStatus.name}</span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {peopleWithStatus.map((person) => (
                    <SelectItem key={person.value} value={person.value}>
                      <div className="flex items-center gap-2">
                        <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${person.online ? 'bg-primary' : 'bg-charcoal-200'}`} />
                        <span>{person.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Select with Avatars */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-medium">With Avatars</h3>
          <div>
            <Label>Assigned to</Label>
            <div className="mt-2">
              <Select value={selectedPerson} onValueChange={setSelectedPerson}>
                <SelectTrigger>
                  <SelectValue>
                    {currentPerson && peopleWithAvatars.find(p => p.value === currentPerson.value) && (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={peopleWithAvatars.find(p => p.value === currentPerson.value).avatar} />
                          <AvatarFallback className="text-xs">{currentPerson.name[0]}</AvatarFallback>
                        </Avatar>
                        <span>{currentPerson.name}</span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {peopleWithAvatars.map((person) => (
                    <SelectItem key={person.value} value={person.value}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={person.avatar} />
                          <AvatarFallback className="text-xs">{person.name[0]}</AvatarFallback>
                        </Avatar>
                        <span>{person.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Split Button Select */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-medium">Split Button</h3>
          <div>
            <Label className="sr-only">Change published status</Label>
            <div className="inline-flex divide-x divide-primary-700 rounded-lg overflow-hidden">
              <div className="inline-flex items-center gap-x-1.5 bg-primary px-3 py-2 text-primary-foreground">
                <Check className="h-5 w-5" />
                <p className="text-sm font-semibold">{currentPublish?.title}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="default" size="sm" className="rounded-l-none border-l border-primary-700 px-2">
                    <span className="sr-only">Change published status</span>
                    <ChevronDown className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  {publishingOptions.map((option) => (
                    <DropdownMenuItem 
                      key={option.value} 
                      onClick={() => setPublishStatus(option.value)}
                      className="flex-col items-start p-4"
                    >
                      <div className="flex w-full justify-between">
                        <p className={publishStatus === option.value ? 'font-semibold' : ''}>{option.title}</p>
                        {publishStatus === option.value && <Check className="h-5 w-5 text-primary" />}
                      </div>
                      <p className="mt-2 text-muted-foreground text-xs">{option.description}</p>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Native select replaced with Radix UI Select component</li>
          <li>• Status indicators: <code className="bg-background px-1 py-0.5 rounded">bg-primary</code> for online</li>
          <li>• Avatar component for user images</li>
          <li>• Split button uses DropdownMenu + Button combination</li>
        </ul>
      </div>
    </section>
  );
}

function SignInFormsSection() {
  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-xl font-display mb-2">Sign-In Form Layouts</h2>
        <p className="text-sm text-muted-foreground">Various authentication form patterns</p>
      </div>

      <div className="space-y-8">
        {/* Simple Centered Sign-In */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-medium">Simple Centered</h3>
          <div className="flex min-h-[500px] flex-col justify-center px-6 py-12 lg:px-8 bg-background rounded-lg">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
              <div className="mx-auto h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-xl font-bold text-primary-foreground">S</span>
              </div>
              <h2 className="mt-10 text-center text-2xl font-display">
                Sign in to your account
              </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
              <form className="space-y-6">
                <div>
                  <Label htmlFor="email-simple">Email address</Label>
                  <div className="mt-2">
                    <Input id="email-simple" name="email" type="email" required autoComplete="email" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password-simple">Password</Label>
                    <div className="text-sm">
                      <a href="#" className="font-semibold text-primary hover:text-primary/80">
                        Forgot password?
                      </a>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Input id="password-simple" name="password" type="password" required autoComplete="current-password" />
                  </div>
                </div>

                <div>
                  <Button type="submit" className="w-full">
                    Sign in
                  </Button>
                </div>
              </form>

              <p className="mt-10 text-center text-sm text-muted-foreground">
                Not a member?{' '}
                <a href="#" className="font-semibold text-primary hover:text-primary/80">
                  Start a 14 day free trial
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Stacked Inputs */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-medium">Stacked Inputs</h3>
          <div className="flex min-h-[500px] items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-background rounded-lg">
            <div className="w-full max-w-sm space-y-10">
              <div>
                <div className="mx-auto h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-xl font-bold text-primary-foreground">S</span>
                </div>
                <h2 className="mt-10 text-center text-2xl font-display">
                  Sign in to your account
                </h2>
              </div>
              <form className="space-y-6">
                <div className="-space-y-px rounded-lg">
                  <div className="rounded-t-lg border border-input bg-background px-3 pt-2.5 pb-1.5 focus-within:relative focus-within:z-10 focus-within:ring-2 focus-within:ring-primary">
                    <Label htmlFor="email-stacked" className="block text-xs">
                      Email address
                    </Label>
                    <input
                      id="email-stacked"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      className="block w-full border-0 p-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 sm:text-sm"
                    />
                  </div>
                  <div className="rounded-b-lg border border-input bg-background px-3 pt-2.5 pb-1.5 focus-within:relative focus-within:z-10 focus-within:ring-2 focus-within:ring-primary">
                    <Label htmlFor="password-stacked" className="block text-xs">
                      Password
                    </Label>
                    <input
                      id="password-stacked"
                      name="password"
                      type="password"
                      required
                      autoComplete="current-password"
                      className="block w-full border-0 p-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox id="remember-stacked" />
                    <Label htmlFor="remember-stacked" className="text-sm">
                      Remember me
                    </Label>
                  </div>
                  <div className="text-sm">
                    <a href="#" className="font-semibold text-primary hover:text-primary/80">
                      Forgot password?
                    </a>
                  </div>
                </div>

                <div>
                  <Button type="submit" className="w-full">
                    Sign in
                  </Button>
                </div>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                Not a member?{' '}
                <a href="#" className="font-semibold text-primary hover:text-primary/80">
                  Start a 14-day free trial
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Card Style with Social Login */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-medium">Card with Social Login</h3>
          <div className="flex min-h-[500px] flex-col justify-center py-12 sm:px-6 lg:px-8 bg-muted/30 rounded-lg">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
              <div className="mx-auto h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-xl font-bold text-primary-foreground">S</span>
              </div>
              <h2 className="mt-6 text-center text-2xl font-display">
                Sign in to your account
              </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
              <div className="bg-card px-6 py-12 shadow-sm rounded-lg sm:px-12">
                <form className="space-y-6">
                  <div>
                    <Label htmlFor="email-card">Email address</Label>
                    <div className="mt-2">
                      <Input id="email-card" name="email" type="email" required autoComplete="email" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="password-card">Password</Label>
                    <div className="mt-2">
                      <Input id="password-card" name="password" type="password" required autoComplete="current-password" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox id="remember-card" />
                      <Label htmlFor="remember-card" className="text-sm">
                        Remember me
                      </Label>
                    </div>
                    <div className="text-sm">
                      <a href="#" className="font-semibold text-primary hover:text-primary/80">
                        Forgot password?
                      </a>
                    </div>
                  </div>

                  <div>
                    <Button type="submit" className="w-full">
                      Sign in
                    </Button>
                  </div>
                </form>

                <div>
                  <div className="mt-10 flex items-center gap-x-6">
                    <div className="w-full flex-1 border-t border-border" />
                    <p className="text-sm font-medium text-nowrap">Or continue with</p>
                    <div className="w-full flex-1 border-t border-border" />
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <Button variant="outline" className="w-full">
                      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 mr-2">
                        <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335" />
                        <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4" />
                        <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05" />
                        <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853" />
                      </svg>
                      Google
                    </Button>

                    <Button variant="outline" className="w-full">
                      <svg fill="currentColor" viewBox="0 0 20 20" aria-hidden="true" className="h-5 w-5 mr-2 fill-[#24292F]">
                        <path d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" fillRule="evenodd" />
                      </svg>
                      GitHub
                    </Button>
                  </div>
                </div>
              </div>

              <p className="mt-10 text-center text-sm text-muted-foreground">
                Not a member?{' '}
                <a href="#" className="font-semibold text-primary hover:text-primary/80">
                  Start a 14 day free trial
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Split Layout with Image */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-medium">Split Layout with Image</h3>
          <p className="text-xs text-muted-foreground mb-4">Note: Image placeholder shown on right on lg+ screens</p>
          <div className="flex min-h-[500px] rounded-lg overflow-hidden bg-background">
            <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
              <div className="mx-auto w-full max-w-sm lg:w-96">
                <div>
                  <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                    <span className="text-xl font-bold text-primary-foreground">S</span>
                  </div>
                  <h2 className="mt-8 text-2xl font-display">Sign in to your account</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Not a member?{' '}
                    <a href="#" className="font-semibold text-primary hover:text-primary/80">
                      Start a 14 day free trial
                    </a>
                  </p>
                </div>

                <div className="mt-10">
                  <form className="space-y-6">
                    <div>
                      <Label htmlFor="email-split">Email address</Label>
                      <div className="mt-2">
                        <Input id="email-split" name="email" type="email" required autoComplete="email" />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="password-split">Password</Label>
                      <div className="mt-2">
                        <Input id="password-split" name="password" type="password" required autoComplete="current-password" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox id="remember-split" />
                        <Label htmlFor="remember-split" className="text-sm">
                          Remember me
                        </Label>
                      </div>
                      <div className="text-sm">
                        <a href="#" className="font-semibold text-primary hover:text-primary/80">
                          Forgot password?
                        </a>
                      </div>
                    </div>

                    <div>
                      <Button type="submit" className="w-full">
                        Sign in
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            <div className="relative hidden w-0 flex-1 lg:block bg-muted">
              <div className="absolute inset-0 flex items-center justify-center">
                <Image className="h-24 w-24 text-muted-foreground/20" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Centered layouts with max-width constraints</li>
          <li>• Stacked inputs with <code className="bg-background px-1 py-0.5 rounded">-space-y-px</code> for connected borders</li>
          <li>• Card style with shadow and social login buttons</li>
          <li>• Split layout: form on left, image on right (lg:flex-none lg:px-20)</li>
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