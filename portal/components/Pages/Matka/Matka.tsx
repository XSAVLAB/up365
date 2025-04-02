'use client'
import { useState } from 'react'
import './styles.css'
const Pool = ({ selectedPool }: { selectedPool: string }) => {
    const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
    const [message, setMessage] = useState<string>('');

    const handleNumberSelect = (num: number) => {
        setSelectedNumber(num);
    };

    const handleSubmit = () => {
        if (!selectedPool) {
            setMessage('Please select a pool amount first.');
            return;
        }
        if (selectedNumber === null) {
            setMessage('Please select a number between 0-9.');
            return;
        }

        setMessage(`Bet placed on number ${selectedNumber} with ₹${selectedPool} pool!`);

    };

    return (
        <div className="pool-container">
            <h2 className="form-header">Select a number (0-9)</h2>
            <h2 className="form-header">Pool : {selectedPool}</h2>
            <div className="number-selection">
                {[...Array(10)].map((_, num) => (
                    <button
                        key={num}
                        className={`number-button ${selectedNumber === num ? 'selected' : ''}`}
                        onClick={() => handleNumberSelect(num)}
                    >
                        {num}
                    </button>
                ))}
            </div>
            <button className="submit-bet" onClick={handleSubmit}>Place Bet</button>
            {message && <p className="message">{message}</p>}
        </div>
    );
};

const Matka = () => {
    const [selectedPool, setSelectedPool] = useState<string>('');

    function handlePool(pool: string) {
        setSelectedPool(pool);
    }

    return (
        <div className="form-container">
            <h1 className="form-game-name">Matka</h1>
            {!selectedPool ? (
            <div>
                <h2 className="form-header">Select your pool</h2>
                <div className="matka-pools">
                <div className="pool">
                    {[100, 250, 500, 1000].map((amount) => (
                    <button key={amount} className="entry-fee" onClick={() => handlePool(amount.toString())}>
                        ₹ {amount}
                    </button>
                    ))}
                </div>
                </div>
            </div>
            ) : (
            <Pool selectedPool={selectedPool} />
            )}
        </div>
    );
};

export default Matka;
