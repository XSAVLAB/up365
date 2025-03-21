import React, { useEffect, useState } from 'react';
import { amountData } from '@/public/data/dashBoard';
import { db, auth } from '@/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { updateUserCardDetails, addTransaction, fetchUpiID, fetchWhatsappNumber, fetchBankDetails } from '@/api/firestoreService';
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";
// import confetti from 'canvas-confetti';
import { BsClipboard, BsWhatsapp } from "react-icons/bs";
import { IconArrowBack, IconCopy } from '@tabler/icons-react';

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
    const [showUPI, setShowUPI] = useState(false);
    const [showDebitCard, setShowDebitCard] = useState(false);
    const [showBankDetails, setShowBankDetails] = useState(false);
    const [paymentStep, setPaymentStep] = useState(false);
    const [upiID, setUpiID] = useState('');
    const [bankDetails, setBankDetails] = useState<{ bankName?: string; accountNumber?: string; ifscCode?: string }>({});
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState<any>('');
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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const fetchedUpiID = await fetchUpiID();
                const fetchedBankDetails = await fetchBankDetails();

                setUpiID(fetchedUpiID);
                setBankDetails(fetchedBankDetails);
            } catch {
                setUpiID("Something went wrong! Please try another method.");
            }
        };

        fetchData();
    }, []);


    useEffect(() => {
        const fetchQRCode = async () => {
            try {
                const storage = getStorage();
                const listRef = ref(storage, 'qr-codes/');
                const res = await listAll(listRef);
                if (res.items.length > 0) {
                    const qrCodeRef = res.items[0];
                    const url = await getDownloadURL(qrCodeRef);
                    setQrCodeUrl(url);
                } else {
                    setQrCodeUrl("QR Code not found.");
                }
            } catch (error) {
                setQrCodeUrl("Error fetching QR Code.");
            }
        };

        fetchQRCode();
    }, []);
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

    const handlePaymentOption = (option: string) => {
        setShowQRCode(option === 'qr');
        setShowUPI(option === 'upi');
        setShowBankDetails(option === 'bank');
        setShowDebitCard(option === 'card');
        setPaymentStep(true);
    };

    const handleCardDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const numericValue = name === 'card_number' || name === 'cvv' || name === 'phone_number' || name === 'zip_code' ? value.replace(/\D/g, '') : value;
        setFormDepositData((prevData) => ({
            ...prevData,
            [name]: numericValue,
        }));
    };

    // const triggerConfetti = () => {
    //     confetti({
    //         particleCount: 700,
    //         spread: 360,
    //         origin: { y: 0.6 },
    //     });
    // };

    const handleCardDetails = async (e: React.FormEvent) => {
        e.preventDefault();

        if (user) {
            try {
                if (showDebitCard) {
                    await updateUserCardDetails(user.uid, formDepositData);
                }
                await addTransaction(user.uid, {
                    amount: formDepositData.amount,
                    status: 'pending',
                });
                // setSuccessMessage(`Deposit request for ₹${formDepositData.amount} submitted successfully.`);
                setErrorMessage('');
                // triggerConfetti();
            } catch (error) {
                setErrorMessage('Error storing deposit details!');
                setSuccessMessage('');
            }
        } else {
            setErrorMessage('No user is logged in');
            setSuccessMessage('');
        }
    };

    const handleDeposit = async () => {
        if (user) {
            try {
                await addTransaction(user.uid, {
                    amount: formDepositData.amount,
                    status: 'pending',
                    isSuccessShown: false,
                });
                setPaymentStep(true);
                // setSuccessMessage(`Deposit request for ₹${formDepositData.amount} submitted successfully.`);
                setErrorMessage('');
                // triggerConfetti();
            } catch (error) {
                setErrorMessage('Error storing deposit details!');
                setSuccessMessage('');
            }
        } else {
            setErrorMessage('No user is logged in');
            setSuccessMessage('');
        }
    };
    useEffect(() => {
        const fetchedWhatsappNumber = async () => {
            try {
                const fetchedWhatsappNumber = await fetchWhatsappNumber();
                setWhatsappNumber(fetchedWhatsappNumber);
            } catch (e) {
                console.error(e);
            }
        };

        fetchedWhatsappNumber();
    }, []);
    const handleWhatsAppClick = () => {
        const adminPhoneNumber = "+91" + whatsappNumber;
        console.log(adminPhoneNumber);
        const message = "Hello, I want to create an account. Please can you help me?";
        const whatsappURL = `https://wa.me/${adminPhoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappURL, '_blank');
    };
    const handleGoBack = () => {
        setPaymentStep(false);
        setShowQRCode(false);
        setShowUPI(false);
        setShowDebitCard(false);
        setShowBankDetails(false);
    };

    const handleCopy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setSuccessMessage("Copied!");
        } catch (error) {
            console.error("Failed to copy UPI ID", error);
        }
    };

    return (
        <div className="pay_method__paymethod p-4 p-lg-6 p2-bg rounded-8">
            <a onClick={handleGoBack} className="g1-color cursor-pointer"><IconArrowBack /> Back</a>

            <div className="pay_method__paymethod-title mb-5 mt-4 mb-md-6">
                <h5 className="n10-color">Deposit Amount</h5>
            </div>
            {!paymentStep ? (
                <>
                    <div className="pay_method__paymethod-title mb-5 mb-md-6">
                        <h6 className="n10-color">Choose deposit amount</h6>
                    </div>
                    <div className="pay_method__paymethod-alitem mb-5 mb-md-6">
                        {/* {successMessage && <div className="alert alert-success">{successMessage}</div>}
                        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>} */}
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
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="border p-2 rounded-3 mt-4">
                            <input
                                type="text"
                                placeholder="Custom amount"
                                value={customAmount}
                                onChange={handleCustomAmountChange}
                            />
                        </div>
                    </div>
                    <div className="text-end mb-6 mb-md-8"></div>
                    <div className="d-flex align-items-center mb-7 mb-md-10">
                        <span>Total ₹ {formDepositData.amount}</span>
                    </div>k
                    {/* <a onClick={handleWhatsAppClick} className="g1-color cursor-pointer">Need Help?</a> */}
                    <button onClick={handleWhatsAppClick} className="cmn-btn px-xxl-11">Need Help? <BsWhatsapp /></button>


                    <button onClick={handleDeposit} className="py-4 px-5 mt-4 n11-bg rounded-2 w-100 cmn-btn">
                        Deposit
                    </button>

                </>
            ) : (
                <>
                    {!showQRCode && !showUPI && !showDebitCard && !showBankDetails && (
                        <>
                            <div className="pay_method__paymethod-title mb-5 mb-md-6">
                                <h6 className="n10-color">Choose payment method</h6>
                            </div>
                            <div className="d-flex flex-column gap-3">
                                <button onClick={() => handlePaymentOption('qr')} className="py-2 px-3 btn btn-primary">
                                    Pay through QR Code
                                </button>
                                <button onClick={() => handlePaymentOption('upi')} className="py-2 px-3 btn btn-primary">
                                    Pay on UPI ID
                                </button>
                                <button onClick={() => handlePaymentOption('bank')} className="py-2 px-3 btn btn-primary">
                                    Pay directly to Bank Account
                                </button>
                                {/* <button onClick={() => handlePaymentOption('card')} className="py-2 px-3 btn btn-primary">
                                    Pay with Debit Card
                                </button> */}
                            </div>
                        </>
                    )}

                    {showQRCode && (
                        <div className="text-center">
                            {qrCodeUrl ? (
                                <img src={qrCodeUrl} alt="QR Code" style={{ width: '200px', height: '200px' }} />
                            ) : (
                                <p>{qrCodeUrl}</p>
                            )}
                            <p>Scan and Pay</p>
                            <p>Amount: <b>₹{formDepositData.amount}</b></p>
                            <p>Please share the Payment Screenshot on Whatsapp</p>

                            <button onClick={handleWhatsAppClick} className="cmn-btn px-xxl-11">Share <BsWhatsapp /></button>

                        </div>
                    )}

                    {showUPI && (
                        <div className="text-center">
                            {successMessage && <div className="alert alert-success">{successMessage}</div>}
                            <p className='mb-3'>
                                Pay using UPI ID: <strong>{upiID} </strong>
                                <button onClick={() => handleCopy(upiID)}>
                                    <IconCopy />
                                </button>
                            </p>
                            <p>Amount: <b>₹{formDepositData.amount}</b></p>
                            <p>Please share the Payment Screenshot on Whatsapp</p>
                            <button onClick={handleWhatsAppClick} className="cmn-btn px-xxl-11">
                                Share <BsWhatsapp />
                            </button>
                        </div>
                    )}
                    {showBankDetails && bankDetails && (
                        <div className="text-center">
                            <p>Bank Name: <strong>{bankDetails.bankName || "N/A"}</strong></p>
                            <p>Account No.: <strong>{bankDetails.accountNumber || "N/A"}</strong></p>
                            <p>IFSC Code: <strong>{bankDetails.ifscCode || "N/A"}</strong></p>
                            <p>Amount: <b>₹{formDepositData.amount}</b></p>
                            <p>Please share the Payment Screenshot on Whatsapp</p>
                            <button onClick={handleWhatsAppClick} className="cmn-btn px-xxl-11">
                                Share <BsWhatsapp />
                            </button>
                        </div>
                    )}


                    {/* {showDebitCard && (
                        <>
                            <div className="pay_method__paymethod-title mb-5 mb-md-6">
                                <h5 className="n10-color">Enter your card details</h5>
                            </div>
                            <div className="pay_method__formarea">
                                <form onSubmit={handleCardDetails}>
                                    <div className="d-flex align-items-center flex-wrap flex-md-nowrap gap-5 gap-md-6 mb-5">
                                        <div className="d-flex w-100 p1-bg ps-3 rounded-8">
                                            <div className="d-flex align-items-center justify-content-end">
                                                <input
                                                    className="w-100"
                                                    type="text"
                                                    id="card_number"
                                                    name="card_number"
                                                    placeholder="Card number"
                                                    value={formDepositData.card_number}
                                                    required
                                                    onChange={handleCardDetailsChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-end">
                                            <div className="d-flex align-items-center justify-content-end">
                                                <input
                                                    className="w-75"
                                                    type="text"
                                                    id="expiration2"
                                                    name="expiration"
                                                    placeholder="MM/YY"
                                                    value={formDepositData.expiration}
                                                    onChange={(e) => {
                                                        let value = e.target.value.replace(/\D/g, '');
                                                        if (value.length > 2) {
                                                            value = value.slice(0, 2) + '/' + value.slice(2, 4);
                                                        }
                                                        if (value.length > 5) {
                                                            value = value.slice(0, 5);
                                                        }
                                                        setFormDepositData({ ...formDepositData, expiration: value });
                                                    }}
                                                    maxLength={5}
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
                                                    onChange={handleCardDetailsChange}
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
                                                onChange={handleCardDetailsChange}
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
                                                onChange={handleCardDetailsChange}
                                            />
                                        </div>
                                        <div className="d-flex w-100 p1-bg rounded-8">
                                            <input
                                                type="text"
                                                placeholder="(+91) XXX-XXX-XXXX"
                                                name="phone_number"
                                                value={formDepositData.phone_number}
                                                required
                                                onChange={handleCardDetailsChange}
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
                                                onChange={handleCardDetailsChange}
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
                                                    onChange={handleCardDetailsChange}
                                                />
                                            </div>
                                            <div className="d-flex p1-bg rounded-8 w-50">
                                                <input
                                                    type="text"
                                                    placeholder="Zip code"
                                                    name="zip_code"
                                                    value={formDepositData.zip_code}
                                                    required
                                                    onChange={handleCardDetailsChange}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <button type="submit" className="py-4 px-5 n11-bg rounded-2 w-100">
                                        Submit
                                    </button>
                                </form>
                            </div>
                        </>
                    )} */}
                </>
            )}
        </div>
    );
}
