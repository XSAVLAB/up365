'use client'
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { MdOutlineArrowDropDownCircle } from 'react-icons/md';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebaseConfig';
import { fetchLotteryBets } from '../../../api/firestoreService';

function ActiveLotteryBets() {
    const [user, setUser] = useState<User | null>(null);
    const [myBetsTable, setMyBetsTable] = useState<any[]>([]);
    const [showBets, setShowBets] = useState(false);

    const handleShowBets = () => {
        setShowBets(!showBets);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);

                const betsUnsubscribe = fetchLotteryBets(currentUser.uid, "Triple Digit Lottery", (updatedBets: React.SetStateAction<any[]>) => {
                    setMyBetsTable(updatedBets);
                });

                return () => {
                    betsUnsubscribe();
                };
            } else {
                setUser(null);
                setMyBetsTable([]);
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="bets-table-container">
            <div onClick={handleShowBets} className="show-bets-button">
                Active Bets
                <MdOutlineArrowDropDownCircle size={30} />
            </div>
            {showBets && (
                <div className="table-responsive">
                    <table className="bets-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Game Name</th>
                                <th>Date</th>
                                <th>Bet Amount</th>
                                <th>Bet Number</th>
                                <th>Reward</th>
                                <th>Result</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myBetsTable.map((row, index) => {
                                const date = row.timestamp;
                                return (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{row.gameType}</td>
                                        <td>{row.timestamp}</td>
                                        <td>{row.betAmount}</td>
                                        <td>{row.betNumber}</td>
                                        <td>{row.rewardAmount}</td>
                                        <td>{row.winningNumber}</td>
                                    </tr>
                                );
                            })}
                            <tr>
                                <td>-</td>
                                <td>-</td>
                                <td>-</td>
                                <td>-</td>
                                <td>-</td>
                                <td>-</td>
                                <td>-</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default ActiveLotteryBets;
