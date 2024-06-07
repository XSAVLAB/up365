"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { IconX, IconArrowBadgeUpFilled, IconTrash, IconSettings } from "@tabler/icons-react";
import { Tab } from '@headlessui/react';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDoc, doc, updateDoc } from 'firebase/firestore';

export default function FooterCard({ match, isCardExpanded, setIsCardExpanded }) {
    const [betAmount, setBetAmount] = useState('');
    const [possibleWin, setPossibleWin] = useState('0');
    const [balance, setBalance] = useState('0');
    const [selectedTeam, setSelectedTeam] = useState('');
    const [message, setMessage] = useState('');

    const toggleCard = () => {
        setIsCardExpanded(!isCardExpanded);
    };

    useEffect(() => {
        const handleClickOutside = (event: { target: { closest: (arg0: string) => any; }; }) => {
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
                        setBalance(docSnap.data().wallet);
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

    const items = ['Single', 'Multiple', 'System'];
    const [activeItem, setActiveItem] = useState(items[0]);
    const handleClick = (itemName: React.SetStateAction<string>) => {
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
        t1probability = 0.5,
        t2probability = 0.5
    } = match || {};

    const t1odds = (1 / t1probability).toFixed(2);
    const t2odds = (1 / t2probability).toFixed(2);

    useEffect(() => {
        const selectedOdds = selectedTeam === 't1' ? t1odds : t2odds;
        if (betAmount && !isNaN(Number(betAmount))) {
            setPossibleWin((Number(betAmount) * Number(selectedOdds)).toFixed(2));
        } else {
            setPossibleWin('0');
        }
    }, [betAmount, selectedTeam, t1odds, t2odds]);

    const handleBetAmountChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {
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
                    const betData = {
                        userId: user.uid,
                        team1: t1,
                        team2: t2,
                        betAmount: betAmount,
                        odds: selectedTeam === t1 ? t1odds : t2odds,
                        possibleWin: possibleWin,
                        selectedTeam: selectedTeam === 't1' ? t1 : t2,
                        timestamp: new Date().toISOString()
                    };

                    await addDoc(collection(db, 'bets'), betData);
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
        setBetAmount('100');
    };

    return (
        <>
            <div className={`fixed_footer p3-bg rounded-5 ${isCardExpanded ? "expandedtexta" : "expanded2"}`}>
                <div className="fixed_footer__head py-3 px-4">
                    <div className="d-flex justify-content-between">
                        <div className="fixed_footer__head-betslip d-flex align-items-center gap-2">
                            <span className="fw-bold">Betslip</span>
                            <span className="fixed_footer__head-n1">1</span>
                            <button onClick={toggleCard} className="footfixedbtn" type="button">
                                <IconArrowBadgeUpFilled className="ti ti-arrow-badge-down-filled n5-color fs-four fixediconstyle" />
                            </button>
                        </div>
                        <div className="fixed_footer__head-quickbet d-flex align-items-center gap-1">
                            <span className="fw-bold">Betslip Bet</span>
                            <input type="checkbox" id="switch" /><label>Toggle</label>
                        </div>
                    </div>
                </div>
                <div className="fixed_footer__content position-relative">
                    <Tab.Group>
                        <Tab.List className="tab-list">
                            {items.map((item) => (
                                <Tab className="tab-item"
                                    key={item}
                                    onClick={() => handleClick(item)}
                                    style={getItemStyle(item)}
                                >
                                    <span className="tab-trigger cpoint">{item}</span>
                                </Tab>
                            ))}
                        </Tab.List>
                        <Tab.Panels className="tab-container n11-bg">
                            <Tab.Panel className="">
                                <div className="fixed_footer__content-live px-4 py-5 mb-5">
                                    <div className="d-flex align-items-center justify-content-between mb-4">
                                        <div className="d-flex align-content-center gap-1">
                                            <Image src={t1img} width={20} height={20} alt="Icon" />
                                            <span className="fs-seven cpoint">{t1}</span>
                                            <span className="fs-seven">vs.</span>
                                            <span className="fs-seven cpoint">{t2}</span>
                                        </div>
                                        <span className="r1-color fs-seven">Live</span>
                                        <IconX className="ti ti-x n4-color cpoint" onClick={toggleCard} />
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="fixed_footer__content-scr py-1 px-2 fs-seven">{selectedTeam === 't1' ? t1odds : t2odds}</span>
                                        <div>
                                            <span className="fs-seven d-block"> Over 132.5</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="fixed_footer__content-formarea px-4">
                                    <form>
                                        <div className="border-four d-flex align-items-center justify-content-between pe-2 rounded-3 mb-4">
                                            <input
                                                placeholder="Bet amount"
                                                className="place-style"
                                                type="text"
                                                value={betAmount}
                                                onChange={handleBetAmountChange}
                                            />
                                            <button
                                                className="cmn-btn p-1 fs-seven fw-normal"
                                                type="button"
                                                onClick={handleMaxBet}
                                            >
                                                Max
                                            </button>
                                        </div>
                                        <div className="fixed_footer__content-selectteam d-flex align-items-center justify-content-between mb-4">
                                            <button
                                                type="button"
                                                className={`fs-seven cpoint py-1 px-4 border-four rounded-2 clickable-active ${selectedTeam === 't1' ? 'active' : ''}`}
                                                onClick={() => setSelectedTeam('t1')}
                                            >
                                                {t1}
                                            </button>
                                            <button
                                                type="button"
                                                className={`fs-seven cpoint py-1 px-4 border-four rounded-2 clickable-active ${selectedTeam === 't2' ? 'active' : ''}`}
                                                onClick={() => setSelectedTeam('t2')}
                                            >
                                                {t2}
                                            </button>
                                        </div>
                                        <div className="fixed_footer__content-possible d-flex align-items-center justify-content-between gap-2 mb-7">
                                            <span className="fs-seven">Possible win</span>
                                            <span className="fs-seven fw-bold">${possibleWin}</span>
                                        </div>
                                        <button
                                            type="button"
                                            className="cmn-btn px-5 py-3 w-100 mb-4"
                                            onClick={handleBet}
                                        >
                                            Place Bet
                                        </button>
                                        <button type="button" className="cmn-btn third-alt px-5 py-3 w-100 mb-6">Book</button>
                                    </form>
                                    {message && <div className="message">{message}</div>}
                                </div>
                                <div className="fixed_footer__content-bottom d-flex align-items-center justify-content-between">
                                    <div className="right-border d-flex align-items-center gap-2">
                                        <IconTrash height={20} width={20} className="ti ti-trash n3-color fs-five cpoint" />
                                        <Link href="#" className="n3-color fs-seven">Sign In & Bet</Link>
                                    </div>
                                    <div className="right-border2 d-flex align-items-center justify-content-end gap-2">
                                        <IconSettings height={20} width={20} className="ti ti-settings n3-color fs-five cpoint" />
                                        <Link href="#" className="n3-color fs-seven">Settings</Link>
                                    </div>
                                </div>
                            </Tab.Panel>

                        </Tab.Panels>
                    </Tab.Group>
                </div>
            </div>
        </>
    );
}
