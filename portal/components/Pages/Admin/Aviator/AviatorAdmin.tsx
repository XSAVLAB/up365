'use client';
import { SetStateAction, useEffect, useState } from 'react';
import { setCrashLimits, subscribeToCrashLimits } from '../../../../api/firestoreAdminService';

export default function Admin() {
    const [minCrashInput, setMinCrashInput] = useState(1);
    const [maxCrashInput, setMaxCrashInput] = useState(100);
    const [message, setMessage] = useState<string | null>(null);

    // Subscribe to real-time crash limits updates from Firestore
    useEffect(() => {
        const unsubscribe = subscribeToCrashLimits((limits: { minCrash: SetStateAction<number>; maxCrash: SetStateAction<number>; }) => {
            if (limits) {
                setMinCrashInput(limits.minCrash);
                setMaxCrashInput(limits.maxCrash);
            }
        });

        // Cleanup listener on component unmount
        return () => unsubscribe();
    }, []);

    const updateLimits = async () => {
        if (minCrashInput < maxCrashInput) {
            try {
                await setCrashLimits(minCrashInput, maxCrashInput);
                setMessage('Crash limits updated successfully');
            } catch (error) {
                console.error("Error updating crash limits: ", error);
                setMessage('Failed to update crash limits');
            }
        } else {
            setMessage('Minimum crash point should be less than the maximum crash point.');
        }
    };

    return (
        <div className="pay_method__paymethod p-4 p-lg-6 p2-bg rounded-8">
            {message && (
                <div className={`mt-3 alert ${message.includes('success') ? 'alert-success' : 'alert-danger'}`}>
                    {message}
                </div>
            )}
            <div className="pay_method__paymethod-title mb-5 mb-md-6">
                <h5 className="n10-color">Aviator Controller</h5>
            </div>
            <div className="d-flex align-items-center flex-wrap flex-md-nowrap gap-5 gap-md-6 mb-5">
                <div className="w-50">
                    <label className='result-message'>Minimum Crash Point:</label>
                    <input
                        className="n11-bg rounded-8"
                        type="number"
                        value={minCrashInput}
                        min={0}
                        onChange={(e) => setMinCrashInput(Number(e.target.value))}
                    />
                    <label className='result-message'>Maximum Crash Point:</label>
                    <input
                        className="n11-bg rounded-8"
                        type="number"
                        value={maxCrashInput}
                        min={minCrashInput + 1} // Ensure minCrashInput is always less than maxCrashInput
                        onChange={(e) => setMaxCrashInput(Number(e.target.value))}
                    />
                </div>
            </div>
            <button className="cmn-btn py-3 px-10" onClick={updateLimits}>Update Limits</button>
        </div>
    );
}
