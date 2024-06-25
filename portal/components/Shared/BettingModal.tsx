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
                                <tr>
                                    <td>{match.team1}</td>
                                    <td className="back" onClick={() => handleOddsClick('team1', '1.56', 'back', 1, 'detailed')}>1.56</td>
                                    <td className="back" onClick={() => handleOddsClick('team1', '1.57', 'back', 2, 'detailed')}>1.57</td>
                                    <td className="back" onClick={() => handleOddsClick('team1', '1.58', 'back', 3, 'detailed')}>1.58</td>
                                    <td className="lay" onClick={() => handleOddsClick('team1', '1.59', 'lay', 1, 'detailed')}>1.59</td>
                                    <td className="lay" onClick={() => handleOddsClick('team1', '1.60', 'lay', 2, 'detailed')}>1.60</td>
                                    <td className="lay" onClick={() => handleOddsClick('team1', '1.61', 'lay', 3, 'detailed')}>1.61</td>
                                </tr>
                                <tr>
                                    <td>{match.team2}</td>
                                    <td className="back" onClick={() => handleOddsClick('team2', '2.64', 'back', 1, 'detailed')}>2.64</td>
                                    <td className="back" onClick={() => handleOddsClick('team2', '2.66', 'back', 2, 'detailed')}>2.66</td>
                                    <td className="back" onClick={() => handleOddsClick('team2', '2.68', 'back', 3, 'detailed')}>2.68</td>
                                    <td className="lay" onClick={() => handleOddsClick('team2', '2.72', 'lay', 1, 'detailed')}>2.72</td>
                                    <td className="lay" onClick={() => handleOddsClick('team2', '2.74', 'lay', 2, 'detailed')}>2.74</td>
                                    <td className="lay" onClick={() => handleOddsClick('team2', '2.76', 'lay', 3, 'detailed')}>2.76</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
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
                                <tr>
                                    <td>{match.team1}</td>
                                    <td className="back" onClick={() => handleOddsClick('team1', '1.58', 'back', 1, 'simple')}>1.58</td>
                                    <td className="lay" onClick={() => handleOddsClick('team1', '1.59', 'lay', 1, 'simple')}>1.59</td>
                                </tr>
                                <tr>
                                    <td>{match.team2}</td>
                                    <td className="back" onClick={() => handleOddsClick('team2', '2.68', 'back', 1, 'simple')}>2.68</td>
                                    <td className="lay" onClick={() => handleOddsClick('team2', '2.72', 'lay', 1, 'simple')}>2.72</td>
                                </tr>
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
}

export default BettingModal;
