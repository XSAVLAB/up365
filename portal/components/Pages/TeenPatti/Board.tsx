'use client';
import React, { useState } from "react";
import styles from "./Board.module.css";
import Player from "./Player";
import { dealCards } from "../../../utils/cardUtils";

// Define the types for a Player
interface PlayerType {
  name: string;
  cards: string[]; // Adjust this based on your card format (e.g., number[], Card[], etc.)
}

const Board: React.FC = () => {
  // State for players
  const [players, setPlayers] = useState<PlayerType[]>([
    { name: "Player 1", cards: [] },
    { name: "Player 2", cards: [] },
    { name: "Player 3", cards: [] },
    { name: "Player 4", cards: [] },
    { name: "Player 5", cards: [] },
  ]);

  // State for card reveal statuses
  const [revealed, setRevealed] = useState<boolean[]>(
    players.map(() => false)
  );

  // Handle dealing cards
  const handleDealCards = () => {
    const dealtCards: string[][] = dealCards(players.length); // Adjust type if dealCards returns a different structure
    setPlayers((prevPlayers) =>
      prevPlayers.map((player, index) => ({
        ...player,
        cards: dealtCards[index],
      }))
    );
  };

  // Handle card reveal for a specific player
  const handleReveal = (index: number) => {
    setRevealed((prev) => {
      const newRevealed = [...prev];
      newRevealed[index] = true;
      return newRevealed;
    });
  };

  return (
    <div className={styles.board}>
      <div className={styles.table}>
        {players.map((player, index) => (
          <div
            key={index}
            className={`${styles.player} ${styles[`player${index + 1}`]}`}
          >
            <Player
              name={player.name}
              cards={player.cards}
              isRevealed={revealed[index]}
              onReveal={() => handleReveal(index)}
            />
          </div>
        ))}
        <button onClick={handleDealCards} className={styles.dealButton}>
          Deal Cards
        </button>
      </div>
    </div>
  );
};

export default Board;
