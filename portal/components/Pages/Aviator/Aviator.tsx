'use client';
import { SetStateAction, useEffect, useState } from 'react';
import { subscribeToCrashLimits } from '../../../api/firestoreAdminService';
import { BiSolidWalletAlt, BiUserCircle } from 'react-icons/bi';
import { fetchProfileData, fetchUserBalance, createAviatorUserBet, updateAviatorBetsOnCrash, updateUserWallet, cancelAviatorUserBet, updateAviatorBetsOnCashout } from '@/api/firestoreService';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/firebaseConfig';

export default function Aviator() {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<any>(null);
    const [walletBalance, setWalletBalance] = useState('0');
    const [multiplier, setMultiplier] = useState(1);
    const [isRunning, setIsRunning] = useState(false);
    const [crashPoint, setCrashPoint] = useState<number | null>(null);
    const [betAmount1, setBetAmount1] = useState<number>(100);
    const [betAmount2, setBetAmount2] = useState<number>(100);
    const [hasPlacedBet1, setHasPlacedBet1] = useState(false);
    const [hasPlacedBet2, setHasPlacedBet2] = useState(false);
    const [resultMessage, setResultMessage] = useState<string | null>(null);
    const [minCrash, setMinCrash] = useState<number>(1);
    const [maxCrash, setMaxCrash] = useState<number>(100);
    const [isBettingOpen, setIsBettingOpen] = useState(false);
    const [countdown, setCountdown] = useState(15);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                fetchProfileData(currentUser.uid).then((data) => setProfile(data));
                fetchUserBalance(currentUser.uid)
                    .then((data) => setWalletBalance(data))
                    .catch((error) => console.error('Error fetching wallet balance: ', error));
            } else {
                setUser(null);
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const unsubscribe = subscribeToCrashLimits((data: { minCrash: SetStateAction<number>; maxCrash: SetStateAction<number> }) => {
            if (data) {
                setMinCrash(data.minCrash);
                setMaxCrash(data.maxCrash);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        setIsBettingOpen(true);
        setCountdown(15);
        setResultMessage(null);
        setBetAmount1(100);
        setBetAmount2(100);
        setHasPlacedBet1(false);
        setHasPlacedBet2(false);
    }, []);

    useEffect(() => {
        let countdownInterval: NodeJS.Timeout | null = null;

        if (countdown > 0) {
            countdownInterval = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        } else if (countdown === 0) {
            setIsBettingOpen(false);
            setIsRunning(true);
            setMultiplier(1);
            setCrashPoint(Math.random() * (maxCrash - minCrash) + minCrash);
        }

        return () => {
            if (countdownInterval) clearInterval(countdownInterval);
        };
    }, [countdown, maxCrash, minCrash]);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        let crashDelayTimeout: NodeJS.Timeout | null = null;

        if (isRunning && crashPoint !== null) {
            interval = setInterval(() => {
                setMultiplier((prev) => prev * 1.01);
            }, 100);
        }

        if (crashPoint !== null && multiplier >= crashPoint) {
            setIsRunning(false);
            clearInterval(interval!);
            setResultMessage(`Crashed! ${crashPoint.toFixed(2)}x.`);
            updateBetStatusOnCrash();
            crashDelayTimeout = setTimeout(() => {
                setResultMessage(null);
                setCountdown(15);
                setIsBettingOpen(true);
                setHasPlacedBet1(false);
                setHasPlacedBet2(false);
            }, 2000);
        }

        return () => {
            clearInterval(interval!);
            clearTimeout(crashDelayTimeout!);
        };
    }, [isRunning, multiplier, crashPoint]);

    useEffect(() => {
        if (resultMessage) {
            const messageTimer = setTimeout(() => {
                setResultMessage(null);
            }, 5000);
            return () => clearTimeout(messageTimer);
        }
    }, [resultMessage]);

    // Function to update the bet status on crash
    const updateBetStatusOnCrash = async () => {
        await updateAviatorBetsOnCrash(user?.uid, crashPoint?.toFixed(2) ?? 0);
    }

    // Function to place Bet 1
    const placeBet1 = async () => {
        if (betAmount1 && betAmount1 > 0 && isBettingOpen) {
            await updateUserWallet(user?.uid, (Number(walletBalance) - betAmount1).toFixed(2));
            setWalletBalance(String(Number(walletBalance) - betAmount1));
            await createAviatorUserBet(user?.uid, betAmount1, "bet1", "pending");
            setResultMessage(null);
            setHasPlacedBet1(true);
        } else {
            setResultMessage('Please enter a valid bet amount for Bet 1.');
        }
    };

    // Function to place Bet 2
    const placeBet2 = async () => {
        if (betAmount2 && betAmount2 > 0 && isBettingOpen) {
            await updateUserWallet(user?.uid, (Number(walletBalance) - betAmount2).toFixed(2));
            setWalletBalance(String(Number(walletBalance) - betAmount2));
            await createAviatorUserBet(user?.uid, betAmount2, "bet2", "pending");
            setResultMessage(null);
            setHasPlacedBet2(true);
        } else {
            setResultMessage('Please enter a valid bet amount for Bet 2.');
        }
    };

    // Function to cancel Bet 1
    const cancelBet1 = async () => {
        if (betAmount1 !== null) {
            await updateUserWallet(user?.uid, (Number(walletBalance) + betAmount1).toFixed(2));
            setWalletBalance(String(Number(walletBalance) + betAmount1));
            await cancelAviatorUserBet(user?.uid, "bet1");
        }
        setBetAmount1(100);
        setHasPlacedBet1(false);
    };

    // Function to cancel Bet 2
    const cancelBet2 = async () => {
        if (betAmount2 !== null) {
            await updateUserWallet(user?.uid, (Number(walletBalance) + betAmount2).toFixed(2));
            setWalletBalance(String(Number(walletBalance) + betAmount2));
            await cancelAviatorUserBet(user?.uid, "bet2");
        }
        setBetAmount2(100);
        setHasPlacedBet2(false);
    };

    // Cash out for Bet 1
    const cashOut1 = async () => {
        if (betAmount1) {
            const winnings = (betAmount1 * multiplier).toFixed(2);
            await updateUserWallet(user?.uid, (Number(walletBalance) + Number(winnings)).toFixed(2));
            setWalletBalance(String(Number(walletBalance) + Number(winnings)));
            await updateAviatorBetsOnCashout(user?.uid, multiplier, winnings, "bet1");
            setResultMessage(`Cashed out ${multiplier.toFixed(2)}x! Won ₹${winnings}.`);
            setBetAmount1(100);
            setHasPlacedBet1(false);
        }
    };

    // Cash out for Bet 2
    const cashOut2 = async () => {
        if (betAmount2) {
            const winnings = (betAmount2 * multiplier).toFixed(2);
            await updateUserWallet(user?.uid, (Number(walletBalance) + Number(winnings)).toFixed(2));
            setWalletBalance(String(Number(walletBalance) + Number(winnings)));
            await updateAviatorBetsOnCashout(user?.uid, multiplier, winnings, "bet2");
            setResultMessage(`Cashed out ${multiplier.toFixed(2)}x! Won ₹${winnings}.`);
            setBetAmount2(100);
            setHasPlacedBet2(false);
        }
    };

    return (
        <div className="form-container">
            <div className="form-info">
                <div className="info-box">
                    <BiUserCircle size={30} className="mr-2" />
                    {profile?.firstName} {profile?.lastName}
                </div>
                <div className="info-box">
                    <BiSolidWalletAlt size={30} />
                    {walletBalance}
                </div>
            </div>
            <div className="aviator-bets-content">
                <div className='aviator-plane'>
                    {isBettingOpen ? (
                        <p className="aviator-countdown-text">{countdown}s...</p>
                    ) : (
                        <>
                            <p className="aviator-multiplier-text">{multiplier.toFixed(2)}x</p>
                        </>
                    )}
                </div>

                {resultMessage && <p className="aviator-result">{resultMessage}</p>}

                <div className="aviator-inputs">

                    <input
                        type="number"
                        placeholder="Amount"
                        value={betAmount1 ?? 100}
                        onChange={(e) => setBetAmount1(Number(e.target.value))}
                        className="aviator-inputbox"
                        disabled={!isBettingOpen || hasPlacedBet1}
                    />
                    <input
                        type="number"
                        placeholder="Amount"
                        value={betAmount2 ?? 100}
                        onChange={(e) => setBetAmount2(Number(e.target.value))}
                        className="aviator-inputbox"
                        disabled={!isBettingOpen || hasPlacedBet2}
                    />
                </div>

                <div className="aviator-buttons">

                    {isBettingOpen && !hasPlacedBet1 ? (
                        <button
                            className="aviator-bet-btn"
                            onClick={placeBet1}
                            disabled={!isBettingOpen || hasPlacedBet1}
                        >
                            Bet ₹{(betAmount1 ?? 100).toFixed(2)}
                        </button>
                    ) : isRunning && hasPlacedBet1 ? (
                        <button className="aviator-cashout-btn" onClick={cashOut1}>
                            Cash Out {(multiplier * (betAmount1 ?? 0)).toFixed(2)}
                        </button>
                    ) : isRunning && !hasPlacedBet1 ? (
                        <button className="aviator-bet-btn" onClick={placeBet1} disabled={!isBettingOpen || hasPlacedBet1}>Bet</button>) : null}

                    {hasPlacedBet1 && !isRunning && (
                        <button className="aviator-cancel-btn" onClick={cancelBet1}>
                            Cancel Bet
                        </button>
                    )}
                    {isBettingOpen && !hasPlacedBet2 ? (
                        <button
                            className="aviator-bet-btn"
                            onClick={placeBet2}
                            disabled={!isBettingOpen || hasPlacedBet2}
                        >
                            Bet ₹{(betAmount2 ?? 100).toFixed(2)}
                        </button>
                    ) : isRunning && hasPlacedBet2 ? (
                        <button className="aviator-cashout-btn" onClick={cashOut2}>
                            Cash Out {(multiplier * (betAmount2 ?? 0)).toFixed(2)}
                        </button>
                    ) : isRunning && !hasPlacedBet2 ? (
                        <button className="aviator-bet-btn" onClick={placeBet2} disabled={!isBettingOpen || hasPlacedBet2}>Bet</button>) : null}

                    {hasPlacedBet2 && !isRunning && (
                        <button className="aviator-cancel-btn" onClick={cancelBet2}>
                            Cancel Bet
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}
