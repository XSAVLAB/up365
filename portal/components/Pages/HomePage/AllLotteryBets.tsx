'use client'
import React, { useState, useEffect } from 'react';
import { MdOutlineArrowDropDownCircle } from 'react-icons/md';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebaseConfig';
import { fetchAllLotteryBetsHome } from '../../../api/firestoreService';

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

function AllLotteryBets() {
    const [user, setUser] = useState<User | null>(null);
    const [myBetsTable, setMyBetsTable] = useState<any[]>([]);
    const [showBets, setShowBets] = useState(false);

    const handleShowBets = () => {
        setShowBets(!showBets);
    }

    const fetchBets = async (uid: string) => {
        try {
            const fetchedBets = await fetchAllLotteryBetsHome(uid);
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
        <div className="bets-table-container-home">
            {/* <div onClick={handleShowBets} className="show-bets-button">
                All Bets History
                <MdOutlineArrowDropDownCircle size={30} />
            </div>
            {showBets && ( */}
            <div className="table-responsive">
                <table className="bets-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Game Name</th>
                            <th>Date</th>
                            <th>Bet Amount</th>
                            <th>Bet</th>
                            <th>Reward</th>
                            <th>Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        {myBetsTable.slice(0, 10).map((row, index) => (
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
                                    {row.winningNumber} <ColorBall color={row.winningColor} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* )} */}
        </div>
    );
}

export default AllLotteryBets;
