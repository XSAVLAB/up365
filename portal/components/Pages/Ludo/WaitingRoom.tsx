'use client'
import React from 'react';

function WaitingRoom() {
    return (
        <div className="waiting-room-container">
            <div className="spinner"></div>
            <h2 className="waiting-text">Waiting for other players...</h2>
        </div>
    );
}

export default WaitingRoom;
