"use client";
import React, { useState, useEffect } from "react";
import "./styles.css";
import FooterCard from "@/components/Shared/FooterCard";
import { listenForMatchOdds } from "@/api/firestoreService";

const CricketMatchOdds = ({ selectedMatchId, selectedTeamA, selectedTeamB, status }: {
    selectedMatchId: string, selectedTeamA: string, selectedTeamB: string, status: string
}) => {
    const [isCardExpanded, setIsCardExpanded] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState("");
    const [selectedOdds, setSelectedOdds] = useState("");
    const [oddType, setOddType] = useState("");
    const [matchOddsData, setMatchOddsData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!selectedMatchId) return;

        setLoading(true);

        // Call the service function and set up the listener
        const unsubscribe = listenForMatchOdds(
            selectedMatchId,
            (odds: any) => {
                setMatchOddsData(odds);
                setLoading(false);
            },
            (errorMsg: React.SetStateAction<string | null>) => {
                setError(errorMsg);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [selectedMatchId]);


    const handleOddsClick = (team: string, odds: string, type: string) => {
        setSelectedTeam(team);
        setSelectedOdds(odds);
        setOddType(type);
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
                                onClick={() => handleOddsClick(selectedTeamA, matchOddsData.odds.teama.back, "back")}
                            >
                                {matchOddsData.odds.teama.back}
                            </td>
                            <td
                                className="lay-odds"
                                onClick={() => handleOddsClick(selectedTeamA, matchOddsData.odds.teama.lay, "lay")}
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
                                onClick={() => handleOddsClick(selectedTeamB, matchOddsData.odds.teamb.back, "back")}
                            >
                                {matchOddsData.odds.teamb.back}
                            </td>
                            <td
                                className="lay-odds"
                                onClick={() => handleOddsClick(selectedTeamB, matchOddsData.odds.teamb.lay, "lay")}
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
                selectedTeam={selectedTeam}
                selectedOdds={selectedOdds}
                oddType={oddType}
                matchTeams={`${selectedTeamA} vs ${selectedTeamB}`}
                isCardExpanded={isCardExpanded}
                setIsCardExpanded={setIsCardExpanded}

            />
        </>
    );
};

export default CricketMatchOdds;