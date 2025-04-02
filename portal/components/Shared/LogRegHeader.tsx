'use client';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebaseConfig'; // Ensure this import path is correct
import { IconAdjustmentsHorizontal, IconX } from "@tabler/icons-react";
// import Language from './Language';
import SideNav from './SideNav';
import NavItem from './NavItem';

export default function HeaderMain() {
    const [isCardExpanded, setIsCardExpanded] = useState(false);
    const [isMiddleExpanded, setIsMiddleExpanded] = useState(false);
    const [user] = useAuthState(auth);

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

    return (
        <>
            <header className="header-scroll">
                <nav className="navbar navbar-expand-lg position-relative workready">
                    <div className="logo-area slide-toggle3 trader-list d-flex align-items-center justify-content-center">
                        <i className="ti ti-menu-deep left-nav-icon n8-color order-2 order-lg-0 d-none"></i>
                        <Link className="navbar-brand d-center text-center ms-lg-16" href="/">
                            <Image className="logo" width={64} height={64} src="/images/logo.png" alt="Logo" />
                        </Link>
                    </div>
                </nav>
            </header>

        </>
    );
}
