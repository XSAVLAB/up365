'use client'
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { MdOutlineArrowDropDownCircle } from 'react-icons/md';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebaseConfig';
import { fetchAllLotteryBets } from '../../../api/firestoreService';

function AllLotteryBets() {
    const [user, setUser] = useState<User | null>(null);
    const [myBetsTable, setMyBetsTable] = useState<any[]>([]);
    const [showBets, setShowBets] = useState(false);

    const handleShowBets = () => {
        setShowBets(!showBets);
    }

    const fetchBets = async (uid: string) => {
        try {
            const fetchedBets = await fetchAllLotteryBets(uid, "Triple Digit Lottery");
            setMyBetsTable(fetchedBets);
            if (!fetchedBets.length) console.error("No Bets Found. Place Bets.");
        } catch (error) {
            console.error('Error fetching my bets data:', error);
        }
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                fetchBets(currentUser.uid);
                const interval = setInterval(() => fetchBets(currentUser.uid), 10000);
                return () => clearInterval(interval);
            } else {
                setUser(null);
            }
        });
        return () => unsubscribe();
    }, []);

    return (
        <div className="bets-table-container">
            <div onClick={handleShowBets} className="show-bets-button">
                All Bets History
                <MdOutlineArrowDropDownCircle size={30} />
            </div>
            {showBets && (
                <div className="table-responsive">
                    <table className="bets-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Game Name</th>
                                <th>Time</th>
                                <th>Bet Amount</th>
                                <th>Bet</th>
                                <th>Reward</th>
                                <th>Result</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myBetsTable.map((row, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{row.gameType}</td>
                                    <td>{row.timestamp}</td>
                                    <td>{row.betAmount}</td>
                                    <td>{row.betNumber} {row.ballColor}</td>
                                    <td>{row.rewardAmount}</td>
                                    <td>{row.winningNumber} {row.ballColor}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default AllLotteryBets;
