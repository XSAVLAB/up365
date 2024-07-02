'use client'
import React, { useState, useEffect } from 'react';
import { IoMdClock } from "react-icons/io";
import { BiSolidWalletAlt, BiUserCircle } from 'react-icons/bi';
import { MdArrowDropDownCircle } from 'react-icons/md';
import { useService } from '../../hooks/useService';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebaseConfig';
import { fetchUserBalance, submitLotteryBet, updateUserWallet } from '../../../api/firestoreService';

const gameTimer = 300;

function formatTimer(seconds: number) {
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    const hoursStr = String(hours).padStart(2, '0');
    const minutesStr = String(minutes).padStart(2, '0');
    const secondsStr = String(remainingSeconds).padStart(2, '0');
    return `${hoursStr}:${minutesStr}:${secondsStr}`;
}

function Form() {
    const [user, setUser] = useState<User | null>(null);
    const [walletBalance, setWalletBalance] = useState('0');
    const service = useService();
    const [countdownTimer, setCountdownTimer] = useState(0);
    const [cooldown, setCooldown] = useState(10);
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
        } else if (number > -1 && number < 10 && betAmount > 99) {
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
            alert('Please select a number between 0 to 9. \nMinimum Bet Amount = 100.');
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
        const interval = setInterval(() => {
            if (countdownTimer === 0) {
                setCounter((prevCounter) => prevCounter + 1);
                setBetCount(0);
                setCountdownTimer(gameTimer);
                setCooldown(10);
            } else if (cooldown !== 0) {
                setCooldown((prevCooldown) => prevCooldown - 1);
            } else {
                setCountdownTimer((prevCountdown) => prevCountdown - 1);
            }
        }, 1000);
        return () => {
            clearInterval(interval);
        };
    }, [countdownTimer, cooldown, user?.uid, number, betAmount, counter]);


    return (
        <div className="form-container">
            <div className="form-info">
                <div className={`info-box ${countdownTimer === 0 ? 'text-white' : 'text-green-500'}`}>
                    <div>Game Timer</div>
                    <div className='info-timer'><IoMdClock size={30} className='mr-2' />{formatTimer(countdownTimer)}</div>
                </div>

                <div className="info-box">
                    <BiUserCircle size={30} className='mr-2' />{user?.uid}
                </div>
                <div className="info-box">
                    <BiSolidWalletAlt size={30} />
                    {walletBalance}
                </div>
                <div className="info-box">
                    <div>Reward</div>
                    <div>Rs.{rewardAmount}</div>
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
                            <div>1. Select a Number from 0 to 9</div>
                            <div>2. Minimum Bet Amount is 100</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Form;
