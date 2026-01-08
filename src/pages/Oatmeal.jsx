import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import OatmealInbox from '@/components/oatmeal/OatmealInbox';

export default function Oatmeal() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    fetchUser();
  }, []);

  const handleSignOut = async () => {
    await base44.auth.logout();
  };

  if (!user) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  return <OatmealInbox user={user} onSignOut={handleSignOut} />;
}