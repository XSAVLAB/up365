import React, { useState } from 'react';
import Dice from './Dice';
import Player from './Player';

const Board = () => {
    const [activePlayer, setActivePlayer] = useState<'P1' | 'P2' | 'P3' | 'P4'>('P1');

    const handleNextPlayer = () => {
        setActivePlayer((prevPlayer) => {
            switch (prevPlayer) {
                case 'P1': return 'P2';
                case 'P2': return 'P3';
                case 'P3': return 'P4';
                case 'P4': return 'P1';
                default: return 'P1';
            }
        });
    };

    return (
        <div className="ludoBoard">
            <div className="boardImage">
                <img src="/images/ludo-board.jpg" alt="Ludo Board" />

                {/* Controls for each player */}
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

                {/* Players */}
                {/* Red Home */}
                <Player color="blue" playerId='P1' pieceId='piece1' />
                <Player color="blue" playerId='P1' pieceId='piece2' />
                <Player color="blue" playerId='P1' pieceId='piece3' />
                <Player color="blue" playerId='P1' pieceId='piece4' />

                {/* Green Home */}
                <Player color="red" playerId='P2' pieceId='piece1' />
                <Player color="red" playerId='P2' pieceId='piece2' />
                <Player color="red" playerId='P2' pieceId='piece3' />
                <Player color="red" playerId='P2' pieceId='piece4' />

                {/* Yellow Home */}
                <Player color="green" playerId='P3' pieceId='piece1' />
                <Player color="green" playerId='P3' pieceId='piece2' />
                <Player color="green" playerId='P3' pieceId='piece3' />
                <Player color="green" playerId='P3' pieceId='piece4' />

                {/* Blue Home */}
                <Player color="yellow" playerId='P4' pieceId='piece1' />
                <Player color="yellow" playerId='P4' pieceId='piece2' />
                <Player color="yellow" playerId='P4' pieceId='piece3' />
                <Player color="yellow" playerId='P4' pieceId='piece4' />
            </div>
        </div>
    );
};

export default Board;
