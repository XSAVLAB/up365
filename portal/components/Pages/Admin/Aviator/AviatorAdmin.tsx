'use client';
import { useEffect, useState } from 'react';
import { crashAviatorPlane, setCrashLimits, subscribeToCrashLimits } from '../../../../api/firestoreAdminService';
import { fetchCurrentAviatorUsers } from '../../../../api/firestoreAdminService';
export default function Admin() {
    const [minCrashZero, setMinCrashZero] = useState(1);
    const [maxCrashZero, setMaxCrashZero] = useState(100);

    const [minCrashOneTwo, setMinCrashOneTwo] = useState(1);
    const [maxCrashOneTwo, setMaxCrashOneTwo] = useState(100);

    const [minCrashThreePlus, setMinCrashThreePlus] = useState(1);
    const [maxCrashThreePlus, setMaxCrashThreePlus] = useState(100);

    const [currentUserCount, setCurrentUserCount] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);

    const [message, setMessage] = useState<string | null>(null);

    // Subscribe to real-time crash limits updates from Firestore
    useEffect(() => {
        const unsubscribeLimits = subscribeToCrashLimits((limits: any) => {
            if (limits) {
                setMinCrashZero(limits.minCrashZero);
                setMaxCrashZero(limits.maxCrashZero);

                setMinCrashOneTwo(limits.minCrashOneTwo);
                setMaxCrashOneTwo(limits.maxCrashOneTwo);

                setMinCrashThreePlus(limits.minCrashThreePlus);
                setMaxCrashThreePlus(limits.maxCrashThreePlus);
            }
        });

        const unsubscribeRound = fetchCurrentAviatorUsers(
            (data: { userCount: any; totalBetAmount: any; }) => {
                setCurrentUserCount(data.userCount || 0);
                setTotalAmount(data.totalBetAmount || 0);
            },
            (error: any) => {
                console.error('Error fetching round data:', error);
            }
        );

        return () => {
            unsubscribeLimits();
            unsubscribeRound();
        };
    }, []);

    const updateLimits = async () => {
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

    const crashPlane = async () => {
        try {
            await crashAviatorPlane();
            setMessage('Plane crashed successfully');
        } catch (error) {
            console.error("Error crashing plane: ", error);
            setMessage('Failed to crash plane');
        }
    };
    // Reset message after 5 seconds
    useEffect(() => {
        if (message) {
            const timeout = setTimeout(() => {
                setMessage(null);
            }, 5000);
            return () => clearTimeout(timeout);
        }
    }, [message]);

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
            <div>Users : {currentUserCount}</div>
            <div>Total Amount:{totalAmount}</div>
            {/* Form for "If 0 Users" */}
            <hr />
            <div className="mb-5">
                <h5>If 0 Users</h5>
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
                <h5>If 1,2 Users</h5>
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
                <h5>If 3+ Users</h5>
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
            <div className='btn-admin-aviator'>
                <button className="btn btn-success" onClick={updateLimits}>Update</button>
                <button className="btn btn-danger" onClick={crashPlane}>Crash</button>
            </div>
        </div>
    );
}
