"use client";
import React, { useRef, useState } from 'react';
import LandingPageImagesMarquee from './ImagesMarquee';
import { useRouter } from 'next/navigation';
import GamesCards from './GameCards';

const HomePage: React.FC = () => {
    const router = useRouter();
    const gamesRef = useRef<HTMLDivElement>(null);

    const handleWhatsAppClick = () => {
        const adminPhoneNumber = '+919730219716';
        const message = "Hello, I want to create an account. Please can you help me?";
        const whatsappURL = `https://wa.me/${adminPhoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappURL, '_blank');
    };

    return (
        <section className="top_matches__main">
            <LandingPageImagesMarquee />
            <div ref={gamesRef}>
                <GamesCards />
            </div>
        </section >
    );
};

export default HomePage;
