'use client'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tab } from '@headlessui/react';
import Link from 'next/link';
import { dashboardTabs } from '@/public/data/adminTabs';
import { doSignOut } from '../../../../firebase/auth';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebaseConfig';
import { fetchAllUsers, deleteUser, fetchUserRole, fetchTransactions, updateTransactionStatus, updateUserWallet, fetchWithdrawals, updateWithdrawalStatus, fetchSeries, toggleSeriesActive } from '../../../../api/firestoreAdminService';
import EditUserForm from '../UserManagement/EditUserForm';
import History from '../Dashboard/History';

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    wallet: string;
    day: string;
    month: string;
    year: string;
    country: string;
    city: string;
    phoneCode: string;
    phoneNumber: string;
    address: string;
}

interface Transaction {
    id: string;
    userId: string;
    amount: string;
    status: string;
}

interface Withdrawal {
    id: string;
    userId: string;
    amount: string;
    status: string;
}

export default function Dashboard() {
    const [activeItem, setActiveItem] = useState(dashboardTabs[0]);
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [userDetails, setUserDetails] = useState<User[]>([]);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [series, setSeries] = useState<any[]>([]);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const role = await fetchUserRole(currentUser.uid);
                if (role === 'admin') {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                    router.push('/login');
                }
            } else {
                setUser(null);
                router.push('/login');
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

        const fetchTransactionsData = async () => {
            try {
                const transactions = await fetchTransactions();
                setTransactions(transactions);
            } catch (error) {
                console.error('Error fetching transactions:', error);
            }
        };

        const fetchWithdrawalsData = async () => {
            try {
                const withdrawals = await fetchWithdrawals();
                setWithdrawals(withdrawals);
            } catch (error) {
                console.error('Error fetching withdrawals:', error);
            }
        };

        const fetchSeriesData = async () => {
            try {
                const series = await fetchSeries();
                setSeries(series);
            } catch (error) {
                console.error('Error fetching series:', error);
            }
        };

        fetchUsers();
        fetchTransactionsData();
        fetchWithdrawalsData();
        fetchSeriesData();
        return () => unsubscribe();
    }, [router]);

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

    const handleEditUser = (user: User) => {
        setEditingUser(user);
    };

    const handleSaveUser = (updatedUser: User) => {
        setUserDetails(userDetails.map((user) => (user.id === updatedUser.id ? updatedUser : user)));
        setEditingUser(null);
    };

    const handleCancelEdit = () => {
        setEditingUser(null);
    };

    const handleUpdateTransaction = async (transactionId: string, userId: string, amount: string, status: string) => {
        try {
            await updateTransactionStatus(transactionId, status);
            if (status === 'approved') {
                await updateUserWallet(userId, parseFloat(amount));
            }
            setTransactions(transactions.map((transaction) => transaction.id === transactionId ? { ...transaction, status } : transaction));
        } catch (error) {
            console.error('Error updating transaction:', error);
        }
    };

    const handleUpdateWithdrawal = async (withdrawalId: string, userId: string, amount: string, status: string) => {
        try {
            if (status === 'approved') {
                await updateWithdrawalStatus(withdrawalId, userId, parseFloat(amount), status);
            }
            setWithdrawals(withdrawals.map((withdrawal) => withdrawal.id === withdrawalId ? { ...withdrawal, status } : withdrawal));
        } catch (error) {
            console.error('Error updating withdrawal:', error);
        }
    };

    const handleToggleSeries = async (seriesName: string, currentStatus: boolean) => {
        try {
            await toggleSeriesActive(seriesName, !currentStatus);
            setSeries(series.map((s) => s.id === seriesName ? { ...s, active: !currentStatus } : s));
        } catch (error) {
            console.error('Error toggling series active status:', error);
        }
    };

    if (!isAdmin) {
        return <div>Loading...</div>;
    }

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
                                                    {editingUser ? (
                                                        <EditUserForm
                                                            user={editingUser}
                                                            onSave={handleSaveUser}
                                                            onCancel={handleCancelEdit}
                                                        />
                                                    ) : (
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
                                                                                    <button onClick={() => handleEditUser(entry)} className="btn btn-primary">Edit</button>
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
                                                    )}
                                                </Tab.Panel>
                                                <Tab.Panel>
                                                    <div className="pay_method__tabletwo">
                                                        <div style={{ overflowX: 'auto' }} className="pay_method__table-scrollbar">
                                                            <table className="w-100 text-center p2-bg">
                                                                <thead>
                                                                    <tr>
                                                                        <th>User ID</th>
                                                                        <th>Amount</th>
                                                                        <th>Status</th>
                                                                        <th>Approve</th>
                                                                        <th>Reject</th>
                                                                        <th>Transaction ID</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {transactions.map((transaction) => (
                                                                        <tr key={transaction.id}>
                                                                            <td>{transaction.userId}</td>
                                                                            <td>{transaction.amount}</td>
                                                                            <td>{transaction.status}</td>
                                                                            <td>
                                                                                <button onClick={() => handleUpdateTransaction(transaction.id, transaction.userId, transaction.amount, 'approved')} className="btn btn-success" disabled={transaction.status !== 'pending'}>
                                                                                    Approve
                                                                                </button>
                                                                            </td>
                                                                            <td>
                                                                                <button onClick={() => handleUpdateTransaction(transaction.id, transaction.userId, transaction.amount, 'rejected')} className="btn btn-danger" disabled={transaction.status !== 'pending'}>
                                                                                    Reject
                                                                                </button>
                                                                            </td>
                                                                            <td>{transaction.id}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </Tab.Panel>
                                                <Tab.Panel>
                                                    <div className="pay_method__tabletwo">
                                                        <div style={{ overflowX: 'auto' }} className="pay_method__table-scrollbar">
                                                            <table className="w-100 text-center p2-bg">
                                                                <thead>
                                                                    <tr>
                                                                        <th>User ID</th>
                                                                        <th>Amount</th>
                                                                        <th>Status</th>
                                                                        <th>Approve</th>
                                                                        <th>Reject</th>
                                                                        <th>Withdrawal ID</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {withdrawals.map((withdrawal) => (
                                                                        <tr key={withdrawal.id}>
                                                                            <td>{withdrawal.userId}</td>
                                                                            <td>{withdrawal.amount}</td>
                                                                            <td>{withdrawal.status}</td>
                                                                            <td>
                                                                                <button onClick={() => handleUpdateWithdrawal(withdrawal.id, withdrawal.userId, withdrawal.amount, 'approved')} className="btn btn-success" disabled={withdrawal.status !== 'pending'}>
                                                                                    Approve
                                                                                </button>
                                                                            </td>
                                                                            <td>
                                                                                <button onClick={() => handleUpdateWithdrawal(withdrawal.id, withdrawal.userId, withdrawal.amount, 'rejected')} className="btn btn-danger" disabled={withdrawal.status !== 'pending'}>
                                                                                    Reject
                                                                                </button>
                                                                            </td>
                                                                            <td>{withdrawal.id}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </Tab.Panel>
                                                <Tab.Panel>
                                                    <History />
                                                </Tab.Panel>
                                                <Tab.Panel>
                                                    <div className="pay_method__tabletwo">
                                                        <div style={{ overflowX: 'auto' }} className="pay_method__table-scrollbar">
                                                            <table className="w-100 text-center p2-bg">
                                                                <thead>
                                                                    <tr>
                                                                        <th>Series Name</th>
                                                                        <th>Status</th>
                                                                        <th>Toggle Active</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {series.map((seriesItem) => (
                                                                        <tr key={seriesItem.id}>
                                                                            <td>{seriesItem.id}</td>
                                                                            <td>{seriesItem.active ? 'Active' : 'Inactive'}</td>
                                                                            <td>
                                                                                <button onClick={() => handleToggleSeries(seriesItem.id, seriesItem.active)} className="btn btn-primary">
                                                                                    {seriesItem.active ? 'Deactivate' : 'Activate'}
                                                                                </button>
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
