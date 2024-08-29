'use client'
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { MdOutlineArrowDropDownCircle } from 'react-icons/md';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebaseConfig';
import { fetchWinningBets } from '../../../api/firestoreService';

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

function LotteryResult() {
  const [user, setUser] = useState<User | null>(null);
  const [winningBets, setWinningBets] = useState<any[]>([]);
  const [showBets, setShowBets] = useState(false);

  const handleShowBets = () => {
    setShowBets(!showBets);
  };

  const fetchBets = async (uid: string) => {
    try {
      const fetchedWinningBets = await fetchWinningBets(uid, 'Color Ball Game');
      setWinningBets(fetchedWinningBets);

    } catch (error) {
      console.error('Error fetching winning bets data:', error);
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
        Winning Bets History
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
                <th>Winning Combination</th>
                <th>Total Amount Won</th>
              </tr>
            </thead>
            <tbody>
              {winningBets.map((info, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{info.gameType}</td>
                  <td>{info.timestamp}</td>
                  <td>
                    {info.winningNumber || '-'} <ColorBall color={info.winningColor || 'transparent'} />
                  </td>
                  <td>{info.rewardAmount || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default LotteryResult;
