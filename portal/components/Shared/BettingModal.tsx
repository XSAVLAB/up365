import React, { useState } from 'react';
import FooterCard from './FooterCard';

interface Match {
    id: string;
    seriesName: string;
    dateTime: string;
    team1: string;
    team2: string;
    team1Img: string;
    team2Img: string;
    matchType: string;
    bookmakers: {
        title: string;
        outcomes: {
            name: string;
            price: string;
        }[];
    }[];
}

interface BettingModalProps {
    match: Match;
    isModalOpen: boolean;
    setIsModalOpen: (open: boolean) => void;
}

const BettingModal: React.FC<BettingModalProps> = ({ match, isModalOpen, setIsModalOpen }) => {
    const [isCardExpanded, setIsCardExpanded] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState('');
    const [selectedOdds, setSelectedOdds] = useState('');
    const [betType, setBetType] = useState('');
    const [blockNumber, setBlockNumber] = useState(0);
    const [tableType, setTableType] = useState('');

    // Extract prices for each team from the respective bookmakers
    const getBackPrices = (teamName: string) => {
        return match.bookmakers.map(bookmaker => {
            const outcome = bookmaker.outcomes.find(outcome => outcome.name === teamName);
            return outcome ? outcome.price : null;
        }).filter(price => price !== null);
    };

    const team1BackPrices = getBackPrices(match.team1);
    const team2BackPrices = getBackPrices(match.team2);

    // Function to calculate Lay odds from Back odds with different margins
    const calculateLayOdds = (backOdds: string, margin: number) => {
        const odds = parseFloat(backOdds);
        if (isNaN(odds) || odds <= 1) return 'N/A'; // Handle edge cases like invalid odds
        const layOdds = (odds - margin).toFixed(2); // Subtract the margin and round to 2 decimal places
        return layOdds;
    };

    const handleOddsClick = (team: string, odds: string, type: string, block: number, table: string) => {
        setSelectedTeam(team);
        setSelectedOdds(odds);
        setBetType(type);
        setBlockNumber(block);
        setTableType(table);
        setIsCardExpanded(true);
    };

    if (!isModalOpen) return null;

    return (
        <>
            <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <button className="close-button" onClick={() => setIsModalOpen(false)}>Close</button>
                    <h2>{match.team1} vs {match.team2}</h2>
                    <div className="match-details">
                        <span>{new Date(match.dateTime).toLocaleString()}</span>
                    </div>

                    {/* First Table with 3 Back and 3 Lay columns */}
                    <div className="betting-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Team</th>
                                    <th colSpan={3}>Back</th>
                                    <th colSpan={3}>Lay</th>
                                </tr>
                            </thead>
                            <tbody>
                                {team1BackPrices.length >= 3 ? (
                                    <tr>
                                        <td>{match.team1}</td>
                                        {team1BackPrices.slice(0, 3).map((price, index) => (
                                            <td key={index} className="back" onClick={() => handleOddsClick('team1', price, 'back', index + 1, 'detailed')}>{price}</td>
                                        ))}
                                        {team1BackPrices.slice(0, 3).map((price, index) => (
                                            <td key={index} className="lay">{calculateLayOdds(price, 0.01)}</td>
                                        ))}
                                    </tr>
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="suspended">Suspended</td>
                                    </tr>
                                )}

                                {team2BackPrices.length >= 3 ? (
                                    <tr>
                                        <td>{match.team2}</td>
                                        {team2BackPrices.slice(0, 3).map((price, index) => (
                                            <td key={index} className="back" onClick={() => handleOddsClick('team2', price, 'back', index + 1, 'detailed')}>{price}</td>
                                        ))}
                                        {team2BackPrices.slice(0, 3).map((price, index) => (
                                            <td key={index} className="lay">{calculateLayOdds(price, 0.02)}</td>
                                        ))}
                                    </tr>
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="suspended">Suspended</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Second Table with 1 Back and 1 Lay column */}
                    <div className="betting-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Team</th>
                                    <th colSpan={1}>Back</th>
                                    <th colSpan={1}>Lay</th>
                                </tr>
                            </thead>
                            <tbody>
                                {team1BackPrices[3] ? (
                                    <tr>
                                        <td>{match.team1}</td>
                                        <td className="back" onClick={() => handleOddsClick('team1', team1BackPrices[3], 'back', 1, 'simple')}>{team1BackPrices[3]}</td>
                                        <td className="lay">{calculateLayOdds(team1BackPrices[3], 0.01)}</td>
                                    </tr>
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="suspended">Suspended</td>
                                    </tr>
                                )}

                                {team2BackPrices[3] ? (
                                    <tr>
                                        <td>{match.team2}</td>
                                        <td className="back" onClick={() => handleOddsClick('team2', team2BackPrices[3], 'back', 1, 'simple')}>{team2BackPrices[3]}</td>
                                        <td className="lay">{calculateLayOdds(team2BackPrices[3], 0.02)}</td>
                                    </tr>
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="suspended">Suspended</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
            <FooterCard
                match={match}
                isCardExpanded={isCardExpanded}
                setIsCardExpanded={setIsCardExpanded}
                selectedTeam={selectedTeam}
                selectedOdds={selectedOdds}
                betType={betType}
                blockNumber={blockNumber}
                tableType={tableType}
            />
        </>
    );
};

export default BettingModal;
