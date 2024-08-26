import React, { useState } from 'react';

interface DiceProps {
    onRoll: (value: number) => void;
}

const Dice: React.FC<DiceProps> = ({ onRoll }) => {
    const [number, setNumber] = useState<number | null>(null);
    const [isDisabled, setIsDisabled] = useState(false);

    const rollDice = () => {
        if (isDisabled) return;

        setIsDisabled(true);
        const newNumber = Math.floor(Math.random() * 6) + 1;
        setNumber(newNumber);
        onRoll(newNumber);

        setTimeout(() => {
            setIsDisabled(false);
        }, 1000);
    };

    return (
        <div className="dice" onClick={rollDice}>
            <img
                src={number === null ? '/images/dice-1.png' : `/images/dice-${number}.png`}
                alt={number === null ? 'Play Dice' : `Dice ${number}`}
                className="diceImage"
            />
        </div>
    );
};

export default Dice;
