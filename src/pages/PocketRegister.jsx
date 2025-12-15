import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function PocketRegister() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    referralSource: '',
  });

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <a href="#" className="text-2xl font-bold text-gray-900">
            Pocket
          </a>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-3xl bg-white p-8 shadow-lg ring-1 ring-gray-900/5">
            <h2 className="text-2xl font-bold text-gray-900">Sign up for an account</h2>
            <p className="mt-2 text-sm text-gray-600">
              Already registered?{' '}
              <a href="#" className="font-semibold text-cyan-600 hover:text-cyan-500">
                Sign in
              </a>{' '}
              to your account.
            </p>

            <form className="mt-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-900">
                    First name
                  </Label>
                  <Input
                    type="text"
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-900">
                    Last name
                  </Label>
                  <Input
                    type="text"
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-900">
                  Email address
                </Label>
                <Input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="mt-2"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-medium text-gray-900">
                  Password
                </Label>
                <Input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="mt-2"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <Label htmlFor="referralSource" className="text-sm font-medium text-gray-900">
                  How did you hear about us?
                </Label>
                <Select
                  value={formData.referralSource}
                  onValueChange={(value) => setFormData({ ...formData, referralSource: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="search">Search engine</SelectItem>
                    <SelectItem value="social">Social media</SelectItem>
                    <SelectItem value="friend">Friend or colleague</SelectItem>
                    <SelectItem value="ad">Advertisement</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500">
                Get started today
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}