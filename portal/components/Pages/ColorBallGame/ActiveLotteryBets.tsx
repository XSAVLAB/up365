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
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                try {
                    const fetchedBets = await fetchLotteryBets(currentUser.uid, 'Color Ball Game');
                    setMyBetsTable(fetchedBets);
                    if (!fetchedBets.length) console.error("No Bets Found. Place Bets.");
                } catch (error) {
                    console.error('Error fetching my bets data:', error);
                }
            } else {
                setUser(null);
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
                                {/* <th>Bet-ID</th> */}
                                <th>Game Name</th>
                                <th>Date</th>
                                <th>Time</th>
                                {/* <th>User-ID</th> */}
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
                                        {/* <td>{row.betID}</td> */}
                                        <td>{row.gameType}</td>
                                        <td>{format(date, 'dd/MM/yyyy')}</td>
                                        <td>{format(date, 'HH:mm:ss')}</td>
                                        {/* <td>{row.userID}</td> */}
                                        <td>{row.betAmount}</td>
                                        <td>{row.betNumber} & {row.ballColor}</td>
                                        <td>{row.rewardAmount}</td>
                                        <td>{row.winningNumber} & {row.winningColor}</td>
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
