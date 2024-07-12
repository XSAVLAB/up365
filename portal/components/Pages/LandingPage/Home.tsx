"use client"
import React, { useRef } from 'react';
import Navbar from './Navbar';
// import MarqueeText from './MarqueeText';
import Slider from './GamesSlider'
import ResultGamesColorComponent from './ResultPageGamesColorChange'
import LandingPageImagesMarquee from './ImagesMarquee'
import MainBodyScroller from './MainBodyScroller'
import { useRouter } from 'next/navigation';
import GamesCards from './GameCards';

const Home: React.FC = () => {
    const router = useRouter();
    const gamesRef = useRef<HTMLDivElement>(null);

    const scrollToGames = () => {
        gamesRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // const handleHelpClick = () => { router.push('/'); };

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
                <hr className='border-t-2 border-gray-200' />
            </div>
        </div>
    );
}

export default Home;
