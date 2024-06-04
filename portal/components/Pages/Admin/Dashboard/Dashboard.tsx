"use client"
import React, { useEffect, useState } from 'react'
import { Tab } from '@headlessui/react';
import Link from 'next/link';
import { dashboardTabs } from '@/public/data/adminTabs';
import { doSignOut } from '../../../../firebase/auth';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebaseConfig';
import { fetchAllUsers, deleteUser } from '../../../../api/firestoreAdminService';

export default function Dashboard() {
    const [activeItem, setActiveItem] = useState(dashboardTabs[0]);
    const [user, setUser] = useState<User | null>(null);
    const [userDetails, setUserDetails] = useState<any[]>([]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                setUser(null);
            }
        });

        const fetchUsers = async () => {
            try {
                const users = await fetchAllUsers();
                setUserDetails(users);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
        return () => unsubscribe();
    }, []);

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

    const handleDeleteUser = async (userId: string) => {
        if (confirm("Are you sure you want to delete this user?")) {
            try {
                await deleteUser(userId);
                setUserDetails(userDetails.filter((user) => user.id !== userId));
            } catch (error) {
                console.error('Error deleting user:', error);
            }
        }
    };

    return (
        <>
            <section className="pay_method pb-120">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-12 gx-0 gx-sm-4">
                            <div className="hero_area__main">
                                <Tab.Group>
                                    <div className="row gy-6 gy-xxl-0 singletab">
                                        <div className="col-xxl-3">
                                            <div className="pay_method__scrol">
                                                <Tab.List className="tablinks pay_method__scrollbar p2-bg p-5 p-md-6 rounded-4 d-flex align-items-center justify-content-center flex-xxl-column gap-3 gap-xxl-2">
                                                    {dashboardTabs.map((singleTabs) => (
                                                        <Tab onClick={() => handleClick(singleTabs)} style={getItemStyle(singleTabs)} className="nav-links p-3 rounded-3 cpoint d-inline-block outstles" key={singleTabs.id}>
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
                                                    <div className="pay_method__tabletwo">
                                                        <div style={{ overflowX: 'auto' }} className="pay_method__table-scrollbar">
                                                            <table className="w-100 text-center p2-bg">
                                                                <thead>
                                                                    <tr>
                                                                        <th>Name</th>
                                                                        <th>Email Id</th>
                                                                        <th>Wallet Balance</th>
                                                                        <th>Edit</th>
                                                                        <th>Delete</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {userDetails.map((entry) => (
                                                                        <tr key={entry.id}>
                                                                            <td>{entry.firstName} {entry.lastName}</td>
                                                                            <td>{entry.email}</td>
                                                                            <td>{entry.wallet}</td>
                                                                            <td>
                                                                                <Link href={`/edit-user/${entry.id}`}>
                                                                                    <button className="btn btn-primary">Edit</button>
                                                                                </Link>
                                                                            </td>
                                                                            <td>
                                                                                <button onClick={() => handleDeleteUser(entry.id)} className="btn btn-danger">Delete</button>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
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
    );
}
