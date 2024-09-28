'use client';
import { useEffect, useState } from 'react';
import { setCrashLimits, subscribeToCrashLimits } from '../../../../api/firestoreAdminService';

export default function Admin() {
    const [minCrashZero, setMinCrashZero] = useState(1);
    const [maxCrashZero, setMaxCrashZero] = useState(100);

    const [minCrashOneTwo, setMinCrashOneTwo] = useState(1);
    const [maxCrashOneTwo, setMaxCrashOneTwo] = useState(100);

    const [minCrashThreePlus, setMinCrashThreePlus] = useState(1);
    const [maxCrashThreePlus, setMaxCrashThreePlus] = useState(100);

    const [message, setMessage] = useState<string | null>(null);

    // Subscribe to real-time crash limits updates from Firestore
    useEffect(() => {
        const unsubscribe = subscribeToCrashLimits((limits: any) => {
            if (limits) {
                setMinCrashZero(limits.minCrashZero);
                setMaxCrashZero(limits.maxCrashZero);

                setMinCrashOneTwo(limits.minCrashOneTwo);
                setMaxCrashOneTwo(limits.maxCrashOneTwo);

                setMinCrashThreePlus(limits.minCrashThreePlus);
                setMaxCrashThreePlus(limits.maxCrashThreePlus);
            }
        });

        // Cleanup listener on component unmount
        return () => unsubscribe();
    }, []);

    const updateLimits = async () => {
        // Check if min/max inputs are valid across all forms
        if (
            minCrashZero < maxCrashZero &&
            minCrashOneTwo < maxCrashOneTwo &&
            minCrashThreePlus < maxCrashThreePlus
        ) {
            try {
                await setCrashLimits({
                    minCrashZero,
                    maxCrashZero,
                    minCrashOneTwo,
                    maxCrashOneTwo,
                    minCrashThreePlus,
                    maxCrashThreePlus
                });
                setMessage('Crash limits updated successfully');
            } catch (error) {
                console.error("Error updating crash limits: ", error);
                setMessage('Failed to update crash limits');
            }
        } else {
            setMessage('Minimum crash point should be less than the maximum crash point in all fields.');
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

            {/* Form for "If 0 Users" */}
            <hr />
            <div className="mb-5">
                <h6>If 0 Users</h6>
                <div className="d-flex align-items-center gap-4">
                    <div>
                        <label className='result-message'>Minimum Crash Point:</label>
                        <input
                            className="n11-bg rounded-8"
                            type="number"
                            value={minCrashZero}
                            min={0}
                            onChange={(e) => setMinCrashZero(Number(e.target.value))}
                        />
                    </div>
                    <div>
                        <label className='result-message'>Maximum Crash Point:</label>
                        <input
                            className="n11-bg rounded-8"
                            type="number"
                            value={maxCrashZero}
                            min={minCrashZero + 1}
                            onChange={(e) => setMaxCrashZero(Number(e.target.value))}
                        />
                    </div>
                </div>
            </div>

            {/* Form for "If 1,2 Users" */}
            <hr />

            <div className="mb-5">
                <h6>If 1,2 Users</h6>
                <div className="d-flex align-items-center gap-4">
                    <div>
                        <label className='result-message'>Minimum Crash Point:</label>
                        <input
                            className="n11-bg rounded-8"
                            type="number"
                            value={minCrashOneTwo}
                            min={0}
                            onChange={(e) => setMinCrashOneTwo(Number(e.target.value))}
                        />
                    </div>
                    <div>
                        <label className='result-message'>Maximum Crash Point:</label>
                        <input
                            className="n11-bg rounded-8"
                            type="number"
                            value={maxCrashOneTwo}
                            min={minCrashOneTwo + 1}
                            onChange={(e) => setMaxCrashOneTwo(Number(e.target.value))}
                        />
                    </div>
                </div>
            </div>
            <hr />

            {/* Form for "If 3+ Users" */}
            <div className="mb-5">
                <h6>If 3+ Users</h6>
                <div className="d-flex align-items-center gap-4">
                    <div>
                        <label className='result-message'>Minimum Crash Point:</label>
                        <input
                            className="n11-bg rounded-8"
                            type="number"
                            value={minCrashThreePlus}
                            min={0}
                            onChange={(e) => setMinCrashThreePlus(Number(e.target.value))}
                        />
                    </div>
                    <div>
                        <label className='result-message'>Maximum Crash Point:</label>
                        <input
                            className="n11-bg rounded-8"
                            type="number"
                            value={maxCrashThreePlus}
                            min={minCrashThreePlus + 1}
                            onChange={(e) => setMaxCrashThreePlus(Number(e.target.value))}
                        />
                    </div>
                </div>
            </div>

            <button className="cmn-btn py-3 px-10" onClick={updateLimits}>Update Limits</button>
        </div>
    );
}
