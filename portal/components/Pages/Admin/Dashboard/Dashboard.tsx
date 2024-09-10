'use client'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tab } from '@headlessui/react';
import { dashboardTabs } from '@/public/data/adminTabs';
import { doSignOut } from '../../../../firebase/auth';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth, isAdmin as checkIsAdmin, db } from '@/firebaseConfig';
import { fetchAllUsers, deleteUser, fetchTransactions, updateTransactionStatus, updateUserWallet, fetchWithdrawals, updateWithdrawalStatus, fetchSeries, toggleSeriesActive, updateUserBlockStatus, updateComplaintStatus, updateComplaintRemark, fetchComplaints, updateMarqueeText, updatePasswordInFirebase, updateOfferPercentage, updateWhatsappNumber, updateNotificationStatus } from '../../../../api/firestoreAdminService';
import EditUserForm from '../UserManagement/EditUserForm';
import History from '../Dashboard/History';
import Payment from './Payment';
import Status from './Status';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { IconBellFilled } from '@tabler/icons-react';
import { onSnapshot, doc } from 'firebase/firestore';

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
    isBlocked?: boolean;
    blockComment?: string;
    timestamp: string;
}

interface Transaction {
    id: string;
    userId: string;
    amount: string;
    status: string;
    timestamp: string;
    comment: string;
    notifyAdmin: boolean;
}

