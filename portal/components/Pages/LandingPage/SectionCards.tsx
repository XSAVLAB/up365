import React, { useState } from 'react';

const games = [
    { name: 'Cricket', image: '/images/cricket-banner.jpg', playUrl: '/login' },
    { name: 'Other Games', image: '/images/single-digit-lottery.jpg', playUrl: '/login' },
];

const SectionCards = () => {

    const handlePlayClick = (playUrl: string) => {
        window.location.href = playUrl;
    };

    return (
        <div className="game-cards-container">
            {games.map((game, index) => (
                <div className="section-card" key={index} style={{ backgroundImage: `url(${game.image})` }} onClick={() => handlePlayClick(game.playUrl)}>
                    <div className="section-card-content" >
                        <h3>{game.name}</h3>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SectionCards;
