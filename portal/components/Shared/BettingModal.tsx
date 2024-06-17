import React, { useState } from 'react';
import FooterCard from './FooterCard';

interface BettingModalProps {
    match: any;
    isModalOpen: boolean;
    setIsModalOpen: (open: boolean) => void;
}

const BettingModal: React.FC<BettingModalProps> = ({ match, isModalOpen, setIsModalOpen }) => {
    const [isCardExpanded, setIsCardExpanded] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState('');
    const [selectedOdds, setSelectedOdds] = useState('');
    const [betType, setBetType] = useState('');

    const handleOddsClick = (team: string, odds: string, type: string) => {
        setSelectedTeam(team);
        setSelectedOdds(odds);
        setBetType(type);
        setIsCardExpanded(true);
    };

    if (!isModalOpen) return null;

    return (
        <>
            <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <button className="close-button" onClick={() => setIsModalOpen(false)}>Close</button>
                    <h2>{match.t1} vs {match.t2}</h2>
                    <div className="match-details">
                        <span>{new Date(match.dateTimeGMT).toLocaleString()}</span>
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
                                    <td>{match.t1}</td>
                                    <td className="back" onClick={() => handleOddsClick('t1', '1.56', 'back')}>1.56</td>
                                    <td className="back" onClick={() => handleOddsClick('t1', '1.57', 'back')}>1.57</td>
                                    <td className="back" onClick={() => handleOddsClick('t1', '1.58', 'back')}>1.58</td>
                                    <td className="lay" onClick={() => handleOddsClick('t1', '1.59', 'lay')}>1.59</td>
                                    <td className="lay" onClick={() => handleOddsClick('t1', '1.60', 'lay')}>1.60</td>
                                    <td className="lay" onClick={() => handleOddsClick('t1', '1.61', 'lay')}>1.61</td>
                                </tr>
                                <tr>
                                    <td>{match.t2}</td>
                                    <td className="back" onClick={() => handleOddsClick('t2', '2.64', 'back')}>2.64</td>
                                    <td className="back" onClick={() => handleOddsClick('t2', '2.66', 'back')}>2.66</td>
                                    <td className="back" onClick={() => handleOddsClick('t2', '2.68', 'back')}>2.68</td>
                                    <td className="lay" onClick={() => handleOddsClick('t2', '2.72', 'lay')}>2.72</td>
                                    <td className="lay" onClick={() => handleOddsClick('t2', '2.74', 'lay')}>2.74</td>
                                    <td className="lay" onClick={() => handleOddsClick('t2', '2.76', 'lay')}>2.76</td>
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
                                    <td>{match.t1}</td>
                                    <td className="back" onClick={() => handleOddsClick('t1', '1.58', 'back')}>1.58</td>
                                    <td className="lay" onClick={() => handleOddsClick('t1', '1.59', 'lay')}>1.59</td>
                                </tr>
                                <tr>
                                    <td>{match.t2}</td>
                                    <td className="back" onClick={() => handleOddsClick('t2', '2.68', 'back')}>2.68</td>
                                    <td className="lay" onClick={() => handleOddsClick('t2', '2.72', 'lay')}>2.72</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <style jsx>{`
                    .modal-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0, 0, 0, 0.8);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        z-index: 1000; /* Increased z-index */
                    }
                    .modal-content {
                        background: rgb(8, 15, 37);
                        padding: 20px;
                        border-radius: 5px;
                        width: 90%;
                        max-width: 600px;
                        position: relative;
                        z-index: 1001; /* Ensure it's above the overlay */
                    }
                    .close-button {
                        background: none;
                        border: none;
                        font-size: 16px;
                        cursor: pointer;
                        position: absolute;
                        top: 10px;
                        right: 10px;
                    }
                    .betting-table {
                        margin-top: 20px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    th, td {
                        padding: 8px;
                        text-align: center;
                        cursor: pointer; /* Added cursor pointer */
                    }
                    .back {
                        background-color: #5993bc;
                    }
                    .lay {
                        background-color: #c68694;
                    }
                `}</style>
            </div>
            <FooterCard
                match={match}
                isCardExpanded={isCardExpanded}
                setIsCardExpanded={setIsCardExpanded}
                selectedTeam={selectedTeam}
                selectedOdds={selectedOdds}
                betType={betType}
            />
        </>
    );
}

export default BettingModal;
