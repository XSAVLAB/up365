import React, { useEffect, useState } from 'react';
import { dashboardAmmount } from '@/public/data/dashBoard';
import { auth } from '@/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { fetchUserWallet } from '@/api/firestoreService';
import KYCVerification from './KYCVerification'; // Import the KYCVerification component

export default function WithdrawalAmount() {
    const [activeItem, setActiveItem] = useState<{ id: number; amount: string } | null>(dashboardAmmount[0]);
    const [user, setUser] = useState<any>(null);
    const [walletBalance, setWalletBalance] = useState(0);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [customAmount, setCustomAmount] = useState('');
    const [showKYC, setShowKYC] = useState(false);
    const [selectedAmount, setSelectedAmount] = useState(''); // State to store the selected amount

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                try {
                    const balance = await fetchUserWallet(currentUser.uid);
                    setWalletBalance(parseFloat(balance));
                } catch (error) {
                    setErrorMessage("Error fetching wallet balance");
                }
            } else {
                setUser(null);
                setWalletBalance(0);
            }
        });

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

    const handleClick = (itemName: { id: number; amount: string }) => {
        setActiveItem(itemName);
        setCustomAmount('');
    };

    const getItemStyle = (itemName: { id: number; amount: string }) => {
        return {
            border: `1px solid ${activeItem === itemName ? '#35C31E' : '#2C3655'}`,
        };
    };

    const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const numericValue = value.replace(/\D/g, '');
        setCustomAmount(numericValue);
        setActiveItem(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Set the selected amount before showing KYC screen
        setSelectedAmount(activeItem ? activeItem.amount : customAmount);

        // Show the KYCVerification component when the form is submitted
        setShowKYC(true);
    };

    // Display KYCVerification component if KYC is not completed
    if (showKYC) {
        return <KYCVerification amount={selectedAmount} />; // Pass the selected amount as a prop
    }

    return (
        <div className="pay_method__paymethod-alitem mb-5 mb-md-6">
            {successMessage && <div className="alert alert-success">{successMessage}</div>}
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
            <form onSubmit={handleSubmit}>
                <div className="pay_method__paymethod-items d-flex align-items-center gap-4 gap-sm-5 gap-md-6 mb-6">
                    {dashboardAmmount.map((singleAmmount) => (
                        <div
                            className="pay_method__paymethod-item p-2 rounded-3 cpoint"
                            key={singleAmmount.id}
                            onClick={() => handleClick(singleAmmount)}
                            style={getItemStyle(singleAmmount)}
                        >
                            <div className="py-3 px-5 px-md-6 n11-bg rounded-3">
                                <span className="fs-ten fw-bold">₹{singleAmmount.amount}</span>
                            </div>
                        </div>
                    ))}
                    <div className="d-flex w-100 p1-bg rounded-8">
                        <input
                            type="text"
                            placeholder="Custom amount"
                            value={customAmount}
                            onChange={handleCustomAmountChange}
                        />
                    </div>
                </div>
                <button type="submit" className="py-4 px-5 n11-bg rounded-2 w-100 cmn-btn">
                    Withdraw ₹{activeItem ? activeItem.amount : customAmount}
                </button>
            </form>
            <div className="text-center mt-4">
                <span>Your withdrawal limit for the month: ₹ 50,000</span>
            </div>
        </div>
    );
}
