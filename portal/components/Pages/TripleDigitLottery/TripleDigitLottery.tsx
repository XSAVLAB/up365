'use client'
import React, { useState, useEffect } from 'react';
import { IoMdClock } from "react-icons/io";
import { BiSolidWalletAlt, BiUserCircle } from 'react-icons/bi';
import { MdArrowDropDownCircle } from 'react-icons/md';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebaseConfig';
import { fetchUserBalance, submitLotteryBet, updateUserWallet, settleLotteryBets, fetchProfileData } from '../../../api/firestoreService';

const gameTimer = 90;

function formatTimer(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const minutesStr = String(minutes).padStart(2, '0');
    const secondsStr = String(remainingSeconds).padStart(2, '0');
    return `${minutesStr}:${secondsStr}`;
}

function calculateTimeToNextInterval() {
    const now = new Date();
    const nextInterval = new Date(now);
    nextInterval.setSeconds(0);
    nextInterval.setMilliseconds(0);

    if (now.getSeconds() % 90 === 0) {
        return gameTimer;
    } else {
        const seconds = now.getSeconds() + (90 - (now.getSeconds() % 90));
        nextInterval.setSeconds(seconds);
        return Math.floor((nextInterval.getTime() - now.getTime()) / 1000);
    }
}

function TripleDigitLottery() {
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
    const [rewardAmount] = useState(0);

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
        } else if (number > 99 && number < 1000 && betAmount > 99) {
            setBetCount((prevCount) => prevCount + 1);
            try {
                const response = await submitLotteryBet(user?.uid, number, betAmount, 'Triple Digit Lottery', null, false);
                if (response.status === "Bet Placed") {
                    updateUserWallet(user?.uid, Number(walletBalance) - betAmount);
                    setWalletBalance(String(Number(walletBalance) - betAmount));
                    alert(`Bet Submitted.\nCheck the Active Bets Table.`);
                }
            } catch (error) {
                alert('Failed to place bet. Please try again.');
            }
        } else {
            alert('Please select a number between 100 to 999, a bet amount greater than 99.');
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
        let worker = new Worker(new URL('../../../public/worker.js', import.meta.url));

        worker.postMessage({
            command: 'start',
            timer: countdownTimer,
            coolDown: cooldown,
        });

        worker.onmessage = function (e) {
            const { command, timer, coolDown } = e.data;

            if (command === 'update') {
                setCountdownTimer(timer);
                setCooldown(coolDown);
                localStorage.setItem('countdownTimer', timer);
                localStorage.setItem('cooldown', coolDown);
            } else if (command === 'settleBets') {
                settleLotteryBets('Triple Digit Lottery');
                setCounter((prevCounter) => prevCounter + 1);
                setBetCount(0);
                localStorage.setItem('countdownTimer', gameTimer.toString());
                localStorage.setItem('cooldown', '0');

            }
        };

        return () => {
            worker.terminate();
        };
    }, [countdownTimer, cooldown, user?.uid, number, betAmount, counter]);

    return (
        <div className="form-container">
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
            <div className='form-game-name'>Triple Digit Lottery</div>
            <div className="form-bets">
                <div className="form-bets-header">Place Your Bets</div>
                <div className="form-bets-content">
                    <div className="form-bet-option">
                        <div>Bet Number</div>
                        <div>
                            <input type='number' onChange={(e) => setNumber(parseInt(e.target.value, 10))}
                                value={number} placeholder='100 to 999'
                                className='bet-input' />
                        </div>
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
                    <div className="form-bet-option">
                        <div>Custom Bet</div>
                        <div>
                            <input type='number' onChange={(e) => setBetAmount(parseInt(e.target.value, 10))}
                                value={betAmount} placeholder='100, 200, etc.'
                                className='bet-input' />
                        </div>
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
                            <div>1. Select a Number from 100 to 999</div>
                            <div>2. Minimum Bet Amount is 100</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TripleDigitLottery;
