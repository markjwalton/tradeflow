import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function GradientTest() {
  return (
    <div className="relative min-h-screen">
      {/* Full-width Sturij header */}
      <div className="w-screen relative left-1/2 right-1/2 -mx-[50vw] bg-midnight-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold">Sturij</div>
          <nav className="flex gap-6">
            <a href="#" className="hover:text-primary-300 transition-colors">What we treat</a>
            <a href="#" className="hover:text-primary-300 transition-colors">How it works</a>
            <a href="#" className="hover:text-primary-300 transition-colors">About</a>
          </nav>
          <Button variant="ghost" className="text-white hover:text-primary-300">Sign in</Button>
        </div>
      </div>

      {/* Gradient background that bleeds to white */}
      <div 
        className="w-screen relative left-1/2 right-1/2 -mx-[50vw]"
        style={{
          background: 'linear-gradient(to bottom, #00CED1 0%, #7FFFD4 20%, #E0F7FA 50%, #F5FFFE 70%, #FFFFFF 100%)',
          minHeight: '60vh'
        }}
      >
        <div className="max-w-4xl mx-auto px-6 py-16">
          {/* Hero Section */}
          <div className="mb-16">
            <h1 className="text-5xl font-bold mb-6 text-midnight-900">
              WHAT IS VIAGRA CONNECT?
            </h1>
            <p className="text-lg text-midnight-700 max-w-xl">
              Viagra Connect was the first erectile dysfunction (ED) treatment available in the UK without a prescription. 
              It contains sildenafil, the same active ingredient found in prescription Viagra.
            </p>
          </div>

          {/* Content Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mb-3">
                  <span className="text-2xl">💊</span>
                </div>
                <CardTitle>Stimulation increases blood flow</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  When you get aroused, your body produces a molecule called cGMP, which helps to stimulate an erection by increasing blood flow to the penis.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mb-3">
                  <span className="text-2xl">🔗</span>
                </div>
                <CardTitle>Restricted blood flow inhibits an erection</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  However, the enzyme phosphodiesterase 5 (PDE5) breaks down cGMP, and this can cause the erection to be less sustained.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mb-3">
                  <span className="text-2xl">✅</span>
                </div>
                <CardTitle>Medication promotes a firmer erection</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Viagra Connect blocks the action of PDE5, allowing more blood flow to the penis. The resulting erection is firmer and usually lasts long enough.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* White content section */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-6 text-midnight-900">
          What's the difference between Viagra Connect and Viagra?
        </h2>
        <p className="text-lg text-midnight-700 mb-8">
          The difference between Viagra and Viagra Connect is that Viagra is only available as a prescription, 
          whereas Viagra Connect can be bought over the counter without a prescription.
        </p>
        
        <Card>
          <CardContent className="p-8">
            <div className="bg-midnight-800 text-white p-6 rounded-lg text-center">
              <p className="text-lg mb-4">
                <strong>Enjoy better sex again.</strong> Clinically proven treatments delivered discreetly to your door.
              </p>
              <Button className="bg-primary-500 hover:bg-primary-600 text-white">
                Get started →
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}