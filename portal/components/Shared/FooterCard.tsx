"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { IconX, IconArrowBadgeUpFilled, IconTrash, IconSettings } from "@tabler/icons-react";
import { Tab } from '@headlessui/react';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDoc, doc, updateDoc, getDocs, query, where, DocumentSnapshot, DocumentData } from 'firebase/firestore';

// Define types
interface Match {
    id: string;
    dateTimeGMT: string;
    matchType: string;
    status: string;
    ms: string;
    t1: string;
    t2: string;
    t1s: string;
    t2s: string;
    t1img: string;
    t2img: string;
    series: string;
}

interface Bet {
    id: string;
    userId: string;
    team1: string;
    team2: string;
    betAmount: string;
    odds: string;
    possibleWin: string;
    selectedTeam: string;
    timestamp: string;
    matchId: string;
    settled: boolean;
}

interface User {
    wallet: string;
}

interface FooterCardProps {
    match: Match;
    isCardExpanded: boolean;
    setIsCardExpanded: (expanded: boolean) => void;
}

export default function FooterCard({ match, isCardExpanded, setIsCardExpanded }: FooterCardProps) {
    const [betAmount, setBetAmount] = useState('');
    const [possibleWin, setPossibleWin] = useState('0');
    const [balance, setBalance] = useState('0');
    const [selectedTeam, setSelectedTeam] = useState('');
    const [message, setMessage] = useState('');
    const [bets, setBets] = useState<Bet[]>([]);

    const toggleCard = () => {
        setIsCardExpanded(!isCardExpanded);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isCardExpanded && !event.target.closest(".fixed_footer")) {
                setIsCardExpanded(false);
            }
        };
        document.body.addEventListener("click", handleClickOutside);
        return () => {
            document.body.removeEventListener("click", handleClickOutside);
        };
    }, [isCardExpanded]);

    useEffect(() => {
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

    const items = ['Single'];
    const [activeItem, setActiveItem] = useState(items[0]);
    const handleClick = (itemName: string) => {
        setActiveItem(itemName);
    };
    const getItemStyle = (itemName: string) => {
        return {
            backgroundColor: activeItem === itemName ? '#0F1B42' : '#0A1436',
            cursor: 'pointer',
        };
    };

    const {
        t1img = '/images/default-team.png',
        t1 = 'Team 1',
        t2img = '/images/default-team.png',
        t2 = 'Team 2',
        id: matchId
    } = match || {};

    const t1odds = 1.50; // Example odds for Team 1
    const t2odds = 2.50; // Example odds for Team 2



    useEffect(() => {
        const selectedOdds = selectedTeam === 't1' ? t1odds : t2odds;
        if (betAmount && !isNaN(Number(betAmount))) {
            setPossibleWin((Number(betAmount) * selectedOdds).toFixed(2));
        } else {
            setPossibleWin('0');
        }
    }, [betAmount, selectedTeam, t1odds, t2odds]);

    const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBetAmount(e.target.value);
    };

    const handleBet = async () => {
        if (betAmount && !isNaN(Number(betAmount)) && selectedTeam) {
            const bet = Number(betAmount);
            const currentBalance = Number(balance);
            if (bet > currentBalance) {
                setMessage('Insufficient balance');
            } else {
                try {
                    const auth = getAuth();
                    const user = auth.currentUser;
                    if (!user) {
                        console.error('User not authenticated');
                        return;
                    }

                    const db = getFirestore();
                    const betData: Bet = {
                        id: '',
                        userId: user.uid,
                        team1: t1,
                        team2: t2,
                        betAmount: betAmount,
                        odds: selectedTeam === 't1' ? t1odds.toString() : t2odds.toString(),
                        possibleWin: possibleWin,
                        selectedTeam: selectedTeam === 't1' ? t1 : t2,
                        timestamp: new Date().toISOString(),
                        matchId: matchId,
                        settled: false
                    };

                    const betRef = await addDoc(collection(db, 'bets'), betData);
                    await updateDoc(betRef, {
                        id: betRef.id
                    });

                    const userWalletRef = doc(db, 'users', user.uid);
                    await updateDoc(userWalletRef, {
                        wallet: (currentBalance - bet).toString()
                    });

                    setBalance((currentBalance - bet).toString());
                    setMessage(`Bet of $${betAmount} placed on ${selectedTeam === 't1' ? t1 : t2}`);
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
                const q = query(collection(db, 'bets'), where('userId', '==', user.uid), where('settled', '==', false));
                const betsSnapshot = await getDocs(q);
                const userBets = betsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...(doc.data() as Bet)
                }));

                setBets(userBets);
            } catch (error) {
                console.error('Error fetching bets: ', error);
            }
        };

        fetchBets();
    }, []);

    // const settleBet = async (bet: Bet) => {
    //     try {
    //         const db = getFirestore();
    //         const matchResult = await fetch(`https://api.cricapi.com/v1/match_info?apikey=YOUR_API_KEY&unique_id=${bet.matchId}`);
    //         const resultData = await matchResult.json();

    //         let isWin = false;
    //         if (resultData.data) {
    //             const match = resultData.data;
    //             const status = match.status;
    //             let winner = '';
    //             if (status.includes('won')) {
    //                 if (status.includes(bet.team1)) {
    //                     winner = bet.team1;
    //                 } else if (status.includes(bet.team2)) {
    //                     winner = bet.team2;
    //                 }
    //             }

    //             isWin = (winner === bet.selectedTeam);
    //         }

    //         const betRef = doc(db, 'bets', bet.id);
    //         await updateDoc(betRef, {
    //             settled: true
    //         });

    //         if (isWin) {
    //             const winnings = Number(bet.possibleWin);
    //             const userWalletRef = doc(db, 'users', bet.userId);
    //             const userSnap = await getDoc(userWalletRef);
    //             const userData = userSnap.data() as User;
    //             const currentBalance = Number(userData.wallet);
    //             await updateDoc(userWalletRef, {
    //                 wallet: (currentBalance + winnings).toString()
    //             });

    //             setBalance((currentBalance + winnings).toString());
    //             setMessage(`Congratulations! You won $${winnings}`);
    //         } else {
    //             setMessage('Sorry, your bet lost.');
    //         }

    //     } catch (error) {
    //         console.error('Error settling bet: ', error);
    //     }
    // };


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
                    <Tab.Group>
                        <Tab.List className="row">
                            {items.map(item => (
                                <Tab as="div" key={item} className="col-4">
                                    {({ selected }) => (
                                        <button
                                            onClick={() => handleClick(item)}
                                            style={getItemStyle(item)}
                                            className="w-100 py-3 text-white border-0"
                                        >
                                            {item}
                                        </button>
                                    )}
                                </Tab>
                            ))}
                        </Tab.List>
                        <Tab.Panels>
                            <Tab.Panel>
                                <div className="fixed_footer__card p-3">
                                    <div className="row align-items-center justify-content-between">
                                        <div className="col-auto">
                                            <div className="row align-items-center">
                                                <div className="col-auto">
                                                    <Image src={t1img} alt="Team 1" width={30} height={30} />
                                                </div>
                                                <div className="col">
                                                    <span className="fixed_footer__card-name">{t1}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-auto">
                                            <button
                                                className={`fixed_footer__card-choice ${selectedTeam === 't1' ? 'active' : ''}`}
                                                onClick={() => setSelectedTeam('t1')}
                                                style={{
                                                    backgroundColor: selectedTeam === 't1' ? 'green' : 'gray',
                                                    color: selectedTeam === 't1' ? 'white' : 'black'
                                                }}
                                            >
                                                {t1odds}
                                            </button>
                                        </div>
                                        {/* <div className="col-auto">
                                            <button className="footfixedbtn" type="button">
                                                <IconX className="ti ti-x" />
                                            </button>
                                        </div> */}
                                    </div>
                                </div>
                                <div className="fixed_footer__card p-3">
                                    <div className="row align-items-center justify-content-between">
                                        <div className="col-auto">
                                            <div className="row align-items-center">
                                                <div className="col-auto">
                                                    <Image src={t2img} alt="Team 2" width={30} height={30} />
                                                </div>
                                                <div className="col">
                                                    <span className="fixed_footer__card-name">{t2}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-auto">
                                            <button
                                                className={`fixed_footer__card-choice ${selectedTeam === 't2' ? 'active' : ''}`}
                                                onClick={() => setSelectedTeam('t2')}
                                                style={{
                                                    backgroundColor: selectedTeam === 't2' ? 'green' : 'gray',
                                                    color: selectedTeam === 't2' ? 'white' : 'black'
                                                }}
                                            >
                                                {t2odds}
                                            </button>
                                        </div>
                                        {/* <div className="col-auto">
                                            <button className="footfixedbtn" type="button">
                                                <IconX className="ti ti-x" />
                                            </button>
                                        </div> */}
                                    </div>
                                </div>
                            </Tab.Panel>
                        </Tab.Panels>
                    </Tab.Group>
                </div>
                <div className="fixed_footer__card-btm px-4 py-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="d-block">Bet amount:</span>
                        <span className="d-block">Your balance: <b>${balance}</b></span>
                    </div>
                    <div className="input-group mb-3">
                        <input type="text" className="form-control" value={betAmount} onChange={handleBetAmountChange} />
                        <button className="btn btn-outline-secondary" type="button" onClick={handleMaxBet}>Max</button>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="d-block">Possible win:</span>
                        <span className="d-block"><b>${possibleWin}</b></span>
                    </div>
                    <button className="btn btn-primary w-100" onClick={handleBet}>Place Bet</button>
                    {message && <div className="alert alert-info mt-3">{message}</div>}
                </div>
            </div>
            {/* <div>
                {bets.map(bet => (
                    <div key={bet.id} className="bet-item">
                        <span>{bet.team1} vs {bet.team2} - Bet on {bet.selectedTeam} - Amount: ${bet.betAmount}</span>
                        <button className="btn btn-sm btn-success" onClick={() => settleBet(bet)}>Settle Bet</button>
                    </div>
                ))}
            </div> */}
        </>
    );
}
