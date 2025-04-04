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
import { fetchBalanceHistory, fetchProfileData, fetchUserBets, fetchUserComplaints, fetchUserWallet, handleChange, updatePasswordInFirebase, updateProfile, updateSettings } from '../../../api/firestoreService';
import UserStatement from './UserStatement';
import ComplaintForm from './Complaints';
import { FaEye, FaEyeSlash } from 'react-icons/fa';


export default function Dashboard() {
    const [activeItem, setActiveItem] = useState(dashboardTabs[0]);
    const [user, setUser] = useState<User | null>(null);
    const [balanceHistory, setBalanceHistory] = useState<any[]>([]);
    const [successMessage, setSuccessMessage] = useState('');
    const [walletBalance, setWalletBalance] = useState('0');
    const [errorMessage, setErrorMessage] = useState('');
    const [userBets, setUserBets] = useState<any[]>([]);
    const [complaintsHistory, setComplaintsHistory] = useState<any[]>([]);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
                fetchComplaints(currentUser.uid);
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
        cvv: '',
        streetAddress: '',
        aptUnit: '',
        phoneNumber: '',
        city: '',
        state: '',
        zipCode: '',
    });
    // Update Password
    const [formPasswordData, setFormPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const onPasswordSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        if (formPasswordData.newPassword !== formPasswordData.confirmPassword) {
            setErrorMessage("Passwords do not match!");
            return;
        }
        try {
            if (user) {
                const result = await updatePasswordInFirebase(
                    user.email,
                    formPasswordData.currentPassword,
                    formPasswordData.newPassword
                );
                if (result.success) {
                    setSuccessMessage("Password updated successfully!");
                    setErrorMessage("");
                } else {
                    setErrorMessage("Please enter correct current password!");
                }
            } else {
                setErrorMessage("No user found");
            }
        } catch (error) {
            setErrorMessage("Error updating password!");
        }
    };
    const togglePasswordVisibility = (type: string) => {
        if (type === 'current') {
            setShowCurrentPassword(!showCurrentPassword);
        } else if (type === 'new') {
            setShowNewPassword(!showNewPassword);
        } else if (type === 'confirm') {
            setShowConfirmPassword(!showConfirmPassword);
        }
    };

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
    // Fetch Complaints
    const fetchComplaints = async (userId: string) => {
        try {
            const complaints = await fetchUserComplaints(userId);
            setComplaintsHistory(complaints);
        } catch (error) {
            console.error('Error fetching complaints history:', error);
        }
    };

    // Logout
    const handleLogout = async () => {
        try {
            const confirmation = window.confirm('Are you sure you want to logout?');
            if (confirmation) {
                await doSignOut();
                window.location.replace('/login');
                console.log('Logged out successfully');
            }
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
                                                                        <th className="text-nowrap">Comment</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {balanceHistory.map((entry) => (
                                                                        <tr key={entry.id}>
                                                                            {/* <td className="text-nowrap">{entry.id}</td> */}
                                                                            <td className="text-nowrap">{entry.timestamp}</td>
                                                                            <td className="text-nowrap">{entry.type}</td>
                                                                            <td className="text-nowrap">{entry.amount}</td>
                                                                            <td className={`${entry.status === 'approved' ? 'g1-color' : entry.status === 'pending' ? 'y1-color' : 'r1-color'} fw-normal cpoint text-nowrap`}>{entry.status}
                                                                            </td>
                                                                            <td className="text-nowrap">{entry.comment || "N/A"}</td>

                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </Tab.Panel>
                                                <Tab.Panel>
                                                    {user && <UserStatement userId={user.uid} />}
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


                                                <Tab.Panel>
                                                    <div>
                                                        <h2>Complaint History</h2>
                                                        <div className="pay_method__tabletwo">
                                                            <div style={{ overflowX: 'auto' }} className="pay_method__table-scrollbar">
                                                                <table className="w-100 text-left p2-bg">
                                                                    <thead>
                                                                        <tr>
                                                                            <th className="text-nowrap">Date</th>
                                                                            <th className="text-nowrap">Game</th>
                                                                            <th className="text-nowrap">Complaint Type</th>
                                                                            <th className="text-nowrap">Description</th>
                                                                            <th className="text-nowrap">Admin Remarks</th>
                                                                            <th className="text-nowrap">Status</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {complaintsHistory.map((complaint) => (
                                                                            <tr key={complaint.id}>
                                                                                <td className="text-nowrap">{new Date(complaint.createdAt).toLocaleDateString()}</td>
                                                                                <td className="text-nowrap">{complaint.game}</td>
                                                                                <td className="text-nowrap">{complaint.complaintType}</td>
                                                                                <td className="text-balance">{complaint.description}</td>
                                                                                <td className="text-nowrap">{complaint.adminRemarks}</td>
                                                                                <td className={`fw-normal cpoint text-nowrap ${complaint.status === 'Resolved' ? 'g1-color' : 'r1-color'}`}>
                                                                                    {complaint.status}
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Tab.Panel>
                                                <Tab.Panel >
                                                    <div className="pay_method__paymethod p-4 p-lg-6 p2-bg rounded-8">
                                                        <div className="pay_method__paymethod p-4 p-lg-6 p2-bg rounded-8 mt-6">
                                                            <div className="pay_method__paymethod-title mb-5 mb-md-6">
                                                                <h5 className="n10-color">Update Your Password</h5>
                                                            </div>
                                                            <div className="pay_method__formarea">
                                                                <form onSubmit={onPasswordSubmit}>
                                                                    {/* Current Password */}
                                                                    <div className="d-flex align-items-center w-100 p1-bg ps-3 rounded-8 mb-5">
                                                                        <input
                                                                            type={showCurrentPassword ? "text" : "password"}
                                                                            name="currentPassword"
                                                                            placeholder="Current Password"
                                                                            value={formPasswordData.currentPassword}
                                                                            onChange={(e) =>
                                                                                setFormPasswordData({
                                                                                    ...formPasswordData,
                                                                                    currentPassword: e.target.value,
                                                                                })
                                                                            }
                                                                            className="flex-grow-1"
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            className="btn"
                                                                            onClick={() => togglePasswordVisibility('current')}
                                                                        >
                                                                            {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                                                                        </button>
                                                                    </div>

                                                                    {/* New Password */}
                                                                    <div className="d-flex align-items-center w-100 p1-bg ps-3 rounded-8 mb-5">
                                                                        <input
                                                                            type={showNewPassword ? "text" : "password"}
                                                                            name="newPassword"
                                                                            placeholder="New Password"
                                                                            value={formPasswordData.newPassword}
                                                                            onChange={(e) =>
                                                                                setFormPasswordData({
                                                                                    ...formPasswordData,
                                                                                    newPassword: e.target.value,
                                                                                })
                                                                            }
                                                                            className="flex-grow-1"
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            className="btn"
                                                                            onClick={() => togglePasswordVisibility('new')}
                                                                        >
                                                                            {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                                                        </button>
                                                                    </div>

                                                                    {/* Confirm Password */}
                                                                    <div className="d-flex align-items-center w-100 p1-bg ps-3 rounded-8 mb-5">
                                                                        <input
                                                                            type={showConfirmPassword ? "text" : "password"}
                                                                            name="confirmPassword"
                                                                            placeholder="Confirm Password"
                                                                            value={formPasswordData.confirmPassword}
                                                                            onChange={(e) =>
                                                                                setFormPasswordData({
                                                                                    ...formPasswordData,
                                                                                    confirmPassword: e.target.value,
                                                                                })
                                                                            }
                                                                            className="flex-grow-1"
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            className="btn"
                                                                            onClick={() => togglePasswordVisibility('confirm')}
                                                                        >
                                                                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                                                        </button>
                                                                    </div>

                                                                    <button type="submit" className="py-4 px-5 n11-bg rounded-2 w-100">
                                                                        Update Password
                                                                    </button>
                                                                </form>
                                                            </div>
                                                        </div>
                                                        {/* <div className="pay_method__paymethod-title mb-5 mb-md-6">
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
                                                                                onChange={(e) => {
                                                                                    const value = e.target.value;
                                                                                    const numericValue = value.replace(/\D/g, '');
                                                                                    setFormSettingsData({ ...formSettingsData, cardNumber: numericValue });
                                                                                }}
                                                                            />
                                                                        </div>
                                                                        <div className="d-flex align-items-center justify-content-end">
                                                                            <input
                                                                                className="w-75"
                                                                                type="text"
                                                                                id="expiration2"
                                                                                name="expiration"
                                                                                placeholder="MM/YY"
                                                                                value={formSettingsData.expiration}
                                                                                onChange={(e) => {
                                                                                    let value = e.target.value.replace(/\D/g, '');
                                                                                    if (value.length > 2) {
                                                                                        value = value.slice(0, 2) + '/' + value.slice(2, 4);
                                                                                    }
                                                                                    if (value.length > 5) {
                                                                                        value = value.slice(0, 5);
                                                                                    }
                                                                                    setFormSettingsData({ ...formSettingsData, expiration: value });
                                                                                }}
                                                                                maxLength={5}
                                                                            />
                                                                        </div>
                                                                        <div className="d-flex align-items-center justify-content-end">
                                                                            <input
                                                                                className="w-75"
                                                                                type="text"
                                                                                id="expiration2"
                                                                                name="cvv"
                                                                                placeholder="CVV"
                                                                                value={formSettingsData.cvv}
                                                                                onChange={(e) => {
                                                                                    const value = e.target.value;
                                                                                    const numericValue = value.replace(/\D/g, '');
                                                                                    setFormSettingsData({ ...formSettingsData, cvv: numericValue });
                                                                                }}
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
                                                                            placeholder="(+91) XXX-XXX-XXXX"
                                                                            value={formSettingsData.phoneNumber}
                                                                            onChange={(e) => {
                                                                                const value = e.target.value;
                                                                                const numericValue = value.replace(/\D/g, '');
                                                                                setFormSettingsData({ ...formSettingsData, phoneNumber: numericValue });
                                                                            }}
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
                                                                                onChange={(e) => {
                                                                                    const value = e.target.value;
                                                                                    const numericValue = value.replace(/\D/g, '');
                                                                                    setFormSettingsData({ ...formSettingsData, zipCode: numericValue });
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <button type="submit" className="py-4 px-5 n11-bg rounded-2 w-100">Save</button>
                                                            </form>
                                                        </div> */}
                                                    </div>
                                                </Tab.Panel>
                                                <Tab.Panel>
                                                    <div className="pay_method__paymethod p-4 p-lg-6 p2-bg rounded-8">
                                                        <div className="pay_method__paymethod-title mb-5 mb-md-6">
                                                            <h5 className="n10-color">About You</h5>
                                                        </div>
                                                        <div className="pay_method__formarea">

                                                            <form onSubmit={onSubmit}>
                                                                <div className="d-flex align-items-center flex-wrap flex-md-nowrap gap-5 gap-md-6 mb-5">
                                                                    <div className="w-100">
                                                                        <label className="mb-3">First Name</label>
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
                                                                    {/* <div className="w-100">
                                                                        <label className="mb-3">Date Of Birth</label>
                                                                        <div className="d-flex align-items-center gap-6 w-100">
                                                                            <div className="d-flex n11-bg rounded-8 w-50">
                                                                                <input
                                                                                    type="text"
                                                                                    name="day"
                                                                                    placeholder="12"
                                                                                    value={formProfileData.day}
                                                                                    onChange={(e) => {
                                                                                        const value = e.target.value;
                                                                                        const numericValue = value.replace(/\D/g, '');
                                                                                        setFormProfileData({ ...formProfileData, day: numericValue });
                                                                                    }} />
                                                                            </div>
                                                                            <div className="d-flex n11-bg rounded-8 w-50">
                                                                                <input
                                                                                    type="text"
                                                                                    name="month"
                                                                                    placeholder="09"
                                                                                    value={formProfileData.month}
                                                                                    onChange={(e) => {
                                                                                        const value = e.target.value;
                                                                                        const numericValue = value.replace(/\D/g, '');
                                                                                        setFormProfileData({ ...formProfileData, month: numericValue });
                                                                                    }} />
                                                                            </div>
                                                                            <div className="d-flex n11-bg rounded-8 w-50">
                                                                                <input
                                                                                    type="text"
                                                                                    name="year"
                                                                                    placeholder="1999"
                                                                                    value={formProfileData.year}
                                                                                    onChange={(e) => {
                                                                                        const value = e.target.value;
                                                                                        const numericValue = value.replace(/\D/g, '');
                                                                                        setFormProfileData({ ...formProfileData, year: numericValue });
                                                                                    }} />
                                                                            </div>
                                                                        </div>
                                                                    </div> */}
                                                                    <div className="w-100">
                                                                        <label className="mb-3">Phone Number</label>
                                                                        <div className="d-flex gap-2">
                                                                            <input
                                                                                className="w-25 n11-bg rounded-8"
                                                                                type="text"
                                                                                name="phoneCode"
                                                                                placeholder="+91"
                                                                                value={formProfileData.phoneCode}
                                                                                onChange={(e) => {
                                                                                    const value = e.target.value;
                                                                                    const numericValue = value.replace(/\D/g, '');
                                                                                    setFormProfileData({ ...formProfileData, phoneCode: numericValue });
                                                                                }} />
                                                                            <input
                                                                                className="n11-bg rounded-8"
                                                                                type="text"
                                                                                name="phoneNumber"
                                                                                placeholder="XX-XXX-XXXXX"
                                                                                value={formProfileData.phoneNumber}
                                                                                onChange={(e) => {
                                                                                    const value = e.target.value;
                                                                                    const numericValue = value.replace(/\D/g, '');
                                                                                    setFormProfileData({ ...formProfileData, phoneNumber: numericValue });
                                                                                }} />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                {/* <div className="d-flex align-items-center flex-wrap flex-md-nowrap gap-5 gap-md-6 mb-5">
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
                                                                </div> */}
                                                                <button className="cmn-btn py-3 px-10" type="submit">
                                                                    Update
                                                                </button>
                                                            </form>
                                                        </div>
                                                    </div>
                                                </Tab.Panel>
                                                <Tab.Panel>
                                                    {user && <ComplaintForm userId={user.uid} />}
                                                </Tab.Panel>
                                                <Tab.Panel>
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
                </div >
            </section >
        </>
    )
}

