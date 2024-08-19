"use client";
import Image from 'next/image';
import Link from 'next/link';
import { Navigate } from 'react-router-dom';
import React, { FormEvent, useEffect, useState, useTransition } from 'react';
import { useAuth } from '../../../contexts/authContext';
import { useRouter } from 'next/navigation';
import { createProfile } from '../../../api/firestoreService';
import { auth } from '@/firebaseConfig';
import {
    ConfirmationResult,
    RecaptchaVerifier,
    signInWithPhoneNumber,
} from "firebase/auth";

const CreateAccount = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState("");
    const [resendCountdown, setResendCountdown] = useState(0);
    const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState('');
    const [showOtpInput, setShowOtpInput] = useState(false);
    const router = useRouter();
    const { userLoggedIn } = useAuth() || {};

    const onSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        setMessage("");

        try {
            const profileData = {
                firstName,
                lastName,
                phoneNumber,
                wallet: '1000',
                role: "user",
                isBlocked: false
            };
            await createProfile(phoneNumber, profileData);

            router.push('/');
        } catch (e) {
            setMessage('Error creating profile. Please try again.');
            console.log(e);
        }
    };

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (resendCountdown > 0) {
            timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [resendCountdown]);

    useEffect(() => {
        if (!recaptchaVerifier) {
            const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                size: 'invisible',
                callback: () => {
                    console.log('recaptcha resolved');
                }
            });
            setRecaptchaVerifier(verifier);
        }
    }, []);

    const verifyOtp = async () => {
        startTransition(async () => {
            setMessage("");

            if (!confirmationResult) {
                setMessage("Please request OTP first.");
                return;
            }

            try {
                await confirmationResult.confirm(otp);
                onSubmit({ preventDefault: () => { } });
            } catch (error) {
                console.log(error);
                setMessage("Failed to verify OTP. Please check the OTP.");
            }
        });
    };

    const requestOtp = async (e?: FormEvent<HTMLFormElement>) => {
        e?.preventDefault();
        setResendCountdown(60);
        setShowOtpInput(true);

        startTransition(async () => {
            setMessage("");

            if (!recaptchaVerifier) {
                return setMessage("RecaptchaVerifier is not initialized.");
            }

            try {
                const indianPhoneNumber = `+91${phoneNumber}`;
                const confirmationResult = await signInWithPhoneNumber(auth, indianPhoneNumber, recaptchaVerifier);

                setConfirmationResult(confirmationResult);
                setMessage("OTP sent successfully.");
            } catch (err: any) {
                console.log(err);
                setResendCountdown(0);

                if (err.code === "auth/invalid-phone-number") {
                    setMessage("Invalid phone number. Please check the number.");
                } else if (err.code === "auth/too-many-requests") {
                    setMessage("Too many requests. Please try again later.");
                } else {
                    setMessage("Failed to send OTP. Please try again.");
                }
            }
        });
    };

    return (
        <section className="login_section pt-120 p3-bg">
            {userLoggedIn && (<Navigate to={'/'} replace={true} />)}
            <div className="container-fluid">
                <div className="row justify-content-between align-items-center">
                    <div className="col-6">
                        <div className="login_section__thumb d-none d-lg-block">
                            <Image className="w-80 h-80" width={620} height={620} src="/images/double-digit-lottery.jpg" alt="Image" />
                        </div>
                    </div>
                    <div className="col-lg-6 col-xl-5">
                        <div className="login_section__loginarea">
                            <div className="row justify-content-start">
                                <div className="col-xxl-10">
                                    <div className="pb-10 pt-8 mb-7 mt-12 mt-lg-0 px-4 px-sm-10">
                                        <h3 className="mb-6 mb-md-8">Create new account.</h3>
                                        <div className="login_section__form">
                                            {message && <p className="message">{message}</p>}

                                            <form onSubmit={showOtpInput ? verifyOtp : requestOtp}>
                                                <div className="mb-5 mb-md-6">
                                                    <input
                                                        className="n11-bg"
                                                        name="firstName"
                                                        placeholder="First Name"
                                                        type="text"
                                                        required
                                                        value={firstName}
                                                        onChange={(e) => setFirstName(e.target.value)}
                                                        disabled={showOtpInput}
                                                    />
                                                </div>
                                                <div className="mb-5 mb-md-6">
                                                    <input
                                                        className="n11-bg"
                                                        name="lastName"
                                                        placeholder="Last Name"
                                                        type="text"
                                                        required
                                                        value={lastName}
                                                        onChange={(e) => setLastName(e.target.value)}
                                                        disabled={showOtpInput}
                                                    />
                                                </div>
                                                <div className="mb-5 mb-md-6">
                                                    <input
                                                        className="n11-bg"
                                                        name="phoneNumber"
                                                        placeholder="Mobile Number (India)"
                                                        type="text"
                                                        required
                                                        value={phoneNumber}
                                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                                        disabled={showOtpInput}
                                                    />
                                                </div>
                                                {showOtpInput && (
                                                    <div className="mb-5 mb-md-6">
                                                        <input
                                                            className="n11-bg"
                                                            name="otp"
                                                            placeholder="Enter OTP"
                                                            type="text"
                                                            required
                                                            value={otp}
                                                            onChange={(e) => setOtp(e.target.value)}
                                                        />
                                                    </div>
                                                )}
                                                <div className="d-flex align-items-center flex-wrap flex-sm-nowrap">
                                                    {!showOtpInput ? (
                                                        <button className="btn btn-primary btn-hover-secondary me-4" type="submit">
                                                            Request OTP
                                                        </button>
                                                    ) : (
                                                        <button className="btn btn-primary btn-hover-secondary me-4" type="submit">
                                                            Submit OTP
                                                        </button>
                                                    )}
                                                    {showOtpInput && (
                                                        <span className="mt-4 mt-sm-0">
                                                            {resendCountdown > 0
                                                                ? `Resend OTP in ${resendCountdown}s`
                                                                : <button type="button" onClick={requestOtp}>Resend OTP</button>}
                                                        </span>
                                                    )}
                                                </div>
                                            </form>
                                            <div className="d-flex align-items-center flex-wrap">
                                                <span className="border-bottom border-primary mt-4 w-100 d-block" />
                                                <p className="text-gray mb-0 mt-4 pe-2 pe-sm-0">
                                                    Already have an account? <Link className="btn-link" href="/login">Login</Link>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div id="recaptcha-container"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CreateAccount;
