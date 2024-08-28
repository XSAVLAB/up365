import React, { useState } from "react";
import Dice from "./Dice";

type PlayerId = 'P1' | 'P2' | 'P3' | 'P4';

interface Pile {
    id: string;
    position: number;
    isCompleted: boolean;
}

interface Player {
    id: PlayerId;
    piles: Pile[];
}

const initialPositions: Record<PlayerId, number[]> = {
    P1: [167, 168, 182, 183],
    P2: [32, 33, 47, 48],
    P3: [41, 42, 56, 57],
    P4: [176, 177, 191, 192],
};

const paths: Record<PlayerId, number[]> = {
    P1: [201, 186, 171, 156, 141, 125, 124, 123, 122, 121, 120, 105, 90, 91, 92, 93, 94, 95, 81, 66, 51, 36, 21, 6, 7, 8, 23, 38, 53, 68, 83, 99, 100, 101, 102, 103, 104, 119, 134, 133, 132, 131, 130, 129, 143, 158, 173, 188, 203, 218, 217, 202, 187, 172, 157, 142, 127],
    P2: [91, 92, 93, 94, 95, 81, 66, 51, 36, 21, 6, 7, 8, 23, 38, 53, 68, 83, 99, 100, 101, 102, 103, 104, 119, 134, 133, 132, 131, 130, 129, 143, 158, 173, 188, 203, 218, 217, 216, 201, 186, 171, 156, 141, 125, 124, 123, 122, 121, 120, 105, 106, 107, 108, 109, 110, 111],
    P3: [23, 38, 53, 68, 83, 99, 100, 101, 102, 103, 104, 119, 134, 133, 132, 131, 130, 129, 143, 158, 173, 188, 203, 218, 217, 216, 201, 186, 171, 156, 141, 125, 124, 123, 122, 121, 120, 105, 90, 91, 92, 93, 94, 95, 81, 66, 51, 36, 21, 6, 7, 22, 37, 52, 67, 82, 97],
    P4: [133, 132, 131, 130, 129, 143, 158, 173, 188, 203, 218, 217, 216, 201, 186, 171, 156, 141, 125, 124, 123, 122, 121, 120, 105, 90, 91, 92, 93, 94, 95, 81, 66, 51, 36, 21, 6, 7, 8, 23, 38, 53, 68, 83, 99, 100, 101, 102, 103, 104, 119, 118, 117, 116, 115, 114, 113]
};

const Board: React.FC = () => {
    const [players, setPlayers] = useState<Player[]>([
        { id: 'P1', piles: initialPositions.P1.map(pos => ({ id: `P1-${pos}`, position: pos, isCompleted: false })) },
        { id: 'P2', piles: initialPositions.P2.map(pos => ({ id: `P2-${pos}`, position: pos, isCompleted: false })) },
        { id: 'P3', piles: initialPositions.P3.map(pos => ({ id: `P3-${pos}`, position: pos, isCompleted: false })) },
        { id: 'P4', piles: initialPositions.P4.map(pos => ({ id: `P4-${pos}`, position: pos, isCompleted: false })) }
    ]);
    const [activePlayer, setActivePlayer] = useState<PlayerId>('P1');
    const [diceValue, setDiceValue] = useState<number | null>(null);

    const rollDice = (value: number) => {
        setDiceValue(value);
        if (value !== 6 && players.find(p => p.id === activePlayer)?.piles.every(p => initialPositions[activePlayer].includes(p.position))) {
            // No 6 and all piles are at home, pass turn
            nextPlayerTurn();
        }
    };

    const handlePileMove = (pileId: string) => {
        const playerIndex = players.findIndex(p => p.id === activePlayer);
        const player = players[playerIndex];
        const pileIndex = player.piles.findIndex(p => p.id === pileId);
        const pile = player.piles[pileIndex];

        if (initialPositions[activePlayer].includes(pile.position) && diceValue !== 6) {
            // If the pile is in home position and dice is not 6, it cannot move
            return;
        }

        // Move pile out of home
        if (initialPositions[activePlayer].includes(pile.position) && diceValue === 6) {
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
            nextPlayerTurn();
        }

        setDiceValue(null); // Reset dice value after move
    };

    const nextPlayerTurn = () => {
        setActivePlayer(prevPlayer => {
            if (prevPlayer === 'P1') return 'P2';
            if (prevPlayer === 'P2') return 'P3';
            if (prevPlayer === 'P3') return 'P4';
            return 'P1';
        });
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
                                            onClick={() => diceValue === 6 || !initialPositions[activePlayer].includes(pile.position) ? handlePileMove(pile.id) : null}
                                        />
                                    ) : null
                                )
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default Board;
