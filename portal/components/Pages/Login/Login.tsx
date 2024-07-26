'use client';
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation';
import { IconBrandGoogle, IconBrandTwitterFilled, IconBrandFacebookFilled } from "@tabler/icons-react";
import { auth, db, isAdmin } from '../../../firebaseConfig';
import { signInWithEmailAndPassword, GoogleAuthProvider, FacebookAuthProvider, TwitterAuthProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber, PhoneAuthProvider } from "firebase/auth";
import { doPasswordReset, doSignInWithGoogle } from '@/firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { createProfile } from '@/api/firestoreService';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [verificationId, setVerificationId] = useState('');
    const [message, setMessage] = useState('');
    const router = useRouter();
    const [isPhoneLogin, setIsPhoneLogin] = useState(false);

    const handleLogin = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        signInWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                const user = userCredential.user;
                const userDoc = await getDoc(doc(db, "users", user.uid));
                const userData = userDoc.data();

                if (isAdmin(user.email)) {
                    router.push('/admin');
                } else {
                    if (userData?.isBlocked === false) {
                        router.push('/');
                    } else {
                        setMessage('You are suspended from the system' + user.email);
                    }
                }

            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error(errorCode, errorMessage);
                setMessage('Error signing in. Please check your credentials.');
            });
    };

    const onGoogleSignIn = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();

        try {
            const userCredential = await doSignInWithGoogle();
            const user = userCredential.user;

            const userDoc = await getDoc(doc(db, "users", user.uid));
            const userData = userDoc.data();

            if (userData?.isBlocked === false) {
                if (userData) {
                    if (isAdmin(user.email)) {
                        router.push('/admin');
                    } else {
                        router.push('/');
                    }
                } else {
                    const profileData = {
                        firstName: user.displayName?.split(' ')[0] || '',
                        lastName: user.displayName?.split(' ')[1] || '',
                        phoneNumber: '',
                        email: user.email,
                        wallet: '1000',
                        role: "user"
                    };
                    await createProfile(user.uid, profileData);
                    router.push('/');
                }
            } else {
                setMessage('You are suspended from the system');
            }
        } catch (e) {
            console.log(e);
        }
    };

    const handleFacebookLogin = () => {
        const provider = new FacebookAuthProvider();
        signInWithPopup(auth, provider)
            .then((result) => {
                const user = result.user;
                console.log(user);
                router.push('/');
            }).catch((error) => {
                console.error(error);
            });
    };

    const handleTwitterLogin = () => {
        const provider = new TwitterAuthProvider();
        signInWithPopup(auth, provider)
            .then((result) => {
                const user = result.user;
                console.log(user);
                router.push('/');
            }).catch((error) => {
                console.error(error);
            });
    };

    const handleForgotPassword = async () => {
        setMessage('');
        if (!email) {
            setMessage('Email address is required');
            return;
        }
        try {
            await doPasswordReset(email);
            setMessage('Password reset email sent!');
        } catch (e) {
            setMessage('Error sending password reset email!');
        }
    };

    const setUpRecaptcha = () => {
        if (typeof window !== 'undefined' && window.recaptchaVerifier === undefined) {
            window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
                'size': 'invisible',
                'callback': (response: any) => {
                    console.log("Recaptcha verified");
                },
                'expired-callback': () => {
                    console.log("Recaptcha expired");
                }
            }, auth);
        }
    };

    const handleSendOtp = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        setUpRecaptcha();
        const appVerifier = window.recaptchaVerifier;

        signInWithPhoneNumber(auth, phoneNumber, appVerifier)
            .then((confirmationResult) => {
                setVerificationId(confirmationResult.verificationId);
                setMessage('OTP sent!');
            }).catch((error) => {
                console.error(error);
                setMessage('Error sending OTP!');
            });
    };

    const handleVerifyOtp = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        const credential = PhoneAuthProvider.credential(verificationId, otp);

        auth.signInWithCredential(credential)
            .then(async (userCredential) => {
                const user = userCredential.user;
                const userDoc = await getDoc(doc(db, "users", user.uid));
                const userData = userDoc.data();

                if (userData?.isBlocked === false) {
                    if (isAdmin(user.email)) {
                        router.push('/admin');
                    } else {
                        router.push('/');
                    }
                } else {
                    setMessage('You are suspended from the system');
                }
            })
            .catch((error) => {
                console.error(error);
                setMessage('Error verifying OTP!');
            });
    };

    return (
        <section className="login_section pt-120 p3-bg">
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
                                        <h3 className="mb-6 mb-md-8">Login</h3>
                                        <div className="login_section__form">
                                            {message && <p className="message">{message}</p>}
                                          
                                          {isPhoneLogin ? (
                                            <>
                                              <form onSubmit={handleSendOtp}>
                                                <div className="mb-5 mb-md-6">
                                                    <input
                                                        className="n11-bg"
                                                        name="Input-4"
                                                        data-name="Input 4"
                                                        placeholder="Phone Number"
                                                        type="text"
                                                        id="Input-4"
                                                        value={phoneNumber}
                                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                                    />
                                                </div>
                                                <button className="cmn-btn px-5 py-3 mb-6 w-100" type="submit">Send OTP</button>
                                            </form>
                                            <form onSubmit={handleVerifyOtp}>
                                                <div className="mb-5 mb-md-6">
                                                    <input
                                                        className="n11-bg"
                                                        name="Input-5"
                                                        data-name="Input 5"
                                                        placeholder="OTP"
                                                        type="text"
                                                        id="Input-5"
                                                        value={otp}
                                                        onChange={(e) => setOtp(e.target.value)}
                                                    />
                                                </div>
                                                <button className="cmn-btn px-5 py-3 mb-6 w-100" type="submit">Verify OTP</button>
                                            </form>
                                            </>
                                          ) : (
                                            <>
                                              <form onSubmit={handleLogin}>
                                                <div className="mb-5 mb-md-6">
                                                    <input
                                                        className="n11-bg"
                                                        name="Input-1"
                                                        data-name="Input 1"
                                                        placeholder="Email"
                                                        type="email"
                                                        id="Input"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                    />
                                                </div>
                                                <div className="mb-5 mb-md-6">
                                                    <input
                                                        className="n11-bg"
                                                        name="Input-3"
                                                        data-name="Input 3"
                                                        placeholder="Password"
                                                        type="password"
                                                        id="Input-3"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                    />
                                                </div>
                                                <button className="cmn-btn px-5 py-3 mb-6 w-100" type="submit">Login</button>
                                            </form>
                                            </>
                                          )}
                                        </div>
                                        <div id="recaptcha-container"></div>
                                        <div className="login_section__socialmedia text-center mb-6">
                                            <span className="mb-6">Or continue with</span>
                                            <div className="login_section__social d-center gap-3">
                                            <button onClick={()=>setIsPhoneLogin(true)}>Phone</button>
                                            <button onClick={()=>setIsPhoneLogin(false)}>Email</button>
                                            <Link href="#" className="n11-bg px-3 py-2 rounded-5" onClick={handleFacebookLogin}>
                                                    <IconBrandFacebookFilled className="ti ti-brand-facebook-filled fs-four" />
                                                </Link>
                                                <Link href="#" className="n11-bg px-3 py-2 rounded-5" onClick={handleTwitterLogin}>
                                                    <IconBrandTwitterFilled className="ti ti-brand-twitter-filled fs-four" />
                                                </Link>
                                                <Link href="#" className="n11-bg px-3 py-2 rounded-5" onClick={onGoogleSignIn}>
                                                    <IconBrandGoogle className="ti ti-brand-google fs-four fw-bold" />
                                                </Link>
                                            </div>
                                            <span className="d-center gap-1">
                                                <button className="g1-color" onClick={handleForgotPassword}>Forgot Password?</button>
                                            </span>
                                        </div>
                                        <span className="d-center gap-1">Create your account? <Link className="g1-color" href="/create-acount">Sign Up Now</Link></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
