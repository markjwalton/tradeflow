import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Mail, Inbox, Send, Archive, Star, Check } from 'lucide-react';

export default function OatmealLanding({ onSignIn }) {
  const [email, setEmail] = useState('');

  const handleGetStarted = () => {
    if (email) {
      onSignIn(email);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      {/* Header */}
      <header className="border-b border-[#E5DCC9] bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-6 w-6 text-[#8B7355]" />
              <span className="text-2xl font-bold text-[#2C2416]">Oatmeal</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm font-medium text-[#2C2416] hover:text-[#8B7355] transition-colors">Features</a>
              <a href="#pricing" className="text-sm font-medium text-[#2C2416] hover:text-[#8B7355] transition-colors">Pricing</a>
              <a href="#about" className="text-sm font-medium text-[#2C2416] hover:text-[#8B7355] transition-colors">About</a>
              <Button variant="outline" className="border-[#2C2416] text-[#2C2416]">Sign In</Button>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 tracking-tight text-[#2C2416]">
              Email that feels like<br />a warm cup of coffee
            </h1>
            <p className="text-xl sm:text-2xl text-[#6B5744] mb-8 max-w-3xl mx-auto">
              Calm, focused email for teams who value simplicity. No clutter, no noise—just the messages that matter.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white border-[#E5DCC9]"
              />
              <Button 
                onClick={handleGetStarted}
                className="bg-[#2C2416] text-white hover:bg-[#3E3420] whitespace-nowrap px-8"
              >
                Get Started
              </Button>
            </div>
            <p className="text-sm text-[#6B5744] mt-4">Free for 14 days. No credit card required.</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#2C2416] mb-4">Everything you need</h2>
            <p className="text-lg text-[#6B5744]">Powerful features, beautifully simple</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 border-[#E5DCC9] hover:shadow-lg transition-shadow">
              <Inbox className="h-10 w-10 text-[#8B7355] mb-4" />
              <h3 className="text-xl font-bold mb-3 text-[#2C2416]">Smart Inbox</h3>
              <p className="text-[#6B5744]">AI-powered inbox that learns what matters to you. Important emails always on top.</p>
            </Card>
            
            <Card className="p-8 border-[#E5DCC9] hover:shadow-lg transition-shadow">
              <Send className="h-10 w-10 text-[#8B7355] mb-4" />
              <h3 className="text-xl font-bold mb-3 text-[#2C2416]">Quick Compose</h3>
              <p className="text-[#6B5744]">Write emails faster with templates, shortcuts, and smart suggestions.</p>
            </Card>
            
            <Card className="p-8 border-[#E5DCC9] hover:shadow-lg transition-shadow">
              <Archive className="h-10 w-10 text-[#8B7355] mb-4" />
              <h3 className="text-xl font-bold mb-3 text-[#2C2416]">Clean & Organized</h3>
              <p className="text-[#6B5744]">Auto-archive, smart folders, and one-click cleanup to keep your inbox zen.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-[#F5F1E8]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-[#2C2416] mb-2">50K+</div>
              <div className="text-[#6B5744]">Happy users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#2C2416] mb-2">1M+</div>
              <div className="text-[#6B5744]">Emails managed daily</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#2C2416] mb-2">99.9%</div>
              <div className="text-[#6B5744]">Uptime guarantee</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#2C2416] mb-4">Simple, transparent pricing</h2>
            <p className="text-lg text-[#6B5744]">Choose the plan that works for you</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="p-8 border-[#E5DCC9]">
              <h3 className="text-xl font-bold mb-2 text-[#2C2416]">Starter</h3>
              <div className="text-3xl font-bold mb-4 text-[#2C2416]">
                $9<span className="text-lg text-[#6B5744] font-normal">/month</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2 text-[#6B5744]">
                  <Check className="h-5 w-5 text-[#8B7355] flex-shrink-0 mt-0.5" />
                  <span>5 GB storage</span>
                </li>
                <li className="flex items-start gap-2 text-[#6B5744]">
                  <Check className="h-5 w-5 text-[#8B7355] flex-shrink-0 mt-0.5" />
                  <span>3 email accounts</span>
                </li>
                <li className="flex items-start gap-2 text-[#6B5744]">
                  <Check className="h-5 w-5 text-[#8B7355] flex-shrink-0 mt-0.5" />
                  <span>Basic support</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full border-[#2C2416] text-[#2C2416]">
                Start free trial
              </Button>
            </Card>

            <Card className="p-8 border-2 border-[#8B7355] relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-[#8B7355] text-white px-4 py-1 rounded-full text-sm font-medium">
                  Popular
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-[#2C2416]">Professional</h3>
              <div className="text-3xl font-bold mb-4 text-[#2C2416]">
                $29<span className="text-lg text-[#6B5744] font-normal">/month</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2 text-[#6B5744]">
                  <Check className="h-5 w-5 text-[#8B7355] flex-shrink-0 mt-0.5" />
                  <span>50 GB storage</span>
                </li>
                <li className="flex items-start gap-2 text-[#6B5744]">
                  <Check className="h-5 w-5 text-[#8B7355] flex-shrink-0 mt-0.5" />
                  <span>Unlimited email accounts</span>
                </li>
                <li className="flex items-start gap-2 text-[#6B5744]">
                  <Check className="h-5 w-5 text-[#8B7355] flex-shrink-0 mt-0.5" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-start gap-2 text-[#6B5744]">
                  <Check className="h-5 w-5 text-[#8B7355] flex-shrink-0 mt-0.5" />
                  <span>Advanced filters</span>
                </li>
              </ul>
              <Button className="w-full bg-[#2C2416] text-white hover:bg-[#3E3420]">
                Start free trial
              </Button>
            </Card>

            <Card className="p-8 border-[#E5DCC9]">
              <h3 className="text-xl font-bold mb-2 text-[#2C2416]">Enterprise</h3>
              <div className="text-3xl font-bold mb-4 text-[#2C2416]">
                $99<span className="text-lg text-[#6B5744] font-normal">/month</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2 text-[#6B5744]">
                  <Check className="h-5 w-5 text-[#8B7355] flex-shrink-0 mt-0.5" />
                  <span>Unlimited storage</span>
                </li>
                <li className="flex items-start gap-2 text-[#6B5744]">
                  <Check className="h-5 w-5 text-[#8B7355] flex-shrink-0 mt-0.5" />
                  <span>Unlimited accounts</span>
                </li>
                <li className="flex items-start gap-2 text-[#6B5744]">
                  <Check className="h-5 w-5 text-[#8B7355] flex-shrink-0 mt-0.5" />
                  <span>24/7 phone support</span>
                </li>
                <li className="flex items-start gap-2 text-[#6B5744]">
                  <Check className="h-5 w-5 text-[#8B7355] flex-shrink-0 mt-0.5" />
                  <span>Custom integrations</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full border-[#2C2416] text-[#2C2416]">
                Contact sales
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#2C2416]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to simplify your inbox?
          </h2>
          <p className="text-xl text-[#E5DCC9] mb-8">
            Join thousands of teams who've already made the switch
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
            <Button className="bg-white text-[#2C2416] hover:bg-[#E5DCC9] whitespace-nowrap px-8">
              Get Started
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[#E5DCC9] bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Mail className="h-5 w-5 text-[#8B7355]" />
                <span className="font-bold text-[#2C2416]">Oatmeal</span>
              </div>
              <p className="text-sm text-[#6B5744]">Email that feels right</p>
            </div>
            <div>
              <h4 className="font-semibold text-[#2C2416] mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-[#6B5744]">
                <li><a href="#" className="hover:text-[#2C2416]">Features</a></li>
                <li><a href="#" className="hover:text-[#2C2416]">Pricing</a></li>
                <li><a href="#" className="hover:text-[#2C2416]">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[#2C2416] mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-[#6B5744]">
                <li><a href="#" className="hover:text-[#2C2416]">About</a></li>
                <li><a href="#" className="hover:text-[#2C2416]">Blog</a></li>
                <li><a href="#" className="hover:text-[#2C2416]">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[#2C2416] mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-[#6B5744]">
                <li><a href="#" className="hover:text-[#2C2416]">Help Center</a></li>
                <li><a href="#" className="hover:text-[#2C2416]">Contact</a></li>
                <li><a href="#" className="hover:text-[#2C2416]">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#E5DCC9] pt-8 text-center text-sm text-[#6B5744]">
            © {new Date().getFullYear()} Oatmeal. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}