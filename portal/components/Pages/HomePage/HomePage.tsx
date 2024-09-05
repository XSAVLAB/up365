"use client";
import React, { useEffect, useRef, useState } from 'react';
import LandingPageImagesMarquee from './ImagesMarquee';
import { useRouter } from 'next/navigation';
import GamesCards from './GameCards';
import AllLotteryBets from './AllLotteryBets';
import Link from 'next/link';
import { auth, db } from '../../../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { fetchOfferData, fetchProfileData } from '../../../api/firestoreService';
import { doc, setDoc } from 'firebase/firestore';

const HomePage: React.FC = () => {
    const gamesRef = useRef<HTMLDivElement>(null);
    const [showBonus, setShowBonus] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [offer, setOffer] = useState("");
    // Fetch current user using onAuthStateChanged
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);

                // Fetch the user's profile data to check if the Bonus has been shown
                const profileData = await fetchProfileData(currentUser.uid);
                if (profileData && !profileData.hasSeenBonus) {
                    setShowBonus(true);
                }
                const offer = await fetchOfferData();
                setOffer(offer);

            } else {
                setUser(null);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (showBonus) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }
    }, [showBonus]);

    const handleDeposit = async () => {
        setShowBonus(false);

        if (user) {
            try {
                const userDocRef = doc(db, 'users', user.uid);
                await setDoc(userDocRef, { hasSeenBonus: true }, { merge: true });
            } catch (error) {
                console.error('Error updating profile data: ', error);
            }
        }
    };

    return (
        <section className="top_matches__main">
            {showBonus && (
                <div className="bonus-overlay">
                    <Link href="/dashboard">
                        <div className="bonus-popup">
                            <div className="bonus-offer1">
                                Welcome! Get
                            </div>
                            <div className="bonus-offer2">
                                {offer}% Bonus!
                            </div>
                            <div className="bonus-offer3">
                                on your first deposit
                            </div>
                        </div>
                    </Link>
                </div>
            )
            }
            <LandingPageImagesMarquee />
            <div ref={gamesRef}>
                <GamesCards />
            </div>
            <AllLotteryBets />
        </section >
    );
};

export default HomePage;
