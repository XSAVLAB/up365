'use client'
import React, { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebaseConfig';
import { fetchUserBalance, submitLotteryBet, updateUserWallet, fetchProfileData } from '../../../api/firestoreService';

import './styles.css';

const Pool = ({ selectedPool }: { selectedPool: string }) => {
    const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
    const [message, setMessage] = useState<string>('');
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<any>(null);
    const [walletBalance, setWalletBalance] = useState('0');
    const [showRules, setShowRules] = useState(false);
    const [betCount, setBetCount] = useState(0);
    const [number, setNumber] = useState<number | null>(null);
    const [betAmount, setBetAmount] = useState<number>(0);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                fetchProfileData(currentUser.uid).then(data => setProfile(data));
                fetchUserBalance(currentUser.uid)
                    .then(data => setWalletBalance(data))
                    .catch(error => console.error('Error fetching wallet balance:', error));
            } else {
                setUser(null);
            }
        });
        return () => unsubscribe();
    }, []);

    const handleNumberSelect = (num: number) => {
        setSelectedNumber(num);
        setNumber(num);
    };

    const handleSubmitBet = async (e: React.FormEvent) => {
        e.preventDefault();
        if (betAmount > Number(walletBalance) || Number(walletBalance) === 0) {
            alert('Insufficient Wallet Balance.\nPlease Recharge Your Wallet...');
            return;
        }
        if (number !== null && betAmount >= 100) {
            setBetCount((prevCount) => prevCount + 1);
            try {
                const response = await submitLotteryBet(user?.uid, number, betAmount, 'Single Digit Lottery', null, false);
                if (response.status === "Bet Placed") {
                    const newBalance = Number(walletBalance) - betAmount;
                    updateUserWallet(user?.uid, newBalance);
                    setWalletBalance(String(newBalance));
                    alert(`Bet Submitted.\nCheck the Active Bets Table.`);
                }
            } catch (error) {
                alert('Failed to place bet. Please try again.');
            }
        } else {
            alert('Please select a valid number (0-9) and enter a valid bet amount (>=100).');
        }
    };

    return (
        <div className="pool-container">
            <h2 className="form-header">Select a number (0-9)</h2>
            <h2 className="form-header">Pool: ₹{selectedPool}</h2>
            <div className="number-selection">
                {[...Array(10)].map((_, num) => (
                    <button
                        key={num}
                        className={`number-button ${selectedNumber === num ? 'selected' : ''}`}
                        onClick={() => handleNumberSelect(num)}
                    >
                        {num}
                    </button>
                ))}
            </div>
            <input
                type="number"
                placeholder="Enter Bet Amount"
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                min="100"
                className="bet-amount-input"
            />
            <button className="submit-bet" onClick={handleSubmitBet}>Place Bet</button>
            {message && <p className="message">{message}</p>}
        </div>
    );
};

const Matka = () => {
    const [selectedPool, setSelectedPool] = useState<string>('');

    return (
        <div className="form-container">
            <h1 className="form-game-name">Matka</h1>
            {!selectedPool ? (
                <div>
                    <h2 className="form-header">Select your pool</h2>
                    <div className="matka-pools">
                        <div className="pool">
                            {[100, 250, 500, 1000].map((amount) => (
                                <button key={amount} className="entry-fee" onClick={() => setSelectedPool(amount.toString())}>
                                    ₹ {amount}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <Pool selectedPool={selectedPool} />
            )}
        </div>
    );
};

export default Matka;
