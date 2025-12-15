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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Image, UserCircle, ChevronDown, Mail, HelpCircle, AlertCircle, Check, ChevronsUpDown, Paperclip, Smile, Tag, Calendar, Code, Link, AtSign, X, AlertTriangle, XCircle, CheckCircle, Info, Plus, FolderPlus, Database, BarChart3, Users, ChevronRight, Megaphone, Terminal } from 'lucide-react';

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
      <TextareaVariationsSection />
      <RadioGroupVariationsSection />
      <CheckboxVariationsSection />
      <ToggleSwitchVariationsSection />
      <PaymentMethodSection />
      <ComboboxVariationsSection />
      <AlertsSection />
      <EmptyStatesSection />

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

function TextareaVariationsSection() {
  const [mood, setMood] = React.useState('happy');
  const [assignee, setAssignee] = React.useState('unassigned');
  const [label, setLabel] = React.useState('unlabelled');
  const [dueDate, setDueDate] = React.useState('none');

  const moods = [
    { value: 'excited', label: 'Excited', icon: '🔥', color: 'bg-destructive-500' },
    { value: 'happy', label: 'Happy', icon: '😊', color: 'bg-primary-500' },
    { value: 'sad', label: 'Sad', icon: '😢', color: 'bg-secondary-500' },
  ];

  const assignees = [
    { value: 'unassigned', label: 'Unassigned' },
    { value: 'wade', label: 'Wade Cooper', avatar: 'https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?w=256&h=256&fit=crop' },
    { value: 'arlene', label: 'Arlene Mccoy', avatar: 'https://images.unsplash.com/photo-1550525811-e5869dd03032?w=256&h=256&fit=crop' },
  ];

  const currentMood = moods.find(m => m.value === mood);
  const currentAssignee = assignees.find(a => a.value === assignee);

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-xl font-display mb-2">Textarea & Comment Forms</h2>
        <p className="text-sm text-muted-foreground">Rich text areas with toolbars and metadata</p>
      </div>

      <div className="space-y-8">
        {/* Simple Textarea */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-medium">Simple Textarea</h3>
          <div>
            <Label htmlFor="comment-simple">Add your comment</Label>
            <div className="mt-2">
              <Textarea id="comment-simple" rows={4} placeholder="Write your comment..." />
            </div>
          </div>
        </div>

        {/* Comment with Avatar and Toolbar */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-medium">Comment with Avatar and Toolbar</h3>
          <div className="flex items-start gap-4">
            <Avatar>
              <AvatarImage src="https://images.unsplash.com/photo-1550525811-e5869dd03032?w=256&h=256&fit=crop" />
              <AvatarFallback>AM</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <form className="relative">
                <div className="rounded-lg border border-input bg-background focus-within:ring-2 focus-within:ring-ring">
                  <Label htmlFor="comment-toolbar" className="sr-only">Add your comment</Label>
                  <Textarea 
                    id="comment-toolbar" 
                    rows={3} 
                    placeholder="Add your comment..." 
                    className="resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <div aria-hidden="true" className="py-2">
                    <div className="h-9" />
                  </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 flex justify-between py-2 px-3">
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="ghost" size="icon" className="h-10 w-10">
                      <Paperclip className="h-5 w-5" />
                      <span className="sr-only">Attach file</span>
                    </Button>
                    <Select value={mood} onValueChange={setMood}>
                      <SelectTrigger className="w-auto border-0 gap-2">
                        <SelectValue>
                          {currentMood && (
                            <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${currentMood.color}`}>
                              <span className="text-lg">{currentMood.icon}</span>
                            </span>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {moods.map((m) => (
                          <SelectItem key={m.value} value={m.value}>
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${m.color}`}>
                                <span className="text-lg">{m.icon}</span>
                              </span>
                              <span>{m.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit">Post</Button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Underline Focus Style */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-medium">Underline Focus Style</h3>
          <div className="flex items-start gap-4">
            <Avatar>
              <AvatarImage src="https://images.unsplash.com/photo-1550525811-e5869dd03032?w=256&h=256&fit=crop" />
              <AvatarFallback>AM</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <form>
                <div className="border-b border-border pb-px focus-within:border-b-2 focus-within:border-primary focus-within:pb-0">
                  <Label htmlFor="comment-underline" className="sr-only">Add your comment</Label>
                  <Textarea 
                    id="comment-underline" 
                    rows={3} 
                    placeholder="Add your comment..." 
                    className="resize-none border-0 focus-visible:ring-0"
                  />
                </div>
                <div className="flex justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="ghost" size="icon">
                      <Paperclip className="h-5 w-5" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon">
                      <Smile className="h-5 w-5" />
                    </Button>
                  </div>
                  <Button type="submit">Post</Button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Issue Form with Metadata */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-medium">Issue Form with Metadata</h3>
          <form className="relative">
            <div className="rounded-lg border border-input bg-background focus-within:ring-2 focus-within:ring-ring">
              <Label htmlFor="title" className="sr-only">Title</Label>
              <Input 
                id="title" 
                placeholder="Title" 
                className="border-0 text-lg font-medium focus-visible:ring-0"
              />
              <Label htmlFor="description" className="sr-only">Description</Label>
              <Textarea 
                id="description" 
                rows={2} 
                placeholder="Write a description..." 
                className="resize-none border-0 focus-visible:ring-0"
              />
              <div aria-hidden="true">
                <div className="py-2"><div className="h-9" /></div>
                <div className="h-px" />
                <div className="py-2"><div className="h-9" /></div>
              </div>
            </div>
            <div className="absolute inset-x-px bottom-0">
              <div className="flex flex-wrap justify-end gap-2 px-2 py-2 sm:px-3">
                <Select value={assignee} onValueChange={setAssignee}>
                  <SelectTrigger className="w-auto gap-2 rounded-full bg-muted hover:bg-muted/80">
                    <SelectValue>
                      {currentAssignee && (
                        <div className="flex items-center gap-2">
                          {currentAssignee.avatar ? (
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={currentAssignee.avatar} />
                            </Avatar>
                          ) : (
                            <UserCircle className="h-5 w-5 text-muted-foreground" />
                          )}
                          <span className="hidden sm:inline">{currentAssignee.label}</span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {assignees.map((a) => (
                      <SelectItem key={a.value} value={a.value}>
                        <div className="flex items-center gap-2">
                          {a.avatar ? (
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={a.avatar} />
                            </Avatar>
                          ) : (
                            <UserCircle className="h-5 w-5" />
                          )}
                          <span>{a.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="secondary" size="sm" type="button" className="rounded-full gap-2">
                  <Tag className="h-4 w-4" />
                  <span className="hidden sm:inline">Label</span>
                </Button>
                <Button variant="secondary" size="sm" type="button" className="rounded-full gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline">Due date</span>
                </Button>
              </div>
              <div className="flex items-center justify-between border-t border-border px-2 py-2 sm:px-3">
                <Button type="button" variant="ghost" className="gap-2 text-muted-foreground">
                  <Paperclip className="h-5 w-5" />
                  <span className="italic text-sm">Attach a file</span>
                </Button>
                <Button type="submit">Create</Button>
              </div>
            </div>
          </form>
        </div>

        {/* Markdown Editor with Tabs */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-medium">Markdown Editor with Preview</h3>
          <form>
            <Tabs defaultValue="write">
              <div className="group flex items-center">
                <TabsList>
                  <TabsTrigger value="write">Write</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                <div className="ml-auto hidden items-center gap-2 group-has-[[value=write][data-state=active]]:flex">
                  <Button type="button" variant="ghost" size="icon">
                    <Link className="h-5 w-5" />
                    <span className="sr-only">Insert link</span>
                  </Button>
                  <Button type="button" variant="ghost" size="icon">
                    <Code className="h-5 w-5" />
                    <span className="sr-only">Insert code</span>
                  </Button>
                  <Button type="button" variant="ghost" size="icon">
                    <AtSign className="h-5 w-5" />
                    <span className="sr-only">Mention someone</span>
                  </Button>
                </div>
              </div>
              <TabsContent value="write" className="mt-2">
                <Label htmlFor="markdown-write" className="sr-only">Comment</Label>
                <Textarea 
                  id="markdown-write" 
                  rows={5} 
                  placeholder="Add your comment..." 
                />
              </TabsContent>
              <TabsContent value="preview" className="mt-2">
                <div className="border rounded-lg p-3 min-h-[120px] text-sm text-muted-foreground">
                  Preview content will render here.
                </div>
              </TabsContent>
            </Tabs>
            <div className="mt-2 flex justify-end">
              <Button type="submit">Post</Button>
            </div>
          </form>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Comment forms with avatar and toolbar components</li>
          <li>• Underline focus: <code className="bg-background px-1 py-0.5 rounded">border-b-2 border-primary</code></li>
          <li>• Issue form with metadata selectors (assignee, labels, due dates)</li>
          <li>• Markdown editor with tabs and toolbar actions</li>
        </ul>
      </div>
    </section>
  );
}

function RadioGroupVariationsSection() {
  const [notification, setNotification] = React.useState('email');
  const [plan, setPlan] = React.useState('small');
  const [account, setAccount] = React.useState('checking');
  const [side, setSide] = React.useState('none');
  const [pricing, setPricing] = React.useState('startup');
  const [privacy, setPrivacy] = React.useState('public');
  const [color, setColor] = React.useState('pink');
  const [mailingList, setMailingList] = React.useState('newsletter');
  const [memory, setMemory] = React.useState('16gb');
  const [serverPlan, setServerPlan] = React.useState('hobby');

  const notificationMethods = [
    { value: 'email', label: 'Email' },
    { value: 'sms', label: 'Phone (SMS)' },
    { value: 'push', label: 'Push notification' },
  ];

  const plans = [
    { value: 'small', label: 'Small', description: '4 GB RAM / 2 CPUS / 80 GB SSD Storage' },
    { value: 'medium', label: 'Medium', description: '8 GB RAM / 4 CPUS / 160 GB SSD Storage' },
    { value: 'large', label: 'Large', description: '16 GB RAM / 8 CPUS / 320 GB SSD Storage' },
  ];

  const accounts = [
    { value: 'checking', label: 'Checking', description: 'CIBC ••••6610' },
    { value: 'savings', label: 'Savings', description: 'Bank of America ••••0149' },
    { value: 'mastercard', label: 'Mastercard', description: 'Capital One ••••7877' },
  ];

  const pricingPlans = [
    { value: 'startup', label: 'Startup', priceMonthly: '$29', priceYearly: '$290', limit: 'Up to 5 active job postings' },
    { value: 'business', label: 'Business', priceMonthly: '$99', priceYearly: '$990', limit: 'Up to 25 active job postings' },
    { value: 'enterprise', label: 'Enterprise', priceMonthly: '$249', priceYearly: '$2490', limit: 'Unlimited active job postings' },
  ];

  const privacySettings = [
    { value: 'public', label: 'Public access', description: 'This project would be available to anyone who has the link' },
    { value: 'private-members', label: 'Private to project members', description: 'Only members of this project would be able to access' },
    { value: 'private-you', label: 'Private to you', description: 'You are the only one able to access this project' },
  ];

  const colors = [
    { value: 'pink', label: 'Pink', class: 'bg-pink-500' },
    { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
    { value: 'blue', label: 'Blue', class: 'bg-primary-500' },
    { value: 'green', label: 'Green', class: 'bg-primary-600' },
    { value: 'yellow', label: 'Yellow', class: 'bg-secondary-400' },
  ];

  const mailingLists = [
    { value: 'newsletter', label: 'Newsletter', description: 'Last message sent an hour ago', users: '621 users' },
    { value: 'existing', label: 'Existing customers', description: 'Last message sent 2 weeks ago', users: '1200 users' },
    { value: 'trial', label: 'Trial users', description: 'Last message sent 4 days ago', users: '2740 users' },
  ];

  const memoryOptions = [
    { value: '4gb', label: '4 GB', disabled: false },
    { value: '8gb', label: '8 GB', disabled: false },
    { value: '16gb', label: '16 GB', disabled: false },
    { value: '32gb', label: '32 GB', disabled: false },
    { value: '64gb', label: '64 GB', disabled: false },
    { value: '128gb', label: '128 GB', disabled: true },
  ];

  const serverPlans = [
    { value: 'hobby', label: 'Hobby', ram: '8GB', cpus: '4 CPUs', disk: '160 GB SSD disk', price: '$40' },
    { value: 'startup', label: 'Startup', ram: '12GB', cpus: '6 CPUs', disk: '256 GB SSD disk', price: '$80' },
    { value: 'business', label: 'Business', ram: '16GB', cpus: '8 CPUs', disk: '512 GB SSD disk', price: '$160' },
    { value: 'enterprise', label: 'Enterprise', ram: '32GB', cpus: '12 CPUs', disk: '1024 GB SSD disk', price: '$240' },
  ];

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-xl font-display mb-2">Radio Group Variations</h2>
        <p className="text-sm text-muted-foreground">Different radio button layouts and styles</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Stacked Vertical */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-medium">Stacked Vertical</h3>
          <RadioGroup value={notification} onValueChange={setNotification}>
            <Label className="text-sm font-semibold">Notifications</Label>
            <p className="mt-1 text-sm text-muted-foreground">How do you prefer to receive notifications?</p>
            <div className="mt-4 space-y-4">
              {notificationMethods.map((method) => (
                <div key={method.value} className="flex items-center gap-3">
                  <RadioGroupItem value={method.value} id={`notif-${method.value}`} />
                  <Label htmlFor={`notif-${method.value}`} className="text-sm">{method.label}</Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* Inline Horizontal */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-medium">Inline Horizontal</h3>
          <RadioGroup value={notification} onValueChange={setNotification}>
            <Label className="text-sm font-semibold">Notifications</Label>
            <p className="mt-1 text-sm text-muted-foreground">How do you prefer to receive notifications?</p>
            <div className="mt-4 flex flex-wrap gap-6">
              {notificationMethods.map((method) => (
                <div key={method.value} className="flex items-center gap-3">
                  <RadioGroupItem value={method.value} id={`inline-${method.value}`} />
                  <Label htmlFor={`inline-${method.value}`} className="text-sm">{method.label}</Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* With Descriptions */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-medium">With Descriptions</h3>
          <RadioGroup value={plan} onValueChange={setPlan}>
            <div className="space-y-4">
              {plans.map((p) => (
                <div key={p.value} className="flex items-start gap-3">
                  <RadioGroupItem value={p.value} id={`plan-${p.value}`} className="mt-1" />
                  <div className="grid gap-1">
                    <Label htmlFor={`plan-${p.value}`} className="font-medium">{p.label}</Label>
                    <p className="text-sm text-muted-foreground">{p.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* Label on Right */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-medium">Label on Right</h3>
          <RadioGroup value={account} onValueChange={setAccount}>
            <Label className="text-sm font-semibold">Transfer funds</Label>
            <p className="mt-1 text-sm text-muted-foreground">Transfer your balance to your bank account.</p>
            <div className="mt-4 divide-y divide-border">
              {accounts.map((acc) => (
                <div key={acc.value} className="flex items-start justify-between py-3">
                  <div className="flex-1">
                    <Label htmlFor={`acc-${acc.value}`} className="font-medium">{acc.label}</Label>
                    <p className="text-sm text-muted-foreground">{acc.description}</p>
                  </div>
                  <RadioGroupItem value={acc.value} id={`acc-${acc.value}`} className="ml-3" />
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* Card Layout */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4 lg:col-span-2">
          <h3 className="text-sm font-medium">Card Layout</h3>
          <RadioGroup value={privacy} onValueChange={setPrivacy}>
            <Label className="sr-only">Privacy setting</Label>
            <div className="grid gap-3">
              {privacySettings.map((setting) => (
                <Label
                  key={setting.value}
                  htmlFor={`privacy-${setting.value}`}
                  className="flex items-start gap-3 rounded-lg border-2 border-border p-4 cursor-pointer transition-colors hover:bg-accent data-[state=checked]:border-primary data-[state=checked]:bg-primary/5"
                  data-state={privacy === setting.value ? 'checked' : 'unchecked'}
                >
                  <RadioGroupItem value={setting.value} id={`privacy-${setting.value}`} className="mt-0.5" />
                  <div className="grid gap-1">
                    <span className="font-medium">{setting.label}</span>
                    <span className="text-sm text-muted-foreground">{setting.description}</span>
                  </div>
                </Label>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* Pricing Table */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4 lg:col-span-2">
          <h3 className="text-sm font-medium">Pricing Table</h3>
          <RadioGroup value={pricing} onValueChange={setPricing}>
            <Label className="sr-only">Pricing plans</Label>
            <div className="grid gap-0 rounded-lg border border-border overflow-hidden">
              {pricingPlans.map((p, idx) => (
                <Label
                  key={p.value}
                  htmlFor={`price-${p.value}`}
                  className="flex items-center gap-3 border-b border-border last:border-b-0 p-4 cursor-pointer transition-colors hover:bg-accent data-[state=checked]:bg-primary/5 md:grid md:grid-cols-3"
                  data-state={pricing === p.value ? 'checked' : 'unchecked'}
                >
                  <span className="flex items-center gap-3">
                    <RadioGroupItem value={p.value} id={`price-${p.value}`} />
                    <span className="font-medium">{p.label}</span>
                  </span>
                  <span className="ml-9 md:ml-0 md:text-center">
                    <span className="font-medium">{p.priceMonthly} / mo</span>{' '}
                    <span className="text-muted-foreground">({p.priceYearly} / yr)</span>
                  </span>
                  <span className="ml-9 text-sm text-muted-foreground md:ml-0 md:text-right">{p.limit}</span>
                </Label>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* Color Picker */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-medium">Color Picker</h3>
          <RadioGroup value={color} onValueChange={setColor}>
            <Label className="text-sm font-semibold">Choose a label color</Label>
            <div className="mt-4 flex items-center gap-3">
              {colors.map((c) => (
                <Label key={c.value} htmlFor={`color-${c.value}`} className="cursor-pointer">
                  <RadioGroupItem 
                    value={c.value} 
                    id={`color-${c.value}`}
                    className="sr-only"
                  />
                  <div className={`h-8 w-8 rounded-full ${c.class} ring-2 ring-offset-2 ${color === c.value ? 'ring-primary' : 'ring-transparent'} transition-all`} />
                  <span className="sr-only">{c.label}</span>
                </Label>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* Cards with Icons */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4 lg:col-span-2">
          <h3 className="text-sm font-medium">Cards with Check Icons</h3>
          <RadioGroup value={mailingList} onValueChange={setMailingList}>
            <Label className="text-sm font-semibold">Select a mailing list</Label>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {mailingLists.map((list) => (
                <Label
                  key={list.value}
                  htmlFor={`list-${list.value}`}
                  className="relative flex flex-col rounded-lg border-2 border-border p-4 cursor-pointer transition-colors hover:bg-accent data-[state=checked]:border-primary data-[state=checked]:bg-primary/5"
                  data-state={mailingList === list.value ? 'checked' : 'unchecked'}
                >
                  <RadioGroupItem value={list.value} id={`list-${list.value}`} className="sr-only" />
                  <div className="flex-1">
                    <span className="font-medium block">{list.label}</span>
                    <span className="text-sm text-muted-foreground block mt-1">{list.description}</span>
                    <span className="font-medium block mt-4">{list.users}</span>
                  </div>
                  {mailingList === list.value && (
                    <Check className="absolute top-4 right-4 h-5 w-5 text-primary" />
                  )}
                </Label>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* Small Buttons */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-medium">Small Button Style</h3>
          <RadioGroup value={memory} onValueChange={setMemory}>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">RAM</Label>
              <a href="#" className="text-sm text-primary hover:underline">
                See performance specs
              </a>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
              {memoryOptions.map((opt) => (
                <Label
                  key={opt.value}
                  htmlFor={`mem-${opt.value}`}
                  className="flex items-center justify-center rounded-md border-2 border-border p-3 cursor-pointer transition-colors hover:bg-accent data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[disabled=true]:opacity-50 data-[disabled=true]:cursor-not-allowed"
                  data-state={memory === opt.value ? 'checked' : 'unchecked'}
                  data-disabled={opt.disabled}
                >
                  <RadioGroupItem value={opt.value} id={`mem-${opt.value}`} disabled={opt.disabled} className="sr-only" />
                  <span className="text-sm font-medium uppercase">{opt.label}</span>
                </Label>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* Large Cards with Details */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4 lg:col-span-2">
          <h3 className="text-sm font-medium">Large Cards with Details</h3>
          <RadioGroup value={serverPlan} onValueChange={setServerPlan}>
            <Label className="sr-only">Server size</Label>
            <div className="space-y-4">
              {serverPlans.map((p) => (
                <Label
                  key={p.value}
                  htmlFor={`server-${p.value}`}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center rounded-lg border-2 border-border p-4 cursor-pointer transition-colors hover:bg-accent data-[state=checked]:border-primary data-[state=checked]:bg-primary/5"
                  data-state={serverPlan === p.value ? 'checked' : 'unchecked'}
                >
                  <RadioGroupItem value={p.value} id={`server-${p.value}`} className="sr-only" />
                  <span className="flex items-center gap-3">
                    <span className="flex flex-col">
                      <span className="font-medium">{p.label}</span>
                      <span className="text-sm text-muted-foreground">
                        {p.ram} / {p.cpus} • {p.disk}
                      </span>
                    </span>
                  </span>
                  <span className="mt-2 sm:mt-0 flex flex-col sm:text-right">
                    <span className="font-medium">{p.price}</span>
                    <span className="text-sm text-muted-foreground">/mo</span>
                  </span>
                </Label>
              ))}
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• RadioGroup and RadioGroupItem from Radix UI</li>
          <li>• Card layouts with <code className="bg-background px-1 py-0.5 rounded">border-2</code> and checked states</li>
          <li>• Color picker using ring utilities and transitions</li>
          <li>• Responsive grids with <code className="bg-background px-1 py-0.5 rounded">sm:grid-cols-3</code></li>
        </ul>
      </div>
    </section>
  );
}

function CheckboxVariationsSection() {
  const [notifications, setNotifications] = React.useState({
    comments: true,
    candidates: false,
    offers: false,
  });

  const [members, setMembers] = React.useState({
    annette: true,
    cody: true,
    courtney: false,
    kathryn: false,
    theresa: false,
  });

  const notificationOptions = [
    { value: 'comments', label: 'Comments', description: 'Get notified when someones posts a comment on a posting.' },
    { value: 'candidates', label: 'Candidates', description: 'Get notified when a candidate applies for a job.' },
    { value: 'offers', label: 'Offers', description: 'Get notified when a candidate accepts or rejects an offer.' },
  ];

  const membersList = [
    { value: 'annette', label: 'Annette Black' },
    { value: 'cody', label: 'Cody Fisher' },
    { value: 'courtney', label: 'Courtney Henry' },
    { value: 'kathryn', label: 'Kathryn Murphy' },
    { value: 'theresa', label: 'Theresa Webb' },
  ];

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-xl font-display mb-2">Checkbox Variations</h2>
        <p className="text-sm text-muted-foreground">Different checkbox layouts and styles</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Vertical with Descriptions */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-medium">Vertical with Descriptions</h3>
          <fieldset>
            <legend className="sr-only">Notifications</legend>
            <div className="space-y-5">
              {notificationOptions.map((option) => (
                <div key={option.value} className="flex gap-3">
                  <div className="flex h-6 shrink-0 items-center">
                    <Checkbox
                      id={`notif-${option.value}`}
                      checked={notifications[option.value]}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, [option.value]: checked })
                      }
                    />
                  </div>
                  <div className="text-sm">
                    <Label htmlFor={`notif-${option.value}`} className="font-medium">
                      {option.label}
                    </Label>
                    <p className="text-muted-foreground">{option.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </fieldset>
        </div>

        {/* Inline Description */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-medium">Inline Description</h3>
          <fieldset>
            <legend className="sr-only">Notifications</legend>
            <div className="space-y-5">
              <div className="flex gap-3">
                <div className="flex h-6 shrink-0 items-center">
                  <Checkbox
                    id="comments-inline"
                    checked={notifications.comments}
                    onCheckedChange={(checked) => 
                      setNotifications({ ...notifications, comments: checked })
                    }
                  />
                </div>
                <div className="text-sm">
                  <Label htmlFor="comments-inline" className="font-medium">
                    New comments{' '}
                  </Label>
                  <span className="text-muted-foreground">
                    so you always know what's happening.
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex h-6 shrink-0 items-center">
                  <Checkbox
                    id="candidates-inline"
                    checked={notifications.candidates}
                    onCheckedChange={(checked) => 
                      setNotifications({ ...notifications, candidates: checked })
                    }
                  />
                </div>
                <div className="text-sm">
                  <Label htmlFor="candidates-inline" className="font-medium">
                    New candidates{' '}
                  </Label>
                  <span className="text-muted-foreground">
                    who apply for any open postings.
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex h-6 shrink-0 items-center">
                  <Checkbox
                    id="offers-inline"
                    checked={notifications.offers}
                    onCheckedChange={(checked) => 
                      setNotifications({ ...notifications, offers: checked })
                    }
                  />
                </div>
                <div className="text-sm">
                  <Label htmlFor="offers-inline" className="font-medium">
                    Offers{' '}
                  </Label>
                  <span className="text-muted-foreground">
                    when they are accepted or rejected by candidates.
                  </span>
                </div>
              </div>
            </div>
          </fieldset>
        </div>

        {/* Label on Right */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4 lg:col-span-2">
          <h3 className="text-sm font-medium">Label on Right</h3>
          <fieldset>
            <legend className="text-base font-semibold">Members</legend>
            <div className="mt-4 divide-y divide-border border-t border-b border-border">
              {membersList.map((member) => (
                <div key={member.value} className="flex gap-3 py-4">
                  <div className="flex-1 text-sm">
                    <Label htmlFor={`member-${member.value}`} className="font-medium">
                      {member.label}
                    </Label>
                  </div>
                  <div className="flex h-6 shrink-0 items-center">
                    <Checkbox
                      id={`member-${member.value}`}
                      checked={members[member.value]}
                      onCheckedChange={(checked) => 
                        setMembers({ ...members, [member.value]: checked })
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </fieldset>
        </div>

        {/* With Dividers */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4 lg:col-span-2">
          <h3 className="text-sm font-medium">With Dividers</h3>
          <fieldset className="border-t border-b border-border">
            <legend className="sr-only">Notifications</legend>
            <div className="divide-y divide-border">
              {notificationOptions.map((option) => (
                <div key={option.value} className="flex gap-3 py-4">
                  <div className="flex-1 text-sm">
                    <Label htmlFor={`div-${option.value}`} className="font-medium">
                      {option.label}
                    </Label>
                    <p className="text-muted-foreground">{option.description}</p>
                  </div>
                  <div className="flex h-6 shrink-0 items-center">
                    <Checkbox
                      id={`div-${option.value}`}
                      checked={notifications[option.value]}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, [option.value]: checked })
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </fieldset>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Checkbox component from Radix UI with accessible markup</li>
          <li>• Dividers with <code className="bg-background px-1 py-0.5 rounded">divide-y divide-border</code></li>
          <li>• Label positioning: flex with gap-3 for spacing</li>
          <li>• Inline descriptions combine label + muted text</li>
        </ul>
      </div>
    </section>
  );
}

function ToggleSwitchVariationsSection() {
  const [enabled, setEnabled] = React.useState(false);
  const [available, setAvailable] = React.useState(true);
  const [annual, setAnnual] = React.useState(false);
  const [notifications, setNotifications] = React.useState(true);

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-xl font-display mb-2">Toggle Switch Variations</h2>
        <p className="text-sm text-muted-foreground">Toggle switches with different layouts and styles</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Basic Toggle */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-medium">Basic Toggle</h3>
          <div className="flex items-center gap-3">
            <Switch
              id="basic-toggle"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
            <Label htmlFor="basic-toggle" className="text-sm">
              Enable notifications
            </Label>
          </div>
        </div>

        {/* Toggle with Icons */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-medium">With Icons</h3>
          <div className="flex items-center gap-3">
            <div className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary" style={{ backgroundColor: enabled ? 'var(--primary)' : 'var(--muted)' }}>
              <span className={`relative inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0.5'}`}>
                <span className={`absolute inset-0 flex items-center justify-center transition-opacity ${enabled ? 'opacity-0' : 'opacity-100'}`}>
                  <X className="h-3 w-3 text-muted-foreground" />
                </span>
                <span className={`absolute inset-0 flex items-center justify-center transition-opacity ${enabled ? 'opacity-100' : 'opacity-0'}`}>
                  <Check className="h-3 w-3 text-primary" />
                </span>
              </span>
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="absolute inset-0 appearance-none cursor-pointer focus:outline-none"
                aria-label="Toggle with icons"
              />
            </div>
            <Label className="text-sm">Enable feature</Label>
          </div>
        </div>

        {/* Toggle with Description */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4 lg:col-span-2">
          <h3 className="text-sm font-medium">With Description</h3>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="available-toggle" className="font-medium">
                Available to hire
              </Label>
              <p className="text-sm text-muted-foreground">
                Nulla amet tempus sit accumsan. Aliquet turpis sed sit lacinia.
              </p>
            </div>
            <Switch
              id="available-toggle"
              checked={available}
              onCheckedChange={setAvailable}
            />
          </div>
        </div>

        {/* Small Toggle with Short Label */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-medium">Small with Short Label</h3>
          <div className="flex items-center justify-between gap-3">
            <Switch
              id="annual-toggle"
              checked={annual}
              onCheckedChange={setAnnual}
            />
            <div className="text-sm">
              <Label htmlFor="annual-toggle" className="font-medium">
                Annual billing
              </Label>{' '}
              <span className="text-muted-foreground">(Save 10%)</span>
            </div>
          </div>
        </div>

        {/* Toggle in List */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-medium">In List</h3>
          <div className="divide-y divide-border">
            <div className="flex items-center justify-between py-4">
              <div className="flex-1">
                <Label htmlFor="notifications-toggle" className="font-medium">
                  Push notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications on your device
                </p>
              </div>
              <Switch
                id="notifications-toggle"
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
            <div className="flex items-center justify-between py-4">
              <div className="flex-1">
                <Label htmlFor="email-toggle" className="font-medium">
                  Email updates
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get updates via email
                </p>
              </div>
              <Switch id="email-toggle" />
            </div>
            <div className="flex items-center justify-between py-4">
              <div className="flex-1">
                <Label htmlFor="sms-toggle" className="font-medium">
                  SMS alerts
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive text message alerts
                </p>
              </div>
              <Switch id="sms-toggle" />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Switch component from Radix UI with smooth transitions</li>
          <li>• Icons using <code className="bg-background px-1 py-0.5 rounded">opacity</code> and <code className="bg-background px-1 py-0.5 rounded">transform</code> transitions</li>
          <li>• Flexible layouts with <code className="bg-background px-1 py-0.5 rounded">justify-between</code> for alignment</li>
          <li>• List dividers using <code className="bg-background px-1 py-0.5 rounded">divide-y divide-border</code></li>
        </ul>
      </div>
    </section>
  );
}

function PaymentMethodSection() {
  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-xl font-display mb-2">Payment Method Card</h2>
        <p className="text-sm text-muted-foreground">Payment information display with card details</p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <h3 className="text-sm font-medium">Card Details Display</h3>
        <div className="bg-card shadow-sm rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-base font-display">Payment method</h3>
            <div className="mt-5">
              <div className="rounded-md bg-muted px-6 py-5 sm:flex sm:items-start sm:justify-between">
                <h4 className="sr-only">Visa</h4>
                <div className="sm:flex sm:items-start">
                  <svg viewBox="0 0 36 24" aria-hidden="true" className="h-8 w-auto sm:h-6 sm:shrink-0">
                    <rect rx={4} fill="#224DBA" width={36} height={24} />
                    <path
                      d="M10.925 15.673H8.874l-1.538-6c-.073-.276-.228-.52-.456-.635A6.575 6.575 0 005 8.403v-.231h3.304c.456 0 .798.347.855.75l.798 4.328 2.05-5.078h1.994l-3.076 7.5zm4.216 0h-1.937L14.8 8.172h1.937l-1.595 7.5zm4.101-5.422c.057-.404.399-.635.798-.635a3.54 3.54 0 011.88.346l.342-1.615A4.808 4.808 0 0020.496 8c-1.88 0-3.248 1.039-3.248 2.481 0 1.097.969 1.673 1.653 2.02.74.346 1.025.577.968.923 0 .519-.57.75-1.139.75a4.795 4.795 0 01-1.994-.462l-.342 1.616a5.48 5.48 0 002.108.404c2.108.057 3.418-.981 3.418-2.539 0-1.962-2.678-2.077-2.678-2.942zm9.457 5.422L27.16 8.172h-1.652a.858.858 0 00-.798.577l-2.848 6.924h1.994l.398-1.096h2.45l.228 1.096h1.766zm-2.905-5.482l.57 2.827h-1.596l1.026-2.827z"
                      fill="#fff"
                    />
                  </svg>
                  <div className="mt-3 sm:mt-0 sm:ml-4">
                    <div className="text-sm font-medium text-foreground">Ending with 4242</div>
                    <div className="mt-1 text-sm text-muted-foreground sm:flex sm:items-center">
                      <div>Expires 12/20</div>
                      <span aria-hidden="true" className="hidden sm:mx-2 sm:inline">
                        &middot;
                      </span>
                      <div className="mt-1 sm:mt-0">Last updated on 22 Aug 2017</div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-6 sm:shrink-0">
                  <Button type="button" variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Card container with <code className="bg-background px-1 py-0.5 rounded">bg-card shadow-sm</code></li>
          <li>• Muted background for nested content: <code className="bg-background px-1 py-0.5 rounded">bg-muted</code></li>
          <li>• Responsive flex layout with <code className="bg-background px-1 py-0.5 rounded">sm:flex sm:items-start sm:justify-between</code></li>
          <li>• Button component with outline variant for edit action</li>
        </ul>
      </div>
    </section>
  );
}

function ComboboxVariationsSection() {
  const [open, setOpen] = React.useState(false);
  const [openStatus, setOpenStatus] = React.useState(false);
  const [openAvatar, setOpenAvatar] = React.useState(false);
  const [openUsername, setOpenUsername] = React.useState(false);
  const [selectedPerson, setSelectedPerson] = React.useState(null);
  const [selectedStatusPerson, setSelectedStatusPerson] = React.useState(null);
  const [selectedAvatarPerson, setSelectedAvatarPerson] = React.useState(null);
  const [selectedUsernamePerson, setSelectedUsernamePerson] = React.useState(null);

  const people = [
    { id: 1, name: 'Leslie Alexander' },
    { id: 2, name: 'Michael Foster' },
    { id: 3, name: 'Dries Vincent' },
    { id: 4, name: 'Lindsay Walton' },
  ];

  const peopleWithStatus = [
    { id: 1, name: 'Leslie Alexander', online: true },
    { id: 2, name: 'Michael Foster', online: false },
    { id: 3, name: 'Dries Vincent', online: true },
    { id: 4, name: 'Lindsay Walton', online: false },
  ];

  const peopleWithAvatars = [
    { id: 1, name: 'Leslie Alexander', imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&h=256&fit=crop' },
    { id: 2, name: 'Michael Foster', imageUrl: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=256&h=256&fit=crop' },
    { id: 3, name: 'Dries Vincent', imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=256&h=256&fit=crop' },
  ];

  const peopleWithUsernames = [
    { name: 'Leslie Alexander', username: '@lesliealexander' },
    { name: 'Michael Foster', username: '@michaelfoster' },
    { name: 'Dries Vincent', username: '@driesvincent' },
  ];

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-xl font-display mb-2">Combobox / Autocomplete</h2>
        <p className="text-sm text-muted-foreground">Searchable select dropdowns with filtering</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Basic Combobox */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-medium">Basic Combobox</h3>
          <div>
            <Label>Assigned to</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {selectedPerson ? selectedPerson.name : "Select person..."}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search person..." />
                  <CommandList>
                    <CommandEmpty>No person found.</CommandEmpty>
                    <CommandGroup>
                      {people.map((person) => (
                        <CommandItem
                          key={person.id}
                          value={person.name}
                          onSelect={() => {
                            setSelectedPerson(person);
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${selectedPerson?.id === person.id ? "opacity-100" : "opacity-0"}`}
                          />
                          {person.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* With Status Indicators */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-medium">With Status Indicators</h3>
          <div>
            <Label>Assigned to</Label>
            <Popover open={openStatus} onOpenChange={setOpenStatus}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openStatus}
                  className="w-full justify-between"
                >
                  {selectedStatusPerson ? (
                    <div className="flex items-center gap-2">
                      <span className={`inline-block h-2 w-2 rounded-full ${selectedStatusPerson.online ? 'bg-primary' : 'bg-charcoal-200'}`} />
                      {selectedStatusPerson.name}
                    </div>
                  ) : "Select person..."}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search person..." />
                  <CommandList>
                    <CommandEmpty>No person found.</CommandEmpty>
                    <CommandGroup>
                      {peopleWithStatus.map((person) => (
                        <CommandItem
                          key={person.id}
                          value={person.name}
                          onSelect={() => {
                            setSelectedStatusPerson(person);
                            setOpenStatus(false);
                          }}
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <span className={`inline-block h-2 w-2 rounded-full ${person.online ? 'bg-primary' : 'bg-charcoal-200'}`} />
                            {person.name}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* With Avatars */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-medium">With Avatars</h3>
          <div>
            <Label>Assigned to</Label>
            <Popover open={openAvatar} onOpenChange={setOpenAvatar}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openAvatar}
                  className="w-full justify-between"
                >
                  {selectedAvatarPerson ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={selectedAvatarPerson.imageUrl} />
                        <AvatarFallback className="text-xs">{selectedAvatarPerson.name[0]}</AvatarFallback>
                      </Avatar>
                      {selectedAvatarPerson.name}
                    </div>
                  ) : "Select person..."}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search person..." />
                  <CommandList>
                    <CommandEmpty>
                      <div className="flex items-center gap-2 px-2 py-3">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs bg-muted">
                            <UserCircle className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <span>No person found</span>
                      </div>
                    </CommandEmpty>
                    <CommandGroup>
                      {peopleWithAvatars.map((person) => (
                        <CommandItem
                          key={person.id}
                          value={person.name}
                          onSelect={() => {
                            setSelectedAvatarPerson(person);
                            setOpenAvatar(false);
                          }}
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={person.imageUrl} />
                              <AvatarFallback className="text-xs">{person.name[0]}</AvatarFallback>
                            </Avatar>
                            {person.name}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* With Secondary Text */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-medium">With Secondary Text</h3>
          <div>
            <Label>Assigned to</Label>
            <Popover open={openUsername} onOpenChange={setOpenUsername}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openUsername}
                  className="w-full justify-between"
                >
                  {selectedUsernamePerson ? (
                    <div className="flex items-center gap-2">
                      <span>{selectedUsernamePerson.name}</span>
                      <span className="text-muted-foreground">{selectedUsernamePerson.username}</span>
                    </div>
                  ) : "Select person..."}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search person..." />
                  <CommandList>
                    <CommandEmpty>No person found.</CommandEmpty>
                    <CommandGroup>
                      {peopleWithUsernames.map((person, idx) => (
                        <CommandItem
                          key={idx}
                          value={person.name}
                          onSelect={() => {
                            setSelectedUsernamePerson(person);
                            setOpenUsername(false);
                          }}
                        >
                          <div className="flex flex-1">
                            <span className="block truncate">{person.name}</span>
                            <span className="ml-2 block truncate text-muted-foreground">{person.username}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Command component from cmdk with Popover for dropdown</li>
          <li>• CommandInput for search functionality with filtering</li>
          <li>• Status indicators using <code className="bg-background px-1 py-0.5 rounded">bg-primary</code> dots</li>
          <li>• Avatar component integration for user images</li>
          <li>• Secondary text with <code className="bg-background px-1 py-0.5 rounded">text-muted-foreground</code></li>
        </ul>
      </div>
    </section>
  );
}

function AlertsSection() {
  const [showSuccess, setShowSuccess] = React.useState(true);

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-xl font-display mb-2">Alerts & Notifications</h2>
        <p className="text-sm text-muted-foreground">Feedback messages and status alerts</p>
      </div>

      <div className="grid gap-8">
        {/* Warning Alert */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-medium">Warning Alert</h3>
          <div className="rounded-md bg-secondary-50 p-4">
            <div className="flex">
              <div className="shrink-0">
                <AlertTriangle aria-hidden="true" className="h-5 w-5 text-secondary-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-secondary-800">Attention needed</h3>
                <div className="mt-2 text-sm text-secondary-700">
                  <p>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquid pariatur, ipsum similique veniam quo
                    totam eius aperiam dolorum.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert with List */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-medium">Error Alert with List</h3>
          <div className="rounded-md bg-destructive-50 p-4">
            <div className="flex">
              <div className="shrink-0">
                <XCircle aria-hidden="true" className="h-5 w-5 text-destructive-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-destructive-800">There were 2 errors with your submission</h3>
                <div className="mt-2 text-sm text-destructive-700">
                  <ul role="list" className="list-disc space-y-1 pl-5">
                    <li>Your password must be at least 8 characters</li>
                    <li>Your password must include at least one pro wrestling finishing move</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Success Alert with Actions */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-medium">Success Alert with Actions</h3>
          <div className="rounded-md bg-primary-50 p-4">
            <div className="flex">
              <div className="shrink-0">
                <CheckCircle aria-hidden="true" className="h-5 w-5 text-primary-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-primary-800">Order completed</h3>
                <div className="mt-2 text-sm text-primary-700">
                  <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquid pariatur, ipsum similique veniam.</p>
                </div>
                <div className="mt-4">
                  <div className="-mx-2 -my-1.5 flex">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="rounded-md bg-primary-50 px-2 py-1.5 text-sm font-medium text-primary-800 hover:bg-primary-100"
                    >
                      View status
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="ml-3 rounded-md bg-primary-50 px-2 py-1.5 text-sm font-medium text-primary-800 hover:bg-primary-100"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Alert with Link */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-medium">Info Alert with Link</h3>
          <div className="rounded-md bg-midnight-50 p-4">
            <div className="flex">
              <div className="shrink-0">
                <Info aria-hidden="true" className="h-5 w-5 text-midnight-600" />
              </div>
              <div className="ml-3 flex-1 md:flex md:justify-between">
                <p className="text-sm text-midnight-700">A new software update is available. See what's new in version 2.0.4.</p>
                <p className="mt-3 text-sm md:mt-0 md:ml-6">
                  <a href="#" className="font-medium whitespace-nowrap text-midnight-700 hover:text-midnight-600">
                    Details
                    <span aria-hidden="true"> →</span>
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Warning with Left Accent */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-medium">Warning with Left Accent</h3>
          <div className="border-l-4 border-secondary-500 bg-secondary-50 p-4">
            <div className="flex">
              <div className="shrink-0">
                <AlertTriangle aria-hidden="true" className="h-5 w-5 text-secondary-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-secondary-700">
                  You have no credits left.{' '}
                  <a href="#" className="font-medium text-secondary-700 underline hover:text-secondary-600">
                    Upgrade your account to add more credits.
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Success with Dismiss */}
        {showSuccess && (
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-sm font-medium">Success with Dismiss Button</h3>
            <div className="rounded-md bg-primary-50 p-4">
              <div className="flex">
                <div className="shrink-0">
                  <CheckCircle aria-hidden="true" className="h-5 w-5 text-primary-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-primary-800">Successfully uploaded</p>
                </div>
                <div className="ml-auto pl-3">
                  <div className="-mx-1.5 -my-1.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowSuccess(false)}
                      className="inline-flex rounded-md bg-primary-50 p-1.5 text-primary-600 hover:bg-primary-100 h-auto w-auto"
                    >
                      <span className="sr-only">Dismiss</span>
                      <X aria-hidden="true" className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Alert backgrounds: <code className="bg-background px-1 py-0.5 rounded">bg-primary-50</code>, <code className="bg-background px-1 py-0.5 rounded">bg-destructive-50</code>, <code className="bg-background px-1 py-0.5 rounded">bg-secondary-50</code>, <code className="bg-background px-1 py-0.5 rounded">bg-midnight-50</code></li>
          <li>• Icons from Lucide React with matching color tokens</li>
          <li>• Left accent border with <code className="bg-background px-1 py-0.5 rounded">border-l-4 border-secondary-500</code></li>
          <li>• Action buttons with color-matched hover states</li>
        </ul>
      </div>
    </section>
  );
}

function EmptyStatesSection() {
  const people = [
    { name: 'Lindsay Walton', role: 'Front-end Developer', imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=256&h=256&fit=crop' },
    { name: 'Courtney Henry', role: 'Designer', imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=256&h=256&fit=crop' },
    { name: 'Tom Cook', role: 'Director of Product', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=256&h=256&fit=crop' },
  ];

  const templates = [
    { title: 'Create a List', description: 'Another to-do system you'll try but eventually give up on.', icon: BarChart3, background: 'bg-accent-400' },
    { title: 'Create a Calendar', description: 'Stay on top of your deadlines, or don't — it's up to you.', icon: Calendar, background: 'bg-secondary-400' },
    { title: 'Create a Gallery', description: 'Great for mood boards and inspiration.', icon: Image, background: 'bg-primary-500' },
  ];

  const projectTypes = [
    { name: 'Marketing Campaign', description: 'I think the kids call these memes these days.', icon: Megaphone, iconColor: 'bg-accent-500' },
    { name: 'Engineering Project', description: 'Something really expensive that will ultimately get cancelled.', icon: Terminal, iconColor: 'bg-primary-600' },
    { name: 'Event', description: 'Like a conference all about you that no one will care about.', icon: Calendar, iconColor: 'bg-secondary-500' },
  ];

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-xl font-display mb-2">Empty States</h2>
        <p className="text-sm text-muted-foreground">Placeholders when content is missing</p>
      </div>

      <div className="grid gap-8">
        {/* Simple Empty State */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-medium">Simple with CTA</h3>
          <div className="text-center py-12">
            <FolderPlus className="mx-auto h-12 w-12 text-muted-foreground" strokeWidth={1.5} />
            <h3 className="mt-2 text-sm font-semibold text-foreground">No projects</h3>
            <p className="mt-1 text-sm text-muted-foreground">Get started by creating a new project.</p>
            <div className="mt-6">
              <Button>
                <Plus aria-hidden="true" className="mr-1.5 -ml-0.5 h-5 w-5" />
                New Project
              </Button>
            </div>
          </div>
        </div>

        {/* Button-Style Empty State */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-medium">Button Style</h3>
          <button
            type="button"
            className="relative block w-full rounded-lg border-2 border-dashed border-border p-12 text-center hover:border-muted-foreground focus:outline-2 focus:outline-offset-2 focus:outline-primary"
          >
            <Database className="mx-auto h-12 w-12 text-muted-foreground" strokeWidth={1.5} />
            <span className="mt-2 block text-sm font-semibold text-foreground">Create a new database</span>
          </button>
        </div>

        {/* Grid of Options */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-medium">Grid of Template Options</h3>
          <div>
            <h2 className="text-base font-display">Projects</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              You haven't created a project yet. Get started by selecting a template or start from an empty project.
            </p>
            <ul role="list" className="mt-6 grid grid-cols-1 gap-6 border-y border-border py-6 sm:grid-cols-2">
              {templates.map((item, itemIdx) => (
                <li key={itemIdx} className="flow-root">
                  <div className="relative -m-2 flex items-center space-x-4 rounded-xl p-2 focus-within:outline-2 focus-within:outline-primary hover:bg-accent">
                    <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-lg ${item.background}`}>
                      <item.icon aria-hidden="true" className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-foreground">
                        <a href="#" className="focus:outline-hidden">
                          <span aria-hidden="true" className="absolute inset-0" />
                          <span>{item.title}</span>
                          <span aria-hidden="true"> →</span>
                        </a>
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex">
              <a href="#" className="text-sm font-medium text-primary hover:text-primary/80">
                Or start from an empty project
                <span aria-hidden="true"> →</span>
              </a>
            </div>
          </div>
        </div>

        {/* Team Invite Form */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-medium">Team Invite with Form</h3>
          <div className="mx-auto max-w-lg">
            <div>
              <div className="text-center">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" strokeWidth={1.5} />
                <h2 className="mt-2 text-base font-semibold text-foreground">Add team members</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  You haven't added any team members to your project yet. As the owner of this project, you can manage team member permissions.
                </p>
              </div>
              <form className="mt-6 flex gap-4">
                <Input
                  name="email"
                  type="email"
                  placeholder="Enter an email"
                  aria-label="Email address"
                  className="flex-1"
                />
                <Button type="submit">Send invite</Button>
              </form>
            </div>
            <div className="mt-10">
              <h3 className="text-sm font-medium text-muted-foreground">Team members previously added to projects</h3>
              <ul role="list" className="mt-4 divide-y divide-border border-y border-border">
                {people.map((person, personIdx) => (
                  <li key={personIdx} className="flex items-center justify-between space-x-3 py-4">
                    <div className="flex min-w-0 flex-1 items-center space-x-3">
                      <div className="shrink-0">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={person.imageUrl} />
                          <AvatarFallback>{person.name[0]}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{person.name}</p>
                        <p className="truncate text-sm text-muted-foreground">{person.role}</p>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <Button type="button" variant="ghost" size="sm" className="gap-1.5">
                        <Plus aria-hidden="true" className="h-5 w-5 text-muted-foreground" />
                        Invite
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* List with Icons */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-medium">List with Icon Links</h3>
          <div className="mx-auto max-w-lg">
            <h2 className="text-base font-display">Create your first project</h2>
            <p className="mt-1 text-sm text-muted-foreground">Get started by selecting a template or start from an empty project.</p>
            <ul role="list" className="mt-6 divide-y divide-border border-y border-border">
              {projectTypes.map((item, itemIdx) => (
                <li key={itemIdx}>
                  <div className="group relative flex items-start space-x-3 py-4">
                    <div className="shrink-0">
                      <span className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${item.iconColor}`}>
                        <item.icon aria-hidden="true" className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-foreground">
                        <a href="#">
                          <span aria-hidden="true" className="absolute inset-0" />
                          {item.name}
                        </a>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <div className="shrink-0 self-center">
                      <ChevronRight aria-hidden="true" className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex">
              <a href="#" className="text-sm font-medium text-primary hover:text-primary/80">
                Or start from an empty project
                <span aria-hidden="true"> →</span>
              </a>
            </div>
          </div>
        </div>

        {/* Team Invite with Role Selector */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-medium">Team Invite with Role Selector</h3>
          <div className="mx-auto max-w-md sm:max-w-3xl">
            <div>
              <div className="text-center">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" strokeWidth={1.5} />
                <h2 className="mt-2 text-base font-semibold text-foreground">Add team members</h2>
                <p className="mt-1 text-sm text-muted-foreground">You haven't added any team members to your project yet.</p>
              </div>
              <form className="mt-6 sm:flex sm:items-center gap-4">
                <div className="flex flex-1 items-center rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-primary">
                  <Input
                    name="emails"
                    type="text"
                    placeholder="Enter an email"
                    aria-label="Email addresses"
                    className="flex-1 border-0 focus-visible:ring-0"
                  />
                  <Select defaultValue="edit">
                    <SelectTrigger className="w-auto border-0 border-l gap-2 focus:ring-0 rounded-l-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="edit">Can edit</SelectItem>
                      <SelectItem value="view">Can view</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="mt-3 sm:mt-0 sm:shrink-0">
                  <Button type="submit" className="w-full sm:w-auto">Send invite</Button>
                </div>
              </form>
            </div>
            <div className="mt-10">
              <h3 className="text-sm font-medium text-muted-foreground">Recommended team members</h3>
              <ul role="list" className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {people.map((person, personIdx) => (
                  <li key={personIdx}>
                    <button
                      type="button"
                      className="group flex w-full items-center justify-between space-x-3 rounded-full border border-border p-2 text-left shadow-sm hover:bg-accent focus:outline-2 focus:outline-offset-2 focus:outline-primary"
                    >
                      <span className="flex min-w-0 flex-1 items-center space-x-3">
                        <span className="block shrink-0">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={person.imageUrl} />
                            <AvatarFallback>{person.name[0]}</AvatarFallback>
                          </Avatar>
                        </span>
                        <span className="block min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-foreground">{person.name}</span>
                          <span className="block truncate text-sm text-muted-foreground">{person.role}</span>
                        </span>
                      </span>
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center">
                        <Plus aria-hidden="true" className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
        <p className="font-medium">Design Token Mappings:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Empty state icons with <code className="bg-background px-1 py-0.5 rounded">strokeWidth={1.5}</code> for lighter feel</li>
          <li>• Dashed borders for upload areas: <code className="bg-background px-1 py-0.5 rounded">border-2 border-dashed border-border</code></li>
          <li>• Colored icon backgrounds from palette (e.g., <code className="bg-background px-1 py-0.5 rounded">bg-primary-500</code>, <code className="bg-background px-1 py-0.5 rounded">bg-accent-400</code>)</li>
          <li>• Absolute overlay pattern for clickable cards</li>
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