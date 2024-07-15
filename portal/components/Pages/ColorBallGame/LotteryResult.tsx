'use client'
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { MdOutlineArrowDropDownCircle } from 'react-icons/md';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebaseConfig';
import { fetchWinningBets } from '../../../api/firestoreService';

function LotteryResult() {
  const [user, setUser] = useState<User | null>(null);
  const [winningBets, setWinningBets] = useState<any[]>([]);
  const [showBets, setShowBets] = useState(false);

  const handleShowBets = () => {
    setShowBets(!showBets);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const fetchedWinningBets = await fetchWinningBets(currentUser.uid, 'Color Ball Game');
          setWinningBets(fetchedWinningBets);
          if (!fetchedWinningBets.length) {
            console.error("No Winning Bets Found.");
          }
        } catch (error) {
          console.error('Error fetching winning bets data:', error);
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
                <th>Time</th>
                <th>Winning Combination</th>
                <th>Total Amount Won</th>
              </tr>
            </thead>
            <tbody>
              {winningBets.map((info, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{info.gameType}</td>
                  <td>{format(info.timestamp, 'dd/MM/yyyy')}</td>
                  <td>{format(info.timestamp, 'HH:mm:ss')}</td>
                  <td>{info.winningNumber || '-'} {info.winningColor || '-'}</td>
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
