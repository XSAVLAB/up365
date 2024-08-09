import React, { useState } from 'react';

const Dice = () => {
    // Initial state is 0 to represent the placeholder image
    const [number, setNumber] = useState(0);

    const rollDice = () => {
        const newNumber = Math.floor(Math.random() * 6) + 1;
        setNumber(newNumber);
    };

    return (
        <div className="dice" onClick={rollDice}>
            {/* Show the placeholder image if number is 0, otherwise show the dice image */}
            <img
                src={number === 0 ? '/images/dice-start.png' : `/images/dice-${number}.png`}
                alt={number === 0 ? 'Start Dice' : `Dice ${number}`}
                className="diceImage"
            />
        </div>
    );
};

export default Dice;
