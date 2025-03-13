"use client";
import Image from 'next/image'
import Link from 'next/link'
import { Navigate } from 'react-router-dom'
import React, { useState } from 'react'
import { useAuth } from '../../../contexts/authContext'
import { useRouter } from 'next/navigation';
import { IconBrandGoogle, IconBrandTwitterFilled, IconBrandFacebookFilled } from "@tabler/icons-react";
import { doCreateUserWithEmailAndPassword, doSignInWithGoogle } from '../../../firebase/auth'
import { createProfile } from '../../../api/firestoreService'
import { FacebookAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '@/firebaseConfig';
import { getDoc, doc, collection, getDocs, query, where } from 'firebase/firestore';

const CreateAccount = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNumber, setphoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isChecked, setIsChecked] = useState(false);
    const [isTermsAccepted, setIsTermsAccepted] = useState(false);
    const [isConsentGiven, setIsConsentGiven] = useState(false);
    const router = useRouter();

    const { userLoggedIn } = useAuth() || {};

    const handleTermsChange = (event: { target: { checked: boolean | ((prevState: boolean) => boolean); }; }) => {
        setIsTermsAccepted(event.target.checked);
    };

    const handleConsentChange = (event: { target: { checked: boolean | ((prevState: boolean) => boolean); }; }) => {
        setIsConsentGiven(event.target.checked);
    };

    const onSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        setMessage('');

        try {
            const q = query(collection(db, 'users'), where('phoneNumber', '==', phoneNumber));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                setMessage('Mobile number already registered!');
                return;
            }

            const userCredential = await doCreateUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            const profileData = {
                firstName,
                lastName,
                phoneNumber,
                email,
                isConsentGiven, // Save the consent status
                isTermsAccepted, // Save the terms acceptance status
            };

            await createProfile(user.uid, profileData);

            router.push('/');
        } catch (error) {
            setMessage('User Already Registered! Please Log in');
            console.error(error);
        }
    };

    const onGoogleSignIn = async (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.preventDefault();

        try {
            const userCredential = await doSignInWithGoogle();
            const user = userCredential.user;

            const userDoc = await getDoc(doc(db, "users", user.uid));

            if (userDoc.exists()) {
                const userData = userDoc.data();

                if (userData?.isBlocked === false) {
                    if (userData.role === 'admin') {
                        router.push('/admin');
                    } else {
                        router.push('/');
                    }
                } else {
                    setMessage('You are suspended from the system');
                }
            } else {
                const profileData = {
                    firstName: user.displayName?.split(' ')[0] || '',
                    lastName: user.displayName?.split(' ')[1] || '',
                    phoneNumber: '',
                    email: user.email,
                };
                await createProfile(user.uid, profileData);
                router.push('/');
            }
        } catch (e) {
            console.log(e);
        }
    };

    const onFacebookSignin = async (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.preventDefault();

        try {
            const provider = new FacebookAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Check if the user document exists
            const userDoc = await getDoc(doc(db, "users", user.uid));

            if (userDoc.exists()) {
                const userData = userDoc.data();

                // Check if the user is blocked
                if (userData?.isBlocked === false) {
                    if (userData.role === 'admin') {
                        router.push('/admin');
                    } else {
                        router.push('/');
                    }
                } else {
                    setMessage('You are suspended from the system');
                }
            } else {
                // If user does not exist, create a new profile
                const profileData = {
                    firstName: user.displayName?.split(' ')[0] || '',
                    lastName: user.displayName?.split(' ')[1] || '',
                    phoneNumber: '',
                    email: user.email,
                };
                await createProfile(user.uid, profileData);
                router.push('/');
            }
        } catch (error) {
            console.error(error);
            // setMessage('User Already Registered via Google! Please use Google to signin');
        }
    };
    const handleCheckboxChange = (event: { target: { checked: boolean | ((prevState: boolean) => boolean); }; }) => {
        setIsChecked(event.target.checked);
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
                                                        type="number"
                                                        required
                                                        value={phoneNumber}
                                                        onChange={(e) => setphoneNumber(e.target.value)}
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
                                                    <input type="checkbox" required onChange={handleTermsChange} />
                                                    <span>
                                                        By signing up, I hereby confirm that I am over 18, I read and accepted
                                                        the <a href="#">terms and conditions</a>
                                                    </span>
                                                </div>
                                                <div className="d-flex align-items-center flex-wrap flex-sm-nowrap gap-2 mb-6">
                                                    <input type="checkbox" onChange={handleConsentChange} />
                                                    <span>
                                                        I consent to the use of my email and mobile number for future
                                                        communications, updates, and promotional purposes.
                                                    </span>
                                                </div>
                                                <button
                                                    className={`cmn-btn px-5 py-3 mb-6 w-100 ${!isTermsAccepted ? 'btn-disabled' : ''}`}
                                                    type="submit"
                                                    disabled={!isTermsAccepted}
                                                >
                                                    Sign Up
                                                </button>
                                            </form>
                                        </div>
                                        <div className="login_section__socialmedia text-center mb-6">
                                            <span className="mb-6">Or continue with</span>
                                            <div className="login_section__social d-center gap-3">
                                                <Link href="#" onClick={(e) => { onFacebookSignin(e) }} className="n11-bg px-3 py-2 rounded-5">
                                                    <IconBrandFacebookFilled className="ti ti-brand-facebook-filled fs-four" />
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
        </section>
    )
}

export default CreateAccount