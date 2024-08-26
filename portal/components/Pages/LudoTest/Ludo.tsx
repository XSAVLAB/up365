'use client';
import React from 'react';
import Board from './Board';

const Ludo = () => {
    return (
        <div className="ludoContainer">
            <div className="ludoBoardContainer">
                <Board />
            </div>
        </div>
    );
};

export default Ludo;
