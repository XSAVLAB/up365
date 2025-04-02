import React, { useState } from 'react';

const games = [
    { name: 'Cricket', image: '/images/cricket-banner.jpeg', video: "https://www.youtube.com/embed/sT1FEs2j120?si=MFnIhark0ZbnY8LW", playUrl: '/cricket' },
    { name: 'Other Games', image: '/images/single-digit-lottery.jpg', video: "https://www.youtube.com/embed/sT1FEs2j120?si=MFnIhark0ZbnY8LW", playUrl: '/games' },
];

const SectionCards = () => {

    const handlePlayClick = (playUrl: string) => {
        window.location.href = playUrl;
    };

    return (
        <div className="game-cards-container">
            {games.map((game, index) => (
                <div className="section-card" key={index} style={{ backgroundImage: `url(${game.image})` }} onClick={() => handlePlayClick(game.playUrl)}>
                    {/* <div className="section-card-content" >
                        <h3>{game.name}</h3>
                    </div> */}
                </div>
            ))}
        </div>
    );
};

export default SectionCards;
