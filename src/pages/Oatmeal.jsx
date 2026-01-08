import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import OatmealInbox from '@/components/oatmeal/OatmealInbox';
import OatmealLanding from '@/components/oatmeal/OatmealLanding';

export default function Oatmeal() {
  const [view, setView] = useState('landing'); // 'landing' or 'app'
  const [user, setUser] = useState(null);

  const handleSignIn = (email) => {
    setUser({ email });
    setView('app');
  };

  if (view === 'app' && user) {
    return <OatmealInbox user={user} onSignOut={() => { setUser(null); setView('landing'); }} />;
  }

  return <OatmealLanding onSignIn={handleSignIn} />;
}