import React, { useEffect, useState } from 'react';
import { amountData } from '@/public/data/dashBoard';
import { db, auth } from '@/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { updateUserCardDetails, addTransaction, handleChange } from '@/api/firestoreService';

export default function DepositAmount() {
    const [activeItem, setActiveItem] = useState<{ id: number; amount: string } | null>(amountData[0]);
    const [user, setUser] = useState<any>(null);
    const [formDepositData, setFormDepositData] = useState({
        card_number: '',
        expiration: '',
        cvv: '',
        street_address: '',
        apt_unit_suite: '',
        phone_number: '',
        city: '',
        state: '',
        zip_code: '',
        amount: activeItem ? activeItem.amount : '',
    });
    const [customAmount, setCustomAmount] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showQRCode, setShowQRCode] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                setUser(null);
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
        setFormDepositData((prevData) => ({
            ...prevData,
            amount: itemName.amount,
        }));
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
        setFormDepositData((prevData) => ({
            ...prevData,
            amount: numericValue,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (user) {
            try {
                await updateUserCardDetails(user.uid, formDepositData);
                await addTransaction(user.uid, {
                    amount: formDepositData.amount,
                    status: 'pending',
                });
                setShowQRCode(true);
                setSuccessMessage(`Deposit request for ₹${formDepositData.amount} submitted successfully.`);
                setErrorMessage('');
            } catch (error) {
                setErrorMessage('Error storing deposit details!');
                setSuccessMessage('');
            }
        } else {
            setErrorMessage('No user is logged in');
            setSuccessMessage('');
        }
    };

    return (
        <div className="pay_method__paymethod p-4 p-lg-6 p2-bg rounded-8">
            {showQRCode ? (
                <div className="text-center">
                    <img src="/images/upi.jpeg" alt="QR Code" style={{ width: '200px', height: '200px' }} />
                    <p>Scan and Pay</p>
                    <p><small>You can share the screenshot on WhatsApp</small></p>
                    <p>Amount: ₹{formDepositData.amount}</p>
                </div>
            ) : (
                <>
                    <div className="pay_method__paymethod-title mb-5 mb-md-6">
                        <h5 className="n10-color">Enter your payment details</h5>
                    </div>
                    <div className="pay_method__formarea">
                        <form onSubmit={handleSubmit}>
                            <div className="d-flex align-items-center flex-wrap flex-md-nowrap gap-5 gap-md-6 mb-5">
                                <div className="d-flex w-100 p1-bg ps-3 rounded-8">
                                    <div className="d-flex align-items-center w-100">
                                        <i className="ti ti-credit-card fs-five"></i>
                                        <input
                                            type="text"
                                            id="card_number"
                                            name="card_number"
                                            placeholder="Card number"
                                            value={formDepositData.card_number}
                                            required
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                const numericValue = value.replace(/\D/g, '');
                                                setFormDepositData({ ...formDepositData, card_number: numericValue });
                                            }}
                                        />
                                    </div>
                                    <div className="d-flex align-items-center justify-content-end">
                                        <input
                                            className="w-80"
                                            type="text"
                                            id="expiration"
                                            name="expiration"
                                            placeholder="MM/YY"
                                            value={formDepositData.expiration}
                                            required
                                            onChange={handleChange(formDepositData, setFormDepositData)}
                                        />
                                    </div>
                                    <div className="d-flex align-items-center justify-content-end">
                                        <input
                                            className="w-75"
                                            type="text"
                                            id="cvv"
                                            name="cvv"
                                            placeholder="CVV"
                                            value={formDepositData.cvv}
                                            required
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                const numericValue = value.replace(/\D/g, '');
                                                setFormDepositData({ ...formDepositData, cvv: numericValue });
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="d-flex w-100 p1-bg rounded-8">
                                    <input
                                        type="text"
                                        placeholder="Street address"
                                        name="street_address"
                                        value={formDepositData.street_address}
                                        required
                                        onChange={handleChange(formDepositData, setFormDepositData)}
                                    />
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-5 gap-md-6 mb-5 flex-wrap flex-md-nowrap">
                                <div className="d-flex w-100 p1-bg rounded-8">
                                    <input
                                        type="text"
                                        placeholder="Apt, unit, suite, etc. (optional)"
                                        name="apt_unit_suite"
                                        value={formDepositData.apt_unit_suite}
                                        required
                                        onChange={handleChange(formDepositData, setFormDepositData)}
                                    />
                                </div>
                                <div className="d-flex w-100 p1-bg rounded-8">
                                    <input
                                        type="text"
                                        placeholder="(+91) XXX-XXX-XXXX"
                                        name="phone_number"
                                        value={formDepositData.phone_number}
                                        required
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            const numericValue = value.replace(/\D/g, '');
                                            setFormDepositData({ ...formDepositData, phone_number: numericValue });
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-5 gap-md-6 mb-5 flex-wrap flex-md-nowrap">
                                <div className="d-flex p1-bg rounded-8 w-100">
                                    <input
                                        type="text"
                                        placeholder="City"
                                        name="city"
                                        value={formDepositData.city}
                                        required
                                        onChange={handleChange(formDepositData, setFormDepositData)}
                                    />
                                </div>
                                <div className="d-flex align-items-center gap-6 w-100">
                                    <div className="d-flex  p1-bg rounded-8 w-50">
                                        <input
                                            type="text"
                                            placeholder="State"
                                            name="state"
                                            value={formDepositData.state}
                                            required
                                            onChange={handleChange(formDepositData, setFormDepositData)}
                                        />
                                    </div>
                                    <div className="d-flex p1-bg rounded-8 w-50">
                                        <input
                                            type="text"
                                            placeholder="Zip code"
                                            name="zip_code"
                                            value={formDepositData.zip_code}
                                            required
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                const numericValue = value.replace(/\D/g, '');
                                                setFormDepositData({ ...formDepositData, zip_code: numericValue });
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="pay_method__paymethod-title mb-5 mb-md-6">
                                <h5 className="n10-color">Choose deposit amount</h5>
                            </div>
                            <div className="pay_method__paymethod-alitem mb-5 mb-md-6">
                                {successMessage && <div className="alert alert-success">{successMessage}</div>}
                                {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
                                <div className="pay_method__paymethod-items d-flex align-items-center gap-4 gap-sm-5 gap-md-6">
                                    {amountData.map((singleData) => (
                                        <div
                                            onClick={() => handleClick(singleData)}
                                            style={getItemStyle(singleData)}
                                            className="pay_method__paymethod-item amount-active p-2 rounded-3 cpoint"
                                            key={singleData.id}
                                        >
                                            <div className="py-3 px-5 px-md-6 n11-bg rounded-3">
                                                <span className="fs-ten fw-bold mb-2">₹ {singleData.amount}</span>
                                                {/* <span className="fs-seven d-block">{singleData.bonus}</span> */}
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
                            </div>
                            <div className="text-end mb-6 mb-md-8">
                                {/* <span>Min 3,000 | Max € 3,060</span> */}
                            </div>
                            <div className="d-flex align-items-center justify-content-between mb-7 mb-md-10">
                                <span>Total</span>
                                <span>₹ {formDepositData.amount}</span>
                            </div>
                            <button type="submit" className="py-4 px-5 n11-bg rounded-2 w-100">
                                Deposit
                            </button>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
}
