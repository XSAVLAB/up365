'use client'
import React, { useState, useEffect } from 'react';

const ComingSoon: React.FC = () => {
    const calculateTimeLeft = () => {
        const targetDate = new Date('2024-11-30T00:00:00');
        const now = new Date();
        const difference = targetDate.getTime() - now.getTime();

        let timeLeft = {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
        };

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }

        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearTimeout(timer);
    }, [timeLeft]);

    return (
        <div className="coming-soon">
            <div className="content">
                <h1>Something Awesome is Coming Soon!</h1>
                <p>We are working hard to give you a better experience. Stay tuned!</p>

                <div className="timer">
                    <div className="timer-item">
                        <span>{timeLeft.days}</span>
                        <span>Days</span>
                    </div>
                    <div className="timer-item">
                        <span>{timeLeft.hours}</span>
                        <span>Hours</span>
                    </div>
                    <div className="timer-item">
                        <span>{timeLeft.minutes}</span>
                        <span>Minutes</span>
                    </div>
                    <div className="timer-item">
                        <span>{timeLeft.seconds}</span>
                        <span>Seconds</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComingSoon;
