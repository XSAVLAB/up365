import { addWithdrawalRequest, fetchPendingWithdrawals, fetchUserWallet, handleChange, updateSettings } from '@/api/firestoreService';
import { auth } from '@/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useState } from 'react';

// Add the props type
interface KYCVerificationProps {
    amount: string;
}

export default function KYCVerification({ amount }: KYCVerificationProps) {
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [user, setUser] = useState<any>(null);
    const [walletBalance, setWalletBalance] = useState(0);
    const [upiID, setUpiID] = useState('');
    const [accountDetails, setaccountDetails] = useState({
        accountNumber: '',
        ifscCode: '',
        bankName: '',
        branchName: '',
        accountHolderName: '',
    });


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
            }
        });

        return () => unsubscribe();
    }, []);

    const onWithdrawalSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        if (user) {
            const withdrawalAmount = parseFloat(amount);
            const { accountNumber, ifscCode, bankName, branchName, accountHolderName } = accountDetails;
            try {
                const pendingWithdrawals = await fetchPendingWithdrawals(user.uid);
                const totalPendingAmount = pendingWithdrawals.reduce((total, request) => total + parseFloat(request.amount), 0);

                // Calculate effective balance after accounting for pending withdrawals
                const effectiveBalance = walletBalance - totalPendingAmount;

                if (effectiveBalance >= withdrawalAmount) {

                    await addWithdrawalRequest(user.uid, withdrawalAmount.toString(), accountNumber, ifscCode, bankName, branchName, accountHolderName, upiID);
                    setSuccessMessage(`Hurray! Your Request for ₹${withdrawalAmount} submitted successfully.Your amount will be credited within 24 hours.`);
                    setErrorMessage('');
                } else {
                    setErrorMessage(`Insufficient funds! Your Balance is ₹${walletBalance}`);
                    setSuccessMessage('');
                }
            } catch (error) {
                setErrorMessage("Error updating your details! Please try again after some time.");
                setSuccessMessage("");
            }
        } else {
            setErrorMessage("No user found");
            setSuccessMessage("");
        }
    };



    return (
        <div>
            {/* Success message */}
            {successMessage && (
                <div className="alert alert-success mb-4">
                    {successMessage}
                </div>
            )}

            {/* Error message */}
            {errorMessage && (
                <div className="alert alert-danger mb-4">
                    {errorMessage}
                </div>
            )}

            {!successMessage && !errorMessage && (
                <div>
                    <div className="pay_method__paymethod-title mb-5 mb-md-6">
                        <h5 className="n10-color">Recieve Payment through UPI or Direct to you bank account</h5>
                    </div>
                    <div>Withdrawal Amount: Rs. <b>{amount}</b></div>
                    <hr />
                    <div className="pay_method__paymethod-title mb-5 mb-md-6">
                        <h5 className="n10-color">Enter your UPI ID</h5>
                    </div>
                    <div className="pay_method__formarea">

                        <form onSubmit={onWithdrawalSubmit}>
                            <div className="d-flex align-items-center flex-wrap flex-md-nowrap gap-5 gap-md-6 mb-5">

                                <div className="d-flex w-100 p1-bg rounded-8">
                                    <input
                                        type="text"
                                        name="upiID"
                                        placeholder="Enter your UPI id"
                                        value={upiID}
                                        onChange={(e) => setUpiID(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <button className="cmn-btn py-3 px-10" type="submit">
                                Withdraw
                            </button>
                        </form>

                    </div>
                    <hr />
                    <div className="pay_method__paymethod-title mb-5 mb-md-6">
                        <h5 className="n10-color">Enter your bank details</h5>
                    </div>
                    <div className="pay_method__formarea">
                        <form onSubmit={onWithdrawalSubmit}>

                            <div className="d-flex align-items-center flex-wrap flex-md-nowrap gap-5 gap-md-6 mb-5">
                                <div className="d-flex w-100 p1-bg ps-3 rounded-8">
                                    <div className="d-flex align-items-center w-100">
                                        <i className="ti ti-credit-card fs-five"></i>
                                        <input
                                            type="text"
                                            id="accountNumber"
                                            name="accountNumber"
                                            placeholder="Account Number"
                                            value={accountDetails.accountNumber}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                const numericValue = value.replace(/\D/g, '');
                                                setaccountDetails({ ...accountDetails, accountNumber: numericValue });
                                            }}
                                            required
                                        />
                                    </div>

                                </div>
                                <div className="d-flex w-100 p1-bg rounded-8">
                                    <input
                                        type="text"
                                        name="ifscCode"
                                        placeholder="IFSC Code"
                                        value={accountDetails.ifscCode}
                                        onChange={handleChange(accountDetails, setaccountDetails)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-5 gap-md-6 mb-5 flex-wrap flex-md-nowrap">
                                <div className="d-flex w-100 p1-bg rounded-8">
                                    <input
                                        type="text"
                                        name="bankName"
                                        placeholder="Bank Name"
                                        value={accountDetails.bankName}
                                        onChange={handleChange(accountDetails, setaccountDetails)}
                                        required
                                    />
                                </div>
                                <div className="d-flex w-100 p1-bg rounded-8">
                                    <input
                                        type="text"
                                        name="branchName"
                                        placeholder="Branch Name"
                                        value={accountDetails.branchName}
                                        onChange={handleChange(accountDetails, setaccountDetails)}
                                        required
                                    />
                                </div>
                                <div className="d-flex w-100 p1-bg rounded-8">
                                    <input
                                        type="text"
                                        name="accountHolderName"
                                        placeholder="Account Holder Name"
                                        value={accountDetails.accountHolderName}
                                        onChange={handleChange(accountDetails, setaccountDetails)}
                                        required
                                    />
                                </div>

                            </div>
                            <button className="cmn-btn py-3 px-10" type="submit">
                                Withdraw
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}