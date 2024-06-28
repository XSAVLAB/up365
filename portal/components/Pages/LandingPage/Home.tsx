"use client"
import React from 'react';
import Navbar from './Navbar';
import MarqueeText from './MarqueeText';
import Slider from './GamesSlider'
// import GamesCards from '../Games/GamesCards'
import ResultGamesColorComponent from './ResultPageGamesColorChange'
import LandingPageImagesMarquee from './ImagesMarquee'
import MainBodyScroller from './MainBodyScroller'
import { BsWhatsapp } from 'react-icons/bs';
import { useRouter } from 'next/navigation';
import useScrollToTop from '../../hooks/useScrollToTop';

function Home() {
    useScrollToTop();
    const router = useRouter();
    const handleHelpClick = () => { router.push('/'); };
    return (
        <div className=''>
            <Navbar />
            {/* <MarqueeText /> */}
            <MainBodyScroller />
            <LandingPageImagesMarquee />
            <Slider />
            {/* <GamesCards /> */}
            <ResultGamesColorComponent />
            <div className='w-full bg-white h-full'>
                <hr className='border-t-2 border-gray-200' />
            </div>
        </div>
    );
}

export default Home;