interface Withdrawal {
    id: string;
    userId: string;
    amount: string;
    status: string;
    timestamp: string;
    comment: string;
    upiID: string;
    accountNumber: string;
    bankName: string;
    ifscCode: string;
    accountHolderName: string;
    branchName: string;
}
interface Complaint {
    id: string;
    adminRemarks: string;
    complaintType: string;
    createdAt: string;
    description: string;
    game: string;
    status: string;
    userId: string;
    timestamp: string;
}
export default function Dashboard() {
    const [activeItem, setActiveItem] = useState(dashboardTabs[0]);
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [userDetails, setUserDetails] = useState<User[]>([]);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [series, setSeries] = useState<any[]>([]);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [marqueeText, setMarqueeText] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [notification, setNotification] = useState('');
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const userIsAdmin = checkIsAdmin(currentUser.email);
                if (userIsAdmin) {
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
                const users = await fetchAllUsers() as User[];
                setUserDetails(users);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        // const fetchTransactionsData = async () => {
        //     try {
        //         const transactions = await fetchTransactions() as Transaction[];
        //         setTransactions(transactions);

        //         for (const transaction of transactions) {
        //             if (transaction.notifyAdmin) {
        //                 setNotification('New Transaction Request');
        //                 console.log('New transaction request received');
        //                 await updateNotifyAdmin(transaction.id, { notifyAdmin: false });
        //             }
        //         }
        //     } catch (error) {
        //         console.error('Error fetching transactions:', error);
        //     }
        // };

        const fetchTransactionsData = async () => {
            try {
                const transactions = await fetchTransactions() as Transaction[];
                setTransactions(transactions);


            } catch (error) {
                console.error('Error fetching transactions:', error);
            }
        };


        const fetchWithdrawalsData = async () => {
            try {
                const withdrawals = await fetchWithdrawals() as Withdrawal[];
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
        const fetchComplaintsData = async () => {
            try {
                const complaintsData = await fetchComplaints() as Complaint[];
                setComplaints(complaintsData);
            } catch (error) {
                console.error('Error fetching complaints:', error);
            }
        };

        fetchUsers();
        fetchTransactionsData();
        fetchWithdrawalsData();
        fetchSeriesData();
        fetchComplaintsData();
        return () => unsubscribe();
    }, [router]);
    useEffect(() => {
        const playSound = () => {
            const audio = new Audio('/notification2.wav');
            audio.play();
        };
        const unsubscribe = onSnapshot(doc(db, 'notifications', 'admin'), (doc) => {
            if (doc.exists()) {
                const notificationData = doc.data();
                if (notificationData?.newRequest) {
                    setNotification(notificationData.message || 'New notification');
                    updateNotificationStatus();
                    playSound();
                }
            }
        });

        return () => unsubscribe();
    }, []);
    useEffect(() => {
        const timer = setTimeout(() => {
            setMessage('');
            setSuccessMessage('');
            setErrorMessage('');
            setNotification('');
        }, 10000);
        return () => clearTimeout(timer);
    }, [message, successMessage, errorMessage, notification]);

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

    const handleUpdateTransaction = async (transactionId: string, userId: string, amount: string, status: string, comment: string) => {
        try {
            if (status === 'approved') {
                comment = comment || 'Approved without comment'; // Set a default comment if not provided
                await updateTransactionStatus(transactionId, status, comment);
                await updateUserWallet(userId, parseFloat(amount));
            } else if (status === 'rejected') {
                comment = prompt("Please enter a comment for rejecting this transaction:") ?? 'Reason not provide!';
                await updateTransactionStatus(transactionId, status, comment);
            } else {
                await updateTransactionStatus(transactionId, status);
            }

            setTransactions(transactions.map((transaction) =>
                transaction.id === transactionId ? { ...transaction, status, comment } : transaction
            ));
        } catch (error) {
            console.error('Error updating transaction:', error);
        }
    };


    const handleUpdateWithdrawal = async (withdrawalId: string, userId: string, amount: string, status: string, comment: string) => {
        try {
            if (status === 'approved') {
                comment = comment || 'Approved without comment';
                await updateWithdrawalStatus(withdrawalId, userId, parseFloat(amount), status, comment);
            }
            else if (status === 'rejected') {
                comment = prompt("Please enter a comment for rejecting this withdrawal:") ?? 'Reason not provide!';
                await updateWithdrawalStatus(withdrawalId, userId, parseFloat(amount), status, comment);
            }

            setWithdrawals(withdrawals.map((withdrawal) =>
                withdrawal.id === withdrawalId ? { ...withdrawal, status, comment } : withdrawal
            ));
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

    const handleBlockUser = async (userId: string) => {
        const comment = prompt("Please enter a comment for blocking this user:");
        if (comment !== null) {
            try {
                await updateUserBlockStatus(userId, true, comment);
                setUserDetails(userDetails.map((user) => user.id === userId ? { ...user, isBlocked: true, blockComment: comment } : user));
            } catch (error) {
                console.error('Error blocking user:', error);
            }
        }
    };

    const handleUnblockUser = async (userId: string) => {
        try {
            await updateUserBlockStatus(userId, false);
            setUserDetails(userDetails.map((user) => user.id === userId ? { ...user, isBlocked: false, blockComment: '' } : user));
        } catch (error) {
            console.error('Error unblocking user:', error);
        }
    };

    // Complaint section
    const handleUpdateComplaintStatus = async (complaintId: string, status: string) => {
        try {
            await updateComplaintStatus(complaintId, status);
            setComplaints(complaints.map((complaint) => complaint.id === complaintId ? { ...complaint, status } : complaint));
        } catch (error) {
            console.error('Error updating complaint status:', error);
        }
    };

    const handleUpdateComplaintRemark = (complaintId: string, remark: string) => {
        setComplaints(complaints.map((complaint) => complaint.id === complaintId ? { ...complaint, adminRemarks: remark } : complaint));
    };

    const handleSubmitComplaintRemark = async (complaintId: string) => {
        try {
            const complaint = complaints.find((complaint) => complaint.id === complaintId);
            if (complaint) {
                await updateComplaintRemark(complaintId, complaint.adminRemarks);
            }
        } catch (error) {
            console.error('Error submitting complaint remark:', error);
        }
    };
    // Marquee and Offers 
    const handleSubmitMarqueeText = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const marqueeText = event.currentTarget.marqueeText.value;
            await updateMarqueeText(marqueeText);
            setMessage("Marquee text updated successfully!");
        } catch (error) {
            console.error("Error updating marquee text", error);
            setMessage("Failed to update marquee text.");
        }
    };
    const handleSubmitOffer = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const offerPercentage = event.currentTarget.offerPercentage.value;
            await updateOfferPercentage(offerPercentage);
            setMessage("Offer updated successfully!");
        } catch (error) {
            console.error("Error updating Offer", error);
            setMessage("Failed to update Offer.");
        }
    };
    const handleSubmitWpNumber = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const whatsappNumber = event.currentTarget.whatsappNumber.value;
            await updateWhatsappNumber(whatsappNumber);
            setMessage("Whatsapp Number updated successfully!");
        } catch (error) {
            console.error("Error updating Whatsapp Number", error);
            setMessage("Failed to update Whatsapp Number.");
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'approved':
                return { color: 'green' };
            case 'rejected':
                return { color: 'red' };
            case 'pending':
                return { color: 'yellow' };
            default:
                return {};
        }
    };


    // Password Change
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

    const [formPasswordData, setFormPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const getUserNameById = (userId: string) => {
        const user = userDetails.find(user => user.id === userId);
        return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
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
                            <div className="hero_area__main1">
                                {successMessage && <div className="alert alert-success">{successMessage}</div>}
                                {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
                                {notification && <div className="alert alert-info"><IconBellFilled /> {notification}</div>}
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
                                                                            <th>Date</th>
                                                                            <th>Name</th>
                                                                            <th>Wallet</th>
                                                                            <th>Edit</th>
                                                                            <th>Delete</th>
                                                                            <th>Block/Unblock</th>
                                                                            <th>Comment</th>
                                                                            <th>Email</th>
                                                                            <th>Phone</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {userDetails.map((entry) => (
                                                                            <tr key={entry.id}>
                                                                                <td>{entry.timestamp}</td>
                                                                                <td>{entry.firstName} {entry.lastName}</td>
                                                                                <td>{entry.wallet}</td>
                                                                                <td>
                                                                                    <button onClick={() => handleEditUser(entry)} className="btn btn-primary">Edit</button>
                                                                                </td>
                                                                                <td>
                                                                                    <button onClick={() => handleDeleteUser(entry.id)} className="btn btn-danger">Delete</button>
                                                                                </td>
                                                                                <td>
                                                                                    {entry.isBlocked ? (
                                                                                        <button onClick={() => handleUnblockUser(entry.id)} className="btn btn-success">Unblock</button>
                                                                                    ) : (
                                                                                        <button onClick={() => handleBlockUser(entry.id)} className="btn btn-danger">Block</button>
                                                                                    )}
                                                                                </td>
                                                                                <td>{entry.blockComment || 'N/A'}</td>
                                                                                <td>{entry.email}</td>
                                                                                <td>{entry.phoneCode} {entry.phoneNumber}</td>
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
                                                                        <th>Timestamp</th>
                                                                        <th>User Name</th>
                                                                        <th>Amount</th>
                                                                        <th>Status</th>
                                                                        <th>Approve</th>
                                                                        <th>Reject</th>
                                                                        <th>Comment</th>
                                                                        <th>User ID</th>
                                                                        <th>Transaction ID</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {transactions.map((transaction) => (
                                                                        <tr key={transaction.id}>
                                                                            <td>{transaction.timestamp}</td>
                                                                            <td>{getUserNameById(transaction.userId)}</td>
                                                                            <td>{transaction.amount}</td>
                                                                            <td style={getStatusStyle(transaction.status)}>{transaction.status}</td>
                                                                            <td>
                                                                                <button onClick={() => handleUpdateTransaction(transaction.id, transaction.userId, transaction.amount, 'approved', "N/A")} className="btn btn-success" disabled={transaction.status !== 'pending'}>
                                                                                    Approve
                                                                                </button>
                                                                            </td>
                                                                            <td>
                                                                                <button onClick={() => handleUpdateTransaction(transaction.id, transaction.userId, transaction.amount, 'rejected', "N/A")} className="btn btn-danger" disabled={transaction.status !== 'pending'}>
                                                                                    Reject
                                                                                </button>
                                                                            </td>
                                                                            <td>{transaction.comment || 'N/A'}</td>
                                                                            <td>{transaction.userId}</td>
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
                                                                        <th>Timestamp</th>
                                                                        <th>User Name</th>
                                                                        <th>Amount</th>
                                                                        <th>Status</th>
                                                                        <th>Approve</th>
                                                                        <th>Reject</th>
                                                                        <th>Comment</th>
                                                                        <th>UPI id</th>
                                                                        <th>Account No.</th>
                                                                        <th>Bank Name</th>
                                                                        <th>IFSC</th>
                                                                        <th>Account Holder</th>
                                                                        <th>Branch Name</th>
                                                                        <th>User ID</th>
                                                                        <th>Withdrawal ID</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {withdrawals.map((withdrawal) => (
                                                                        <tr key={withdrawal.id}>
                                                                            <td>{withdrawal.timestamp}</td>
                                                                            <td>{getUserNameById(withdrawal.userId)}</td>
                                                                            <td>{withdrawal.amount}</td>
                                                                            <td style={getStatusStyle(withdrawal.status)}>{withdrawal.status}</td>
                                                                            <td>
                                                                                <button onClick={() => handleUpdateWithdrawal(withdrawal.id, withdrawal.userId, withdrawal.amount, 'approved', "N/A")} className="btn btn-success" disabled={withdrawal.status !== 'pending'}>
                                                                                    Approve
                                                                                </button>
                                                                            </td>
                                                                            <td>
                                                                                <button onClick={() => handleUpdateWithdrawal(withdrawal.id, withdrawal.userId, withdrawal.amount, 'rejected', "N/A")} className="btn btn-danger" disabled={withdrawal.status !== 'pending'}>
                                                                                    Reject
                                                                                </button>
                                                                            </td>
                                                                            <td>{withdrawal.comment || 'N/A'}</td>
                                                                            <td>{withdrawal.upiID || '-'}</td>
                                                                            <td>{withdrawal.accountNumber || '-'}</td>
                                                                            <td>{withdrawal.bankName || '-'}</td>
                                                                            <td>{withdrawal.ifscCode || '-'}</td>
                                                                            <td>{withdrawal.accountHolderName || '-'}</td>
                                                                            <td>{withdrawal.branchName || '-'}</td>
                                                                            <td>{withdrawal.userId}</td>
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
                                                <Tab.Panel>
                                                    <div className="pay_method__tabletwo">
                                                        <div style={{ overflowX: 'auto' }} className="pay_method__table-scrollbar">
                                                            <table className="w-100 text-center p2-bg">
                                                                <thead>
                                                                    <tr>
                                                                        <th>Created At</th>
                                                                        <th>User Name</th>
                                                                        <th>Complaint Type</th>
                                                                        <th>Description</th>
                                                                        <th>Problem</th>
                                                                        <th>Status</th>
                                                                        <th>Admin Remarks</th>
                                                                        <th>Submit Remark</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {complaints.map((complaint) => (
                                                                        <tr key={complaint.id}>
                                                                            <td className="text-nowrap">{complaint.timestamp}</td>
                                                                            <td className="text-nowrap">{getUserNameById(complaint.userId)}</td>
                                                                            <td className="text-nowrap">{complaint.complaintType}</td>
                                                                            <td className="text-balance">{complaint.description}</td>
                                                                            <td className="text-nowrap">{complaint.game}</td>
                                                                            <td>
                                                                                <select
                                                                                    value={complaint.status}
                                                                                    onChange={(e) => handleUpdateComplaintStatus(complaint.id, e.target.value)}
                                                                                >
                                                                                    <option value="Pending">Pending</option>
                                                                                    <option value="Resolved">Resolved</option>
                                                                                    <option value="Rejected">Rejected</option>
                                                                                </select>
                                                                            </td>
                                                                            <td className="text-balance">
                                                                                <input
                                                                                    type="text"
                                                                                    value={complaint.adminRemarks}
                                                                                    onChange={(e) => handleUpdateComplaintRemark(complaint.id, e.target.value)}
                                                                                />
                                                                            </td>
                                                                            <td className="text-nowrap">
                                                                                <button className="btn btn-primary" onClick={() => handleSubmitComplaintRemark(complaint.id)}>Submit</button>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </Tab.Panel>
                                                <Tab.Panel>
                                                    {message && (
                                                        <div className="mt-3 alert alert-success">
                                                            {message}
                                                        </div>
                                                    )}
                                                    <div className="pay_method__paymethod p-4 p-lg-6 p2-bg rounded-8">
                                                        <div className="pay_method__paymethod-title mb-5 mb-md-6">
                                                            <h5 className="n10-color">Enter the Marquee Text</h5>
                                                        </div>
                                                        <div className="pay_method__formarea">
                                                            <form onSubmit={handleSubmitMarqueeText}>
                                                                <div className="d-flex align-items-center flex-wrap flex-md-nowrap gap-5 gap-md-6 mb-5">
                                                                    <div className="w-100">
                                                                        <input
                                                                            className="n11-bg rounded-8"
                                                                            type="text"
                                                                            name="marqueeText"
                                                                            placeholder="Enter Marquee Text"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <button className="cmn-btn py-3 px-10" type="submit">
                                                                    Update
                                                                </button>
                                                            </form>

                                                        </div>
                                                    </div>
                                                    <hr />
                                                    <div className="pay_method__paymethod p-4 p-lg-6 p2-bg rounded-8">

                                                        <div className="pay_method__paymethod p-4 p-lg-6 p2-bg rounded-8">
                                                            <div className="pay_method__paymethod-title mb-5 mb-md-6">
                                                                <h5 className="n10-color">Update Whatsapp Number</h5>
                                                            </div>
                                                            <div className="pay_method__formarea">
                                                                <form onSubmit={handleSubmitWpNumber}>
                                                                    <div className="d-flex align-items-center flex-wrap flex-md-nowrap gap-5 gap-md-6 mb-5">
                                                                        <div className="w-100">
                                                                            <input
                                                                                className="n11-bg rounded-8"
                                                                                type="number"
                                                                                name="whatsappNumber"
                                                                                placeholder="Enter 10 Digit Whatsapp Number"
                                                                            />

                                                                        </div>
                                                                    </div>
                                                                    <button className="cmn-btn py-3 px-10" type="submit">
                                                                        Update
                                                                    </button>
                                                                </form>

                                                            </div>
                                                        </div>
                                                    </div>
                                                    <hr />
                                                    <div className="pay_method__paymethod p-4 p-lg-6 p2-bg rounded-8">
                                                        <div className="pay_method__paymethod-title mb-5 mb-md-6">
                                                            <h5 className="n10-color">Update the Offer Percentage</h5>
                                                        </div>
                                                        <div className="pay_method__formarea">
                                                            <form onSubmit={handleSubmitOffer}>
                                                                <div className="d-flex align-items-center flex-wrap flex-md-nowrap gap-5 gap-md-6 mb-5">
                                                                    <div className="w-100">
                                                                        <input
                                                                            className="n11-bg rounded-8"
                                                                            type="number"
                                                                            name="offerPercentage"
                                                                            placeholder="Enter Percentage %"
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
                                                    <Payment />
                                                </Tab.Panel>
                                                <Tab.Panel>
                                                    <Status />
                                                </Tab.Panel>
                                                <Tab.Panel >
                                                    <div className="pay_method__paymethod p-4 p-lg-6 p2-bg rounded-8">
                                                        <div className="pay_method__paymethod p-4 p-lg-6 p2-bg rounded-8 mt-6">
                                                            <div className="pay_method__paymethod-title mb-5 mb-md-6">
                                                                <h5 className="n10-color">Update Admin Password</h5>
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
                                                    </div>
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
    );
}
