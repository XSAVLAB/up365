"use client";
import React, { useState, useEffect } from "react";
import "./styles.css";
import FooterCard from "@/components/Shared/FooterCard";
import { fetchMatchOdds } from "@/api/firestoreService";

const CricketMatchOdds = ({ selectedMatchId, selectedTeamA, selectedTeamB }: {
    selectedMatchId: string, selectedTeamA: string, selectedTeamB: string
}) => {
    const [isCardExpanded, setIsCardExpanded] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState("");
    const [selectedOdds, setSelectedOdds] = useState("");
    const [betType, setBetType] = useState("");
    const [blockNumber, setBlockNumber] = useState(0);
    const [tableType, setTableType] = useState("");
    const [matchOddsData, setMatchOddsData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getMatchOdds = async () => {
            setLoading(true);
            const oddsData = await fetchMatchOdds(selectedMatchId);
            console.log("Odd data", oddsData);
            if ("error" in oddsData) {
                setError(oddsData.error);
            } else {
                setMatchOddsData(oddsData);
            }

            setLoading(false);
        };

        getMatchOdds();
    }, [selectedMatchId]);

    const handleOddsClick = (team: string, odds: string, type: string) => {
        setSelectedTeam(team);
        setSelectedOdds(odds);
        setBetType(type);
        setIsCardExpanded(true);
    };

    if (loading) return <p>Loading odds...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!matchOddsData) return <p>No match data available.</p>;

    return (
        <>
            <div className="match-odds-container">
                <div className="match-header">
                    <span>Match_Odds</span>
                </div>
                <table className="custom-odds-table">
                    <thead>
                        <tr>
                            <th>Team</th>
                            <th></th>
                            <th></th>
                            <th className="back-odds">Back</th>
                            <th className="lay-odds">Lay</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="team-name">{selectedTeamA}</td>
                            <td className="back-odds">-</td>
                            <td className="back-odds">-</td>
                            <td
                                className="back-odds"
                                onClick={() => handleOddsClick(matchOddsData.team1, matchOddsData.odds.teama.back, "back")}
                            >
                                {matchOddsData.odds.teama.back}
                            </td>
                            <td
                                className="lay-odds"
                                onClick={() => handleOddsClick(matchOddsData.team1, matchOddsData.odds.teama.lay, "lay")}
                            >
                                {matchOddsData.odds.teama.lay}
                            </td>
                            <td className="lay-odds">-</td>
                            <td className="lay-odds">-</td>
                        </tr>

                        <tr>
                            <td className="team-name">{selectedTeamB}</td>
                            <td className="back-odds">-</td>
                            <td className="back-odds">-</td>
                            <td

                                className="back-odds"
                                onClick={() => handleOddsClick(matchOddsData.team2, matchOddsData.odds.teama.back, "back")}
                            >
                                {matchOddsData.odds.teamb.back}
                            </td>


                            <td

                                className="lay-odds"
                                onClick={() => handleOddsClick(matchOddsData.team2, matchOddsData.odds.teama.lay, "lay")}
                            >
                                {matchOddsData.odds.teamb.lay}
                            </td>
                            <td className="lay-odds">-</td>
                            <td className="lay-odds">-</td>
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