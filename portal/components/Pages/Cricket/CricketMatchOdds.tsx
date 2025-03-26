'use client';
import React, { useState, useEffect } from 'react';
import "./styles.css";
import FooterCard from '@/components/Shared/FooterCard';

const CricketMatchOdds = ({ selectedMatchId }: { selectedMatchId: string }) => {
    const [isCardExpanded, setIsCardExpanded] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState('');
    const [selectedOdds, setSelectedOdds] = useState('');
    const [betType, setBetType] = useState('');
    const [blockNumber, setBlockNumber] = useState(0);
    const [tableType, setTableType] = useState('');
    const [matchOddsData, setMatchOddsData] = useState<any>(null);

    useEffect(() => {
        // Using dummy data for now
        const dummyOddsData = {
            id: selectedMatchId,
            matchName: "Mumbai Indians vs Chennai Super Kings",
            seriesName: "IPL 2025",
            dateTime: "2025-03-25T20:00:00Z",
            team1: "Mumbai Indians",
            team2: "Chennai Super Kings",
            team1Img: "/images/mumbai.png",
            team2Img: "/images/chennai.png",
            matchType: "T20",
            odds: {
                team1: {
                    back: ["1.7", "1.8", "1.9"],
                    lay: ["2.0", "2.1", "2.2"]
                },
                team2: {
                    back: ["2.5", "2.6", "2.7"],
                    lay: ["2.8", "2.9", "3.0"]
                }
            }
        };

        setMatchOddsData(dummyOddsData);
    }, [selectedMatchId]);

    const handleOddsClick = (team: string, odds: string, type: string) => {
        setSelectedTeam(team);
        setSelectedOdds(odds);
        setBetType(type);
        setIsCardExpanded(true);
    };

    if (!matchOddsData) return <p>Loading odds...</p>;

    return (
        <>
            <div className="match-odds-container">
                <div className="match-header">
                    <span>{matchOddsData.matchName}</span>
                    <h5>{selectedMatchId}</h5>
                </div>
                <table className="custom-odds-table">
                    <thead>
                        <tr>
                            <th>Team</th>
                            <th></th>
                            <th></th>
                            <th className="back-header">Back</th>
                            <th className="lay-header">Lay</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="team-name">{matchOddsData.team1}</td>
                            {matchOddsData.odds.team1.back.map((odd: string, index: number) => (
                                <td
                                    key={`team1-back-${index}`}
                                    className="back-odds"
                                    onClick={() => handleOddsClick(matchOddsData.team1, odd, 'back')}
                                >
                                    {odd}
                                </td>
                            ))}
                            {matchOddsData.odds.team1.lay.map((odd: string, index: number) => (
                                <td
                                    key={`team1-lay-${index}`}
                                    className="lay-odds"
                                    onClick={() => handleOddsClick(matchOddsData.team1, odd, 'lay')}
                                >
                                    {odd}
                                </td>
                            ))}
                        </tr>

                        <tr>
                            <td className="team-name">{matchOddsData.team2}</td>
                            {matchOddsData.odds.team2.back.map((odd: string, index: number) => (
                                <td
                                    key={`team2-back-${index}`}
                                    className="back-odds"
                                    onClick={() => handleOddsClick(matchOddsData.team2, odd, 'back')}
                                >
                                    {odd}
                                </td>
                            ))}
                            {matchOddsData.odds.team2.lay.map((odd: string, index: number) => (
                                <td
                                    key={`team2-lay-${index}`}
                                    className="lay-odds"
                                    onClick={() => handleOddsClick(matchOddsData.team2, odd, 'lay')}
                                >
                                    {odd}
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>

            <FooterCard
                match={matchOddsData}
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

export default CricketMatchOdds;
