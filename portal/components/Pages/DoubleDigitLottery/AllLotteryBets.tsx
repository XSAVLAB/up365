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

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                console.log('User:', currentUser);
                try {
                    const fetchedBets = await fetchAllLotteryBets(currentUser.uid,'Double Digit Lottery');
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
                                {/* <th>Bet-ID</th> */}
                                <th>Date</th>
                                <th>Time</th>
                                {/* <th>User-ID</th> */}
                                <th>Bet Amount</th>
                                <th>Bet Number</th>
                                <th>Color</th>
                                <th>Reward</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myBetsTable.map((row, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{row.gameType}</td>
                                    {/* <td>{row.betID}</td> */}
                                    <td>{format(new Date(row.timestamp * 1000), 'dd/MM/yyyy')}</td>
                                    <td>{format(new Date(row.timestamp * 1000), 'HH:mm:ss')}</td>
                                    {/* <td>{row.userID}</td> */}
                                    <td>{row.betAmount}</td>
                                    <td>{row.betNumber}</td>
                                    <td>{row.ballColor}</td>
                                    <td>-</td>
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
