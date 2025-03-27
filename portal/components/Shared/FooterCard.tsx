import React, { useEffect, useState } from 'react';
import { IconArrowBadgeUpFilled } from "@tabler/icons-react";
import { Tab } from '@headlessui/react';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDoc, doc, updateDoc, getDocs, query, where } from 'firebase/firestore';

interface Bet {
    id: string;
    userId: string;
    betAmount: string;
    odds: string;
    possibleWin: string;
    selectedTeam: string;
    timestamp: string;
    status: string;
    settled: boolean;
    match: string;
}

interface User {
    wallet: string;
}

interface FooterCardProps {
    isCardExpanded: boolean;
    setIsCardExpanded: (expanded: boolean) => void;
    selectedTeam: string;
    selectedOdds: string;
    matchTeams: string;
}

export default function FooterCard({ selectedTeam, selectedOdds, matchTeams, isCardExpanded, setIsCardExpanded }: FooterCardProps) {
    const [betAmount, setBetAmount] = useState('');
    const [possibleWin, setPossibleWin] = useState('0');
    const [balance, setBalance] = useState('0');
    const [message, setMessage] = useState('');
    const [bets, setBets] = useState<Bet[]>([]);

    const toggleCard = () => {
        setIsCardExpanded(!isCardExpanded);
    };
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isCardExpanded && !(event.target as HTMLElement).closest(".fixed_footer")) {
                setIsCardExpanded(false);
            }
        };
        document.body.addEventListener("click", handleClickOutside);
        return () => {
            document.body.removeEventListener("click", handleClickOutside);
        };
    }, [isCardExpanded, setIsCardExpanded]);

    useEffect(() => {
        console.log('Selected team: ', selectedTeam);
        console.log('Selected odds: ', selectedOdds);
        console.log('Match teams: ', matchTeams);
        const fetchBalance = async () => {
            try {
                const auth = getAuth();
                const user = auth.currentUser;
                if (user) {
                    const db = getFirestore();
                    const docRef = doc(db, 'users', user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const userData = docSnap.data() as User;
                        setBalance(userData.wallet);
                    } else {
                        console.error('No wallet found for user');
                    }
                } else {
                    console.error('User not authenticated');
                }
            } catch (error) {
                console.error('Error fetching balance: ', error);
            }
        };

        fetchBalance();
    }, []);

    useEffect(() => {
        const selectedOddsFloat = parseFloat(selectedOdds);
        if (betAmount && !isNaN(Number(betAmount))) {
            setPossibleWin(((Number(betAmount) * selectedOddsFloat) - Number(betAmount)).toFixed(2));
        } else {
            setPossibleWin('0');
        }
    }, [betAmount, selectedOdds]);

    const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBetAmount(e.target.value);
    };

    const handleBetAmountButtonClick = (amount: string) => {
        setBetAmount(amount);
    };

    const handleBet = async () => {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
            setMessage('Please Login to Place a bet');
            return;
        }
        if (!selectedTeam) {
            setMessage('Please select your team.');
            return;
        }

        if (betAmount && !isNaN(Number(betAmount)) && selectedTeam) {
            const bet = Number(betAmount);
            const currentBalance = Number(balance);
            if (bet > currentBalance) {
                setMessage('Insufficient balance! Please add funds.');
            } else {
                try {
                    const db = getFirestore();
                    const betData: Bet = {
                        id: '',
                        userId: user.uid,
                        betAmount: betAmount,
                        odds: selectedOdds,
                        possibleWin: possibleWin,
                        timestamp: new Date().toLocaleString(),
                        status: 'pending',
                        settled: false,
                        selectedTeam: selectedTeam,
                        match: matchTeams
                    };

                    const betRef = await addDoc(collection(db, "cricketBets"), betData);
                    await updateDoc(betRef, {
                        id: betRef.id
                    });

                    const userWalletRef = doc(db, 'users', user.uid);
                    await updateDoc(userWalletRef, {
                        wallet: (currentBalance - bet).toString()
                    });

                    setBalance((currentBalance - bet).toString());
                    setMessage(`Bet of ₹${betAmount} placed on ${selectedTeam}`);
                } catch (error) {
                    console.error('Error placing bet: ', error);
                }
            }
        } else {
            console.error('Invalid bet amount or team not selected');
        }
    };

    const handleMaxBet = () => {
        setBetAmount(balance);
    };

    useEffect(() => {
        const fetchBets = async () => {
            try {
                const auth = getAuth();
                const user = auth.currentUser;
                if (!user) {
                    console.error('User not authenticated');
                    return;
                }

                const db = getFirestore();
                const q = query(collection(db, "cricketBets"), where('userId', '==', user.uid), where('settled', '==', false));
                const betsSnapshot = await getDocs(q);
                const userBets = betsSnapshot.docs.map(doc => ({
                    ...(doc.data() as Bet),
                    id: doc.id
                }));

                setBets(userBets);
            } catch (error) {
                console.error('Error fetching bets: ', error);
            }
        };

        fetchBets();
    }, []);

    return (
        <>
            <div className={`fixed_footer p3-bg rounded-5 ${isCardExpanded ? "expandedtexta" : "expanded2"}`}>
                <div className="fixed_footer__head py-3 px-4">
                    <div className="d-flex justify-content-between">
                        <div className="fixed_footer__head-betslip d-flex align-items-center gap-2">
                            <span className="fw-bold">Betslip</span>
                            <span className="fw-bold f14 text-secondary">({bets.length})</span>
                        </div>
                        <button className="fixed_footer__head-arrow" onClick={toggleCard}>
                            <IconArrowBadgeUpFilled />
                        </button>
                    </div>
                </div>
                <div className="fixed_footer__card-body px-4">
                    <div className="fixed_footer__card p-3 mb-3 bg-green-200 border rounded-lg">
                        <div className="row align-items-center justify-content-between">
                            <div className="col-auto">
                                <div className="row align-items-center">
                                    <div className="col">
                                        <span className="fixed_footer__card-name">{selectedTeam}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="col-auto">
                                <span className="fixed_footer__card-odds">{selectedOdds}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="fixed_footer__card-btm px-4 py-4">
                    <div className="input-group mb-3">
                        <input type="text" className="form-control" value={betAmount} onChange={handleBetAmountChange} />
                        <button className="btn btn-outline-secondary" type="button" onClick={handleMaxBet}>Max</button>
                    </div>
                    <div className="grid grid-cols-5 gap-2 mb-3">
                        {['50', '100', '250', '500', '1000', '2000', '5000'].map(amount => (
                            <button
                                key={amount}
                                className="btn btn-outline-secondary w-full"
                                onClick={() => handleBetAmountButtonClick(amount)}
                            >
                                ₹{amount}
                            </button>
                        ))}
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="d-block">Possible win:</span>
                        <span className="d-block"><b>₹{possibleWin}</b></span>
                    </div>
                    <button className="btn btn-primary w-100" onClick={handleBet}>Place Bet</button>
                    {message && <div className="alert alert-info mt-3">{message}</div>}
                </div>
            </div>
            <style jsx>{`
                .fixed_footer__card-odds {
                    font-weight: bold;
                }
                .fixed_footer__card {
                    transition: background-color 0.3s;
                }
            `}</style>
        </>
    );
}
