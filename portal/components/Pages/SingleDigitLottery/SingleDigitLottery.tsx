'use client'
import React, { useState, useEffect } from 'react';
import { IoMdClock } from "react-icons/io";
import { BiSolidWalletAlt, BiUserCircle } from 'react-icons/bi';
import { MdArrowDropDownCircle } from 'react-icons/md';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebaseConfig';
import { fetchUserBalance, submitLotteryBet, updateUserWallet, fetchProfileData } from '../../../api/firestoreService';
import Confetti from 'react-confetti';
const gameTimer = 180;

function formatTimer(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const minutesStr = String(minutes).padStart(2, '0');
    const secondsStr = String(remainingSeconds).padStart(2, '0');
    return `${minutesStr}:${secondsStr}`;
}

function calculateTimeToNextInterval() {
    const now = new Date();
    const nextInterval = new Date(now);
    nextInterval.setSeconds(0);
    nextInterval.setMilliseconds(0);

    if (now.getSeconds() % 180 === 0) {
        return gameTimer;
    } else {
        const seconds = now.getSeconds() + (180 - (now.getSeconds() % 180));
        nextInterval.setSeconds(seconds);
        return Math.floor((nextInterval.getTime() - now.getTime()) / 1000);
    }
}

function SingleDigitLottery() {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<any>(null);
    const [walletBalance, setWalletBalance] = useState('0');
    const [countdownTimer, setCountdownTimer] = useState(calculateTimeToNextInterval());
    const [cooldown, setCooldown] = useState(0);
    const [showRules, setShowRules] = useState(false);
    const [counter, setCounter] = useState(1);
    let [betCount, setBetCount] = useState(0);
    const [number, setNumber] = useState(0);
    const [betAmount, setBetAmount] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                fetchProfileData(currentUser.uid).then(data => setProfile(data));
                fetchUserBalance(currentUser.uid)
                    .then(data => setWalletBalance(data))
                    .catch(error => console.error('Error fetching wallet balance: ', error));
            } else {
                setUser(null);
            }
        });
        return () => unsubscribe();
    }, []);

    const handleSubmitBet = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        if (betAmount > Number(walletBalance) || Number(walletBalance) === 0) {
            alert('Insufficient Wallet Balance.\nPlease Recharge Your Wallet...');
        } else if (number > 0 && number < 10 && betAmount > 99) {
            setBetCount((prevCount) => prevCount + 1);
            try {
                const response = await submitLotteryBet(user?.uid, number, betAmount, 'Single Digit Lottery', null, false);
                if (response.status === "Bet Placed") {
                    updateUserWallet(user?.uid, Number(walletBalance) - betAmount);
                    setWalletBalance(String(Number(walletBalance) - betAmount));
                    alert(`Bet Submitted.\nCheck the Active Bets Table.`);
                }
            } catch (error) {
                alert('Failed to place bet. Please try again.');
            }
        } else {
            alert('Please select a number between 0 to 9, a bet amount greater than 99.');
        }
    }

    const handleShowRules = () => {
        setShowRules(!showRules);
    }

    const handleNumberClick = (value: string) => {
        setNumber(parseInt(value, 10));
    }

    const handleBetClick = (value: string) => {
        setBetAmount(parseInt(value, 10));
    }

    useEffect(() => {
        const storedTimer = localStorage.getItem('countdownTimer');
        const playSound = () => {
            console.log("Playing sound...")
            const audio = new Audio('/celebrate-sound.wav');
            audio.play();
        };
        const initialTimer = storedTimer !== null ? parseInt(storedTimer) : calculateTimeToNextInterval();
        setCountdownTimer(initialTimer);

        let worker = new Worker(new URL('../../../public/worker1.js', import.meta.url));

        worker.postMessage({
            command: 'start',
            timer: initialTimer,
        });

        worker.onmessage = function (e) {
            const { command, timer } = e.data;

            if (command === 'update') {
                setCountdownTimer(timer);
                localStorage.setItem('countdownTimer', timer);

                if (timer === 0) {
                    setShowConfetti(true);
                    playSound();
                    setTimeout(() => setShowConfetti(false), 10000);
                }
            }
        };

        return () => {
            worker.terminate();
        };
    }, []);

    return (
        <div className="form-container">
            {showConfetti && <Confetti numberOfPieces={1000} recycle={false} />}
            <div className="form-info">
                <div className={`info-box ${countdownTimer === 0 ? 'text-white' : 'text-green-500'}`}>
                    <div className='info-timer'><IoMdClock size={30} className='mr-2' />{formatTimer(countdownTimer)}</div>
                </div>

                <div className="info-box">
                    <BiUserCircle size={30} className='mr-2' />{profile?.firstName} {profile?.lastName}
                </div>
                <div className="info-box">
                    <BiSolidWalletAlt size={30} />
                    {walletBalance}
                </div>
            </div>
            <div className='form-game-name'>Single Digit Lottery</div>
            <div className="form-bets">
                <div className="form-bets-header">Place Your Bets</div>
                <div className="form-bets-content">
                    <div className="form-bet-option">
                        <div>Bet Number</div>
                        <select
                            name="betNumber"
                            value={number}
                            onChange={(e) => handleNumberClick(e.target.value)}
                            className='bet-select'>
                            <option value="0">0</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                            <option value="6">6</option>
                            <option value="7">7</option>
                            <option value="8">8</option>
                            <option value="9">9</option>
                        </select>
                    </div>
                    <div className="form-bet-option">
                        <div>Bet Amount</div>
                        <select
                            name="betAmount"
                            value={betAmount}
                            onChange={(e) => handleBetClick(e.target.value)}
                            className='bet-select'>
                            <option value="no-value">Select Value</option>
                            <option value="100">100</option>
                            <option value="250">250</option>
                            <option value="500">500</option>
                            <option value="750">750</option>
                            <option value="1000">1000</option>
                        </select>
                    </div>

                </div>
                <div className="form-actions">
                    <div onClick={handleSubmitBet} className="bet-button">
                        Place Bet
                    </div>
                </div>
                <div className="form-rules">
                    <div onClick={handleShowRules} className='rules-button'>Rules <MdArrowDropDownCircle size={20} className='ml-4' /></div>
                    {showRules && (
                        <div className="rules-content">
                            <div>1. Select a Number from 0 to 9</div>
                            <div>2. Minimum Bet Amount is 100</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SingleDigitLottery;
