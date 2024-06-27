"use client"
import React, { useState } from "react";
import { ImYoutube } from "react-icons/im";
import { FaWindowClose, FaHome } from "react-icons/fa";
import { useRouter } from "next/navigation";
import useScrollToTop from "../../hooks/useScrollToTop";
import './styles.css';

const GamesCards: React.FC = () => {
  useScrollToTop();
  const [showVideo, setShowVideo] = useState(false);
  const [showVideo2, setShowVideo2] = useState(false);
  const [showVideo3, setShowVideo3] = useState(false);
  const [showVideo4, setShowVideo4] = useState(false);
  const [videoLink, setVideoLink] = useState("");
  const [videoLink2, setVideoLink2] = useState("");
  const [videoLink3, setVideoLink3] = useState("");
  const [videoLink4, setVideoLink4] = useState("");

  // Navigators
  const router = useRouter();
  const navigateToBack = () => {
    router.push("/");
  };
  const navigateToSingleDigitLotteryGame = () => {
    router.push("/login");
  };
  const navigateToDoubleDigitLotteryGame = () => {
    router.push("/login");
  };
  const navigateToTripleDigitLotteryGame = () => {
    router.push("/login");
  };
  const navigateToColorBallLotteryGame = () => {
    router.push("/login");
  };

  const handleShowVideoClick = () => {
    setShowVideo(!showVideo);
  };
  const handleShowVideo2Click = () => {
    setShowVideo2(!showVideo2);
  };
  const handleShowVideo3Click = () => {
    setShowVideo3(!showVideo3);
  };
  const handleShowVideo4Click = () => {
    setShowVideo4(!showVideo4);
  };

  const renderShowVideo = () => {
    if (!showVideo) {
      return null;
    }
    return (
      <div className="fixed-video-container">
        <div className="video-frame">
          <iframe
            title="video_1"
            className="w-full h-full"
            src={videoLink}
          ></iframe>
        </div>
        <button onClick={handleShowVideoClick} className="close-button">
          <FaWindowClose size={30} />
        </button>
      </div>
    );
  };

  const renderShowVideo2 = () => {
    if (!showVideo2) {
      return null;
    }
    return (
      <div className="fixed-video-container">
        <div className="video-frame">
          <iframe
            title="video_2"
            className="w-full h-full"
            src={videoLink2}
          ></iframe>
        </div>
        <button onClick={handleShowVideo2Click} className="close-button">
          <FaWindowClose size={30} />
        </button>
      </div>
    );
  };

  const renderShowVideo3 = () => {
    if (!showVideo3) {
      return null;
    }
    return (
      <div className="fixed-video-container">
        <div className="video-frame">
          <iframe
            title="video_3"
            className="w-full h-full"
            src={videoLink3}
          ></iframe>
        </div>
        <button onClick={handleShowVideo3Click} className="close-button">
          <FaWindowClose size={30} />
        </button>
      </div>
    );
  };

  const renderShowVideo4 = () => {
    if (!showVideo4) {
      return null;
    }
    return (
      <div className="fixed-video-container">
        <div className="video-frame">
          <iframe
            title="video_4"
            className="w-full h-full"
            src={videoLink4}
          ></iframe>
        </div>
        <button onClick={handleShowVideo4Click} className="close-button">
          <FaWindowClose size={30} />
        </button>
      </div>
    );
  };

  return (
    <div className="games-container">
      <div className="games-title">Games</div>
      <div className="games-subtitle">Lottery Games</div>
      <div className="games-grid">
        <div
          className="game-card"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("../../../public/images/ludoBgImg.webp")`,
          }}
        >
          <div className="game-card-title">Single Digit Lottery</div>
          <div onClick={handleShowVideoClick} className="game-card-subtitle">
            How to Play?
            <ImYoutube size={25} />
          </div>
          <button
            onClick={navigateToSingleDigitLotteryGame}
            className="play-now-button"
          >
            Play Now
          </button>
        </div>
        <div
          className="game-card"
          style={{
            //Pass image url here
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("/images/2DLottery2.webp")`
          }}
        >
          <div className="game-card-title">Double Digit Lottery</div>
          <div onClick={handleShowVideo2Click} className="game-card-subtitle">
            How to Play?
            <ImYoutube size={25} />
          </div>
          <button
            onClick={navigateToDoubleDigitLotteryGame}
            className="play-now-button"
          >
            Play Now
          </button>
        </div>
        <div
          className="game-card"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("../../../public/images/3DLottery3.webp")`,
          }}
        >
          <div className="game-card-title">Triple Digit Lottery</div>
          <div onClick={handleShowVideo3Click} className="game-card-subtitle">
            How to Play?
            <ImYoutube size={25} />
          </div>
          <button
            onClick={navigateToTripleDigitLotteryGame}
            className="play-now-button"
          >
            Play Now
          </button>
        </div>
        <div
          className="game-card"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("../../../public/images/colorballBg.webp")`,
          }}
        >
          <div className="game-card-title">Colour Ball Game</div>
          <div onClick={handleShowVideo4Click} className="game-card-subtitle">
            How to Play?
            <ImYoutube size={25} />
          </div>
          <button
            onClick={navigateToColorBallLotteryGame}
            className="play-now-button"
          >
            Play Now
          </button>
        </div>
      </div>

      <div className="games-subtitle">Other Games</div>
      <div className="games-grid">
        <div
          className="game-card"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("../../../public/images/ludoBgImg.webp")`,
          }}
        >
          <div className="game-card-title">Ludo: Multiplayer</div>
          <div onClick={handleShowVideoClick} className="game-card-subtitle">
            How to Play?
            <ImYoutube size={35} />
          </div>
          <button
            onClick={navigateToSingleDigitLotteryGame}
            className="play-now-button"
          >
            Play Now
          </button>
        </div>
        <div
          className="game-card"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("../../../public/images/pokerBg.webp")`,
          }}
        >
          <div className="game-card-title">Poker</div>
          <div onClick={handleShowVideoClick} className="game-card-subtitle">
            How to Play?
            <ImYoutube size={25} />
          </div>
          <button
            onClick={navigateToSingleDigitLotteryGame}
            className="play-now-button"
          >
            Play Now
          </button>
        </div>
        <div
          className="game-card"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("../../../public/images/andarBaharBg.webp")`,
          }}
        >
          <div className="game-card-title">Andar Bahar</div>
          <div onClick={handleShowVideoClick} className="game-card-subtitle">
            How to Play?
            <ImYoutube size={25} />
          </div>
          <button
            onClick={navigateToSingleDigitLotteryGame}
            className="play-now-button"
          >
            Play Now
          </button>
        </div>
        <div
          className="game-card"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("../../../public/images/snakesBg.webp")`,
          }}
        >
          <div className="game-card-title">Snakes and Ladders</div>
          <div onClick={handleShowVideoClick} className="game-card-subtitle">
            How to Play?
            <ImYoutube size={25} />
          </div>
          <button
            onClick={navigateToSingleDigitLotteryGame}
            className="play-now-button"
          >
            Play Now
          </button>
        </div>
      </div>

      <button onClick={navigateToBack} className="home-button">
        <FaHome size={30} />
      </button>

      {renderShowVideo()}
      {renderShowVideo2()}
      {renderShowVideo3()}
      {renderShowVideo4()}
    </div>
  );
};

export default GamesCards;
