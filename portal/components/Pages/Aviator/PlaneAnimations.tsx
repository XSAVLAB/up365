import { useEffect, useState } from 'react';

interface PlaneAnimationsProps {
    multiplier: number;
    crashPoint: number | null;
    isRunning: boolean;
}

export default function PlaneAnimations({ multiplier, crashPoint, isRunning }: PlaneAnimationsProps) {
    const [position, setPosition] = useState(0);

    useEffect(() => {
        let animationInterval: NodeJS.Timeout | null = null;

        if (isRunning) {
            animationInterval = setInterval(() => {
                // Update the position based on the exponential multiplier value.
                setPosition((prevPosition) => prevPosition + multiplier);
            }, 10); // Update every 10ms for smooth animation.
        }

        if (!isRunning || crashPoint !== null) {
            clearInterval(animationInterval!);
        }

        return () => clearInterval(animationInterval!);
    }, [isRunning, multiplier, crashPoint]);

    return (
        <div className="exponential-graph-container">
            <div
                className="plane"
                style={{
                    transform: `translateY(-${position * 20}px)`, // Smooth exponential movement upwards
                    transition: 'transform 0.01s linear', // Smooth and continuous transition
                }}
            >
                ✈️ {/* You can replace this with an image or SVG of a plane */}
            </div>
        </div>
    );
}
