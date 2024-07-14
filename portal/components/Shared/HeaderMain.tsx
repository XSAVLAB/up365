'use client';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebaseConfig'; // Ensure this import path is correct
import { IconAdjustmentsHorizontal, IconX } from "@tabler/icons-react";
import { FaWhatsapp } from 'react-icons/fa';
// import Language from './Language';
import SideNav from './SideNav';
import NavItem from './NavItem';
import { fetchProfileData, fetchUserWallet } from '@/api/firestoreService';
import { onAuthStateChanged } from 'firebase/auth';

export default function HeaderMain() {
    const [isCardExpanded, setIsCardExpanded] = useState(false);
    const [isMiddleExpanded, setIsMiddleExpanded] = useState(false);
    const [walletBalance, setWalletBalance] = useState(null);
    const [user, setUser] = useState<any>(null);
    const [userDetails, setUserDetails] = useState<any>(null);

    const toggleCard = () => {
        setIsCardExpanded(!isCardExpanded);
    };

    const toggleMiddle = () => {
        setIsMiddleExpanded(!isMiddleExpanded);
    };

    useEffect(() => {
        const handleClickOutside = (event: any) => {
            if (isCardExpanded && !event.target.closest(".navbar-toggler")) {
                setIsCardExpanded(false);
            }
        };
        document.body.addEventListener("click", handleClickOutside);
        return () => {
            document.body.removeEventListener("click", handleClickOutside);
        };
    }, [isCardExpanded]);

    useEffect(() => {
        const handleClickOutsideMiddle = (event: any) => {
            if (isMiddleExpanded && !event.target.closest(".left-nav-icon")) {
                setIsMiddleExpanded(false);
            }
        };

        document.body.addEventListener("click", handleClickOutsideMiddle);
        return () => {
            document.body.removeEventListener("click", handleClickOutsideMiddle);
        };
    }, [isMiddleExpanded]);

    useEffect(() => {
        const fetchWallet = async (userId: string) => {
            try {
                const balance = await fetchUserWallet(userId);
                setWalletBalance(balance);
            } catch (error) {
                console.error('Error fetching wallet balance:', error);
            }
        };

        const fetchDetails = async (userId: string) => {
            try {
                const details = await fetchProfileData(userId);
                setUserDetails(details);
            } catch (error) {
                console.error('Error fetching user details:', error);
            }
        };

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                fetchWallet(currentUser.uid);
                fetchDetails(currentUser.uid);
            } else {
                setUser(null);
                setWalletBalance(null);
                setUserDetails(null);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleWhatsAppClick = () => {
        if (user && userDetails) {
            const adminPhoneNumber = '8080917565';
            const { firstName, lastName } = userDetails;
            const message = `Hello, I am ${firstName} ${lastName}.`;
            const whatsappURL = `https://wa.me/${adminPhoneNumber}?text=${encodeURIComponent(message)}`;
            window.open(whatsappURL, '_blank');
        }
    };

    return (
        <>
            <header className="header-section2 header-section">
                <nav className="navbar navbar-expand-lg position-relative py-md-3 py-lg-6 workready">
                    <div className={`collapse navbar-collapse justify-content-between ${isCardExpanded ? "show" : "hide"}`} id="navbar-content">
                        <ul className="navbar-nav2fixed navbar-nav d-flex align-items-lg-center gap-4 gap-sm-5 py-2 py-lg-0 align-self-center p2-bg">
                            <NavItem />
                            {!user ? (
                                <li className="dropdown show-dropdown d-block d-sm-none">
                                    <div className="d-flex align-items-center flex-wrap gap-3">
                                        <Link href="/login" className="cmn-btn second-alt px-xxl-11 rounded-2">Log In</Link>
                                        <Link href="/create-acount" className="cmn-btn px-xxl-11">Sign Up</Link>
                                    </div>
                                </li>
                            ) : (
                                <li className="dropdown show-dropdown d-block d-sm-none">
                                    <div className="d-flex align-items-center flex-wrap gap-3">
                                        <div className="text-end d-none d-sm-block">
                                            <span className="fs-seven mb-1 d-block">Your balance</span>
                                            <span className="fw-bold d-block">₹ {walletBalance}</span>
                                        </div>
                                        <button type="button" className="py-1 px-2 n11-bg rounded-5 position-relative" >
                                            <FaWhatsapp height={24} width={24} className="ti ti-whatsapp fs-four" />
                                        </button>
                                        <Link href="/dashboard" className="cmn-btn second-alt px-xxl-11 rounded-2">Profile</Link>
                                        <button onClick={() => auth.signOut()} className="cmn-btn px-xxl-11">Log Out</button>
                                    </div>
                                </li>
                            )

                            }
                        </ul>
                    </div>
                    <div className="right-area custom-pos position-relative d-flex gap-0 gap-lg-7 align-items-center me-5 me-xl-10">
                        {/* <Language /> */}
                        {!user ? (
                            <>
                                <Link href="/login" className="cmn-btn second-alt px-xxl-11 rounded-2 me-5 me-lg-0 d-none d-sm-block">Log In</Link>
                                <Link href="/create-acount" className="cmn-btn d-none px-xxl-11 d-sm-block d-lg-none d-xl-block">Sign Up</Link>
                            </>
                        ) : (
                            <div className="d-none d-sm-block">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="text-end d-none d-sm-block">
                                        <span className="fs-seven mb-1 d-block">Your balance</span>
                                        <span className="fw-bold d-block">₹ {walletBalance}</span>
                                    </div>
                                    <button type="button" className="py-1 px-2 n11-bg rounded-5 position-relative" onClick={handleWhatsAppClick}>
                                        <FaWhatsapp height={24} width={24} className="ti ti-whatsapp fs-four" />
                                    </button>
                                    <Link href="/dashboard" className="cmn-btn second-alt px-xxl-11 rounded-2">Profile</Link>
                                    <button onClick={() => auth.signOut()} className="cmn-btn px-xxl-11">Log Out</button>
                                </div>
                            </div>
                        )}
                    </div>
                    <button onClick={toggleCard} className="navbar-toggler mt-1 mt-sm-2 mt-lg-0" type="button" data-bs-toggle="collapse" aria-label="Navbar Toggler" data-bs-target="#navbar-content" aria-expanded="true" id="nav-icon3">
                        <span></span><span></span><span></span><span></span>
                    </button>
                </nav>
                <div id="div10" className="navigation left-nav-area box3 position-fixed">
                    <div className="logo-area slide-toggle3 trader-list position-fixed top-0 d-flex align-items-center justify-content-center pt-6 pt-md-8 gap-sm-4 gap-md-5 gap-lg-7 px-4 px-lg-8">
                        <Link className="navbar-brand d-center text-center gap-1 gap-lg-1 ms-lg-1 -m" href="/">
                            <Image className="logo" width={98} height={98} src="/images/logo.png" alt="Logo" />
                            <Image className="logo d-none d-xl-block" width={84} height={44} src="/images/logo-text.png" alt="Logo" />
                        </Link>
                    </div>
                    <div className={`nav_aside px-5 p2-bg ${isMiddleExpanded ? "show" : "hide"}`}>
                        <div className="nav-clsoeicon d-flex justify-content-end">
                            <IconX onClick={toggleMiddle} width={32} height={32} className="ti ti-x left-nav-icon n8-color order-2 order-lg-0 d-block d-lg-none fs-three" />
                        </div>
                        <SideNav />
                    </div>
                </div>
            </header>
            <button onClick={toggleMiddle} type="button" className="middle-iconfixed position-fixed top-50 start-0 left-nav-icon">
                <IconAdjustmentsHorizontal width={38} height={38} className="ti ti-adjustments-horizontal n8-color d-block d-lg-none fs-two" />
            </button>
        </>
    );
}
