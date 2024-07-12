"use client"
import React, { useEffect, useState } from 'react'
import { IconBellRinging, } from "@tabler/icons-react";
import DepositCard from './DepositCard';
import DepositAmount from './DepositAmount';
import { Tab } from '@headlessui/react';
import WithdrawalAmount from './WithdrawalAmount';
import { dashboardTabs } from '@/public/data/dashTabs';
import { doSignOut } from '../../../firebase/auth';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebaseConfig';
import { fetchBalanceHistory, fetchProfileData, fetchUserBets, fetchUserWallet, handleChange, updateProfile, updateSettings } from '../../../api/firestoreService';

export default function Dashboard() {
    const [activeItem, setActiveItem] = useState(dashboardTabs[0]);
    const [user, setUser] = useState<User | null>(null);
    const [balanceHistory, setBalanceHistory] = useState<any[]>([]);
    const [successMessage, setSuccessMessage] = useState('');
    const [walletBalance, setWalletBalance] = useState('0');
    const [errorMessage, setErrorMessage] = useState('');
    const [userBets, setUserBets] = useState<any[]>([]);
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                fetchBalanceHistory(currentUser.uid)
                    .then(data => setBalanceHistory(data))
                    .catch(error => console.error('Error fetching balance history:', error));
                fetchProfileData(currentUser.uid)
                    .then((profileData) => {
                        if (profileData) {
                            setFormProfileData(profileData);
                        }
                    })
                    .catch((error) =>
                        console.error("Error fetching profile data:", error)
                    );
                fetchUserWallet(currentUser.uid)
                    .then(data => setWalletBalance(data))
                    .catch(error => console.error('Error fetching wallet balance: ', error));
                fetchBets(currentUser.uid);
            } else {
                setUser(null);
                setUserBets([]);
            }
        });
        const fetchBets = async (userId: string) => {
            try {
                const bets = await fetchUserBets(userId);
                setUserBets(bets);
            } catch (error) {
                console.error('Error fetching user bets:', error);
            }
        };
        return () => unsubscribe();
    }, []);
    useEffect(() => {
        if (successMessage || errorMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage('');
                setErrorMessage('');
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [successMessage, errorMessage]);
    // Profile
    const [formProfileData, setFormProfileData] = useState({
        firstName: "",
        lastName: "",
        day: "",
        month: "",
        year: "",
        phoneCode: "",
        phoneNumber: "",
        address: "",
        gender: "",
        city: "",
        country: "",
    });


    // Settings
    const [formSettingsData, setFormSettingsData] = useState({
        cardNumber: '',
        expiration: '',
        streetAddress: '',
        aptUnit: '',
        phoneNumber: '',
        city: '',
        state: '',
        zipCode: '',
    });

    const onSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        if (user) {
            try {
                await updateProfile(user.uid, formProfileData);
                setSuccessMessage("Data updated successfully");
                setErrorMessage("");
            } catch (error) {
                setErrorMessage("Error updating data!");
                setSuccessMessage("");
            }
        } else {
            setErrorMessage("No user found");
            setSuccessMessage("");
        }
    };

    const onSettingsSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        if (user) {
            try {
                await updateSettings(user.uid, formSettingsData);
                setSuccessMessage("Payment details updated successfully");
                setErrorMessage("");
            } catch (error) {
                setErrorMessage("Error updating payment details!");
                setSuccessMessage("");
            }
        } else {
            setErrorMessage("No user found");
            setSuccessMessage("");
        }
    };
    // Logout
    const handleLogout = async () => {
        try {
            await doSignOut();
            window.location.replace('/login');
            console.log('Logged out successfully');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const handleClick = (itemName: any) => {
        if (itemName.tabname === 'Log out') {
            handleLogout();

        } else {
            setActiveItem(itemName);
        }
    };

    const getItemStyle = (itemName: any) => {
        return {
            backgroundColor: activeItem === itemName ? '#0F1B42' : '',
        };
    };

    return (
        <>
            <section className="pay_method pb-120">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-12 gx-0 gx-sm-4">
                            <div className="hero_area__main">
                                {successMessage && <div className="alert alert-success">{successMessage}</div>}
                                {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

                                <Tab.Group>
                                    <div className="row gy-6 gy-xxl-0 singletab">
                                        <div className="col-xxl-3">
                                            <div className="pay_method__scrol">
                                                <Tab.List
                                                    className="tablinks pay_method__scrollbar p2-bg p-5 p-md-6 rounded-4 d-flex align-items-center justify-content-center flex-xxl-column gap-3 gap-xxl-2">
                                                    {dashboardTabs.map((singleTabs) => (
                                                        <Tab onClick={() => handleClick(singleTabs)}
                                                            style={getItemStyle(singleTabs)} className="nav-links p-3 rounded-3 cpoint d-inline-block outstles" key={singleTabs.id}>
                                                            <span className="tablink d-flex align-items-center gap-2 outstles">
                                                                {singleTabs.icon}
                                                                {singleTabs.tabname}
                                                            </span>
                                                        </Tab>
                                                    ))}

                                                </Tab.List>
                                            </div>
                                        </div>
                                        <div className="col-xxl-9">
                                            <Tab.Panels className="tabcontents">
                                                <Tab.Panel>
                                                    <div className="pay_method__paymethod p-4 p-lg-6 p2-bg rounded-8">
                                                        <div className="pay_method__paymethod-title mb-5 mb-md-6">
                                                            <h5 className="n10-color">About You</h5>
                                                        </div>
                                                        <div className="pay_method__formarea">

                                                            <form onSubmit={onSubmit}>
                                                                <div className="d-flex align-items-center flex-wrap flex-md-nowrap gap-5 gap-md-6 mb-5">
                                                                    <div className="w-100">
                                                                        <label className="mb-3">First Name (Given Name)</label>
                                                                        <input
                                                                            className="n11-bg rounded-8"
                                                                            type="text"
                                                                            name="firstName"
                                                                            placeholder="First Name"
                                                                            value={formProfileData.firstName}
                                                                            onChange={handleChange(formProfileData, setFormProfileData)} />
                                                                    </div>
                                                                    <div className="w-100">
                                                                        <label className="mb-3">Last Name</label>
                                                                        <input
                                                                            className="n11-bg rounded-8"
                                                                            type="text"
                                                                            name="lastName"
                                                                            placeholder="Last Name"
                                                                            value={formProfileData.lastName}
                                                                            onChange={handleChange(formProfileData, setFormProfileData)} />
                                                                    </div>
                                                                </div>
                                                                <div className="d-flex align-items-center gap-5 gap-md-6 mb-5 flex-wrap flex-md-nowrap">
                                                                    <div className="w-100">
                                                                        <label className="mb-3">Date Of Birth</label>
                                                                        <div className="d-flex align-items-center gap-6 w-100">
                                                                            <div className="d-flex n11-bg rounded-8 w-50">
                                                                                <input
                                                                                    type="text"
                                                                                    name="day"
                                                                                    placeholder="12"
                                                                                    value={formProfileData.day}
                                                                                    onChange={handleChange(formProfileData, setFormProfileData)} />
                                                                            </div>
                                                                            <div className="d-flex n11-bg rounded-8 w-50">
                                                                                <input
                                                                                    type="text"
                                                                                    name="month"
                                                                                    placeholder="09"
                                                                                    value={formProfileData.month}
                                                                                    onChange={handleChange(formProfileData, setFormProfileData)} />
                                                                            </div>
                                                                            <div className="d-flex n11-bg rounded-8 w-50">
                                                                                <input
                                                                                    type="text"
                                                                                    name="year"
                                                                                    placeholder="1999"
                                                                                    value={formProfileData.year}
                                                                                    onChange={handleChange(formProfileData, setFormProfileData)} />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="w-100">
                                                                        <label className="mb-3">Phone Number</label>
                                                                        <div className="d-flex gap-2">
                                                                            <input
                                                                                className="w-25 n11-bg rounded-8"
                                                                                type="text"
                                                                                name="phoneCode"
                                                                                placeholder="+962"
                                                                                value={formProfileData.phoneCode}
                                                                                onChange={handleChange(formProfileData, setFormProfileData)} />
                                                                            <input
                                                                                className="n11-bg rounded-8"
                                                                                type="text"
                                                                                name="phoneNumber"
                                                                                placeholder="XX-XXX-XXXXX"
                                                                                value={formProfileData.phoneNumber}
                                                                                onChange={handleChange(formProfileData, setFormProfileData)} />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="d-flex align-items-center flex-wrap flex-md-nowrap gap-5 gap-md-6 mb-5">
                                                                    <div className="w-100">
                                                                        <label className="mb-3">Address</label>
                                                                        <input
                                                                            className="n11-bg rounded-8"
                                                                            type="text"
                                                                            name="address"
                                                                            placeholder="Address..."
                                                                            value={formProfileData.address}
                                                                            onChange={handleChange(formProfileData, setFormProfileData)} />
                                                                    </div>
                                                                    <div className="w-100">
                                                                        <label className="mb-3 d-block">Male & Female</label>
                                                                        <select
                                                                            className="n11-bg extrastyle rounded-8 w-100 py-3 pe-5"
                                                                            name="gender"
                                                                            value={formProfileData.gender}
                                                                            onChange={handleChange(formProfileData, setFormProfileData)}                                                                        >
                                                                            <option className="p6-color" value="">
                                                                                Select Gender...
                                                                            </option>
                                                                            <option className="p6-color" value="Male">
                                                                                Male
                                                                            </option>
                                                                            <option className="p6-color" value="Female">
                                                                                Female
                                                                            </option>
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                                <div className="d-flex align-items-center flex-wrap flex-md-nowrap gap-5 gap-md-6 mb-5">
                                                                    <div className="w-100">
                                                                        <label className="mb-3">City / Region</label>
                                                                        <input
                                                                            className="n11-bg rounded-8"
                                                                            type="text"
                                                                            name="city"
                                                                            placeholder="City / Region..."
                                                                            value={formProfileData.city}
                                                                            onChange={handleChange(formProfileData, setFormProfileData)} />
                                                                    </div>
                                                                    <div className="w-100">
                                                                        <label className="mb-3">Country</label>
                                                                        <input
                                                                            className="n11-bg rounded-8"
                                                                            type="text"
                                                                            name="country"
                                                                            placeholder="United Kingdom"
                                                                            value={formProfileData.country}
                                                                            onChange={handleChange(formProfileData, setFormProfileData)}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <button className="cmn-btn py-3 px-10" type="submit">
                                                                    Update
                                                                </button>
                                                            </form>
                                                        </div>
                                                    </div>
                                                </Tab.Panel>
                                                <Tab.Panel>
                                                    {/* <div className="pay_method__paymethod p-4 p-lg-6 p2-bg rounded-8 mb-8 mb-md-10">
                                                        <div
                                                            className="pay_method__paymethod-title d-flex align-items-center gap-3 mb-6 mb-md-8">
                                                            <i className="ti ti-credit-card fs-four g1-color"></i>
                                                            <h5 className="n10-color">Payment methods</h5>
                                                        </div>
                                                        <div className="pay_method__paymethod-alitem">
                                                            <div className="row gx-4 gy-4">
                                                                <DepositCard />
                                                            </div>
                                                        </div>
                                                    </div> */}
                                                    <DepositAmount />
                                                </Tab.Panel>
                                                <Tab.Panel>
                                                    {/* <div className="pay_method__paymethod p-4 p-lg-6 p2-bg rounded-8 mb-8 mb-md-10">
                                                        <div
                                                            className="pay_method__paymethod-title d-flex align-items-center gap-3 mb-6 mb-md-8">
                                                            <i className="ti ti-credit-card fs-four g1-color"></i>
                                                            <h5 className="n10-color">Payment methods</h5>
                                                        </div>
                                                        <div className="pay_method__paymethod-alitem">
                                                            <div className="row gx-4 gy-4">
                                                                <DepositCard />
                                                            </div>
                                                        </div>
                                                    </div> */}
                                                    <div className="pay_method__paymethod p-4 p-lg-6 p2-bg rounded-8">
                                                        <div className="pay_method__paymethod-title mb-5 mb-md-6">
                                                            <h5 className="n10-color">Choose or enter your withdrawal amount</h5>
                                                        </div>
                                                        <div
                                                            className="pay_method__amount d-flex align-content-center justify-content-between py-3 px-5 px-md-6 mb-6 mb-md-8 flex-wrap gap-3">
                                                            <div className="pay_method__amount-actual">
                                                                <span className="fs-seven mb-3">Available balance</span>
                                                                <div className="d-flex align-items-center gap-3">
                                                                    <span className="fw-bol">₹ {walletBalance}</span>
                                                                    <i className="ti ti-refresh fs-seven cpoint"></i>
                                                                </div>
                                                            </div>
                                                            <span className="v-line lgx d-none d-sm-block"></span>
                                                            <div className="pay_method__amount-sports">
                                                                <span className="fs-seven mb-3">Bonus No Sports</span>
                                                                <span className="fw-bol d-block">₹ 0.00</span>
                                                            </div>
                                                            <span className="v-line lgx d-none d-sm-block"></span>
                                                            <div className="pay_method__amount-sports">
                                                                <span className="fs-seven mb-3">Bonus in casino</span>
                                                                <span className="fw-bol d-block">₹ 0.00</span>
                                                            </div>
                                                        </div>
                                                        <WithdrawalAmount />
                                                    </div>
                                                </Tab.Panel>
                                                {/* <Tab.Panel>
                                                    <div className="pay_method__table">
                                                        <div style={{ overflowX: 'auto' }} className="pay_method__table-scrollbar">
                                                            <table className="w-100 text-center p2-bg">
                                                                <tr>
                                                                    <th className="text-nowrap">Transaction ID</th>
                                                                    <th className="text-nowrap">Payment Methods</th>
                                                                    <th className="text-nowrap">Amount</th>
                                                                    <th className="text-nowrap">Status</th>
                                                                </tr>

                                                                <tr>
                                                                    <td>ZT3FA5D8N7</td>
                                                                    <td>Ethereum</td>
                                                                    <td>5,591 USD</td>
                                                                    <td className="g1-color fw-normal cpoint">Complete</td>
                                                                </tr>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </Tab.Panel> */}
                                                <Tab.Panel>
                                                    <div className="pay_method__tabletwo">
                                                        <div style={{ overflowX: 'auto' }} className="pay_method__table-scrollbar">
                                                            <table className="w-100 text-center p2-bg">
                                                                <thead>
                                                                    <tr>
                                                                        {/* <th className="text-nowrap">Transaction ID</th> */}
                                                                        <th className="text-nowrap">Date</th>
                                                                        <th className="text-nowrap">Transaction Type</th>
                                                                        <th className="text-nowrap">Amount/Balance</th>
                                                                        <th className="text-nowrap">Status</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {balanceHistory.map((entry) => (
                                                                        <tr key={entry.id}>
                                                                            {/* <td className="text-nowrap">{entry.id}</td> */}
                                                                            <td className="text-nowrap">{new Date(entry.timestamp.seconds * 1000).toLocaleString()}</td>
                                                                            <td className="text-nowrap">{entry.type}</td>
                                                                            <td className="text-nowrap">{entry.amount}</td>
                                                                            <td className={`${entry.status === 'Complete' ? 'g1-color' : 'r1-color'} fw-normal cpoint text-nowrap`}>
                                                                                {entry.status}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </Tab.Panel>


                                                <Tab.Panel >
                                                    <div className="pay_method__paymethod p-4 p-lg-6 p2-bg rounded-8">
                                                        <div className="pay_method__paymethod-title mb-5 mb-md-6">
                                                            <h5 className="n10-color">Enter your payment details</h5>
                                                        </div>
                                                        <div className="pay_method__formarea">
                                                            <form onSubmit={onSettingsSubmit}>
                                                                <div className="d-flex align-items-center flex-wrap flex-md-nowrap gap-5 gap-md-6 mb-5">
                                                                    <div className="d-flex w-100 p1-bg ps-3 rounded-8">
                                                                        <div className="d-flex align-items-center w-100">
                                                                            <i className="ti ti-credit-card fs-five"></i>
                                                                            <input
                                                                                type="text"
                                                                                id="card_number2"
                                                                                name="cardNumber"
                                                                                placeholder="Card number"
                                                                                value={formSettingsData.cardNumber}
                                                                                onChange={handleChange(formSettingsData, setFormSettingsData)}
                                                                            />
                                                                        </div>
                                                                        <div className="d-flex align-items-center justify-content-end">
                                                                            <input
                                                                                className="w-75"
                                                                                type="text"
                                                                                id="expiration2"
                                                                                name="expiration"
                                                                                placeholder="MM/YY CVC"
                                                                                value={formSettingsData.expiration}
                                                                                onChange={handleChange(formSettingsData, setFormSettingsData)}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <div className="d-flex w-100 p1-bg rounded-8">
                                                                        <input
                                                                            type="text"
                                                                            name="streetAddress"
                                                                            placeholder="Street address"
                                                                            value={formSettingsData.streetAddress}
                                                                            onChange={handleChange(formSettingsData, setFormSettingsData)}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="d-flex align-items-center gap-5 gap-md-6 mb-5 flex-wrap flex-md-nowrap">
                                                                    <div className="d-flex w-100 p1-bg rounded-8">
                                                                        <input
                                                                            type="text"
                                                                            name="aptUnit"
                                                                            placeholder="Apt, unit, suite, etc. (optional)"
                                                                            value={formSettingsData.aptUnit}
                                                                            onChange={handleChange(formSettingsData, setFormSettingsData)}
                                                                        />
                                                                    </div>
                                                                    <div className="d-flex w-100 p1-bg rounded-8">
                                                                        <input
                                                                            type="text"
                                                                            name="phoneNumber"
                                                                            placeholder="(+33)7 35 55 21 02"
                                                                            value={formSettingsData.phoneNumber}
                                                                            onChange={handleChange(formSettingsData, setFormSettingsData)}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="d-flex align-items-center gap-5 gap-md-6 mb-5 flex-wrap flex-md-nowrap">
                                                                    <div className="d-flex p1-bg rounded-8 w-100">
                                                                        <input
                                                                            type="text"
                                                                            name="city"
                                                                            placeholder="City"
                                                                            value={formSettingsData.city}
                                                                            onChange={handleChange(formSettingsData, setFormSettingsData)}
                                                                        />
                                                                    </div>
                                                                    <div className="d-flex align-items-center gap-6 w-100">
                                                                        <div className="d-flex p1-bg rounded-8 w-50">
                                                                            <input
                                                                                type="text"
                                                                                name="state"
                                                                                placeholder="State"
                                                                                value={formSettingsData.state}
                                                                                onChange={handleChange(formSettingsData, setFormSettingsData)}
                                                                            />
                                                                        </div>
                                                                        <div className="d-flex p1-bg rounded-8 w-50">
                                                                            <input
                                                                                type="text"
                                                                                name="zipCode"
                                                                                placeholder="Zip code"
                                                                                value={formSettingsData.zipCode}
                                                                                onChange={handleChange(formSettingsData, setFormSettingsData)}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                {/* <div className="d-flex align-items-center justify-content-between mb-7 mb-md-10">
                                                                    <span>Total</span>
                                                                    <span>₹ 3,000</span>
                                                                </div>  */}
                                                                <button type="submit" className="py-4 px-5 n11-bg rounded-2 w-100">Save</button>
                                                            </form>
                                                        </div>
                                                    </div>
                                                </Tab.Panel>
                                                <Tab.Panel>
                                                    <div className="pay_method__tabletwo">
                                                        <div style={{ overflowX: 'auto' }} className="pay_method__table-scrollbar">
                                                            <table className="w-100 text-center p2-bg">
                                                                <thead>
                                                                    <tr>
                                                                        <th>Match</th>
                                                                        <th>Your Team</th>
                                                                        <th>Odds</th>
                                                                        <th>Bet Amount</th>
                                                                        <th>Status</th>
                                                                        <th>Bet ID</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {userBets.map((bet) => (
                                                                        <tr key={bet.id}>
                                                                            <td>{bet.team1} Vs {bet.team2}</td>
                                                                            <td>{bet.selectedTeam}</td>
                                                                            <td>{bet.odds}</td>
                                                                            <td>{bet.betAmount}</td>
                                                                            <td>{bet.status}</td>
                                                                            <td>{bet.id}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </Tab.Panel>
                                                {/* <Tab.Panel>
                                                    <div className="pay_method__paymethod p-4 p-lg-6 p2-bg rounded-8">
                                                        <div
                                                            className="pay_method__paymethod-title d-flex align-items-center gap-3 mb-6 mb-md-8">
                                                            <IconBellRinging width={28} height={28} className="ti ti-bell-ringing fs-four" />
                                                            <h5 className="n10-color">Notifications settings </h5>
                                                        </div>
                                                        <div className="pay_method__Notiitem d-flex align-items-center gap-3 justify-content-between align-items-center pb-5 pb-md-6 mb-5 mb-md-6">
                                                            <div className="pay_method__Notiitem-text">
                                                                <h6 className="mb-3">Email Notifications</h6>
                                                                <span className="fs-seven n4-color">Receive weekly email notifications.</span>
                                                            </div>
                                                            <div className="pay_method__Notiitem-switcher">
                                                                <label className="switch">
                                                                    <input type="checkbox" />
                                                                    <div className="slider">
                                                                        <div className="circle">

                                                                        </div>
                                                                    </div>
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div className="pay_method__Notiitem d-flex align-items-center gap-3 justify-content-between align-items-center pb-5 pb-md-6 mb-5 mb-md-6">
                                                            <div className="pay_method__Notiitem-text">
                                                                <h6 className="mb-3">Phone Notifications</h6>
                                                                <span className="fs-seven n4-color">Receive weekly Phone notifications.</span>
                                                            </div>
                                                            <div className="pay_method__Notiitem-switcher">
                                                                <label className="switch">
                                                                    <input type="checkbox" />
                                                                    <div className="slider">
                                                                        <div className="circle">

                                                                        </div>
                                                                    </div>
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div className="pay_method__Notiitem d-flex align-items-center gap-3 justify-content-between align-items-center pb-5 pb-md-6 mb-5 mb-md-6">
                                                            <div className="pay_method__Notiitem-text">
                                                                <h6 className="mb-3">New tasks</h6>
                                                                <span className="fs-seven n4-color">Receive weekly New tasks notifications.</span>
                                                            </div>
                                                            <div className="pay_method__Notiitem-switcher">
                                                                <label className="switch">
                                                                    <input type="checkbox" />
                                                                    <div className="slider">
                                                                        <div className="circle">

                                                                        </div>
                                                                    </div>
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div className="pay_method__Notiitem d-flex align-items-center gap-3 justify-content-between align-items-center pb-5 pb-md-6 mb-5 mb-md-6">
                                                            <div className="pay_method__Notiitem-text">
                                                                <h6 className="mb-3">Billing and payments</h6>
                                                                <span className="fs-seven n4-color">Lorem ipsum dolor sit amet consectetur. Id.</span>
                                                            </div>
                                                            <div className="pay_method__Notiitem-switcher">
                                                                <label className="switch">
                                                                    <input type="checkbox" />
                                                                    <div className="slider">
                                                                        <div className="circle">

                                                                        </div>
                                                                    </div>
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div className="pay_method__Notiitem d-flex align-items-center gap-3 justify-content-between align-items-center border-0">
                                                            <div className="pay_method__Notiitem-text">
                                                                <h6 className="mb-3">Updates and announcements</h6>
                                                                <span className="fs-seven n4-color">Lorem ipsum dolor sit amet consectetur.</span>
                                                            </div>
                                                            <div className="pay_method__Notiitem-switcher">
                                                                <label className="switch">
                                                                    <input type="checkbox" />
                                                                    <div className="slider">
                                                                        <div className="circle">

                                                                        </div>
                                                                    </div>
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Tab.Panel> */}
                                                <Tab.Panel>
                                                </Tab.Panel>
                                            </Tab.Panels>
                                        </div>
                                    </div>
                                </Tab.Group>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

