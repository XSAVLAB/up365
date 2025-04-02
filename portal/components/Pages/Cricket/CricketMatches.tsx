"use client";
import { useState, useEffect } from "react";
import CricketMatchOdds from "./CricketMatchOdds";
import "./styles.css";
import { fetchIplMatches } from "@/api/firestoreService";

interface Match {
    match_id: string;
    title: string;
    date_start: string;
    status: string;
    teama: {
        name: string;
        back: string;
        lay: string;
    };
    teamb: {
        name: string;
        back: string;
        lay: string;
    };
}

export default function CricketMatches() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
    const [selectedTeamA, setSelectedTeamA] = useState<string | null>(null);
    const [selectedTeamB, setSelectedTeamB] = useState<string | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    useEffect(() => {
        const loadMatches = async () => {
            try {
                const data = await fetchIplMatches();
                setMatches(data);
                setLoading(false);
            } catch (error) {
                setError("Failed to load matches.");
                setLoading(false);
            }
        };

        loadMatches();
    }, []);

    if (loading) return <p>Loading IPL matches...</p>;
    if (error) return <p>Error: {error}</p>;

    const handleMatchSelect = (matchId: string, teama: string, teamb: string, status: string) => {
        setSelectedMatchId(matchId);
        setSelectedTeamA(teama);
        setSelectedTeamB(teamb);
        setStatus(status);
    };

    return (
        <div className="form-container">
            <div className='form-game-name'>Matches</div>

            {selectedMatchId ? (
                <CricketMatchOdds selectedMatchId={selectedMatchId || ""} selectedTeamA={selectedTeamA || ""} selectedTeamB={selectedTeamB || ""} status={status || ""} />
            ) : (
                <div className="table-container">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>Match</th>
                                <th colSpan={2} className="odds">1</th>
                                <th colSpan={2} className="odds">-</th>
                                <th colSpan={2} className="odds">2</th>
                            </tr>
                        </thead>
                        <tbody>
                            {matches.map((match) => (
                                <tr
                                    key={match.match_id}
                                    onClick={() => handleMatchSelect(match.match_id, match.teama.name, match.teamb.name, match.status)}
                                >
                                    <td className="match-title">
                                        <strong>{match.title}</strong>
                                        <br />
                                        {match.date_start}
                                    </td>
                                    <td className="odds blue-bg">{match.teama.back}</td>
                                    <td className="odds pink-bg">{match.teama.lay}</td>
                                    <td className="odds blue-bg">-</td>
                                    <td className="odds pink-bg">-</td>
                                    <td className="odds blue-bg">{match.teamb.back}</td>
                                    <td className="odds pink-bg">{match.teamb.lay}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
