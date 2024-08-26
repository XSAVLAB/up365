import React, { useState } from "react";
import Dice from "./Dice";

type PlayerId = 'P1' | 'P2' | 'P3' | 'P4';

interface Pile {
    id: string;
    position: number | null; // Position on the board; null means in the home area
    isCompleted: boolean;
}

interface Player {
    id: PlayerId;
    piles: Pile[];
}

const paths: Record<PlayerId, number[]> = {
    P1: [201, 186, 171, 156, 141, 125, 124, 123, 122, 121, 120, 105, 90, 91, 92, 93, 94, 95, 81, 66, 51, 36, 21, 6, 7, 8, 23, 38, 53, 68, 83, 99, 100, 101, 102, 103, 104, 119, 134, 133, 132, 131, 130, 129, 143, 158, 173, 188, 203, 218, 217, 202, 187, 172, 157, 142, 127],
    P2: [201, 186, 171, 156, 141, 125, 124, 123, 122, 121, 120, 105, 91, 92, 93, 94, 95, 81, 66, 51, 36, 21, 6, 7, 8, 23, 38, 53, 68, 83, 99, 100, 101, 102, 103, 104, 119, 134, 133, 132, 131, 130, 129, 143, 158, 173, 188, 203, 218, 217, 106, 107, 108, 109, 110, 111],
    P3: [201, 186, 171, 156, 141, 125, 124, 123, 122, 121, 120, 105, 91, 92, 93, 94, 95, 81, 66, 51, 36, 21, 6, 7, 23, 38, 53, 68, 83, 99, 100, 101, 102, 103, 104, 119, 134, 133, 132, 131, 130, 129, 143, 158, 173, 188, 203, 218, 217, 22, 37, 52, 67, 82, 97],
    P4: [201, 186, 171, 156, 141, 125, 124, 123, 122, 121, 120, 105, 91, 92, 93, 94, 95, 81, 66, 51, 36, 21, 6, 7, 8, 23, 38, 53, 68, 83, 99, 100, 101, 102, 103, 104, 119, 133, 132, 131, 130, 129, 143, 158, 173, 188, 203, 218, 217, 118, 117, 116, 115, 114, 113]
};

const initialPiles: Record<PlayerId, Pile[]> = {
    P1: [{ id: 'P1-1', position: 167, isCompleted: false }, { id: 'P1-2', position: 168, isCompleted: false }, { id: 'P1-3', position: 182, isCompleted: false }, { id: 'P1-4', position: 183, isCompleted: false }],
    P2: [{ id: 'P2-1', position: 32, isCompleted: false }, { id: 'P2-2', position: 33, isCompleted: false }, { id: 'P2-3', position: 47, isCompleted: false }, { id: 'P2-4', position: 48, isCompleted: false }],
    P3: [{ id: 'P3-1', position: 41, isCompleted: false }, { id: 'P3-2', position: 42, isCompleted: false }, { id: 'P3-3', position: 56, isCompleted: false }, { id: 'P3-4', position: 57, isCompleted: false }],
    P4: [{ id: 'P4-1', position: 176, isCompleted: false }, { id: 'P4-2', position: 177, isCompleted: false }, { id: 'P4-3', position: 191, isCompleted: false }, { id: 'P4-4', position: 192, isCompleted: false }],
};

const Board: React.FC = () => {
    const [players, setPlayers] = useState<Player[]>([
        { id: 'P1', piles: initialPiles.P1 },
        { id: 'P2', piles: initialPiles.P2 },
        { id: 'P3', piles: initialPiles.P3 },
        { id: 'P4', piles: initialPiles.P4 }
    ]);
    const [activePlayer, setActivePlayer] = useState<PlayerId>('P1');
    const [diceValue, setDiceValue] = useState<number | null>(null);

    const rollDice = (value: number) => {
        setDiceValue(value);
    };

    const handlePileMove = (pileId: string) => {
        const playerIndex = players.findIndex(p => p.id === activePlayer);
        const player = players[playerIndex];
        const pileIndex = player.piles.findIndex(p => p.id === pileId);
        const pile = player.piles[pileIndex];

        if (pile.position === null && diceValue === 6) {
            pile.position = paths[activePlayer][0]; // Move pile to start position
        } else if (pile.position !== null) {
            const currentIndex = paths[activePlayer].indexOf(pile.position);
            const newIndex = currentIndex + diceValue!;
            if (newIndex < paths[activePlayer].length) {
                pile.position = paths[activePlayer][newIndex];
            } else {
                pile.isCompleted = true; // Mark as completed if it reaches the end
            }
        }

        const newPlayers = [...players];
        newPlayers[playerIndex] = player;
        setPlayers(newPlayers);

        if (diceValue !== 6) {
            setActivePlayer(prevPlayer => {
                if (prevPlayer === 'P1') return 'P2';
                if (prevPlayer === 'P2') return 'P3';
                if (prevPlayer === 'P3') return 'P4';
                return 'P1';
            });
        }
    };

    return (
        <>
            <div className="controls">
                {players.map((player) => (
                    <div
                        key={player.id}
                        className={`controls ${player.id === 'P1' ? 'bottom-left' : player.id === 'P2' ? 'top-left' : player.id === 'P3' ? 'top-right' : 'bottom-right'} ${activePlayer === player.id ? 'active' : ''}`}
                    >
                        {activePlayer === player.id && <Dice onRoll={rollDice} />}
                    </div>
                ))}
            </div>

            <div className="ludoBoard-container">
                <div className="ludoBoard">
                    {Array.from({ length: 225 }).map((_, index) => (
                        <div key={index} className={`cell cell-${index}`}>
                            {players.map(player =>
                                player.piles.map(pile =>
                                    pile.position === index && !pile.isCompleted ? (
                                        <img
                                            key={pile.id}
                                            src={`/images/ludo-${player.id.toLowerCase()}.png`}
                                            alt={`${player.id} Pile`}
                                            className="player-pile"
                                            onClick={() => handlePileMove(pile.id)}
                                        />
                                    ) : null
                                )
                            )
                            }
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default Board;
