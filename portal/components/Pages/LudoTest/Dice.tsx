import React, { useState } from 'react';

interface DiceProps {
    onDiceRoll: (rolledSix: boolean) => void;
}

const Dice: React.FC<DiceProps> = ({ onDiceRoll }) => {
    const [number, setNumber] = useState<number | null>(null);
    const [isDisabled, setIsDisabled] = useState(false);

    const rollDice = () => {
        if (isDisabled) return;

        setIsDisabled(true);
        const newNumber = Math.floor(Math.random() * 6) + 1;
        setNumber(newNumber);

        if (newNumber === 6) {
            setTimeout(() => {
                setIsDisabled(false);
            }, 1000);
        } else {
            setTimeout(() => {
                onDiceRoll(false);
                setIsDisabled(false);
            }, 1000);
        }
    };

    return (
        <div className="dice" onClick={rollDice}>
            <img
                src={number === null || number === 0 ? '/images/dice-1.png' : `/images/dice-${number}.png`}
                alt={number === null || number === 0 ? 'Play Dice' : `Dice ${number}`}
                className="diceImage"
            />
        </div>
    );
};

export default Dice;
