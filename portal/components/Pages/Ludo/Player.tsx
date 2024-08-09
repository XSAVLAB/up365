import React from 'react';

interface PlayerProps {
    color: string;
    position: number;
}

const Player: React.FC<PlayerProps> = ({ color, position }) => {
    const positions = [
        { top: '10%', left: '10%' }, // Example positions
        { top: '10%', left: '20%' },
        // Add more positions corresponding to the Ludo board
    ];

    const style = {
        backgroundColor: color,
        position: 'absolute' as 'absolute',
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        ...positions[position]
    };

    return <div style={style}></div>;
};

export default Player;
