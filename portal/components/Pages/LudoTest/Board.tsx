import React, { useState } from "react";
import Dice from "./Dice"; // Assuming you have a Dice component

const Board: React.FC = () => {
    const [activePlayer, setActivePlayer] = useState('P1');
    const cells = Array.from({ length: 225 });

    // Function to handle moving to the next player
    const handleNextPlayer = (rolledSix: boolean) => {
        if (rolledSix) return; // If the player rolled a 6, keep the same player

        setActivePlayer(prevPlayer => {
            if (prevPlayer === 'P1') return 'P2';
            if (prevPlayer === 'P2') return 'P3';
            if (prevPlayer === 'P3') return 'P4';
            return 'P1';
        });
    };

    return (
        <>
            {/* Player Controls */}
            <div className="controls">

                <div className={`controls bottom-left ${activePlayer === 'P1' ? 'active' : ''}`}>
                    {activePlayer === 'P1' && <Dice onDiceRoll={handleNextPlayer} />}
                </div>
                <div className={`controls top-left ${activePlayer === 'P2' ? 'active' : ''}`}>
                    {activePlayer === 'P2' && <Dice onDiceRoll={handleNextPlayer} />}
                </div>
                <div className={`controls top-right ${activePlayer === 'P3' ? 'active' : ''}`}>
                    {activePlayer === 'P3' && <Dice onDiceRoll={handleNextPlayer} />}
                </div>
                <div className={`controls bottom-right ${activePlayer === 'P4' ? 'active' : ''}`}>
                    {activePlayer === 'P4' && <Dice onDiceRoll={handleNextPlayer} />}
                </div>
            </div>
            {/* Ludo Board */}
            <div className="ludoBoard-container">
                <div className="ludoBoard">
                    {cells.map((_, index) => (
                        <div key={index} className={`cell cell-${index}`}>
                            {index === 32 || index === 33 || index === 47 || index === 48 ? (
                                <img src="/images/ludo-red.png" alt="Red Pile" className="player-pile" />
                            ) : null}
                            {index === 41 || index === 42 || index === 56 || index === 57 ? (
                                <img src="/images/ludo-green.png" alt="Green Pile" className="player-pile" />
                            ) : null}
                            {index === 167 || index === 168 || index === 182 || index === 183 ? (
                                <img src="/images/ludo-yellow.png" alt="Yellow Pile" className="player-pile" />
                            ) : null}
                            {index === 176 || index === 177 || index === 191 || index === 192 ? (
                                <img src="/images/ludo-blue.png" alt="Blue Pile" className="player-pile" />
                            ) : null}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default Board;
