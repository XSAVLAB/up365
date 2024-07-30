"use client";
import React, { useRef, useState } from 'react';
import Navbar from './Navbar';
import Slider from './GamesSlider';
import ResultGamesColorComponent from './ResultPageGamesColorChange';
import LandingPageImagesMarquee from './ImagesMarquee';
import MainBodyScroller from './MainBodyScroller';
import { useRouter } from 'next/navigation';
import GamesCards from './GameCards';
import { IconBrandWhatsapp } from '@tabler/icons-react';

const Home: React.FC = () => {
    const [showWarning, setShowWarning] = useState(true);
    const router = useRouter();
    const gamesRef = useRef<HTMLDivElement>(null);

    const scrollToGames = () => {
        gamesRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleWhatsAppClick = () => {
        const adminPhoneNumber = '+919730219716';
        const message = "Hello, I want to create an account. Please can you help me?";
        const whatsappURL = `https://wa.me/${adminPhoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappURL, '_blank');
    };

    const handleAgreeAndContinue = () => {
        setShowWarning(false);
    };

    return (
        <div className=''>
            {showWarning && (
                <div className='warning-popup'>
                    <div className='warning-message'>
                        <p>Warning! This game may be habit forming and financially risky. Play Responsibly.</p>
                        <button className='agree-button' onClick={handleAgreeAndContinue}>Agree and Continue</button>
                    </div>
                </div>
            )}
            <Navbar />
            <MainBodyScroller scrollToGames={scrollToGames} />
            <LandingPageImagesMarquee />
            <Slider />
            <div ref={gamesRef}>
                <GamesCards />
            </div>
            <ResultGamesColorComponent />
            <div className='w-full bg-white h-full'>
                <button type="button" className="whatsapp_float" onClick={handleWhatsAppClick}>
                    <IconBrandWhatsapp size={38} />
                </button>
                <hr className='border-t-2 border-gray-200' />
            </div>
        </div>
    );
};

export default Home;
