'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { IconAdjustmentsHorizontal, IconX, IconUserCircle, IconLogout } from "@tabler/icons-react";
import { FaWhatsapp } from 'react-icons/fa';
import { fetchUserWalletOnUpdate, fetchProfileData } from '@/api/firestoreService';
import HeaderTwoChat from './HeaderTwoChat';
import SideNav from './SideNav';
import NavItem from './NavItem';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebaseConfig';

export default function HeaderTwo() {
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

        const handleScroll = () => {
            if (isCardExpanded) {
                setIsCardExpanded(false);
            }
        };

        document.body.addEventListener("click", handleClickOutside);
        window.addEventListener("scroll", handleScroll);

        return () => {
            document.body.removeEventListener("click", handleClickOutside);
            window.removeEventListener("scroll", handleScroll);
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

                fetchDetails(currentUser.uid);
                const walletUnsubscribe = fetchUserWalletOnUpdate(currentUser.uid, (newBalance: React.SetStateAction<null>) => {
                    setWalletBalance(newBalance);
                });

                return () => {
                    walletUnsubscribe();
                };
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
            const adminPhoneNumber = '+919730219716';
            const { firstName, lastName } = userDetails;
            const message = `Hello, I am ${firstName} ${lastName}.`;
            const whatsappURL = `https://wa.me/${adminPhoneNumber}?text=${encodeURIComponent(message)}`;
            window.open(whatsappURL, '_blank');
        }
    };

    const handleLogout = async () => {
        const confirmation = window.confirm('Are you sure you want to logout?');
        if (confirmation) {
            await auth.signOut();
            setUser(null);
            window.location.href = '/login';
        }
    };

    const handleProfileClick = () => {
        if (user) {
            window.location.href = '/dashboard';
        } else {
            window.location.href = '/login';
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
                                        <Link href="/dashboard" className="cmn-btn second-alt px-xxl-11 rounded-2">Deposit</Link>
                                        <button onClick={handleLogout} className="cmn-btn px-xxl-11">Log Out</button>
                                    </div>
                                </li>
                            )}
                        </ul>
                    </div>
                    <div className="right-area custom-pos custom-postwo position-relative d-flex gap-3 gap-xl-7 align-items-center me-5 me-xl-10 align-items-center">
                        {user && (
                            <div className="wallet-balance text-end d-none d-sm-block">
                                <span className="fs-seven mb-1 d-block">Your balance</span>
                                <span className="fw-bold d-block">₹ {walletBalance}</span>
                            </div>
                        )}
                        <div className="d-flex align-items-center gap-2 mt-1">
                            {/* <button type="button" className="py-1 px-2 n11-bg rounded-5 position-relative" onClick={handleWhatsAppClick}>
                                <FaWhatsapp height={24} width={24} className="ti ti-whatsapp fs-four" />
                            </button> */}
                            {/* <div className="cart-area search-area d-flex"> */}
                            {/* <HeaderTwoChat /> */}
                            {/* <button type="button" className="py-1 px-2 n11-bg rounded-5 position-relative" onClick={handleProfileClick}>
                                <IconUserCircle height={24} width={24} className="ti ti-user-circle fs-four" />
                            </button>
                            <button type="button" className="py-1 px-2 n11-bg rounded-5 position-relative" onClick={handleLogout}>
                                <IconLogout height={24} width={24} className="ti ti-user-circle fs-four" />
                            </button> */}

                            {/* </div> */}
                        </div>
                        <button onClick={toggleCard} className="navbar-toggler navbar-toggler-two mt-1 mt-sm-2 mt-lg-0" type="button" data-bs-toggle="collapse" aria-label="Navbar Toggler"
                            data-bs-target="#navbar-content" aria-expanded="true" id="nav-icon3">
                            <span></span><span></span><span></span><span></span>
                        </button>
                    </div>
                </nav>
                <div id="div10" className="navigation left-nav-area box3 position-fixed">
                    <div className="logo-area slide-toggle3 trader-list position-fixed top-0 d-flex align-items-center justify-content-center pt-6 pt-md-8 gap-sm-4 gap-md-5 gap-lg-7 px-4 px-lg-8">
                        <i className="ti ti-menu-deep left-nav-icon n8-color order-2 order-lg-0 d-none">
                        </i>
                        <Link className="navbar-brand d-center text-center gap-1 gap-lg-2 ms-lg-4" href="/">
                            <Image className="logo" width={102} height={34} src="/images/logo.png" alt="Logo" />
                            <Image className="logo d-none d-xl-block" width={64} height={24} src="/images/logo-text.png" alt="Logo" />
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
