import React, { useState } from 'react';

const games = [
    { name: 'Aviator', image: '/images/aviator-plane.jpg', video: "https://www.youtube.com/embed/sT1FEs2j120?si=MFnIhark0ZbnY8LW", playUrl: '/login' },
    { name: 'Single Digit Lottery', image: '/images/single-digit-lottery.jpg', video: "https://www.youtube.com/embed/sT1FEs2j120?si=MFnIhark0ZbnY8LW", playUrl: '/login' },
    { name: 'Double Digit Lottery', image: '/images/double-digit-lottery.jpg', video: "https://www.youtube.com/embed/fqFtA7bkrp4?si=dNIA52HpLN3aUmZE", playUrl: '/login' },
    { name: 'Triple Digit Lottery', image: '/images/triple-digit-lottery.jpg', video: "https://www.youtube.com/embed/cQITIWkjphY?si=zIfp0XM09CVMkb7K", playUrl: '/login' },
    { name: 'Color Ball Lottery', image: '/images/color-ball-game.jpg', video: "https://www.youtube.com/embed/D8zpUhe3r5g?si=-ij1sUn64CVDRBdX", playUrl: '/login' },
    { name: 'Ludo', image: '/images/ludo.jpg', video: "https://www.youtube.com/embed/qcJFkx5NDWM?si=1Va946zPG1Ts1iXD&amp;controls=0", playUrl: '/login' },
    { name: 'Teen Patti', image: '/images/teen-patti.jpg', video: "https://www.youtube.com/embed/qcJFkx5NDWM?si=1Va946zPG1Ts1iXD&amp;controls=0", playUrl: '/login' },
    { name: 'Poker', image: '/images/poker.jpg', video: "https://www.youtube.com/embed/qcJFkx5NDWM?si=1Va946zPG1Ts1iXD&amp;controls=0", playUrl: '/login' },
    { name: 'Andar Bahar', image: '/images/andar-bahar.jpg', video: "https://www.youtube.com/embed/qcJFkx5NDWM?si=1Va946zPG1Ts1iXD&amp;controls=0", playUrl: '/login' },
];

const GameCards = () => {
    const [showModal, setShowModal] = useState(false);
    const [currentVideo, setCurrentVideo] = useState('');

    const handlePlayClick = (playUrl: string) => {
        window.location.href = playUrl;
    };

    const handleHowToPlayClick = (video: string) => {
        setCurrentVideo(video);
        setShowModal(true);
    };

    const handleClose = () => {
        setShowModal(false);
        setCurrentVideo('');
    };

    return (
        <div className="game-cards-container">
            {games.map((game, index) => (
                <div className="game-card" key={index} style={{ backgroundImage: `url(${game.image})` }} onClick={() => handlePlayClick(game.playUrl)}>
                    <div className="game-card-content" >
                        <h3>{game.name}</h3>
                        {/* <button onClick={() => handlePlayClick(game.playUrl)}>Play</button> */}
                        <button onClick={() => handleHowToPlayClick(game.video)}>How to Play?</button>
                    </div>
                </div>
            ))}
            {showModal && (
                <div className="modal-backdrop" onClick={handleClose}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-button" onClick={handleClose}>
                            &times;
                        </button>
                        <iframe
                            width="100%"
                            height="315"
                            src={currentVideo}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GameCards;
