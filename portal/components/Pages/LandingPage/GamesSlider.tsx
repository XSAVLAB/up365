"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AiFillRightSquare, AiFillLeftSquare } from 'react-icons/ai';
import { RxDotFilled } from 'react-icons/rx';
import Image from 'next/image';
import img3 from '../../../public/images/img3.webp';
import img4 from '../../../public/images/img4.webp';
import lottery from '../../../public/images/lotteryBg.webp';
import ludo from '../../../public/images/ludoBgImg.webp';
import poker from '../../../public/images/pokerBg.webp';
import andarbahar from '../../../../portal/public/images/andarBaharBg.webp';
import teenpatti from '../../../public/images/teenpattiBg.webp';
import colorball from '../../../public/images/colorballBg.webp';
import './styles.css';

function LandingPageGamesSlider() {
    const imageArray = [img3, img4, lottery, ludo, poker, andarbahar, teenpatti, colorball];
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const router = useRouter();

    const navigateGamesPage = () => {
        router.push("/");
    };

    const nextImage = useCallback(() => {
        const newImageIndex = (currentImageIndex + 1) % imageArray.length;
        setCurrentImageIndex(newImageIndex);
    }, [currentImageIndex, imageArray.length]);

    const prevImage = () => {
        const newImageIndex = (currentImageIndex - 1 + imageArray.length) % imageArray.length;
        setCurrentImageIndex(newImageIndex);
    };

    useEffect(() => {
        const interval = setInterval(nextImage, 5000);
        return () => clearInterval(interval);
    }, [nextImage]);

    const goToImage = (imageIndex: React.SetStateAction<number>) => {
        setCurrentImageIndex(imageIndex);
    };

    return (
        <div className='slider-container group'>
            <div className='slider'>
                <Image
                    src={imageArray[currentImageIndex]}
                    alt={`Slide ${currentImageIndex}`}
                    layout='fill'
                    objectFit='cover'
                    className='slider-image'
                />
                <div className='left-fade'></div>
                <div className='right-fade'></div>
                <div className='nav-button left-button' onClick={prevImage}>
                    <AiFillLeftSquare size={50} />
                </div>
                <div className='nav-button right-button' onClick={nextImage}>
                    <AiFillRightSquare size={50} />
                </div>
                <div className='play-button-container'>
                    <button onClick={navigateGamesPage} className='play-button'>
                        Play Now
                    </button>
                </div>
            </div>
            <div className='dots-container'>
                {imageArray.map((image, imageIndex) => (
                    <div
                        key={imageIndex}
                        onClick={() => goToImage(imageIndex)}
                        className={`dot ${currentImageIndex === imageIndex ? 'active' : ''}`}
                    >
                        <RxDotFilled />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default LandingPageGamesSlider;
