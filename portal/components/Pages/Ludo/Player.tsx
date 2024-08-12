// Player.tsx
import React from 'react';

interface PlayerProps {
    color: 'red' | 'green' | 'blue' | 'yellow';
    position: 'top-red' | 'top-green' | 'bottom-blue' | 'bottom-yellow';
}

const Player: React.FC<PlayerProps> = ({ color, position }) => {
    return <div className={`ludo-player ${color} ${position}`}></div>;
};

export default Player;
