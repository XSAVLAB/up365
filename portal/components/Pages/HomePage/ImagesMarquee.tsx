"use client";
import React, { useEffect, useState } from 'react';
import './AdsSlider.css';
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";
import { useRouter } from 'next/navigation';

function LandingPageImagesMarquee() {
    const router = useRouter();
    const [imageURLs, setImageURLs] = useState<string[]>([]);

    const navigateToGames = () => {
        router.push('/');
    };

    // Fetch images from Firebase Storage
    useEffect(() => {
        const fetchImages = async () => {
            const storage = getStorage();
            const storageRef = ref(storage, 'scroller-images/');
            try {
                const result = await listAll(storageRef);
                const urls = await Promise.all(result.items.map((itemRef) => getDownloadURL(itemRef)));
                setImageURLs(urls);
            } catch (error) {
                console.error("Error fetching images from Firebase Storage", error);
            }
        };
        fetchImages();
    }, []);

    return (
        <div className="marquee-container cursor-pointer my-3 mt-5 flex flex-col">
            <div className="marquee">
                {imageURLs.concat(imageURLs).map((url, index) => (
                    <div
                        key={index}
                        onClick={navigateToGames}
                        className="marquee-item"
                        style={{ backgroundImage: `url(${url})` }}
                    />
                ))}
            </div>
        </div>
    );
}

export default LandingPageImagesMarquee;
