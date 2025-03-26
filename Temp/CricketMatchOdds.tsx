'use client';
import React, { useState } from 'react';
import "./styles.css";
import FooterCard from '@/components/Shared/FooterCard';

const matchOddsData = {
    id: "1",
    matchName: "Punjab Kings vs Gujarat Titans",
    seriesName: "IPL 2025",
    dateTime: "2025-03-24T20:00:00Z",
    team1: "Punjab Kings",
    team2: "Gujarat Titans",
    team1Img: "/images/punjab.png",
    team2Img: "/images/gujarat.png",
    matchType: "T20",
    odds: {
        team1: {
            back: ["1.5", "1.6", "1.7"],
            lay: ["1.8", "1.9", "2.0"]
        },
        team2: {
            back: ["2.5", "2.6", "2.7"],
            lay: ["2.8", "2.9", "3.0"]
        }
    }
};

const CricketMatchOdds = () => {
    const [isCardExpanded, setIsCardExpanded] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState('');
    const [selectedOdds, setSelectedOdds] = useState('');
    const [betType, setBetType] = useState('');
    const [blockNumber, setBlockNumber] = useState(0);
    const [tableType, setTableType] = useState('');

    const handleOddsClick = (team: string, odds: string, type: string) => {
        setSelectedTeam(team);
        setSelectedOdds(odds);
        setBetType(type);
        setIsCardExpanded(true);
    };

    return (
        <>
            <div className="match-odds-container">
                <div className="match-header">
                    <span>{matchOddsData.matchName}</span>
                </div>

                <table className="custom-odds-table">
                    <thead>
                        <tr>
                            <th>Team</th>
                            <th colSpan={3} className="back-header">Back</th>
                            <th colSpan={3} className="lay-header">Lay</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="team-name">{matchOddsData.team1}</td>
                            {matchOddsData.odds.team1.back.map((odd, index) => (
                                <td
                                    key={`team1-back-${index}`}
                                    className="back-odds"
                                    onClick={() => handleOddsClick(matchOddsData.team1, odd, 'back')}
                                >
                                    {odd}
                                </td>
                            ))}
                            {matchOddsData.odds.team1.lay.map((odd, index) => (
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
                            {matchOddsData.odds.team2.back.map((odd, index) => (
                                <td
                                    key={`team2-back-${index}`}
                                    className="back-odds"
                                    onClick={() => handleOddsClick(matchOddsData.team2, odd, 'back')}
                                >
                                    {odd}
                                </td>
                            ))}
                            {matchOddsData.odds.team2.lay.map((odd, index) => (
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
