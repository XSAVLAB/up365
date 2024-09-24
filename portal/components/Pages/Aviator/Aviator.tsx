'use client';
import { SetStateAction, useEffect, useState } from 'react';
import { subscribeToCrashLimits } from '../../../api/firestoreAdminService';
import { BiSolidWalletAlt, BiUserCircle } from 'react-icons/bi';
import { fetchProfileData, fetchUserBalance } from '@/api/firestoreService';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/firebaseConfig';

export default function Aviator() {

    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<any>(null);
    const [walletBalance, setWalletBalance] = useState('0');
    const [multiplier, setMultiplier] = useState(1);
    const [isRunning, setIsRunning] = useState(false);
    const [crashPoint, setCrashPoint] = useState<number | null>(null);
    const [betAmount, setBetAmount] = useState<number | null>(null);
    const [resultMessage, setResultMessage] = useState<string | null>(null);
    const [minCrash, setMinCrash] = useState<number>(1);
    const [maxCrash, setMaxCrash] = useState<number>(100);
    const [isBettingOpen, setIsBettingOpen] = useState(false);
    const [countdown, setCountdown] = useState(15);
    const [hasPlacedBet, setHasPlacedBet] = useState(false);

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
        setBetAmount(null);
        setHasPlacedBet(false);
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
            setResultMessage(`Crash! The game crashed at ${crashPoint.toFixed(2)}x.`);

            crashDelayTimeout = setTimeout(() => {
                setResultMessage(null);
                setCountdown(15); // Restart the countdown for the next round
                setIsBettingOpen(true); // Reopen betting after crash
                setHasPlacedBet(false); // Reset bet state
            }, 2000);
        }

        return () => {
            clearInterval(interval!);
            clearTimeout(crashDelayTimeout!);
        };
    }, [isRunning, multiplier, crashPoint]);

    // Clear result message after 10 seconds
    useEffect(() => {
        if (resultMessage) {
            const messageTimer = setTimeout(() => {
                setResultMessage(null);
            }, 10000);
            return () => clearTimeout(messageTimer);
        }
    }, [resultMessage]);

    // Function to place the bet
    const placeBet = () => {
        if (betAmount && betAmount > 0 && isBettingOpen) {
            setResultMessage(null);
            setHasPlacedBet(true); // Mark that a bet has been placed
        } else {
            setResultMessage('Please enter a valid bet amount.');
        }
    };

    // Function to cancel the bet
    const cancelBet = () => {
        setBetAmount(null); // Clear the bet amount
        setHasPlacedBet(false); // Reset bet state
        setResultMessage('Bet canceled.');
    };

    // Cash out function
    const cashOut = () => {
        if (betAmount) {
            const winnings = (betAmount * multiplier).toFixed(2);
            setResultMessage(`You cashed out at ${multiplier.toFixed(2)}x! You won ₹${winnings}.`);
            setBetAmount(null);
            setHasPlacedBet(false);
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
            <div className="form-game-name">Aviator Game</div>
            <div className="aviator-container">
                <div className="aviator-header">Place Your Bets</div>
                <div className="aviator-content">
                    {isBettingOpen ? (
                        <p className="aviator-countdown-text">Place your bet! Time remaining: {countdown}s</p>
                    ) : (
                        <p className="aviator-multiplier-text">{multiplier.toFixed(2)}x</p>
                    )}
                    <div className="aviator-bet">
                        <input
                            type="number"
                            placeholder="Amount"
                            value={betAmount ?? ''}
                            onChange={(e) => setBetAmount(Number(e.target.value))}
                            className="aviator-input"
                            disabled={!isBettingOpen || hasPlacedBet}
                        />

                        {isBettingOpen && !hasPlacedBet ? (
                            <button
                                className="aviator-bet-btn"

                                onClick={placeBet}
                                disabled={!isBettingOpen || hasPlacedBet}
                            >
                                Place Bet
                            </button>
                        ) : isRunning && hasPlacedBet ? (
                            <button className="aviator-cashout-btn" onClick={cashOut}>
                                Cash Out
                            </button>
                        ) : isRunning && !hasPlacedBet ? (
                            <button className="aviator-bet-btn" onClick={placeBet} disabled={!isBettingOpen || hasPlacedBet}>Place Bet</button>) : null}

                        {hasPlacedBet && !isRunning && (
                            <button className="aviator-cancel-btn" onClick={cancelBet}>
                                Cancel Bet
                            </button>
                        )}
                    </div>

                    {resultMessage && <p className="aviator-result">{resultMessage}</p>}
                </div>
            </div>
        </div>
    );
}
