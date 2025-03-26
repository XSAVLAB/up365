"use client";
import { useState, useEffect } from "react";
import CricketMatchOdds from "./CricketMatchOdds";
import "./styles.css";

interface TeamOdds {
    name: string;
    logo: string;
    back: string;
    lay: string;
}

interface Match {
    match_id: number;
    title: string;
    date_start: string;
    date_end: string;
    teama: TeamOdds;
    teamb: TeamOdds;
}

export default function TopAussieRules() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);  // Store selected match ID

    useEffect(() => {
        const fetchIplMatches = async () => {
            try {
                const response = await fetch("/api/cricket?type=ipl_matches");
                if (!response.ok) {
                    throw new Error("Failed to fetch Matches");
                }

                const data = await response.json();

                const formattedMatches = await Promise.all(
                    data.response.items.map(async (match: any) => {
                        const oddsResponse = await fetch(`/api/cricket/?type=match_odds&matchId=${match.match_id}`);
                        const oddsData = await oddsResponse.json();

                        const liveOdds = oddsData?.response?.live_odds?.matchodds || {};
                        return {
                            match_id: match.match_id,
                            title: match.title,
                            date_start: new Date(match.date_start).toLocaleString(),
                            date_end: new Date(match.date_end).toLocaleString(),

                            teama: {
                                name: match.teama.name,
                                logo: match.teama.logo_url,
                                back: liveOdds?.teama?.back || "-",
                                lay: liveOdds?.teama?.lay || "-",
                            },
                            teamb: {
                                name: match.teamb.name,
                                logo: match.teamb.logo_url,
                                back: liveOdds?.teamb?.back || "-",
                                lay: liveOdds?.teamb?.lay || "-",
                            }
                        };
                    })
                );

                setMatches(formattedMatches);
                setLoading(false);
            } catch (err: any) {
                console.error(err.message);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchIplMatches();
    }, []);

    if (loading) return <p>Loading IPL matches...</p>;
    if (error) return <p>Error: {error}</p>;

    // Handle match selection
    const handleMatchSelect = (matchId: string) => {
        setSelectedMatchId(matchId);
    };

    return (
        <div className="form-container">
            <div className='form-game-name'>Matches</div>

            {selectedMatchId ? (
                <CricketMatchOdds selectedMatchId={selectedMatchId} />
            ) : (
                <div className="table-container">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>Match</th>
                                <th colSpan={2} className="odds">Team A</th>
                                <th colSpan={2} className="odds">Team B</th>
                            </tr>
                        </thead>
                        <tbody>
                            {matches.map((match) => (
                                <tr
                                    key={match.match_id}
                                    onClick={() => handleMatchSelect(match.match_id.toString())}
                                    className="clickable-row"  // Add some visual feedback
                                >
                                    <td>
                                        <strong>{match.title}</strong>
                                        <br />
                                        {match.date_start}
                                    </td>
                                    <td className="odds blue-bg">{match.teama.back}</td>
                                    <td className="odds pink-bg">{match.teama.lay}</td>
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
