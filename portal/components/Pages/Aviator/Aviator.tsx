'use client';
import { useEffect, useState } from 'react';
import { fetchAviatorLimitsRealTime } from '../../../api/firestoreService';
import { BiSolidWalletAlt, BiUserCircle } from 'react-icons/bi';
import { fetchProfileData, fetchUserBalance, createAviatorUserBet, updateAviatorBetsOnCrash, updateUserWallet, cancelAviatorUserBet, updateAviatorBetsOnCashout } from '@/api/firestoreService';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, functions } from '@/firebaseConfig';
import { httpsCallable } from 'firebase/functions';

export default function Aviator() {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<any>(null);
    const [walletBalance, setWalletBalance] = useState('0');

    const [betAmount1, setBetAmount1] = useState<number>(100);
    const [betAmount2, setBetAmount2] = useState<number>(100);
    const [hasPlacedBet1, setHasPlacedBet1] = useState(false);
    const [hasPlacedBet2, setHasPlacedBet2] = useState(false);

    const [isRunning, setIsRunning] = useState(false);
    const [isBettingOpen, setIsBettingOpen] = useState(false);
    const [multiplier, setMultiplier] = useState(1);

    const [gameState, setGameState] = useState<string>('');
    const [betStartTime, setbetStartTime] = useState<number>(0);
    const [crashPoint, setCrashPoint] = useState<number | null>(null);

    const [crashMessage, setcrashMessage] = useState<string | null>(null);
    const [cashoutMessage, setcashoutMessage] = useState<string | null>(null);

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
        const unsubscribe = fetchAviatorLimitsRealTime((data: any) => {
            if (data) {
                setCrashPoint(data.crashPoint);
                setGameState(data.state);
                setbetStartTime(data.betStartTime);
                console.log("Next crash", data.crashPoint)
            }
        });
        return () => unsubscribe && unsubscribe();
    }, []);


    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (gameState === 'betting') {
            setIsBettingOpen(true);
            setMultiplier(1);
            setcrashMessage(null);
        }
        else if (gameState === 'flying') {
            setIsBettingOpen(false);
            setIsRunning(true);
            interval = setInterval(() => {
                setMultiplier((prevMultiplier) => {
                    const newMultiplier = prevMultiplier * 1.01;

                    if (crashPoint !== null && newMultiplier >= crashPoint) {
                        clearInterval(interval!);
                        setIsRunning(false);
                        setcrashMessage(`Crashed!`);
                    }
                    return newMultiplier;
                });
            }, 100);
        }
        else if (gameState === 'crashed') {
            setIsRunning(false);
            setHasPlacedBet1(false);
            setHasPlacedBet2(false);
            updateBetStatusOnCrash();
        };

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [gameState, crashPoint]);

    useEffect(() => {
        if (cashoutMessage) {
            const messageTimer = setTimeout(() => {
                setcashoutMessage(null);
            }, 5000);
            return () => clearTimeout(messageTimer);
        }
    }, [cashoutMessage]);

    // Function to update the bet status on crash
    const updateBetStatusOnCrash = async () => {
        await updateAviatorBetsOnCrash(user?.uid, crashPoint?.toFixed(2) ?? 0);
    }

    // Function to place Bet 1
    const placeBet1 = async () => {
        if (betAmount1 && betAmount1 > 0 && isBettingOpen) {
            await updateUserWallet(user?.uid, (Number(walletBalance) - betAmount1).toFixed(2));
            setWalletBalance(String(Number(walletBalance) - betAmount1));
            await createAviatorUserBet(user?.uid, betAmount1, "bet1", betStartTime, "pending");
            setcashoutMessage(null);
            setHasPlacedBet1(true);
        } else {
            setcashoutMessage('Please enter a valid bet amount for Bet 1.');
        }
    };

    // Function to place Bet 2
    const placeBet2 = async () => {
        if (betAmount2 && betAmount2 > 0 && isBettingOpen) {
            await updateUserWallet(user?.uid, (Number(walletBalance) - betAmount2).toFixed(2));
            setWalletBalance(String(Number(walletBalance) - betAmount2));
            await createAviatorUserBet(user?.uid, betAmount2, "bet2", betStartTime, "pending");
            setcashoutMessage(null);
            setHasPlacedBet2(true);
        } else {
            setcashoutMessage('Please enter a valid bet amount for Bet 2.');
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
    // Function to get current multiplier
    const getCurrentMultiplier = async () => {
        try {
            const getMultiplierFunction = httpsCallable(functions, "getCurrentMultiplier");
            const result = await getMultiplierFunction();
            const data = result.data as { multiplier: number };
            return data.multiplier;
        } catch (error) {
            console.error("Error fetching multiplier:", error);
        }
    };

    // Cash out for Bet 1
    const cashOut1 = async () => {
        if (betAmount1) {
            const winnings = (betAmount1 * multiplier).toFixed(2);
            const newWalletBalance = (Number(walletBalance) + Number(winnings)).toFixed(2);
            await updateUserWallet(user?.uid, newWalletBalance);
            setWalletBalance(String(newWalletBalance));
            await updateAviatorBetsOnCashout(user?.uid, multiplier, Number(winnings), "bet1");
            setcashoutMessage(`Cashed out at ${multiplier.toFixed(2)}x! Won ₹${winnings}.`);
            setBetAmount1(100);
            setHasPlacedBet1(false);
        }
    };

    // Cash out for Bet 2
    const cashOut2 = async () => {
        if (betAmount2) {
            const winnings = (betAmount2 * multiplier).toFixed(2);
            const newWalletBalance = (Number(walletBalance) + Number(winnings)).toFixed(2);
            await updateUserWallet(user?.uid, newWalletBalance);
            setWalletBalance(String(newWalletBalance));
            await updateAviatorBetsOnCashout(user?.uid, multiplier, Number(winnings), "bet2");
            setcashoutMessage(`Cashed out at ${multiplier.toFixed(2)}x! Won ₹${winnings}.`);
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
                {cashoutMessage && <div className="cashout-message">{cashoutMessage}</div>}
                <div className='aviator-plane'>
                    {isRunning ? (
                        <>
                            <video
                                className="aviator-video"
                                src="/videos/aviator.mp4"
                                autoPlay
                                muted
                                loop
                                playsInline
                            />
                            <p className="aviator-multiplier-text">{multiplier.toFixed(2)}x</p>
                        </>
                    ) : (
                        <>
                            {isBettingOpen ? (
                                <div className='aviator-countdown'>
                                    <p className="aviator-countdown-text">Waiting for next round</p>
                                    <p className="aviator-countdown-text">Place Bet</p>
                                </div>
                            ) : (
                                <>
                                    {crashMessage ? (
                                        <div className='crash-result'>
                                            <p className="crash-result-text">{crashMessage}</p>
                                            <p className="aviator-multiplier-text" style={{ color: 'red' }}>{multiplier.toFixed(2)}</p>
                                        </div>
                                    ) : (
                                        <p className="aviator-multiplier-text">{multiplier.toFixed(2)}x</p>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>


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
