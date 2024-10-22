'use client'
import HeaderMain from '@/components/Shared/HeaderMain';
import TopCricket from '@/components/Pages/Cricket/TopCricket';
import TopSlider from '@/components/Pages/Cricket/CricketSlider';
import Home from '@/components/Pages/LandingPage/Home';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '@/firebaseConfig';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import SingleDigitLottery from '@/components/Pages/SingleDigitLottery/SingleDigitLottery';
import HomePage from '@/components/Pages/HomePage/HomePage';

export default function Page() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUserStatus = async (currentUser: User) => {
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const userData = userDoc.data();
        if (userData?.isBlocked) {
          await signOut(auth);
          setUser(null);
          router.push('/login');
        } else {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Error checking user status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        checkUserStatus(currentUser);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);


  return (
    <>
      {isLoading ? (
        <div className="loading-body">
          <div className="loading-plane">
            <div className="ring">
              <img src="/images/loading.png" alt="Loading" />
              <span className="loading-span"></span></div>
          </div>
        </div>
      ) : user ? (
        <>
          <HeaderMain />
          <HomePage />
        </>
      ) : (
        <Home />
      )}
    </>
  );
}
