import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function PocketLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
        <div className="w-full max-w-sm">
          <div className="rounded-3xl bg-white p-8 shadow-lg ring-1 ring-gray-900/5">
            <h2 className="text-2xl font-bold text-gray-900">Sign in to account</h2>
            <p className="mt-2 text-sm text-gray-600">
              Don't have an account?{' '}
              <a href="#" className="font-semibold text-cyan-600 hover:text-cyan-500">
                Sign up
              </a>{' '}
              for a free trial.
            </p>

            <form className="mt-8 space-y-6">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-900">
                  Email address
                </Label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-2"
                  placeholder="••••••••"
                />
              </div>

              <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500">
                Sign in to account
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              <a href="#" className="font-semibold text-gray-900 hover:text-gray-700">
                Forgot password?
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}