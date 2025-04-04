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

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        const unsubscribeBets = fetchWinningBets(
          currentUser.uid,
          "Color Ball Game",
          (fetchedWinningBets: React.SetStateAction<any[]>) => {
            setWinningBets(fetchedWinningBets);
          },
          (error: any) => {
            console.error('Error fetching winning bets data:', error);
          }
        );
        return () => {
          unsubscribeBets();
        };
      } else {
        setUser(null);
        setWinningBets([]);
      }
    });

    return () => unsubscribeAuth();
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
