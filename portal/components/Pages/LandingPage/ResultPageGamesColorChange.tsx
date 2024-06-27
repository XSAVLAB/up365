"use client";
import React, { useState, useEffect } from 'react';

interface ResultData {
    ID: number;
    GameID: number;
    Date: string;
    Time: string;
    GameName: string;
    TotalPlayers: number;
    TotalGameAmount: number;
    Winner: string | number;
    NextGameStartingTime: number;
}

const ResultGamesColorComponent = () => {
    const [game, setGame] = useState(0); // Set the default game to 0 (All Games)
    const [timer, setTimer] = useState(600); // Countdown timer in seconds
    const [resultsStoreData, setResultsStoreData] = useState<ResultData[]>([]);
    const [hydrated, setHydrated] = useState(false); // State to track hydration

    const getButtonBackgroundColor = () => {
        switch (game) {
            case 1:
                return 'custom-bg-blue-300';
            case 2:
                return 'custom-bg-green-300';
            case 3:
                return 'custom-bg-purple-300';
            case 4:
                return 'custom-bg-yellow-300';
            default:
                return 'custom-bg-white custom-text-black';
        }
    };

    useEffect(() => {
        setHydrated(true); // Set hydrated to true after initial render
        const countdown = setInterval(() => {
            if (timer > 0) {
                setTimer(timer - 1);
            }
        }, 1000);

        return () => clearInterval(countdown);
    }, [timer]);

    useEffect(() => {
        const generateFakeData = (): ResultData[] => {
            const resultsStoreData: ResultData[] = [];
            const currentTimestamp = Math.floor(Date.now() / 1000);
            const n = 50;
            const gameNames = [
                'Single Digit Lottery',
                'Double Digit Lottery',
                'Triple Digit Lottery',
                'ColourBall Game',
            ];

            for (let i = 0; i < n; i++) {
                const gameID = currentTimestamp - i * 600;
                const gameDate = new Date(gameID * 1000);
                const gameTime = gameDate.toLocaleTimeString('en-US');
                const gameName = gameNames[i % gameNames.length];
                const totalPlayers = Math.floor(Math.random() * 1000) * 10;
                const totalGameAmount = Math.floor(Math.random() * 1000) * 50;

                let winner: string | number;
                if (gameName === 'Single Digit Lottery') {
                    winner = Math.floor(Math.random() * 10);
                } else if (gameName === 'Double Digit Lottery') {
                    winner = ('0' + Math.floor(Math.random() * 100)).slice(-2);
                } else if (gameName === 'Triple Digit Lottery') {
                    winner = ('00' + Math.floor(Math.random() * 1000)).slice(-3);
                } else if (gameName === 'ColourBall Game') {
                    const colors = ['Red', 'Blue', 'Green', 'Purple', 'Yellow'];
                    const color = colors[Math.floor(Math.random() * colors.length)];
                    const number = Math.floor(Math.random() * 37);
                    winner = `${color}, ${number}`;
                }
                else {
                    winner = "N/A";
                }

                resultsStoreData.push({
                    ID: n - i,
                    GameID: gameID,
                    Date: gameDate.toLocaleDateString('en-US'),
                    Time: gameTime,
                    GameName: gameName,
                    TotalPlayers: totalPlayers,
                    TotalGameAmount: totalGameAmount,
                    Winner: winner,
                    NextGameStartingTime: timer + i * 10,
                });
            }
            return resultsStoreData;
        };

        setResultsStoreData(generateFakeData());
    }, [timer]);

    const filterData = () => {
        const gameNames = [
            'Single Digit Lottery',
            'Double Digit Lottery',
            'Triple Digit Lottery',
            'ColourBall Game',
        ];

        if (game === 0) {
            return resultsStoreData; 
        } else {
            const filteredData = resultsStoreData.filter((row) => row.GameName === gameNames[game - 1]);
            return filteredData;
        }
    };

    const filteredData = filterData();

    if (!hydrated) {
        return <div>Loading...</div>;
    }

    return (
        <div className="custom-py-10 custom-my-10 custom-rounded-lg custom-shadow-lg custom-w-full custom-m-auto custom-h-auto custom-border-4 flex flex-col">
            <div className="text-4xl lg:text-6xl custom-bold custom-text-white custom-border-b-4 font-bold custom-m-auto custom-mb-10">
                All Games Results
            </div>
            <div className='flex flex-col md:flex-row lg:flex-row custom-w-auto custom-h-auto justify-around'>
                <div className="custom-ml-10 custom-mt-8 custom-w-auto md:mt-0 md:ml-0 lg:mt-0 lg:ml-0">
                    <button
                        className="custom-bg-black hover:bg-green-900 custom-border-2 custom-text-white custom-font-bold custom-py-2 custom-mr-5 custom-px-4 custom-rounded-lg"
                        onClick={() => setGame(0)}
                    >
                        All Games
                    </button>
                    <select
                        className="custom-bg-black hover:bg-green-900 text-center custom-border-2 custom-mt-8 md:mt-0 lg:mt-0 custom-text-white custom-font-bold custom-py-2 custom-mr-5 custom-rounded-xl"
                        value={game}
                        onChange={(e) => setGame(parseInt(e.target.value))}
                    >
                        <option className='font-semibold'>Select Game Name</option>
                        {['Single Digit Lottery', 'Double Digit Lottery', 'Triple Digit Lottery', 'ColourBall Game'].map((name, index) => (
                            <option key={index} value={index + 1} className='font-semibold'>
                                {name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="custom-mt-4 custom-p-8 custom-w-auto custom-h-auto custom-mb-2 md:mb-2 lg:mb-0 overflow-auto">
                <table className="custom-m-auto custom-w-auto custom-h-auto custom-table-auto custom-border-collapse custom-border-4 custom-border-white">
                    <thead className='custom-border-4 custom-border-black'>
                        <tr className="custom-bg-black custom-text-white">
                            <th className="custom-border-4 custom-p-2">ID</th>
                            <th className="custom-border-4 custom-p-2">GID (game id)</th>
                            <th className="custom-border-4 custom-p-2">Date</th>
                            <th className="custom-border-4 custom-p-2">Time</th>
                            <th className="custom-border-4 custom-p-2">Game Name</th>
                            <th className="custom-border-4 custom-p-2">Total Players</th>
                            <th className="custom-border-4 custom-p-2">Total Game Amount</th>
                            <th className="custom-border-4 custom-p-2">Winner</th>
                            <th className="custom-border-4 custom-p-2">Next Game Starting Time (sec)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((row, index) => (
                            <tr
                                key={index}
                                className={`${index % 2 === 0 ? 'custom-bg-white custom-text-black' : 'custom-bg-black custom-text-white'} hover:custom-bg-green-300`}
                            >
                                <td className="custom-border-4 custom-p-2">{row.ID}</td>
                                <td className="custom-border-4 custom-p-2">{row.GameID}</td>
                                <td className="custom-border-4 custom-p-2">{row.Date}</td>
                                <td className="custom-border-4 custom-p-2">{row.Time}</td>
                                <td className="custom-border-4 custom-p-2">{row.GameName}</td>
                                <td className="custom-border-4 custom-p-2">{row.TotalPlayers}</td>
                                <td className="custom-border-4 custom-p-2">{row.TotalGameAmount}</td>
                                <td className="custom-border-4 custom-p-2">{row.Winner}</td>
                                <td className="custom-border-4 custom-p-2">{row.NextGameStartingTime}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ResultGamesColorComponent;
