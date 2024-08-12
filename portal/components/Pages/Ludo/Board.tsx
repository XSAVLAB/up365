import React from 'react';
import Dice from './Dice';
import Player from './Player';

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



                    <div className="home red-home">
                        <Player color="red" position="top-red" />
                        <Player color="red" position="top-green" />
                        <Player color="red" position="bottom-blue" />
                        <Player color="red" position="bottom-yellow" />
                    </div>

                    <div className="home green-home">
                        <Player color="green" position="top-red" />
                        <Player color="green" position="top-green" />
                        <Player color="green" position="bottom-blue" />
                        <Player color="green" position="bottom-yellow" />
                    </div>

                    <div className="home yellow-home">
                        <Player color="yellow" position="top-red" />
                        <Player color="yellow" position="top-green" />
                        <Player color="yellow" position="bottom-blue" />
                        <Player color="yellow" position="bottom-yellow" />
                    </div>

                    <div className="home blue-home">
                        <Player color="blue" position="top-red" />
                        <Player color="blue" position="top-green" />
                        <Player color="blue" position="bottom-blue" />
                        <Player color="blue" position="bottom-yellow" />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Board;
