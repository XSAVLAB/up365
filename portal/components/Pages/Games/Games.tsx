'use client';
import React from 'react'
import LandingPageImagesMarquee from '../HomePage/ImagesMarquee';
import GameCards from '../HomePage/GameCards'
import AllLotteryBets from '../HomePage/AllLotteryBets'

const Games = () => {
    return (
        <section className="top_matches__main">
            {/* <LandingPageImagesMarquee /> */}
            <div className='mt-8'>
                <GameCards />
            </div>
        </section>
    )
}

export default Games
