"use client"
import React from 'react';
import './AdsSlider.css';
import img3 from '../../../public/images/img3.webp';
import img4 from '../../../public/images/img4.webp';
import img7 from '../../../public/images/img7.webp';
import img8 from '../../../public/images/3DLottery.webp';
import lottery from '../../../public/images/lotteryBg.webp';
import ludo from '../../../public/images/ludoBgImg.webp';
import poker from '../../../public/images/pokerBg.webp';
import andarbahar from '../../../../portal/public/images/andarBaharBg.webp';
import teenpatti from '../../../public/images/teenpattiBg.webp';
import colorball from '../../../public/images/colorballBg.webp';
import { useRouter } from 'next/navigation';

const images = [img3, img4, lottery, ludo, poker, andarbahar, teenpatti, colorball, img3, img4, lottery, ludo, poker, andarbahar, teenpatti, colorball, img7, img8];

function LandingPageImagesMarquee() {
    const router = useRouter();

    const navigateToGames = () => {
        router.push('/');
    };

    return (
        <div className="marquee-container cursor-pointer my-3 mt-5 flex flex-col">
            <div className="marquee">
                {images.concat(images).map((image, index) => (
                    <div
                        key={index}
                        onClick={navigateToGames}
                        className="marquee-item"
                        style={{ backgroundImage: `url(${image.src})` }}
                    />
                ))}
            </div>
        </div>
    );
}

export default LandingPageImagesMarquee;
