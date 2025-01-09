import React from "react";
import styles from "./Player.module.css";

// Define the props type
interface PlayerProps {
  name: string;
  cards: string[];
  isRevealed: boolean;
  onReveal: () => void;
}

const Player: React.FC<PlayerProps> = ({ name, cards, isRevealed, onReveal }) => {
  return (
    <div className={styles.player}>
      <h2 className={styles.name}>{name}</h2>
      <div className={styles.cards}>
        {cards.map((card, index) => (
          <div key={index} className={styles.card}>
            {isRevealed ? (
              <img
                src={`/images/${card}.png`}
                alt={card}
                className={styles.cardImage}
              />
            ) : (
              <img
                src="/images/card-back.jpg"
                alt="Card Back"
                className={styles.cardImage}
              />
            )}
          </div>
        ))}
      </div>
      {!isRevealed && (
        <button className={styles.revealButton} onClick={onReveal}>
          Reveal Cards
        </button>
      )}
    </div>
  );
};

export default Player;
