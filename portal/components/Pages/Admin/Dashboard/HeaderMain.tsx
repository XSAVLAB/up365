'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { IconAdjustmentsHorizontal, IconLogout } from "@tabler/icons-react";
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebaseConfig';

export default function HeaderTwo() {
    const [isCardExpanded, setIsCardExpanded] = useState(false);
    const [user, setUser] = useState<any>(null);

    const toggleCard = () => {
        setIsCardExpanded(!isCardExpanded);
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
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                setUser(null);
            }
        });

        return () => unsubscribe();
    }, []);

    function handleLogout(): React.MouseEventHandler<HTMLButtonElement> | undefined {
        return async () => {
            await auth.signOut();
            setUser(null);
            window.location.href = '/login';
        };
    }

    return (
        <>

            <header className="header-section2 header-section">
                <nav className="navbar navbar-expand-lg position-relative py-md-3 py-lg-6 workready">
                    <div className={`collapse navbar-collapse justify-content-between ${isCardExpanded ? "show" : "hide"}`} id="navbar-content">
                        <ul className="navbar-nav2fixed navbar-nav d-flex align-items-lg-center gap-4 gap-sm-5 py-2 py-lg-0 align-self-center p2-bg">

                            <li className="dropdown show-dropdown d-block d-sm-none">
                                <div className="d-flex align-items-center flex-wrap gap-3">
                                    <Link href="/dashboard" className="cmn-btn second-alt px-xxl-11 rounded-2">Profile</Link>
                                    <button onClick={() => auth.signOut()} className="cmn-btn px-xxl-11">Log Out</button>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div className="right-area custom-pos custom-postwo position-relative d-flex gap-3 gap-xl-7 align-items-center me-5 me-xl-10 align-items-center">
                        <div className="d-flex align-items-center gap-2 mt-1">

                            <div className="cart-area search-area d-flex">
                                <button type="button" className="py-1 px-2 n11-bg rounded-5" onClick={handleLogout()}>
                                    <IconLogout height={24} width={24} className="ti ti-user-circle fs-four" />
                                </button>

                            </div>
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
                            <Image className="logo d-none d-xl-block" width={50} height={24} src="/images/logo-text.png" alt="Logo" />
                        </Link>
                    </div>

                </div>
            </header >

        </>
    );
}
