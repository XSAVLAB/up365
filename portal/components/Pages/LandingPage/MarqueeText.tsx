"use client"
import React, { useState, useEffect } from 'react';
import './MarqueeText.css';
import { fetchMarqueeText } from '@/api/firestoreService';

function LandingPageMarqueeText() {
    const [marqueeText, setMarqueeText] = useState('');
    useEffect(() => {
        const fetchData = async () => {
            try {
                const fetchedMaqueeText = await fetchMarqueeText();
                setMarqueeText(fetchedMaqueeText);
            } catch {
                setMarqueeText("Welcome!");
            }
        };

        fetchData();
    }, []);

    return (
        <div className="marquee-wrapper">
            <div className="marquee-content">
                {marqueeText}
            </div>
        </div>
    );
}

export default LandingPageMarqueeText;
