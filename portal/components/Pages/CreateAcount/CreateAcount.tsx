"use client";
import Image from 'next/image';
import Link from 'next/link';
import { Navigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/authContext';
import { useRouter } from 'next/navigation';
import { IconBrandGoogle, IconBrandTwitterFilled, IconBrandFacebookFilled } from "@tabler/icons-react";
import { doCreateUserWithEmailAndPassword, doSignInWithGoogle } from '../../../firebase/auth';
import { createProfile } from '../../../api/firestoreService';
import firebase from "firebase/app";
import "firebase/auth";

const CreateAccount = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [otp, setOtp] = useState('');
    const [verificationId, setVerificationId] = useState(null);
    const router = useRouter();

    const { userLoggedIn } = useAuth() || {};

    useEffect(() => {
        window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
            'size': 'invisible',
            'callback': (response) => {
                console.log('Recaptcha verified', response);
            }
        });
    }, []);

    const sendOtp = () => {
        const appVerifier = window.recaptchaVerifier;
        firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier)
            .then(confirmationResult => {
                setVerificationId(confirmationResult.verificationId);
                setMessage('OTP sent. Please check your phone.');
            }).catch(error => {
                setMessage(error.message);
                console.log(error);
            });
    };

    const verifyOtpAndCreateAccount = async () => {
        const credential = firebase.auth.PhoneAuthProvider.credential(verificationId, otp);
        try {
            const userCredential = await firebase.auth().signInWithCredential(credential);
            const user = userCredential.user;

            const profileData = {
                firstName,
                lastName,
                phoneNumber,
                email,
                wallet: '1000',
                role: "user",
                isBlocked: false
            };
            await createProfile(user.uid, profileData);

            router.push('/');
        } catch (e) {
            setMessage('Failed to verify OTP. Please try again.');
            console.log(e);
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        sendOtp();
    };

    const onGoogleSignIn = async (e) => {
        e.preventDefault();
        try {
            const userCredential = await doSignInWithGoogle();
            const user = userCredential.user;

            const profileData = {
                firstName: user.displayName?.split(' ')[0] || '',
                lastName: user.displayName?.split(' ')[1] || '',
                phoneNumber: '',
                email: user.email,
                wallet: '1000',
                role: "user",
                isBlocked: false
            };
            await createProfile(user.uid, profileData);

            window.location.replace('/');
        } catch (e) {
            console.log(e);
        }
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

                                            <form onSubmit={onSubmit}>
                                                <div className="mb-5 mb-md-6">
                                                    <input
                                                        className="n11-bg"
                                                        name="firstName"
                                                        placeholder="First Name"
                                                        type="text"
                                                        required
                                                        value={firstName}
                                                        onChange={(e) => setFirstName(e.target.value)}
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
                                                    />
                                                </div>
                                                <div className="mb-5 mb-md-6">
                                                    <input
                                                        className="n11-bg"
                                                        name="phoneNumber"
                                                        placeholder="Mobile Number"
                                                        type="text"
                                                        required
                                                        value={phoneNumber}
                                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                                    />
                                                </div>
                                                <div className="mb-5 mb-md-6">
                                                    <input
                                                        className="n11-bg"
                                                        name="email"
                                                        placeholder="Email"
                                                        type="email"
                                                        required
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                    />
                                                </div>
                                                <div className="mb-5 mb-md-6">
                                                    <input
                                                        className="n11-bg"
                                                        name="password"
                                                        placeholder="Password"
                                                        type="password"
                                                        required
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                    />
                                                </div>
                                                <div className="d-flex align-items-center flex-wrap flex-sm-nowrap gap-2 mb-6">
                                                    <input type="checkbox" checked required />
                                                    <span>I agree to all statements with <Link href="#">Terms of Use</Link></span>
                                                </div>
                                                <button className="cmn-btn px-5 py-3 mb-6 w-100" type="submit">Sign Up</button>
                                            </form>
                                            {verificationId && (
                                                <div className="mb-5 mb-md-6">
                                                    <input
                                                        className="n11-bg"
                                                        name="otp"
                                                        placeholder="OTP"
                                                        type="text"
                                                        required
                                                        value={otp}
                                                        onChange={(e) => setOtp(e.target.value)}
                                                    />
                                                    <button className="cmn-btn px-5 py-3 mb-6 w-100" onClick={verifyOtpAndCreateAccount}>Verify OTP</button>
                                                </div>
                                            )}
                                        </div>
                                        <div className="login_section__socialmedia text-center mb-6">
                                            <span className="mb-6">Or continue with</span>
                                            <div className="login_section__social d-center gap-3">
                                                <Link href="#" className="n11-bg px-3 py-2 rounded-5">
                                                    <IconBrandFacebookFilled className="ti ti-brand-facebook-filled fs-four" />
                                                </Link>
                                                <Link href="#" className="n11-bg px-3 py-2 rounded-5">
                                                    <IconBrandTwitterFilled className="ti ti-brand-twitter-filled fs-four" />
                                                </Link>
                                                <Link href="#" onClick={(e) => { onGoogleSignIn(e) }} className="n11-bg px-3 py-2 rounded-5">
                                                    <IconBrandGoogle className="ti ti-brand-google fs-four fw-bold" />
                                                </Link>
                                            </div>
                                        </div>
                                        <span className="d-center gap-1">Already a member? <Link className="g1-color" href="/login">Login</Link></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div id="recaptcha-container"></div>
        </section>
    );
};

export default CreateAccount;
