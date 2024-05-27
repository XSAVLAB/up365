"use client";
import Image from 'next/image'
import Link from 'next/link'
import { Navigate } from 'react-router-dom'
import React, { useState } from 'react'
import { IconBrandGoogle, IconBrandTwitterFilled, IconBrandFacebookFilled } from "@tabler/icons-react";
import { doSignInWithEmailAndPassword, doSignInWithGoogle, doPasswordReset } from '../../../firebase/auth'
import { useAuth } from '../../../contexts/authContext'
// import { fetchSignInMethodsForEmail } from 'firebase/auth';
// import { auth } from '../../../firebase/firebase';


const Login = () => {

    const { userLoggedIn } = useAuth() || {};

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSigningIn, setIsSigningIn] = useState(false)
    const [message, setMessage] = useState('');

    const onSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        setMessage("");
        if (!email || !password) {
            setMessage('Email address and Password is required');
            return;
        }
        if (!isSigningIn) {
            setIsSigningIn(true)
            try {
                await doSignInWithEmailAndPassword(email, password)
                window.location.replace('/dashboard');
            } catch (e) {
                setMessage('Invalid Credentials!');
            }
        }
    }

    const onGoogleSignIn = async (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.preventDefault();
        if (!isSigningIn) {
            setIsSigningIn(true)

            try {
                await doSignInWithGoogle()
                window.location.replace('/dashboard');
            } catch (e) {
                console.log(e)
            }

        }
    }

    const handleForgotPassword = async () => {
        setMessage('');
        if (!email) {
            setMessage('Email address is required');
            return;
        }
        try {
            // const signInMethods = await getSignInMethodsForEmail(email);
            // console.log('Sign-in methods:', signInMethods);
            // if (signInMethods.length === 0) {
            //     setMessage('No user found with this email address.');
            //     return;
            // }
            await doPasswordReset(email);
            setMessage('Password reset email sent!');
        } catch (e) {
            setMessage('Error sending password reset email!');
        }
    };



    return (


        <section className="login_section pt-120 p3-bg">
            {userLoggedIn && (<Navigate to={'/dashboard'} replace={true} />)}
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
                                            <form onSubmit={onSubmit}>
                                                <div className="mb-5 mb-md-6">
                                                    <input className="n11-bg" name="Input-1" data-name="Input 1" placeholder="Email"
                                                        type="email" id="Input"
                                                        value={email} onChange={(e) => { setEmail(e.target.value) }}
                                                    />
                                                </div>
                                                <div className="mb-5 mb-md-6">
                                                    <input className="n11-bg" name="Input-3" data-name="Input 3" placeholder="Password"
                                                        type="password" id="Input-3"
                                                        value={password} onChange={(e) => { setPassword(e.target.value) }}
                                                    />
                                                </div>
                                                <button className="cmn-btn px-5 py-3 mb-6 w-100" type="submit">Login</button>
                                            </form>
                                        </div>
                                        <div className="login_section__socialmedia text-center mb-6">
                                            <span className="mb-6">Or continue with</span>
                                            <div className="login_section__social d-center gap-3">
                                                <Link href="#" className="n11-bg px-3 py-2 rounded-5"><IconBrandFacebookFilled className="ti ti-brand-facebook-filled fs-four" /></Link>
                                                <Link href="#" className="n11-bg px-3 py-2 rounded-5"><IconBrandTwitterFilled className="ti ti-brand-twitter-filled fs-four" /></Link>


                                                <Link href="#" onClick={(e) => { onGoogleSignIn(e) }} className="n11-bg px-3 py-2 rounded-5"><IconBrandGoogle className="ti ti-brand-google fs-four fw-bold" /></Link>
                                            </div>
                                        </div>
                                        <span className="d-center gap-1">
                                            <button className="g1-color" onClick={handleForgotPassword}>Forgot Password?</button>
                                        </span>
                                        <span className="d-center gap-1">Create your account? <Link className="g1-color" href="/create-acount">Sing Up Now</Link></span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Login