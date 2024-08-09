import React from 'react';
import Dice from './Dice';

const Board = () => {
    return (
        <>
            <div className="ludoBoard">
                <div className="boardImage">

                    <img src="/images/ludo-board.jpg" alt="Ludo Board" />
                    <div className="controls top-left">
                        <Dice />
                    </div>
                    <div className="controls top-right">
                        <Dice />
                    </div>
                    <div className="controls bottom-left">
                        <Dice />
                    </div>
                    <div className="controls bottom-right">
                        <Dice />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Board;
