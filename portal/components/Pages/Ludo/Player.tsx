// Player.tsx
import React from 'react';

interface PlayerProps {
    color: 'red' | 'green' | 'blue' | 'yellow';
    playerId: 'P1' | 'P2' | 'P3' | 'P4';
    pieceId: 'piece1' | 'piece2' | 'piece3' | 'piece4';
}

const Player: React.FC<PlayerProps> = ({ color, playerId, pieceId }) => {
    return <div className={`ludo-player ${color} ${playerId} ${pieceId}`}></div>;
};

export default Player;
