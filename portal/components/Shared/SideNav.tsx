"use client"
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { IconStarFilled } from '@tabler/icons-react';
import { popularData, gameData, sportsData } from '@/public/data/navData';
import { usePathname } from 'next/navigation';

export default function SideNav() {
    const path = usePathname();
    const [activeCategory, setActiveCategory] = useState("Games");

    return (
        <>
            <ul className="secend-actives bg1-color rounded-5 d-flex flex-column gap-5 mb-5">
                <li className="active">
                    <Link href="/" className="d-flex align-items-center gap-2">
                        <i className="ti ti-brand-google-home n5-color fs-five"></i> Home
                    </Link>
                </li>
                {/* <li className="active">
                    <Link href="/cricket" className="d-flex align-items-center gap-2">
                        <i className="ti ti-garden-cart n5-color fs-five">Marketplace</i>
                    </Link>
                </li> */}
                <li className="active" onClick={() => setActiveCategory("Games")}>
                    <button className="d-flex align-items-center gap-2">
                        <i className="ti ti-game n5-color fs-five"></i> Games
                    </button>
                </li>
                <li className="active" onClick={() => setActiveCategory('Sports')}>
                    <button className="d-flex align-items-center gap-2">
                        <i className="ti ti-soccer n5-color fs-five"></i> Sports
                    </button>
                </li>
            </ul>
            <hr className="py-0 my-0" />
            {activeCategory && (
                <>
                    <h5 className="mb-4 mb-md-6 mt-4 mt-md-6">{activeCategory}</h5>
                    <ul className="aside_namelist d-flex flex-column gap-2">
                        {(activeCategory === 'Games' ? gameData : sportsData).map((item) => (
                            <li
                                className={`d-flex align-items-center justify-content-between px-3 py-2 rounded-3 gap-5 ${path === item.href && 'n11-bg'}`}
                                key={item.id}>
                                <Link href={item.href || '#'} className="d-flex align-items-center gap-2">
                                    <Image width={16} height={16} src={item.image} alt="icon" />
                                    {item.linkText}
                                </Link>
                                {path === item.href && (
                                    <button type="button" className="g1-color">
                                        <IconStarFilled width={16} height={16} className="ti ti-star navinStyleClass navinstyle" />
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </>
    );
}
