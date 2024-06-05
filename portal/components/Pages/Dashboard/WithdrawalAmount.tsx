import React, { useEffect, useState } from 'react'
import { dashboardAmmount } from '@/public/data/dashBoard';
import { db, auth } from '@/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { addWithdrawalRequest } from '@/api/firestoreService';

export default function WithdrawalAmount() {

    const [activeItem, setActiveItem] = useState(dashboardAmmount[0]);
    const [user, setUser] = useState<any>(null);

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

    const handleClick = (itemName: any) => {
        setActiveItem(itemName);
    };

    const getItemStyle = (itemName: any) => {
        return {
            border: `1px solid ${activeItem === itemName ? '#35C31E' : '#2C3655'}`,
        };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Submitting with active item:', activeItem);

        if (user) {
            try {
                await addWithdrawalRequest(user.uid, activeItem.amount);
            } catch (error) {
                console.error('Error storing withdrawal request: ', error);
            }
        } else {
            console.log('No user is logged in');
        }
    };

    return (
        <>
            <div className="pay_method__paymethod-alitem mb-5 mb-md-6">
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
                                    <span className="fs-ten fw-bold">{singleAmmount.amount}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button type="submit" className="py-4 px-5 n11-bg rounded-2 w-100">
                        Withdrawal {activeItem.amount}
                    </button>
                </form>
                <div className="text-center mt-4">
                    <span>Your withdrawal limit on month: $50,000</span>
                </div>
            </div>
        </>
    );
}
