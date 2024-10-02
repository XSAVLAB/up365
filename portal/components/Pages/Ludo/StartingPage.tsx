'use client'
import React, { useState } from 'react';
import CustomizePlayers from '../LudoTesting/CustomizePlayers';
import { store } from '@/redux/store';
import { Provider } from 'react-redux';

function StartingPage() {
    const [loading, setLoading] = useState(false);

    const rooms = [
        { prizePool: 320, entryFee: 100 },
        { prizePool: 640, entryFee: 200 },
        { prizePool: 1600, entryFee: 500 },
        { prizePool: 3200, entryFee: 1000 },
    ];

    const handleRoomSelection = () => {
        setLoading(true);
        // Simulating delay before displaying the waiting room
        setTimeout(() => {
            // You can implement the logic to wait for other players here
        }, 1000);
    };

    return (
        <div className="form-container">
            {loading ? (
                <Provider store={store}>
                    <CustomizePlayers />
                </Provider>
            ) : (
                <>
                    <h1 className="form-game-name">Ludo</h1>
                    <h2 className="form-header">Select your room</h2>
                    <div className="rooms">
                        {rooms.map((room, index) => (
                            <div className="room" key={index} onClick={handleRoomSelection}>
                                <span className="prize-pool">Prize Pool: {room.prizePool}</span>
                                <span className="entry-fee">₹ {room.entryFee}</span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default StartingPage;
