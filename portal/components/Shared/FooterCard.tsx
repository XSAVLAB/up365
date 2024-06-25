import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { IconArrowBadgeUpFilled } from "@tabler/icons-react";
import { Tab } from '@headlessui/react';
import { getAuth } from 'firebase/auth';
import { fetchUserWallet, placeBet, fetchUserBets } from '../../api/firestoreService';
import { stat } from 'fs';

interface Match {
    seriesName: string;
    dateTime: string;
    team1: string;
    team2: string;
    team1Img: string;
    team2Img: string;
    matchType: string;
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
    status: string;
    settled: boolean;
    betType: string;
    blockNumber: number;
    tableType: string;
    seriesName: string;
    matchType: string;
}

interface User {
    wallet: string;
}

interface FooterCardProps {
    match: Match;
    isCardExpanded: boolean;
    setIsCardExpanded: (expanded: boolean) => void;
    selectedTeam: string;
    selectedOdds: string;
    betType: string;
    blockNumber: number;
    tableType: string;
}

export default function FooterCard({ match, isCardExpanded, setIsCardExpanded, selectedTeam, selectedOdds, betType, blockNumber, tableType }: FooterCardProps) {
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
        const fetchBalance = async () => {
            try {
                const auth = getAuth();
                const user = auth.currentUser;
                if (user) {
                    const wallet = await fetchUserWallet(user.uid);
                    setBalance(wallet);
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
                    const betData = {
                        id: '',
                        userId: user.uid,
                        betAmount,
                        possibleWin,
                        selectedTeam,
                        team1: match.team1,
                        team2: match.team2,
                        status: 'pending',
                        selectedOdds,
                        matchId: match.seriesName,
                        currentBalance,
                        betType,
                        blockNumber,
                        tableType,
                        seriesName: match.seriesName,
                        matchType: match.matchType
                    };

                    const betMessage = await placeBet(betData);
                    setBalance((currentBalance - bet).toString());
                    setMessage(betMessage);
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

                const userBets = await fetchUserBets(user.uid);
                setBets(userBets as Bet[]);
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
                    <Tab.Group>
                        <Tab.Panels>
                            <Tab.Panel>
                                {selectedTeam === 'team1' && (
                                    <div className="fixed_footer__card p-3 mb-3 bg-green-200 border rounded-lg">
                                        <div className="row align-items-center justify-content-between">
                                            <div className="col-auto">
                                                <div className="row align-items-center">
                                                    <div className="col-auto">
                                                        <Image src={match.team1Img} alt="" width={30} height={30} />
                                                    </div>
                                                    <div className="col">
                                                        <span className="fixed_footer__card-name">{match.team1}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-auto">
                                                <span className="fixed_footer__card-odds">{selectedOdds}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {selectedTeam === 'team2' && (
                                    <div className="fixed_footer__card p-3 mb-3 bg-green-200 border rounded-lg">
                                        <div className="row align-items-center justify-content-between">
                                            <div className="col-auto">
                                                <div className="row align-items-center">
                                                    <div className="col-auto">
                                                        <Image src={match.team2Img} alt="" width={30} height={30} />
                                                    </div>
                                                    <div className="col">
                                                        <span className="fixed_footer__card-name bold">{match.team2}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-auto">
                                                <span className="fixed_footer__card-odds">{selectedOdds}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
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
                    <div className="grid grid-cols-5 gap-2 mb-3">
                        {['50', '100', '250', '500', '1000', '2000', '5000'].map(amount => (
                            <button
                                key={amount}
                                className="btn btn-outline-secondary w-full"
                                onClick={() => handleBetAmountButtonClick(amount)}
                            >
                                ${amount}
                            </button>
                        ))}
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="d-block">Possible win:</span>
                        <span className="d-block"><b>${possibleWin}</b></span>
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
