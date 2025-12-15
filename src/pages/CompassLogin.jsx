import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CompassLogin() {
  const [email, setEmail] = useState('');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12 bg-white">
      <div className="w-full max-w-sm">
        <div className="flex justify-center">
          <span className="text-2xl font-bold text-indigo-600">Compass</span>
        </div>
        
        <div className="mt-10">
          <h1 className="sr-only">Login</h1>
          <form className="space-y-6">
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-900">
                Email
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
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500">
              Send one-time password
            </Button>
          </form>
        </div>

        <p className="mt-10 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}