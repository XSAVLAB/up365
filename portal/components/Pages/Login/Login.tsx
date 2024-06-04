'use client';
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation';
import { IconBrandGoogle, IconBrandTwitterFilled, IconBrandFacebookFilled } from "@tabler/icons-react";
import { auth, db } from '../../../firebaseConfig';
import { signInWithEmailAndPassword, GoogleAuthProvider, FacebookAuthProvider, TwitterAuthProvider, signInWithPopup } from "firebase/auth";
import { doPasswordReset } from '@/firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const router = useRouter();


    const handleLogin = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        signInWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                const user = userCredential.user;
                const userDoc = await getDoc(doc(db, "users", user.uid));
                const userData = userDoc.data();

                if (userData?.role === 'admin') {
                    router.push('/admin');
                } else {
                    router.push('/dashboard');
                }
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error(errorCode, errorMessage);
                setMessage('Error signing in. Please check your credentials.');
            });
    };


    const handleGoogleLogin = () => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider)
            .then((result) => {
                const user = result.user;
                console.log(user);
                router.push('/'); // Redirect to the root URL
            }).catch((error) => {
                console.error(error);
            });
    };

    const handleFacebookLogin = () => {
        const provider = new FacebookAuthProvider();
        signInWithPopup(auth, provider)
            .then((result) => {
                const user = result.user;
                console.log(user);
                router.push('/'); // Redirect to the root URL
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
                router.push('/'); // Redirect to the root URL
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

    return (
        <section className="login_section pt-120 p3-bg">
            <div className="container-fluid">
                <div className="row justify-content-between align-items-center">
                    <div className="col-6">
                        <div className="login_section__thumb d-none d-lg-block">
                            <Image className="w-100" width={720} height={900} src="/images/login.png" alt="Image" />
                        </div>
                    </div>
                    <div className="col-lg-6 col-xl-5">
                        <div className="login_section__loginarea">
                            <div className="row justify-content-start">
                                <div className="col-xxl-10">
                                    <div className="pb-10 pt-8 mb-7 mt-12 mt-lg-0 px-4 px-sm-10">
                                        <h3 className="mb-6 mb-md-8">Login</h3>
                                        <p className="mb-10 mb-md-15">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas
                                            aliquet justo magna.</p>
                                        <div className="login_section__form">
                                            {message && <p className="message">{message}</p>}
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
                                                <button className="cmn-btn px-5 py-3 mb-6 w-100" type="submit">Sign Up Now</button>
                                            </form>
                                        </div>
                                        <div className="login_section__socialmedia text-center mb-6">
                                            <span className="mb-6">Or continue with</span>
                                            <div className="login_section__social d-center gap-3">
                                                <Link href="#" className="n11-bg px-3 py-2 rounded-5" onClick={handleFacebookLogin}>
                                                    <IconBrandFacebookFilled className="ti ti-brand-facebook-filled fs-four" />
                                                </Link>
                                                <Link href="#" className="n11-bg px-3 py-2 rounded-5" onClick={handleTwitterLogin}>
                                                    <IconBrandTwitterFilled className="ti ti-brand-twitter-filled fs-four" />
                                                </Link>
                                                <Link href="#" className="n11-bg px-3 py-2 rounded-5" onClick={handleGoogleLogin}>
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
