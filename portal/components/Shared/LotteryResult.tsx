'use client'
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { MdOutlineArrowDropDownCircle } from 'react-icons/md';
import { fetchWinningBets } from '../../api/firestoreService';

function LotterResult() {
  const [winningBets, setWinningBets] = useState<any[]>([]);
  const [showBets, setShowBets] = useState(false);

  const handleShowBets = () => {
    setShowBets(!showBets);
  };

  useEffect(() => {
    const fetchBetsData = async () => {
      try {
        const fetchedWinningBets = await fetchWinningBets();
        setWinningBets(fetchedWinningBets);
        if (!fetchedWinningBets.length) {
          console.error("No Winning Bets Found.");
        }
      } catch (error) {
        console.error('Error fetching winning bets data:', error);
      }
    };
    fetchBetsData();
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
                <th>Winning Number</th>
                <th>Winning Color</th>
                <th>Number of Winners</th>
                <th>Total Amount Won</th>
              </tr>
            </thead>
            <tbody>
              {winningBets.map((info, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{info.gameType}</td>
                  <td>{info.winningNumber || '-'}</td>
                  <td>{info.winningColor || '-'}</td>
                  <td>{info.winners || '-'}</td>
                  <td>{info.totalWon || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default LotterResult;
