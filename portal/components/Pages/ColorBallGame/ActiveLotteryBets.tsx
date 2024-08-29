'use client'
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { MdOutlineArrowDropDownCircle } from 'react-icons/md';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebaseConfig';
import { fetchLotteryBets } from '../../../api/firestoreService';

const colorMapping: { [key: string]: string } = {
    'Red': 'red',
    'Blue': 'blue',
    'Green': 'green',
    'Yellow': 'yellow',
    'Purple': 'purple',
};

function ColorBall({ color }: { color: string }) {
    const colorCode = colorMapping[color] || 'transparent';
    return (
        <div
            style={{
                backgroundColor: colorCode,
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'inline-block',
                verticalAlign: 'middle',
            }}
        ></div>
    );
}

function ActiveLotteryBets() {
    const [user, setUser] = useState<User | null>(null);
    const [myBetsTable, setMyBetsTable] = useState<any[]>([]);
    const [showBets, setShowBets] = useState(false);

    const handleShowBets = () => {
        setShowBets(!showBets);
    }

    const fetchBets = async (uid: string) => {
        try {
            const fetchedBets = await fetchLotteryBets(uid, 'Color Ball Game');
            setMyBetsTable(fetchedBets);

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
                                        <td>
                                            {row.betNumber} <ColorBall color={row.ballColor} />
                                        </td>
                                        <td>{row.rewardAmount}</td>
                                        <td>
                                            {row.winningNumber}  <ColorBall color={row.winningColor} />
                                        </td>
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
