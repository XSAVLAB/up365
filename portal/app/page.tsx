'use client'
import HeaderMain from '@/components/Shared/HeaderMain';
import TopCricket from '@/components/Pages/Cricket/TopCricket';
import TopSlider from '@/components/Pages/Cricket/CricketSlider';
import Home from '@/components/Pages/LandingPage/Home';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebaseConfig';
import { useEffect, useState } from 'react';

export default function page() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);
  return (
    <>
      {user ? (
        <>
          <HeaderMain />
          <TopSlider />
          <TopCricket />
        </>
      ) : (
        <Home />
      )}

    </>
  )
}
