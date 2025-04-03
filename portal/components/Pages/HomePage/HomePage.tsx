"use client";
import React, { useEffect, useRef, useState } from 'react';
import LandingPageImagesMarquee from './ImagesMarquee';
import { useRouter } from 'next/navigation';
import GamesCards from './GameCards';
import AllLotteryBets from './AllLotteryBets';
import Link from 'next/link';
import { auth, db } from '../../../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { fetchDepositCredited, fetchOfferData, fetchProfileData, updateSuccessDepositMessage } from '../../../api/firestoreService';
import { doc, setDoc } from 'firebase/firestore';
import Confetti from 'react-confetti';
import SectionCards from './SectionCards';
import router from 'next/navigation';


const HomePage: React.FC = () => {
    const gamesRef = useRef<HTMLDivElement>(null);
    const [user, setUser] = useState<any>(null);
    const [userName, setUserName] = useState<any>("");
    const [offer, setOffer] = useState("");
    const [successMessage, setSuccessMessage] = useState<any>("");
    const [showBonus, setShowBonus] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [showDepositSuccess, setShowDepositSuccess] = useState(false);
    const router = useRouter();


    // Fetch current user using onAuthStateChanged
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                // Fetch the user's profile data to check if the Bonus has been shown
                const profileData = await fetchProfileData(currentUser.uid);
                if (profileData && profileData.firstName) {
                    setUserName(profileData.firstName);
                    console.log("Bonus Shown Already?: " + profileData.hasSeenBonus);
                }
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

    useEffect(() => {
        const fetchDepositSuccessMessage = async () => {
            try {
                if (user && user.uid) {
                    const depositCredited = await fetchDepositCredited(user.uid);
                    console.log(depositCredited);
                    if (depositCredited.length > 0) {
                        const { amount, isSuccessShown } = depositCredited[0];

                        setSuccessMessage({ amount, isSuccessShown });
                        console.log({ amount, isSuccessShown });

                        if (!isSuccessShown) {
                            console.log(isSuccessShown);
                            setShowConfetti(true);
                            setTimeout(() => setShowConfetti(false), 10000);
                            setShowDepositSuccess(true);
                        }
                    }
                }
            } catch (e) {
                console.error(e);
            }
        };

        const intervalId = setInterval(() => {
            fetchDepositSuccessMessage();
        }, 10000);

        return () => clearInterval(intervalId);
    }, [user]);


    const handleDeposit = async (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        setShowBonus(false);

        if (user) {
            try {
                const userDocRef = doc(db, 'users', user.uid);
                await setDoc(userDocRef, { hasSeenBonus: true }, { merge: true });
                router.push('/dashboard');
            } catch (error) {
                console.error('Error updating profile data: ', error);
            }
        }
    };
    const handleSuccessMessage = async () => {
        setShowDepositSuccess(false);
        setShowConfetti(false);
        await updateSuccessDepositMessage(user.uid);
    };
    return (
        <section className="top_matches__main">
            {showConfetti && <Confetti numberOfPieces={1000} recycle={false} />}

            {showDepositSuccess && (
                <Link href="/dashboard" onClick={handleSuccessMessage}>
                    <div className="success-overlay">
                        <div className="success-popup">
                            <div className="success-1">
                                Hurray!
                            </div>
                            <div className="success-2">
                                Rs.{successMessage.amount}
                            </div>
                            <div className="success-3">
                                Credited to your account!
                            </div>
                            <div className="success-4">
                                Play and Win Exciting Prizes!
                            </div>
                        </div>
                    </div>
                </Link>
            )
            }
            {showBonus && (
                <Link href="/dashboard" onClick={handleDeposit}>
                    <div className="bonus-overlay">
                        <div className="bonus-popup">
                            <div className="bonus-offer1">
                                Hii! <b>{userName}</b>
                            </div>
                            <div className="bonus-offer4">
                                Get
                            </div>
                            <div className="bonus-offer2">
                                {offer}% Bonus!
                            </div>
                            <div className="bonus-offer3">
                                on your first deposit
                            </div>
                        </div>
                    </div>
                </Link>
            )
            }
            <LandingPageImagesMarquee />
            <div ref={gamesRef}>
                {/* <GamesCards /> */}
                <SectionCards />
            </div>
            <AllLotteryBets />
        </section >
    );
};

export default HomePage;
