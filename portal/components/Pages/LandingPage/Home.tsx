"use client";
import React, { useRef } from 'react';
import Navbar from './Navbar';
// import MarqueeText from './MarqueeText';
import Slider from './GamesSlider';
import ResultGamesColorComponent from './ResultPageGamesColorChange';
import LandingPageImagesMarquee from './ImagesMarquee';
import MainBodyScroller from './MainBodyScroller';
import { useRouter } from 'next/navigation';
import GamesCards from './GameCards';
import { IconBrandWhatsapp } from '@tabler/icons-react';
import { FaWhatsapp } from 'react-icons/fa';

const Home: React.FC = () => {
    const router = useRouter();
    const gamesRef = useRef<HTMLDivElement>(null);

    const scrollToGames = () => {
        gamesRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleWhatsAppClick = () => {
        const adminPhoneNumber = '+918080917565';
        const message = `Hello, I want to create an account. Please can you help me?`;
        const whatsappURL = `https://wa.me/${adminPhoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappURL, '_blank');
    }


    return (
        <div className=''>
            <Navbar />
            {/* <MarqueeText /> */}
            <MainBodyScroller scrollToGames={scrollToGames} />
            <LandingPageImagesMarquee />
            <Slider />
            <div ref={gamesRef}>
                <GamesCards />
            </div>
            <ResultGamesColorComponent />
            <div className='w-full bg-white h-full'>
                {/* <button
                    onClick={handleWhatsAppClick()}
                    className="whatsapp_float"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <IconBrandWhatsapp size={38} />
                </button> */}
                <button type="button" className="whatsapp_float" onClick={handleWhatsAppClick}>
                    <IconBrandWhatsapp size={38} />

                </button>
                <hr className='border-t-2 border-gray-200' />
            </div>




        </div>
    );
};

export default Home;
