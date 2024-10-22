"use client"
import React, { useState } from 'react';
import { TiThMenu } from 'react-icons/ti';
import { useRouter } from 'next/navigation';
import './styles.css';

function LandingPageNavbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const router = useRouter();
    const navigateNull = () => { router.push('/'); };
    const navigateToLoginForm = () => { router.push('/login'); };
    const handleRegisterClick = () => { router.push('/create-acount'); };
    const handleMenuClick = () => { setIsMenuOpen(!isMenuOpen); };

    const renderMenu = () => {
        if (!isMenuOpen) {
            return null;
        }
        return (
            <div className="dropdown-menu">
                <div className="menu-content">
                    <ul className="menu-buttons">
                        <li>
                            <button onClick={navigateToLoginForm} className="navbar-login-button">
                                Log In
                            </button>
                        </li>
                        <li>
                            <button onClick={handleRegisterClick} className="navbar-signup-button">
                                Sign Up
                            </button>
                        </li>
                    </ul>
                </div>

            </div>
        );
    };

    return (
        <nav className="navbar">
            <div onClick={navigateNull}>
                <img src='/images/up365LogoDark.webp' alt="UP365 Gaming" />
            </div>
            <div className="navbar-buttons">
                <button onClick={navigateToLoginForm} className="navbar-login-button">
                    Log In
                </button>
                <button onClick={handleRegisterClick} className="navbar-signup-button">
                    Sign Up
                </button>
            </div>
            <button onClick={handleMenuClick} className="menu-button">
                <TiThMenu size={30} />
            </button>
            {renderMenu()}
        </nav>
    );
};

export default LandingPageNavbar;
