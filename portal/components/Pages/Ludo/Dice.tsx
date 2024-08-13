import React, { useState, useEffect } from 'react';

interface DiceProps {
    onDiceRoll: () => void;
}

const Dice: React.FC<DiceProps> = ({ onDiceRoll }) => {
    const [number, setNumber] = useState<number | null>(null);

    const rollDice = () => {
        const newNumber = Math.floor(Math.random() * 6) + 1;
        setNumber(newNumber);

        // If the rolled number is not 6, move to the next player
        if (newNumber !== 6) {
            setTimeout(() => {
                onDiceRoll();
            }, 1000); // Slight delay to show the dice result before switching
        }
    };

    useEffect(() => {
        if (number === null) {
            // Show the play dice image when it's the next player's turn
            setNumber(0);
        }
    }, [number]);

    return (
        <div className="dice" onClick={rollDice}>
            <img
                src={number === null || number === 0 ? '/images/dice-start.png' : `/images/dice-${number}.png`}
                alt={number === null || number === 0 ? 'Play Dice' : `Dice ${number}`}
                className="diceImage"
            />
        </div>
    );
};

export default Dice;
