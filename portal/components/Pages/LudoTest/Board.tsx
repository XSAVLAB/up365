import React from "react";

const Board: React.FC = () => {
    const cells = Array.from({ length: 225 });

    return (
        <div className="ludoBoard">
            {cells.map((_, index) => (
                <div key={index} className={`cell cell-${index}`}>
                    {index === 32 || index === 33 || index === 47 || index === 48 ? (
                        <img src="/images/ludo-red.png" alt="Red Pile" className="player-pile" />
                    ) : null}
                    {index === 41 || index === 42 || index === 56 || index === 57 ? (
                        <img src="/images/ludo-green.png" alt="Green Pile" className="player-pile" />
                    ) : null}
                    {index === 167 || index === 168 || index === 182 || index === 183 ? (
                        <img src="/images/ludo-yellow.png" alt="Yellow Pile" className="player-pile" />
                    ) : null}
                    {index === 176 || index === 177 || index === 191 || index === 192 ? (
                        <img src="/images/ludo-blue.png" alt="Blue Pile" className="player-pile" />
                    ) : null}
                </div>
            ))}
        </div>
    );
};

export default Board;
