"use client"
import React from "react";
import { FaGamepad } from "react-icons/fa";
import { AiFillHome } from "react-icons/ai";
import { BiSolidOffer } from "react-icons/bi";
import { MdFiberNew } from "react-icons/md";
import { GiWallet, GiCoins } from "react-icons/gi";
import { useRouter } from "next/navigation";
import './styles.css'; // Import the custom CSS file
import { IconBallFootball, IconCricket } from "@tabler/icons-react";

interface MainBodyScrollerProps {
  scrollToGames: () => void;
}

const MainBodyScroller: React.FC<MainBodyScrollerProps> = ({ scrollToGames }) => {
  const router = useRouter();
  const navigateHomePage = () => {
    router.push("/");
  };
  const navigateGamesPage = () => {
    scrollToGames();
  };
  const navigateLoginPage = () => {
    router.push("/login");
  };

  const navigateCricketPage = () => {
    router.push("/cricket");
  }
  const navigateFootballPage = () => {
    router.push("/soccer");
  }

  return (
    <nav className="main-body-scroller">
      <div className="container">
        <div className="nav-items">
          <div className="nav-item" onClick={navigateHomePage}>
            <AiFillHome size={25} />
            <span>Home</span>
          </div>
          <div className="nav-item" onClick={navigateGamesPage}>
            <FaGamepad size={25} />
            <span>Games</span>
          </div>
          <div className="nav-item" onClick={navigateLoginPage}>
            <GiCoins size={25} />
            <span>Casino</span>
          </div>
          <div className="nav-item" onClick={navigateCricketPage}>
            <IconCricket size={25} />
            <span>Cricket</span>
          </div>
          <div className="nav-item" onClick={navigateFootballPage}>
            <IconBallFootball size={25} />
            <span>Football</span>
          </div>
          <div className="nav-item" onClick={navigateLoginPage}>
            <BiSolidOffer size={25} />
            <span>Offers</span>
          </div>
          <div className="nav-item" onClick={navigateLoginPage}>
            <GiWallet size={25} />
            <span>Wallet</span>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default MainBodyScroller;
